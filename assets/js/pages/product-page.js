import { getProduct, getPublicVariants, formatMoney } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { galleryMarkup } from '../components/gallery.js';
import { icon } from '../components/icons.js';
import { faqListMarkup, guideListMarkup, deliveryFactsMarkup } from '../components/blocks.js';
import { availabilityMarkup, canAddToBag, productListingMarkup, quantityControlMarkup, specificationsMarkup } from '../components/product.js';
import { deliveryMarkup, priceMarkup } from '../components/market.js';

function variantsMarkup(product) {
  const variants = getPublicVariants(product);
  if (!variants.length) return '';
  if (variants.length === 1) return `<input type="hidden" name="variant" value="${escapeHtml(variants[0].id)}">`;
  return `<fieldset class="variants">
    <legend>Pack</legend>
    <div class="variants__options">${variants.map((variant, index) => {
      const price = formatMoney(variant.price, product.currency);
      return `<label class="choice choice--region">
        <input type="radio" name="variant" value="${escapeHtml(variant.id)}" data-variant-price="${escapeHtml(price ?? '')}" ${index === 0 ? 'checked' : ''}>
        <span><strong>${escapeHtml(variant.title)}</strong>${price ? `<small>${escapeHtml(price)}</small>` : ''}</span>
      </label>`;
    }).join('')}</div>
  </fieldset>`;
}

function buyBoxMarkup(product) {
  const canAdd = canAddToBag(product);
  return `<div class="pdp__buy" data-product-purchase>
    <h1 class="pdp__title">${escapeHtml(product.title)}</h1>
    <p class="pdp__subtitle">${escapeHtml(product.subtitle)}</p>
    <div class="pdp__price-row" data-product-price>${priceMarkup(product, { className: 'pdp__price', tag: 'p' })}${availabilityMarkup()}</div>
    ${siteConfig.features.checkoutReady ? '' : '<p class="pdp__ordering">You can add the towel to your bag now. Checkout opens when online ordering starts.</p>'}
    <p class="pdp__colour"><span class="swatch" aria-hidden="true"></span><span><span class="pdp__label">Colour</span> ${escapeHtml(product.color)}</span></p>
    ${variantsMarkup(product)}
    ${canAdd ? `<div class="pdp__purchase">
      ${quantityControlMarkup(1, product.title)}
      <button class="button button--primary button--wide" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to bag</button>
    </div>` : ''}
    <ul class="pdp__assurance">
      ${siteConfig.features.shippingInfoReady ? `<li>${icon('truck')}<span>${deliveryMarkup()}. <a href="${toSitePath('/shipping-delivery/')}">Delivery information</a></span></li>` : ''}
      ${siteConfig.features.returnsReady && siteConfig.returns.summary ? `<li>${icon('check')}<span>${escapeHtml(siteConfig.returns.summary)}</span></li>` : ''}
    </ul>
    <p class="pdp__description">${escapeHtml(product.description)}</p>
  </div>`;
}

function specificationSectionMarkup(product) {
  const specs = specificationsMarkup(product);
  if (!specs) return '';
  return `<section class="section pdp-specs" id="specifications" aria-labelledby="specifications-title">
    <div class="shell pdp-specs__grid">
      <div class="spec-plate">
        <img class="spec-plate__mark" src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524" loading="lazy">
        <h2 id="specifications-title">Specifications</h2>
        ${specs}
      </div>
      <div class="pdp-specs__text">
        <h2>What the towel is for</h2>
        <p>The ZENO Drying Towel is made for the last step of a wash: drying the car once it has been rinsed clean.</p>
        <p><a href="${toSitePath('/journal/how-to-dry-your-car/')}">Our drying guide</a> explains a careful routine, from checking the towel to the places water collects.</p>
        <h3>About the 850 GSM figure</h3>
        <p>GSM is the weight of the fabric per square metre. It describes the material, not how much water a towel holds, so we list it as a specification rather than a performance claim.</p>
      </div>
    </div>
  </section>`;
}

