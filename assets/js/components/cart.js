import { getProduct, formatMoney } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { addLine, canCheckout, checkout, getCart, initializeCommerce, removeLine, subscribe, updateLine } from '../adapters/commerce.js';
import { escapeHtml } from '../lib/html.js';
import { localizeMarkup, translate } from '../../../data/localization.js';
import { productVisualMarkup } from './product.js';
import { icon } from './icons.js';

function announce(message) {
  message = translate(message);
  const region = document.querySelector('#site-live-region');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

function resolveLine(line) {
  const product = getProduct(line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId);
  return product && variant ? { ...line, product, variant } : null;
}

function lineMarkup(line) {
  const { product, variant } = line;
  const media = product.media.find((item) => item.id === 'product-folded') ?? product.media[0];
  const unitAmount = variant.price ?? product.price;
  const unitPrice = formatMoney(unitAmount, product.currency);
  const linePrice = formatMoney(unitAmount == null ? null : unitAmount * line.quantity, product.currency);

  return `<li class="bag-line" data-cart-line="${escapeHtml(line.id)}">
    <a class="bag-line__visual" href="${escapeHtml(toSitePath(product.slug))}" tabindex="-1">${productVisualMarkup(product, media, { className: 'bag-line__media', sizes: '5rem' })}</a>
    <div class="bag-line__info">
      <div class="bag-line__heading"><h3><a href="${escapeHtml(toSitePath(product.slug))}">${escapeHtml(product.title)}</a></h3>${linePrice ? `<strong>${escapeHtml(linePrice)}</strong>` : ''}</div>
      <p class="bag-line__meta">${escapeHtml(variant.title)}${unitPrice ? ` · ${escapeHtml(unitPrice)} each` : ''}</p>
      <div class="bag-line__actions">
        <div class="quantity quantity--small" role="group" aria-label="Quantity for ${escapeHtml(product.title)}">
          <button type="button" data-cart-decrease="${escapeHtml(line.id)}" aria-label="Decrease quantity">${icon('minus')}</button>
          <output class="quantity__value" aria-live="polite">${line.quantity}</output>
          <button type="button" data-cart-increase="${escapeHtml(line.id)}" aria-label="Increase quantity">${icon('plus')}</button>
        </div>
        <button class="text-button" type="button" data-cart-remove="${escapeHtml(line.id)}">Remove</button>
      </div>
    </div>
  </li>`;
}

function renderCartContents(cart) {
  const lines = cart.lines.map(resolveLine).filter(Boolean);
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = String(count);
    element.hidden = count === 0;
  });
  document.querySelectorAll('[data-open-cart]').forEach((element) => {
    element.setAttribute('aria-label', `${translate('Bag')}, ${count}${translate(count === 1 ? ' item' : ' items')}`);
  });
  document.querySelectorAll('[data-cart-count-label]').forEach((element) => {
    element.textContent = `${count}${translate(count === 1 ? ' item' : ' items')}`;
  });

  const body = document.querySelector('[data-cart-body]');
  const footer = document.querySelector('[data-cart-footer]');
  if (!body || !footer) return;

  if (!lines.length) {
    body.innerHTML = `<div class="bag-empty">
      <p class="bag-empty__title">Your bag is empty.</p>
      <p>The ZENO Drying Towel is our first product.</p>
      <a class="button button--secondary" href="${toSitePath('/products/drying-towel/')}">View the towel</a>
    </div>`;
    footer.hidden = true;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = `<ul class="bag-lines">${lines.map(lineMarkup).join('')}</ul>`;
  const currencies = new Set(lines.map((line) => line.product.currency).filter(Boolean));
  const canCalculate = currencies.size === 1 && lines.every((line) => (line.variant.price ?? line.product.price) != null);
  const currency = [...currencies][0];
  const subtotal = canCalculate ? formatMoney(
    lines.reduce((total, line) => total + (line.variant.price ?? line.product.price) * line.quantity, 0),
    currency,
  ) : null;
  const market = lines[0].product.market;

  footer.hidden = false;
  footer.innerHTML = `${subtotal ? `<div class="bag-summary"><span>Subtotal</span><strong>${escapeHtml(subtotal)}</strong></div>` : ''}
    <p class="bag-delivery">${market === 'RO' ? 'Delivery in Romania is free.' : 'Shipping outside Romania is calculated for your address at checkout.'}</p>
    ${canCheckout() ? '<button class="button button--primary button--wide" type="button" data-checkout>Checkout</button>' : ''}
    ${!canCheckout() ? '<div class="bag-notice"><p><strong>Online ordering is not open yet.</strong></p><p>Your bag is saved on this device. Payment and delivery options will appear here when ordering opens.</p></div>' : ''}
    <a class="button button--secondary button--wide" href="${toSitePath('/products/drying-towel/')}">Continue shopping</a>`;
}

