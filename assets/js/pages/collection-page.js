import { toSitePath } from '../../../data/deployment.js';
import { productListingMarkup } from '../components/product.js';
import { guideListMarkup } from '../components/blocks.js';
import { pageHeadMarkup } from './content-pages.js';

export function collectionPageMarkup(page, products) {
  return `${pageHeadMarkup(page, { breadcrumbs: `<li><a href="${toSitePath('/')}">Home</a></li><li aria-current="page">Shop</li>` })}
  <section class="shell collection" aria-label="Products">
    ${products.map((product) => productListingMarkup(product, { headingLevel: 2 })).join('')}
  </section>
  <section class="section guides-band" aria-labelledby="shop-guides-title">
    <div class="shell split">
      <div class="split__head"><h2 id="shop-guides-title">Before you choose</h2><p>What to compare in a drying towel, and how to look after microfiber.</p></div>
      ${guideListMarkup()}
    </div>
  </section>`;
}
