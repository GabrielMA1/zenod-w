import { getProduct, getPublicVariants, getVerifiedSpecifications, formatPrice, formatMoney } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { escapeHtml } from '../lib/html.js';
import { galleryMarkup } from '../components/gallery.js';
import { icon } from '../components/icons.js';
import { productCardMarkup, productVisualMarkup, quantityControlMarkup } from '../components/product.js';

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
    <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/shop/">Shop</a></li><li aria-current="page">${escapeHtml(product.shortTitle)}</li></ol></nav>
    <p class="eyebrow">Automotive drying</p>
    <h1>${escapeHtml(product.title)}</h1>
    <p class="pdp-subtitle">${escapeHtml(product.subtitle)}</p>
    ${price ? `<div class="pdp-price" data-product-price><span data-current-price>${escapeHtml(price)}</span><del data-compare-price ${compareAt ? '' : 'hidden'}>${escapeHtml(compareAt ?? '')}</del></div>` : ''}
    <p class="pdp-description">${escapeHtml(product.description)}</p>
    ${variantsMarkup(product)}
    ${canAdd ? `<div class="purchase-controls">
      ${quantityControlMarkup(1, product.title)}
      <button class="button button--blue button--wide" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to cart ${icon('arrow')}</button>
    </div>` : ''}
    ${siteConfig.features.shippingReady && siteConfig.shipping.summary ? `<p class="buy-reassurance">${icon('check')}${escapeHtml(siteConfig.shipping.summary)}</p>` : ''}
    ${siteConfig.features.returnsReady && siteConfig.returns.summary ? `<p class="buy-reassurance">${icon('check')}${escapeHtml(siteConfig.returns.summary)}</p>` : ''}
    <ul class="buy-facts" aria-label="Product highlights">
      ${product.benefits.map((benefit) => `<li>${icon(benefit.icon)}<span><strong>${escapeHtml(benefit.title)}</strong>${escapeHtml(benefit.body)}</span></li>`).join('')}
    </ul>
  </div>`;
}

function specsMarkup(product) {
  const specifications = getVerifiedSpecifications(product);
  if (!specifications.length) return '';
  return `<section class="technical-section section--dark" aria-labelledby="specs-title">
    <div class="shell technical-section__grid">
      <div><p class="eyebrow">Product details</p><h2 id="specs-title">Specifications,<br>at a glance.</h2></div>
      <dl class="spec-grid">${specifications.map((specification, index) => `<div><dt>${String(index + 1).padStart(2, '0')} / ${escapeHtml(specification.label)}</dt><dd>${escapeHtml(specification.value)}</dd></div>`).join('')}</dl>
    </div>
  </section>`;
}

function productFaqMarkup(product) {
  if (!product.faqs.length) return '';
  return `<section class="section section--white" aria-labelledby="pdp-faq-title">
    <div class="content-shell faq-layout">
      <div><p class="eyebrow">FAQ</p><h2 id="pdp-faq-title">Know the towel.</h2><p>Clear answers about the product and its role.</p></div>
      <div class="faq-list">${product.faqs.map((item, index) => `<details ${index === 0 ? 'open' : ''}><summary><span>${escapeHtml(item.question)}</span>${icon('plus')}</summary><div><p>${escapeHtml(item.answer)}</p></div></details>`).join('')}</div>
    </div>
  </section>`;
}

function usageMarkup(product) {
  if (!product.usage.ready || !product.usage.steps.length) return '';
  return `<section class="usage-section section" aria-labelledby="usage-title"><div class="shell">
    <div class="section-heading"><div><p class="eyebrow">How to use</p><h2 id="usage-title">A clear drying routine.</h2></div><p class="lede">Follow the approved product guidance for the best experience with your towel.</p></div>
    <ol class="usage-steps">${product.usage.steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p></li>`).join('')}</ol>
  </div></section>`;
}

function careMarkup(product) {
  if (!product.care.ready || !product.care.instructions.length) return '';
  return `<section class="care-section" aria-labelledby="care-title"><div class="content-shell care-section__grid">
    <div><p class="eyebrow">Towel care</p><h2 id="care-title">Keep it ready for the next wash.</h2></div>
    <ul>${product.care.instructions.map((instruction) => `<li>${icon('check')}<span>${escapeHtml(typeof instruction === 'string' ? instruction : instruction.text)}</span></li>`).join('')}</ul>
  </div></section>`;
}

