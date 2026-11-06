import { products, getProduct } from '../../data/products.js';
import { localizedProduct } from '../../data/localization.js';
import { journalPageMarkup, articlePageMarkup } from './pages/journal-page.js';
import { homePageMarkup } from './pages/home.js';
import { productPageMarkup } from './pages/product-page.js';
import { collectionPageMarkup } from './pages/collection-page.js';
import { aboutPageMarkup, faqPageMarkup, shippingPageMarkup, unavailablePageMarkup } from './pages/content-pages.js';

export function renderPage(page) {
  const product = getProduct(page.product ?? products[0].id, page.locale);
  if (page.type === 'home') return homePageMarkup(product);
  if (page.type === 'product' && product) return productPageMarkup(product);
  if (page.type === 'collection') {
    const collectionProducts = page.collection === 'all-products'
      ? products.filter((item) => item.status === 'active')
      : products.filter((item) => item.status === 'active' && item.categoryId === page.collection);
    return collectionPageMarkup(page, collectionProducts.map((item) => localizedProduct(item, page.locale)));
  }
  if (page.type === 'journal') return journalPageMarkup(page);
  if (page.type === 'article') return articlePageMarkup(page, product);
  if (page.type === 'about') return aboutPageMarkup(page, product);
  if (page.type === 'faq') return faqPageMarkup(page, product);
  if (page.type === 'shipping') return shippingPageMarkup(page, page.locale);
  return unavailablePageMarkup();
}

export function initPageInteractions() {
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

  // Mobile: once the main "Add to bag" button scrolls out of view, offer it at the bottom.
  const sticky = document.querySelector('[data-sticky-purchase]');
  const primaryButton = document.querySelector('.pdp__buy [data-add-to-cart]');
  if (sticky && primaryButton && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      sticky.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
    });
    observer.observe(primaryButton);
  }
}
