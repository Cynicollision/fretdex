# Pins, Home Board and Recents (`PIN`)

A pin is a saved URL plus a label; the home screen is a reorderable board of pins. Because every view is a URL (APP-3), a pin captures the whole view: the chord and its voicing, the scale and its position, a progression in a key at a tempo. Everything here is stored only on the device, with a JSON file as the backup.

Screen: **Home** (`/`), and **Settings** (`/settings`) for export and import.

## PIN-1 The user can pin anything

| ID | Requirement | Status |
|---|---|---|
| PIN-1.1 | Every card and every filtered list shall have a **Pin** button that saves its current URL (APP-3.1), with the card's title as the label. The Modes overview (MODE-1) has none: its seven necks don't fit a tile, and it's in the menu anyway (owner, 2026-11-26). | Implemented |
| PIN-1.2 | A pinned card's button shall show it's pinned; tapping it again offers **Unpin** and **Pin again** (to save a second view of the same card, such as another position). Unpin takes the pin of the view as it is, or else every pin of the card; Pin again is offered when the view as it is isn't pinned. | Implemented |
| PIN-1.3 | The user can rename a pin and choose its group, from its tile's menu: Ungrouped, each group, or **New group…**, which names a group and moves the pin into it (owner, 2026-11-26). | Implemented |
| PIN-1.4 | A pin shall keep the URL's instrument, tuning and capo overrides, and add the current instrument, tuning and capo when they aren't the defaults, so it opens as it was pinned (APP-3.3). | Implemented |
| PIN-1.5 | When pinning a card that has a root or key, the user can choose **Follow current key**: the pin then leaves the root or key out of its URL and opens in whatever the current key is, or the card's default with none (a ii–V–I in the song's key). Retired 2026-11-28: there is no global current key to follow, as a key-relative view keeps its key in its URL (M02 decision 1), and a pin is its URL. | Retired |

## PIN-2 The home board shows the pins

| ID | Requirement | Status |
|---|---|---|
| PIN-2.1 | Home shall show the pins as a grid of tiles, in the user's order, under their group headings, with ungrouped pins first. | Implemented |
| PIN-2.2 | Each tile shall show the pin's label and a live mini render of its diagram (DIAG-5), drawn from the URL, so it reflects the current theme and handedness. | Implemented |
| PIN-2.3 | The user can reorder pins and groups by dragging, started by long-pressing a tile or a group's heading, so a tap still opens a tile and a swipe still scrolls (owner, 2026-11-26); a pin dragged into another group joins it. They can also move each up and down from its menu, a pin within its group (APP-5.2). | Implemented |
| PIN-2.4 | The user can add, rename, reorder and delete groups ("Gig: Saturday", "Practice", "Bass"); a group is added from a pin's menu (PIN-1.3), and renamed, moved and deleted from its heading's menu. No two groups share a name, ignoring case. Deleting a group asks whether to delete its pins or move them to ungrouped. A group emptied by moving its pins out stays, saying it's empty, until deleted (owner, 2026-11-26). | Implemented |
| PIN-2.5 | With no pins, Home shall say how to pin and link to each module and tool. Once something is pinned, Home is the board alone, the modules and tools being in the menu (APP-1.1, owner, 2026-11-27). | Implemented |
| PIN-2.6 | A pinned list's tile shall show the list's title and filter as text, without a diagram. | Implemented |
| PIN-2.7 | There shall be no limit on pins, and the board shall stay usable with at least 100. | Implemented |

## PIN-3 Pinned items come first in lists

| ID | Requirement | Status |
|---|---|---|
| PIN-3.1 | In each module's list, items with a pin shall be shown first, under **Pinned**, matched by the card's path regardless of its options. | Implemented |

## PIN-4 Recents

| ID | Requirement | Status |
|---|---|---|
| PIN-4.1 | The app shall remember the last 20 cards viewed, newest first, one entry per path (a newer view of the same card replaces the older one, keeping its latest options). | Planned |
| PIN-4.2 | Search shall show recents while nothing is typed (SRCH-1.9), and the user can clear them; Home doesn't show them, so the board stays the pins alone (owner, 2026-11-27). | Planned |

## PIN-5 The user can back up and restore

| ID | Requirement | Status |
|---|---|---|
| PIN-5.1 | **Export** on Settings shall save a JSON file, `fretdex-YYYY-MM-DD.json`, with the pins, groups, settings, custom tunings and hidden voicings, with a format version, and each record's own. | Partial |
| PIN-5.2 | **Import** shall read such a file and, after the user confirms, either **Replace everything** or **Add to what's here**, which skips pins whose URL is already pinned, adds groups by name and custom tunings unless their name or pitches are already in the list, and keeps this device's settings. Before the choice, it says what the file holds, and after it, what was added or skipped. A file it can't read, one with part of what the app keeps missing or damaged, or one a newer version of the app wrote, is refused with a message saying why, and nothing changes. | Implemented |

## PIN-6 Storage stays on the device

| ID | Requirement | Status |
|---|---|---|
| PIN-6.1 | Pins, groups, recents, settings, custom tunings and hidden voicings shall be stored on the device only. | Partial |
| PIN-6.2 | The app shall ask the browser for persistent storage the first time something is pinned and when installed, and Settings shall say whether it was granted. | Implemented |

## Known gaps

- **PIN-4:** recents come with search in M03, as that's where they show (owner, 2026-11-27).
- **PIN-5.1:** hidden voicings join the file when they're stored (M02).
- **PIN-6.1:** settings, custom tunings and pins are stored, on the device only; hidden voicings (M02) and recents (M03) come later.
