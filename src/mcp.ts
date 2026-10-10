import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import { apps, combos, keys, dataset, sources, type ModifierCombo } from './catalog';
import type { Platform } from './data';
import { lookup, selectedApps } from './domain';
import { resolveCombo, resolveKey } from './normalize';

type Status = 'available' | 'taken' | 'risky' | 'app-claimed';

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
        'Lists every tracked key for one modifier combo: available (no known conflict, not a guarantee), taken (system reservation), ' +
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
        dataset, sources,
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
      description: 'Checks recorded conflicts for one shortcut. Available means no known conflict within partial coverage, not verified absence. Backspace deletes backward (Mac delete key); Delete deletes forward.',
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
      if (!k) return fail(`"${key}" isn't a key KeyGap tracks. Use a letter, digit, punctuation key, F1–F12, Esc, Tab, Space, Return, Backspace, Delete (forward delete) or an arrow.`);
      return json({ ...lookup(platform, combo, k, appIds), dataset, sources, shortcut: label(platform, combo, k), ignored_apps: selectedApps(platform, appIds).unsupported });
    },
  );

  server.registerTool(
    'suggest_hotkeys',
    {
      title: 'Suggest free hotkeys',
      description:
        'Suggests shortcuts that are free given the apps someone uses. Prefers the requested modifier combo, then ' +
        'static combo recommendation rank, then letter keys over symbols. No known conflict is not a guarantee; coverage is partial.',
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
      return json({ platform, dataset, sources, suggestions, ignored_apps: selectedApps(platform, appIds).unsupported });
    },
  );

  server.registerTool(
    'list_apps',
    {
      title: 'List apps',
      description: 'Lists the apps KeyGap knows, with their IDs and platforms. Use the IDs for the apps parameter of the other tools.',
      inputSchema: z.object({ platform: platformSchema.optional().describe('Optional. Only list apps on this platform.') }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform }) =>
      json(apps.filter((a) => !platform || a.platforms.includes(platform)).map((a) => ({ id: a.id, name: a.name, platforms: a.platforms }))),
  );

  server.registerTool(
    'list_combos',
    {
      title: 'List modifier combos',
      description: 'Lists the modifier combos KeyGap tracks on a platform, best first, with their labels and ergonomics notes.',
      inputSchema: z.object({ platform: platformSchema }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ platform }) =>
      json(
        [...combos[platform]]
          .sort((a, b) => a.rank - b.rank)
          .map((c) => ({ id: c.id, label: c.tabLabel, modifiers: c.mods, ergonomics: c.ergo })),
      ),
  );

  return server;
}

export const mcpHandler = createMcpHandler(createServer, { route: '/mcp' });
