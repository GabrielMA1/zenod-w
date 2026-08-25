import { siteConfig } from '../../../data/site.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from '../components/icons.js';
import { productVisualMarkup } from '../components/product.js';

export function aboutPageMarkup(product) {
  return `<section class="about-hero surface-dark" aria-labelledby="about-title">
    <div class="shell about-hero__grid">
      <div><p class="eyebrow">About ZENO</p><h1 id="about-title">Care, with a clear purpose.</h1><p>ZENO DETAIL creates premium car-care products for enthusiasts and detailers.</p></div>
      <img src="${siteConfig.brandAssets.symbolWhite}" alt="" width="848" height="524">
    </div>
  </section>
  <section class="about-intro section" aria-labelledby="about-intro-title">
    <div class="content-shell about-intro__grid"><p class="eyebrow">Why we exist</p><div><h2 id="about-intro-title">Make every step of car care feel deliberate.</h2><p>ZENO is built around a straightforward idea: a car-care product should have a clear job, useful design and value that makes sense.</p><p>That philosophy begins with vehicle drying—a familiar step where the right format and a clear product experience matter.</p></div></div>
  </section>
  <section class="about-principles section--dark" aria-labelledby="principles-title">
    <div class="shell"><div class="section-heading"><div><p class="eyebrow">Product philosophy</p><h2 id="principles-title">What guides ZENO.</h2></div><p>Clear choices, restrained design and products made around real care tasks.</p></div>
      <div class="about-principle-grid"><article><span>01</span><h3>Purpose first</h3><p>Every product begins with a defined job in the car-care routine.</p></article><article><span>02</span><h3>Details matter</h3><p>Materials, construction and presentation should work as one system.</p></article><article><span>03</span><h3>Useful value</h3><p>Premium care should feel attainable without looking or feeling compromised.</p></article></div>
    </div>
  </section>
  <section class="about-product section" aria-labelledby="about-product-title"><div class="shell about-product__grid"><div>${productVisualMarkup(product, product.media.find((item) => item.id === 'branding'), { className: 'feature-art', sizes: '(min-width: 64rem) 48vw, 100vw' })}</div><div><p class="eyebrow">The first expression</p><h2 id="about-product-title">Meet the ZENO Drying Towel.</h2><p>${escapeHtml(product.description)}</p><a class="button button--dark" href="${escapeHtml(product.slug)}">View the towel ${icon('arrow')}</a></div></div></section>`;
}

export function faqPageMarkup(product) {
  return `<section class="content-hero surface-dark" aria-labelledby="faq-title"><div class="content-shell"><p class="eyebrow">FAQ</p><h1 id="faq-title">Drying towel questions.</h1><p>The essentials about the ZENO Drying Towel.</p></div></section>
  <section class="section section--white"><div class="content-shell faq-layout faq-layout--page"><div><p class="eyebrow">Product answers</p><h2>Clear by design.</h2><p>Useful information about what the towel is and what it is made to do.</p></div><div class="faq-list">${product.faqs.map((item, index) => `<details ${index === 0 ? 'open' : ''}><summary><span>${escapeHtml(item.question)}</span>${icon('plus')}</summary><div><p>${escapeHtml(item.answer)}</p></div></details>`).join('')}</div></div></section>
  <section class="faq-cta"><div class="content-shell"><p class="eyebrow">Ready for the final step?</p><h2>Explore the ZENO Drying Towel.</h2><a class="button button--blue" href="${escapeHtml(product.slug)}">View the towel ${icon('arrow')}</a></div></section>`;
}

export function unavailablePageMarkup() {
  return `<section class="not-found surface-dark" aria-labelledby="not-found-title"><div class="content-shell"><span class="not-found__code">404</span><p class="eyebrow">ZENO DETAIL</p><h1 id="not-found-title">Page not found.</h1><p>We couldn’t find the page you requested.</p><div class="hero-actions"><a class="button button--blue" href="/">Back home</a><a class="text-link text-link--light" href="/products/drying-towel/">Shop the Drying Towel ${icon('arrow')}</a></div></div></section>`;
}