function comparisonMarkup(product) {
  const comparison = product.comparison;
  if (!siteConfig.features.comparisonReady || !comparison.enabled || !comparison.columns.length || !comparison.rows.length) return '';
  return `<section class="comparison-section section" aria-labelledby="comparison-title"><div class="shell">
    <div class="section-heading"><div><p class="eyebrow">Compare</p><h2 id="comparison-title">Choose with the facts in view.</h2></div><p class="lede">A factual comparison using approved product information.</p></div>
    <div class="comparison-scroll" tabindex="0" role="region" aria-label="Product comparison table"><table><thead><tr><th scope="col">Detail</th>${comparison.columns.map((column) => `<th scope="col">${escapeHtml(column.title)}</th>`).join('')}</tr></thead><tbody>${comparison.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)}</th>${comparison.columns.map((column) => `<td>${escapeHtml(row.values?.[column.id] ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  </div></section>`;
}

function reviewsMarkup(product) {
  const reviews = product.reviews;
  if (!siteConfig.features.reviewsReady || !reviews.enabled || !reviews.count || !reviews.rating || !reviews.items.length) return '';
  return `<section class="reviews-section section--dark" aria-labelledby="reviews-title"><div class="shell">
    <div class="reviews-section__summary"><p class="eyebrow">Owner reviews</p><h2 id="reviews-title">${escapeHtml(reviews.rating)} / 5</h2><p>Based on ${escapeHtml(reviews.count)} verified owner ${reviews.count === 1 ? 'review' : 'reviews'}.</p></div>
    <div class="review-list">${reviews.items.map((review) => `<figure><blockquote>${escapeHtml(review.body)}</blockquote><figcaption>${escapeHtml(review.author)}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

function relatedMarkup(product) {
  const related = product.relatedProductIds.map(getProduct).filter((item) => item?.status === 'active');
  if (!related.length) return '';
  return `<section class="related-section section" aria-labelledby="related-title"><div class="shell"><p class="eyebrow">Complete the routine</p><h2 id="related-title">Made to work together.</h2><div class="related-grid">${related.map((item) => productCardMarkup(item)).join('')}</div></div></section>`;
}

export function productPageMarkup(product) {
  const canAdd = siteConfig.features.localCart && product.purchasable && getPublicVariants(product).length;
  return `<section class="pdp-primary section" aria-label="${escapeHtml(product.title)}">
    <div class="shell pdp-primary__grid">
      ${galleryMarkup(product)}
      ${buyBoxMarkup(product)}
    </div>
  </section>

  <section class="pdp-story section" aria-labelledby="pdp-story-title">
    <div class="shell pdp-story__grid">
      <div class="pdp-story__visual">${productVisualMarkup(product, product.media.find((item) => item.id === 'folded'), { className: 'feature-art', sizes: '(min-width: 64rem) 55vw, 100vw' })}</div>
      <div class="pdp-story__copy"><p class="eyebrow">The final step</p><h2 id="pdp-story-title">Drying deserves its own tool.</h2><p>Once the wash is complete, the drying towel becomes the point of contact. ZENO gives that step a dedicated soft microfiber format with a distinct blue-and-black finish.</p></div>
    </div>
  </section>

  <section class="pdp-detail-band" aria-labelledby="detail-band-title">
    <div class="shell pdp-detail-band__grid">
      <div class="pdp-detail-band__copy"><p class="eyebrow">Form and finish</p><h2 id="detail-band-title">A clear identity,<br>down to the edge.</h2><p>Blue microfiber and black edging create a restrained, recognizable ZENO finish.</p></div>
      <div class="pdp-detail-band__visual">${productVisualMarkup(product, product.media.find((item) => item.id === 'edge'), { className: 'feature-art', sizes: '(min-width: 64rem) 50vw, 100vw' })}</div>
    </div>
  </section>

  ${specsMarkup(product)}
  ${usageMarkup(product)}
  ${careMarkup(product)}
  ${comparisonMarkup(product)}
  ${reviewsMarkup(product)}
  ${productFaqMarkup(product)}
  ${relatedMarkup(product)}

  ${canAdd ? `<div class="mobile-purchase-bar" data-sticky-purchase hidden>
    <div><span>${escapeHtml(product.shortTitle)}</span>${formatPrice(product) ? `<strong data-sticky-price>${escapeHtml(formatPrice(product))}</strong>` : ''}</div>
    <button class="button button--blue" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to cart</button>
  </div>` : ''}`;
}
