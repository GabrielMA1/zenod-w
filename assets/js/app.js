import { currentLocale } from '../../data/localization.js';
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
  if (refresh) refreshCart();
}

function configureMarket() {
  const locale = currentLocale();
  const { market } = marketPreference(locale);
  const fromUrl = new URL(window.location.href).searchParams.get('market');
  if (fromUrl === market) {
    try { window.localStorage.setItem(marketStorageKey, market); } catch { /* Links keep the URL value. */ }
  }
  applyMarket(market, { refresh: false });

  // Browser storage normally carries an explicit choice between pages. Without storage,
  // internal links carry it in the URL instead. An unchosen default is never propagated.
  if (storageAvailable()) return;
  function preserveMarket(link) {
    if (!link || link.getAttribute('href')?.startsWith('#')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || stripBasePath(url.pathname).startsWith('/assets/')) return;
    const current = marketPreference(locale);
    if (!current.explicit) return;
    if (current.market !== defaultMarket(localeForPath(stripBasePath(url.pathname)))) url.searchParams.set('market', current.market);
    else url.searchParams.delete('market');
    link.href = url.pathname + url.search + url.hash;
  }
  document.querySelectorAll('a[href]').forEach(preserveMarket);
  document.addEventListener('click', (event) => preserveMarket(event.target.closest?.('a[href]')));
}

function boot() {
  document.documentElement.classList.add('js');
  configureMarket();
  initShell();
  initPreferences({ applyMarket, announce });
  initGalleries();
  initPageInteractions();
  initCart();
  configureAbsoluteMetadata();
}

boot();