function renderCart(cart) {
  renderCartContents(cart);
  for (const target of document.querySelectorAll('[data-cart-body], [data-cart-footer]')) target.innerHTML = localizeMarkup(target.innerHTML);
}

function openCart(trigger = document.activeElement) {
  const dialog = document.querySelector('#cart-dialog');
  if (!dialog || dialog.open) return;
  dialog.returnFocusElement = trigger;
  dialog.showModal();
  requestAnimationFrame(() => dialog.querySelector('[data-close-dialog]')?.focus());
  document.body.classList.add('is-locked');
}

function focusCartControl(attribute, value) {
  requestAnimationFrame(() => {
    const target = [...document.querySelectorAll(`[${attribute}]`)]
      .find((element) => element.getAttribute(attribute) === value);
    target?.focus();
  });
}

export function refreshCart() {
  if (siteConfig.features.localCart) renderCart(getCart());
}

export function initCart() {
  if (!siteConfig.features.localCart) return;
  initializeCommerce();
  subscribe(renderCart);
  renderCart(getCart());

  document.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-open-cart]');
    if (openButton) {
      openCart(openButton);
      return;
    }

    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
      const product = getProduct(addButton.dataset.addToCart);
      const purchaseArea = addButton.closest('[data-product-purchase]')
        ?? (addButton.closest('[data-sticky-purchase]') ? document.querySelector('.pdp-buy-box[data-product-purchase]') : null);
      const quantity = Number.parseInt(purchaseArea?.querySelector('[data-quantity-value]')?.value ?? purchaseArea?.querySelector('[data-quantity-value]')?.textContent ?? '1', 10) || 1;
      const selectedVariant = purchaseArea?.querySelector('input[name="variant"]:checked')?.value
        ?? product?.variants.find((variant) => variant.enabled)?.id;
      if (product && selectedVariant && addLine({ productId: product.id, variantId: selectedVariant, quantity })) {
        announce(`${product.title} added to your bag.`);
        openCart(addButton);
      }
      return;
    }

    const increase = event.target.closest('[data-cart-increase]');
    if (increase) {
      const line = getCart().lines.find((item) => item.id === increase.dataset.cartIncrease);
      if (line) {
        const nextQuantity = Math.min(99, line.quantity + 1);
        updateLine(line.id, nextQuantity);
        announce(`Quantity updated to ${nextQuantity}.`);
        focusCartControl('data-cart-increase', line.id);
      }
      return;
    }

    const decrease = event.target.closest('[data-cart-decrease]');
    if (decrease) {
      const line = getCart().lines.find((item) => item.id === decrease.dataset.cartDecrease);
      if (line) {
        const nextQuantity = line.quantity - 1;
        updateLine(line.id, nextQuantity);
        announce(nextQuantity > 0 ? `Quantity updated to ${nextQuantity}.` : 'Item removed from your bag.');
        if (nextQuantity > 0) focusCartControl('data-cart-decrease', line.id);
        else requestAnimationFrame(() => document.querySelector('#cart-title')?.focus());
      }
      return;
    }

    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      const line = getCart().lines.find((item) => item.id === remove.dataset.cartRemove);
      const product = line ? getProduct(line.productId) : null;
      removeLine(remove.dataset.cartRemove);
      announce(`${product?.title ?? 'Item'} removed from your bag.`);
      return;
    }

    if (event.target.closest('[data-checkout]')) checkout();
  });
}
