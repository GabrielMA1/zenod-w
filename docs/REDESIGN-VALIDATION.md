# Storefront validation

Measured on 5 November 2026 against the redesigned storefront, Node 24.22.1, production settings `SITE_BASE_PATH=/` and `SITE_BASE_URL=https://zenodetail.com/`. These are local lab results, not field data or a ranking guarantee.

## Build, audits and tests

| Check | Result |
| --- | --- |
| `npm run qa` (build, source audit, distribution audit, tests) | Passed |
| Generated routes | 207 (23 per language × 9 languages) |
| Sitemap | 90 public URLs (10 per language); reserved pages noindexed |
| Source audit | Passed: navigation, links, assets, headings (one H1), landmarks, accessible names, canonical/hreflang, schema parity, unique titles and descriptions, no English left in translated pages |
| Distribution audit | Passed for all 207 routes and their assets |
| Node tests | 15 passed (8 existing, 7 new): nine languages, exact translation coverage for every visible string, approved markets only, explicit-vs-default market logic, per-page market markup and both regional prices, selector contents, image-manifest integrity |
| Translation coverage (`npm run i18n:check`) | 0 missing strings in ro, de, fr, es, it, pt, pl, nl (305 keys each), including image alt texts for slots not yet live |

Baseline before the redesign (same commands, same checkout): 161 routes, 70 sitemap URLs, audits passed, 8 tests passed.

## Browser checks (Playwright + Chromium, production preview)

65 of 65 checks passed:

- All nine languages on the product page at 390 px: correct `lang`, default market (RON for `/ro/`, EUR elsewhere), price, no horizontal overflow, no console errors.
- Root first visit: English · EUR, no redirect. Direct `/ro/`: RON and the Romanian delivery notice.
- German page → Romania region: prices, sticky bar and bag re-priced in place without reload (2 × €22.85 → 180,00 RON); the delivery row is marked as the visitor's region; focus moves into the panel on open and returns on Escape.
- Then Polish via the selector: lands on `/pl/products/drying-towel/`, keeps RON and the bag; the region persists on navigation and the bag on reload.
- Română + Europe from the English root: Romanian pages with EUR. Returning to the root from outside restores Romanian; direct English URLs and internal links to the root are not redirected; choosing English again stops the redirect.
- Browser storage blocked: the explicit region travels in `?market=` and through internal links; no script errors.
- Gallery next/previous and arrow keys; zoom closes with Escape and returns focus; search finds the product and guides; Dutch mobile menu and the preferences bottom sheet; `404.html`.
- axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA rules): zero violations on 12 views (8 desktop, 4 mobile, across en/pl/de/ro/nl) plus the open preferences panel. One contrast defect (product tag inside long-form text on About) was found and fixed during this run.

Visual review screenshots were taken at 390, 768, 1024, 1280, 1440 and 1920 px, including German, Polish, Spanish and Dutch headers. Before/after comparisons are in `docs/screenshots/`.

## Lighthouse 12.8.2 (production preview, Chromium 1243)

| Page | Mode | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home `/` | Mobile | 95 | 100 | 100 | 100 | 2.8 s | 0 ms | 0.031 |
| Product | Mobile | 94 | 100 | 100 | 100 | 2.9 s | 0 ms | 0.001 |
| Romanian home `/ro/` | Mobile | 94 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 |
| Home `/` | Desktop | 100 | 100 | 100 | 100 | 0.6 s | 0 ms | 0.004 |
| Product | Desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 ms | 0.009 |

Re-measured on 6 November 2026 after the first three final visualisations replaced the fallbacks (5 November, with fallbacks: mobile 94–95, LCP 2.7–2.8 s). The browser suite (65 checks) and all audits and tests passed again on that build. After the texture image and the three guide covers were added the same day: product mobile 93 (LCP 2.9 s), guide mobile 96 (LCP 2.5 s), guide desktop 100; 65 of 65 browser checks passed. With every non-blocked slot implemented (on-paint and in-use added), the browser suite again passed 65 of 65. The fifth gallery thumbnail first pushed product-page mobile LCP to 3.3 s (score 90–91) because visible thumbnails loaded at high priority alongside the main image; marking thumbnails `fetchpriority="low"` brought it to 2.7–2.8 s (94–95). Home mobile: 93, LCP 2.9 s.

Mobile LCP in Lighthouse's simulated slow 4G sits just above the 2.5 s "good" threshold; 74% of it is render delay behind the single stylesheet (7.6 kB gzipped). Inlining the stylesheet was tried and did not improve the result in this setup, so the cacheable stylesheet was kept. Field data on GitHub Pages should be checked after deployment.

JavaScript: the main bundle is 44.7 kB (15.3 kB gzipped), down from 320 kB before the dictionaries were split (the previous release was 260 kB). Pages are translated in static HTML, so the browser fetches only the current language's dictionary (about 12 kB gzipped; none for English).

## Not verified here

- The live domain after deployment (the workflow's verify job covers all nine languages once it runs).
- Real-device testing on iOS Safari and Android Chrome; screen-reader passes beyond automated checks.
- Impeccable's detector was not run: its npm package downloads a compiled engine binary that could not be reviewed as source. The design was audited manually against the Design Slop catalogue and the frontend-design checklist instead.
