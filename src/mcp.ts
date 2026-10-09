import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import { apps, combos, keys, type ModifierCombo, type Platform } from './data';

type Status = 'available' | 'taken' | 'risky' | 'app-claimed';

interface KeyResult {
  key: string;
  status: Status;
  reason?: string;
  claimed_by?: { app: string; action: string }[];
}

// ── Input normalization ─────────────────────────────

const MOD_ALIASES: Record<string, string> = {
  cmd: 'cmd', command: 'cmd', '⌘': 'cmd', meta: 'cmd',
  ctrl: 'ctrl', control: 'ctrl', '⌃': 'ctrl',
  opt: 'opt', option: 'opt', alt: 'alt', '⌥': 'opt',
  shift: 'shift', '⇧': 'shift',
  win: 'win', windows: 'win', super: 'win', '⊞': 'win',
};

/** Accepts combo IDs ("cmd-ctrl") or looser forms ("Ctrl+Cmd", "⌘⌃", "command control"). */
function resolveCombo(platform: Platform, input: string): ModifierCombo | undefined {
  const list = combos[platform];
  const exact = list.find((c) => c.id === input.toLowerCase());
  if (exact) return exact;
  const parts = input.toLowerCase().replace(/([⌘⌃⌥⇧⊞])/g, ' $1 ').split(/[\s+\-_,]+/).filter(Boolean);
  const mods = new Set(
    parts.map((p) => {
      const m = MOD_ALIASES[p];
      if (platform === 'mac' && m === 'alt') return 'opt';
      if (platform === 'win' && m === 'opt') return 'alt';
      if (platform === 'win' && m === 'cmd') return 'win';
      return m;
    }),
  );
  if (mods.has(undefined as unknown as string)) return undefined;
  return list.find((c) => c.mods.length === mods.size && c.mods.every((m) => mods.has(m)));
}

const KEY_ALIASES: Record<string, string> = {
  enter: 'Return', return: 'Return', backspace: 'Delete', delete: 'Delete', del: 'Delete',
  space: 'Space', spacebar: 'Space', escape: 'Esc', esc: 'Esc', tab: 'Tab',
  up: 'Up', arrowup: 'Up', down: 'Down', arrowdown: 'Down',
  left: 'Left', arrowleft: 'Left', right: 'Right', arrowright: 'Right',
  backtick: '`', grave: '`', minus: '-', equals: '=', comma: ',', period: '.', slash: '/',
  backslash: '\\', semicolon: ';', quote: "'", bracketleft: '[', bracketright: ']',
};

function resolveKey(input: string): string | undefined {
  const k = input.trim();
  const alias = KEY_ALIASES[k.toLowerCase().replace(/\s+/g, '')];
  if (alias) return alias;
  return keys.find((x) => x.toLowerCase() === k.toLowerCase());
}

// ── Lookup ──────────────────────────────────────────

function selectedApps(platform: Platform, ids: string[] = []) {
  const chosen = apps.filter((a) => ids.includes(a.id));
  const unsupported = chosen.filter((a) => !a.platforms.includes(platform)).map((a) => a.name);
  return { chosen: chosen.filter((a) => a.platforms.includes(platform)), unsupported };
}

function lookup(platform: Platform, combo: ModifierCombo, key: string, appIds: string[]): KeyResult {
  const { chosen } = selectedApps(platform, appIds);
  const claims = chosen.flatMap((a) => {
    const action = a[platform][combo.id]?.[key];
    return action ? [{ app: a.name, action }] : [];
  });
  // Same precedence as the visual keyboard: the OS wins, then apps, then "sometimes used".
  if (combo.taken[key]) {
    return { key, status: 'taken', reason: combo.taken[key], ...(claims.length && { claimed_by: claims }) };
  }
  if (claims.length) return { key, status: 'app-claimed', reason: claims.map((c) => `${c.app}: ${c.action}`).join('; '), claimed_by: claims };
  if (combo.risky[key]) return { key, status: 'risky', reason: combo.risky[key] };
  return { key, status: 'available' };
}

/** Letters first, then digits, punctuation, F-keys and named keys: the easiest to remember come first. */
function keyPreference(key: string): number {
  if (/^[A-Z]$/.test(key)) return 0;
  if (/^[0-9]$/.test(key)) return 1;
  if (key.length === 1) return 2;
  if (/^F\d+$/.test(key)) return 3;
  return 4;
}

function label(platform: Platform, combo: ModifierCombo, key: string): string {
  return platform === 'mac' ? `${combo.tabLabel}${key}` : `${combo.tabLabel}+${key}`;
}

// ── Server ──────────────────────────────────────────

