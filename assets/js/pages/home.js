import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from '../components/icons.js';
import { productCardMarkup, productVisualMarkup } from '../components/product.js';

function factsMarkup(product) {
  return `<ul class="fact-strip shell" aria-label="ZENO Drying Towel highlights">
    ${product.benefits.map((benefit) => `<li>${icon(benefit.icon)}<span><strong>${escapeHtml(benefit.title)}</strong>${escapeHtml(benefit.body)}</span></li>`).join('')}
  </ul>`;
}

function faqMarkup(product) {
  return `<div class="faq-list">
    ${product.faqs.map((item, index) => `<details ${index === 0 ? 'open' : ''}>
      <summary><span>${escapeHtml(item.question)}</span>${icon('plus')}</summary>
      <div><p>${escapeHtml(item.answer)}</p></div>
    </details>`).join('')}
  </div>`;
}

export function homePageMarkup(product) {
  return `<section class="home-hero surface-dark" aria-labelledby="home-title">
    <div class="home-hero__grid shell">
      <div class="home-hero__copy">
        <p class="eyebrow">${escapeHtml(product.heroCopy.eyebrow)}</p>
        <h1 id="home-title">${escapeHtml(product.heroCopy.heading)}</h1>
        <p class="home-hero__lede">${escapeHtml(product.heroCopy.body)}</p>
        <div class="hero-actions">
          <a class="button button--blue" href="${escapeHtml(toSitePath(product.slug))}">Shop the Drying Towel ${icon('arrow')}</a>
          <a class="text-link text-link--light" href="#why-zeno">Why ZENO ${icon('arrow')}</a>
        </div>
      </div>
      <a class="home-hero__visual" href="${escapeHtml(toSitePath(product.slug))}" aria-label="View ${escapeHtml(product.title)}">
        ${productVisualMarkup(product, product.media[0], { eager: true, className: 'home-hero__art', sizes: '(min-width: 64rem) 58vw, 100vw' })}
        <span class="hero-product-label"><span>01 / Drying</span><strong>${escapeHtml(product.title)}</strong></span>
      </a>
      <div class="home-hero__rail" aria-hidden="true"><span>ZENO</span><span>DETAIL</span><span>DRY / 01</span></div>
    </div>
  </section>

  <section class="benefit-band">${factsMarkup(product)}</section>

  <section class="section flagship-section" id="shop-towel" aria-labelledby="flagship-title">
    <div class="shell">
      <div class="section-heading">
        <div><p class="eyebrow">The drying towel</p><h2 id="flagship-title">One clear job.<br>A more considered finish.</h2></div>
        <p class="lede">Made for the moment a careful wash becomes a clean, dry finish.</p>
      </div>
      ${productCardMarkup(product, { featured: true })}
    </div>
  </section>

  <section class="material-story section--dark" aria-labelledby="material-title">
    <div class="material-story__grid shell">
      <div class="material-story__visual">
        ${productVisualMarkup(product, product.media.find((item) => item.id === 'texture'), { className: 'feature-art feature-art--texture', sizes: '(min-width: 64rem) 48vw, 100vw' })}
      </div>
      <div class="material-story__copy">
        <p class="eyebrow">Surface</p>
        <h2 id="material-title">Soft microfiber.<br>Purpose-built for drying.</h2>
        <p>The ZENO Drying Towel is made around a simple role: meeting the vehicle at the final step of the wash.</p>
        <dl class="detail-list">
          <div><dt>Material</dt><dd>${escapeHtml(product.materialSummary)}</dd></div>
          <div><dt>Role</dt><dd>Vehicle drying</dd></div>
          <div><dt>Finish</dt><dd>${escapeHtml(product.color)}</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="edge-story section" aria-labelledby="edge-title">
    <div class="edge-story__grid shell">
      <div class="edge-story__copy">
        <p class="eyebrow">Design detail</p>
        <h2 id="edge-title">Blue field.<br>Black edge.<br>Pure ZENO.</h2>
        <p class="lede">A restrained color system gives the towel a clear identity in the garage, on the shelf and in hand.</p>
        <a class="text-link" href="${escapeHtml(toSitePath(product.slug))}">Explore every view ${icon('arrow')}</a>
      </div>
      <div class="edge-story__visual">
        ${productVisualMarkup(product, product.media.find((item) => item.id === 'edge'), { className: 'feature-art feature-art--edge', sizes: '(min-width: 64rem) 50vw, 100vw' })}
        <span class="edge-story__annotation">Black edging / ZENO blue</span>
      </div>
    </div>
  </section>

  <section class="why-zeno section--dark" id="why-zeno" aria-labelledby="why-zeno-title">
    <div class="shell">
      <div class="why-zeno__heading">
        <p class="eyebrow">Why ZENO</p>
        <h2 id="why-zeno-title">Serious car care,<br>without unnecessary noise.</h2>
        <p>ZENO DETAIL creates products around clear jobs, thoughtful material choices and straightforward value.</p>
      </div>
      <ol class="principle-list">
        <li><span>01</span><div><h3>Clear purpose</h3><p>Each product starts with a defined place in the car-care routine.</p></div></li>
        <li><span>02</span><div><h3>Thoughtful choices</h3><p>Materials and construction details should earn their place.</p></div></li>
        <li><span>03</span><div><h3>Straightforward value</h3><p>Premium care should feel considered, useful and accessible.</p></div></li>
      </ol>
    </div>
  </section>

  <section class="brand-chapter section" aria-labelledby="brand-chapter-title">
    <div class="content-shell brand-chapter__inner">
      <img src="${toSitePath(siteConfig.brandAssets.symbolBlack)}" alt="" width="848" height="524" loading="lazy">
      <p class="eyebrow">ZENO DETAIL</p>
      <h2 id="brand-chapter-title">Made for the way enthusiasts care for their cars.</h2>
      <p>ZENO begins where good car care becomes a repeatable ritual: clear products, useful information and a customer experience that respects the detail.</p>
      <a class="button button--dark" href="${toSitePath('/about/')}">About ZENO ${icon('arrow')}</a>
    </div>
  </section>

  <section class="section faq-section section--white" aria-labelledby="home-faq-title">
    <div class="content-shell faq-layout">
      <div><p class="eyebrow">Product FAQ</p><h2 id="home-faq-title">The towel,<br>clearly explained.</h2><p>Everything currently shown here is part of the product you are viewing.</p></div>
      ${faqMarkup(product)}
    </div>
  </section>`;
}
