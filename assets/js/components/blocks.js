import { articles } from '../../../data/journal.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';
import { imageMarkup } from './media.js';
import { marketTextMarkup } from './market.js';

export function faqListMarkup(faqs, { openFirst = true } = {}) {
  return `<div class="faq">
    ${faqs.map((item, index) => `<details class="faq__item"${openFirst && index === 0 ? ' open' : ''}>
      <summary><span>${escapeHtml(item.question)}</span>${icon('plus')}</summary>
      <div class="faq__answer"><p>${escapeHtml(item.answer)}</p></div>
    </details>`).join('')}
  </div>`;
}

// Care guides as a readable list: thumbnail, title, summary, reading time.
export function guideListMarkup({ headingLevel = 3, limit = articles.length, exclude = null } = {}) {
  return `<ol class="guide-list" role="list">${articles.filter((article) => article.id !== exclude).slice(0, limit).map((article) => `<li class="guide-row">
    <a class="guide-row__link" href="${toSitePath(article.route)}">
      ${imageMarkup(article.cover, { className: 'guide-row__media', sizes: '(min-width: 48rem) 14rem, 34vw', caption: false, alt: '' })}
      <div class="guide-row__text">
        <h${headingLevel} class="guide-row__title">${escapeHtml(article.title)}</h${headingLevel}>
        <span class="guide-row__teaser">${escapeHtml(article.teaser)}</span>
        <span class="guide-row__meta">${escapeHtml(article.readingTime)}</span>
      </div>
    </a>
  </li>`).join('')}</ol>`;
}

// Delivery and ordering facts. The row for the visitor's shopping region is marked.
export function deliveryFactsMarkup() {
  const yours = (market) => marketTextMarkup({ [market]: 'Your shopping region' }, { className: 'facts__flag' });
  return `<dl class="facts">
    <div data-market-row="RO"><dt>Romania ${yours('RO')}</dt><dd><p>Shipping to addresses in Romania is free.</p><p>There is no delivery charge to add to your product total.</p></dd></div>
    <div data-market-row="EU"><dt>Elsewhere in Europe ${yours('EU')}</dt><dd><p>We deliver across Europe. Outside Romania, shipping depends on the delivery address.</p><p>Your delivery charge must be confirmed before payment. We do not apply a single flat rate to every European destination.</p></dd></div>
    <div><dt>Ordering</dt><dd><p>Online ordering is not open yet. You can explore the towel and save it in your bag.</p></dd></div>
    <div><dt>Prices</dt><dd><p>Prices are shown in EUR for Europe / International and in RON for Romania. Language and shopping region are set separately.</p></dd></div>
  </dl>`;
}