const comboHelp =
  `Modifier combo ID. macOS: ${combos.mac.map((c) => c.id).join(', ')}. ` +
  `Windows: ${combos.win.map((c) => c.id).join(', ')}. Looser forms like "Ctrl+Alt" or "⌘⌃" also work.`;

const platformSchema = z.enum(['mac', 'win']).describe('"mac" for macOS, "win" for Windows');
const appsSchema = z
  .array(z.enum(apps.map((a) => a.id) as [string, ...string[]]))
  .optional()
  .describe(`Apps the person uses: ${apps.map((a) => `${a.id} (${a.name})`).join(', ')}`);

function json(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

function fail(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

function unknownCombo(platform: Platform, input: string) {
  return fail(`"${input}" isn't a modifier combo KeyGap tracks on ${platform}. Use one of: ${combos[platform].map((c) => c.id).join(', ')}.`);
}

function createServer() {
  const server = new McpServer({ name: 'keygap', version: '1.0.0' });

  server.registerTool(
    'get_available_keys',
    {
      title: 'List free keys for a modifier combo',
      description:
        'Lists every key on the keyboard for one modifier combo, with its status: available, taken (by the OS), ' +
        'risky (sometimes used), or app-claimed (by one of the given apps). Use it to see what a combo leaves free.',
      inputSchema: z.object({ platform: platformSchema, modifier_combo: z.string().describe(comboHelp), apps: appsSchema }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform, modifier_combo, apps: appIds = [] }) => {
      const combo = resolveCombo(platform, modifier_combo);
      if (!combo) return unknownCombo(platform, modifier_combo);
      const results = keys.map((k) => lookup(platform, combo, k, appIds));
      const count = (s: Status) => results.filter((r) => r.status === s).length;
      return json({
        platform,
        modifier_combo: combo.id,
        modifier_label: combo.tabLabel,
        ergonomics: combo.ergo,
        summary: { available: count('available'), 'app-claimed': count('app-claimed'), risky: count('risky'), taken: count('taken') },
        ignored_apps: selectedApps(platform, appIds).unsupported,
        keys: results,
      });
    },
  );

  server.registerTool(
    'check_key',
    {
      title: 'Check one shortcut',
      description: 'Checks whether one shortcut (modifier combo + key) is free, and says what claims it if not.',
      inputSchema: z.object({
        platform: platformSchema,
        modifier_combo: z.string().describe(comboHelp),
        key: z.string().describe('The key, e.g. "K", "5", "F5", "/", "Space", "Return", "Up"'),
        apps: appsSchema,
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform, modifier_combo, key, apps: appIds = [] }) => {
      const combo = resolveCombo(platform, modifier_combo);
      if (!combo) return unknownCombo(platform, modifier_combo);
      const k = resolveKey(key);
      if (!k) return fail(`"${key}" isn't a key KeyGap tracks. Use a letter, digit, punctuation key, F1–F12, Esc, Tab, Space, Return, Delete or an arrow.`);
      return json({ ...lookup(platform, combo, k, appIds), shortcut: label(platform, combo, k), ignored_apps: selectedApps(platform, appIds).unsupported });
    },
  );

  server.registerTool(
    'suggest_hotkeys',
    {
      title: 'Suggest free hotkeys',
      description:
        'Suggests shortcuts that are free given the apps someone uses. Prefers the requested modifier combo, then ' +
        'the combos that are least crowded and easiest to press, and letter keys over symbols.',
      inputSchema: z.object({
        platform: platformSchema,
        count: z.number().int().min(1).max(50).describe('How many shortcuts are needed'),
        apps: appsSchema,
        preferred_modifier: z.string().optional().describe(`Optional. ${comboHelp}`),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform, count, apps: appIds = [], preferred_modifier }) => {
      const preferred = preferred_modifier ? resolveCombo(platform, preferred_modifier) : undefined;
      if (preferred_modifier && !preferred) return unknownCombo(platform, preferred_modifier);
      const ordered = [...combos[platform]].sort((a, b) => (a === preferred ? -1 : b === preferred ? 1 : a.rank - b.rank));
      const suggestions: { modifier_combo: string; key: string; modifier_label: string; shortcut: string }[] = [];
      for (const combo of ordered) {
        const free = keys
          .filter((k) => lookup(platform, combo, k, appIds).status === 'available')
          .sort((a, b) => keyPreference(a) - keyPreference(b));
        for (const key of free) {
          if (suggestions.length >= count) break;
          suggestions.push({ modifier_combo: combo.id, key, modifier_label: combo.tabLabel, shortcut: label(platform, combo, key) });
        }
        if (suggestions.length >= count) break;
      }
      return json({ platform, suggestions, ignored_apps: selectedApps(platform, appIds).unsupported });
    },
  );

  return server;
}

export const mcpHandler = createMcpHandler(createServer, { route: '/mcp' });
