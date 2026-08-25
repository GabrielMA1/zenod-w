import { getProduct, formatMoney } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { addLine, canCheckout, checkout, getCart, initializeCommerce, removeLine, subscribe, updateLine } from '../adapters/commerce.js';
import { escapeHtml } from '../lib/html.js';
import { productVisualMarkup } from './product.js';

function announce(message) {
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
  const media = product.media.find((item) => item.id === 'folded') ?? product.media[0];
  const unitPrice = formatMoney(variant.price ?? product.price, product.currency);
  const linePrice = formatMoney((variant.price ?? product.price) == null ? null : (variant.price ?? product.price) * line.quantity, product.currency);

  return `<li class="cart-line" data-cart-line="${escapeHtml(line.id)}">
    <a class="cart-line-visual" href="${escapeHtml(toSitePath(product.slug))}">${productVisualMarkup(product, media, { className: 'cart-line__media', sizes: '7rem' })}</a>
    <div class="cart-line-info">
      <div class="cart-line-heading"><h3><a href="${escapeHtml(toSitePath(product.slug))}">${escapeHtml(product.title)}</a></h3>${linePrice ? `<strong>${escapeHtml(linePrice)}</strong>` : ''}</div>
      <p class="cart-line-meta">${escapeHtml(variant.title)}${unitPrice ? ` · ${escapeHtml(unitPrice)} each` : ''}</p>
      <div class="cart-line-actions">
        <div class="quantity-control quantity-control--small" role="group" aria-label="Quantity for ${escapeHtml(product.title)}">
          <button type="button" data-cart-decrease="${escapeHtml(line.id)}" aria-label="Decrease ${escapeHtml(product.title)} quantity">−</button>
          <output class="quantity-value" aria-live="polite">${line.quantity}</output>
          <button type="button" data-cart-increase="${escapeHtml(line.id)}" aria-label="Increase ${escapeHtml(product.title)} quantity">+</button>
        </div>
        <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(line.id)}">Remove</button>
      </div>
    </div>
  </li>`;
}

function renderCart(cart) {
  const lines = cart.lines.map(resolveLine).filter(Boolean);
  const count = lines.reduce((total, line) => total + line.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = String(count);
    element.hidden = count === 0;
  });
  document.querySelectorAll('[data-open-cart]').forEach((element) => {
    element.setAttribute('aria-label', `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`);
  });
  document.querySelectorAll('[data-cart-count-label]').forEach((element) => {
    element.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  });

  const body = document.querySelector('[data-cart-body]');
  const footer = document.querySelector('[data-cart-footer]');
  if (!body || !footer) return;

  if (!lines.length) {
    body.innerHTML = `<div class="cart-empty">
      <img class="cart-empty-symbol" src="${toSitePath(siteConfig.brandAssets.symbolBlack)}" alt="" width="848" height="524">
      <h3>Your cart is empty.</h3>
      <p>Explore the ZENO Drying Towel.</p>
      <a class="button button--dark" href="${toSitePath('/products/drying-towel/')}">Shop the Drying Towel</a>
    </div>`;
    footer.hidden = true;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = `<ul class="cart-lines">${lines.map(lineMarkup).join('')}</ul>`;
  const currencies = new Set(lines.map((line) => line.product.currency).filter(Boolean));
  const canCalculate = currencies.size === 1 && lines.every((line) => (line.variant.price ?? line.product.price) != null);
  const currency = [...currencies][0];
  const subtotal = canCalculate ? formatMoney(
    lines.reduce((total, line) => total + (line.variant.price ?? line.product.price) * line.quantity, 0),
    currency,
  ) : null;

  footer.hidden = false;
  footer.innerHTML = `${subtotal ? `<div class="cart-summary-row"><span>Subtotal</span><strong>${escapeHtml(subtotal)}</strong></div>` : ''}
    ${siteConfig.features.shippingReady && siteConfig.shipping.summary ? `<p class="cart-note">${escapeHtml(siteConfig.shipping.summary)}</p>` : ''}
    ${canCheckout() ? '<button class="button button--blue button--wide" type="button" data-checkout>Checkout</button>' : ''}
    <a class="button button--outline button--wide" href="${toSitePath('/products/drying-towel/')}">Continue shopping</a>`;
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
        announce(`${product.title} added to cart.`);
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
        announce(nextQuantity > 0 ? `Quantity updated to ${nextQuantity}.` : 'Item removed from cart.');
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
      announce(`${product?.title ?? 'Item'} removed from cart.`);
      return;
    }

    if (event.target.closest('[data-checkout]')) checkout();
  });
}
