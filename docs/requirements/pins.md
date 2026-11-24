# Pins, Home Board and Recents (`PIN`)

A pin is a saved URL plus a label; the home screen is a reorderable board of pins. Because every view is a URL (APP-3), a pin captures the whole view: the chord and its voicing, the scale and its position, a progression in a key at a tempo. Everything here is stored only on the device, with a JSON file as the backup.

Screen: **Home** (`/`), and **Settings** (`/settings`) for export and import.

## PIN-1 The user can pin anything

| ID | Requirement | Status |
|---|---|---|
| PIN-1.1 | Every card and every filtered list shall have a **Pin** button that saves its current URL (APP-3.1), with the card's title as the label. | Planned |
| PIN-1.2 | A pinned card's button shall show it's pinned; tapping it again offers **Unpin** and **Pin again** (to save a second view of the same card, such as another position). | Planned |
| PIN-1.3 | The user can rename a pin and choose its group. | Planned |
| PIN-1.4 | A pin shall keep the URL's instrument, tuning and capo overrides, and add the current instrument, tuning and capo when they aren't the defaults, so it opens as it was pinned (APP-3.3). | Planned |
| PIN-1.5 | When pinning a card that has a root or key, the user can choose **Follow current key**: the pin then leaves the root or key out of its URL and opens in whatever the current key is, or the card's default with none (a ii–V–I in the song's key). | Planned |

## PIN-2 The home board shows the pins

| ID | Requirement | Status |
|---|---|---|
| PIN-2.1 | Home shall show the pins as a grid of tiles, in the user's order, under their group headings, with ungrouped pins first. | Planned |
| PIN-2.2 | Each tile shall show the pin's label and a live mini render of its diagram (DIAG-5), drawn from the URL, so it reflects the current theme and handedness. | Planned |
| PIN-2.3 | The user can reorder pins and groups by dragging, and also with move up and down in each tile's menu (APP-5.2). | Planned |
| PIN-2.4 | The user can add, rename, reorder and delete groups ("Gig: Saturday", "Practice", "Bass"); deleting a group asks whether to delete its pins or move them to ungrouped. | Planned |
| PIN-2.5 | With no pins, Home shall say how to pin and link to each module. | Planned |
| PIN-2.6 | A pinned list's tile shall show the list's title and filter as text, without a diagram. | Planned |
| PIN-2.7 | There shall be no limit on pins, and the board shall stay usable with at least 100. | Planned |

## PIN-3 Pinned items come first in lists

| ID | Requirement | Status |
|---|---|---|
| PIN-3.1 | In each module's list, items with a pin shall be shown first, under **Pinned**, matched by the card's path regardless of its options. | Planned |

## PIN-4 Recents

| ID | Requirement | Status |
|---|---|---|
| PIN-4.1 | The app shall remember the last 20 cards viewed, newest first, one entry per path (a newer view of the same card replaces the older one, keeping its latest options). | Planned |
| PIN-4.2 | Home shall show recents below the pins, and the user can clear them. | Planned |

## PIN-5 The user can back up and restore

| ID | Requirement | Status |
|---|---|---|
| PIN-5.1 | **Export** on Settings shall save a JSON file with the pins, groups, settings, custom tunings and hidden voicings, with a format version. | Planned |
| PIN-5.2 | **Import** shall read such a file and, after the user confirms, either **Replace everything** or **Add to what's here**, which skips pins whose URL is already pinned, adds groups and custom tunings by name, and keeps this device's settings. A file it can't read is refused with a message saying why, and nothing changes. | Planned |

## PIN-6 Storage stays on the device

| ID | Requirement | Status |
|---|---|---|
| PIN-6.1 | Pins, groups, recents, settings, custom tunings and hidden voicings shall be stored on the device only. | Planned |
| PIN-6.2 | The app shall ask the browser for persistent storage the first time something is pinned and when installed, and Settings shall say whether it was granted. | Planned |
