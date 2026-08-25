# ZENO DETAIL storefront

Phase 2 of the ZENO DETAIL storefront is a static-first, multi-page Vite site for a focused one-product catalog. Page HTML, metadata, schema and site infrastructure are generated from centralized JavaScript data before Vite bundles the shared CSS and browser interactions.

This repository includes an automated GitHub Pages preview workflow, but is not connected to a payment, review, newsletter, contact-form or analytics provider. The local cart stores data in the browser only. It does not transmit orders, collect payment details or create a checkout session.

## Local development and QA

Requirements: Node.js 20.19 or newer and npm.

```bash
npm install
npm run dev
```

The available commands are:

| Command | Purpose |
| --- | --- |
| `npm run generate` | Regenerate every HTML entry, `public/sitemap.xml`, `public/robots.txt` and `public/site.webmanifest` from the data files. |
| `npm run dev` | Regenerate first, then start the Vite development server. |
| `npm run build` | Regenerate first, then create the multi-page production bundle in `dist/`. |
| `npm run preview` | Serve the current `dist/` bundle locally. Run `npm run build` first. |
| `npm run audit` | Regenerate and audit routes, metadata, indexing states, navigation, data integrity, assets, schema parity and accessibility basics. Missing business inputs are reported separately as non-failing notices. |
| `npm run audit:dist` | Audit the final `dist/` artifact, including deployment-base safety, generated routes, linked assets, metadata, manifest, sitemap and robots directives. |
| `npm run qa` | Run the production build, source audit and deployment-artifact audit. This is the required final local check. |

After `npm run qa`, also inspect the home page, shop page, product page, cart, mobile navigation and image gallery in a real browser at desktop and mobile widths. Automated checks do not replace visual and interaction review.

## Deployment base paths

Local development defaults to the domain root (`/`). Deployment configuration is centralized in [`data/deployment.js`](./data/deployment.js): `SITE_BASE_PATH` selects the hosted pathname and optional `SITE_BASE_URL` supplies the complete public base URL used by canonical metadata, schema, sitemap and robots output. Vite, static generation and browser-rendered links all consume the same values.

The GitHub Pages preview values live only in [`.github/workflows/pages.yml`](./.github/workflows/pages.yml). Run a matching build by setting those two environment variables before `npm run qa`. When ZENO moves to its real root-hosted domain, use `/` as `SITE_BASE_PATH` and replace `SITE_BASE_URL`; route and asset data remain unchanged.

## Static-first architecture

[`scripts/generate-pages.mjs`](./scripts/generate-pages.mjs) combines [`data/pages.js`](./data/pages.js), [`data/site.js`](./data/site.js), [`data/products.js`](./data/products.js), the shared shell and the page renderers. It writes complete semantic HTML entry files before Vite runs. [`vite.config.js`](./vite.config.js) registers every generated HTML file as a Rollup input and copies stable brand assets plus any product media declared as published.

Browser JavaScript enhances the generated document; it is not responsible for creating the initial page:

```text
data/
  deployment.js                   base-path normalization and relative/absolute deployment URL helpers
  site.js                         site identity, store state, feature flags, navigation and categories
  products.js                     product, variant, media, merchandising and SEO data
  pages.js                        route, output, metadata, indexing and feature-gate definitions
assets/
  css/
    main.css                      local font and stylesheet entry point
    tokens.css                    color, type, spacing, radius, shadow, container and motion tokens
    base.css                      document defaults and accessibility foundations
    components.css                shell, controls, cart, product cards and gallery components
    pages.css                     home, collection, product and content-page layouts
  js/
    app.js                        browser bootstrap and absolute metadata activation
    pages.js                      page renderer dispatcher and shared page interactions
    pages/                        home, product, collection and content renderers
    components/                   shell, cart, gallery, product visual and icon components
    adapters/                     commerce, reviews and newsletter provider boundaries
    lib/html.js                   HTML, attribute, class and JSON escaping helpers
  images/
    brand/                        website-owned logo and icon derivatives
    products/                     approved production-media destinations
public/                           generated robots, sitemap and web app manifest
scripts/
  generate-pages.mjs              static page and infrastructure generator
  audit.mjs                       Phase 2 data, output and launch-readiness audit
  audit-dist.mjs                  final deployment-artifact and base-path audit
  generate-icons.ps1              reproducible raster icon derivative generator
docs/                              launch requirements and photography handoff
```

The main page renderer is intentionally split by responsibility. [`assets/js/pages.js`](./assets/js/pages.js) dispatches to the modules in [`assets/js/pages/`](./assets/js/pages/); reusable behavior stays in [`assets/js/components/`](./assets/js/components/), and provider-specific work stays behind [`assets/js/adapters/`](./assets/js/adapters/).

