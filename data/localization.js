import { stripBasePath, toSitePath } from './deployment.js';
import { localeForPath, logicalRoute, currentMarket, localeIds, marketCurrency } from './locales.js';

const translationKeys = new Map();
const translatedValues = new Map();
const knownTranslations = new Map();
// Dictionaries are registered rather than imported so the browser downloads only the
// current language (assets/js/app.js). Node tooling registers every language through
// data/dictionaries.js.
export const dictionaries = {};
export function registerDictionary(locale, dictionary) {
  dictionaries[locale] = dictionary;
  translationKeys.delete(locale);
  translatedValues.delete(locale);
  knownTranslations.delete(locale);
}
export function currentLocale() {
  return typeof window === 'undefined' ? 'en' : localeForPath(stripBasePath(window.location.pathname));
}
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function patternFor(value, locale) {
  if (!translationKeys.has(locale)) {
    translationKeys.set(locale, Object.keys(dictionaries[locale]).sort((a, b) => b.length - a.length));
  }
  const relevant = translationKeys.get(locale).filter(key => value.includes(key));
  if (!relevant.length) return null;
  const terms = relevant.map(key =>
    `${/^[\p{L}\p{N}_]/u.test(key) ? '(?<![\\p{L}\\p{N}_])' : ''}${escapeRegExp(key)}${/[\p{L}\p{N}_]$/u.test(key) ? '(?![\\p{L}\\p{N}_])' : ''}`);
  return new RegExp(terms.join('|'), 'gu');
}
export function translate(value, locale = currentLocale()) {
  const dictionary = dictionaries[locale];
  if (!dictionary || typeof value !== 'string') return value;
  if (Object.hasOwn(dictionary, value)) return dictionary[value];
  if (!knownTranslations.has(locale)) knownTranslations.set(locale, new Set(Object.values(dictionary)));
  if (knownTranslations.get(locale).has(value)) return value;
  if (/^(?:RON|EUR)?[0-9.,\s€]+(?:RON|EUR)?$/.test(value)) return value;
  if (!/[A-Za-z]/.test(value) || /^(?:https?:\/\/|\/assets\/)/.test(value)) return value;
  if (!translatedValues.has(locale)) translatedValues.set(locale, new Map());
  const cache = translatedValues.get(locale);
  if (cache.has(value)) return cache.get(value);
  const pattern = patternFor(value, locale);
  const result = pattern ? value.replace(pattern, match => dictionary[match]) : value;
  if (cache.size >= 1000) cache.clear();
  cache.set(value, result);
  return result;
}

export function localePath(path, locale = currentLocale()) {
  const logical = logicalRoute(stripBasePath(path));
  return toSitePath(locale !== 'en' && localeIds.includes(locale) ? `/${locale}${logical}` : logical);
}
export function localizeMarkup(markup, locale = currentLocale()) {
  if (locale === 'en') return markup;
  const translated = markup.split(/(<script\b[\s\S]*?<\/script>)/g).map(part => {
    if (part.startsWith('<script')) return part;
    return part.replace(/<[^>]+>|[^<]+/g, token => {
      if (!token.startsWith('<')) return translate(token, locale);
      return token.replace(/(aria-label|alt|title|placeholder|content)="([^"]*)"/g,
        (_, name, value) => `${name}="${translate(value, locale)}"`);
    });
  }).join('');
  return translated.replace(/<a\b[^>]*>/g, tag => {
    if (tag.includes('data-language-link')) return tag;
    return tag.replace(/href="(\/[^\"]*)"/, (_, path) => {
      if (stripBasePath(path).startsWith('/assets/')) return `href="${path}"`;
      return `href="${localePath(path, locale)}"`;
    });
  });
}
export function localizedProduct(product, locale = currentLocale(), market = currentMarket(locale)) {
  if (!product) return null;
  const protectedKeys = new Set(['id','slot','handle','categoryId','placeholderVariant','src','zoomSrc','image','status','slug','currency','type','icon','mimeType','aspectRatio','key','focal','sources']);
  const localize = (value, key) => {
    if (protectedKeys.has(key)) return value;
    if (typeof value === 'string') return translate(value, locale);
    if (Array.isArray(value)) return value.map(item => localize(item));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, child]) => [name, localize(child, name)]));
    return value;
  };
  const currency = marketCurrency(market);
  return {
    ...localize(product), locale, market, currency,
    slug: locale === 'en' ? product.slug : `/${locale}${product.slug}`,
    price: product.regionalPrices?.[currency] ?? null,
    variants: product.variants.map(variant => ({ ...localize(variant), price: variant.regionalPrices?.[currency] ?? null })),
  };
}
