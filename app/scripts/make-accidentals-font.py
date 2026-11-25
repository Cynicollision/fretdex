"""Makes Fretdex's accidentals font: ♭ ♮ ♯ 𝄪 𝄫 from Noto Music, resized and moved to sit beside
Atkinson Hyperlegible Next's capitals, with that font's line metrics so mixing them never changes line height.

    python app/scripts/make-accidentals-font.py <NotoMusic-Regular.ttf> app/src/lib/styles/fonts/fretdex-accidentals.woff2

The source is Noto Music 2.003 (SIL Open Font License), from Google Fonts or https://github.com/notofonts/music;
Fontsource's `@fontsource/noto-music` "music" subset woff2 works too. Needs fontTools and brotli
(pip install fonttools brotli). Run it only to change the font; its output is committed.
"""

import sys

from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

# Atkinson Hyperlegible Next, 1000 units per em: cap height 668, x-height 496, line ascent 984 and descent -316.
ASCENT, DESCENT = 984, -316

# Code point: (scale, x shift, y shift, advance change), in font units. Noto Music draws accidentals for a staff,
# centred low; these move them up to the capitals and tighten the space before them.
GLYPHS = {
    0x266D: (1.0, -20, 40, -40),  # ♭ flat: its stem reaches just above cap height
    0x266E: (1.0, -20, 210, -40),  # ♮ natural
    0x266F: (1.0, -20, 200, -40),  # ♯ sharp: centred on the capitals, a little taller than them
    0x1D12A: (1.15, -20, 135, -30),  # 𝄪 double sharp: a small x around the middle of the capitals
    0x1D12B: (1.0, -20, 40, -40),  # 𝄫 double flat
}

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)

options = Options()
options.hinting = False  # moved outlines would break the hints
options.layout_features = []
options.name_IDs = [0, 13, 14]
options.flavor = 'woff2'
subsetter = Subsetter(options)
subsetter.populate(unicodes=list(GLYPHS))
subsetter.subset(font)

cmap = font.getBestCmap()
glyph_set = font.getGlyphSet()
glyf, hmtx = font['glyf'], font['hmtx']
for code_point, (scale, dx, dy, dadvance) in GLYPHS.items():
    name = cmap[code_point]
    recording = DecomposingRecordingPen(glyph_set)
    glyph_set[name].draw(recording)
    pen = TTGlyphPen(None)
    recording.replay(TransformPen(pen, (scale, 0, 0, scale, dx, dy)))
    glyph = pen.glyph()
    glyph.recalcBounds(glyf)
    glyf[name] = glyph
    advance, _ = hmtx[name]
    hmtx[name] = (round(advance * scale) + dadvance, glyph.xMin)

font['hhea'].ascent, font['hhea'].descent, font['hhea'].lineGap = ASCENT, DESCENT, 0
os2 = font['OS/2']
os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = ASCENT, DESCENT, 0
os2.usWinAscent, os2.usWinDescent = ASCENT, -DESCENT

# A modified version gets its own name, as the SIL Open Font License asks; the copyright and licence stay.
names = font['name']
for name_id, value in {
    1: 'Fretdex Accidentals',
    2: 'Regular',
    3: 'FretdexAccidentals-Regular',
    4: 'Fretdex Accidentals Regular',
    5: 'Version 1.000; from Noto Music 2.003',
    6: 'FretdexAccidentals-Regular',
    13: 'This Font Software is licensed under the SIL Open Font License, Version 1.1. '
    'This license is available with a FAQ at: https://openfontlicense.org',
    14: 'https://openfontlicense.org',
}.items():
    names.setName(value, name_id, 3, 1, 0x409)
font.save(out)
