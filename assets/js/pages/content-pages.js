import { toSitePath } from "../../../data/deployment.js";
import { icon } from "../components/icons.js";
import { faqListMarkup } from "../components/blocks.js";
import { editorialImage, closingCta } from "../components/editorial.js";

export function aboutPageMarkup(product) {
  return `<section class="page-intro about-intro"><div class="shell"><p class="eyebrow">THE ZENO POINT OF VIEW</p><h1>Some see a car.<br>We see <em>the details.</em></h1><p class="lede">For the early starts, the weekend washes and the second look on the way inside.</p></div></section><div class="shell about-cover">${editorialImage("hero", { eager: true })}<span>FOR THE LOVE OF THE DRIVE.</span></div>
  <section class="section-space"><div class="shell about-story-grid"><div><p class="eyebrow">WHY WE EXIST</p><h2>Care is in<br>the small things.</h2></div><div><p class="lede">Looking after your car can be one of the best parts of owning it.</p><p>ZENO DETAIL is a car-care brand built around that idea. We start with a clear job, choose the details that serve it and make the product straightforward to understand.</p><p>Our first essential is the ZENO Drying Towel: soft microfiber, a distinctive blue-and-black finish and one purpose in your wash routine. It is the beginning of a considered collection.</p><a class="text-link" href="${toSitePath("/products/drying-towel/")}">Meet our first essential ${icon("arrow")}</a></div></div></section>
  <section class="values-section"><div class="shell"><p class="eyebrow">THE WAY WE THINK</p><div class="routine-grid"><div class="routine-step"><span>01</span><h3>Purpose comes first.</h3><p>Give each product a useful role in the way you care for your car.</p></div><div class="routine-step"><span>02</span><h3>Make the details count.</h3><p>From the materials to the way a product is explained, small choices deserve attention.</p></div><div class="routine-step"><span>03</span><h3>Keep value clear.</h3><p>Show the product, its price and the facts. Help people choose with confidence.</p></div></div></div></section>${closingCta()}`;
}

export function faqPageMarkup(product) {
  return `<section class="page-intro"><div class="shell"><p class="eyebrow">A LITTLE CLARITY</p><h1>Good questions.<br>Clear answers.</h1><p class="lede">Get to know your next drying essential.</p></div></section><section class="faq-band faq-band--page"><div class="shell faq-layout"><aside class="faq-aside"><p class="eyebrow">THE DRYING TOWEL</p><p>Looking for a better wash routine? Our journal covers the little things that matter.</p><a class="text-link" href="${toSitePath("/journal/")}">Explore the care guides ${icon("arrow")}</a></aside>${faqListMarkup(product.faqs)}</div></section>${closingCta()}`;
}

export function shippingPageMarkup() {
  return `<section class="page-intro"><div class="shell"><p class="eyebrow">SHIPPING & DELIVERY</p><h1>From our collection<br>to your next wash.</h1><p class="lede">Delivery across Europe, with free shipping in Romania.</p></div></section>
  <section class="delivery-section"><div class="shell delivery-grid">
    <article class="delivery-card"><span class="eyebrow">01 / ROMANIA</span><h2>Free delivery.</h2><p>Shipping to addresses in Romania is free.</p><p>There is no delivery charge to add to your product total.</p></article>
    <article class="delivery-card"><span class="eyebrow">02 / EUROPE</span><h2>Priced for your address.</h2><p>We deliver across Europe. Outside Romania, shipping depends on the delivery address.</p><p>Your delivery charge must be confirmed before payment. We do not apply a single flat rate to every European destination.</p></article>
    <article class="delivery-card"><span class="eyebrow">03 / ORDERING</span><h2>Getting ready for your first order.</h2><p>Online ordering is not open yet. You can explore the towel and save it in your bag.</p><p>Delivery estimates, dispatch details and complete ordering information will be available before purchases open.</p></article>
  </div><div class="shell delivery-help"><p>For now, get to know the product and the routine it belongs in.</p><a class="text-link" href="${toSitePath('/products/drying-towel/')}">Explore the towel ${icon('arrow')}</a></div></section>${closingCta()}`;
}

export function unavailablePageMarkup() {
  return `<section class="not-found-page"><div class="shell"><p class="eyebrow">A SMALL DETOUR / 404</p><h1>Let’s get you<br>back on track.</h1><p>We couldn’t find the page you requested.</p><div class="actions"><a class="button button--blue" href="${toSitePath("/")}">Back home ${icon("arrow")}</a><a class="text-link" href="${toSitePath("/shop/")}">Explore the collection</a></div></div></section>`;
}
