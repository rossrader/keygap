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
        "F": "Recents (Finder)",
        "G": "Find Previous",
        "H": "Home folder (Finder)",
        "I": "iCloud Drive (Finder)",
        "N": "New folder/Incognito",
        "O": "Documents (Finder)",
        "P": "Page Setup/Private",
        "S": "Save As/Duplicate",
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
        "6": "Ask Siri (macOS 27 beta)",
        "B": "Bookmarks bar (browsers)",
        "E": "Sources (DevTools)",
        "K": "Network (Finder)",
        "M": "Mute (Slack/Zoom)",
        "R": "AirDrop / hard reload",
        "X": "Strikethrough",
        "J": "Downloads (Chrome)",
        "U": "Utilities folder (Finder)",
        ".": "Show hidden files (Finder)",
        "\\": "Rarely claimed",
        "T": "Reopen tab (browsers)",
        "Space": "Ask Siri (macOS 27 beta)",
        ";": "Spelling & grammar"
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
        "F": "Find & Replace (many)",
        "L": "Downloads (Finder)",
        "W": "Close all windows"
      },
      "risky": {
        "1": "Reader (Safari)",
        "2": "History (Safari)",
        "8": "Zoom toggle (accessibility)",
        "A": "Activity Monitor (some)",
        "C": "Copy style",
        "I": "DevTools (Chrome)",
        "J": "JS console (Chrome)",
        "S": "Sidebar (Finder)",
        "T": "Toolbar toggle",
        "U": "View Source (browsers)",
        "V": "Paste special",
        "Left": "Switch tabs (some)",
        "Right": "Switch tabs (some)",
        "-": "Zoom out (some)",
        "=": "Zoom in (some)",
        "Space": "Spotlight (Finder)",
        "P": "Path bar (Finder)",
        "N": "Smart Folder (Finder)",
        "Y": "Slideshow (Finder)"
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
        "M": "Mute (rare)",
        "Up": "Enclosing folder (Finder)"
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
        "5": "Screenshot → clipboard (some)",
        "T": "Add to Dock (Finder)"
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
        "N": "New folder/incognito",
        "Z": "Redo (alt)",
        "Tab": "Switch tabs back",
        "Esc": "Task Manager",
        "=": "Zoom in (some)",
        "-": "Zoom out (some)"
      },
      "risky": {
        "B": "Bookmarks bar (browsers)",
        "E": "Explorer/Sources",
        "J": "JS console (Chrome)",
        "K": "Links/Block quote",
        "M": "Mute (Slack/Zoom)",
        "P": "Command palette (VS Code)",
        "S": "Save As (some)",
        "V": "Paste plain text",
        "F": "Search in files (IDEs)",
        "I": "DevTools (Chrome)",
        "X": "Extensions (VS Code)",
        "T": "Reopen tab (browsers)",
        "Delete": "Clear data (browsers)",
        "[": "Fold (some editors)",
        "]": "Unfold (some editors)"
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
        "F": "Full screen (Magnifier)",
        "L": "Lens view (Magnifier)",
        "Up": "Pan (Magnifier)",
        "Down": "Pan (Magnifier)",
        "Left": "Pan (Magnifier)",
        "Right": "Pan (Magnifier)",
        "I": "Invert (Magnifier)",
        "D": "Docked (Magnifier)",
        "M": "Cycle views (Magnifier)",
        "R": "Resize lens (Magnifier)",
        "Space": "Preview desktop (Magnifier)",
        "-": "Toggle zoom (Magnifier)"
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
      "ergo": "The sweet spot on Windows. Apps leave it alone; Windows uses the number row and a handful of letters.",
      "taken": {
        "0": "Last window of taskbar app",
        "1": "Last window of taskbar app",
        "2": "Last window of taskbar app",
        "3": "Last window of taskbar app",
        "4": "Last window of taskbar app",
        "5": "Last window of taskbar app",
        "6": "Last window of taskbar app",
        "7": "Last window of taskbar app",
        "8": "Last window of taskbar app",
        "9": "Last window of taskbar app",
        "D": "New virtual desktop",
        "F4": "Close virtual desktop",
        "Left": "Switch desktop left",
        "Right": "Switch desktop right",
        "Return": "Narrator (system)",
        "C": "Color filters (system)",
        "O": "On-screen keyboard (system)",
        "Q": "Quick Assist (system)",
        "Space": "Previous input language (system)",
        "M": "Magnifier settings",
        "N": "Narrator settings",
        "S": "Voice access/speech",
        "V": "Sound output"
      },
      "risky": {
        "F": "Find computers (domain networks)"
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
        "0": "New app instance",
        "1": "New app instance",
        "2": "New app instance",
        "3": "New app instance",
        "4": "New app instance",
        "5": "New app instance",
        "6": "New app instance",
        "7": "New app instance",
        "8": "New app instance",
        "9": "New app instance",
        "S": "Screenshot Snipping (system)",
        "Left": "Move window to left monitor",
        "Right": "Move window to right monitor",
        "Up": "Stretch window vertically",
        "Down": "Restore window height",
        "M": "Restore minimized windows",
        "V": "Cycle notifications",
        "R": "Screen recording",
        "A": "Focus Windows tip",
        "T": "Previous taskbar app",
        "Return": "UWP full screen",
        "Space": "Previous input language"
      },
      "risky": {}
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
        "W": "Close window",
        "D": "Bookmark all tabs",
        "R": "Hard reload",
        "G": "Find previous",
        "H": "Home page",
        "I": "Email page link"
      },
      "cmd-opt": {
        "I": "DevTools",
        "J": "JS console",
        "U": "View source",
        "C": "Inspect element",
        "B": "Bookmark manager",
        "Left": "Previous tab",
        "Right": "Next tab",
        "N": "Split view",
        "F": "Search the web",
        "P": "Page setup",
        "Up": "Cycle toolbar focus",
        "Down": "Cycle toolbar focus"
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
        "J": "JS console",
        "N": "Incognito",
        "T": "Reopen tab",
        "M": "Switch profile",
        "Delete": "Clear data",
        "W": "Close window",
        "I": "DevTools",
        "C": "Inspect element",
        "O": "Bookmark manager",
        "D": "Bookmark all tabs",
        "R": "Hard reload",
        "G": "Find previous"
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
        "U": "Underline",
        "O": "Upload file"
      },
      "cmd-shift": {
        "0": "Canvas checklist",
        "7": "Numbered list",
        "8": "Bulleted list",
        "9": "Quote",
        "K": "Browse DMs",
        "M": "Activity view",
        "A": "All Unreads",
        "Y": "Set status",
        "Return": "Snippet",
        "\\": "Add reaction",
        "T": "Threads",
        "F": "Apply markdown",
        "N": "New canvas",
        "J": "Downloads",
        "H": "Huddle",
        "Space": "Huddle mute",
        "W": "Reopen window",
        "E": "People view",
        "L": "Browse channels",
        "I": "Conversation details",
        "S": "Workspace switcher",
        "X": "Strikethrough",
        "U": "Hyperlink",
        "C": "Code",
        "`": "Add reaction",
        "G": "Find previous",
        "Z": "Redo",
        "/": "Context menu"
      },
      "cmd-opt": {
        "0": "Canvas paragraph",
        "1": "Big heading",
        "2": "Medium heading",
        "3": "Small heading",
        "Up": "Move canvas item up",
        "Down": "Move canvas item down",
        "T": "Canvas comments",
        "R": "Reader/edit view"
      },
      "cmd-ctrl": {
        "F": "Toggle fullscreen"
      }
    },
    "win": {
      "ctrl": {
        "K": "Quick switcher",
        "/": "Keyboard shortcuts",
        "O": "Upload file"
      },
      "ctrl-shift": {
        "0": "More view",
        "1": "Home view",
        "2": "Browse DMs",
        "7": "Numbered list",
        "8": "Bulleted list",
        "9": "Quote",
        "K": "New message",
        "M": "Activity view",
        "A": "All Unreads",
        "Y": "Set status",
        "Return": "Snippet",
        "\\": "Add reaction",
        "T": "Threads",
        "F": "Apply markdown",
        "N": "New canvas",
        "J": "Downloads",
        "H": "Huddle",
        "Space": "Huddle mute",
        "W": "Reopen window",
        "E": "People view",
        "L": "Browse channels",
        "I": "Conversation details",
        "S": "Workspace switcher",
        "X": "Strikethrough",
        "U": "Hyperlink",
        "C": "Code",
        "`": "Add reaction",
        "G": "Find previous",
        "Z": "Redo"
      },
      "ctrl-alt": {
        "0": "Canvas paragraph",
        "1": "Big heading",
        "2": "Medium heading",
        "3": "Small heading",
        "T": "Canvas comments",
        "R": "Reader/edit view",
        "Q": "Copy anchor link",
        "Up": "Move item up",
        "Down": "Move item down"
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
        "G": "Find previous",
        "X": "Extensions",
        "D": "Debug",
        "H": "Replace in files",
        "U": "Output",
        "Y": "Debug console",
        "K": "Delete line",
        "L": "Select all occ.",
        "M": "Problems",
        "B": "Run build task",
        "N": "New window",
        "O": "Go to symbol",
        "T": "Reopen closed editor",
        "S": "Save as",
        "V": "Markdown preview",
        "I": "Chat agent mode",
        "W": "Close window",
        "J": "Search details",
        "C": "Open native terminal",
        "\\": "Jump to bracket",
        "Space": "Parameter hints",
        ".": "Breadcrumbs select",
        ";": "Focus breadcrumbs",
        "[": "Previous editor",
        "]": "Next editor"
      },
      "cmd-opt": {
        "0": "Toggle group layout",
        "F": "Find & Replace",
        "[": "Fold",
        "]": "Unfold",
        "Left": "Previous editor",
        "Right": "Next editor",
        "B": "Secondary sidebar",
        "S": "Save all",
        "Up": "Cursor above",
        "Down": "Cursor below",
        "C": "Find: match case",
        "R": "Find: regex",
        "W": "Find: whole word",
        "T": "Close other editors",
        "/": "Open browser",
        "O": "Toggle overtype",
        ".": "Auto fix"
      },
      "cmd-ctrl": {
        "1": "Editor to first group",
        "9": "Editor to last group",
        "Left": "Editor to prev group",
        "Right": "Editor to next group",
        "F": "Toggle full screen",
        "I": "Open chat view",
        "Up": "Resize terminal pane",
        "Down": "Resize terminal pane"
      },
      "cmd-ctrl-shift": {
        "Left": "Shrink selection",
        "Right": "Expand selection"
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
        "B": "Run build task",
        "`": "New terminal",
        "N": "New window",
        "O": "Go to symbol",
        "T": "Reopen closed editor",
        "S": "Save as",
        "V": "Markdown preview",
        "I": "Chat agent mode",
        "W": "Close window",
        "J": "Search details",
        "C": "Open native terminal",
        "\\": "Jump to bracket",
        "Space": "Parameter hints",
        "[": "Fold",
        "]": "Unfold"
      },
      "ctrl-alt": {
        "Left": "Editor to prev group",
        "Right": "Editor to next group",
        "Up": "Cursor above",
        "Down": "Cursor below",
        "I": "Open chat view",
        "B": "Secondary sidebar",
        ".": "Model picker",
        "/": "Open browser",
        "O": "Remote menu"
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
        "7": "Numbered list",
        "8": "Bulleted list",
        "E": "Export",
        "G": "Ungroup",
        "H": "Show/hide selection",
        "V": "Paste over selection",
        "K": "Place image",
        "O": "Show outlines",
        "L": "Lock layer",
        "\\": "Minimize UI",
        "C": "Copy as PNG",
        "B": "Bold",
        "R": "Paste to replace",
        "'": "Snap to pixel grid",
        "X": "Strikethrough",
        "U": "Add link",
        ",": "Decrease font size",
        ".": "Increase font size"
      },
      "cmd-opt": {
        "G": "Frame selection",
        "C": "Copy properties",
        "T": "Text align center",
        "V": "Paste properties",
        "K": "Create component",
        "B": "Detach instance",
        "O": "Outline stroke",
        "L": "Text align left",
        "R": "Text align right",
        "\\": "Multiplayer cursors",
        ",": "Decrease font weight",
        ".": "Increase font weight",
        "]": "Bring to front",
        "[": "Send to back"
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
        "4": "Layout guides",
        "7": "Numbered list",
        "8": "Bulleted list",
        "E": "Export",
        "G": "Ungroup",
        "H": "Show/hide selection",
        "V": "Paste over selection",
        "K": "Place image",
        "O": "Show outlines",
        "L": "Lock layer",
        "\\": "Minimize UI",
        "C": "Copy as PNG",
        "B": "Bold",
        "R": "Paste to replace",
        "'": "Snap to pixel grid",
        "X": "Strikethrough",
        "U": "Add link",
        ",": "Decrease font size",
        ".": "Increase font size",
        "]": "Bring to front",
        "[": "Send to back"
      },
      "ctrl-alt": {
        "G": "Frame selection",
        "C": "Copy properties",
        "T": "Text align center",
        "P": "Pixel preview",
        "V": "Paste properties",
        "K": "Create component",
        "B": "Detach instance",
        "O": "Outline stroke",
        "L": "Text align left",
        "R": "Text align right",
        "\\": "Multiplayer cursors",
        ",": "Decrease font weight",
        ".": "Increase font weight"
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
        ".": "Copy issue ID"
      },
      "cmd-shift": {
        "7": "Checklist",
        "8": "Bulleted list",
        "9": "Numbered list",
        "C": "Add to cycle",
        ".": "Copy git branch",
        ",": "Copy issue URL",
        "A": "Attach file",
        "D": "Remove due date",
        "S": "Manage subscribers",
        "M": "Move to team",
        "O": "Create sub-issue",
        "I": "Insights panel",
        "Return": "Create more",
        "\\": "Code block",
        "Z": "Redo",
        "Up": "Open parent issue",
        "Down": "Open sub-issue",
        "U": "Upload files"
      },
      "cmd-opt": {
        "M": "Inline comment",
        "C": "Copy as markdown"
      }
    },
    "win": {
      "ctrl": {
        "K": "Command menu",
        ".": "Copy issue ID"
      },
      "ctrl-shift": {
        "7": "Checklist",
        "8": "Bulleted list",
        "9": "Numbered list",
        "C": "Add to cycle",
        ".": "Copy git branch",
        ",": "Copy issue URL",
        "A": "Attach file",
        "D": "Remove due date",
        "S": "Manage subscribers",
        "M": "Move to team",
        "O": "Create sub-issue",
        "I": "Insights panel",
        "Return": "Create more",
        "\\": "Code block",
        "Z": "Redo",
        "Up": "Open parent issue",
        "Down": "Open sub-issue"
      },
      "ctrl-alt": {
        "M": "Inline comment",
        "C": "Copy as markdown"
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
      "mac",
      "win"
    ],
    "mac": {
      "cmd": {
        "D": "Pin tab",
        "S": "Toggle sidebar",
        "L": "URL bar"
      },
      "cmd-shift": {
        "C": "Copy clean URL",
        "D": "Toggle sidebar",
        "N": "Incognito",
        "E": "Sidebar view",
        "T": "Reopen tab",
        "R": "Hard refresh",
        "K": "Clear unpinned tabs"
      },
      "cmd-opt": {
        "N": "Little Arc window",
        "I": "DevTools",
        "R": "Force refresh",
        "Up": "Previous tab",
        "Down": "Next tab",
        "Left": "Previous space",
        "Right": "Next space"
      },
      "cmd-ctrl": {}
    },
    "win": {
      "ctrl-alt": {
        "Up": "Previous tab",
        "Down": "Next tab",
        "Left": "Previous space",
        "Right": "Next space"
      },
      "ctrl-shift": {
        "N": "Incognito",
        "T": "Reopen tab",
        "C": "Copy URL",
        "K": "Clear unpinned tabs"
      },
      "ctrl": {
        "S": "Toggle sidebar",
        "D": "Pin tab",
        "L": "URL bar"
      }
    }
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
        "M": "Minimal window",
        "F": "Fullscreen",
        "R": "Local recording",
        "N": "Switch camera",
        "W": "Switch view",
        "T": "Pause screen share",
        "C": "Cloud recording",
        "P": "Pause recording",
        "I": "Copy invite link",
        "D": "Dual monitor",
        "Y": "Reactions panel",
        "U": "Focus latest message",
        "E": "Focus chat input",
        "L": "Focus chat list",
        "O": "AI chat panel",
        "J": "Calendar panel"
      },
      "cmd-ctrl": {
        "V": "Start meeting",
        "S": "Direct share",
        "M": "Mute all",
        "U": "Unmute all",
        "N": "Jump to new messages"
      },
      "cmd-opt": {
        "0": "Collapse all",
        "4": "Clap reaction",
        "5": "Thumbs up reaction",
        "6": "Heart reaction",
        "7": "Joy reaction",
        "8": "Wow reaction",
        "9": "Tada reaction",
        "I": "Add chat member"
      }
    },
    "win": {
      "ctrl-shift": {
        "A": "Accept call",
        "H": "Hold call",
        "E": "End call",
        "D": "Decline call",
        "M": "Mute call",
        "T": "Transfer call",
        "U": "Focus latest message",
        "N": "Jump to unread",
        "O": "AI chat panel",
        "Y": "Reactions panel",
        "J": "Calendar panel"
      },
      "ctrl-alt": {
        "I": "Add chat member"
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
        "N": "New playlist",
        "K": "Open search"
      },
      "cmd-shift": {
        "Left": "Seek backward",
        "Right": "Seek forward",
        "Down": "Vol down",
        "Up": "Vol up",
        "W": "Close",
        "L": "Go to search",
        "N": "New folder"
      },
      "cmd-opt": {
        "F": "Search library"
      }
    },
    "win": {
      "ctrl": {
        "L": "Search",
        "N": "New playlist",
        "K": "Open search",
        "S": "Shuffle",
        "R": "Repeat"
      },
      "ctrl-shift": {
        "Left": "Seek backward",
        "Right": "Seek forward",
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
        ",": "Configure extension"
      },
      "cmd-ctrl": {}
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
        "X": "Browser extension pop-up",
        "Space": "Quick Access (some Macs)",
        "L": "Lock 1Password (global)",
        "C": "Copy password",
        "F": "Open & fill login",
        "D": "Toggle sidebar",
        "O": "Open item in app"
      },
      "cmd-opt": {
        "\\": "Quick Access (global)",
        "C": "Copy one-time password",
        "F": "Find in list"
      },
      "cmd-ctrl-shift": {
        "C": "Copy OTP (extension)"
      }
    },
    "win": {
      "ctrl": {
        "\\": "Fill in browser (global)"
      },
      "ctrl-shift": {
        "X": "Browser extension pop-up",
        "L": "Lock 1Password (global)",
        "C": "Copy password",
        "F": "Open & fill login",
        "D": "Toggle sidebar",
        "O": "Open item in app",
        "/": "View shortcuts"
      },
      "ctrl-alt": {
        "C": "Copy one-time password",
        "F": "Find in list"
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
        "F": "Search in all files",
        "T": "Reopen closed tab",
        "V": "Paste as plain text",
        "K": "Delete line"
      },
      "cmd-opt": {
        "Left": "Navigate back",
        "Right": "Navigate forward",
        "F": "Replace in file",
        "I": "Developer tools"
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
        "F": "Search in all files",
        "T": "Reopen closed tab",
        "V": "Paste as plain text",
        "K": "Delete line",
        "I": "Developer tools"
      },
      "ctrl-alt": {
        "Left": "Navigate back",
        "Right": "Navigate forward"
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
        "Y": "History library"
      },
      "cmd-shift": {
        "T": "Reopen tab",
        "H": "History sidebar",
        "D": "Bookmark all tabs",
        "B": "Bookmarks toolbar",
        "R": "Hard reload",
        "O": "Bookmarks library",
        "P": "Private window",
        "N": "Reopen window",
        "A": "Search tabs",
        "S": "Screenshot",
        "E": "Add-ons",
        "W": "Close window",
        "Delete": "Clear history"
      },
      "cmd-opt": {
        "I": "DevTools",
        "K": "Web Console",
        "J": "Browser Console",
        "Z": "Debugger",
        "R": "Reader view",
        "F": "Focus search",
        "U": "View source",
        "C": "Pick element",
        "E": "Network monitor",
        "M": "Responsive design"
      },
      "cmd-ctrl": {
        "F": "Fullscreen"
      },
      "cmd-ctrl-shift": {}
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
        "B": "Bookmarks toolbar",
        "M": "Responsive design mode",
        "O": "Bookmarks library",
        "H": "History library",
        "A": "Search tabs",
        "S": "Screenshot",
        "F": "Add-ons",
        "N": "Reopen window",
        "W": "Close window",
        "R": "Hard reload",
        "Q": "Quit Firefox",
        "Delete": "Clear history",
        "C": "Pick element",
        "E": "Network monitor",
        "Z": "Debugger"
      },
      "ctrl-alt": {
        "Z": "Toggle sidebar",
        "X": "AI chatbot sidebar",
        "U": "Open tabs sidebar"
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
        "U": "Upload file",
        "T": "Create group DM",
        "H": "Get help"
      },
      "cmd-opt": {
        "Up": "Previous server",
        "Down": "Next server",
        "A": "Return to voice"
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
        "U": "Upload file",
        "T": "Create group DM",
        "H": "Get help"
      },
      "ctrl-alt": {
        "Up": "Previous server",
        "Down": "Next server",
        "A": "Return to voice"
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
        "7": "Numbered list",
        "8": "Bulleted list",
        "9": "Quote",
        "O": "To field",
        "C": "CC field",
        "B": "BCC field",
        "F": "From field",
        "S": "Edit subject",
        "A": "Insert free times",
        "U": "Attach file",
        "M": "Team comment",
        ",": "Discard draft",
        "H": "Remind me",
        "I": "Instant intro",
        "L": "Send later",
        "X": "Strikethrough",
        "]": "Next tab",
        "[": "Previous tab",
        "=": "Next day",
        "-": "Previous day"
      }
    },
    "win": {
      "ctrl": {
        "K": "Superhuman Command",
        "/": "Search"
      },
      "ctrl-shift": {
        "7": "Numbered list",
        "8": "Bulleted list",
        "9": "Quote",
        "O": "To field",
        "C": "CC field",
        "B": "BCC field",
        "F": "From field",
        "S": "Edit subject",
        "A": "Insert free times",
        "U": "Attach file",
        "M": "Team comment",
        ",": "Discard draft",
        "H": "Remind me",
        "I": "Instant intro",
        "L": "Send later",
        "X": "Strikethrough",
        "]": "Next tab",
        "[": "Previous tab"
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
        "K": "Clear to start",
        "L": "Clear to previous mark"
      },
      "cmd-shift": {
        "D": "Close split pane",
        "I": "Edit title",
        "M": "Insert bookmark",
        "T": "Show tab bar",
        "\\": "Tab overview",
        "N": "New command",
        "K": "New remote connection",
        "W": "Close window",
        "U": "Unmark",
        "V": "Paste selection",
        "A": "Select between marks",
        "C": "Show colors",
        "Return": "Return without mark",
        "Up": "Hide alternate screen",
        "Down": "Show alternate screen"
      },
      "cmd-ctrl": {
        "N": "New window, same command",
        "T": "New tab, same command",
        "V": "Paste escaped text",
        "F": "Full screen"
      },
      "cmd-ctrl-shift": {
        "C": "Copy without colors",
        "V": "Paste escaped selection",
        "/": "Open man page"
      },
      "cmd-opt": {
        "W": "Close other tabs",
        "I": "Background color",
        "U": "Mark as bookmark",
        "L": "Clear to bookmark",
        "R": "Soft reset",
        "O": "Option as Meta",
        "Up": "Previous bookmark",
        "Down": "Next bookmark"
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
        "J": "Jump to mark",
        "H": "Paste history",
        "O": "Open quickly",
        ";": "Command history",
        "Up": "Previous mark",
        "Down": "Next mark"
      },
      "cmd-opt": {
        "1": "Go to window 1",
        "2": "Go to window 2",
        "3": "Go to window 3",
        "4": "Go to window 4",
        "5": "Go to window 5",
        "6": "Go to window 6",
        "7": "Go to window 7",
        "8": "Go to window 8",
        "9": "Go to window 9",
        "Up": "Navigate up pane",
        "Down": "Navigate down pane",
        "Left": "Navigate left pane",
        "Right": "Navigate right pane",
        "B": "Instant replay",
        "/": "Recent directories",
        "A": "Alert on next mark",
        "G": "Floating note"
      }
    },
    "win": {}
  },
  {
    "id": "warp",
    "name": "Warp",
    "platforms": [
      "mac",
      "win"
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
        "K": "Clear selected lines",
        "I": "Reinput as root",
        "S": "Share block",
        "G": "Find previous",
        "[": "Previous tab",
        "]": "Next tab",
        "Up": "Scroll to block top",
        "Down": "Scroll to block bottom"
      },
      "cmd-opt": {
        "Up": "Switch pane up",
        "Down": "Switch pane down",
        "Left": "Switch pane left",
        "Right": "Switch pane right",
        "F": "Fold selected ranges",
        "[": "Fold",
        "]": "Unfold"
      },
      "cmd-ctrl": {
        "K": "Keybindings editor",
        "L": "Launch config palette",
        "T": "Theme picker",
        "Left": "Resize pane",
        "Right": "Resize pane",
        "Up": "Resize pane",
        "Down": "Resize pane"
      }
    },
    "win": {
      "ctrl-shift": {
        "D": "Split right",
        "E": "Split down",
        "Return": "Maximize pane",
        "P": "Command palette",
        "R": "Workflows",
        "L": "Focus input",
        "\\": "Warp Drive",
        "A": "Select all blocks",
        "K": "Clear blocks",
        "B": "Bookmark block",
        "I": "Reinput commands",
        "C": "Copy",
        "V": "Paste",
        "F": "Find",
        "S": "Share block",
        "T": "New tab",
        "[": "Previous pane",
        "]": "Next pane",
        "/": "Resource center"
      },
      "ctrl-alt": {
        "T": "Reopen closed tab",
        "F": "Fold",
        "[": "Fold",
        "]": "Unfold",
        "Left": "Switch panes",
        "Right": "Switch panes",
        "Up": "Switch panes",
        "Down": "Switch panes"
      }
    }
  }
];
