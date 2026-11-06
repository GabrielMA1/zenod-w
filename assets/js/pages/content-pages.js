import { toSitePath } from '../../../data/deployment.js';
import { siteConfig, storeFaqs } from '../../../data/site.js';
import { escapeHtml } from '../lib/html.js';
import { faqListMarkup, deliveryFactsMarkup, guideListMarkup } from '../components/blocks.js';
import { productTagMarkup, productActionsMarkup } from '../components/product.js';
import { preferencesToggleMarkup } from '../components/preferences.js';

export function pageHeadMarkup(page, { breadcrumbs = null, lede = page.intro } = {}) {
  return `<div class="shell page-head">
    ${breadcrumbs ? `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${breadcrumbs}</ol></nav>` : ''}
    <h1>${escapeHtml(page.heading)}</h1>
    ${lede ? `<p class="lede">${escapeHtml(lede)}</p>` : ''}
  </div>`;
}

export function aboutPageMarkup(page, product) {
  return `${pageHeadMarkup(page)}
  <section class="shell about" aria-label="About ZENO DETAIL">
    <div class="about__mark">
      <img src="${toSitePath(siteConfig.brandAssets.logoWhite)}" alt="ZENO DETAIL logo" width="1180" height="980">
    </div>
    <div class="about__text prose">
      <h2>What we make</h2>
      <p>We start with the tools you touch at the end of a wash. Our first product is the ZENO Drying Towel: 850 GSM microfiber in blue with black edging, priced for each shopping region.</p>
      <h2>How we describe products</h2>
      <p>We publish a specification once it is confirmed, and leave it out until it is. Prices are shown in your shopping region’s currency, and delivery terms are explained before you order. We do not use invented reviews, countdowns or crossed-out prices.</p>
      <h2>Where we deliver</h2>
      <p>We deliver across Europe. Delivery within Romania is free; elsewhere, shipping is calculated for the delivery address.</p>
      <div class="about__product">${productTagMarkup(product, { headingLevel: 2, actions: productActionsMarkup(product) })}</div>
    </div>
  </section>`;
}

export function faqPageMarkup(page, product) {
  return `${pageHeadMarkup(page)}
  <div class="shell faq-page">
    <section class="faq-page__group" aria-labelledby="faq-towel-title">
      <h2 id="faq-towel-title">The towel</h2>
      ${faqListMarkup(product.faqs)}
    </section>
    <section class="faq-page__group" aria-labelledby="faq-store-title">
      <h2 id="faq-store-title">Prices, delivery and ordering</h2>
      ${faqListMarkup(storeFaqs, { openFirst: false })}
    </section>
    <aside class="faq-page__aside">
      <h2>Looking for technique?</h2>
      <p>Our care guides cover drying a car, washing microfiber and choosing a drying towel.</p>
      <a class="text-link" href="${toSitePath('/journal/')}">Explore the care guides</a>
    </aside>
  </div>`;
}

export function shippingPageMarkup(page, locale) {
  return `${pageHeadMarkup(page)}
  <div class="shell split delivery-page">
    <div class="split__head">
      <h2>Your shopping region</h2>
      <p>Prices and delivery terms follow the shopping region you choose. You can change it at any time.</p>
      ${preferencesToggleMarkup(locale, 'prefs-toggle prefs-toggle--inline')}
    </div>
    ${deliveryFactsMarkup()}
  </div>
  <section class="section" aria-labelledby="delivery-next-title">
    <div class="shell split">
      <div class="split__head"><h2 id="delivery-next-title">Before ordering opens</h2></div>
      <div class="prose">
        <p>Delivery estimates, dispatch details and complete ordering information will be available before purchases open.</p>
        <p>For now, get to know the product and the routine it belongs in.</p>
        <a class="text-link" href="${toSitePath('/products/drying-towel/')}">View the towel</a>
      </div>
    </div>
  </section>`;
}

export function unavailablePageMarkup() {
  return `<section class="shell not-found">
    <h1>Page not found.</h1>
    <p class="lede">We couldn’t find the page you requested.</p>
    <div class="not-found__actions">
      <a class="button button--primary" href="${toSitePath('/')}">Back home</a>
      <a class="button button--secondary" href="${toSitePath('/products/drying-towel/')}">View the towel</a>
    </div>
    <h2>Care guides</h2>
    ${guideListMarkup()}
  </section>`;
}
