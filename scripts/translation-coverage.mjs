// Translation coverage: every customer-visible or accessible English string rendered on a
// public page (plus the strings the browser renders at runtime) must have an exact entry in
// every published language. Mirrors the token rules of localizeMarkup in data/localization.js.
import { localeIds, locales } from '../data/locales.js';
import { dictionaries } from '../data/localization.js';
import { pages } from '../data/pages.js';
import { featureEnabled, footerNavigation } from '../data/site.js';
import { renderPage } from '../assets/js/pages.js';
import { announcementMarkup, footerMarkup, headerMarkup, overlayMarkup } from '../assets/js/components/shell.js';

// Strings the browser renders after load (bag drawer, search, announcements).
export const runtimeStrings = [
  'Bag', ' item', ' items', ' added to your bag.', ' removed from your bag.', 'Item removed from your bag.',
  'Quantity updated to ', 'Prices are now shown in RON.', 'Prices are now shown in EUR.',
  'Product', 'Care guide', 'No matches.', 'Try “towel”, “drying” or “microfiber”.',
  'Your bag is empty.', 'The ZENO Drying Towel is our first product.', 'View the towel', 'Subtotal',
  'Delivery in Romania is free.', 'Shipping outside Romania is calculated for your address at checkout.',
  'Online ordering is not open yet.', 'Your bag is saved on this device. Payment and delivery options will appear here when ordering opens.',
  'Continue shopping', 'Remove', ' each', 'Single towel', 'Quantity for ', 'Decrease quantity', 'Increase quantity',
];

// Brand names, codes and native language names stay as they are in every language.
const neutral = new Set([
  'ZENO DETAIL', 'ZENO', 'GSM', '850 GSM', 'EUR €', 'RON lei', '·', '/', 'ZENO DETAIL logo',
  ...Object.values(locales).map((locale) => locale.label),
]);

const checkedMeta = new Set(['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description']);
const prefixes = ['Enlarge ', 'Quantity for '];

function tokensOf(markup) {
  const tokens = [];
  for (const part of markup.split(/(<script\b[\s\S]*?<\/script>)/g)) {
    if (part.startsWith('<script')) continue;
    for (const token of part.match(/<[^>]+>|[^<]+/g) ?? []) {
      if (!token.startsWith('<')) { tokens.push(token); continue; }
      const isMeta = /^<meta\b/i.test(token);
      if (isMeta) {
        const name = token.match(/\b(?:name|property)="([^"]*)"/)?.[1];
        if (!checkedMeta.has(name)) continue;
      }
      for (const match of token.matchAll(/(aria-label|alt|title|placeholder|content)="([^"]*)"/g)) tokens.push(match[2]);
    }
  }
  return tokens;
}

function needsTranslation(text) {
  if (!/[A-Za-z]{2}/.test(text)) return false;
  if (neutral.has(text)) return false;
  if (/^(?:https?:\/\/|\/)/.test(text)) return false;
  if (/^©\s*\d{4}\s+ZENO DETAIL$/.test(text)) return false;
  return true;
}

function covered(text, dictionary) {
  if (Object.hasOwn(dictionary, text)) return true;
  const suffixed = text.match(/^(.*) \| ZENO DETAIL$/);
  if (suffixed) return covered(suffixed[1], dictionary);
  const counted = text.match(/^(.*), \d+ of \d+$/);
  if (counted) return Object.hasOwn(dictionary, ' of ') && covered(counted[1], dictionary);
  const prefix = prefixes.find((item) => text.startsWith(item));
  if (prefix) return Object.hasOwn(dictionary, prefix) && covered(text.slice(prefix.length), dictionary);
  return false;
}

export function englishStrings() {
  // Feature-gated navigation labels are included so enabling a feature never exposes English.
  const strings = new Set([...runtimeStrings, ...Object.keys(footerNavigation), ...Object.values(footerNavigation).flat().map((link) => link.label)]);
  for (const page of pages.filter((item) => item.locale === 'en')) {
    const markup = [
      `<title>${page.title}</title><meta name="description" content="${page.description}">`,
      announcementMarkup(), headerMarkup(page.route, 'en'), renderPage(page), footerMarkup(page.route, 'en'), overlayMarkup(page.route, 'en'),
      featureEnabled('legalReady') ? '' : '', // legal pages are rendered as "not found" until enabled
      '<a class="skip-link" href="#main-content">Skip to content</a>',
    ].join('');
    for (const token of tokensOf(markup)) {
      const text = token.replace(/\s+/g, ' ').trim().replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
      if (needsTranslation(text)) strings.add(text);
    }
  }
  return [...strings].map((item) => item);
}

export function missingTranslations() {
  const strings = englishStrings();
  const missing = {};
  for (const locale of localeIds.filter((id) => id !== 'en')) {
    const dictionary = dictionaries[locale] ?? {};
    const absent = strings.filter((text) => {
      const trimmed = text.trim();
      return !covered(text, dictionary) && !covered(trimmed, dictionary);
    });
    if (absent.length) missing[locale] = absent;
  }
  return missing;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const missing = missingTranslations();
  const total = Object.values(missing).reduce((sum, items) => sum + items.length, 0);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(missing, null, 2));
  } else if (process.argv.includes('--strings')) {
    console.log(JSON.stringify(englishStrings(), null, 2));
  } else {
    for (const [locale, items] of Object.entries(missing)) console.log(`${locale}: ${items.length} missing`);
  }
  process.exitCode = total ? 1 : 0;
}