## Design system and self-hosted type

[`assets/css/tokens.css`](./assets/css/tokens.css) is the source of truth for the graphite, white and controlled-blue palette; fluid type scale; spacing; radii; borders; shadows; containers; header height; easing and duration. Component and page CSS should consume these custom properties instead of introducing unrelated values.

[`assets/css/main.css`](./assets/css/main.css) loads all styles in this order:

1. Manrope Variable for body and interface type.
2. Barlow Condensed 600 and 700 for display type.
3. Tokens, base rules, components and page layouts.

The fonts are bundled by Vite from `@fontsource-variable/manrope` and `@fontsource/barlow-condensed`; there is no runtime font request to Google Fonts or another third party. Both packages declare the SIL Open Font License 1.1. Package versions and sources are recorded in [`package.json`](./package.json) and `package-lock.json`; the installed packages also include their upstream `LICENSE` files.

## Store state and feature flags

[`data/site.js`](./data/site.js) holds the operational state. `storeMode` is currently `prelaunch`; it records the internal store state but does not publish features by itself. Rendering and navigation are controlled by the individual flags in `siteConfig.features`.

- `localCart` enables the browser-only cart UI.
- `commerceReady` and `checkoutReady` must both be true, and `commerce.checkoutUrl` must exist, before the current adapter exposes checkout.
- `reviewsReady`, `newsletterReady`, `legalReady`, `shippingReady`, `returnsReady`, `contactReady`, `productPhotographyReady`, `comparisonReady`, `guidesReady`, `searchReady`, `socialReady` and `analyticsReady` reserve explicit integration states.
- Announcement, support, legal and other optional UI are rendered only when the required flag and usable content are both present.

Do not turn on a flag merely to reveal a control. Complete its data, provider or content requirements first, then run the audit. The detailed dependency and approval checklist is in [Launch requirements](./docs/LAUNCH-REQUIREMENTS.md).

## Routes, navigation and indexing

The public navigation is deliberately focused on Shop, the Drying Towel, the Why ZENO home-page section, About and FAQ. Footer columns are filtered by the same feature state used by generation. Empty catalog categories and incomplete support or legal destinations are not linked.

| State | Routes | Behavior |
| --- | --- | --- |
| Public and indexable | `/`, `/shop/`, `/products/drying-towel/`, `/about/`, `/faq/` | Included in the sitemap and emitted with `index, follow`. |
| Generated aliases, not indexable | `/collections/all-products/`, `/collections/drying/` | Useful direct collection routes, emitted with `noindex, follow` and excluded from the sitemap. `/shop/` remains the primary public collection destination. |
| Unavailable empty categories | `/collections/microfiber/`, `/collections/exterior/`, `/collections/interior/`, `/collections/protection/`, `/collections/accessories/` | Generated as unavailable pages, marked `public: false` and `noindex`, excluded from navigation and the sitemap. |
| Feature-gated support and legal routes | `/contact/`, `/shipping-delivery/`, `/returns/`, `/privacy/`, `/terms/`, `/cookies/` | Generated as unavailable pages while their approved content/provider is absent; marked `public: false` and `noindex`. |
| Error document | `/404.html` | Generated, non-public and noindexed. |

To publish a currently unavailable route, implement its real renderer and approved content, update its `type`, `public`, `noindex` and optional `feature` values in [`data/pages.js`](./data/pages.js), enable the corresponding flag in [`data/site.js`](./data/site.js), and run `npm run qa`. Enabling the flag alone is intentionally insufficient.

## Product, variant and media data

[`data/products.js`](./data/products.js) is the product source of truth. Unknown or unapproved values remain `null` or disabled; renderers and schema helpers omit them instead of inventing claims.

The current model supports:

- stable product IDs, handles, route slugs, category membership, status and merchandising copy;
- nullable price, compare-at price, currency, SKU, barcode, availability, inventory and shipping class;
- nullable dimensions, GSM, fiber blend, weave, edge construction, weight and origin;
- specifications with an explicit `verified` state—only verified, populated rows are rendered;
- multiple variants with independent enabled state, quantity, price, compare-at, unit price, savings, badge and SKU fields;
- gallery media with stable IDs, image/video type, `src`, responsive source groups, intrinsic dimensions, aspect ratio, alt text, caption and fallback variant;
- reserved future media destinations, optional video metadata, care and usage readiness, FAQs, reviews, bundles, related products, comparisons and product-specific SEO.

At least one enabled variant is required for an active product. Monetary values require a three-letter currency. The audit rejects duplicate IDs, invalid money, bad route/category references, missing media accessibility data and populated technical facts that are not backed by a verified specification.

