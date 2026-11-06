import { getArticle } from '../../../data/journal.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { imageMarkup } from '../components/media.js';
import { guideListMarkup } from '../components/blocks.js';
import { productTagMarkup, productActionsMarkup } from '../components/product.js';
import { pageHeadMarkup } from './content-pages.js';

export function journalPageMarkup(page) {
  return `${pageHeadMarkup(page, { lede: 'Practical notes on washing, drying and looking after the details.' })}
  <section class="shell guides-index" aria-label="Care guides">${guideListMarkup({ headingLevel: 2 })}</section>`;
}

export function articlePageMarkup(page, product) {
  const article = getArticle(page.article);
  return `<article class="article">
    <div class="shell article__head">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="${toSitePath('/')}">Home</a></li><li><a href="${toSitePath('/journal/')}">Care guides</a></li><li aria-current="page">${escapeHtml(article.category)}</li></ol></nav>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="lede">${escapeHtml(article.teaser)}</p>
      <p class="article__meta"><span>By ZENO DETAIL</span><span>${escapeHtml(article.readingTime)}</span></p>
    </div>
    <div class="shell article__cover">${imageMarkup(article.cover, { eager: true, sizes: '(min-width: 88rem) 84rem, 100vw' })}</div>
    <div class="shell article__layout">
      <nav class="article__toc" aria-labelledby="toc-title"><h2 id="toc-title">In this guide</h2><ol>${article.sections.map((section, index) => `<li><a href="#section-${index + 1}">${escapeHtml(section.title)}</a></li>`).join('')}</ol></nav>
      <div class="article__body prose">
        ${article.sections.map((section, index) => `<section id="section-${index + 1}"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}
      </div>
      <aside class="article__product" aria-label="ZENO Drying Towel">
        ${productTagMarkup(product, { headingLevel: 2, className: 'product-tag--compact', actions: productActionsMarkup(product) })}
      </aside>
    </div>
  </article>
  <section class="section guides-band" aria-labelledby="more-guides-title">
    <div class="shell split">
      <div class="split__head"><h2 id="more-guides-title">More care guides</h2><a class="text-link" href="${toSitePath('/journal/')}">All care guides</a></div>
      ${guideListMarkup({ exclude: article.id })}
    </div>
  </section>`;
}
