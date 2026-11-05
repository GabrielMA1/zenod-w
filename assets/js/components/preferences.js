import {
  locales, markets, defaultMarket, marketPreference, marketStorageKey, languageStorageKey, logicalRoute, isMarket,
} from '../../../data/locales.js';
import { localePath, currentLocale, translate } from '../../../data/localization.js';
import { stripBasePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';
import { marketTextMarkup } from './market.js';

const separator = '<span class="prefs-summary__sep" aria-hidden="true">·</span>';

// "English · Europe · EUR €" — the current choice, shown discreetly in the header and footer.
export function preferencesSummaryMarkup(locale) {
  return `<span class="prefs-summary"><span lang="${locale}">${escapeHtml(locales[locale].label)}</span>${marketTextMarkup({
    EU: `${separator}<span>Europe</span>${separator}<span>EUR €</span>`,
    RO: `${separator}<span>Romania</span>${separator}<span>RON lei</span>`,
  })}</span>`;
}

function languageOptions(locale) {
  return Object.entries(locales).map(([id, item]) => `<label class="choice choice--language">
    <input type="radio" name="language" value="${id}"${id === locale ? ' checked' : ''}>
    <span lang="${id}">${escapeHtml(item.label)}</span>
  </label>`).join('');
}

function marketOptions(locale) {
  const descriptions = {
    EU: ['Europe / International', 'Prices in EUR. Shipping is calculated for your delivery address.'],
    RO: ['Romania', 'Prices in RON. Free delivery in Romania.'],
  };
  return Object.keys(markets).map((id) => `<label class="choice choice--region">
    <input type="radio" name="market" value="${id}"${id === defaultMarket(locale) ? ' checked' : ''}>
    <span><strong>${descriptions[id][0]}</strong><small>${descriptions[id][1]}</small></span>
  </label>`).join('');
}

export function preferencesPanelMarkup(locale) {
  return `<div class="prefs-panel" id="preferences-panel" role="dialog" aria-modal="false" aria-labelledby="preferences-title" hidden data-preferences-panel>
    <div class="prefs-panel__head">
      <h2 id="preferences-title">Language and region</h2>
      <button class="icon-button" type="button" data-preferences-close aria-label="Close language and region">${icon('close')}</button>
    </div>
    <form class="prefs-form" data-preferences-form>
      <fieldset class="prefs-group">
        <legend>Language</legend>
        <div class="prefs-languages">${languageOptions(locale)}</div>
      </fieldset>
      <fieldset class="prefs-group">
        <legend>Shopping region</legend>
        <div class="prefs-regions">${marketOptions(locale)}</div>
      </fieldset>
      <p class="prefs-currency"><span>Currency</span> <strong data-preferences-currency>${markets[defaultMarket(locale)].currencyLabel}</strong></p>
      <p class="prefs-note">The currency follows the shopping region. Your bag is kept when you change either setting.</p>
      <button class="button button--primary button--wide" type="submit">Save</button>
    </form>
  </div>`;
}

export function preferencesToggleMarkup(locale, className = 'prefs-toggle') {
  return `<button class="${className}" type="button" aria-expanded="false" aria-controls="preferences-panel" data-preferences-toggle>
    <span class="sr-only">Language and region:</span>${preferencesSummaryMarkup(locale)}${icon('chevronDown')}
  </button>`;
}

function storage() {
  try {
    const key = '__zeno-storage-test';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch {
    return null;
  }
}

function pageLogicalRoute() {
  const route = document.body.dataset.route ?? stripBasePath(window.location.pathname);
  return document.body.dataset.public === 'false' ? '/' : logicalRoute(route);
}

export function targetUrl(language, market, explicitMarket = true) {
  const url = new URL(localePath(pageLogicalRoute(), language), window.location.origin);
  if (explicitMarket && !storage() && market !== defaultMarket(language)) url.searchParams.set('market', market);
  return url.pathname + url.search;
}

export function initPreferences({ applyMarket, announce }) {
  const panel = document.querySelector('[data-preferences-panel]');
  const form = panel?.querySelector('[data-preferences-form]');
  if (!panel || !form) return;
  const locale = currentLocale();
  const currency = form.querySelector('[data-preferences-currency]');
  let returnFocus = null;

  const toggles = () => [...document.querySelectorAll('[data-preferences-toggle]')];
  const syncCurrency = () => {
    const selected = form.querySelector('input[name="market"]:checked')?.value;
    if (currency && isMarket(selected)) currency.textContent = markets[selected].currencyLabel;
  };

  function open(trigger) {
    const { market } = marketPreference(locale);
    form.querySelectorAll('input[name="language"]').forEach((input) => { input.checked = input.value === locale; });
    form.querySelectorAll('input[name="market"]').forEach((input) => { input.checked = input.value === market; });
    syncCurrency();
    const dialog = trigger?.closest('dialog');
    returnFocus = dialog ? document.querySelector('[data-open-mobile-menu]') : trigger;
    dialog?.close();
    panel.hidden = false;
    toggles().forEach((toggle) => toggle.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => form.querySelector('input[name="language"]:checked')?.focus());
  }

  function close({ restoreFocus = true } = {}) {
    if (panel.hidden) return;
    panel.hidden = true;
    toggles().forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) returnFocus?.focus();
    returnFocus = null;
  }

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-preferences-toggle]');
    if (toggle) {
      if (panel.hidden) open(toggle);
      else close();
      return;
    }
    if (event.target.closest('[data-preferences-close]')) { close(); return; }
    if (!panel.hidden && !panel.contains(event.target)) close({ restoreFocus: false });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(); }
  });
  panel.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (next && !panel.contains(next) && !next.closest('[data-preferences-toggle]')) close({ restoreFocus: false });
  });
  form.addEventListener('change', syncCurrency);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const language = form.querySelector('input[name="language"]:checked')?.value ?? locale;
    const market = form.querySelector('input[name="market"]:checked')?.value;
    if (!isMarket(market) || !locales[language]) return;
    const saved = storage();
    saved?.setItem(marketStorageKey, market);
    saved?.setItem(languageStorageKey, language);
    if (language !== locale) {
      window.location.assign(targetUrl(language, market));
      return;
    }
    const url = new URL(window.location.href);
    if (!saved && market !== defaultMarket(locale)) url.searchParams.set('market', market);
    else url.searchParams.delete('market');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    applyMarket(market);
    close();
    announce?.(translate(market === 'RO' ? 'Prices are now shown in RON.' : 'Prices are now shown in EUR.'));
  });

  // Plain language links (footer) remember the language like the form does.
  document.querySelectorAll('[data-language-link]').forEach((link) => link.addEventListener('click', () => {
    storage()?.setItem(languageStorageKey, link.getAttribute('hreflang'));
  }));
}
