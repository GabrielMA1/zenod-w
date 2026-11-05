import { primaryNavigation, siteConfig, visibleFooterNavigation } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';
import { localePath } from '../../../data/localization.js';
import { initSearch, searchDialogMarkup } from './search.js';

function currentLink(href, route) {
  route = route.replace(/^\/ro(?=\/|$)/, '') || '/';
  const target = href.split('#')[0] || '/';
  if (target === '/shop/' && ['/shop/', '/collections/all-products/', '/collections/drying/'].includes(route)) return true;
  if (href === '/' && route === '/') return true;
  return target !== '/' && route.startsWith(target);
}

function navLinksMarkup(route) {
  return primaryNavigation.map((item) => `<li><a href="${escapeHtml(toSitePath(item.href))}"${currentLink(item.href, route) ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`).join('');
}

function footerColumnsMarkup() {
  return Object.entries(visibleFooterNavigation()).map(([heading, links]) => `<div class="footer-column">
    <h2>${escapeHtml(heading)}</h2>
    <ul>${links.map((link) => `<li><a href="${escapeHtml(toSitePath(link.href))}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>
  </div>`).join('');
}

export function announcementMarkup() {
  if (!siteConfig.announcement.enabled || !siteConfig.announcement.text) return '';
  const content = siteConfig.announcement.link
    ? `<a href="${escapeHtml(toSitePath(siteConfig.announcement.link))}">${escapeHtml(siteConfig.announcement.text)}</a>`
    : escapeHtml(siteConfig.announcement.text);
  return `<aside class="announcement" aria-label="Store announcement"><p>${content}</p></aside>`;
}

export function headerMarkup(route, locale = 'en') {
  const logicalRoute = route.replace(/^\/ro(?=\/|$)/, '') || '/';
  return `<header class="site-header" data-site-header><div class="shell header-inner">
    <a class="brand-wordmark" href="${toSitePath('/')}" aria-label="ZENO DETAIL home"><img src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524"><span>ZENO <small>DETAIL</small></span></a>
    <nav class="primary-nav" aria-label="Primary"><ul>${navLinksMarkup(logicalRoute)}</ul></nav>
    <div class="header-actions"><details class="locale-switch"><summary>${locale === 'ro' ? 'RO / RON' : 'EN / EUR'}<span aria-hidden="true">⌄</span></summary><div><a href="${localePath(logicalRoute, 'en')}" data-language-link hreflang="en" lang="en" ${locale === 'en' ? 'aria-current="true"' : ''}>English · EUR</a><a href="${localePath(logicalRoute, 'ro')}" data-language-link hreflang="ro" lang="ro" ${locale === 'ro' ? 'aria-current="true"' : ''}>Română · RON</a></div></details>
      <button class="icon-button search-trigger" type="button" data-open-search aria-label="Search the store" aria-controls="search-dialog">${icon('search')}</button>
      <button class="header-button header-cart" type="button" data-open-cart aria-label="Bag, 0 items" aria-controls="cart-dialog">${icon('bag')}<span class="bag-label">Bag</span><span class="cart-count" data-cart-count hidden>0</span></button>
      <button class="icon-button mobile-menu-button" type="button" data-open-mobile-menu aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu-dialog">${icon('menu')}</button>
    </div></div></header>`;
}

export function footerMarkup() {
  return `<footer class="site-footer"><div class="shell footer-top"><div class="footer-brand"><a class="brand-wordmark" href="${toSitePath('/')}" aria-label="ZENO DETAIL home"><img src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524"><span>ZENO <small>DETAIL</small></span></a><p>Good care. Great finish.<br>For the love of the drive.</p><span class="footer-brand-name">ZENO DETAIL</span></div><nav class="footer-nav" aria-label="Footer">${footerColumnsMarkup()}</nav></div><div class="shell footer-bottom"><p>© ${new Date().getFullYear()} ZENO DETAIL. All rights reserved.</p><span>CAR CARE. WITH CHARACTER.</span><a href="#main-content">Back to top ↑</a></div><div class="footer-large-word" aria-hidden="true">IT’S IN THE DETAIL.</div></footer>`;
}

export function overlayMarkup(route) {
  return `${searchDialogMarkup()}<dialog class="mobile-drawer" id="mobile-menu-dialog" aria-labelledby="mobile-menu-title">
    <div class="drawer-panel">
      <div class="drawer-header">
        <h2 id="mobile-menu-title" class="label">Menu</h2>
        <button class="icon-button" type="button" data-close-dialog aria-label="Close navigation">${icon('close')}</button>
      </div>
      <nav class="mobile-nav-body" aria-label="Mobile"><ul class="mobile-nav-list">${navLinksMarkup(route)}</ul></nav>
      <a class="button button--wide mobile-nav-product" href="${toSitePath('/products/drying-towel/')}">Shop the Drying Towel ${icon('arrow')}</a>
    </div>
  </dialog>
  ${siteConfig.features.localCart ? `<dialog class="drawer cart-drawer" id="cart-dialog" aria-labelledby="cart-title">
    <div class="drawer-panel">
      <div class="drawer-header">
        <h2 id="cart-title" tabindex="-1">Cart <span class="sr-only" data-cart-count-label>0 items</span></h2>
        <button class="icon-button" type="button" data-close-dialog aria-label="Close cart">${icon('close')}</button>
      </div>
      <div class="drawer-body" data-cart-body></div>
      <div class="drawer-footer" data-cart-footer hidden></div>
    </div>
  </dialog>` : ''}`;
}

export function initShell() {
  initSearch();
  const mobileDialog = document.querySelector('#mobile-menu-dialog');
  const menuTrigger = document.querySelector('[data-open-mobile-menu]');
  const header = document.querySelector('[data-site-header]');

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

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
