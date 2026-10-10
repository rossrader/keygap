import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { apps, combos, keys, sources, dataset } from '../src/catalog.ts';
import { lookup } from '../src/domain.ts';
import { resolveCombo, resolveKey } from '../src/normalize.ts';

test('normalization preserves canonical keys and rejects inherited properties', () => {
  for (const key of keys) assert.equal(resolveKey(key.toLowerCase()), key);
  for (const platform of ['mac', 'win']) for (const combo of combos[platform]) {
    assert.equal(resolveCombo(platform, combo.id)?.id, combo.id);
    assert.equal(resolveCombo(platform, [...combo.mods].reverse().join('+'))?.id, combo.id);
  }
  for (const invalid of ['constructor', 'toString', '__proto__', 'Home', '']) assert.equal(resolveKey(invalid), undefined);
  assert.equal(resolveCombo('mac', '⌘⌃')?.id, 'cmd-ctrl');
  assert.equal(resolveCombo('mac', 'constructor'), undefined);
  assert.equal(resolveKey('forward delete'), 'Delete');
  assert.equal(resolveKey('backspace'), 'Backspace');
});

const html = readFileSync(new URL('../keygap.html', import.meta.url), 'utf8');
const browser = html.slice(html.indexOf('const state ='), html.indexOf('function freeKeys('));
function context(search = '', savedApps = '') {
  return vm.createContext({ KEYGAP_DATA: { apps, combos, keys, sources, dataset }, URLSearchParams, location: { search }, navigator: { platform: 'MacIntel' }, localStorage: { getItem: key => key === 'keygap.apps' ? savedApps : null, setItem() {} }, history: { replaceState(_state, _title, url) { this.url = url; } } });
}
test('invalid platform values cannot break initialization', () => {
  for (const platform of ['constructor', 'toString', '__proto__', 'linux']) {
    const sandbox = context(`?p=${platform}`);
    vm.runInContext(browser + ';loadState()', sandbox);
    assert.equal(vm.runInContext('state.platform', sandbox), 'mac');
  }
});
test('empty app selection survives URL round trip', () => {
  const sandbox = context('?p=mac&apps=', 'slack');
  vm.runInContext(browser + ';loadState();saveState()', sandbox);
  assert.match(sandbox.history.url, /apps=$/);
  assert.equal(vm.runInContext('state.apps.size', sandbox), 0);
});
test('catalog integrity and source references', () => {
  for (const list of [keys, apps.map(app => app.id), ...Object.values(combos).map(list => list.map(combo => combo.id))]) assert.equal(new Set(list).size, list.length);
  for (const platform of ['mac', 'win']) {
    const maps = [...combos[platform].flatMap(combo => [combo.taken, combo.risky]), ...apps.flatMap(app => Object.values(app[platform]))];
    for (const map of maps) for (const [key, binding] of Object.entries(map)) {
      assert.ok(keys.includes(key));
      assert.ok(binding.action && binding.owner);
      for (const source of binding.sources) assert.ok(sources[source]?.url.startsWith('https://'));
      if (binding.verification === 'verified') assert.ok(binding.sources.length);
    }
  }
});
test('system reservations and deletion identities', () => {
  const combo = combos.win.find(combo => combo.id === 'ctrl-alt');
  assert.equal(lookup('win', combo, 'Delete', []).status, 'taken');
  assert.equal(lookup('win', combo, 'Backspace', []).status, 'available');
  const result = lookup('mac', combos.mac.find(combo => combo.id === 'cmd'), 'B', ['vscode']);
  assert.equal(result.status, 'app-claimed');
  assert.match(result.reason, /Toggle sidebar/);
  assert.ok(result.claims.some(claim => claim.classification === 'convention'));
});
test('browser and MCP domain agree for all keys and app selections', () => {
  const sandbox = context();
  vm.runInContext(browser, sandbox);
  for (const platform of ['mac', 'win']) for (const selected of [[], ...apps.map(app => [app.id]), apps.map(app => app.id)]) {
    sandbox.platform = platform;
    sandbox.selected = selected;
    vm.runInContext('state.platform=platform;state.apps=new Set(selected)', sandbox);
    for (const combo of combos[platform]) for (const key of keys) {
      sandbox.current = combo;
      sandbox.key = key;
      const result = vm.runInContext('lookup(current,key)', sandbox);
      assert.equal({ free: 'available', app: 'app-claimed', taken: 'taken', risky: 'risky' }[result.status], lookup(platform, combo, key, selected).status);
    }
  }
});
