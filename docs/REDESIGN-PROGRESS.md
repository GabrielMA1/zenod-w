# Redesign progress and decisions

Status as of 5 November 2026. Read this before continuing the redesign so research and decisions are not repeated.

## Done

- **Audit of the previous design.** It read as a generated template: dark cinematic car hero unrelated to the product, tracked all-caps eyebrows on every section ("FOR THE LOVE OF THE DRIVE", "SCROLL TO DISCOVER", "THE DRYING COLLECTION / 01"), italic accent words in headlines, numbered 01/02/03 blocks, a slogan banner on the product page and a giant footer word. The product and price came second. Worth keeping: the data model, translations, bag, gallery logic, SEO generation, audits and the four visuals.
- **Art direction** (`DESIGN.md`): wash-bay grey ground, the towel's cobalt as the only accent, black binding for header, footer and the product tag (the label at the towel's corner, carrying name, facts, price and actions). Archivo set wide for display (echoing the wordmark), normal width for reading.
- **Templates rebuilt:** home (product-led hero with the tag over the image corner, two-scale close-up, drying steps beside a full-bleed image, delivery facts, guides as a list), product page (sticky buy box, label-plate specifications, delivery, FAQ, guides, mobile sticky buy bar), shop, about, FAQ (towel + store questions), delivery, guides, article, 404, bag drawer, search, mobile menu.
- **Language, region and currency selector** with explicit-vs-default market logic, in-place price switching, pre-paint market script, URL fallback without storage and root language memory. See README "Language, region and currency".
- **Polish and Dutch** published; all dictionaries rebuilt to the 305 keys actually used (stale keys from the old design removed; Romanian moved from `romanian.js`/`journal.ro.js` to `ro.json`). `npm run i18n:check` and a test enforce exact coverage.
- **Image system:** `data/image-manifest.json` slots with fallbacks, focal crops and statuses; `scripts/process-image.mjs` (sharp) for processing and approval; `docs/IMAGE-PRODUCTION-QUEUE.md` with prompts and validation criteria; authentic wordmark SVGs; interim social card.
- **Performance:** browser loads only the current language's dictionary (main bundle 15 kB gzipped).
- **Competitor research** recorded in `docs/PRICING-AND-LAUNCH.md`. Prices unchanged.

## Decisions to keep

- Navigation has no separate "Shop" item: with one product, "Drying towel" goes straight to it; `/shop/` stays in the footer and breadcrumbs.
- Header shows `Language · Currency`; the full `Language · Region · Currency` appears in the footer, mobile menu, delivery page and panel. Primary navigation appears from 75rem; below that the menu holds it (German and Polish labels need the room).
- Nav-only short labels (`Drying towel`, `Guides`, `FAQ`) have their own dictionary entries so headings can stay descriptive.
- Market-specific content is rendered for both markets and toggled by `html[data-market]`, not by re-rendering. Keep new market-dependent text in `marketTextMarkup` and prices in `priceMarkup`.
- Specifications show only verified values plus one plain note that dimensions, blend and weave will be published before ordering opens.

## Further languages — evaluation

| Language | Recommendation | Reasoning |
| --- | --- | --- |
| Magyar (Hungarian) | **Next candidate** | Large Hungarian-speaking population in Romania (Transylvania) plus Hungary as a neighbouring market; same RON/EUR markets apply. Needs a fluent reviewer for product and care copy. |
| Čeština (Czech) | Later | Active detailing market, but EUR prices for a CZK market and no confirmed shipping rates yet. |
| Ελληνικά (Greek) | Later | Eurozone (EUR fits), but distant shipping and a non-Latin script needing typography checks (Archivo has no Greek; a fallback face would be required). |
| Svenska (Swedish) | Not now | SEK market, premium competition, unconfirmed Nordic shipping. |

Add a language only with a complete, reviewed dictionary: add it to `data/locales.js`, create `data/translations/<id>.json`, register it in `data/dictionaries.js`, run `npm run i18n:check`, and add it to the workflow's live-check language list.

## Open items

1. **Images (owner):** done on 6 November: hero, folded, edge and label, texture, the three guide covers and the social card. Remaining: `product-on-paint` (revised prompt; the first attempt was rejected) and `drying-in-use`. The product gallery's third image and the home routine image still use older fallbacks.
2. **Owner confirmation:** the horizontal symbol + wordmark arrangement in the header; the label/branding method on the real towel (the visualisations show a woven black label).
3. **Before launch:** real product photographs; dimensions, blend, weave; VAT treatment and price display wording; EU shipping rates and destinations; seller identity, contact, returns and legal pages; Stripe server-side checkout. See `docs/LAUNCH-REQUIREMENTS.md`.
4. **Clean-up:** the root `assets/app-*` bundles and `.pages-release.json` belong to the old branch-publishing mode and are unused while GitHub Actions publishes; remove them only once branch mode is retired.
5. **Real-device check** on iOS Safari / Android Chrome after deployment, and field Core Web Vitals.
