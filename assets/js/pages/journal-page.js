import { articles, getArticle } from "../../../data/journal.js";
import { toSitePath } from "../../../data/deployment.js";
import { escapeHtml } from "../lib/html.js";
import { icon } from "../components/icons.js";
import { editorialImage, closingCta } from "../components/editorial.js";

export function journalCards(limit = 3) {
  return `<div class="journal-grid">${articles
    .slice(0, limit)
    .map(
      (article, index) => `<article class="journal-card">
    <a class="journal-card__image" href="${toSitePath(article.route)}" tabindex="-1" aria-label="0${index + 1}. ${escapeHtml(article.title)}">${editorialImage(article.image, { sizes: "(min-width: 60rem) 30vw, 90vw" })}<span class="journal-number">0${index + 1}</span></a>
    <p class="article-meta">${escapeHtml(article.category)} <span>${escapeHtml(article.readingTime)}</span></p>
    <h3><a href="${toSitePath(article.route)}">${escapeHtml(article.title)} ${icon("arrow")}</a></h3><p>${escapeHtml(article.teaser)}</p>
  </article>`,
    )
    .join("")}</div>`;
}

export function journalPageMarkup() {
  return `<section class="page-intro"><div class="shell"><p class="eyebrow">THE ZENO JOURNAL</p><h1>A little knowledge.<br>A better routine.</h1><p class="lede">Practical notes on washing, drying and looking after the details.</p></div></section><section class="journal-section"><div class="shell">${journalCards()}</div></section>${closingCta()}`;
}

export function articlePageMarkup(page) {
  const article = getArticle(page.article);
  return `<article class="journal-article">
    <div class="article-intro content-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath("/")}">Home</a></li><li><a href="${toSitePath("/journal/")}">Journal</a></li><li aria-current="page">${escapeHtml(article.category)}</li></ol></nav><p class="eyebrow">${escapeHtml(article.category)} · ${escapeHtml(article.readingTime)}</p><h1>${escapeHtml(article.title)}</h1><p class="lede">${escapeHtml(article.teaser)}</p><p class="article-byline">By ZENO DETAIL</p></div>
    <div class="shell article-cover">${editorialImage(article.image, { eager: true })}</div>
    <div class="article-layout shell"><nav class="article-contents" aria-label="On this page"><p class="eyebrow">IN THIS GUIDE</p>${article.sections.map((section, index) => `<a href="#section-${index + 1}">${escapeHtml(section.title)}</a>`).join("")}<a class="text-link" href="${toSitePath("/products/drying-towel/")}">Explore the drying towel ${icon("arrow")}</a></nav><div class="article-body">${article.sections.map((section, index) => `<section id="section-${index + 1}"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("")}<aside class="article-product"><p class="eyebrow">YOUR NEXT STEP</p><h2>Meet the ZENO Drying Towel.</h2><p>Soft microfiber. Blue with black edging. Made for the final step of a careful wash.</p><a class="button" href="${toSitePath("/products/drying-towel/")}">Explore the towel ${icon("arrow")}</a></aside><a class="text-link" href="${toSitePath("/journal/")}">All care guides ${icon("arrow")}</a></div></div>
  </article>`;
}
