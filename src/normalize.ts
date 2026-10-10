import { combos, keys, type ModifierCombo } from './catalog.ts';
import type { Platform } from './data.ts';

const modifiers: Record<string, string> = {
  cmd: 'cmd', command: 'cmd', '⌘': 'cmd', meta: 'cmd',
  ctrl: 'ctrl', control: 'ctrl', '⌃': 'ctrl',
  opt: 'opt', option: 'opt', alt: 'alt', '⌥': 'opt',
  shift: 'shift', '⇧': 'shift', win: 'win', windows: 'win', super: 'win', '⊞': 'win',
};
const aliases: Record<string, string> = {
  enter: 'Return', return: 'Return', backspace: 'Backspace', delete: 'Delete', del: 'Delete', forwarddelete: 'Delete',
  space: 'Space', spacebar: 'Space', escape: 'Esc', esc: 'Esc', tab: 'Tab',
  up: 'Up', arrowup: 'Up', down: 'Down', arrowdown: 'Down', left: 'Left', arrowleft: 'Left', right: 'Right', arrowright: 'Right',
  backtick: '`', grave: '`', minus: '-', equals: '=', comma: ',', period: '.', slash: '/',
  backslash: '\\', semicolon: ';', quote: "'", bracketleft: '[', bracketright: ']',
};
export function resolveCombo(platform: Platform, input: string): ModifierCombo | undefined {
  const parts = input.toLowerCase().replace(/([⌘⌃⌥⇧⊞])/g, ' $1 ').split(/[\s+\-_,]+/).filter(Boolean);
  const normalized: string[] = [];
  for (const part of parts) {
    if (!Object.hasOwn(modifiers, part)) return undefined;
    let modifier = modifiers[part];
    if (platform === 'mac' && modifier === 'alt') modifier = 'opt';
    if (platform === 'win' && modifier === 'opt') modifier = 'alt';
    if (platform === 'win' && modifier === 'cmd') modifier = 'win';
    normalized.push(modifier);
  }
  const selected = new Set(normalized);
  return combos[platform].find(combo => combo.mods.length === selected.size && combo.mods.every(modifier => selected.has(modifier)));
}
export function resolveKey(input: string): string | undefined {
  const key = input.trim();
  const alias = key.toLowerCase().replace(/\s+/g, '');
  return Object.hasOwn(aliases, alias) ? aliases[alias] : keys.find(candidate => candidate.toLowerCase() === key.toLowerCase());
}
