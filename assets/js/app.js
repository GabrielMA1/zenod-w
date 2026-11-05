import { currentLocale, localizeMarkup } from '../../data/localization.js';
import { currentMarket, defaultMarket, localeForPath } from '../../data/locales.js';
import { stripBasePath } from '../../data/deployment.js';
import { siteConfig } from '../../data/site.js';
import { toAbsoluteSiteUrl } from '../../data/deployment.js';
import { initCart } from './components/cart.js';
import { initGalleries } from './components/gallery.js';
import { initShell } from './components/shell.js';
import { initPageInteractions, renderPage, pageFromDocument } from './pages.js';

function configureAbsoluteMetadata() {
  if (!siteConfig.baseUrl) return;
  document.querySelectorAll('[data-canonical-path]').forEach((element) => {
    const absoluteUrl = toAbsoluteSiteUrl(element.dataset.canonicalPath);
    if (!absoluteUrl) return;
    if (element.tagName === 'LINK') element.href = absoluteUrl;
    else element.content = absoluteUrl;
  });
}

function configureMarket() {
  const locale = currentLocale();
  const market = currentMarket(locale);
  const explicit = new URL(window.location.href).searchParams.get('market');
  if (['RO', 'EU'].includes(explicit)) {
    try { window.localStorage.setItem('zeno-detail-market', explicit); } catch { /* Links retain URL context. */ }
  }
  if (market !== defaultMarket(locale)) {
    document.querySelector('#main-content').innerHTML = localizeMarkup(renderPage(pageFromDocument()), locale);
  }
  document.querySelectorAll('[data-market-currency]').forEach(element => { element.textContent = market === 'RO' ? 'RON' : 'EUR'; });
  document.querySelectorAll('[data-market-select]').forEach(select => {
    select.value = market;
    select.addEventListener('change', () => {
      if (!['RO', 'EU'].includes(select.value)) return;
      try { window.localStorage.setItem('zeno-detail-market', select.value); } catch { /* URL carries the selection. */ }
      const url = new URL(window.location.href);
      url.searchParams.set('market', select.value);
      window.location.assign(url.href);
    });
  });
  function preserveMarket(link) {
    if (!link || link.getAttribute('href')?.startsWith('#')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || stripBasePath(url.pathname).startsWith('/assets/')) return;
    const targetLocale = localeForPath(stripBasePath(url.pathname));
    if (market !== defaultMarket(targetLocale)) url.searchParams.set('market', market);
    else url.searchParams.delete('market');
    link.href = url.pathname + url.search + url.hash;
  }
  document.querySelectorAll('a[href]').forEach(preserveMarket);
  document.addEventListener('click', event => preserveMarket(event.target.closest?.('a[href]')));
}

function boot() {
  document.documentElement.classList.add('js');
  configureMarket();
  initShell();
  initGalleries();
  initPageInteractions();
  initCart();
  configureAbsoluteMetadata();
}

boot();
