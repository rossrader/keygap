import template from '../keygap.html';
import { apps, combos, keys, dataset, sources } from './catalog';

const PLACEHOLDER = '/*__KEYGAP_DATA__*/null';
if (!template.includes(PLACEHOLDER)) throw new Error(`keygap.html is missing the ${PLACEHOLDER} placeholder`);

// Escape "<" so no string in the data can close the <script> tag early.
const payload = JSON.stringify({ combos, apps, keys, dataset, sources }).replace(/</g, '\\u003c');
const page = template.replace(PLACEHOLDER, () => payload);

export function serveHtml(): Response {
  return new Response(page, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
