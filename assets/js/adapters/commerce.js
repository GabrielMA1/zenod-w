import { getProduct, getPublicVariants } from '../../../data/products.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';

const storageKey = 'zeno-detail-cart-v2';
const legacyStorageKey = 'zeno-detail-cart-preview-v1';
const listeners = new Set();
let state = { version: 2, lines: [] };

function lineId(productId, variantId) {
  return `${productId}:${variantId}`;
}

function validLine(line) {
  const product = getProduct(line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId && item.enabled);
  return product && variant && Number.isInteger(line.quantity) && line.quantity > 0;
}

function read() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (stored?.version === 2 && Array.isArray(stored.lines)) {
      state = {
        version: 2,
        lines: stored.lines.filter(validLine).map((line) => ({ ...line, quantity: Math.min(line.quantity, 99) })),
      };
      return;
    }

    const legacy = JSON.parse(localStorage.getItem(legacyStorageKey) ?? '[]');
    if (Array.isArray(legacy)) {
      state.lines = legacy.flatMap((line) => {
        const product = getProduct(line.productId);
        const variant = product ? getPublicVariants(product)[0] : null;
        if (!product || !variant || !Number.isInteger(line.quantity) || line.quantity < 1) return [];
        return [{ id: lineId(product.id, variant.id), productId: product.id, variantId: variant.id, quantity: Math.min(line.quantity, 99) }];
      });
      localStorage.removeItem(legacyStorageKey);
      persist();
    }
  } catch {
    state = { version: 2, lines: [] };
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function emit() {
  const snapshot = getCart();
  listeners.forEach((listener) => listener(snapshot));
}

export function initializeCommerce() {
  read();
  emit();
}

export function getCart() {
  return { version: 2, lines: state.lines.map((line) => ({ ...line })) };
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addLine({ productId, variantId, quantity = 1 }) {
  if (!siteConfig.features.localCart) return false;
  const normalizedQuantity = Math.max(1, Math.min(99, Number.parseInt(quantity, 10) || 1));
  const candidate = { id: lineId(productId, variantId), productId, variantId, quantity: normalizedQuantity };
  if (!validLine(candidate)) return false;
  const existing = state.lines.find((line) => line.id === candidate.id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + normalizedQuantity);
  else state.lines.push(candidate);
  persist();
  emit();
  return true;
}

export function updateLine(id, quantity) {
  const line = state.lines.find((item) => item.id === id);
  if (!line) return;
  const next = Math.min(99, Number.parseInt(quantity, 10) || 0);
  if (next < 1) state.lines = state.lines.filter((item) => item.id !== id);
  else line.quantity = next;
  persist();
  emit();
}

export function removeLine(id) {
  state.lines = state.lines.filter((line) => line.id !== id);
  persist();
  emit();
}

export function canCheckout() {
  return Boolean(siteConfig.features.commerceReady && siteConfig.features.checkoutReady && siteConfig.commerce.checkoutUrl);
}

export function checkout() {
  if (!canCheckout()) return false;
  window.location.assign(toSitePath(siteConfig.commerce.checkoutUrl));
  return true;
}