### Photography and responsive media

While an image `src` is `null`, [`productVisualMarkup`](./assets/js/components/product.js) renders a layout-safe CSS art-directed fallback using the supplied ZENO logo. It preserves the planned composition and accessible label without claiming to be production photography. Replace it only with approved product imagery.

Production media should provide:

- a reliable WebP or JPEG fallback in `media.src`;
- AVIF and/or WebP width candidates in `media.sources.avif` and `media.sources.webp`, each shaped as `{ src, width }`;
- accurate intrinsic `width` and `height`, a stable `aspectRatio`, and truthful `alt` and `caption` values;
- enough resolution for the gallery dialog while keeping smaller responsive candidates for cards and thumbnails;
- the first product image optimized for eager, high-priority loading; remaining gallery and card images are loaded lazily by the renderer.

`futureSources` records the planned filenames but is not rendered as a published source. Once files are approved and present, set `media.src` and the production `media.sources` entries to those real paths. Vite copies declared published media into `dist/`. If `media.srcset` is used directly, ensure every referenced file is also handled by the build or placed in `public/`.

Use the complete shot register, crops, resolutions, naming and approval rules in the [Product photography brief](./docs/PRODUCT-PHOTOGRAPHY-BRIEF.md). Do not substitute unverified performance imagery or generated product details.

## Gallery and zoom behavior

[`assets/js/components/gallery.js`](./assets/js/components/gallery.js) renders one stable gallery slide per eligible media item, a thumbnail tablist and an enlarged-view dialog. It supports:

- previous/next buttons and a live view count;
- click selection and horizontal touch swipes;
- `ArrowLeft`, `ArrowRight`, `Home` and `End` navigation within the thumbnail tablist;
- a scrollable horizontal thumbnail rail at narrow widths;
- native modal behavior, outside-click close, body scroll locking and focus restoration;
- eager loading for the first gallery image and lazy loading for the remaining views.

The enlarged view currently uses the same responsive media record as the gallery. A separate high-resolution delivery strategy can be added behind the media model without changing the gallery controls. The production renderer currently handles image media; the data model reserves video fields, but explicit player, poster and caption behavior must be implemented and audited before a video source is enabled.

## Commerce adapter and cart

[`assets/js/adapters/commerce.js`](./assets/js/adapters/commerce.js) is the provider boundary consumed by the UI. Its current implementation is a versioned local adapter:

- storage key `zeno-detail-cart-v2` with state shaped as `{ version: 2, lines: [...] }`;
- one-time defensive migration from the previous local storage shape;
- product and enabled-variant validation on read and write;
- add, update and remove operations, subscriptions, persistence and quantities limited to 1–99;
- a checkout capability test requiring `commerceReady`, `checkoutReady` and a configured checkout URL.

[`assets/js/components/cart.js`](./assets/js/components/cart.js) owns the accessible cart dialog and presentation. It resolves stored IDs back to current catalog data, updates item counts, announces add/remove changes, and hides line prices and subtotal when verified price/currency data is unavailable. Shipping text and checkout are likewise absent until their requirements are met.

A production commerce integration should preserve the adapter exports (`initializeCommerce`, `getCart`, `subscribe`, `addLine`, `updateLine`, `removeLine`, `canCheckout`, `checkout`) so the product and cart components remain provider-agnostic. Configure currency, prices, variants, inventory and availability, then replace or extend the adapter with the selected provider's authoritative cart/checkout flow. Never collect card details in this static application.

## Reviews and newsletter boundaries

[`assets/js/adapters/reviews.js`](./assets/js/adapters/reviews.js) and [`assets/js/adapters/newsletter.js`](./assets/js/adapters/newsletter.js) are inert provider boundaries. Reviews return no summary or items unless review readiness and provider data exist; newsletter subscription reports an unavailable/provider-not-configured state and sends no request. Enabling either feature flag does not implement its network integration. Add the chosen provider, consent handling, error states and privacy/legal approvals before exposing either feature.

## Collections and future catalog growth

The current collection renderer presents a single flagship product without empty filters, sorting controls or category navigation. `/shop/` is the primary catalog route; the drying and all-products collection routes remain noindexed aliases. Future categories already have stable IDs and route reservations in [`data/site.js`](./data/site.js), but stay `public: false` until they contain an active product and have a deliberate merchandising experience.

### Add another product

