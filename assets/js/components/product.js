import { categories, siteConfig } from '../../../data/site.js';
import { toSitePath, toSiteSrcset } from '../../../data/deployment.js';
import { formatMoney, formatPrice, getPublicVariants, getVerifiedSpecifications } from '../../../data/products.js';
import { escapeHtml, attributes, classes } from '../lib/html.js';
import { icon } from './icons.js';

function sourceMarkup(media) {
  const sources = media.sources ?? {};
  return [
    sources.avif?.length ? `<source type="image/avif" srcset="${escapeHtml(sources.avif.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', '))}">` : '',
    sources.webp?.length ? `<source type="image/webp" srcset="${escapeHtml(sources.webp.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', '))}">` : '',
  ].join('');
}

// Until approved photography exists, each media slot is drawn as a flat, clearly
// illustrative diagram of the towel: blue field, black edge, white mark.
function illustrationMarkup(variant) {
  const mark = `<img class="product-art__mark" src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="" width="1180" height="980">`;
  if (variant === 'folded') {
    return '<span class="product-art__folded" aria-hidden="true"><span></span><span></span></span>';
  }
  if (variant === 'texture') return '<span class="product-art__towel" aria-hidden="true"></span>';
  return `<span class="product-art__towel" aria-hidden="true">${mark}</span>`;
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

  return `<figure class="${className} product-art product-art--${escapeHtml(variant)}" role="img" aria-label="${escapeHtml(`Illustration: ${media?.alt ?? product.title}`)}">
    ${illustrationMarkup(variant)}
  </figure>`;
}

export function hasIllustratedMedia(product) {
  return product.media.some((media) => media.type === 'image' && !media.src);
}

export function swatchMarkup(product) {
  if (!product.color) return '';
  return `<p class="swatch"><span class="swatch__chip" aria-hidden="true"></span>${escapeHtml(product.color)}</p>`;
}

// The verified specifications, set like the sewn label inside the towel.
export function productLabelMarkup(product, options = {}) {
  const specifications = getVerifiedSpecifications(product);
  if (!specifications.length) return '';
  const pending = options.showPending
    ? product.specifications
      .filter((specification) => !specification.verified || !specification.value)
      .map((specification) => (/^[A-Z]{2,}$/.test(specification.label) ? specification.label : specification.label.toLowerCase()))
    : [];
  return `<div class="product-label">
    <img class="product-label__mark" src="${toSitePath(siteConfig.brandAssets.logoBlack)}" alt="" width="1180" height="980" loading="lazy">
    <dl>${specifications.map((specification) => `<div><dt>${escapeHtml(specification.label)}</dt><dd>${escapeHtml(specification.value)}</dd></div>`).join('')}</dl>
    ${pending.length ? `<p class="product-label__pending">Still to be confirmed: ${escapeHtml(pending.join(', '))}. They will be listed here once verified.</p>` : ''}
  </div>`;
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
  const primaryMedia = product.media.find((item) => item.id === (options.mediaId ?? 'front')) ?? product.media[0];
  const primaryVariant = getPublicVariants(product)[0] ?? null;
  const priceAmount = primaryVariant?.price ?? product.price;
  const compareAtAmount = primaryVariant?.compareAt ?? product.compareAt;
  const price = formatPrice(product, primaryVariant);
  const compareAt = Number.isFinite(compareAtAmount) && Number.isFinite(priceAmount) && compareAtAmount > priceAmount
    ? formatMoney(compareAtAmount, product.currency)
    : null;
  const canQuickAdd = siteConfig.features.localCart && product.purchasable && Boolean(price);
  const headingLevel = options.headingLevel ?? 2;

  return `<article class="product-listing" data-product-card="${escapeHtml(product.id)}">
    <a class="product-listing__visual" href="${escapeHtml(toSitePath(product.slug))}" tabindex="-1" aria-label="View ${escapeHtml(product.title)}">
      ${productVisualMarkup(product, primaryMedia, { className: 'product-listing__art', sizes: '(min-width: 64rem) 48vw, 100vw' })}
    </a>
    <div class="product-listing__body">
      <p class="label">${escapeHtml(category?.eyebrow ?? 'Automotive care')}</p>
      <h${headingLevel} class="product-listing__title"><a href="${escapeHtml(toSitePath(product.slug))}">${escapeHtml(product.title)}</a></h${headingLevel}>
      <p>${escapeHtml(product.shortDescription)}</p>
      ${swatchMarkup(product)}
      <div class="product-listing__action">
        ${price ? `<strong class="product-price"><span>${escapeHtml(price)}</span>${compareAt ? `<del>${escapeHtml(compareAt)}</del>` : ''}</strong>` : ''}
        <a class="button" href="${escapeHtml(toSitePath(product.slug))}">View the towel ${icon('arrow')}</a>
        ${canQuickAdd ? `<button class="button button--quiet" type="button" data-add-to-cart="${escapeHtml(product.id)}">Quick add</button>` : ''}
      </div>
    </div>
  </article>`;
}
