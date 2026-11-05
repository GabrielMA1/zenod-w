# ZENO DETAIL storefront

A static, bilingual Vite storefront for ZENO DETAIL. English with EUR is the default; Romanian with RON is served under `/ro/`. The redesign includes original photographic-style brand imagery, product and collection pages, a local shopping bag, product/guide search, an About page, FAQs and three detailed care guides in both languages.

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
| `data/products.js` | Product facts, media and regional prices. Current proposals: €18 / 90 RON. |
| `data/site.js` | Navigation, brand assets and integration/launch feature gates. |
| `data/pages.js` | English routes and their Romanian counterparts. |
| `data/romanian.js` | Romanian UI and product copy. |
| `data/journal.js`, `data/journal.ro.js` | English and Romanian care guides. |
| `data/localization.js` | Locale routing, product pricing and translation of visible/accessible content. |
| `assets/js/pages/` | Page templates. |
| `assets/js/components/` | Navigation, search, product gallery and bag. |
| `assets/css/storefront.css` | The new responsive visual system, layered on the shared foundational styles. |
| `scripts/generate-pages.mjs` | Static HTML, metadata, language alternates, sitemap and manifest. |
| `assets/js/seo.js` | Organization, WebSite, Product, FAQ, Article and Breadcrumb structured data. |

Generated HTML is checked in. Regenerate it after editing data/templates, using the same deployment variables as the intended build. Both language versions contain their content in the initial HTML. Currency changes follow the selected locale; bag storage retains IDs and quantities rather than stale currency amounts.

## Images and SEO

Four original visuals are delivered as responsive AVIF/WebP assets. The towels use the supplied Z symbol and full ZENO DETAIL lockup. See [Generated visuals](docs/GENERATED-VISUALS.md) for provenance and the distinction between artwork and verified product photography.

The production build has individual canonical URLs, reciprocal `hreflang` links, `x-default`, localized titles/descriptions, Open Graph metadata, structured data, and a sitemap containing 20 public URLs. Empty categories and incomplete legal/support pages remain noindexed and out of navigation. There are 46 generated routes including those reserved pages.

## Ordering and pricing

This is a prepared storefront, not a connected checkout. Search, the gallery and local bag work; Stripe is the selected payment provider; its account connection and hosted checkout service still need to be configured. Approved delivery terms are free shipping in Romania and address-based rates elsewhere in Europe. The delivery page publishes these terms while operational shipping rates and order processing remain disabled. The store clearly communicates that ordering is not open. See [Pricing and launch handoff](docs/PRICING-AND-LAUNCH.md) for the proposed prices, competitor-access limitation and the exact remaining inputs.

The previous [launch requirements](docs/LAUNCH-REQUIREMENTS.md) and [photography brief](docs/PRODUCT-PHOTOGRAPHY-BRIEF.md) retain the detailed inventory and operational requirements. Do not enable unconfigured features or publish unsupported specifications, reviews, shipping promises or discount claims.

## Validation

- Source and distribution audits cover all 46 routes, local links/assets, structured-data parity, headings, accessible labels, navigation and deployment paths.
- `tests/storefront.test.mjs` covers independent regional prices, safe translation of DOM hooks and schema, reciprocal language metadata, and a persistent bag across a language change.
- Browser validation during the redesign exercises both languages on desktop, mobile and narrow screens, including search, gallery navigation, quantity/subtotals, reload persistence and locale switching. Local evidence is under `/workspace/.cloud-setup/zenod-w/evidence/redesign/`.

See [Redesign validation](docs/REDESIGN-VALIDATION.md) for the measured results and their limits.

Publishing uses the existing GitHub Pages workflow on `main`, targeting `https://zenodetail.com/`. The workflow verifies the deployed commit through a build-revision meta tag and checks both language versions, assets and the custom 404. Website publication does not enable checkout.
