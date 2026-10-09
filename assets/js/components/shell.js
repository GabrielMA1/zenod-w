import { primaryNavigation, siteConfig, visibleFooterNavigation } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';

function currentLink(href, route) {
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

export function headerMarkup(route) {
  const cartButton = siteConfig.features.localCart ? `<button class="header-button header-cart" type="button" data-open-cart aria-label="Open cart, 0 items" aria-controls="cart-dialog">
    Cart<span class="cart-count" data-cart-count hidden>0</span>
  </button>` : '';

  return `<header class="site-header" data-site-header>
    <div class="shell header-inner">
      <a class="brand-lockup" href="${toSitePath('/')}" aria-label="ZENO DETAIL home">
        <img src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="ZENO DETAIL" width="1180" height="980">
      </a>
      <nav class="primary-nav" aria-label="Primary"><ul>${navLinksMarkup(route)}</ul></nav>
      <div class="header-actions">
        ${cartButton}
        <button class="header-button mobile-menu-button" type="button" data-open-mobile-menu aria-expanded="false" aria-controls="mobile-menu-dialog">Menu</button>
      </div>
    </div>
  </header>`;
}

export function footerMarkup() {
  return `<footer class="site-footer">
    <div class="shell footer-top">
      <div class="footer-brand">
        <a class="brand-lockup" href="${toSitePath('/')}" aria-label="ZENO DETAIL home">
          <img src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="ZENO DETAIL" width="1180" height="980" loading="lazy">
        </a>
        <p>Premium car-care essentials, starting with the ZENO Drying Towel.</p>
      </div>
      <nav class="footer-nav" aria-label="Footer">${footerColumnsMarkup()}</nav>
    </div>
    <div class="shell footer-bottom">
      <p>© ${new Date().getFullYear()} ZENO DETAIL.</p>
    </div>
  </footer>`;
}

export function overlayMarkup(route) {
  return `<dialog class="mobile-drawer" id="mobile-menu-dialog" aria-labelledby="mobile-menu-title">
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
