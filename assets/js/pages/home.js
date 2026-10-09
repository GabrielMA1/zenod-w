import { toSitePath } from '../../../data/deployment.js';
import { formatPrice } from '../../../data/products.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from '../components/icons.js';
import { faqListMarkup, principlesMarkup, towelFieldMarkup } from '../components/blocks.js';
import { productLabelMarkup, productVisualMarkup, swatchMarkup } from '../components/product.js';

export function homePageMarkup(product) {
  const productHref = escapeHtml(toSitePath(product.slug));
  const price = formatPrice(product);

  return `<section class="home-hero" aria-labelledby="home-title">
    ${towelFieldMarkup({
      className: 'towel-field--hero',
      content: `<div class="home-hero__copy">
        <p class="label">${escapeHtml(product.heroCopy.eyebrow)}</p>
        <h1 id="home-title">${escapeHtml(product.heroCopy.heading)}</h1>
        <p class="home-hero__lede">${escapeHtml(product.heroCopy.body)}</p>
        <div class="actions">
          <a class="button" href="${productHref}">Shop the Drying Towel ${icon('arrow')}</a>
          <a class="text-link" href="#why-zeno">Why ZENO</a>
        </div>
      </div>`,
    })}
  </section>

  <section class="towel-intro" aria-labelledby="towel-title">
    <div class="shell towel-intro__grid">
      <a class="towel-intro__visual" href="${productHref}" tabindex="-1" aria-label="View ${escapeHtml(product.title)}">
        ${productVisualMarkup(product, product.media.find((item) => item.id === 'folded'), { className: 'towel-intro__art', sizes: '(min-width: 64rem) 46vw, 100vw' })}
      </a>
      <div class="towel-intro__copy">
        <h2 id="towel-title">One clear job. A more considered finish.</h2>
        <p class="lede">Made for the moment a careful wash becomes a clean, dry finish.</p>
        <p>${escapeHtml(product.description)}</p>
        ${swatchMarkup(product)}
        ${productLabelMarkup(product)}
        <div class="actions">
          ${price ? `<strong class="product-price">${escapeHtml(price)}</strong>` : ''}
          <a class="button" href="${productHref}">View the towel ${icon('arrow')}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="why-zeno" id="why-zeno" aria-labelledby="why-zeno-title">
    <div class="shell why-zeno__grid">
      <div class="why-zeno__heading">
        <p class="label">Why ZENO</p>
        <h2 id="why-zeno-title">Serious car care, without unnecessary noise.</h2>
      </div>
      <div class="why-zeno__body">
        <p class="lede">ZENO DETAIL creates products around clear jobs, thoughtful material choices and straightforward value.</p>
        ${principlesMarkup([
          ['Clear purpose', 'Each product starts with a defined place in the car-care routine.'],
          ['Thoughtful choices', 'Materials and construction details should earn their place.'],
          ['Straightforward value', 'Premium care should feel considered, useful and accessible.'],
        ])}
        <p>ZENO begins where good car care becomes a repeatable ritual: clear products, useful information and a customer experience that respects the detail.</p>
        <a class="text-link" href="${toSitePath('/about/')}">About ZENO</a>
      </div>
    </div>
  </section>

  <section class="faq-band" aria-labelledby="home-faq-title">
    <div class="shell faq-layout">
      <h2 id="home-faq-title">The towel, clearly explained.</h2>
      ${faqListMarkup(product.faqs)}
    </div>
  </section>`;
}
