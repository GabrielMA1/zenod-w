import { currentLocale, registerDictionary } from '../../data/localization.js';
import { defaultMarket, localeForPath, marketPreference, marketStorageKey } from '../../data/locales.js';
import { stripBasePath, toAbsoluteSiteUrl } from '../../data/deployment.js';
import { siteConfig } from '../../data/site.js';
import { initCart, refreshCart } from './components/cart.js';
import { initGalleries } from './components/gallery.js';
import { initShell } from './components/shell.js';
import { initPreferences } from './components/preferences.js';
import { initPageInteractions } from './pages.js';

function configureAbsoluteMetadata() {
  if (!siteConfig.baseUrl) return;
  document.querySelectorAll('[data-canonical-path]').forEach((element) => {
    const absoluteUrl = toAbsoluteSiteUrl(element.dataset.canonicalPath);
    if (!absoluteUrl) return;
    if (element.tagName === 'LINK') element.href = absoluteUrl;
    else element.content = absoluteUrl;
  });
}

function announce(message) {
  const region = document.querySelector('#site-live-region');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

function storageAvailable() {
  try {
    window.localStorage.setItem('__zeno-storage-test', '1');
    window.localStorage.removeItem('__zeno-storage-test');
    return true;
  } catch {
    return false;
  }
}

// Without browser storage an explicit market choice travels in internal link URLs.
// An unchosen default is never propagated.
let storageWorks = null;
function preserveMarket(link) {
  if (storageWorks || !link || link.getAttribute('href')?.startsWith('#')) return;
  const url = new URL(link.href);
  if (url.origin !== window.location.origin || stripBasePath(url.pathname).startsWith('/assets/')) return;
  const current = marketPreference(currentLocale());
  if (!current.explicit) return;
  if (current.market !== defaultMarket(localeForPath(stripBasePath(url.pathname)))) url.searchParams.set('market', current.market);
  else url.searchParams.delete('market');
  link.href = url.pathname + url.search + url.hash;
}

// Show the chosen market everywhere: market-only text is switched by CSS from the html
// attribute; prices are swapped from their data attributes; the bag re-renders.
function applyMarket(market, { refresh = true } = {}) {
  const root = document.documentElement;
  root.dataset.market = market;
  document.querySelectorAll('[data-market-price]').forEach((element) => {
    const value = element.getAttribute(`data-price-${market.toLowerCase()}`);
    if (value) element.textContent = value;
  });
  delete root.dataset.marketPending;
  if (!storageWorks) document.querySelectorAll('a[href]').forEach(preserveMarket);
  if (refresh) refreshCart();
}

function configureMarket() {
  storageWorks = storageAvailable();
  const { market } = marketPreference(currentLocale());
  const fromUrl = new URL(window.location.href).searchParams.get('market');
  if (fromUrl === market && storageWorks) window.localStorage.setItem(marketStorageKey, market);
  applyMarket(market, { refresh: false });
  if (!storageWorks) document.addEventListener('click', (event) => preserveMarket(event.target.closest?.('a[href]')));
}

// Static HTML is already translated; the browser needs a dictionary only for text it renders
// itself (bag, search, announcements), so it fetches just the current language.
const dictionaryLoaders = import.meta.glob('../../data/translations/*.json', { import: 'default' });

async function loadDictionary(locale) {
  const load = dictionaryLoaders[`../../data/translations/${locale}.json`];
  if (!load) return;
  try { registerDictionary(locale, await load()); } catch { /* Static content stays translated. */ }
}

async function boot() {
  document.documentElement.classList.add('js');
  configureMarket();
  await loadDictionary(currentLocale());
  initShell();
  initPreferences({ applyMarket, announce });
  initGalleries();
  initPageInteractions();
  initCart();
  configureAbsoluteMetadata();
}

boot();
