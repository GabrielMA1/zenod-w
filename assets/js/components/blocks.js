import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';

export function faqListMarkup(faqs) {
  return `<div class="faq-list">
    ${faqs.map((item, index) => `<details ${index === 0 ? 'open' : ''}>
      <summary><span>${escapeHtml(item.question)}</span>${icon('plus')}</summary>
      <div><p>${escapeHtml(item.answer)}</p></div>
    </details>`).join('')}
  </div>`;
}

export function principlesMarkup(items) {
  return `<dl class="principles">
    ${items.map(([term, description]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(description)}</dd></div>`).join('')}
  </dl>`;
}

// The opening screen is the towel itself: a ZENO blue field bound by a black edge.
export function towelFieldMarkup({ className = '', content, mark = true }) {
  return `<div class="towel-field ${className}">
    <div class="towel-field__surface">
      ${content}
      ${mark ? `<img class="towel-field__mark" src="${toSitePath(siteConfig.brandAssets.symbolWhite)}" alt="" width="848" height="524">` : ''}
    </div>
  </div>`;
}
