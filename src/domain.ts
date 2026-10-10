import { apps, type ModifierCombo, type Binding } from './catalog.ts';
import type { Platform } from './data.ts';

export function selectedApps(platform: Platform, ids: string[] = []) {
  const chosen = apps.filter(app => ids.includes(app.id));
  return { chosen: chosen.filter(app => app.platforms.includes(platform)), unsupported: chosen.filter(app => !app.platforms.includes(platform)).map(app => app.name) };
}
export function lookup(platform: Platform, combo: ModifierCombo, key: string, appIds: string[]) {
  const claimed_by = selectedApps(platform, appIds).chosen.flatMap(app => {
    const binding = app[platform][combo.id]?.[key];
    return binding ? [{ app: app.name, action: binding.action, binding }] : [];
  });
  const reservation = combo.taken[key];
  const warning = combo.risky[key];
  const claims: Binding[] = [...(reservation ? [reservation] : []), ...claimed_by.map(claim => claim.binding), ...(warning ? [warning] : [])];
  const status = reservation ? 'taken' : claimed_by.length ? 'app-claimed' : warning ? 'risky' : 'available';
  const reason = reservation?.action ?? (claimed_by.length ? claimed_by.map(claim => `${claim.app}: ${claim.action}`).join('; ') : warning?.action);
  return { key, status, ...(reason ? { reason } : {}), ...(claimed_by.length ? { claimed_by } : {}), claims, coverage: 'partial' as const };
}
