import { categories, siteConfig } from '../../../data/site.js';
import { toSitePath, toSiteSrcset } from '../../../data/deployment.js';
import { formatMoney, formatPrice, getPublicVariants } from '../../../data/products.js';
import { escapeHtml, attributes, classes } from '../lib/html.js';
import { icon } from './icons.js';

function sourceMarkup(media) {
  const sources = media.sources ?? {};
  return [
    sources.avif?.length ? `<source type="image/avif" srcset="${escapeHtml(sources.avif.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', '))}">` : '',
    sources.webp?.length ? `<source type="image/webp" srcset="${escapeHtml(sources.webp.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', '))}">` : '',
  ].join('');
}

export function productVisualMarkup(product, media = product.media[0], options = {}) {
  const variant = media?.placeholderVariant ?? media?.id ?? 'hero';
  const eager = Boolean(options.eager);
  const className = classes('product-visual', options.className);

  if (media?.src) {
    return `<figure class="${className}">
      <picture>
        ${sourceMarkup(media)}
        <img class="product-photo" ${attributes({
          src: toSitePath(media.src),
          srcset: toSiteSrcset(media.srcset),
          sizes: options.sizes ?? '(min-width: 64rem) 50vw, 100vw',
          alt: media.alt,
          width: media.width,
          height: media.height,
          loading: eager ? 'eager' : 'lazy',
          fetchpriority: eager ? 'high' : null,
          decoding: eager ? 'sync' : 'async',
        })}>
      </picture>
    </figure>`;
  }

  const index = String((product.media.findIndex((item) => item.id === media?.id) + 1) || 1).padStart(2, '0');
  return `<figure class="${className} product-art product-art--${escapeHtml(variant)}" role="img" aria-label="${escapeHtml(media?.alt ?? product.title)}">
    <span class="product-art__field" aria-hidden="true"></span>
    <span class="product-art__towel" aria-hidden="true"><span class="product-art__edge"></span></span>
    <img class="product-art__mark" src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="" width="1180" height="980" aria-hidden="true">
    <span class="product-art__code" aria-hidden="true">DRY / ${index}</span>
  </figure>`;
}

export function quantityControlMarkup(value = 1, context = 'product') {
  return `<div class="quantity-control" data-quantity-control role="group" aria-label="Quantity for ${escapeHtml(context)}">
    <button type="button" data-quantity-decrease aria-label="Decrease quantity" ${value <= 1 ? 'disabled' : ''}>−</button>
    <output class="quantity-value" data-quantity-value aria-live="polite">${Number(value) || 1}</output>
    <button type="button" data-quantity-increase aria-label="Increase quantity">+</button>
  </div>`;
}

export function productCardMarkup(product, options = {}) {
  const category = categories.find((item) => item.id === product.categoryId);
  const primaryMedia = product.media.find((item) => item.id === 'folded') ?? product.media[0];
  const primaryVariant = getPublicVariants(product)[0] ?? null;
  const priceAmount = primaryVariant?.price ?? product.price;
  const compareAtAmount = primaryVariant?.compareAt ?? product.compareAt;
  const price = formatPrice(product, primaryVariant);
  const compareAt = Number.isFinite(compareAtAmount) && Number.isFinite(priceAmount) && compareAtAmount > priceAmount
    ? formatMoney(compareAtAmount, product.currency)
    : null;
  const canQuickAdd = siteConfig.features.localCart && product.purchasable && Boolean(price);

  return `<article class="product-card ${options.featured ? 'product-card--featured' : ''}" data-product-card="${escapeHtml(product.id)}">
    <a class="product-card__visual" href="${escapeHtml(toSitePath(product.slug))}" aria-label="View ${escapeHtml(product.title)}">
      ${productVisualMarkup(product, primaryMedia, { className: 'product-card__art', sizes: '(min-width: 64rem) 48vw, 100vw' })}
    </a>
    <div class="product-card__body">
      <p class="eyebrow">${escapeHtml(category?.eyebrow ?? 'Automotive care')}</p>
      <h2><a href="${escapeHtml(toSitePath(product.slug))}">${escapeHtml(product.title)}</a></h2>
      <p>${escapeHtml(product.shortDescription)}</p>
      <ul class="inline-facts" aria-label="Product highlights">
        ${product.benefits.map((benefit) => `<li>${icon('check')}<span>${escapeHtml(benefit.title)}</span></li>`).join('')}
      </ul>
      <div class="product-card__action">
        ${price ? `<strong class="product-price"><span>${escapeHtml(price)}</span>${compareAt ? `<del>${escapeHtml(compareAt)}</del>` : ''}</strong>` : ''}
        <a class="button button--dark" href="${escapeHtml(toSitePath(product.slug))}">View the towel ${icon('arrow')}</a>
        ${canQuickAdd ? `<button class="button button--outline" type="button" data-add-to-cart="${escapeHtml(product.id)}">Quick add</button>` : ''}
      </div>
    </div>
  </article>`;
}
