# App Shell (`APP`)

Behavior that applies across the whole app: how the user moves around, the context bar, URLs as state, installing and working offline, themes, and the qualities that make it usable on a phone on a music stand. Cross-cutting quality requirements live here too.

## APP-1 The user can reach any module quickly

| ID | Requirement | Status |
|---|---|---|
| APP-1.1 | The app shall have a bottom bar with **Home** (the pin board at `/`, PIN-2), **Search** (SRCH) and **Modules**: a grid of the six modules (**Chords**, **Scales**, **Triads**, **Modes**, **Keys** and **Progressions**) and the tools (**Identify**, CHD-6, and later **Tuner**, TUN, and **Metronome**, MET). **Settings** opens from Home. | Partial |
| APP-1.2 | Any card shall be reachable in at most two taps from the home board: a pin opens its card in one, and a module's list plus one of its items is two, as Home shows the modules under its pins (owner, 2026-11-25). | Partial |
| APP-1.3 | Every card shall have a back control that returns to where the user came from (the browser's history), and the browser's and phone's own back shall do the same. A card opened with nothing in the app to go back to (from a link or a shortcut) goes back to its module's list. | Implemented |
| APP-1.4 | The context bar (APP-2) shall be at the top of every screen, and search one tap away on every screen (SRCH-1.1). | Partial |
| APP-1.5 | A cross-link between modules (a chord in a key, a mode's parent scale) shall open that card with the same instrument and tuning. | Planned |

## APP-2 The context bar sets the key and instrument once

| ID | Requirement | Status |
|---|---|---|
| APP-2.1 | A context bar on every screen shall show the current key (or "No key"), the instrument, the tuning and the capo when one is set, and open a sheet to change them (CTX-1). | Implemented |
| APP-2.2 | Changing the context shall update the screen in place, without leaving it. | Implemented |
| APP-2.3 | When the current card's URL overrides the instrument or tuning (APP-3.3), the context bar shall show the override and offer to clear it. Changing the instrument, tuning or capo in the sheet changes the setting and clears the override, so the card follows the choice (owner, 2026-11-25). | Implemented |

## APP-3 Every view is a URL

| ID | Requirement | Status |
|---|---|---|
| APP-3.1 | Every card and filtered list shall have a URL that holds its full state: what it shows (path) and how (query: position, voicing, inversion, labels, string set, comparison, tempo). Opening that URL in a fresh install shall show the same view. | Partial |
| APP-3.2 | Changing a view option (swiping to another voicing, choosing a position) shall replace the current history entry rather than add one, so back leaves the card rather than stepping through options. | Implemented |
| APP-3.3 | Any URL may carry `inst`, `tuning` and `capo`, which override the global setting for that view only. | Implemented |
| APP-3.4 | Sharps in paths shall be written `s` (`/scales/Fs/major`), and `%23` shall be accepted and rewritten to `s`. | Implemented |
| APP-3.5 | A URL the app can't read (an unknown chord quality, a bad root) shall show a "Not found" card with a link to the module's list, not a blank screen. | Implemented |
| APP-3.6 | The browser tab and installed-app title shall name the card: "A m7b5 · Fretdex". | Implemented |

## APP-4 It installs and works offline

| ID | Requirement | Status |
|---|---|---|
| APP-4.1 | The app shall be installable as a progressive web app, named "Fretdex" with its own icon and theme colors, opening full screen at the home board. | Partial |
| APP-4.2 | After the first load, every screen, diagram, sound and the voicing data shall work with no network. | Implemented |
| APP-4.3 | An installed app shall pick up a new version at the latest on its next launch, without the user clearing anything. | Implemented |
| APP-4.4 | On Android, the installed app's icon shall offer shortcuts to the first three pins on the board (PIN-2). | Planned |
| APP-4.5 | The app shall make no network request after it's installed other than checking for its own update, and shall have no analytics, tracking, ads or accounts. | Implemented |
| APP-4.6 | The microphone shall be used only by the tuner (TUN), only while its screen is open, and nothing it hears shall be recorded, stored or sent. | Planned |

## APP-5 It's usable on a phone on a music stand

| ID | Requirement | Status |
|---|---|---|
| APP-5.1 | Every tap target shall be at least 44 by 44 CSS pixels. | Planned |
| APP-5.2 | No action shall need hover, a right-click or a keyboard; every gesture (swipe between voicings) shall also have a visible button. | Planned |
| APP-5.3 | Text and note labels on diagrams shall be readable at arm's length: body text at least 16px and diagram labels at least 14px at the default size. | Partial |
| APP-5.4 | Every screen and feature shall be usable with the phone held upright. Turning the phone may show more, never less: in landscape the fretboard shows the whole fret range across the full width (DIAG-1.10). Decided 2026-11-25 (APP-Q2). | Planned |
| APP-5.5 | While **Keep screen awake** is on (CTX-1.10, on by default), the screen shall not dim or lock while the app is open, where the browser supports a wake lock. | Implemented |
| APP-5.6 | No screen shall scroll sideways at any width from 320px. | Planned |

## APP-6 It's themeable and accessible

| ID | Requirement | Status |
|---|---|---|
| APP-6.1 | The app shall offer **Dark** (default), **Light** and **High contrast** themes (CTX-1.8). | Implemented |
| APP-6.2 | Text shall meet WCAG AA contrast in Dark and Light, and AAA in High contrast. | Partial |
| APP-6.3 | Meaning shall never rest on color alone: a root or highlighted degree also differs in shape or label. | Planned |
| APP-6.4 | Every diagram shall have a text alternative listing what it shows ("A minor seven flat five: A, C, Eb, G; frets x 0 1 0 1 x"). | Partial |
| APP-6.5 | The app shall work with the system's text size and reduced-motion settings. | Planned |

## APP-7 It's fast

| ID | Requirement | Status |
|---|---|---|
| APP-7.1 | A card shall render within 100 ms of a tap on a mid-range phone, once the app is loaded. | Planned |
| APP-7.2 | The first load, everything precached included, shall be at most 2 MB transferred. | Planned |

## APP-8 It runs where the owner plays

| ID | Requirement | Status |
|---|---|---|
| APP-8.1 | The app shall be supported on current Safari on iOS, installed and in the browser, and current Chrome on Android. | Planned |
| APP-8.2 | Current desktop Chrome, Firefox and Safari shall work as a convenience: fixed when found broken, not tested for each release. | Planned |

## Known gaps

- **APP-1.1:** the bottom bar has Home and Modules; Search joins it in M03. The modules and tools later milestones build are in the grid, marked as coming later.
- **APP-1.2:** Home shows the modules, so any card is two taps away through its list; pins arrive with the home board (M01 T12).
- **APP-1.4:** the context bar is at the top of every screen; search comes in M03.
- **APP-3.1:** every route of M01 opens from its URL with its options and override, but the cards are sketches until their tasks build them (scales T9, modes T10), which show `pos`, `nps` and `compare`; the lists take no filters yet.
- **APP-4.1:** the app opens at a placeholder page until the home board (PIN-2, M01 T12).
- **APP-5.3, APP-6.2:** the three themes' colours and the type scale are design tokens, and a unit test checks every text pair's contrast, but most of the screens and diagrams that use them come with M01's later tasks.
- **APP-6.4:** the fretboard, its compact form and the keyboard have text alternatives; the chord box (M02), circle and staff (M03) will need theirs.
