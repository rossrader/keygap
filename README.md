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

**Apps:** Chrome, Firefox, Safari (mac), Arc (mac), Slack, Discord, Zoom, VS Code, Terminal (mac), iTerm2 (mac), Warp (mac), Figma, Linear, Notion, Obsidian, Superhuman, Spotify, Raycast (mac), 1Password

## Development

```bash
npm install              # install dependencies
npx wrangler dev         # local dev → localhost:8787
npx wrangler deploy      # deploy to keygap.app
```

Single Cloudflare Worker, TypeScript compiled by wrangler's built-in esbuild. No frameworks, no database — shortcut data is static and bundled into the response.

- `src/data.ts` — the shortcut database, shared by the page and the MCP endpoint
- `keygap.html` — the page, a template the Worker fills with the data (open it via `wrangler dev`, not from disk)
- `src/mcp.ts` — MCP tools (MCP SDK v2, Streamable HTTP via Cloudflare's `agents` package)
