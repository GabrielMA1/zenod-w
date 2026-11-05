export const locales = {
  en: { label: 'English', og: 'en_GB', format: 'en-IE' },
  ro: { label: 'Română', og: 'ro_RO', format: 'ro-RO' },
  de: { label: 'Deutsch', og: 'de_DE', format: 'de-DE' },
  es: { label: 'Español', og: 'es_ES', format: 'es-ES' },
  it: { label: 'Italiano', og: 'it_IT', format: 'it-IT' },
  pt: { label: 'Português', og: 'pt_PT', format: 'pt-PT' },
  fr: { label: 'Français', og: 'fr_FR', format: 'fr-FR' },
};
export const localeIds = Object.keys(locales);
export const localePrefixPattern = new RegExp(`^/(${localeIds.filter(id => id !== 'en').join('|')})(?=/|$)`);
export function localeForPath(path) { return path.match(localePrefixPattern)?.[1] ?? 'en'; }
export function logicalRoute(path) { return path.replace(localePrefixPattern, '') || '/'; }
export function defaultMarket(locale) { return locale === 'ro' ? 'RO' : 'EU'; }
export function currentMarket(locale = 'en') {
  if (typeof window === 'undefined') return defaultMarket(locale);
  const explicit = new URL(window.location.href ?? window.location.pathname, 'https://zenodetail.com').searchParams.get('market');
  if (['RO', 'EU'].includes(explicit)) return explicit;
  try {
    const saved = window.localStorage.getItem('zeno-detail-market');
    if (['RO', 'EU'].includes(saved)) return saved;
  } catch { /* URL selection remains usable without storage. */ }
  return defaultMarket(locale);
}