function usageMarkup(product) {
  if (!product.usage.ready || !product.usage.steps.length) return '';
  return `<section class="section" aria-labelledby="usage-title"><div class="shell">
    <h2 id="usage-title">How to use it</h2>
    <ol class="steps steps--light">${product.usage.steps.map((step) => `<li><strong>${escapeHtml(step.title)}</strong> ${escapeHtml(step.body)}</li>`).join('')}</ol>
  </div></section>`;
}

function careMarkup(product) {
  if (!product.care.ready || !product.care.instructions.length) return '';
  return `<section class="section" aria-labelledby="care-title"><div class="shell split">
    <div class="split__head"><h2 id="care-title">Care</h2></div>
    <ul class="check-list">${product.care.instructions.map((instruction) => `<li>${icon('check')}<span>${escapeHtml(typeof instruction === 'string' ? instruction : instruction.text)}</span></li>`).join('')}</ul>
  </div></section>`;
}

function reviewsMarkup(product) {
  const reviews = product.reviews;
  if (!siteConfig.features.reviewsReady || !reviews.enabled || !reviews.count || !reviews.rating || !reviews.items.length) return '';
  return `<section class="section" aria-labelledby="reviews-title"><div class="shell split">
    <div class="split__head"><h2 id="reviews-title">Owner reviews</h2><p>${escapeHtml(reviews.rating)} / 5 · ${escapeHtml(reviews.count)}</p></div>
    <div class="review-list">${reviews.items.map((review) => `<figure><blockquote>${escapeHtml(review.body)}</blockquote><figcaption>${escapeHtml(review.author)}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

function relatedMarkup(product) {
  const related = product.relatedProductIds.map((id) => getProduct(id)).filter((item) => item?.status === 'active');
  if (!related.length) return '';
  return `<section class="section" aria-labelledby="related-title"><div class="shell"><h2 id="related-title">Use it with</h2>${related.map((item) => productListingMarkup(item, { headingLevel: 3 })).join('')}</div></section>`;
}

export function productPageMarkup(product) {
  const canAdd = canAddToBag(product);
  return `<div class="shell pdp">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath('/')}">Home</a></li><li><a href="${toSitePath('/shop/')}">Shop</a></li><li aria-current="page">${escapeHtml(product.shortTitle)}</li></ol></nav>
    <div class="pdp__grid">
      ${galleryMarkup(product)}
      ${buyBoxMarkup(product)}
    </div>
  </div>
  ${specificationSectionMarkup(product)}
  ${usageMarkup(product)}
  ${careMarkup(product)}
  ${reviewsMarkup(product)}
  <section class="section delivery-band" aria-labelledby="pdp-delivery-title">
    <div class="shell split">
      <div class="split__head"><h2 id="pdp-delivery-title">Delivery and ordering</h2><a class="text-link" href="${toSitePath('/shipping-delivery/')}">Delivery information</a></div>
      ${deliveryFactsMarkup()}
    </div>
  </section>
  ${product.faqs.length ? `<section class="section" aria-labelledby="pdp-faq-title">
    <div class="shell split">
      <div class="split__head"><h2 id="pdp-faq-title">Questions about the towel</h2><a class="text-link" href="${toSitePath('/faq/')}">All questions</a></div>
      ${faqListMarkup(product.faqs)}
    </div>
  </section>` : ''}
  <section class="section guides-band" aria-labelledby="pdp-guides-title">
    <div class="shell split">
      <div class="split__head"><h2 id="pdp-guides-title">Using and caring for microfiber</h2></div>
      ${guideListMarkup({ limit: 2 })}
    </div>
  </section>
  ${relatedMarkup(product)}
  ${canAdd ? `<div class="sticky-buy" data-sticky-purchase hidden>
    <div class="sticky-buy__text"><span>${escapeHtml(product.shortTitle)}</span>${priceMarkup(product, { className: 'sticky-buy__price', tag: 'strong' })}</div>
    <button class="button button--primary" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to bag</button>
  </div>` : ''}`;
}
