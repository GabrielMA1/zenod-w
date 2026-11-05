import { toSitePath } from "../../../data/deployment.js";
import { formatPrice } from "../../../data/products.js";
import { escapeHtml } from "../lib/html.js";
import { icon } from "../components/icons.js";
import { faqListMarkup } from "../components/blocks.js";
import { productVisualMarkup } from "../components/product.js";
import { editorialImage, closingCta } from "../components/editorial.js";
import { journalCards } from "./journal-page.js";

export function homePageMarkup(product) {
  const href = escapeHtml(toSitePath(product.slug));
  return `<section class="cinematic-hero" aria-labelledby="home-title">
    ${editorialImage("hero", { className: "hero-image", eager: true })}
    <div class="hero-shade"></div>
    <div class="shell hero-content"><p class="eyebrow"><span class="blue-dash"></span> FOR THE LOVE OF THE DRIVE</p><h1 id="home-title">The finish<br><em>is everything.</em></h1><p>A dedicated microfiber towel for the last step of your wash. Blue fabric, black edging, unmistakably ZENO.</p><div class="hero-product"><a href="${href}">${escapeHtml(product.title)}</a><strong>${escapeHtml(formatPrice(product) ?? '')}</strong></div><div class="actions"><a class="button button--blue" href="${href}">Discover the drying towel ${icon("arrow")}</a><a class="hero-text-link" href="#why-zeno">Meet ZENO ${icon("arrow")}</a></div></div>
    <div class="hero-foot shell"><span>CAR CARE. WITH CHARACTER.</span><a href="#the-essential">SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a><span class="hero-edition">THE DRYING COLLECTION / 01</span></div>
  </section>
  <section class="benefit-strip" aria-label="The ZENO essentials"><div class="shell">
    <div>${icon("drop")}<span>850 GSM microfiber for vehicle drying</span></div><div>${icon("surface")}<span>Free delivery in Romania</span></div><div>${icon("edge")}<a href="${toSitePath('/shipping-delivery/')}">Delivery across Europe ${icon('arrow')}</a></div>
  </div></section>
  <section class="signature-section section-space" id="the-essential" aria-labelledby="signature-title"><div class="shell">
    <div class="section-heading"><div><p class="eyebrow">LESS CLUTTER. MORE PURPOSE.</p><h2 id="signature-title">One essential.<br>Every wash.</h2></div><a class="text-link" href="${toSitePath("/shop/")}">Explore the collection ${icon("arrow")}</a></div>
    <div class="signature-grid"><a class="signature-visual" href="${href}"><span class="product-kicker">THE ORIGINAL / 01</span>${productVisualMarkup(product, product.media[0], { className: "signature-towel", sizes: "(min-width: 60rem) 50vw, 100vw" })}<span class="visual-caption">Product visualisation</span></a>
      <div class="signature-copy"><p class="eyebrow">THE FINISHING TOUCH</p><h3>${escapeHtml(product.title)}</h3><p class="product-lede">The wash is done.<br>Make the finish yours.</p><p>${escapeHtml(product.shortDescription)}</p><ul class="tick-list"><li>${icon("check")}Soft microfiber construction</li><li>${icon("check")}Distinctive blue. Clean black edging.</li><li>${icon("check")}A dedicated towel for your drying routine</li></ul><div class="signature-price"><strong>${escapeHtml(formatPrice(product) ?? "")}</strong><span>Single towel</span></div><div class="actions"><a class="button" href="${href}">Meet your drying towel ${icon("arrow")}</a></div><a class="quiet-link" href="${toSitePath("/journal/choosing-a-drying-towel/")}">What makes a good drying towel?</a></div>
    </div>
  </div></section>
  <section class="brand-story" id="why-zeno" aria-labelledby="why-title"><div class="brand-story__image">${editorialImage("detail", { sizes: "(min-width: 60rem) 50vw, 100vw" })}<span class="image-folio">THE DETAILS MAKE THE DIFFERENCE.</span></div><div class="brand-story__copy"><p class="eyebrow">THIS IS ZENO DETAIL</p><h2 id="why-title">For the people<br>who <em>notice.</em></h2><p>The clean reflection. The last drop. That look back after you park. We know the feeling.</p><p>ZENO is built around the small rituals that make looking after your car satisfying. Useful essentials, a clear purpose and a little more attention to the details.</p><a class="text-link text-link--light" href="${toSitePath("/about/")}">The ZENO story ${icon("arrow")}</a></div></section>
  <section class="routine-section section-space"><div class="shell"><div class="section-heading"><div><p class="eyebrow">A BETTER FINISH STARTS WITH A BETTER ROUTINE</p><h2>Three steps.<br>One satisfying finish.</h2></div><p class="section-heading__note">Keep it simple. Give each step the attention it deserves.</p></div><div class="routine-grid">${[
    [
      "01",
      "Wash with care.",
      "Start with a clean, thoroughly rinsed surface. Keep dirt away from your drying towel.",
    ],
    [
      "02",
      "Dry with purpose.",
      "Work from the roof down with clean microfiber and gentle contact. Switch towels when needed.",
    ],
    [
      "03",
      "Enjoy the details.",
      "Check the mirrors and panel gaps for the last drips. Then take that second look.",
    ],
  ]
    .map(
      ([number, title, body]) =>
        `<div class="routine-step"><span>${number}</span><h3>${title}</h3><p>${body}</p></div>`,
    )
    .join(
      "",
    )}</div><a class="text-link" href="${toSitePath("/journal/how-to-dry-your-car/")}">Read the car-drying guide ${icon("arrow")}</a></div></section>
  <section class="journal-section section-space"><div class="shell"><div class="section-heading"><div><p class="eyebrow">THE ZENO JOURNAL</p><h2>Good care is a habit.</h2></div><a class="text-link" href="${toSitePath("/journal/")}">All care guides ${icon("arrow")}</a></div>${journalCards()}</div></section>
  <section class="faq-band"><div class="shell faq-layout"><div><p class="eyebrow">A FEW GOOD QUESTIONS</p><h2>The details,<br>made clear.</h2><a class="text-link" href="${toSitePath("/faq/")}">More about the towel ${icon("arrow")}</a></div>${faqListMarkup(product.faqs)}</div></section>
  ${closingCta()}`;
}
