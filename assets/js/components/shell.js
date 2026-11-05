import { locales, logicalRoute as stripLocale } from '../../../data/locales.js';
import { primaryNavigation, siteConfig, visibleFooterNavigation, featureEnabled } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';
import { localePath } from '../../../data/localization.js';
import { initSearch, searchDialogMarkup } from './search.js';
import { marketTextMarkup } from './market.js';
import { preferencesPanelMarkup, preferencesSummaryMarkup, preferencesToggleMarkup } from './preferences.js';

const wordmark = (tone) => `/assets/images/brand/zeno-wordmark-${tone}.svg`;

function currentLink(href, route) {
  route = stripLocale(route);
  const target = href.split('#')[0] || '/';
  if (target === '/products/drying-towel/' && ['/shop/', '/collections/all-products/', '/collections/drying/'].includes(route)) return false;
  if (href === '/' && route === '/') return true;
  return target !== '/' && route.startsWith(target);
}

function visibleNavigation() {
  return primaryNavigation.filter((item) => featureEnabled(item.feature));
}

function navLinksMarkup(route) {
  return visibleNavigation().map((item) => `<li><a href="${escapeHtml(toSitePath(item.href))}"${currentLink(item.href, route) ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`).join('');
}

function brandMarkup(className = 'brand') {
  return `<a class="${className}" href="${toSitePath('/')}" aria-label="ZENO DETAIL home"><img class="brand__symbol" src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524"><img class="brand__wordmark" src="${toSitePath(wordmark('white'))}" alt="" width="1112" height="356"></a>`;
}

export function announcementMarkup() {
  const announcement = siteConfig.announcement;
  if (!announcement.enabled || !announcement.byMarket) return '';
  return `<aside class="announcement" aria-label="Store announcement"><div class="shell announcement__inner">
    <p>${marketTextMarkup(announcement.byMarket)}</p>
    ${announcement.link ? `<a href="${escapeHtml(toSitePath(announcement.link))}">Delivery information</a>` : ''}
  </div></aside>`;
}

export function headerMarkup(route, locale = 'en') {
  return `<header class="site-header" data-site-header><div class="shell site-header__inner">
    ${brandMarkup()}
    <nav class="primary-nav" aria-label="Primary"><ul>${navLinksMarkup(stripLocale(route))}</ul></nav>
    <div class="header-actions">
      <div class="prefs">${preferencesToggleMarkup(locale)}</div>
      <button class="icon-button" type="button" data-open-search aria-label="Search the store" aria-controls="search-dialog">${icon('search')}</button>
      <button class="bag-button" type="button" data-open-cart aria-label="Bag" aria-controls="cart-dialog">${icon('bag')}<span class="bag-button__label">Bag</span><span class="bag-count" data-cart-count hidden>0</span></button>
      <button class="icon-button menu-button" type="button" data-open-mobile-menu aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu-dialog">${icon('menu')}</button>
    </div>
  </div>${preferencesPanelMarkup(locale)}</header>`;
}

function footerColumnsMarkup() {
  return Object.entries(visibleFooterNavigation()).map(([heading, links]) => `<div class="footer-column">
    <h2>${escapeHtml(heading)}</h2>
    <ul>${links.map((link) => `<li><a href="${escapeHtml(toSitePath(link.href))}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
  </div>`).join('');
}

export function footerMarkup(route = '/', locale = 'en') {
  const logical = stripLocale(route);
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand">
        <img class="footer-brand__logo" src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="ZENO DETAIL" width="1180" height="980" loading="lazy">
        <p>ZENO DETAIL makes car-care accessories. The first is the ZENO Drying Towel.</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">${footerColumnsMarkup()}</nav>
      <div class="footer-prefs">
        <h2>Language and region</h2>
        ${preferencesToggleMarkup(locale, 'prefs-toggle prefs-toggle--footer')}
        <nav aria-label="Languages"><ul class="footer-languages">${Object.entries(locales).map(([id, item]) => `<li><a href="${localePath(logical, id)}" data-language-link hreflang="${id}" lang="${id}"${locale === id ? ' aria-current="true"' : ''}>${escapeHtml(item.label)}</a></li>`).join('')}</ul></nav>
      </div>
    </div>
    <div class="shell footer-bottom">
      <p>© ${new Date().getFullYear()} ZENO DETAIL</p>
      <p>${marketTextMarkup({ RO: 'Prices shown in RON for the Romanian shopping region.', EU: 'Prices shown in EUR for the European shopping region.' })}</p>
      <a href="#main-content">Back to top</a>
    </div>
  </footer>`;
}

export function overlayMarkup(route, locale = 'en') {
  return `${searchDialogMarkup()}<dialog class="drawer drawer--start mobile-menu" id="mobile-menu-dialog" aria-labelledby="mobile-menu-title">
    <div class="drawer__panel">
      <div class="drawer__head">
        <h2 id="mobile-menu-title">Menu</h2>
        <button class="icon-button" type="button" data-close-dialog aria-label="Close navigation">${icon('close')}</button>
      </div>
      <div class="drawer__body">
        <nav aria-label="Mobile"><ul class="mobile-nav">${navLinksMarkup(stripLocale(route))}<li><a href="${toSitePath('/shop/')}">All products</a></li></ul></nav>
        <button class="mobile-prefs" type="button" aria-expanded="false" aria-controls="preferences-panel" data-preferences-toggle>
          <span>Language and region</span>${preferencesSummaryMarkup(locale)}
        </button>
      </div>
    </div>
  </dialog>
  ${siteConfig.features.localCart ? `<dialog class="drawer drawer--end cart-drawer" id="cart-dialog" aria-labelledby="cart-title">
    <div class="drawer__panel">
      <div class="drawer__head">
        <h2 id="cart-title" tabindex="-1">Bag <span class="sr-only" data-cart-count-label></span></h2>
        <button class="icon-button" type="button" data-close-dialog aria-label="Close bag">${icon('close')}</button>
      </div>
      <div class="drawer__body" data-cart-body></div>
      <div class="drawer__foot" data-cart-footer hidden></div>
    </div>
  </dialog>` : ''}`;
}

export function initShell() {
  initSearch();
  const mobileDialog = document.querySelector('#mobile-menu-dialog');
  const menuTrigger = document.querySelector('[data-open-mobile-menu]');

  function syncBodyLock() {
    document.body.classList.toggle('is-locked', Boolean(document.querySelector('dialog[open]')));
  }

  function openDialog(dialog, trigger) {
    if (!dialog || dialog.open) return;
    dialog.returnFocusElement = trigger;
    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('[data-close-dialog]')?.focus());
    syncBodyLock();
  }

  menuTrigger?.addEventListener('click', () => {
    menuTrigger.setAttribute('aria-expanded', 'true');
    openDialog(mobileDialog, menuTrigger);
  });

  document.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) closeButton.closest('dialog')?.close();
  });

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      if (dialog === mobileDialog) menuTrigger?.setAttribute('aria-expanded', 'false');
      syncBodyLock();
      dialog.returnFocusElement?.focus();
      dialog.returnFocusElement = null;
    });
  });
}
