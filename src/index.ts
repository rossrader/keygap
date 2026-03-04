// ═══════════════════════════════════════════════════════════════════
// KeyGap — keyboard shortcut availability tool
//
// One file. Serves a keyboard visualizer to browsers, an MCP API to
// AI assistants, from the same shortcut database.
//
// Structure:
//   1. Imports
//   2. Types
//   3. Data (modifier combos, apps, all keys)
//   4. Data helpers
//   5. MCP helpers (key status, ergo ranking)
//   6. MCP server setup (3 tools)
//   7. HTML serving
//   8. Worker export (routing)
// ═══════════════════════════════════════════════════════════════════

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import htmlTemplate from '../keygap.html';

// ─── Types ───────────────────────────────────────────────────────

type Platform = 'mac' | 'win';

interface ModifierCombo {
  id: string;
  tabLabel: string;
  mods: string[];
  ergo: string;
  taken: Record<string, string>;
  risky: Record<string, string>;
}

interface AppShortcuts {
  id: string;
  name: string;
  color: string;
  icon: string;
  platforms: Platform[];
  mac: Record<string, Record<string, string>>;
  win: Record<string, Record<string, string>>;
}

type KeyStatus = 'available' | 'taken' | 'risky' | 'app-claimed';

interface KeyResult {
  key: string;
  status: KeyStatus;
  reason?: string;
  claimed_by?: string;
}

// ─── Modifier combos — macOS ────────────────────────────────────

const macCombos: ModifierCombo[] = [
  {
    id:'cmd', tabLabel:'⌘', mods:['cmd'],
    ergo:'Easiest combo, but nearly everything is taken by macOS or universal app conventions.',
    taken:{A:'Select All',B:'Bold',C:'Copy',D:'Bookmark/Define',E:'Search field',F:'Find',G:'Find Next',H:'Hide (system)',I:'Italic',J:'Smart quotes (some)',K:'Insert link',L:'Address bar',M:'Minimize (system)',N:'New',O:'Open',P:'Print',Q:'Quit (system)',R:'Refresh',S:'Save',T:'New tab',U:'Underline',V:'Paste',W:'Close (system)',X:'Cut',Z:'Undo','1':'Tab 1','2':'Tab 2','3':'Tab 3','4':'Tab 4','5':'Tab 5','6':'Tab 6','7':'Tab 7','8':'Tab 8','9':'Tab 9','0':'Zoom reset','`':'Cycle windows',',':'Preferences (system)','.':'Stop/Cancel','/':'Help menu','-':'Zoom out','=':'Zoom in','[':'Back (browsers)',']':'Forward (browsers)',Tab:'App Switcher (system)',Space:'Quick Look',Delete:'Move to Trash',Return:'Open/Confirm',Left:'Back',Right:'Forward',F1:'Show Help',F3:'Mission Control',F4:'Launchpad',F11:'Show Desktop'},
    risky:{Y:'Redo (some)',';':'Spellcheck (some)',"'":"Smart quotes (Pages)",'\\':'Rarely used',Up:'Scroll top (some)',Down:'Scroll bottom (some)',Esc:'Front app menu',F7:'Media rewind',F8:'Play/Pause',F9:'Media forward'},
  },
  {
    id:'cmd-shift', tabLabel:'⌘⇧', mods:['cmd','shift'],
    ergo:'Easy to press. Some free slots, but browsers and productivity apps claim many.',
    taken:{A:'Applications (Finder)',C:'Colors panel',D:'Desktop (Finder)',F:'Full search',G:'Find Previous',H:'Home (browsers)',I:'Inspect/Mail',L:'Downloads (Finder)',N:'New folder/Incognito',O:'Outline (some)',P:'Page Setup/Private',S:'Save As/Duplicate',T:'Reopen closed tab',V:'Paste & Match Style',Z:'Redo','3':'Screenshot (full)','4':'Screenshot (area)','5':'Screenshot options',Delete:'Empty Trash (Finder)','/':'Help (system)','=':'Zoom in (some)','-':'Zoom out (some)','[':'Prev tab (browsers)',']':'Next tab (browsers)'},
    risky:{B:'Bookmarks bar (browsers)',E:'Sources (DevTools)',K:'Block quote/links',M:'Mute (Slack/Zoom)',R:'Hard reload (browsers)',X:'Strikethrough',J:'Downloads (Chrome)',U:'Uploads (some)','1':'View mode (some)','2':'View mode (some)','\\':'Rarely claimed'},
  },
  {
    id:'cmd-opt', tabLabel:'⌘⌥', mods:['cmd','opt'],
    ergo:'Good ergonomics — left thumb on ⌘, left ring on ⌥. Many open slots.',
    taken:{D:'Toggle Dock (system)',H:'Hide Others (system)',Esc:'Force Quit (system)',F:'Find & Replace (many)'},
    risky:{A:'Activity Monitor (some)',C:'Console (DevTools)',I:'DevTools (Chrome)',J:'Downloads (Chrome)',L:'Reformat (IDEs)',S:'Save As (some)',T:'Toolbar toggle',U:'View Source (browsers)',V:'Paste special','1':'Reader (Safari)','2':'History (Safari)',Left:'Switch tabs (some)',Right:'Switch tabs (some)','-':'Zoom out (some)','=':'Zoom in (some)'},
  },
  {
    id:'cmd-ctrl', tabLabel:'⌘⌃', mods:['cmd','ctrl'],
    ergo:'★ The sweet spot — almost entirely free. Left thumb on ⌘, left pinky on ⌃.',
    taken:{F:'Fullscreen (system)',Q:'Lock Screen (system)',Space:'Emoji Picker (system)'},
    risky:{D:'Definition popup (some)',R:'Recording (OBS/QuickTime)',M:'Mute (rare)'},
  },
  {
    id:'cmd-ctrl-shift', tabLabel:'⌘⌃⇧', mods:['cmd','ctrl','shift'],
    ergo:'Nearly everything open. Ergonomically heavy — three modifiers required.',
    taken:{'3':'Screenshot → clipboard','4':'Screenshot → clipboard'},
    risky:{'5':'Screenshot → clipboard (some)'},
  },
];

