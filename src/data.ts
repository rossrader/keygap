// Shortcut database shared by the HTML page (inlined at serve time) and the MCP endpoint.
// Reference data: edit by hand, redeploy to publish.

export type Platform = 'mac' | 'win';
export type KeyMap = Record<string, string>;

export interface ModifierCombo {
  id: string;
  tabLabel: string;
  mods: string[];
  /** Recommendation order: 1 is the best combo to claim (ergonomics and how crowded it is). */
  rank: number;
  ergo: string;
  taken: KeyMap;
  risky: KeyMap;
}

export interface AppShortcuts {
  id: string;
  name: string;
  platforms: Platform[];
  /** comboId → { key: what the app uses it for }. Missing combos have no shortcuts. */
  mac: Record<string, KeyMap>;
  win: Record<string, KeyMap>;
}

/** Every non-modifier key on the visual keyboard, in layout order. */
export const keys: string[] = ["Esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","`","1","2","3","4","5","6","7","8","9","0","-","=","Delete","Tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\","A","S","D","F","G","H","J","K","L",";","'","Return","Z","X","C","V","B","N","M",",",".","/","Space","Left","Up","Down","Right"];

export const combos: Record<Platform, ModifierCombo[]> = {
  "mac": [
    {
      "id": "cmd",
      "tabLabel": "⌘",
      "mods": [
        "cmd"
      ],
      "rank": 5,
      "ergo": "Easiest combo, but nearly everything is taken by macOS or universal app conventions.",
      "taken": {
        "0": "Zoom reset",
        "1": "Tab 1",
        "2": "Tab 2",
        "3": "Tab 3",
        "4": "Tab 4",
        "5": "Tab 5",
        "6": "Tab 6",
        "7": "Tab 7",
        "8": "Tab 8",
        "9": "Tab 9",
        "A": "Select All",
        "B": "Bold",
        "C": "Copy",
        "D": "Bookmark/Define",
        "E": "Search field",
        "F": "Find",
        "G": "Find Next",
        "H": "Hide (system)",
        "I": "Italic",
        "J": "Smart quotes (some)",
        "K": "Insert link",
        "L": "Address bar",
        "M": "Minimize (system)",
        "N": "New",
        "O": "Open",
        "P": "Print",
        "Q": "Quit (system)",
        "R": "Refresh",
        "S": "Save",
        "T": "New tab",
        "U": "Underline",
        "V": "Paste",
        "W": "Close (system)",
        "X": "Cut",
        "Z": "Undo",
        "`": "Cycle windows",
        ",": "Preferences (system)",
        ".": "Stop/Cancel",
        "/": "Help menu",
        "-": "Zoom out",
        "=": "Zoom in",
        "[": "Back (browsers)",
        "]": "Forward (browsers)",
        "Tab": "App Switcher (system)",
        "Space": "Spotlight (system)",
        "Delete": "Move to Trash",
        "Return": "Open/Confirm",
        "Left": "Back",
        "Right": "Forward",
        "F1": "Show Help",
        "F3": "Mission Control",
        "F4": "Launchpad",
        "F11": "Show Desktop"
      },
      "risky": {
        "Y": "Redo (some)",
        ";": "Spellcheck (some)",
        "'": "Smart quotes (Pages)",
        "\\": "Rarely used",
        "Up": "Scroll top (some)",
        "Down": "Scroll bottom (some)",
        "Esc": "Front app menu",
        "F7": "Media rewind",
        "F8": "Play/Pause",
        "F9": "Media forward"
      }
    },
    {
      "id": "cmd-shift",
      "tabLabel": "⌘⇧",
      "mods": [
        "cmd",
        "shift"
      ],
      "rank": 3,
      "ergo": "Easy to press. Some free slots, but browsers and productivity apps claim many.",
      "taken": {
        "3": "Screenshot (full)",
        "4": "Screenshot (area)",
        "5": "Screenshot options",
        "A": "Applications (Finder)",
        "C": "Colors panel",
        "D": "Desktop (Finder)",
        "F": "Full search",
        "G": "Find Previous",
        "H": "Home (browsers)",
        "I": "Inspect/Mail",
        "L": "Downloads (Finder)",
        "N": "New folder/Incognito",
        "O": "Outline (some)",
        "P": "Page Setup/Private",
        "S": "Save As/Duplicate",
        "T": "Reopen closed tab",
        "V": "Paste & Match Style",
        "Q": "Log out (system)",
        "Z": "Redo",
        "Delete": "Empty Trash (Finder)",
        "/": "Help (system)",
        "=": "Zoom in (some)",
        "-": "Zoom out (some)",
        "[": "Prev tab (browsers)",
        "]": "Next tab (browsers)"
      },
      "risky": {
        "1": "View mode (some)",
        "2": "View mode (some)",
        "B": "Bookmarks bar (browsers)",
        "E": "Sources (DevTools)",
        "K": "Block quote/links",
        "M": "Mute (Slack/Zoom)",
        "R": "Hard reload (browsers)",
        "X": "Strikethrough",
        "J": "Downloads (Chrome)",
        "U": "Utilities folder (Finder)",
        ".": "Show hidden files (Finder)",
        "\\": "Rarely claimed"
      }
    },
    {
      "id": "cmd-opt",
      "tabLabel": "⌘⌥",
      "mods": [
        "cmd",
        "opt"
      ],
      "rank": 2,
      "ergo": "Good ergonomics — left thumb on ⌘, left ring on ⌥. Many open slots.",
      "taken": {
        "D": "Toggle Dock (system)",
        "H": "Hide Others (system)",
        "M": "Minimize all windows (system)",
        "Esc": "Force Quit (system)",
        "F5": "Accessibility shortcuts (system)",
        "F": "Find & Replace (many)"
      },
      "risky": {
        "1": "Reader (Safari)",
        "2": "History (Safari)",
        "8": "Zoom toggle (accessibility)",
        "A": "Activity Monitor (some)",
        "C": "Console (DevTools)",
        "I": "DevTools (Chrome)",
        "J": "Downloads (Chrome)",
        "L": "Reformat (IDEs)",
        "S": "Save As (some)",
        "T": "Toolbar toggle",
        "U": "View Source (browsers)",
        "V": "Paste special",
        "Left": "Switch tabs (some)",
        "Right": "Switch tabs (some)",
        "W": "Close all windows (some)",
        "-": "Zoom out (some)",
        "=": "Zoom in (some)"
      }
    },
    {
      "id": "cmd-ctrl",
      "tabLabel": "⌘⌃",
      "mods": [
        "cmd",
        "ctrl"
      ],
      "rank": 1,
      "ergo": "The sweet spot. Almost entirely free. Left thumb on ⌘, left pinky on ⌃.",
      "taken": {
        "F": "Fullscreen (system)",
        "Q": "Lock Screen (system)",
        "Space": "Emoji Picker (system)",
        "D": "Look Up (system)"
      },
      "risky": {
        "A": "Make alias (Finder)",
        "N": "New folder with selection (Finder)",
        "T": "Add to sidebar (Finder)",
        "R": "Recording (OBS/QuickTime)",
        "M": "Mute (rare)"
      }
    },
    {
      "id": "cmd-ctrl-shift",
      "tabLabel": "⌘⌃⇧",
      "mods": [
        "cmd",
        "ctrl",
        "shift"
      ],
      "rank": 4,
      "ergo": "Nearly everything open. Ergonomically heavy — three modifiers required.",
      "taken": {
        "3": "Screenshot → clipboard",
        "4": "Screenshot → clipboard"
      },
      "risky": {
        "5": "Screenshot → clipboard (some)"
      }
    }
  ],
  "win": [
    {
      "id": "win",
      "tabLabel": "Win",
      "mods": [
        "win"
      ],
      "rank": 6,
      "ergo": "Microsoft has claimed almost every letter here for OS features. The greediest modifier on either platform.",
      "taken": {
        "0": "Taskbar app 10",
        "1": "Taskbar app 1",
        "2": "Taskbar app 2",
        "3": "Taskbar app 3",
        "4": "Taskbar app 4",
        "5": "Taskbar app 5",
        "6": "Taskbar app 6",
        "7": "Taskbar app 7",
        "8": "Taskbar app 8",
        "9": "Taskbar app 9",
        "A": "Action Center",
        "B": "Taskbar focus (some)",
        "C": "Chat/Copilot",
        "D": "Show Desktop",
        "E": "File Explorer",
        "F": "Feedback Hub",
        "G": "Game Bar",
        "H": "Dictation",
        "I": "Settings",
        "K": "Bluetooth Connect",
        "L": "Lock Screen",
        "M": "Minimize All",
        "N": "Notifications",
        "P": "Project/Display",
        "Q": "Quick Settings",
        "R": "Run",
        "S": "Search",
        "T": "Cycle taskbar apps",
        "U": "Accessibility",
        "V": "Clipboard History",
        "W": "Widgets",
        "X": "Power User Menu",
        "Z": "Snap Layouts",
        "Tab": "Task View",
        "Space": "Input language",
        "Left": "Snap left",
        "Right": "Snap right",
        "Up": "Maximize",
        "Down": "Restore/Minimize",
        ",": "Peek at desktop",
        ".": "Emoji panel",
        ";": "Emoji panel (alt)",
        "=": "Magnifier zoom in",
        "-": "Magnifier zoom out",
        "Esc": "Magnifier off",
        "Return": "Narrator",
        "F4": "Close virtual desktop"
      },
      "risky": {
        "Y": "Rarely used",
        "O": "Rotate (tablet)",
        "J": "Focus Windows (some)",
        "`": "Cycle windows (some)"
      }
    },
    {
      "id": "ctrl",
      "tabLabel": "Ctrl",
      "mods": [
        "ctrl"
      ],
      "rank": 5,
      "ergo": "The primary modifier — equivalent to ⌘ on Mac. Almost entirely claimed.",
      "taken": {
        "0": "Tab 10/Zoom reset",
        "1": "Tab 1",
        "2": "Tab 2",
        "3": "Tab 3",
        "4": "Tab 4",
        "5": "Tab 5",
        "6": "Tab 6",
        "7": "Tab 7",
        "8": "Tab 8",
        "9": "Last tab",
        "A": "Select All",
        "B": "Bold",
        "C": "Copy",
        "D": "Bookmark/Address",
        "E": "Search",
        "F": "Find",
        "G": "Find Next",
        "H": "Replace",
        "I": "Italic",
        "K": "Insert link",
        "L": "Address bar (browsers)",
        "N": "New",
        "O": "Open",
        "P": "Print",
        "R": "Refresh",
        "S": "Save",
        "T": "New tab",
        "U": "Underline",
        "V": "Paste",
        "W": "Close tab",
        "X": "Cut",
        "Y": "Redo",
        "Z": "Undo",
        "Tab": "Switch window (some)",
        "=": "Zoom in",
        "-": "Zoom out",
        "[": "Back",
        "]": "Forward",
        "/": "Help (some)",
        "F4": "Close window",
        "F5": "Refresh",
        "Esc": "Start menu (system)"
      },
      "risky": {
        "J": "Downloads (browsers)",
        "M": "Mute (some)",
        "`": "Tab cycle (some)",
        ";": "Spellcheck (some)",
        "Delete": "Delete word",
        "F1": "Help",
        "F11": "Fullscreen",
        "F12": "DevTools"
      }
    },
    {
      "id": "ctrl-shift",
      "tabLabel": "Ctrl+Shift",
      "mods": [
        "ctrl",
        "shift"
      ],
      "rank": 4,
      "ergo": "Easy reach. More open than Ctrl alone, but apps claim a fair number.",
      "taken": {
        "N": "New incognito/window",
        "T": "Reopen closed tab",
        "Z": "Redo (alt)",
        "Tab": "Switch tabs back",
        "Esc": "Task Manager",
        "=": "Zoom in (some)",
        "-": "Zoom out (some)",
        "[": "Prev tab",
        "]": "Next tab",
        "Delete": "Clear browsing (browsers)"
      },
      "risky": {
        "B": "Bookmarks bar (browsers)",
        "E": "Explorer/Sources",
        "J": "Downloads (Chrome)",
        "K": "Links/Block quote",
        "M": "Mute (Slack/Zoom)",
        "P": "Command palette (VS Code)",
        "S": "Save As (some)",
        "V": "Paste special",
        "F": "Search in files (IDEs)",
        "I": "DevTools (Chrome)",
        "X": "Extensions (VS Code)"
      }
    },
    {
      "id": "ctrl-alt",
      "tabLabel": "Ctrl+Alt",
      "mods": [
        "ctrl",
        "alt"
      ],
      "rank": 2,
      "ergo": "Good availability. Note: some languages use Ctrl+Alt as AltGr for special characters.",
      "taken": {
        "Delete": "Security screen (Ctrl+Alt+Del)",
        "Tab": "Persistent app switcher (system)"
      },
      "risky": {
        "T": "Terminal (Linux habit)",
        "F": "Find & Replace (some)",
        "L": "Lock (some configs)",
        "Up": "Rotate display (Intel graphics)",
        "Down": "Rotate display (Intel graphics)",
        "Left": "Rotate display (Intel graphics)",
        "Right": "Rotate display (Intel graphics)"
      }
    },
    {
      "id": "win-ctrl",
      "tabLabel": "Win+Ctrl",
      "mods": [
        "win",
        "ctrl"
      ],
      "rank": 1,
      "ergo": "The sweet spot on Windows. Very few system claims.",
      "taken": {
        "D": "New virtual desktop",
        "F4": "Close virtual desktop",
        "Left": "Switch desktop left",
        "Right": "Switch desktop right",
        "Return": "Narrator (system)",
        "C": "Color filters (system)",
        "O": "On-screen keyboard (system)",
        "Q": "Quick Assist (system)",
        "Space": "Previous input language (system)"
      },
      "risky": {
        "F": "Find computers (domain networks)",
        "N": "Narrator settings",
        "S": "Speech recognition (older builds)",
        "V": "Sound output (some builds)"
      }
    },
    {
      "id": "win-shift",
      "tabLabel": "Win+Shift",
      "mods": [
        "win",
        "shift"
      ],
      "rank": 3,
      "ergo": "Lightly claimed by Windows. Good ergonomics.",
      "taken": {
        "S": "Screenshot Snipping (system)",
        "Left": "Move window to left monitor",
        "Right": "Move window to right monitor",
        "Up": "Stretch window vertically",
        "Down": "Restore window height",
        "M": "Restore minimized windows"
      },
      "risky": {
        "V": "Notification focus (some builds)",
        "R": "Screen recording (Snipping Tool)"
      }
    }
  ]
};

export const apps: AppShortcuts[] = [
  {
    "id": "chrome",
    "name": "Chrome",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "Y": "History",
        "D": "Bookmark",
        "L": "Address bar"
      },
      "cmd-shift": {
        "B": "Bookmarks bar",
        "J": "Downloads",
        "N": "Incognito",
        "T": "Reopen tab",
        "M": "Switch profile",
        "Delete": "Clear data",
        "W": "Close window"
      },
      "cmd-opt": {
        "I": "DevTools",
        "J": "JS console",
        "U": "View source",
        "C": "Inspect element",
        "B": "Bookmark manager",
        "Left": "Previous tab",
        "Right": "Next tab"
      },
      "cmd-ctrl": {
        "F": "Fullscreen"
      }
    },
    "win": {
      "ctrl": {
        "D": "Bookmark",
        "L": "Address bar",
        "J": "Downloads",
        "H": "History"
      },
      "ctrl-shift": {
        "B": "Bookmarks bar",
        "J": "Downloads",
        "N": "Incognito",
        "T": "Reopen tab",
        "M": "Switch profile",
        "Delete": "Clear data",
        "W": "Close window",
        "I": "DevTools",
        "C": "Inspect element",
        "O": "Bookmark manager"
      }
    }
  },
  {
    "id": "slack",
    "name": "Slack",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "K": "Quick switcher",
        "/": "Keyboard shortcuts",
        "U": "Upload file"
      },
      "cmd-shift": {
        "K": "Browse DMs",
        "M": "Mentions & reactions",
        "A": "All Unreads",
        "Y": "Set status",
        "D": "Do Not Disturb",
        "Return": "Snippet",
        "\\": "Toggle sidebar",
        "T": "Threads",
        "F": "Search in convo"
      },
      "cmd-opt": {
        "Right": "Next channel",
        "Left": "Prev channel",
        "Up": "Next unread",
        "Down": "Prev unread"
      }
    },
    "win": {
      "ctrl": {
        "K": "Quick switcher",
        "/": "Keyboard shortcuts",
        "U": "Upload file"
      },
      "ctrl-shift": {
        "K": "Browse DMs",
        "M": "Mentions & reactions",
        "A": "All Unreads",
        "Y": "Set status",
        "D": "DND",
        "Return": "Snippet",
        "\\": "Toggle sidebar",
        "T": "Threads",
        "F": "Search in convo"
      }
    }
  },
  {
    "id": "vscode",
    "name": "VS Code",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "B": "Toggle sidebar",
        "J": "Toggle terminal",
        "\\": "Split editor",
        "K": "Chord prefix"
      },
      "cmd-shift": {
        "P": "Cmd palette",
        "E": "Explorer",
        "F": "Search files",
        "G": "Source control",
        "X": "Extensions",
        "D": "Debug",
        "H": "Replace in files",
        "U": "Output",
        "Y": "Debug console",
        "K": "Delete line",
        "L": "Select all occ.",
        "M": "Problems",
        "B": "Sidebar",
        "`": "New terminal",
        "N": "New window",
        "O": "Open folder"
      },
      "cmd-opt": {
        "F": "Find & Replace",
        "[": "Fold",
        "]": "Unfold",
        "Left": "Move editor left",
        "Right": "Move editor right",
        "B": "Breadcrumbs"
      },
      "cmd-ctrl": {
        "Left": "Editor to prev group",
        "Right": "Editor to next group"
      }
    },
    "win": {
      "ctrl": {
        "B": "Toggle sidebar",
        "J": "Toggle terminal",
        "\\": "Split editor",
        "K": "Chord prefix",
        "`": "Terminal"
      },
      "ctrl-shift": {
        "P": "Cmd palette",
        "E": "Explorer",
        "F": "Search files",
        "G": "Source control",
        "X": "Extensions",
        "D": "Debug",
        "H": "Replace in files",
        "U": "Output",
        "Y": "Debug console",
        "K": "Delete line",
        "L": "Select all occ.",
        "M": "Problems",
        "B": "Sidebar",
        "`": "New terminal",
        "N": "New window",
        "O": "Open folder"
      },
      "ctrl-alt": {
        "F": "Find & Replace",
        "[": "Fold",
        "]": "Unfold",
        "Left": "Move editor left",
        "Right": "Move editor right"
      }
    }
  },
  {
    "id": "figma",
    "name": "Figma",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "\\": "Toggle UI",
        "R": "Rename",
        "/": "Quick actions",
        "G": "Group",
        "D": "Duplicate"
      },
      "cmd-shift": {
        "E": "Export",
        "G": "Ungroup",
        "H": "Flip horizontal",
        "V": "Flip vertical",
        "K": "Place image",
        "O": "Outline stroke",
        "L": "Lock layer",
        "\\": "Layers",
        "C": "Copy CSS",
        "B": "Bold",
        "R": "Rulers"
      },
      "cmd-opt": {
        "G": "Frame selection",
        "C": "Copy SVG",
        "T": "Pixel grid",
        "P": "Pixel preview"
      },
      "cmd-ctrl-shift": {
        "E": "Export selection"
      }
    },
    "win": {
      "ctrl": {
        "\\": "Toggle UI",
        "R": "Rename",
        "/": "Quick actions",
        "G": "Group",
        "D": "Duplicate"
      },
      "ctrl-shift": {
        "E": "Export",
        "G": "Ungroup",
        "H": "Flip horiz.",
        "V": "Flip vert.",
        "K": "Place image",
        "O": "Outline stroke",
        "L": "Lock layer",
        "\\": "Layers",
        "C": "Copy CSS",
        "B": "Bold",
        "R": "Rulers"
      },
      "ctrl-alt": {
        "G": "Frame selection",
        "C": "Copy SVG",
        "T": "Pixel grid",
        "P": "Pixel preview"
      }
    }
  },
  {
    "id": "linear",
    "name": "Linear",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "K": "Command menu",
        ".": "Change status"
      },
      "cmd-shift": {
        "C": "Copy issue ID",
        ".": "Cycle status",
        ",": "Cycle back",
        "A": "Assign to me",
        "P": "Priority",
        "L": "Label",
        "E": "Estimate",
        "D": "Due date"
      }
    },
    "win": {
      "ctrl": {
        "K": "Command menu",
        ".": "Change status"
      },
      "ctrl-shift": {
        "C": "Copy issue ID",
        ".": "Cycle status",
        ",": "Cycle back",
        "A": "Assign to me",
        "P": "Priority",
        "L": "Label",
        "E": "Estimate",
        "D": "Due date"
      }
    }
  },
  {
    "id": "notion",
    "name": "Notion",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "E": "Inline code",
        "P": "Search",
        "N": "New page",
        "D": "Duplicate",
        "/": "Turn into",
        "[": "Back",
        "]": "Forward",
        "\\": "Toggle sidebar"
      },
      "cmd-shift": {
        "L": "Dark mode",
        "H": "Last text color",
        "M": "Comment",
        "U": "Parent page",
        "N": "New window",
        "Up": "Move block up",
        "Down": "Move block down"
      },
      "cmd-opt": {
        "0": "Text",
        "1": "Heading 1",
        "2": "Heading 2",
        "3": "Heading 3",
        "4": "To-do",
        "5": "Bulleted list",
        "6": "Numbered list",
        "7": "Toggle list",
        "8": "Code block",
        "9": "New page",
        "T": "Expand all toggles"
      }
    },
    "win": {
      "ctrl": {
        "E": "Inline code",
        "P": "Search",
        "N": "New page",
        "D": "Duplicate",
        "/": "Turn into",
        "[": "Back",
        "]": "Forward",
        "\\": "Toggle sidebar"
      },
      "ctrl-shift": {
        "0": "Text",
        "1": "Heading 1",
        "2": "Heading 2",
        "3": "Heading 3",
        "4": "To-do",
        "5": "Bulleted list",
        "6": "Numbered list",
        "7": "Toggle list",
        "8": "Code block",
        "9": "New page",
        "L": "Dark mode",
        "H": "Last text color",
        "M": "Comment",
        "U": "Parent page",
        "N": "New window",
        "Up": "Move block up",
        "Down": "Move block down"
      },
      "ctrl-alt": {
        "T": "Expand all toggles"
      }
    }
  },
  {
    "id": "arc",
    "name": "Arc",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "D": "Pin tab",
        "S": "Save to library",
        "L": "URL bar"
      },
      "cmd-shift": {
        "C": "Copy clean URL",
        "D": "Toggle sidebar",
        "N": "Incognito",
        "E": "Sidebar view",
        "T": "Reopen tab",
        "R": "Hard refresh"
      },
      "cmd-opt": {
        "N": "Little Arc window",
        "I": "DevTools",
        "R": "Force refresh"
      },
      "cmd-ctrl": {
        "N": "New window"
      }
    },
    "win": {}
  },
  {
    "id": "zoom",
    "name": "Zoom",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "J": "Join meeting"
      },
      "cmd-shift": {
        "A": "Mute audio",
        "V": "Start/stop video",
        "S": "Screen share",
        "H": "Chat",
        "M": "Minimize",
        "F": "Fullscreen",
        "R": "Record",
        "N": "Switch camera",
        "W": "Gallery view",
        "T": "Transfer"
      }
    },
    "win": {
      "ctrl-shift": {
        "A": "Mute audio",
        "V": "Start/stop video",
        "S": "Screen share",
        "H": "Chat",
        "F": "Fullscreen",
        "R": "Record",
        "W": "Gallery view"
      }
    }
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "L": "Search",
        "N": "New playlist"
      },
      "cmd-shift": {
        "Left": "Prev track",
        "Right": "Next track",
        "Down": "Vol down",
        "Up": "Vol up",
        "W": "Close"
      }
    },
    "win": {
      "ctrl": {
        "L": "Search",
        "N": "New playlist"
      },
      "ctrl-shift": {
        "Left": "Prev track",
        "Right": "Next track",
        "Down": "Vol down",
        "Up": "Vol up",
        "W": "Close"
      }
    }
  },
  {
    "id": "raycast",
    "name": "Raycast",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "Space": "Raycast (global hotkey)"
      },
      "cmd-shift": {
        ".": "Clipboard history (global)",
        ",": "Raycast settings",
        "C": "Confetti (global)",
        "V": "Clipboard paste (global)"
      },
      "cmd-ctrl": {
        "N": "Floating notes (global)",
        "R": "AI chat (global)",
        "Space": "Window mgmt (some configs)"
      }
    },
    "win": {}
  },
  {
    "id": "1password",
    "name": "1Password",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "\\": "Autofill (global)"
      },
      "cmd-shift": {
        "X": "Lock 1Password (global)",
        "Space": "Quick Access (global)",
        "L": "Lock (in app)"
      },
      "cmd-opt": {
        "\\": "Fill & save (global)"
      }
    },
    "win": {
      "ctrl": {
        "\\": "Autofill (global)"
      },
      "ctrl-shift": {
        "X": "Lock 1Password (global)",
        "Space": "Quick Access (global)",
        "L": "Lock (in app)"
      },
      "ctrl-alt": {
        "\\": "Fill & save (global)"
      }
    }
  },
  {
    "id": "obsidian",
    "name": "Obsidian",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "E": "Toggle edit/preview",
        "P": "Command palette",
        "O": "Quick open",
        ",": "Settings",
        "B": "Bold",
        "I": "Italic",
        "K": "Insert link",
        "L": "Toggle checkbox",
        "D": "Delete paragraph",
        "/": "Toggle comment"
      },
      "cmd-shift": {
        "F": "Search & replace in files",
        "D": "Create daily note",
        "E": "Export PDF"
      },
      "cmd-opt": {
        "Left": "Navigate back",
        "Right": "Navigate forward",
        "F": "Toggle search"
      }
    },
    "win": {
      "ctrl": {
        "E": "Toggle edit/preview",
        "P": "Command palette",
        "O": "Quick open",
        ",": "Settings",
        "B": "Bold",
        "I": "Italic",
        "K": "Insert link",
        "L": "Toggle checkbox",
        "D": "Delete paragraph",
        "/": "Toggle comment"
      },
      "ctrl-shift": {
        "F": "Search & replace in files",
        "D": "Create daily note",
        "E": "Export PDF"
      },
      "ctrl-alt": {
        "Left": "Navigate back",
        "Right": "Navigate forward",
        "F": "Toggle search"
      }
    }
  },
  {
    "id": "firefox",
    "name": "Firefox",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "K": "Focus search box",
        "L": "Address bar",
        "D": "Bookmark page",
        "B": "Bookmarks",
        "H": "History"
      },
      "cmd-shift": {
        "T": "Reopen tab",
        "H": "History sidebar",
        "D": "Bookmark all tabs",
        "B": "Toggle sidebar",
        "R": "Reader view",
        "\\": "Tab overview"
      },
      "cmd-opt": {
        "I": "DevTools",
        "K": "Web Console",
        "J": "Browser Console",
        "Z": "Debugger",
        "S": "Style Editor"
      },
      "cmd-ctrl": {
        "F": "Fullscreen"
      },
      "cmd-ctrl-shift": {
        "I": "Browser Toolbox"
      }
    },
    "win": {
      "ctrl": {
        "K": "Focus search box",
        "L": "Address bar",
        "D": "Bookmark page",
        "B": "Bookmarks",
        "H": "History"
      },
      "ctrl-shift": {
        "T": "Reopen tab",
        "I": "DevTools",
        "K": "Web Console",
        "J": "Browser Console",
        "P": "Private window",
        "D": "Bookmark all tabs",
        "B": "Toggle sidebar",
        "M": "Responsive design mode"
      }
    }
  },
  {
    "id": "safari",
    "name": "Safari",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "F": "Find on page",
        "L": "Smart Search field"
      },
      "cmd-shift": {
        "H": "Go to homepage",
        "T": "Reopen last tab",
        "D": "Add to Reading List",
        "R": "Open Reader",
        "\\": "Tab overview"
      },
      "cmd-ctrl": {
        "1": "Bookmarks sidebar",
        "2": "Reading List sidebar"
      }
    },
    "win": {}
  },
  {
    "id": "discord",
    "name": "Discord",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "K": "Quick switcher",
        "P": "Toggle pins",
        "U": "Member list",
        "E": "Emoji picker",
        "/": "Keyboard shortcuts"
      },
      "cmd-shift": {
        "N": "Create/join server",
        "M": "Mute microphone",
        "D": "Toggle deafen",
        "U": "Upload file"
      },
      "cmd-opt": {
        "Up": "Previous server",
        "Down": "Next server"
      }
    },
    "win": {
      "ctrl": {
        "K": "Quick switcher",
        "F": "Search channel",
        "E": "Emoji picker",
        "U": "Member list",
        "/": "Keyboard shortcuts"
      },
      "ctrl-shift": {
        "N": "Create/join server",
        "M": "Mute microphone",
        "D": "Toggle deafen",
        "U": "Upload file"
      },
      "ctrl-alt": {
        "Up": "Previous server",
        "Down": "Next server"
      }
    }
  },
  {
    "id": "superhuman",
    "name": "Superhuman",
    "platforms": [
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "K": "Superhuman Command",
        "/": "Search"
      },
      "cmd-shift": {
        "O": "To field",
        "C": "CC field",
        "B": "BCC field",
        "F": "From field",
        "S": "Edit subject",
        "A": "Attach file"
      }
    },
    "win": {
      "ctrl": {
        "K": "Superhuman Command",
        "/": "Search"
      },
      "ctrl-shift": {
        "O": "To field",
        "C": "CC field",
        "B": "BCC field",
        "F": "From field",
        "S": "Edit subject",
        "A": "Attach file"
      }
    }
  },
  {
    "id": "terminal",
    "name": "Terminal",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "N": "New window",
        "T": "New tab",
        "D": "Split pane",
        "K": "Clear to previous mark"
      },
      "cmd-shift": {
        "D": "Close split pane",
        "I": "Edit title",
        "M": "Insert bookmark"
      }
    },
    "win": {}
  },
  {
    "id": "iterm",
    "name": "iTerm2",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "D": "Split vertically",
        "T": "New tab",
        "N": "New window",
        "K": "Clear buffer",
        "W": "Close tab"
      },
      "cmd-shift": {
        "D": "Split horizontally",
        "Return": "Maximize pane",
        "M": "Mark location",
        "J": "Jump to mark"
      },
      "cmd-opt": {
        "Up": "Navigate up pane",
        "Down": "Navigate down pane",
        "Left": "Navigate left pane",
        "Right": "Navigate right pane"
      }
    },
    "win": {}
  },
  {
    "id": "warp",
    "name": "Warp",
    "platforms": [
      "mac"
    ],
    "mac": {
      "cmd": {
        "D": "Split right",
        "K": "Clear blocks",
        "P": "Command palette",
        "O": "File search",
        "/": "Keyboard shortcuts",
        "B": "Bookmark block"
      },
      "cmd-shift": {
        "D": "Split down",
        "Return": "Maximize pane",
        "C": "Copy command",
        "P": "Navigation palette",
        "T": "Reopen closed tab",
        "K": "Clear selected lines"
      },
      "cmd-opt": {
        "Up": "Switch pane up",
        "Down": "Switch pane down",
        "Left": "Switch pane left",
        "Right": "Switch pane right"
      }
    },
    "win": {}
  }
];
