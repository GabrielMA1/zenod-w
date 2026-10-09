import { getProduct, getPublicVariants, getVerifiedSpecifications, formatPrice, formatMoney } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { galleryMarkup } from '../components/gallery.js';
import { icon } from '../components/icons.js';
import { faqListMarkup } from '../components/blocks.js';
import { productCardMarkup, productLabelMarkup, quantityControlMarkup, swatchMarkup } from '../components/product.js';

function variantsMarkup(product) {
  const variants = getPublicVariants(product);
  if (!variants.length) return '';
  if (variants.length === 1) return `<input type="hidden" name="variant" value="${escapeHtml(variants[0].id)}">`;
  return `<fieldset class="variant-selector">
    <legend>Pack</legend>
    <div class="variant-options">${variants.map((variant, index) => {
      const price = formatMoney(variant.price, product.currency);
      const compareAt = Number.isFinite(variant.compareAt) && Number.isFinite(variant.price) && variant.compareAt > variant.price
        ? formatMoney(variant.compareAt, product.currency)
        : null;
      return `<label class="variant-option">
        <input type="radio" name="variant" value="${escapeHtml(variant.id)}" data-variant-price="${escapeHtml(price ?? '')}" data-variant-compare-at="${escapeHtml(compareAt ?? '')}" ${index === 0 ? 'checked' : ''}>
        <span><strong>${escapeHtml(variant.title)}</strong>${price ? `<small>${escapeHtml(price)}</small>` : ''}</span>
        ${variant.badge ? `<em>${escapeHtml(variant.badge)}</em>` : ''}
      </label>`;
    }).join('')}</div>
  </fieldset>`;
}

function buyBoxMarkup(product) {
  const variants = getPublicVariants(product);
  const primaryVariant = variants[0] ?? null;
  const priceAmount = primaryVariant?.price ?? product.price;
  const compareAtAmount = primaryVariant?.compareAt ?? product.compareAt;
  const price = formatPrice(product, primaryVariant);
  const compareAt = Number.isFinite(compareAtAmount) && Number.isFinite(priceAmount) && compareAtAmount > priceAmount
    ? formatMoney(compareAtAmount, product.currency)
    : null;
  const canAdd = siteConfig.features.localCart && product.purchasable && variants.length;
  return `<div class="pdp-buy-box" data-product-purchase>
    <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath('/')}">Home</a></li><li><a href="${toSitePath('/shop/')}">Shop</a></li><li aria-current="page">${escapeHtml(product.shortTitle)}</li></ol></nav>
    <h1>${escapeHtml(product.title)}</h1>
    <p class="pdp-subtitle">${escapeHtml(product.subtitle)}</p>
    ${price ? `<div class="pdp-price" data-product-price><span data-current-price>${escapeHtml(price)}</span><del data-compare-price ${compareAt ? '' : 'hidden'}>${escapeHtml(compareAt ?? '')}</del></div>` : ''}
    <p class="pdp-description">${escapeHtml(product.description)}</p>
    ${swatchMarkup(product)}
    ${variantsMarkup(product)}
    ${canAdd ? `<div class="purchase-controls">
      ${quantityControlMarkup(1, product.title)}
      <button class="button button--wide" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to cart ${icon('arrow')}</button>
    </div>` : ''}
    ${siteConfig.features.shippingReady && siteConfig.shipping.summary ? `<p class="buy-reassurance">${icon('check')}${escapeHtml(siteConfig.shipping.summary)}</p>` : ''}
    ${siteConfig.features.returnsReady && siteConfig.returns.summary ? `<p class="buy-reassurance">${icon('check')}${escapeHtml(siteConfig.returns.summary)}</p>` : ''}
    <ul class="buy-facts" aria-label="Product highlights">
      ${product.benefits.map((benefit) => `<li><strong>${escapeHtml(benefit.title)}.</strong> ${escapeHtml(benefit.body)}</li>`).join('')}
    </ul>
  </div>`;
}

function detailsMarkup(product) {
  const label = productLabelMarkup(product, { showPending: true });
  return `<section class="pdp-details" aria-labelledby="pdp-details-title">
    <div class="shell pdp-details__grid">
      <div class="pdp-details__copy">
        <h2 id="pdp-details-title">Drying deserves its own tool.</h2>
        <p class="lede">Once the wash is complete, the drying towel becomes the point of contact.</p>
        <p>ZENO gives that step a dedicated soft microfiber format with a distinct blue-and-black finish: blue microfiber, black edging and clean ZENO branding.</p>
      </div>
      ${label ? `<div class="pdp-details__label"><h3 class="label">Specifications</h3>${label}</div>` : ''}
    </div>
  </section>`;
}