// ─── Modifier combos — Windows ──────────────────────────────────

const winCombos: ModifierCombo[] = [
  {
    id:'win', tabLabel:'Win', mods:['win'],
    ergo:'Microsoft has claimed almost every letter here for OS features. The greediest modifier on either platform.',
    taken:{A:'Action Center',B:'Taskbar focus (some)',C:'Chat/Copilot',D:'Show Desktop',E:'File Explorer',F:'Feedback Hub',G:'Game Bar',H:'Dictation',I:'Settings',K:'Bluetooth Connect',L:'Lock Screen',M:'Minimize All',N:'Notifications',P:'Project/Display',Q:'Quick Settings',R:'Run',S:'Search',T:'Cycle taskbar apps',U:'Accessibility',V:'Clipboard History',W:'Widgets',X:'Power User Menu',Z:'Snap Layouts','1':'Taskbar app 1','2':'Taskbar app 2','3':'Taskbar app 3','4':'Taskbar app 4','5':'Taskbar app 5','6':'Taskbar app 6','7':'Taskbar app 7','8':'Taskbar app 8','9':'Taskbar app 9','0':'Taskbar app 10',Tab:'Task View',Space:'Input language',Left:'Snap left',Right:'Snap right',Up:'Maximize',Down:'Restore/Minimize',',':'Peek at desktop','.':'Emoji panel',';':'Emoji panel (alt)','=':'Magnifier zoom in','-':'Magnifier zoom out',Esc:'Magnifier off',Return:'Narrator',F4:'Close virtual desktop'},
    risky:{Y:'Rarely used',O:'Rotate (tablet)',J:'Focus Windows (some)','`':'Cycle windows (some)'},
  },
  {
    id:'ctrl', tabLabel:'Ctrl', mods:['ctrl'],
    ergo:'The primary modifier — equivalent to ⌘ on Mac. Almost entirely claimed.',
    taken:{A:'Select All',B:'Bold',C:'Copy',D:'Bookmark/Address',E:'Search',F:'Find',G:'Find Next',H:'Replace',I:'Italic',K:'Insert link',L:'Address bar (browsers)',N:'New',O:'Open',P:'Print',R:'Refresh',S:'Save',T:'New tab',U:'Underline',V:'Paste',W:'Close tab',X:'Cut',Y:'Redo',Z:'Undo','1':'Tab 1','2':'Tab 2','3':'Tab 3','4':'Tab 4','5':'Tab 5','6':'Tab 6','7':'Tab 7','8':'Tab 8','9':'Last tab','0':'Tab 10/Zoom reset',Tab:'Switch window (some)','=':'Zoom in','-':'Zoom out','[':'Back',']':'Forward','/':'Help (some)',F4:'Close window',F5:'Refresh'},
    risky:{J:'Downloads (browsers)',M:'Mute (some)','`':'Tab cycle (some)',';':'Spellcheck (some)',Delete:'Delete word',Esc:'Start menu',F1:'Help',F11:'Fullscreen',F12:'DevTools'},
  },
  {
    id:'ctrl-shift', tabLabel:'Ctrl+Shift', mods:['ctrl','shift'],
    ergo:'Easy reach. More open than Ctrl alone, but apps claim a fair number.',
    taken:{N:'New incognito/window',T:'Reopen closed tab',Z:'Redo (alt)',Tab:'Switch tabs back',Esc:'Task Manager','=':'Zoom in (some)','-':'Zoom out (some)','[':'Prev tab',']':'Next tab',Delete:'Clear browsing (browsers)'},
    risky:{B:'Bookmarks bar (browsers)',E:'Explorer/Sources',J:'Downloads (Chrome)',K:'Links/Block quote',M:'Mute (Slack/Zoom)',P:'Command palette (VS Code)',S:'Save As (some)',V:'Paste special',F:'Search in files (IDEs)',I:'DevTools (Chrome)',X:'Extensions (VS Code)'},
  },
  {
    id:'ctrl-alt', tabLabel:'Ctrl+Alt', mods:['ctrl','alt'],
    ergo:'Good availability. Note: some languages use Ctrl+Alt as AltGr for special characters.',
    taken:{Delete:'Security screen (Ctrl+Alt+Del)'},
    risky:{T:'Terminal (Linux habit)',F:'Find & Replace (some)',Tab:'Switch via preview',L:'Lock (some configs)'},
  },
  {
    id:'win-ctrl', tabLabel:'Win+Ctrl', mods:['win','ctrl'],
    ergo:'★ The sweet spot on Windows — very few system claims.',
    taken:{D:'New virtual desktop',F4:'Close virtual desktop',Left:'Switch desktop left',Right:'Switch desktop right'},
    risky:{F:'Feedback Hub'},
  },
  {
    id:'win-shift', tabLabel:'Win+Shift', mods:['win','shift'],
    ergo:'Lightly claimed by Windows. Good ergonomics.',
    taken:{S:'Screenshot Snipping (system)',Left:'Move window to left monitor',Right:'Move window to right monitor'},
    risky:{V:'Clipboard history (some builds)'},
  },
];

