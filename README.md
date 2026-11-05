# ZENO DETAIL storefront

A static Vite storefront for ZENO DETAIL in seven languages: English, Romanian, German, Spanish, Italian, European Portuguese and French. English is served at `/`; other languages use `/ro/`, `/de/`, `/es/`, `/it/`, `/pt/` and `/fr/`. The store, delivery information and three care guides are translated in every language. Polish and Dutch are suggested future additions, not published language versions.

## Development

Use Node.js 24 and npm, matching CI. Each cloud task is already isolated; use the existing checkout rather than creating a worktree unless explicitly requested.

```bash
npm ci
npm run dev
```

To reproduce the deployed origin and run the complete checks:

```bash
SITE_BASE_PATH=/ SITE_BASE_URL=https://zenodetail.com/ npm run qa
npm run preview
```

`qa` regenerates the HTML, builds `dist/`, audits generated and built pages, and runs the Node regression tests. `npm test` runs the regression tests against the current generated files. `SITE_BASE_PATH` supports a deployment subdirectory; `SITE_BASE_URL` must have the matching path. The GitHub Pages workflow supplies the production values from its existing configuration.

## Where to edit

| File | Purpose |
| --- | --- |
| `data/products.js` | Product facts, media and regional prices. Current display prices: €18 / 90 RON. A higher EUR price awaits verified competitor research. |
| `data/site.js` | Navigation, brand assets and integration/launch feature gates. |
| `data/pages.js` | Routes generated for all seven languages. |
| `data/romanian.js` | Romanian UI, product and guide copy. |
| `data/journal.js`, `data/journal.ro.js` | English and Romanian care guides. |
| `data/locales.js` | Supported languages, formatting and market defaults. |
| `data/translations/*.json` | German, Spanish, Italian, Portuguese and French dictionaries, including guides. |
| `data/localization.js` | Locale routing, product pricing and translation of visible/accessible content. |
| `assets/js/pages/` | Page templates. |
| `assets/js/components/` | Navigation, search, product gallery and bag. |
| `assets/css/storefront.css` | The new responsive visual system, layered on the shared foundational styles. |
| `scripts/generate-pages.mjs` | Static HTML, metadata, language alternates, sitemap and manifest. |
| `assets/js/seo.js` | Organization, WebSite, Product, FAQ, Article and Breadcrumb structured data. |

Generated HTML is checked in. Regenerate it after editing data/templates, using the same deployment variables as the intended build. Every language contains its content in the initial HTML. Language and market are independent choices in the header menu. Direct Romanian URLs default to the Romanian market; other direct language URLs default to the European market. Explicit market selections persist across language changes, reloads and navigation. The market determines the displayed currency and price; bag storage retains stable IDs and quantities. The optional `?market=RO` or `?market=EU` URL parameter also works when browser storage is unavailable. Canonical URLs exclude this display parameter.

## Images and SEO

Four original visuals are delivered as responsive AVIF/WebP assets. The towels use the supplied Z symbol and full ZENO DETAIL lockup. See [Generated visuals](docs/GENERATED-VISUALS.md) for provenance and the distinction between artwork and verified product photography.

The production build has individual canonical URLs, reciprocal `hreflang` links, `x-default`, localized titles/descriptions, Open Graph metadata, structured data, and a sitemap containing 70 public URLs. Empty categories and incomplete legal/support pages remain noindexed and out of navigation. There are 161 generated routes including those reserved pages.

## Ordering and pricing

This is a prepared storefront, not a connected checkout. Search, the gallery and local bag work; Stripe is the selected payment provider; its account connection and hosted checkout service still need to be configured. Approved delivery terms are free shipping in Romania and address-based rates elsewhere in Europe. The delivery page publishes these terms while operational shipping rates and order processing remain disabled. The store clearly communicates that ordering is not open. See [Pricing and launch handoff](docs/PRICING-AND-LAUNCH.md) for the proposed prices, competitor-access limitation and the exact remaining inputs.

The previous [launch requirements](docs/LAUNCH-REQUIREMENTS.md) and [photography brief](docs/PRODUCT-PHOTOGRAPHY-BRIEF.md) retain the detailed inventory and operational requirements. Do not enable unconfigured features or publish unsupported specifications, reviews, shipping promises or discount claims.

## Validation

- Source and distribution audits cover all 161 routes, local links/assets, structured-data parity, headings, accessible labels, navigation and deployment paths.
- `tests/storefront.test.mjs` covers independent regional prices, safe translation of DOM hooks and schema, reciprocal language metadata, and a persistent bag across a language change.
- Browser validation during the redesign exercises all seven languages on desktop, mobile and narrow screens, including search, gallery navigation, quantity/subtotals, reload persistence and locale switching. Current browser evidence is under `/workspace/.cloud-setup/zenod-w/evidence/international/`.

See [Redesign validation](docs/REDESIGN-VALIDATION.md) for the measured results and their limits.

Publishing uses the existing GitHub Pages workflow on `main`, targeting `https://zenodetail.com/`. The workflow verifies the deployed commit through a build-revision meta tag and checks all language versions, assets and the custom 404. Website publication does not enable checkout.

In the repository’s **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. A branch-based Pages source starts a second publisher that serves the unbundled repository and can overwrite the Vite artifact. Keep the Actions source selected so the tested `dist/` output is the only publication source.
