// Smoke test: data integrity, the page, and all five MCP tools.
//   npm test               starts its own `wrangler dev` and tests it
//   npm run test:prod      tests https://keygap.app
//   BASE_URL=... npm test  tests any running instance
import { spawn } from 'node:child_process';
import { apps, combos, keys } from '../src/catalog.ts';

const PORT = 8799;
const nativeFetch = globalThis.fetch;
const fetch = (url, options = {}) => nativeFetch(url, { ...options, signal: AbortSignal.timeout(10000) });
let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok || !detail ? '' : `  (${detail})`}`);
  if (!ok) failures++;
}

// ── Data integrity (no server needed) ──
const keySet = new Set(keys);
for (const [platform, list] of Object.entries(combos)) {
  for (const c of list) {
    const bad = [...Object.keys(c.taken), ...Object.keys(c.risky)].filter((k) => !keySet.has(k));
    check(`${platform} ${c.id}: keys are valid`, bad.length === 0, bad.join(' '));
  }
  const ranks = list.map((c) => c.rank).sort();
  check(`${platform}: ranks are unique`, new Set(ranks).size === ranks.length);
}
for (const a of apps) {
  const problems = [];
  for (const platform of ['mac', 'win']) {
    const ids = new Set(combos[platform].map((c) => c.id));
    for (const [comboId, map] of Object.entries(a[platform])) {
      if (!a.platforms.includes(platform)) problems.push(`${platform} data on a ${a.platforms.join('/')} app`);
      if (!ids.has(comboId)) problems.push(`unknown combo ${platform}/${comboId}`);
      for (const k of Object.keys(map)) if (!keySet.has(k)) problems.push(`unknown key ${comboId}/${k}`);
    }
  }
  check(`${a.id}: shortcuts are valid`, problems.length === 0, problems.join(', '));
}

// ── Server ──
let server;
const base = process.env.BASE_URL || `http://localhost:${PORT}`;
if (!process.env.BASE_URL) {
  server = spawn('npx', ['wrangler', 'dev', '--port', String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
  server.stdout.on('data', chunk => { server.output = (server.output || '') + chunk.toString(); });
  server.stderr.on('data', chunk => { server.output = (server.output || '') + chunk.toString(); });
  server.on('error', error => { server.startError = error; });
  for (let i = 0; i < 60; i++) {
    if (server.startError || server.exitCode !== null) break;
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
}

try {
  const page = await fetch(base);
  const html = await page.text();
  check('page loads', page.ok, String(page.status));
  check('page has the data inlined', !html.includes('/*__KEYGAP_DATA__*/null') && html.includes('"combos"'));

  let id = 0;
  async function rpc(method, params = {}) {
    const res = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2025-06-18' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
    });
    const text = await res.text();
    const line = text.split('\n').find((l) => l.startsWith('data: '));
    return JSON.parse(line ? line.slice(6) : text);
  }
  async function tool(name, args) {
    const response = await rpc('tools/call', { name, arguments: args });
    if (response.error) return { error: response.error.message };
    const r = response.result;
    return r.isError ? { error: r.content[0].text } : JSON.parse(r.content[0].text);
  }

  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } });
  check('mcp initializes', init.result?.serverInfo?.name === 'keygap');
  const names = (await rpc('tools/list')).result.tools.map((t) => t.name).sort();
  check('mcp lists 5 tools', names.join() === 'check_key,get_available_keys,list_apps,list_combos,suggest_hotkeys', names.join());

  const lock = await tool('check_key', { platform: 'mac', modifier_combo: 'cmd-ctrl', key: 'Q' });
  check('check_key: ⌘⌃Q is taken by macOS', lock.status === 'taken');
  const up = await tool('check_key', { platform: 'mac', modifier_combo: 'Cmd+Opt', key: 'up', apps: ['slack'] });
  check('check_key: loose input and arrow keys work', up.status === 'app-claimed', JSON.stringify(up));
  const avail = await tool('get_available_keys', { platform: 'mac', modifier_combo: 'cmd-ctrl' });
  check('get_available_keys: ⌘⌃ is mostly free', avail.summary.available > 40, JSON.stringify(avail.summary));
  const sugg = await tool('suggest_hotkeys', { platform: 'win', count: 4, apps: ['vscode', 'figma'] });
  check('suggest_hotkeys: 4 suggestions', sugg.suggestions.length === 4);
  const listed = await tool('list_apps', {});
  check('list_apps: matches the data', listed.length === apps.length, `${listed.length} vs ${apps.length}`);
  const best = await tool('list_combos', { platform: 'win' });
  check('list_combos: best combo first', best[0].id === combos.win.find((c) => c.rank === 1).id);
  const bad = await tool('check_key', { platform: 'mac', modifier_combo: 'opt-shift', key: 'K' });
  check('unknown combo returns a clear error', Boolean(bad.error));
  for (const key of ['Delete', 'del', 'forward delete']) {
    const result = await tool('check_key', { platform: 'win', modifier_combo: 'Ctrl+Alt', key });
    check(`forward-delete alias ${key}`, result.status === 'taken');
  }
  const backward = await tool('check_key', { platform: 'win', modifier_combo: 'ctrl-alt', key: 'backspace' });
  check('Backspace is distinct from forward Delete', backward.status === 'available' && backward.dataset.coverage === 'partial');
  const editor = await tool('check_key', { platform: 'mac', modifier_combo: 'cmd', key: 'B', apps: ['vscode'] });
  check('app claim outranks convention', editor.status === 'app-claimed' && editor.reason.includes('Toggle sidebar'));
  const unsupported = await tool('check_key', { platform: 'win', modifier_combo: 'ctrl', key: 'K', apps: ['safari'] });
  check('unsupported apps are reported', unsupported.ignored_apps.includes('Safari'));
  const unknownKey = await tool('check_key', { platform: 'mac', modifier_combo: 'cmd', key: 'Home' });
  check('unsupported keys fail clearly', Boolean(unknownKey.error));
  for (const suggestion of sugg.suggestions) {
    const result = await tool('check_key', { platform: 'win', modifier_combo: suggestion.modifier_combo, key: suggestion.key, apps: ['vscode', 'figma'] });
    check(`suggested ${suggestion.shortcut} has no known conflict`, result.status === 'available');
  }
} catch (e) {
  check('server checks ran', false, `${e.message}\n${server?.startError || ''}\n${server?.output || ''}`);
} finally {
  if (server?.pid) {
    try { process.platform === 'win32' ? server.kill() : process.kill(-server.pid); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  }
}

console.log(failures ? `\n${failures} failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
