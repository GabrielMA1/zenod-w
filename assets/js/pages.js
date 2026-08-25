import { products, getProduct } from '../../data/products.js';
import { getPage } from '../../data/pages.js';
import { homePageMarkup } from './pages/home.js';
import { productPageMarkup } from './pages/product-page.js';
import { collectionPageMarkup } from './pages/collection-page.js';
import { aboutPageMarkup, faqPageMarkup, unavailablePageMarkup } from './pages/content-pages.js';

export function renderPage(page) {
  const product = page.product ? getProduct(page.product) : products[0];
  if (page.type === 'home') return homePageMarkup(product);
  if (page.type === 'product' && product) return productPageMarkup(product);
  if (page.type === 'collection') {
    const collectionProducts = page.collection === 'all-products'
      ? products.filter((item) => item.status === 'active')
      : products.filter((item) => item.status === 'active' && item.categoryId === page.collection);
    return collectionPageMarkup(page, collectionProducts);
  }
  if (page.type === 'about') return aboutPageMarkup(product);
  if (page.type === 'faq') return faqPageMarkup(product);
  return unavailablePageMarkup();
}

export function initPageInteractions() {
  document.addEventListener('change', (event) => {
    const variant = event.target.closest('input[name="variant"][data-variant-price]');
    if (!variant?.checked) return;
    const price = variant.dataset.variantPrice ?? '';
    const compareAt = variant.dataset.variantCompareAt ?? '';
    const priceContainer = document.querySelector('[data-product-price]');
    const currentPrice = priceContainer?.querySelector('[data-current-price]');
    const comparePrice = priceContainer?.querySelector('[data-compare-price]');
    if (currentPrice) currentPrice.textContent = price;
    if (comparePrice) {
      comparePrice.textContent = compareAt;
      comparePrice.hidden = !compareAt;
    }
    const stickyPrice = document.querySelector('[data-sticky-price]');
    if (stickyPrice) stickyPrice.textContent = price;
  });

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-quantity-control]');
    if (!control) return;
    const output = control.querySelector('[data-quantity-value]');
    const current = Number.parseInt(output?.value ?? output?.textContent ?? '1', 10) || 1;
    let next = current;
    if (event.target.closest('[data-quantity-increase]')) next = Math.min(99, current + 1);
    else if (event.target.closest('[data-quantity-decrease]')) next = Math.max(1, current - 1);
    else return;
    output.value = String(next);
    output.textContent = String(next);
    control.querySelector('[data-quantity-decrease]').disabled = next <= 1;
    control.querySelector('[data-quantity-increase]').disabled = next >= 99;
  });

  const sticky = document.querySelector('[data-sticky-purchase]');
  const primaryButton = document.querySelector('.pdp-buy-box [data-add-to-cart]');
  if (sticky && primaryButton) {
    let queued = false;
    const syncStickyPurchase = () => {
      sticky.hidden = primaryButton.getBoundingClientRect().bottom >= 0;
      queued = false;
    };
    const queueStickyPurchase = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(syncStickyPurchase);
    };
    syncStickyPurchase();
    window.addEventListener('scroll', queueStickyPurchase, { passive: true });
    window.addEventListener('resize', queueStickyPurchase, { passive: true });
  }
}

export function pageFromDocument() {
  return getPage(document.body.dataset.route ?? window.location.pathname);
}
