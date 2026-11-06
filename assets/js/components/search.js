import { products, getProduct } from "../../../data/products.js";
import { articles } from "../../../data/journal.js";
import {
  translate,
  localePath,
  localizeMarkup,
} from "../../../data/localization.js";
import { escapeHtml } from "../lib/html.js";
import { icon } from "./icons.js";

export function searchDialogMarkup() {
  return `<dialog id="search-dialog" class="search" aria-labelledby="search-title"><div class="search__panel"><div class="drawer__head"><h2 id="search-title">Search</h2><button class="icon-button" type="button" data-close-dialog aria-label="Close search">${icon("close")}</button></div><div class="search__field"><label for="site-search">Search products and care guides</label><div class="search__input">${icon("search")}<input id="site-search" type="search" placeholder="Try drying towel or microfiber…" autocomplete="off" aria-controls="search-results"></div></div><div id="search-results" class="search__results" aria-live="polite"></div></div></dialog>`;
}

export function initSearch() {
  const dialog = document.querySelector("#search-dialog");
  const input = document.querySelector("#site-search");
  const results = document.querySelector("#search-results");
  if (!dialog || !input || !results) return;
  const entries = [
    ...products.map((item) => {
      const product = getProduct(item.id);
      return {
        title: product.title,
        body: product.description,
        href: localePath(item.slug),
        type: translate("Product"),
      };
    }),
    ...articles.map((article) => ({
      title: translate(article.title),
      body: translate(article.teaser),
      href: localePath(article.route),
      type: translate("Care guide"),
    })),
  ];
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  function render() {
    const query = normalize(input.value.trim());
    const matches = entries.filter((item) =>
      normalize(item.title + " " + item.body).includes(query),
    );
    results.innerHTML = matches.length
      ? `<ul>${matches.map((item) => `<li><a href="${escapeHtml(item.href)}"><small>${escapeHtml(item.type)}</small><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></a></li>`).join("")}</ul>`
      : localizeMarkup(
          '<div class="search__empty"><p><strong>No matches.</strong></p><p>Try “towel”, “drying” or “microfiber”.</p></div>',
        );
  }
  input.addEventListener("input", render);
  document.querySelectorAll("[data-open-search]").forEach((trigger) =>
    trigger.addEventListener("click", () => {
      dialog.returnFocusElement = trigger;
      input.value = "";
      render();
      dialog.showModal();
      document.body.classList.add("is-locked");
      input.focus();
    }),
  );
}