1. Add a complete object to `products` in [`data/products.js`](./data/products.js). Give it a unique `id`, `handle`, `slug`, active status, category ID and at least one enabled variant.
2. Leave every unknown commercial or technical value `null`. Add technical facts to `specifications` and set `verified: true` only after approval.
3. Add media records with unique IDs, truthful alt text, intrinsic dimensions and either approved `src`/responsive `sources` or a deliberate CSS fallback variant. Add the corresponding files under `assets/images/products/<handle>/`.
4. Add the product ID to the correct category's `productIds` array in [`data/site.js`](./data/site.js). Create a new category only if its ID, route and public state are also defined there.
5. Add a product route in [`data/pages.js`](./data/pages.js) with a unique route, output path, page ID, product ID, title, description, heading and intro.
6. Add final product SEO data. Set a product social image only when the asset exists and its crop is approved.
7. Update navigation only if the new product changes the focused information architecture. Do not automatically expose every category reservation.
8. Run `npm run qa`, then visually test the new product page, its collection card, gallery, cart line, metadata and mobile behavior.

The generic product and collection renderers will handle conforming data without a new page module. Add custom renderer code only when the product genuinely requires a different content structure.

## SEO, schema and social metadata

The generator emits route-specific titles, descriptions, robots directives, canonical references, Open Graph/Twitter fields and JSON-LD. [`assets/js/seo.js`](./assets/js/seo.js) enforces the same truth-first data boundary used by the visible UI:

- Organization schema is emitted on every page; URL and logo properties remain absent until `siteConfig.baseUrl` exists.
- Product schema includes only available identity, material, color and verified specifications. Image and SKU are conditional.
- Offer schema requires price, currency, availability and an absolute product URL.
- FAQ schema is generated only from the answered FAQs rendered for the product.
- Breadcrumb schema is emitted only after an absolute base URL is configured.

`siteConfig.baseUrl` is derived from `SITE_BASE_URL`. It remains `null` for ordinary local development, so local output does not invent canonical or Open Graph URLs. A configured deployment emits absolute canonical, Open Graph, breadcrumb, Organization, product, sitemap and robots URLs while preserving the deployment pathname.

Social images are also gated. `siteConfig.brandAssets.socialImageFuturePath` reserves `/assets/images/social/zeno-og.webp`, but no `og:image` or `twitter:image` is emitted until `brandAssets.socialImage` or a product `seo.image` points to an existing approved asset. Configure the production base URL at the same time so the final image URL is absolute.

## Brand derivatives and icons

Canonical brand source files outside this website repository remain untouched. The storefront uses website-owned copies and derivatives in [`assets/images/brand/`](./assets/images/brand/):

- `zeno-logo-web-black.svg` and `zeno-logo-web-white.svg` retain the supplied SVG path geometry and change only the viewBox/canvas crop for efficient website placement;
- `zeno-symbol-black.svg` and `zeno-symbol-white.svg` retain the supplied symbol geometry;
- `favicon.svg`, 16 px and 32 px favicons, the 180 px Apple touch icon, 192 px and 512 px app icons, and the 512 px maskable icon are canvas derivatives of the supplied symbol, not redraws.

[`scripts/generate-icons.ps1`](./scripts/generate-icons.ps1) reproduces the raster icons from the transparent supplied symbol by detecting its alpha bounds, centering it on the approved dark canvas and applying size-specific safe areas. Do not edit source path data, alter the mark's proportions or overwrite the canonical brand library.

## Deployment constraints

- The GitHub Pages workflow is a temporary public preview, not a signal that the store is operationally live.
- Complete and approve every blocking item in [Launch requirements](./docs/LAUNCH-REQUIREMENTS.md) before changing the store to a live operating state.
- Set the real HTTPS `SITE_BASE_URL` and root `SITE_BASE_PATH` when the permanent domain is confirmed.
- Build with `npm run qa` and deploy the contents of `dist/` only after it passes.
- The host must serve generated directory routes such as `/products/drying-towel/` directly and map unmatched requests to `404.html` without redirecting every URL to the home page.
- Preserve the generated `robots.txt`, `sitemap.xml`, manifest, font files and stable asset paths.
- Configure cache headers so hashed Vite assets can be cached long-term while HTML, `robots.txt` and `sitemap.xml` can be refreshed safely.
- A real commerce provider must own authoritative price, tax, inventory, shipping and checkout state. This static repository must not become a direct payment-card handler.
- Review security headers, CSP, consent behavior, privacy disclosures, analytics and provider domains against the final hosting and integration choices.

The two operational handoff documents are:

- [Launch requirements](./docs/LAUNCH-REQUIREMENTS.md) — exact business, product, pricing, shipping, returns, identity, contact, payment, review, newsletter, legal, social, analytics and media inputs required before go-live.
- [Product photography brief](./docs/PRODUCT-PHOTOGRAPHY-BRIEF.md) — truth baseline, capture standard, required shot register, responsive derivatives, video-ready data shape and approval checklist.
