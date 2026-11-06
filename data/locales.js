// Published storefront languages. Order is the order shown in the preferences selector.
// A language is listed here only when every public page has a complete translation.
export const locales = {
  en: { label: 'English', og: 'en_GB', format: 'en-IE' },
  ro: { label: 'Română', og: 'ro_RO', format: 'ro-RO' },
  de: { label: 'Deutsch', og: 'de_DE', format: 'de-DE' },
  fr: { label: 'Français', og: 'fr_FR', format: 'fr-FR' },
  es: { label: 'Español', og: 'es_ES', format: 'es-ES' },
  it: { label: 'Italiano', og: 'it_IT', format: 'it-IT' },
  pt: { label: 'Português', og: 'pt_PT', format: 'pt-PT' },
  pl: { label: 'Polski', og: 'pl_PL', format: 'pl-PL' },
  nl: { label: 'Nederlands', og: 'nl_NL', format: 'nl-NL' },
};
export const localeIds = Object.keys(locales);
export const localePrefixPattern = new RegExp(`^/(${localeIds.filter(id => id !== 'en').join('|')})(?=/|$)`);
export function localeForPath(path) { return path.match(localePrefixPattern)?.[1] ?? 'en'; }
export function logicalRoute(path) { return path.replace(localePrefixPattern, '') || '/'; }

// Approved pricing markets. Language never implies a market; a market only exists here
// once it has approved prices, delivery terms and (eventually) checkout support.
export const markets = {
  EU: { id: 'EU', label: 'Europe / International', currency: 'EUR', currencyLabel: 'EUR €' },
  RO: { id: 'RO', label: 'Romania', currency: 'RON', currencyLabel: 'RON lei' },
};
export const marketIds = Object.keys(markets);
export const marketStorageKey = 'zeno-detail-market';
export const languageStorageKey = 'zeno-detail-language';
export function isMarket(value) { return marketIds.includes(value); }
export function marketCurrency(market) { return markets[market]?.currency ?? 'EUR'; }
export function defaultMarket(locale) { return locale === 'ro' ? 'RO' : 'EU'; }

// Resolution order: explicit ?market= URL value, then a saved explicit choice, then the
// default for the page language (Romanian URLs → Romania, every other language → Europe).
export function marketPreference(locale = 'en') {
  if (typeof window === 'undefined') return { market: defaultMarket(locale), explicit: false };
  const fromUrl = new URL(window.location.href ?? window.location.pathname, 'https://zenodetail.com').searchParams.get('market');
  if (isMarket(fromUrl)) return { market: fromUrl, explicit: true };
  try {
    const saved = window.localStorage.getItem(marketStorageKey);
    if (isMarket(saved)) return { market: saved, explicit: true };
  } catch { /* URL selection remains usable without storage. */ }
  return { market: defaultMarket(locale), explicit: false };
}
export function currentMarket(locale = 'en') { return marketPreference(locale).market; }