// ─── App definitions ────────────────────────────────────────────

const apps: AppShortcuts[] = [
  {
    id: 'chrome', name: 'Chrome', color: '#4285f4', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" fill="white"/><circle cx="12" cy="12" r="3" fill="#4285f4"/><path d="M12 7.5A4.5 4.5 0 0 1 16.1 10H23a11 11 0 0 0-19.4-3.5L7.4 13A4.5 4.5 0 0 1 12 7.5z" fill="#ea4335"/><path d="M7.4 13A4.5 4.5 0 0 0 12 16.5l-3.8 6.6A11 11 0 0 1 1 10h6.9a4.5 4.5 0 0 0-.5 3z" fill="#34a853"/><path d="M12 16.5a4.5 4.5 0 0 0 4.1-2.5l3.8 6.5A11 11 0 0 1 8.2 23.1L12 16.5z" fill="#fbbc05"/></svg>`,
    mac: {
      'cmd':{Y:'History',D:'Bookmark',L:'Address bar'},
      'cmd-shift':{B:'Bookmarks bar',J:'Downloads',N:'Incognito',T:'Reopen tab',M:'Switch profile',Delete:'Clear data',W:'Close window'},
      'cmd-opt':{I:'DevTools',J:'JS Console',U:'View source',C:'Console',B:'Bookmark mgr'},
      'cmd-ctrl':{F:'Fullscreen'},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{Y:'History',D:'Bookmark',L:'Address bar',J:'Downloads',H:'History'},
      'ctrl-shift':{B:'Bookmarks bar',J:'Downloads',N:'Incognito',T:'Reopen tab',M:'Switch profile',Delete:'Clear data',W:'Close window',I:'DevTools'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'slack', name: 'Slack', color: '#611f69', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M6.5 2a2 2 0 0 0 0 4h2V4a2 2 0 0 0-2-2zM2 8.5a2 2 0 0 0 4 0v-2H4a2 2 0 0 0-2 2zm15.5-2a2 2 0 0 0 0-4h-2v2a2 2 0 0 0 2 2zM13.5 2a2 2 0 0 0-4 0v2h2a2 2 0 0 0 2-2zM22 8.5a2 2 0 0 0-4 0v2h2a2 2 0 0 0 2-2zm-4 9a2 2 0 0 0 4 0v-2h-2a2 2 0 0 0-2 2zM2 15.5a2 2 0 0 0 4 0v-2H4a2 2 0 0 0-2 2zm8.5 6.5a2 2 0 0 0 0-4h-2v2a2 2 0 0 0 2 2zm6-4a2 2 0 0 0-4 0v2h2a2 2 0 0 0 2-2z" opacity="0.9"/></svg>`,
    mac: {
      'cmd':{K:'Quick switcher','/':'Keyboard shortcuts',U:'Upload file'},
      'cmd-shift':{K:'Browse DMs',M:'Mentions & reactions',A:'All Unreads',Y:'Set status',D:'Do Not Disturb',Return:'Snippet','\\':'Toggle sidebar',T:'Threads',F:'Search in convo'},
      'cmd-opt':{Right:'Next channel',Left:'Prev channel',Up:'Next unread',Down:'Prev unread'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{K:'Quick switcher','/':'Keyboard shortcuts',U:'Upload file'},
      'ctrl-shift':{K:'Browse DMs',M:'Mentions & reactions',A:'All Unreads',Y:'Set status',D:'DND',Return:'Snippet','\\':'Toggle sidebar',T:'Threads',F:'Search in convo'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'vscode', name: 'VS Code', color: '#0078d4', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M17.5 1L7 11.5l-4-3.2L1 9.5v5l2 1.2 4-3.2L17.5 23l5.5-2.5V3.5L17.5 1zM5 12l2.5-2L5 8v4zm12.5 6.5L10 12l7.5-6.5v13z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{B:'Toggle sidebar',J:'Toggle terminal','\\':'Split editor',K:'Chord prefix'},
      'cmd-shift':{P:'Cmd palette',E:'Explorer',F:'Search files',G:'Source control',X:'Extensions',D:'Debug',H:'Replace in files',U:'Output',Y:'Debug console',K:'Delete line',L:'Select all occ.',M:'Problems',B:'Sidebar','`':'New terminal',N:'New window',O:'Open folder'},
      'cmd-opt':{F:'Find & Replace','[':'Fold',']':'Unfold',K:'Keyboard shortcuts',Left:'Move editor left',Right:'Move editor right',B:'Breadcrumbs'},
      'cmd-ctrl':{Left:'Editor to prev group',Right:'Editor to next group'},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{B:'Toggle sidebar',J:'Toggle terminal','\\':'Split editor',K:'Chord prefix','`':'Terminal'},
      'ctrl-shift':{P:'Cmd palette',E:'Explorer',F:'Search files',G:'Source control',X:'Extensions',D:'Debug',H:'Replace in files',U:'Output',Y:'Debug console',K:'Delete line',L:'Select all occ.',M:'Problems',B:'Sidebar','`':'New terminal',N:'New window',O:'Open folder'},
      'ctrl-alt':{F:'Find & Replace','[':'Fold',']':'Unfold',Left:'Move editor left',Right:'Move editor right'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'figma', name: 'Figma', color: '#a259ff', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M8 2a4 4 0 0 0 0 8h4V2H8z" fill="#f24e1e"/><path d="M12 2h4a4 4 0 0 1 0 8h-4V2z" fill="#ff7262"/><path d="M8 10a4 4 0 0 0 0 8h4v-8H8z" fill="#a259ff"/><path d="M16 10a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#1abcfe"/><path d="M8 18a4 4 0 0 0 0 8h4v-8H8z" fill="#0acf83" opacity="0.9"/></svg>`,
    mac: {
      'cmd':{'\\':'Toggle UI',R:'Rename','/':'Quick actions',G:'Group',D:'Duplicate'},
      'cmd-shift':{E:'Export',G:'Ungroup',H:'Flip horizontal',V:'Flip vertical',K:'Place image',O:'Outline stroke',L:'Lock layer','\\':'Layers',C:'Copy CSS',B:'Bold',R:'Rulers'},
      'cmd-opt':{G:'Frame selection',C:'Copy SVG',T:'Pixel grid',P:'Pixel preview'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{E:'Export selection'},
    },
    win: {
      'win':{},
      'ctrl':{'\\':'Toggle UI',R:'Rename','/':'Quick actions',G:'Group',D:'Duplicate'},
      'ctrl-shift':{E:'Export',G:'Ungroup',H:'Flip horiz.',V:'Flip vert.',K:'Place image',O:'Outline stroke',L:'Lock layer','\\':'Layers',C:'Copy CSS',B:'Bold',R:'Rulers'},
      'ctrl-alt':{G:'Frame selection',C:'Copy SVG',T:'Pixel grid',P:'Pixel preview'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'linear', name: 'Linear', color: '#5e6ad2', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M3.3 14.4a10.5 10.5 0 0 0 6.3 6.3L3.3 14.4zm-.9-2.2A10.5 10.5 0 0 0 12 21.8L2.2 12zm.2-2.1l12.3 12.3a10.5 10.5 0 0 0 2.8-1.5L3.5 6.7A10.5 10.5 0 0 0 2 9.5l.6.6zm2.5-4.5L19.4 19.9a10.5 10.5 0 0 0 1.7-2.1L7.3 4a10.5 10.5 0 0 0-2.2 1.6zm4-2.3l12.6 12.6a10.5 10.5 0 0 0 .8-2.7L11.8 3.1c-.9.1-1.8.3-2.7.6l.1-.4zm4.8-.9l8 8a10.5 10.5 0 0 0-1.6-4.7L15.6 3a10.5 10.5 0 0 0-2.7-.2l.7.6zm4.7 1.8l3.4 3.4A10.5 10.5 0 0 0 18 3.3l-.5 1z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{K:'Command menu','.':'Change status'},
      'cmd-shift':{C:'Copy issue ID','.':'Cycle status',',':'Cycle back',A:'Assign to me',P:'Priority',L:'Label',E:'Estimate',D:'Due date'},
      'cmd-opt':{},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{K:'Command menu','.':'Change status'},
      'ctrl-shift':{C:'Copy issue ID','.':'Cycle status',',':'Cycle back',A:'Assign to me',P:'Priority',L:'Label',E:'Estimate',D:'Due date'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'notion', name: 'Notion', color: '#2d2d2d', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M4.5 3.5L16.7 2l3.8.8c.5.3.5.6.2 1L19 5.2V19l-2.3 1.5c-.7.4-1 .4-1.7 0L6 15.5v5.2c0 .8-.3 1.2-1 1.3l-2.5-.3c-.6-.3-.7-.7-.7-1.3V5c0-.7.3-1.2 1-1.4l1.7-.1zm2.3 2.2v9l6.5 4V9.5l-6.5-3.8z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{E:'Inline code','/':'Commands','[':'Outdent',']':'Indent'},
      'cmd-shift':{L:'Dark mode',H:'Highlight',M:'Comment',E:'Emoji',U:'Move up',D:'Move down','0':'Plain text','1':'H1','2':'H2','3':'H3','4':'Todo','5':'Bullets','6':'Numbers','7':'Toggle','8':'Code block','9':'New page',J:'Full page'},
      'cmd-opt':{'1':'H1','2':'H2','3':'H3','4':'Todo','5':'H1','8':'Code','9':'Page link'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{E:'Inline code','/':'Commands','[':'Outdent',']':'Indent'},
      'ctrl-shift':{L:'Dark mode',H:'Highlight',M:'Comment',E:'Emoji',U:'Move up',D:'Move down','0':'Plain text','1':'H1','2':'H2','3':'H3','4':'Todo','5':'Bullets','6':'Numbers','7':'Toggle','8':'Code block','9':'New page',J:'Full page'},
      'ctrl-alt':{'1':'H1','2':'H2','3':'H3','4':'Todo','5':'H1','8':'Code','9':'Page link'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'arc', name: 'Arc', color: '#4a90d9', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" stroke="white" stroke-width="3.5" stroke-linecap="round" opacity="0.95"/><circle cx="20" cy="5" r="2.5" fill="white" opacity="0.8"/></svg>`,
    mac: {
      'cmd':{D:'Pin tab',S:'Save to library',L:'URL bar'},
      'cmd-shift':{C:'Copy clean URL',D:'Toggle sidebar',N:'Incognito',E:'Sidebar view',T:'Reopen tab',R:'Hard refresh'},
      'cmd-opt':{N:'Little Arc window',I:'DevTools',R:'Force refresh'},
      'cmd-ctrl':{N:'New window'},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: 'zoom', name: 'Zoom', color: '#2d8cff', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><rect x="2" y="5" width="14" height="14" rx="3" fill="white" opacity="0.95"/><path d="M18 9l4-3v12l-4-3V9z" fill="white" opacity="0.8"/></svg>`,
    mac: {
      'cmd':{J:'Join meeting'},
      'cmd-shift':{A:'Mute audio',V:'Start/stop video',S:'Screen share',H:'Chat',M:'Minimize',F:'Fullscreen',R:'Record',N:'Switch camera',W:'Gallery view',T:'Transfer'},
      'cmd-opt':{},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{},
      'ctrl-shift':{A:'Mute audio',V:'Start/stop video',S:'Screen share',H:'Chat',F:'Fullscreen',R:'Record',W:'Gallery view'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'spotify', name: 'Spotify', color: '#1db954', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 14.5c-.2.3-.5.4-.8.2-2.2-1.3-5-1.6-8.3-.9-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 3.6-.8 6.7-.5 9.1 1 .3.2.4.6.3.8zm1.2-2.8c-.25.4-.7.5-1 .3-2.5-1.5-6.3-2-9.3-1.1-.4.1-.8-.1-.9-.4-.1-.4.1-.8.4-.9 3.4-1 7.5-.5 10.4 1.2.3.2.5.6.4.9zm.1-2.9C14.7 9 9 8.8 5.8 9.7c-.45.1-.9-.1-1.1-.6-.1-.5.1-.9.6-1.1C9 7 15.3 7.2 19.3 9.2c.4.2.6.8.3 1.2-.2.4-.7.6-1.1.4z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{L:'Search',N:'New playlist'},
      'cmd-shift':{Left:'Prev track',Right:'Next track',Down:'Vol down',Up:'Vol up',W:'Close'},
      'cmd-opt':{},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{L:'Search',N:'New playlist'},
      'ctrl-shift':{Left:'Prev track',Right:'Next track',Down:'Vol down',Up:'Vol up',W:'Close'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'raycast', name: 'Raycast', color: '#ff6363', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 17.5L2 22M8.5 15.5l-4 4M12 15l-3 3M15 12l-3 3M15.5 8.5l-4 4M17.5 6.5l-4 4M22 2l-4.5 4.5" stroke="white" stroke-width="2.2" stroke-linecap="round" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{Space:'Raycast (global hotkey)'},
      'cmd-shift':{'.':'Clipboard history (global)',',':'Raycast settings',C:'Confetti (global)',V:'Clipboard paste (global)'},
      'cmd-opt':{},
      'cmd-ctrl':{N:'Floating notes (global)',R:'AI chat (global)',Space:'Window mgmt (some configs)'},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: '1password', name: '1Password', color: '#0572ec', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2.2"/><rect x="9" y="8" width="6" height="8" rx="3" fill="none" stroke="white" stroke-width="2"/><line x1="12" y1="12" x2="12" y2="14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
    mac: {
      'cmd':{'\\':'Autofill (global)'},
      'cmd-shift':{X:'Lock 1Password (global)',Space:'Quick Access (global)',L:'Lock (in app)'},
      'cmd-opt':{'\\':'Fill & save (global)'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{'\\':'Autofill (global)'},
      'ctrl-shift':{X:'Lock 1Password (global)',Space:'Quick Access (global)',L:'Lock (in app)'},
      'ctrl-alt':{'\\':'Fill & save (global)'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'obsidian', name: 'Obsidian', color: '#7c3aed', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12.6 2.4l6.4 3.6c.3.2.5.5.6.8l.4 7.4c0 .3-.1.6-.3.9l-4.6 5.8c-.2.3-.6.5-1 .5l-5.2-.3c-.3 0-.6-.2-.8-.4L4.4 15c-.2-.3-.3-.6-.2-1l1.6-7.2c.1-.3.3-.6.6-.8L12 2.4c.2-.1.4-.1.6 0z" fill="white" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{E:'Toggle edit/preview',P:'Command palette',O:'Quick open',',':'Settings',B:'Bold',I:'Italic',K:'Insert link',L:'Toggle checkbox',D:'Delete paragraph','/':'Toggle comment'},
      'cmd-shift':{F:'Search & replace in files',D:'Create daily note',E:'Export PDF'},
      'cmd-opt':{Left:'Navigate back',Right:'Navigate forward',F:'Toggle search'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{E:'Toggle edit/preview',P:'Command palette',O:'Quick open',',':'Settings',B:'Bold',I:'Italic',K:'Insert link',L:'Toggle checkbox',D:'Delete paragraph','/':'Toggle comment'},
      'ctrl-shift':{F:'Search & replace in files',D:'Create daily note',E:'Export PDF'},
      'ctrl-alt':{Left:'Navigate back',Right:'Navigate forward',F:'Toggle search'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'terminal', name: 'Terminal', color: '#2e3436', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 4l5 4-5 4m6 0h5" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    mac: {
      'cmd':{N:'New window',T:'New tab',D:'Split pane',K:'Clear to previous mark'},
      'cmd-shift':{D:'Close split pane',I:'Edit title',M:'Insert bookmark'},
      'cmd-opt':{},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: 'iterm', name: 'iTerm2', color: '#2bbc4a', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 4l5 4-5 4m6 0h5" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    mac: {
      'cmd':{D:'Split vertically',T:'New tab',N:'New window',K:'Clear buffer',W:'Close tab'},
      'cmd-shift':{D:'Split horizontally',Return:'Maximize pane',M:'Mark location',J:'Jump to mark'},
      'cmd-opt':{Up:'Navigate up pane',Down:'Navigate down pane',Left:'Navigate left pane',Right:'Navigate right pane'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: 'warp', name: 'Warp', color: '#01a4ff', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 4l5 4-5 4m6 0h5" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    mac: {
      'cmd':{D:'Split right',K:'Clear blocks',P:'Command palette',O:'File search','/':'Keyboard shortcuts',B:'Bookmark block'},
      'cmd-shift':{D:'Split down',Return:'Maximize pane',C:'Copy command',P:'Navigation palette',T:'Reopen closed tab',K:'Clear selected lines'},
      'cmd-opt':{Up:'Switch pane up',Down:'Switch pane down',Left:'Switch pane left',Right:'Switch pane right'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: 'firefox', name: 'Firefox', color: '#ff7139', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/><path d="M12 2c1.5 3 1 6-.5 8 2-1 4-1 5.5.5A8 8 0 0 1 12 20a8 8 0 0 1-7-12c1.5 2 3.5 3 5.5 2.5C9.5 8 10 5 12 2z" fill="white" opacity="0.9"/></svg>`,
    mac: {
      'cmd':{K:'Focus search box',L:'Address bar',D:'Bookmark page',B:'Bookmarks',H:'History'},
      'cmd-shift':{T:'Reopen tab',H:'History sidebar',D:'Bookmark all tabs',B:'Toggle sidebar',R:'Reader view','\\':'Tab overview'},
      'cmd-opt':{I:'DevTools',K:'Web Console',J:'Browser Console',Z:'Debugger',S:'Style Editor'},
      'cmd-ctrl':{F:'Fullscreen'},
      'cmd-ctrl-shift':{I:'Browser Toolbox'},
    },
    win: {
      'win':{},
      'ctrl':{K:'Focus search box',L:'Address bar',D:'Bookmark page',B:'Bookmarks',H:'History'},
      'ctrl-shift':{T:'Reopen tab',I:'DevTools',K:'Web Console',J:'Browser Console',P:'Private window',D:'Bookmark all tabs',B:'Toggle sidebar'},
      'ctrl-alt':{M:'Device Mode'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'safari', name: 'Safari', color: '#006cff', platforms: ['mac'],
    icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/><path d="M16.5 7.5l-2 7-7 2 2-7 7-2z" fill="white" opacity="0.9"/></svg>`,
    mac: {
      'cmd':{F:'Find on page',L:'Smart Search field'},
      'cmd-shift':{H:'Go to homepage',T:'Reopen last tab',D:'Add to Reading List',R:'Open Reader','\\':'Tab overview'},
      'cmd-opt':{},
      'cmd-ctrl':{'1':'Bookmarks sidebar','2':'Reading List sidebar'},
      'cmd-ctrl-shift':{},
    },
    win: {},
  },
  {
    id: 'discord', name: 'Discord', color: '#5865f2', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M20.3 4.7a18.6 18.6 0 0 0-4.6-1.4 12 12 0 0 0-.6 1.2 17.2 17.2 0 0 0-5.1 0A12 12 0 0 0 9.3 3.3a18.6 18.6 0 0 0-4.6 1.4C1.2 10 .3 15.2.8 20.3a18.8 18.8 0 0 0 5.7 2.9 14 14 0 0 0 1.2-1.9 12 12 0 0 1-1.9-.9l.5-.4a13.3 13.3 0 0 0 11.4 0l.5.4a12 12 0 0 1-1.9.9 14 14 0 0 0 1.2 1.9 18.8 18.8 0 0 0 5.7-2.9c.6-6-1-11.1-4.1-15.6zM8 17c-1.3 0-2.4-1.2-2.4-2.7S6.6 11.7 8 11.7s2.5 1.2 2.4 2.6c0 1.5-1.1 2.7-2.4 2.7zm8 0c-1.3 0-2.4-1.2-2.4-2.7S14.6 11.7 16 11.7s2.5 1.2 2.4 2.6c0 1.5-1 2.7-2.4 2.7z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{K:'Quick switcher',P:'Toggle pins',U:'Member list',E:'Emoji picker','/':'Keyboard shortcuts'},
      'cmd-shift':{N:'Create/join server',M:'Mute microphone',D:'Toggle deafen',U:'Upload file'},
      'cmd-opt':{Up:'Previous server',Down:'Next server'},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{K:'Quick switcher',F:'Search channel',E:'Emoji picker',U:'Member list','/':'Keyboard shortcuts'},
      'ctrl-shift':{N:'Create/join server',M:'Mute microphone',D:'Toggle deafen',U:'Upload file'},
      'ctrl-alt':{Up:'Previous server',Down:'Next server'},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
  {
    id: 'superhuman', name: 'Superhuman', color: '#7c5cfc', platforms: ['mac','win'],
    icon: `<svg viewBox="0 0 24 24" fill="white"><path d="M13 3l8 9-8 9-2-2 5.5-6H3v-2h13.5L11 5l2-2z" opacity="0.95"/></svg>`,
    mac: {
      'cmd':{K:'Superhuman Command','/':'Search'},
      'cmd-shift':{O:'To field',C:'CC field',B:'BCC field',F:'From field',S:'Edit subject',A:'Attach file'},
      'cmd-opt':{},
      'cmd-ctrl':{},
      'cmd-ctrl-shift':{},
    },
    win: {
      'win':{},
      'ctrl':{K:'Superhuman Command','/':'Search'},
      'ctrl-shift':{O:'To field',C:'CC field',B:'BCC field',F:'From field',S:'Edit subject',A:'Attach file'},
      'ctrl-alt':{},
      'win-ctrl':{},
      'win-shift':{},
    },
  },
];

// ─── All checkable keys ─────────────────────────────────────────

const ALL_KEYS: string[] = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '`','-','=','[',']','\\',';',"'",',','.','/',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'Tab','Space','Delete','Return','Esc','Left','Right','Up','Down',
];

// ─── Data helpers ───────────────────────────────────────────────

function getCombos(platform: Platform): ModifierCombo[] {
  return platform === 'mac' ? macCombos : winCombos;
}

function getComboById(platform: Platform, comboId: string): ModifierCombo | undefined {
  return getCombos(platform).find(c => c.id === comboId);
}

function getAppById(appId: string): AppShortcuts | undefined {
  return apps.find(a => a.id === appId);
}

// ─── MCP helpers ────────────────────────────────────────────────

function getKeyStatus(
  platform: Platform,
  combo: ModifierCombo,
  key: string,
  appIds: string[],
): KeyResult {
  const upperKey = key.toUpperCase();
  const matchKey = (record: Record<string, string>): string | undefined => {
    const found = Object.keys(record).find(k => k.toLowerCase() === key.toLowerCase());
    return found !== undefined ? record[found] : undefined;
  };

  // 1. OS-level taken
  const takenReason = matchKey(combo.taken);
  if (takenReason) {
    return { key, status: 'taken', reason: takenReason, claimed_by: 'OS' };
  }

  // 2. App claims
  for (const appId of appIds) {
    const app = getAppById(appId);
    if (!app) continue;
    const platformData = app[platform];
    if (!platformData) continue;
    const comboData = platformData[combo.id];
    if (!comboData) continue;
    const appReason = matchKey(comboData);
    if (appReason) {
      return { key, status: 'app-claimed', reason: appReason, claimed_by: app.name };
    }
  }

  // 3. OS-level risky
  const riskyReason = matchKey(combo.risky);
  if (riskyReason) {
    return { key, status: 'risky', reason: riskyReason };
  }

  return { key, status: 'available' };
}

// Suggestion ranking: lower = better for new shortcuts (availability × ergonomics).
// "Sweet spot" combos rank highest because they're mostly free AND comfortable.
const SUGGEST_RANK: Record<string, number> = {
  'cmd-ctrl': 0, 'cmd-opt': 1, 'cmd-shift': 2, 'cmd-ctrl-shift': 3, 'cmd': 4,
  'win-ctrl': 0, 'ctrl-alt': 1, 'win-shift': 2, 'ctrl-shift': 3, 'ctrl': 4, 'win': 5,
};

// ─── MCP server setup ──────────────────────────────────────────

const platformEnum = z.enum(['mac', 'win']);
const macComboIds = ['cmd', 'cmd-shift', 'cmd-opt', 'cmd-ctrl', 'cmd-ctrl-shift'] as const;
const winComboIds = ['win', 'ctrl', 'ctrl-shift', 'ctrl-alt', 'win-ctrl', 'win-shift'] as const;
const allComboIds = [...macComboIds, ...winComboIds] as const;
const appIdValues = apps.map(a => a.id);

function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'KeyGap', version: '1.0.0' });

  // ── get_available_keys ──
  server.tool(
    'get_available_keys',
    'Given a platform and modifier combo, return the status of every key (available, taken, risky, or app-claimed). Optionally filter by active apps.',
    {
      platform: platformEnum,
      modifier_combo: z.enum(allComboIds as unknown as [string, ...string[]]),
      apps: z.array(z.string()).optional().describe(`App IDs to check. Valid IDs: ${appIdValues.join(', ')}`),
    },
    async ({ platform, modifier_combo, apps: appIds }) => {
      const combo = getComboById(platform, modifier_combo);
      if (!combo) {
        const valid = getCombos(platform).map(c => c.id).join(', ');
        return { content: [{ type: 'text' as const, text: `Modifier combo "${modifier_combo}" is not valid for ${platform}. Valid combos: ${valid}` }] };
      }
      const results = ALL_KEYS.map(key => getKeyStatus(platform, combo, key, appIds ?? []));
      const available = results.filter(r => r.status === 'available');
      const taken = results.filter(r => r.status !== 'available');
      const text = [
        `## ${combo.tabLabel} on ${platform === 'mac' ? 'macOS' : 'Windows'}`,
        `_${combo.ergo}_`,
        '',
        `**${available.length} available keys:** ${available.map(r => r.key).join(', ')}`,
        '',
        taken.length > 0 ? '**Claimed keys:**' : '',
        ...taken.map(r => `- **${r.key}**: ${r.status}${r.claimed_by ? ` (${r.claimed_by})` : ''} — ${r.reason}`),
      ].join('\n');
      return { content: [{ type: 'text' as const, text }] };
    },
  );

  // ── check_key ──
  server.tool(
    'check_key',
    'Check whether a specific key combo is available on a given platform.',
    {
      platform: platformEnum,
      modifier_combo: z.enum(allComboIds as unknown as [string, ...string[]]),
      key: z.string().describe('The key to check, e.g. "K", "F5", "/"'),
      apps: z.array(z.string()).optional().describe(`App IDs to check. Valid IDs: ${appIdValues.join(', ')}`),
    },
    async ({ platform, modifier_combo, key, apps: appIds }) => {
      const combo = getComboById(platform, modifier_combo);
      if (!combo) {
        const valid = getCombos(platform).map(c => c.id).join(', ');
        return { content: [{ type: 'text' as const, text: `Modifier combo "${modifier_combo}" is not valid for ${platform}. Valid combos: ${valid}` }] };
      }
      const result = getKeyStatus(platform, combo, key, appIds ?? []);
      const parts = [`**${combo.tabLabel}+${key}** on ${platform === 'mac' ? 'macOS' : 'Windows'}: **${result.status}**`];
      if (result.reason) parts.push(`Reason: ${result.reason}`);
      if (result.claimed_by) parts.push(`Claimed by: ${result.claimed_by}`);
      return { content: [{ type: 'text' as const, text: parts.join('\n') }] };
    },
  );

  // ── suggest_hotkeys ──
  server.tool(
    'suggest_hotkeys',
    'Suggest the best available hotkey combos for a platform, ranked by ergonomics and fewest conflicts.',
    {
      platform: platformEnum,
      count: z.number().int().min(1).max(50).describe('How many hotkeys to suggest'),
      apps: z.array(z.string()).optional().describe(`App IDs to check. Valid IDs: ${appIdValues.join(', ')}`),
      preferred_modifier: z.enum(allComboIds as unknown as [string, ...string[]]).optional().describe('Preferred modifier combo ID'),
    },
    async ({ platform, count, apps: appIds, preferred_modifier }) => {
      const combos = getCombos(platform);
      const suggestions: Array<{ modifier_combo: string; key: string; modifier_label: string; ergo_rank: number; ergo: string; is_preferred: boolean }> = [];

      for (const combo of combos) {
        const ergoRank = SUGGEST_RANK[combo.id] ?? 99;
        for (const key of ALL_KEYS) {
          const result = getKeyStatus(platform, combo, key, appIds ?? []);
          if (result.status === 'available') {
            suggestions.push({
              modifier_combo: combo.id,
              key,
              modifier_label: combo.tabLabel,
              ergo_rank: ergoRank,
              ergo: combo.ergo,
              is_preferred: combo.id === preferred_modifier,
            });
          }
        }
      }

      suggestions.sort((a, b) => {
        const aPref = a.modifier_combo === preferred_modifier ? 0 : 1;
        const bPref = b.modifier_combo === preferred_modifier ? 0 : 1;
        if (aPref !== bPref) return aPref - bPref;
        return a.ergo_rank - b.ergo_rank;
      });

      const top = suggestions.slice(0, count);
      const text = [
        `## Top ${count} available hotkeys on ${platform === 'mac' ? 'macOS' : 'Windows'}`,
        ...(appIds?.length ? [`Excluding conflicts with: ${appIds.join(', ')}`] : []),
        ...(preferred_modifier ? [`Preferred modifier: ${preferred_modifier}`] : []),
        '',
        ...top.map((s, i) => {
          const reasons: string[] = [];
          if (s.is_preferred) reasons.push('preferred modifier');
          if (s.ergo_rank === 0) reasons.push('sweet spot combo');
          else if (s.ergo_rank <= 2) reasons.push('good ergonomics');
          else if (s.ergo_rank >= 4) reasons.push('heavy combo');
          return `${i + 1}. **${s.modifier_label}+${s.key}** (\`${s.modifier_combo}\`) — ${s.ergo}${reasons.length ? ` _[${reasons.join(', ')}]_` : ''}`;
        })
      ].join('\n');
      return { content: [{ type: 'text' as const, text }] };
    },
  );

  // ── list_apps ──
  server.tool(
    'list_apps',
    'List all available app IDs with their names and supported platforms. Use this to discover valid values for the `apps` parameter in other tools.',
    {},
    async () => {
      const list = apps.map(a => ({ id: a.id, name: a.name, platforms: a.platforms }));
      const text = [
        '## Available apps',
        '',
        ...list.map(a => `- **${a.name}** (\`${a.id}\`) — ${a.platforms.join(', ')}`),
      ].join('\n');
      return { content: [{ type: 'text' as const, text }] };
    },
  );

  // ── list_combos ──
  server.tool(
    'list_combos',
    'List modifier combos for a given platform, with their IDs, labels, constituent modifiers, and ergonomics notes.',
    {
      platform: platformEnum,
    },
    async ({ platform }) => {
      const combos = getCombos(platform);
      const list = combos.map(c => ({ id: c.id, label: c.tabLabel, mods: c.mods, ergo: c.ergo }));
      const text = [
        `## Modifier combos for ${platform === 'mac' ? 'macOS' : 'Windows'}`,
        '',
        ...list.map(c => `- **${c.label}** (\`${c.id}\`) — mods: ${c.mods.join('+')} — ${c.ergo}`),
      ].join('\n');
      return { content: [{ type: 'text' as const, text }] };
    },
  );

  return server;
}

// ─── HTML serving ───────────────────────────────────────────────

function serveHtml(): Response {
  const dataScript = `const macCombos = ${JSON.stringify(macCombos)};
const winCombos = ${JSON.stringify(winCombos)};
const apps = ${JSON.stringify(apps)};`;
  const html = htmlTemplate.replace('/*__KEYGAP_DATA__*/', dataScript);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// ─── MCP request handling ───────────────────────────────────────

async function handleMcp(request: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });
  const server = createMcpServer();
  await server.connect(transport);
  const response = await transport.handleRequest(request);
  return response;
}

// ─── Worker export ──────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp/')) {
      return handleMcp(request);
    }

    return serveHtml();
  },
};
