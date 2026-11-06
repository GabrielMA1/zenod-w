import '../data/dictionaries.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { localeIds, defaultMarket, marketPreference, markets } from '../data/locales.js';
import { pages } from '../data/pages.js';
import { imageManifest, productGallerySlots, resolveImage } from '../data/media.js';
import { missingTranslations } from '../scripts/translation-coverage.mjs';
import { toAbsoluteSiteUrl } from '../data/deployment.js';

const read = (output) => readFileSync(new URL(`../${output}`, import.meta.url), 'utf8');

test('nine published languages, with Polish and Dutch in every route set', () => {
  assert.deepEqual(localeIds, ['en', 'ro', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'nl']);
  const english = pages.filter((page) => page.locale === 'en');
  for (const locale of ['pl', 'nl']) {
    assert.equal(pages.filter((page) => page.locale === locale).length, english.length);
  }
  assert.equal(pages.length, english.length * localeIds.length);
});

test('every customer-visible string has an exact translation in every language', () => {
  const missing = missingTranslations();
  assert.deepEqual(missing, {}, JSON.stringify(missing, null, 2).slice(0, 2000));
});

test('only approved markets exist and language never implies a market except Romanian', () => {
  assert.deepEqual(Object.keys(markets), ['EU', 'RO']);
  assert.deepEqual(Object.values(markets).map((market) => market.currency), ['EUR', 'RON']);
  for (const locale of localeIds) assert.equal(defaultMarket(locale), locale === 'ro' ? 'RO' : 'EU');
});

test('a market is explicit only when chosen; defaults are not treated as choices', () => {
  const storage = new Map();
  globalThis.window = {
    location: { href: 'https://zenodetail.com/ro/' },
    localStorage: { getItem: (key) => storage.get(key) ?? null },
  };
  try {
    assert.deepEqual(marketPreference('ro'), { market: 'RO', explicit: false });
    assert.deepEqual(marketPreference('en'), { market: 'EU', explicit: false });
    storage.set('zeno-detail-market', 'EU');
    assert.deepEqual(marketPreference('ro'), { market: 'EU', explicit: true }, 'A Romanian reader can keep European prices');
    window.location.href = 'https://zenodetail.com/de/?market=RO';
    assert.deepEqual(marketPreference('de'), { market: 'RO', explicit: true });
  } finally {
    delete globalThis.window;
  }
});

test('pages carry their default market, both regional prices and both delivery variants', () => {
  for (const locale of localeIds) {
    const prefix = locale === 'en' ? '' : `${locale}/`;
    const product = read(`${prefix}products/drying-towel/index.html`);
    assert.match(product, new RegExp(`<html lang="${locale}" data-market="${defaultMarket(locale)}">`));
    assert.match(product, /data-market-price data-price-eu="[^"]*22[.,]85[^"]*" data-price-ro="[^"]*90[.,]00[^"]*"/);
    assert.match(product, /data-market-only="RO"/);
    assert.match(product, /data-market-only="EU"/);
    assert.match(product, /data-preferences-form/);
    assert.ok(!/<del\b/.test(product), 'No crossed-out reference price');
    const home = read(`${prefix}index.html`);
    assert.match(home, /zeno-detail-market/, 'Pre-paint market script present');
    assert.equal(home.includes('zeno-detail-language'), locale === 'en', 'Only the English root may restore a saved language');
    if (toAbsoluteSiteUrl('/')) {
      for (const alternate of ['pl', 'nl', 'x-default']) assert.ok(home.includes(`hreflang="${alternate}"`), `${locale} home → ${alternate}`);
    }
  }
});

test('the preferences selector lists native language names and approved regions only', () => {
  const html = read('index.html');
  for (const name of ['English', 'Română', 'Deutsch', 'Français', 'Español', 'Italiano', 'Português', 'Polski', 'Nederlands']) {
    assert.ok(html.includes(`>${name}</span>`), name);
  }
  const regions = [...html.matchAll(/name="market" value="([A-Z]+)"/g)].map((match) => match[1]);
  assert.deepEqual(regions, ['EU', 'RO']);
  assert.ok(!/GBP|CHF|SEK|PLN/.test(html), 'No unapproved currencies');
});

test('image manifest slots are complete and fallbacks exist on disk', () => {
  const statuses = Object.keys(imageManifest.statuses);
  for (const [id, entry] of Object.entries(imageManifest.library)) {
    for (const width of entry.widths) {
      for (const format of ['avif', 'webp']) assert.ok(existsSync(new URL(`../${entry.path}-${width}.${format}`, import.meta.url)), `${id} ${width}.${format}`);
    }
  }
  for (const [id, slot] of Object.entries(imageManifest.slots)) {
    assert.ok(statuses.includes(slot.status), `${id} status`);
    assert.ok(slot.destination && slot.ratio?.length === 2 && slot.alt && slot.location, `${id} fields`);
    if (slot.fallback) assert.ok(imageManifest.library[slot.fallback], `${id} fallback`);
    if (slot.status === 'blocked') assert.ok(slot.blockedBy, `${id} reason`);
    const image = resolveImage(id);
    if (image.kind !== 'placeholder') assert.ok(existsSync(new URL(`..${image.src}`, import.meta.url)), `${id} renders an existing file`);
  }
  assert.ok(productGallerySlots().every((image) => image.kind !== 'placeholder'), 'Gallery never shows an empty frame');
});
