import { apps as legacyApps, combos as legacyCombos, keys as legacyKeys, type Platform } from './data.ts';

export type Binding = {
  action: string;
  owner: string;
  scope: 'system-wide' | 'app-local' | 'unresolved';
  classification: 'system-reservation' | 'app-binding' | 'convention' | 'conditional';
  verification: 'unreviewed' | 'verified';
  sources: string[];
  conditions?: string;
};
export type KeyMap = Record<string, Binding>;
export type ModifierCombo = Omit<(typeof legacyCombos.mac)[number], 'taken' | 'risky'> & { taken: KeyMap; risky: KeyMap };
export const sources: Record<string, { url: string; verifiedAt: string; applicability: string }> = {
  apple: { url: 'https://support.apple.com/en-us/102650', verifiedAt: '2026-10-09', applicability: 'Documented macOS defaults; hardware and settings may vary.' },
  microsoft: { url: 'https://support.microsoft.com/en-us/accessibility/windows/keyboard-shortcuts-in-windows', verifiedAt: '2026-10-09', applicability: 'Documented Windows defaults; feature availability may vary.' },
  chrome: { url: 'https://support.google.com/chrome/answer/157179?hl=en&co=GENIE.Platform%3DDesktop', verifiedAt: '2026-10-09', applicability: 'Chrome desktop default browsing-data shortcut.' },
};
export const dataset = {
  version: '2026-10-09.1', schemaVersion: 2,
  coverage: 'partial',
  availability: 'No known conflict in recorded data, not a guarantee of availability.',
  assumptions: ['US physical-key layout', 'Default bindings; custom shortcuts, extensions and plugins are not covered', 'App selection is a conservative union, not detection of running or focused apps', 'Unlisted bindings and empty maps are unreviewed, not verified absences', 'Only listed modifier combinations and keys are covered'],
  versions: 'Most inherited records have not been verified against a specific OS or app version.',
} as const;
export const keys = legacyKeys.flatMap(key => key === 'Delete' ? ['Backspace', 'Delete'] : [key]);

function inherited(action: string, owner: string, app: boolean): Binding {
  return { action, owner, scope: 'unresolved', classification: app ? 'app-binding' : 'convention', verification: 'unreviewed', sources: [], conditions: 'Inherited claim; context and version applicability need verification.' };
}
function migrate(map: Record<string, string>, platform: Platform, owner: string, app = false): KeyMap {
  return Object.fromEntries(Object.entries(map).map(([key, action]) => [platform === 'mac' && key === 'Delete' ? 'Backspace' : key, inherited(action, owner, app)]));
}
export const combos: Record<Platform, ModifierCombo[]> = {
  mac: legacyCombos.mac.map(combo => ({ ...combo, taken: {}, risky: { ...migrate(combo.taken, 'mac', 'Common or conditional usage'), ...migrate(combo.risky, 'mac', 'Common or conditional usage') } })),
  win: legacyCombos.win.map(combo => ({ ...combo, taken: {}, risky: { ...migrate(combo.taken, 'win', 'Common or conditional usage'), ...migrate(combo.risky, 'win', 'Common or conditional usage') } })),
};
export const apps = legacyApps.map(app => ({
  ...app,
  coverage: Object.fromEntries(app.platforms.map(platform => [platform, 'partial'])),
  mac: Object.fromEntries(Object.entries(app.mac).map(([combo, map]) => [combo, migrate(map, 'mac', app.name, true)])),
  win: Object.fromEntries(Object.entries(app.win).map(([combo, map]) => [combo, migrate(map, 'win', app.name, true)])),
}));

function verified(platform: Platform, comboId: string, key: string, action: string, scope: Binding['scope'], source: string, owner: string, appId?: string) {
  const binding: Binding = { action, owner, scope, classification: appId ? 'app-binding' : scope === 'system-wide' ? 'system-reservation' : 'convention', verification: 'verified', sources: [source] };
  if (appId) {
    const app = apps.find(candidate => candidate.id === appId)!;
    (app[platform][comboId] ??= {})[key] = binding;
  } else {
    const combo = combos[platform].find(candidate => candidate.id === comboId)!;
    delete combo.risky[key];
    (scope === 'system-wide' ? combo.taken : combo.risky)[key] = binding;
  }
}
verified('mac', 'cmd-ctrl', 'Q', 'Lock screen', 'system-wide', 'apple', 'macOS');
verified('mac', 'cmd', 'Tab', 'Switch apps', 'system-wide', 'apple', 'macOS');
verified('mac', 'cmd', 'Space', 'Show or hide Spotlight search', 'system-wide', 'apple', 'macOS');
verified('mac', 'cmd-shift', '3', 'Capture the entire screen', 'system-wide', 'apple', 'macOS');
verified('mac', 'cmd-shift', '4', 'Capture a selected area', 'system-wide', 'apple', 'macOS');
verified('mac', 'cmd', 'Backspace', 'Move selected item to Trash', 'app-local', 'apple', 'Finder');
verified('mac', 'cmd-shift', 'Backspace', 'Empty Trash', 'app-local', 'apple', 'Finder');
verified('win', 'ctrl-alt', 'Delete', 'Security screen (Ctrl+Alt+Del)', 'system-wide', 'microsoft', 'Windows');
verified('win', 'ctrl', 'Backspace', 'Delete words to the left of the cursor', 'app-local', 'microsoft', 'Text editing');
verified('win', 'ctrl', 'Delete', 'Delete words to the right of the cursor', 'app-local', 'microsoft', 'Text editing');
verified('mac', 'cmd-shift', 'Backspace', 'Open Delete Browsing Data options', 'app-local', 'chrome', 'Chrome', 'chrome');
verified('win', 'ctrl-shift', 'Delete', 'Open Delete Browsing Data options', 'app-local', 'chrome', 'Chrome', 'chrome');
for (const platform of ['mac', 'win'] as const) {
  const combo = combos[platform].find(candidate => candidate.id === (platform === 'mac' ? 'cmd-shift' : 'ctrl-shift'))!;
  combo.risky.M = inherited('App-specific action; inspect selected apps for recorded claims', 'App conventions', false);
}
for (const key of ['1', '2']) {
  const binding = combos.mac.find(combo => combo.id === 'cmd-opt')!.risky[key];
  binding.classification = 'conditional';
  binding.conditions = 'Unverified inherited Safari claim; the Safari overlay is incomplete.';
}
