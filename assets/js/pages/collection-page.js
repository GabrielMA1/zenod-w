import { escapeHtml } from '../lib/html.js';
import { toSitePath } from '../../../data/deployment.js';
import { productCardMarkup } from '../components/product.js';

export function collectionPageMarkup(page, products) {
  const title = page.collection === 'drying' ? 'Vehicle drying, refined.' : 'Meet the ZENO Drying Towel.';
  const intro = page.collection === 'drying'
    ? 'A soft microfiber towel designed for the final step after washing your vehicle.'
    : 'Premium microfiber for vehicle drying, finished in blue with black edging.';

  return `<section class="page-intro" aria-labelledby="collection-title">
    <div class="shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath('/')}">Home</a></li><li aria-current="page">Shop</li></ol></nav>
      <h1 id="collection-title">${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(intro)}</p>
    </div>
  </section>
  <section class="collection" id="catalog" aria-labelledby="catalog-title">
    <div class="shell">
      <h2 class="sr-only" id="catalog-title">Products</h2>
      ${products.map((product) => productCardMarkup(product)).join('')}
    </div>
  </section>`;
}
