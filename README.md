# KeyGap

Find which keyboard shortcuts are actually free.

## What it does

Every OS, browser, and app claims its own shortcuts — and they overlap in unpredictable ways. KeyGap maps out which hotkey combos are already taken across your platform and the apps you use, so you can find what's actually available.

Two interfaces, same data:

- **[keygap.app](https://keygap.app)** — interactive keyboard visualizer that shows available, taken, and risky shortcuts at a glance. Press any shortcut to check it.
- **MCP endpoint** — lets AI assistants query shortcut availability programmatically

## Why

Knowing which key combos are free is useful for both people and machines — if you're assigning hotkeys for an app, or an AI assistant is suggesting shortcuts, you need the same lookup. I wanted to see if this could be a self-contained POC that serves both audiences from one artifact. Answer: sort of.

## MCP Integration

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) lets AI assistants call external tools. KeyGap exposes five:

### Tools

- **`get_available_keys`** — given a platform, modifier combo, and apps, returns which keys are available, taken, or risky
- **`check_key`** — check whether a specific key combo (e.g. Ctrl+Shift+K) is free
- **`suggest_hotkeys`** — suggest the best available combos given your constraints
- **`list_apps`** — list the app IDs the other tools accept
- **`list_combos`** — list the modifier combos for a platform, best first

### Setup

Add `https://keygap.app/mcp` as an MCP server in your client (Claude, Cursor, etc.). In Claude, that's **Settings → Connectors → Add custom connector**. In Claude Code:

```bash
claude mcp add --transport http keygap https://keygap.app/mcp
```

### Example prompts

- "What Cmd+Ctrl combos are free if I use Chrome and Slack?"
- "I need 4 hotkeys that won't conflict with VS Code or Figma"
- "Is Ctrl+Shift+K taken by anything on Windows?"

## Coverage

**Platforms:** macOS, Windows

**Apps:** Chrome, Firefox, Safari (mac), Arc, Slack, Discord, Zoom, VS Code, Terminal (mac), iTerm2 (mac), Warp, Figma, Linear, Notion, Obsidian, Superhuman, Spotify, Raycast (mac), 1Password

Coverage is partial. A result of **no known conflict** means no conflict was found in the recorded data, not that the shortcut is guaranteed to be available. Most inherited claims remain unreviewed. Verified records include vendor source URLs and verification dates; no verification date is assigned to inherited claims.

KeyGap assumes a US physical-key layout and default bindings. It combines selected apps conservatively without detecting which apps are running or focused. Custom bindings, extensions and plugins are not covered. Empty maps are not verified absences. [Report incorrect shortcuts](https://github.com/rossrader/keygap/issues).

### Result semantics and key identities

The five MCP tools retain their names and status values. `taken` means a verified system reservation; `app-claimed` means a selected app has a recorded binding; `risky` means conventional or conditional usage; `available` means no known conflict. Results retain relevant claims, including warnings overridden by app claims, and expose dataset version, assumptions and source metadata.

`Backspace` deletes backward, including the key labeled delete on Mac keyboards. `Delete`, `del` and `forward delete` mean forward deletion. This corrects the previous ambiguous `Delete` behavior. Use `Backspace` for Mac Command-Delete Finder actions. Suggestions use static combo rank followed by key preference, not measured crowding.

### Maintaining reference data

`src/data.ts` holds inherited action strings. `src/catalog.ts` migrates them to typed bindings with owner, scope, classification and verification metadata, and applies sourced corrections. Both interfaces consume that catalog. Inherited baseline claims remain conservative warnings until verified; they are not automatically promoted to system reservations.

Add verified corrections and source records in the catalog. Scope verification to the documented platform, key and modifier combination. Preserve uncertainty about versions and activation context. The initial verification covers selected Apple, Microsoft and Chrome bindings; Firefox deletion bindings and the inherited Safari overlay remain unreviewed.

## Release notes

### October 2026

- New keyboard design: light page, graphite keyboard, keys styled by status.
- Press a key combo and see if it's free. It now works the way you'd expect.
- Opens on the least-used modifier combo, with free-key counts on every tab.
- Lists free keys, with a copy button.
- Shareable links that remember your platform, combo and apps.
- Works on phones.
- Usable from the keyboard, with improved screen-reader support and contrast.
- 19 apps, up from 12, and Arc and Warp now cover Windows.
- Earlier shortcut corrections are retained, but blanket vendor-verification claims have been replaced with per-record evidence.
- MCP endpoint updated to the current protocol, with two new tools: `list_apps` and `list_combos`.
- Smoke tests and request logs added.

## Development

Use Node 22.18.0 or a later Node 22 release. The tests import TypeScript directly using Node's type stripping. The lockfile is tracked; use `npm ci` for reproducible installs.

```bash
npm install              # install dependencies
npx wrangler dev         # local dev → localhost:8787
npm test                 # unit tests and local Worker/MCP integration tests
npx playwright install chromium
npm run test:browser     # browser regressions and automated accessibility checks
npm run validate         # typecheck and all local test suites
npm audit                # dependency advisories
npm run test:prod        # same checks against keygap.app
npx wrangler deploy      # deploy to keygap.app
```

Single Cloudflare Worker, TypeScript compiled by wrangler's built-in esbuild. No frameworks, no database — shortcut data is static and bundled into the response.

- `src/data.ts`: inherited shortcut records
- `src/catalog.ts`: typed catalog, sourced corrections and coverage metadata
- `src/domain.ts` and `src/normalize.ts`: MCP classification and input normalization
- `keygap.html` — the page, a template the Worker fills with the data (open it via `wrangler dev`, not from disk)
- `src/mcp.ts`: MCP tools (MCP SDK v2, Streamable HTTP via Cloudflare's `agents` package)

CI uses Node 22.18.0, `npm ci`, aggregate validation and a high-severity dependency audit. Production smoke tests remain a separate command and do not prove local and deployed dataset equality. Browser tests run Chromium; manual screen-reader and other-browser validation are still needed.

The MCP client and SDK overrides select patched releases for the OAuth-client advisory reported through `agents`. This application exposes a server and does not configure outbound OAuth clients. Keep the overrides until upstream dependency ranges resolve patched versions without them; rerun the audit and MCP integration tests when changing them.
