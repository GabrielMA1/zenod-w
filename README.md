# ZENO DETAIL storefront

A static Vite storefront for ZENO DETAIL in nine languages: English (`/`), Romanian (`/ro/`), German (`/de/`), French (`/fr/`), Spanish (`/es/`), Italian (`/it/`), European Portuguese (`/pt/`), Polish (`/pl/`) and Dutch (`/nl/`). Every page, the bag, search, delivery information and the three care guides are translated in every language. The art direction is documented in [DESIGN.md](DESIGN.md); persistent project notes for coding sessions are in [CLAUDE.md](CLAUDE.md).

## Development

Use Node.js 24 and npm, matching CI.

```bash
npm ci
npm run dev
```

To reproduce the deployed origin and run the complete checks:

```bash
SITE_BASE_PATH=/ SITE_BASE_URL=https://zenodetail.com/ npm run qa
npm run preview
```

`qa` regenerates the HTML, builds `dist/`, audits generated and built pages, and runs the Node regression tests. `npm test` runs the tests against the current generated files; `npm run i18n:check` reports any visible string missing from a language. `SITE_BASE_PATH` supports a deployment subdirectory; `SITE_BASE_URL` must have the matching path.

## Where to edit

| File | Purpose |
| --- | --- |
| `data/products.js` | Product facts, verified specifications and regional prices (€22.85 / 90 RON, owner-selected). |
| `data/site.js` | Navigation, store FAQs, announcement, brand assets and launch feature gates. |
| `data/pages.js` | Routes, titles and descriptions generated for every language. |
| `data/locales.js` | Languages, formatting, pricing markets and market defaults. |
| `data/translations/<lang>.json` | One dictionary per language, keyed by the exact English string (UI, product, guides, metadata). |
| `data/localization.js`, `data/dictionaries.js` | Translation and locale routing; Node registers every dictionary, the browser loads only the current one. |
| `data/journal.js` | Care guides (English source; translations live in the dictionaries). |
| `data/image-manifest.json`, `data/media.js` | Every image slot: destination, ratio, focal point, status, fallback and alt text. |
| `assets/js/pages/`, `assets/js/components/` | Page templates; header, preferences selector, gallery, bag, search. |
| `assets/css/` | `tokens`, `base`, `shell`, `components`, `pages`. |
| `scripts/generate-pages.mjs` | Static HTML, metadata, language alternates, sitemap and manifest. |
| `assets/js/seo.js` | Organization, WebSite, Product, FAQ, Article and Breadcrumb structured data. |

## Language, region and currency

Language and shopping region are independent choices in the **Language and region** selector (header on larger screens, mobile menu, footer and delivery page). The current choice is shown as, for example, `English · Europe · EUR €`.

- First visit to `/`: English, Europe / International, EUR. Nobody is redirected by IP address or browser language.
- Direct language URLs are always respected. `/ro/` defaults to the Romania region (RON); every other language defaults to Europe (EUR).
- An explicit region choice persists in browser storage across pages, reloads and language changes; without storage it travels in a `?market=` URL parameter (canonical URLs exclude it). A default is never treated as a choice.
- Changing region updates every price and the bag in place; changing language opens the equivalent page and keeps the region and the bag.
- A visitor who explicitly chose another language returns to it when they arrive at the English root from outside the site.
- Only approved markets exist: EUR (Europe / International) and RON (Romania).

## Images

Every image position is a slot in `data/image-manifest.json`. Until a final asset is approved, a slot shows one of the four existing generated visualisations (captioned "Product visualisation") or stays out of the page. Prompts, reference attachments, destinations and validation criteria for the ChatGPT Images production are in [docs/IMAGE-PRODUCTION-QUEUE.md](docs/IMAGE-PRODUCTION-QUEUE.md).

```bash
npm run images:status
npm run images:process -- <slot> path/to/image.png   # AVIF + WebP widths, original kept in media-source/
npm run images:approve -- <slot>                     # after visual review
```

See [docs/GENERATED-VISUALS.md](docs/GENERATED-VISUALS.md) for provenance and [docs/PRODUCT-PHOTOGRAPHY-BRIEF.md](docs/PRODUCT-PHOTOGRAPHY-BRIEF.md) for real photography.

## SEO

Each language page has its own canonical URL, reciprocal `hreflang` links for all nine languages plus `x-default`, localized titles and descriptions, Open Graph metadata and structured data. The production build generates 207 routes; the sitemap contains the 90 public URLs (10 per language). Empty categories and unfinished legal/support pages remain noindexed and out of navigation. Product structured data has no `offers` until availability and ordering are real.

## Ordering and pricing

This is a prepared storefront, not a connected checkout. Search, the gallery and the local bag work; Stripe is the selected payment provider, but its account connection and a hosted server-side checkout still need to be built. Approved delivery terms are free shipping in Romania and address-based rates elsewhere in Europe. The store says clearly that ordering is not open. See [docs/PRICING-AND-LAUNCH.md](docs/PRICING-AND-LAUNCH.md) for the competitor research and the remaining inputs, and [docs/LAUNCH-REQUIREMENTS.md](docs/LAUNCH-REQUIREMENTS.md) for the full launch-data contract. Do not enable unconfigured features or publish unsupported specifications, reviews, shipping promises or discount claims.

## Validation

See [docs/REDESIGN-VALIDATION.md](docs/REDESIGN-VALIDATION.md) for measured results and [docs/REDESIGN-PROGRESS.md](docs/REDESIGN-PROGRESS.md) for decisions and open work.

## Publication

The live site at `https://zenodetail.com/` is currently published by **GitHub Actions**: on a push to `main`, `.github/workflows/pages.yml` builds `dist/`, runs the audits and tests, deploys, and then verifies every language route on the live domain. (Checked on 5 November 2026: the live `build-revision` matched the `main` commit and its bundle was built by the workflow, not taken from the repository.)

The workflow also still supports the older **branch source** (`main` / root). In that mode `npm run publish:branch` builds a checksummed release from a clean source commit into the repository root, and CI validates it before the live checks. The `assets/app-*` bundles and `.pages-release.json` at the root are leftovers of that mode and are not served while Actions publishing is active.

Website publication never enables Stripe checkout.
