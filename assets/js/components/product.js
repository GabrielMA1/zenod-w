import { siteConfig } from '../../../data/site.js';
import { toSitePath, toSiteSrcset } from '../../../data/deployment.js';
import { getPublicVariants, getVerifiedSpecifications } from '../../../data/products.js';
import { escapeHtml, attributes, classes } from '../lib/html.js';
import { icon } from './icons.js';
import { priceMarkup, deliveryMarkup } from './market.js';

function sourceMarkup(media, sizes) {
  const sources = media.sources ?? {};
  return sources.avif?.length
    ? `<source type="image/avif" srcset="${escapeHtml(sources.avif.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', '))}" sizes="${escapeHtml(sizes)}">`
    : '';
}

// A product media item (from data/products.js) cropped into a fixed-ratio frame.
export function productVisualMarkup(product, media = product.media[0], options = {}) {
  const eager = Boolean(options.eager);
  const sizes = options.sizes ?? '(min-width: 64rem) 50vw, 100vw';
  const focal = media.focal ?? [0.5, 0.5];
  const webp = media.sources?.webp ?? [];
  return `<span class="${classes('product-visual', options.className)}" style="--focal: ${Math.round(focal[0] * 100)}% ${Math.round(focal[1] * 100)}%">
    <picture>${sourceMarkup(media, sizes)}<img ${attributes({
      src: toSitePath(media.src),
      srcset: webp.length ? webp.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', ') : toSiteSrcset(media.srcset),
      sizes, alt: options.alt ?? media.alt, width: media.width, height: media.height,
      loading: eager ? 'eager' : 'lazy', fetchpriority: eager ? 'high' : options.priority ?? null, decoding: eager ? 'sync' : 'async',
    })}></picture>
  </span>`;
}

export function hasIllustratedMedia(product) {
  return product.media.some((media) => media.type === 'image' && media.generated);
}

export function availabilityMarkup() {
  return siteConfig.features.checkoutReady
    ? '<p class="status status--open"><span class="status__dot" aria-hidden="true"></span>Available to order</p>'
    : '<p class="status"><span class="status__dot" aria-hidden="true"></span>Ordering opens soon</p>';
}

function tagFacts(product) {
  const verified = Object.fromEntries(getVerifiedSpecifications(product).map((item) => [item.key, item.value]));
  return [
    ['Fabric weight', verified.gsm],
    ['Colour', verified.color],
    ['Use', 'Drying your car after washing'],
  ].filter(([, value]) => value);
}

// The black plate echoing the label sewn on the towel: mark, name, facts, price, action.
export function productTagMarkup(product, { headingLevel = 2, actions = '', className = '', titleId } = {}) {
  const href = escapeHtml(toSitePath(product.slug));
  return `<div class="${classes('product-tag', className)}">
    <img class="product-tag__mark" src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524">
    <h${headingLevel} class="product-tag__name"${titleId ? ` id="${titleId}"` : ''}><a href="${href}">${escapeHtml(product.title)}</a></h${headingLevel}>
    <dl class="product-tag__facts">${tagFacts(product).map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
    <div class="product-tag__buy">
      <p class="product-tag__price">${priceMarkup(product)}</p>
      ${availabilityMarkup()}
    </div>
    <p class="product-tag__delivery">${icon('truck')}${deliveryMarkup()}</p>
    ${actions}
  </div>`;
}

export function specificationsMarkup(product) {
  const specifications = getVerifiedSpecifications(product);
  if (!specifications.length) return '';
  const pending = product.specifications.some((item) => ['dimensions', 'blend', 'weave'].includes(item.key) && (!item.verified || !item.value));
  return `<dl class="spec-list">${specifications.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('')}</dl>
    ${pending ? '<p class="spec-note">Dimensions, fibre blend and weave are not listed yet. They will be published before ordering opens.</p>' : ''}`;
}

export function quantityControlMarkup(value = 1, context = 'product') {
  return `<div class="quantity" data-quantity-control role="group" aria-label="Quantity for ${escapeHtml(context)}">
    <button type="button" data-quantity-decrease aria-label="Decrease quantity" ${value <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
    <output class="quantity__value" data-quantity-value aria-live="polite">${Number(value) || 1}</output>
    <button type="button" data-quantity-increase aria-label="Increase quantity">${icon('plus')}</button>
  </div>`;
}

export function canAddToBag(product) {
  return Boolean(siteConfig.features.localCart && product.purchasable && getPublicVariants(product).length);
}

export function productListingMarkup(product, { headingLevel = 2 } = {}) {
  const href = escapeHtml(toSitePath(product.slug));
  const media = product.media[0];
  return `<article class="listing" data-product-card="${escapeHtml(product.id)}">
    <a class="listing__visual" href="${href}" tabindex="-1" aria-label="${escapeHtml(product.title)}">${productVisualMarkup(product, media, { className: 'listing__media', sizes: '(min-width: 64rem) 52vw, 100vw', eager: true })}</a>
    ${productTagMarkup(product, {
      headingLevel,
      className: 'listing__tag',
      actions: productActionsMarkup(product),
    })}
  </article>`;
}

export function productActionsMarkup(product, { primaryLabel = 'View the towel' } = {}) {
  const href = escapeHtml(toSitePath(product.slug));
  return `<div class="product-tag__actions">
    <a class="button button--primary" href="${href}">${primaryLabel}</a>
    ${canAddToBag(product) ? `<button class="button button--on-ink" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to bag</button>` : ''}
  </div>`;
}
