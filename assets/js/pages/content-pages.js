import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from '../components/icons.js';
import { faqListMarkup, principlesMarkup, towelFieldMarkup } from '../components/blocks.js';

export function aboutPageMarkup(product) {
  return `<section class="page-intro page-intro--about" aria-labelledby="about-title">
    <div class="shell">
      <p class="label">About ZENO</p>
      <h1 id="about-title">Care, with a clear purpose.</h1>
      <p class="lede">ZENO DETAIL creates premium car-care products for enthusiasts and detailers.</p>
    </div>
  </section>

  <section class="about-story" aria-labelledby="about-intro-title">
    <div class="shell about-story__grid">
      <h2 id="about-intro-title">Make every step of car care feel deliberate.</h2>
      <div class="about-story__body">
        <p class="lede">ZENO is built around a straightforward idea: a car-care product should have a clear job, useful design and value that makes sense.</p>
        <p>That philosophy begins with vehicle drying—a familiar step where the right format and a clear product experience matter.</p>
        <h3 class="label">What guides ZENO</h3>
        ${principlesMarkup([
          ['Purpose first', 'Every product begins with a defined job in the car-care routine.'],
          ['Details matter', 'Materials, construction and presentation should work as one system.'],
          ['Useful value', 'Premium care should feel attainable without looking or feeling compromised.'],
        ])}
      </div>
    </div>
  </section>

  <section class="about-product" aria-labelledby="about-product-title">
    ${towelFieldMarkup({
      className: 'towel-field--band',
      content: `<div class="about-product__copy">
        <p class="label">The first expression</p>
        <h2 id="about-product-title">Meet the ZENO Drying Towel.</h2>
        <p>${escapeHtml(product.description)}</p>
        <a class="button" href="${escapeHtml(toSitePath(product.slug))}">View the towel ${icon('arrow')}</a>
      </div>`,
    })}
  </section>`;
}

export function faqPageMarkup(product) {
  return `<section class="page-intro" aria-labelledby="faq-title">
    <div class="shell">
      <p class="label">FAQ</p>
      <h1 id="faq-title">Drying towel questions.</h1>
      <p class="lede">The essentials about the ZENO Drying Towel: what it is and what it is made to do.</p>
    </div>
  </section>
  <section class="faq-band faq-band--page" aria-label="Questions and answers">
    <div class="shell faq-layout faq-layout--single">
      ${faqListMarkup(product.faqs)}
    </div>
  </section>
  <section class="closing-line" aria-labelledby="faq-next-title">
    <div class="shell closing-line__inner">
      <h2 id="faq-next-title">Ready for the final step?</h2>
      <a class="button" href="${escapeHtml(toSitePath(product.slug))}">Explore the ZENO Drying Towel ${icon('arrow')}</a>
    </div>
  </section>`;
}

export function unavailablePageMarkup() {
  return `<section class="not-found" aria-labelledby="not-found-title">
    ${towelFieldMarkup({
      className: 'towel-field--hero towel-field--short',
      content: `<div class="home-hero__copy">
        <p class="label">404</p>
        <h1 id="not-found-title">Page not found.</h1>
        <p class="home-hero__lede">We couldn’t find the page you requested.</p>
        <div class="actions">
          <a class="button" href="${toSitePath('/')}">Back home</a>
          <a class="text-link" href="${toSitePath('/products/drying-towel/')}">Shop the Drying Towel</a>
        </div>
      </div>`,
    })}
  </section>`;
}
