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

Shortcut data was last checked against each vendor's documentation in October 2026. Apps change their defaults, so [open an issue](https://github.com/rossrader/keygap/issues) if something's wrong.

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
- Shortcut data checked against vendor docs, with 606 corrections.
- MCP endpoint updated to the current protocol, with two new tools: `list_apps` and `list_combos`.
- Smoke tests and request logs added.

## Development

```bash
npm install              # install dependencies
npx wrangler dev         # local dev → localhost:8787
npm test                 # smoke test: data, page and MCP tools on a local Worker
npm run test:prod        # same checks against keygap.app
npx wrangler deploy      # deploy to keygap.app
```

Single Cloudflare Worker, TypeScript compiled by wrangler's built-in esbuild. No frameworks, no database — shortcut data is static and bundled into the response.

- `src/data.ts` — the shortcut database, shared by the page and the MCP endpoint
- `keygap.html` — the page, a template the Worker fills with the data (open it via `wrangler dev`, not from disk)
- `src/mcp.ts` — MCP tools (MCP SDK v2, Streamable HTTP via Cloudflare's `agents` package)
