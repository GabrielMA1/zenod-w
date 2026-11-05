# Storefront validation

The latest production build uses `SITE_BASE_PATH=/` and `SITE_BASE_URL=https://zenodetail.com/`.

## Current language and market release

The store and all three guides are available in English, Romanian, German, Spanish, Italian, European Portuguese and French. The generator produces 161 HTML routes, with 70 public URLs in the sitemap. Other reserved pages remain noindexed.

Language and market are independent. Romanian direct URLs default to RON; other direct language URLs default to EUR. A chosen market survives language changes and navigation. Browser storage preserves the preference, and URL context provides a fallback when storage is blocked. Checkout remains disabled; the selected client market must never replace validated delivery-country pricing in a future payment service.

Validation:

- Production build, source audit and distribution audit passed for all 161 routes. Coverage includes static content, navigation, assets, schemas, canonical URLs, reciprocal language alternates and absence of long English fallback passages in translated public content.
- All seven Node regression tests passed. They cover regional amounts and stable identities, safe translation, every language counterpart, persistent bag behavior, market independence, URL preference priority and unavailable-storage fallback.
- The comprehensive desktop/mobile run passed 155 checks across all seven languages, including all public pages, search, gallery/zoom, bag operations, independent language/market changes and 320-pixel layouts. Its 28 accessibility views had zero violations.
- After startup optimization, 29 focused checks passed across all seven languages on desktop and mobile, with zero violations in 14 product-page accessibility views.
- Fourteen additional menu checks passed at 320 and 390 pixels: menu boundaries, keyboard Escape, outside-click dismissal and both market options in every language. The expanded menu now stays inside the viewport.
- Workflow shell syntax and `git diff --check` passed.

The optimized German homepage scored **98 performance, 100 accessibility, 100 best practices and 100 SEO** in Lighthouse 13.6.0 mobile simulation. Largest Contentful Paint was 2.3 seconds, Total Blocking Time 50 ms and Cumulative Layout Shift zero. Browser startup prepares only the current locale; metadata and translations are evaluated when needed, and phrase matching considers only relevant entries.

These are local lab measurements, not field performance or a search-ranking guarantee. Automated accessibility checks supplement keyboard and visual review.

Current screenshots, comprehensive browser results, menu results and Lighthouse reports are under `/workspace/.cloud-setup/zenod-w/evidence/international/`. Post-optimization interaction results are under `evidence/international-focused/`. The QA output is `/workspace/.cloud-setup/zenod-w/international-qa.log`. Earlier image-redesign evidence remains under `evidence/refined/`. These local artifacts and optional tools are outside the application repository.

## Publication and outstanding inputs

The GitHub Pages workflow checks that the repository Pages source is **GitHub Actions** before publishing, then verifies the served build revision and all 70 public routes. A branch-based Pages source starts a competing publisher and can overwrite the tested Vite output. A successful Git push alone does not verify production publication.

Stripe is selected but not connected. Payments, actual non-Romanian shipping quotes, stock and seller information still require configuration; warehouse and office details are pending. See [Pricing and ordering handoff](PRICING-AND-LAUNCH.md).

The higher European EUR price awaits accessible retailer research; no current competitor prices have been claimed. The owner reported Flash Detail maintenance and deferred its specification lookup. Dimensions, GSM, weave and blend remain unset. Research domains are saved in the cloud configuration draft, but direct research requests remain blocked until that network configuration is applied.
