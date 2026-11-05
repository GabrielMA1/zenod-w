import { escapeHtml } from "../lib/html.js";
import { toSitePath } from "../../../data/deployment.js";
import { productCardMarkup } from "../components/product.js";
import { editorialImage, closingCta } from "../components/editorial.js";
import { icon } from "../components/icons.js";

export function collectionPageMarkup(page, products) {
  return `<section class="page-intro shop-intro"><div class="shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath("/")}">Home</a></li><li aria-current="page">Shop</li></ol></nav><p class="eyebrow">THE ZENO COLLECTION</p><h1>Good care.<br>Starts here.</h1><p class="lede">A focused collection. A clear purpose.<br>Meet the first essential in your ZENO routine.</p></div></section>
  <section class="collection" id="catalog" aria-labelledby="catalog-title"><div class="shell"><div class="catalog-toolbar"><h2 id="catalog-title">The drying essentials</h2><span>${products.length} product</span></div>${products.map((product) => productCardMarkup(product)).join("")}<div class="catalog-note"><span class="eyebrow">BUY WITH THE DETAILS IN VIEW</span><p>Explore the material, colour and construction before you choose. Every published specification comes from our product data.</p><a class="text-link" href="${toSitePath("/journal/choosing-a-drying-towel/")}">The drying towel guide ${icon("arrow")}</a></div></div></section>${closingCta()}`;
}
