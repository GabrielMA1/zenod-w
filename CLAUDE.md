# ZENO DETAIL storefront — project notes

ZENO DETAIL is a European car-care accessories brand (Romania first). The site is a **prelaunch** static storefront for one product, the ZENO Drying Towel (blue microfiber, black edging, ZENO mark, owner-specified 850 GSM). Ordering is not open: the bag works locally, checkout does not exist.

## Stack and commands

Static Vite site; HTML is generated from data + template functions (no framework). Use **Node 24**.

```bash
npm ci
npm run dev                      # generate + Vite dev server
npm test                         # node --test against current generated HTML
npm run i18n:check               # every visible string translated in every language
SITE_BASE_PATH=/ SITE_BASE_URL=https://zenodetail.com/ npm run qa   # build + audits + tests (production-style)
npm run images:status            # image slots; images:process / images:approve (see docs/IMAGE-PRODUCTION-QUEUE.md)
```

Generation rewrites the committed root HTML (`index.html`, `<lang>/…`). Commit regenerated HTML from `npm run generate` with source changes. Pages are deployed by GitHub Actions from `dist/` (the `assets/app-*` files and `.pages-release.json` at the root are leftovers of the old branch-publishing mode).

## Where things live

- `data/products.js` — product facts, regional prices (`regionalPrices: { EUR: 22.85, RON: 90 }`), verified specifications. Unverified specs stay `null`/`verified: false` and are never rendered.
- `data/site.js` — feature gates (`commerceReady`, `checkoutReady`, `legalReady`… all false), navigation, store FAQs, announcement.
- `data/locales.js` — languages (en, ro, de, fr, es, it, pt, pl, nl) and markets (`EU` → EUR, `RO` → RON).
- `data/translations/<lang>.json` — dictionaries keyed by the exact English string; `data/dictionaries.js` registers them for Node; the browser lazy-loads only the current language.
- `data/image-manifest.json` + `data/media.js` — every image slot (destination, ratio, focal point, status, fallback, alt).
- `assets/js/components/`, `assets/js/pages/` — markup; `assets/css/{tokens,base,shell,components,pages}.css`.
- `scripts/generate-pages.mjs` (HTML, sitemap, hreflang), `scripts/audit*.mjs`, `scripts/translation-coverage.mjs`, `scripts/process-image.mjs`.
- `DESIGN.md` — art direction. `docs/` — launch requirements, pricing research, image queue, validation, progress.

## Rules that matter

- **Translation model:** templates are written in English; `localizeMarkup` replaces text tokens and `aria-label/alt/title/placeholder/content` by exact dictionary key (phrase fallback). Every new English string needs an entry in all 8 dictionaries — `npm run i18n:check` and the tests fail otherwise. Avoid translations that contain another key (e.g. "FAQ") inside page titles: titles are translated twice.
- **Language ≠ market.** `/ro/` defaults to RO/RON; every other language to EU/EUR. An explicit choice (selector or `?market=`) persists in `localStorage` (`zeno-detail-market`) and must never be inferred from language. Prices are rendered for both markets (`data-price-eu/ro`) and market-only text via `data-market-only`; an inline head script sets `html[data-market]` before paint. No IP or browser-language redirects; only the English root restores a language the visitor explicitly chose.
- **Approved markets only:** EUR and RON. Do not add currencies, compare-at prices, discounts, reviews, stock, delivery times, seller details or shipping rates without owner-approved data.
- **Commerce safety:** never enable checkout or collect payments; Stripe is selected but needs a server-side service. Never commit secrets.
- **Brand assets:** `assets/images/brand/` (`zeno-symbol-*`, `zeno-logo-web-*`, `zeno-wordmark-*` extracted unaltered from the logo paths, transparent PNGs). Never redraw the logo.
- **Images:** generated images are captioned "Product visualisation" and are not evidence of specs. Replace via `npm run images:process -- <slot> <file>` then `images:approve`.
- **Design:** follow `DESIGN.md` — wash-bay grey ground, cobalt only for product/actions, black binding (header, footer, product tag). No tracked all-caps eyebrows, italic accent words, gradients, glass, fake proof or decorative numbering.
- The audit requires exactly one `<header>`, `<main>`, `<footer>` and `<h1>` per page, unique titles/descriptions, and named links/buttons.