function productFaqMarkup(product) {
  if (!product.faqs.length) return '';
  return `<section class="faq-band" aria-labelledby="pdp-faq-title">
    <div class="shell faq-layout">
      <h2 id="pdp-faq-title">Know the towel.</h2>
      ${faqListMarkup(product.faqs)}
    </div>
  </section>`;
}

function usageMarkup(product) {
  if (!product.usage.ready || !product.usage.steps.length) return '';
  return `<section class="usage-section" aria-labelledby="usage-title"><div class="shell">
    <h2 id="usage-title">A clear drying routine.</h2>
    <ol class="usage-steps">${product.usage.steps.map((step, index) => `<li><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p></li>`).join('')}</ol>
  </div></section>`;
}

function careMarkup(product) {
  if (!product.care.ready || !product.care.instructions.length) return '';
  return `<section class="care-section" aria-labelledby="care-title"><div class="content-shell care-section__grid">
    <div><h2 id="care-title">Keep it ready for the next wash.</h2></div>
    <ul>${product.care.instructions.map((instruction) => `<li>${icon('check')}<span>${escapeHtml(typeof instruction === 'string' ? instruction : instruction.text)}</span></li>`).join('')}</ul>
  </div></section>`;
}

function comparisonMarkup(product) {
  const comparison = product.comparison;
  if (!siteConfig.features.comparisonReady || !comparison.enabled || !comparison.columns.length || !comparison.rows.length) return '';
  return `<section class="comparison-section" aria-labelledby="comparison-title"><div class="shell">
    <h2 id="comparison-title">Choose with the facts in view.</h2>
    <div class="comparison-scroll" tabindex="0" role="region" aria-label="Product comparison table"><table><thead><tr><th scope="col">Detail</th>${comparison.columns.map((column) => `<th scope="col">${escapeHtml(column.title)}</th>`).join('')}</tr></thead><tbody>${comparison.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)}</th>${comparison.columns.map((column) => `<td>${escapeHtml(row.values?.[column.id] ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  </div></section>`;
}

function reviewsMarkup(product) {
  const reviews = product.reviews;
  if (!siteConfig.features.reviewsReady || !reviews.enabled || !reviews.count || !reviews.rating || !reviews.items.length) return '';
  return `<section class="reviews-section" aria-labelledby="reviews-title"><div class="shell">
    <div class="reviews-section__summary"><p class="label">Owner reviews</p><h2 id="reviews-title">${escapeHtml(reviews.rating)} / 5</h2><p>Based on ${escapeHtml(reviews.count)} verified owner ${reviews.count === 1 ? 'review' : 'reviews'}.</p></div>
    <div class="review-list">${reviews.items.map((review) => `<figure><blockquote>${escapeHtml(review.body)}</blockquote><figcaption>${escapeHtml(review.author)}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

function relatedMarkup(product) {
  const related = product.relatedProductIds.map(getProduct).filter((item) => item?.status === 'active');
  if (!related.length) return '';
  return `<section class="related-section" aria-labelledby="related-title"><div class="shell"><h2 id="related-title">Made to work together.</h2><div class="related-grid">${related.map((item) => productCardMarkup(item, { headingLevel: 3 })).join('')}</div></div></section>`;
}

export function productPageMarkup(product) {
  const canAdd = siteConfig.features.localCart && product.purchasable && getPublicVariants(product).length;
  return `<section class="pdp-primary" aria-label="${escapeHtml(product.title)}">
    <div class="shell pdp-primary__grid">
      ${galleryMarkup(product)}
      ${buyBoxMarkup(product)}
    </div>
  </section>

  ${detailsMarkup(product)}
  ${usageMarkup(product)}
  ${careMarkup(product)}
  ${comparisonMarkup(product)}
  ${reviewsMarkup(product)}
  ${productFaqMarkup(product)}
  ${relatedMarkup(product)}

  ${canAdd ? `<div class="mobile-purchase-bar" data-sticky-purchase hidden>
    <div><span>${escapeHtml(product.shortTitle)}</span>${formatPrice(product) ? `<strong data-sticky-price>${escapeHtml(formatPrice(product))}</strong>` : ''}</div>
    <button class="button" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to cart</button>
  </div>` : ''}`;
}
