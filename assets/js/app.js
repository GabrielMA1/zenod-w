import { siteConfig } from '../../data/site.js';
import { initCart } from './components/cart.js';
import { initGalleries } from './components/gallery.js';
import { initShell } from './components/shell.js';
import { initPageInteractions } from './pages.js';

function configureAbsoluteMetadata() {
  if (!siteConfig.baseUrl) return;
  document.querySelectorAll('[data-canonical-path]').forEach((element) => {
    const absoluteUrl = new URL(element.dataset.canonicalPath, siteConfig.baseUrl).href;
    if (element.tagName === 'LINK') element.href = absoluteUrl;
    else element.content = absoluteUrl;
  });
}

function boot() {
  document.documentElement.classList.add('js');
  initShell();
  initGalleries();
  initPageInteractions();
  initCart();
  configureAbsoluteMetadata();
}

boot();
