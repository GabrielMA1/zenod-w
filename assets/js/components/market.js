import { marketPrices } from '../../../data/products.js';
import { markets } from '../../../data/locales.js';
import { escapeHtml } from '../lib/html.js';

// Market-dependent content is rendered for every approved market and shown by the
// html[data-market] attribute, which an inline head script sets before first paint.
// Without JavaScript the page's default market is shown.
export function marketTextMarkup(variants, { tag = 'span', className = '' } = {}) {
  return Object.keys(markets).filter((id) => variants[id]).map((id) =>
    `<${tag} class="${escapeHtml(className)}" data-market-only="${id}">${variants[id]}</${tag}>`).join('');
}

// One price element whose text the client swaps for the chosen market. The default
// market's amount is in the HTML; alternative amounts are data attributes, so the
// visible text always matches one market.
export function priceMarkup(product, { variant = null, className = 'price', tag = 'span' } = {}) {
  const prices = marketPrices(product, variant, product.locale);
  const attributes = Object.entries(prices).map(([id, value]) => `data-price-${id.toLowerCase()}="${escapeHtml(value ?? '')}"`).join(' ');
  return `<${tag} class="${escapeHtml(className)}" data-market-price ${attributes}>${escapeHtml(prices[product.market] ?? '')}</${tag}>`;
}

export function deliveryMarkup(options = {}) {
  return marketTextMarkup({
    RO: 'Free delivery in Romania',
    EU: 'Delivery across Europe, priced for your address',
  }, options);
}
