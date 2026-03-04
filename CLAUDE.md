# KeyGap

KeyGap (keygap.app) is a keyboard shortcut availability tool. It helps people find which hotkey combos are actually free on their platform, given the apps they use.

## Architecture

One Cloudflare Worker serves two interfaces from the same shortcut database:

1. **Browser requests** → serve the interactive HTML keyboard visualizer (in `keygap.html`)
2. **MCP requests at `/mcp`** → serve an MCP (Model Context Protocol) endpoint with three tools

## Project structure

```
keygap/
├── CLAUDE.md              ← you are here
├── keygap.html            ← the full interactive HTML artifact (source of truth for UI)
├── wrangler.toml          ← Cloudflare Worker config (keygap.app)
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           ← Worker entry: routes browser vs MCP requests
    ├── data.ts            ← shared shortcut database (extracted from keygap.html)
    ├── html.ts            ← serves the HTML page with data inlined
    └── mcp.ts             ← MCP endpoint handler with tool definitions
```

## Key design decisions

- **Extract the shortcut database** from the JS objects currently inside `keygap.html` into `src/data.ts` as plain TypeScript objects. Both the HTML (inlined at build time) and the MCP handler import from this single source. Do NOT try to normalize this into a database schema — it's reference data, not transactional data.
- **Keep the HTML self-contained.** Inline the shortcut data into the HTML at build time so it works with no fetch calls, no loading states, no API dependency. The data changes infrequently; a redeploy is fine.
- **No frameworks, no databases.** This is a single Worker file with TypeScript. Keep it minimal.
- **Use `wrangler` for dev and deploy.** Standard Cloudflare Workers tooling.

## Data structure

The shortcut database has this shape:

```typescript
type Platform = 'mac' | 'win';

interface ModifierCombo {
  id: string;           // e.g. 'cmd-ctrl', 'ctrl-shift', 'win-ctrl'
  tabLabel: string;     // display label e.g. '⌘⌃'
  mods: string[];       // constituent modifiers e.g. ['cmd', 'ctrl']
  ergo: string;         // ergonomics note
  taken: Record<string, string>;  // key → reason
  risky: Record<string, string>;  // key → reason
}

interface AppShortcuts {
  id: string;
  name: string;
  platforms: Platform[];
  mac: Record<string, Record<string, string>>;  // comboId → { key: reason }
  win: Record<string, Record<string, string>>;
}
```

Platforms: `mac` and `win`.

Mac modifier combos: `cmd`, `cmd-shift`, `cmd-opt`, `cmd-ctrl`, `cmd-ctrl-shift`
Windows modifier combos: `win`, `ctrl`, `ctrl-shift`, `ctrl-alt`, `win-ctrl`, `win-shift`

Apps: Chrome, Slack, VS Code, Figma, Linear, Notion, Arc (mac only), Zoom, Spotify, Raycast (mac only), 1Password, Obsidian.

## MCP tools to implement

Use the `@modelcontextprotocol/sdk` npm package — it has a Cloudflare Workers adapter that handles the SSE transport. Do not hand-roll the JSON-RPC protocol.

### `get_available_keys`

Given a platform, modifier combo, and optional list of active app IDs, return the list of keys that are available (not taken by the OS or any of the specified apps).

**Parameters:**
- `platform` (required): `"mac"` | `"win"`
- `modifier_combo` (required): combo ID string (e.g. `"cmd-ctrl"`, `"win-ctrl"`)
- `apps` (optional): array of app ID strings (e.g. `["chrome", "slack"]`)

**Returns:** Array of objects with `{ key, status }` where status is `"available"`, `"taken"`, `"risky"`, or `"app-claimed"`. Include the reason and claiming app name for non-available keys.

### `check_key`

Check whether a specific key combo is available.

**Parameters:**
- `platform` (required): `"mac"` | `"win"`
- `modifier_combo` (required): combo ID string
- `key` (required): the key to check (e.g. `"K"`, `"F5"`, `"/"`)
- `apps` (optional): array of app ID strings

**Returns:** Object with `{ key, status, reason?, claimed_by? }`.

### `suggest_hotkeys`

Suggest the best available hotkey combos given constraints.

**Parameters:**
- `platform` (required): `"mac"` | `"win"`
- `count` (required): how many hotkeys needed
- `apps` (optional): array of app ID strings
- `preferred_modifier` (optional): preferred modifier combo ID

**Returns:** Array of suggested combos, ranked by: preferred modifier first, then fewest conflicts, best ergonomics. Each entry: `{ modifier_combo, key, modifier_label }`.

## Worker routing (src/index.ts)

```
Request path:
  /mcp   → MCP SSE handler (src/mcp.ts)
  *      → serve HTML page (src/html.ts)
```

Keep the router dead simple. No middleware, no frameworks.

## HTML serving (src/html.ts)

Read the shortcut data from `src/data.ts`, serialize it, and inject it into the HTML template where the current inline JS objects live. The browser gets a fully self-contained page.

The current `keygap.html` has the data as JS variables inside a `<script>` tag. Replace those variable declarations with the serialized data from `data.ts` at build/serve time.

## Build & deploy

- `wrangler dev` for local development
- `wrangler deploy` for production
- TypeScript compiled by wrangler's built-in esbuild

## Testing the MCP

After `wrangler dev`, you can test the MCP endpoint by adding `http://localhost:8787/mcp` as an MCP server in Claude's settings. Try:

- "What Cmd+Ctrl combos are free if I use Chrome and Slack?"
- "I need 4 hotkeys that won't conflict with VS Code or Figma"
- "Is Ctrl+Shift+K taken by anything on Windows?"

## What NOT to do

- Don't set up a static asset pipeline or file server — the HTML is served as a string from the Worker
- Don't create a database or KV store — the data is static TypeScript
- Don't add Express, Hono, or any HTTP framework — raw Worker fetch handler is fine
- Don't split the HTML into multiple files (separate CSS/JS) — it's one self-contained file
- Don't add authentication — this is a public tool
