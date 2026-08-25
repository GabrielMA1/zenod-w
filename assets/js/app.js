import { siteConfig } from '../../data/site.js';
import { toAbsoluteSiteUrl } from '../../data/deployment.js';
import { initCart } from './components/cart.js';
import { initGalleries } from './components/gallery.js';
import { initShell } from './components/shell.js';
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

function boot() {
  document.documentElement.classList.add('js');
  initShell();
  initGalleries();
  initPageInteractions();
  initCart();
  configureAbsoluteMetadata();
}

boot();
