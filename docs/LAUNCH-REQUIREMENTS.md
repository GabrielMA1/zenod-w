# ZENO DETAIL launch requirements

> **Internal only. Never render this document or unresolved values on the storefront.** This is a launch-data contract, not legal advice and not evidence that an input is approved.

## Schema key

- **EXISTING** means the exact path is present in the current `data/site.js` or `data/products.js` schema.
- **FIELD TO ADD** means the path does **not** exist yet. Add and implement it before relying on it; the intended path is stated explicitly.
- **EXTERNAL RECORD** means operational evidence belongs outside this public frontend repository.
- Unknown existing values stay `null`, `[]` or `false`. The dependent UI stays hidden; missing inputs never become customer-facing development commentary.
- **YES** blocks `siteConfig.storeMode: 'live'` and live commerce. **FEATURE** blocks only that module, which must remain disabled and absent. **NO** is optional. **YES — owner/legal** requires the responsible owner and, where appropriate, qualified counsel.
- Every value marked **EXAMPLE ONLY** demonstrates format and must not be published as ZENO data.

The current live-commerce gates are exactly `siteConfig.features.commerceReady` and `siteConfig.features.checkoutReady`; checkout routing is `siteConfig.commerce.checkoutUrl`. There is no `siteConfig.checkoutEnabled` field. The local cart is independently controlled by `siteConfig.features.localCart` and is not proof that checkout is ready.

## PRODUCT

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `products[].id`, `.handle`, `.slug`, `.title`, `.name`, `.shortTitle`, `.subtitle`, `.categoryId` | `data/products.js` | URL, breadcrumbs, H1, cards and cart | **YES** | Stable identifiers and approved names; preserve current values unless the product owner changes them |
| **EXISTING** | `products[].status`, `.purchasable` | `data/products.js` | Catalog visibility and local add-to-cart eligibility | **YES** | Current product status is `active`; `purchasable` does not bypass price, inventory or checkout gates |
| **EXISTING** | `products[].description`, `.shortDescription`, `.heroCopy.eyebrow`, `.heroCopy.heading`, `.heroCopy.body` | `data/products.js` | Home/PDP product story | **YES** | Approved factual copy; no unsupported superiority, absorption or safety claims |
| **EXISTING** | `products[].color`, `.materialSummary`, `.benefits[]` (`title`, `body`, `icon`) | `data/products.js` | Key benefits and product cards | **YES** | Current verified facts are soft microfiber, vehicle drying, blue with black edging and ZENO branding |
| **EXISTING** | `products[].specifications[]` (`key`, `label`, `value`, `verified`) | `data/products.js` | Visible PDP specification grid | **YES** for core purchasing facts | Populate the existing `dimensions`, `gsm`, `blend`, `weave`, `edge`, `weight` and `origin` records only from approved evidence; set `verified: true` only with a non-null verified `value` |
| **EXISTING** | `products[].dimensions`, `.gsm`, `.blend`, `.weave`, `.edge`, `.weight`, `.origin` | `data/products.js` | Central technical values and future integrations | **YES** for dimensions/material facts; otherwise market-dependent | Keep each value synchronized with the same-key record in `products[].specifications[]`; the audit rejects populated technical fields without verified specification records |
| **EXISTING** | `products[].colors[]` (`id`, `name`, `value`) | `data/products.js` | Future color/variant presentation | **FEATURE** | `value` remains `null` until its intended representation is defined and verified |
| **FIELD TO ADD** | Intended `products[].claims[]` (`key`, `value`, `evidenceRef`, `approved`) | `data/products.js` plus private evidence register | Future safe-surface, coating, lint, absorption, coverage and durability claims | **FEATURE** | Do not add/render a claim until substantiation and approval exist; this field is not implemented today |
| **EXISTING** | `products[].sku`, `.barcode`, `.availability`, `.inventory` | `data/products.js` or commerce synchronization | Checkout payload and honest stock state | **YES** | Provider/merchant-issued values. The current schema leaves `availability` and `inventory` untyped; define their adapter contract before populating them |
| **EXISTING** | `products[].shippingClass` | `data/products.js` | Rate lookup and checkout payload | **YES** | Exact provider shipping-class key. **EXAMPLE ONLY:** `standard-product` |
| **EXISTING** | `products[].care.ready`, `.care.instructions[]` | `data/products.js` | PDP care module and FAQ | **YES** | Instructions must match the production care label/supplier guidance; set `ready: true` only when complete |
| **FIELD TO ADD** | Intended `products[].care.warnings[]` | `data/products.js` | Concise “do not” care guidance | **FEATURE** | Add only if verified warnings need a separate presentation; this array is not present today |
| **EXISTING** | `products[].usage.ready`, `.usage.steps[]` | `data/products.js` | “How to dry” module | **YES** | Product-owner-approved instructions; do not treat the Phase 2 example sequence as fact |
| **EXISTING** | `products[].faqs[]` (`question`, `answer`) | `data/products.js` | PDP/FAQ and FAQ schema | **FEATURE** | Only complete entries are stored/rendered; there is no per-FAQ `approved` field today |
| **EXISTING** | `products[].seo.title`, `.seo.description`, `.seo.image`; canonical source `products[].slug` | `data/products.js` | Search/social metadata and canonical URL | **YES** for title, description and slug; image **FEATURE** | Keep `.seo.image` null until authentic media exists; do not refer to nonexistent `.seo.ogImage` or `.seo.canonicalPath` fields |
| **FIELD TO ADD** | Intended `products[].structuredData` only if product-specific overrides become necessary | `data/products.js` | Product JSON-LD overrides | **FEATURE** | Current schema has no dedicated object; default schema must use verified visible existing fields and omit unavailable offers/identifiers |
| **EXISTING** | `products[].bundles[]`, `.relatedProductIds[]`, `.comparison.enabled`, `.comparison.columns[]`, `.comparison.rows[]` | `data/products.js` | Future bundles, cross-sells and factual comparison | **FEATURE** | Keep empty/disabled until real products and approved comparison evidence exist |

## PRICING

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.currency`, `products[].currency` | `data/site.js`, `data/products.js` | Price formatting, cart, checkout and offer schema | **YES** | Matching ISO 4217 code. **EXAMPLE ONLY:** `EUR` |
| **EXISTING** | `products[].price`, `products[].variants[].price` | `data/products.js` | PDP, card, cart, subtotal and checkout | **YES** | Approved decimal amount in the configured major currency unit. **EXAMPLE ONLY:** `19.00` |
| **EXISTING** | `products[].compareAt`, `products[].variants[].compareAt` | `data/products.js` | Restrained reference-price display | **FEATURE** | Keep `null` unless the comparison is genuine and lawful; never fabricate a crossed-out price |
| **EXISTING** | `products[].variants[].quantity`, `.perUnitPrice`, `.savings` | `data/products.js` | Pack value and per-unit display | **FEATURE** | Populate from approved prices using consistent rounding; no unsupported savings |
| **EXISTING** | `siteConfig.locale` | `data/site.js` | Number and currency formatting | **YES** | Current value is `en-US`; confirm it matches the intended storefront market/language |
| **FIELD TO ADD** | Intended `siteConfig.tax.market`, `.tax.taxInclusive`, `.tax.taxNote` | `data/site.js` | Tax suffix/note near price and checkout | **YES — owner/legal** | Market-accurate configuration and wording; no `siteConfig.pricing` object exists today |

## PACKS

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `products[].variants[]` (`id`, `title`, `quantity`, `enabled`) | `data/products.js` | PDP pack selector and cart label | **YES** for one orderable variant | Existing options are `single`, `two-pack` and `three-pack`; disabled records remain hidden |
| **EXISTING** | `products[].variants[]` (`price`, `compareAt`, `perUnitPrice`, `savings`, `badge`, `sku`) | `data/products.js` | Pack price/value and checkout mapping | **YES** for each enabled variant | Approved values only; product-level currency applies because variants currently have no currency field |
| **EXISTING** | `products[].variants[].barcode`, `.availability`, `.inventory`, `.shippingClass` | `data/products.js` or provider synchronization | Pack-specific checkout and fulfilment state | **YES** for each enabled provider-backed pack | Populate exact provider/merchant values; define the adapter’s availability/inventory contract before using the current null fields |
| **EXISTING** | `products[].variants[].badge` | `data/products.js` | Optional pack emphasis | **FEATURE** | Use only when price math supports a restrained, truthful label; there is no `recommended` field today |
| **EXISTING** | `products[].bundles[]` | `data/products.js` | Future care/product bundles | **FEATURE** | Keep empty until contents, product IDs, SKU, price, inventory and imagery are real |

## SHIPPING

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.shippingReady` | `data/site.js` | Gates PDP/cart summary and Shipping link/page | **YES** for commerce | Set true only when all active-market inputs and policy content are complete |
| **EXISTING** | `siteConfig.shipping.regions[]` | `data/site.js` | Current destination configuration boundary | **YES** | Populate with an implemented, documented record shape; the current empty array does not yet define child keys |
| **EXISTING** | `siteConfig.shipping.summary` | `data/site.js` | Concise PDP/cart reassurance | **YES** | Accurate customer-facing summary consistent with checkout and full policy |
| **FIELD TO ADD** | Intended `siteConfig.shipping.originCountry`, `.dispatchLocation` | `data/site.js` | Rate setup and fulfilment disclosure | **YES** | Actual fulfilment origin; do not assume registered office is the dispatch point |
| **FIELD TO ADD** | Intended `siteConfig.shipping.regions[].id`, `.countryCodes[]`, `.currency`, `.methods[]` | `data/site.js` | Destination/rate configuration | **YES** | ISO codes and provider-matched methods; child fields are not implemented today |
| **FIELD TO ADD** | Intended `siteConfig.shipping.regions[].methods[]` (`name`, `price`, `currency`, `minDays`, `maxDays`, `businessDays`) | `data/site.js` or provider | Shipping estimates and checkout choices | **YES** | Approved rates and achievable delivery ranges; distinguish handling from transit |
| **FIELD TO ADD** | Intended `siteConfig.shipping.handling.minDays`, `.maxDays`, `.cutoffTimezone` | `data/site.js` | Delivery estimate calculation | **YES** | Operational business-day range and IANA timezone |
| **FIELD TO ADD** | Intended `siteConfig.shipping.freeThreshold`, `.trackingAvailable`, `.carrierNames[]` | `data/site.js` | Optional offer, progress and tracking copy | **FEATURE** | Keep absent until market-specific facts are approved |
| **FIELD TO ADD** | Intended `siteConfig.shipping.exclusions[]`, `.dutiesAndTaxesCopy` | `data/site.js` | Full shipping policy | **YES — owner/legal** for relevant cross-border sales | Accurate exclusions and importer/duties responsibility |
| **FIELD TO ADD** | Intended `data/pages.js → pages[id='shipping'].body`, `.effectiveDate` | `data/pages.js` | `/shipping-delivery/` | **YES** | Current route is an unavailable page with no policy body fields; add only final approved content |

## RETURNS

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.returnsReady` | `data/site.js` | Gates PDP/cart summary and Returns link/page | **YES** for commerce | Set true only after the full operational policy is approved |
| **EXISTING** | `siteConfig.returns.windowDays`, `.summary` | `data/site.js` | Near-purchase summary | **YES — owner/legal** | Approved return window and concise accurate wording |
| **FIELD TO ADD** | Intended `siteConfig.returns.eligibleCondition`, `.openedProductRule`, `.exclusions[]` | `data/site.js` | Returns details | **YES — owner/legal** | Rules consistent with applicable consumer rights |
| **FIELD TO ADD** | Intended `siteConfig.returns.initiationMethod`, `.contact`, `.returnAddressProcess` | `data/site.js` | Return instructions | **YES** | Working email/form/portal and approved process |
| **FIELD TO ADD** | Intended `siteConfig.returns.returnShippingResponsibility`, `.originalShippingRefundRule` | `data/site.js` | Cost/refund expectation | **YES — owner/legal** | Market-accurate responsibility and exceptions |
| **FIELD TO ADD** | Intended `siteConfig.returns.refundProcessingDays`, `.refundMethod` | `data/site.js` | Refund expectation | **YES** | Achievable timing and original-payment behavior |
| **FIELD TO ADD** | Intended `data/pages.js → pages[id='returns'].body`, `.effectiveDate` | `data/pages.js` | `/returns/` | **YES** | Current route is unavailable and contains no policy body fields |

## BUSINESS IDENTITY

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.legalEntity` | `data/site.js` | Footer, policies, invoices and checkout | **YES — owner/legal** | Exact registered seller; do not infer it from `siteConfig.name` |
| **EXISTING** | `siteConfig.registeredAddress` | `data/site.js` | Required business/policy/invoice disclosure | **YES — owner/legal** | Approved public address. The current null field has no defined object shape; define and render the shape before populating it |
| **EXISTING** | `siteConfig.registrationNumber`, `.taxNumber` | `data/site.js` | Company/tax disclosure | **YES** where assigned/required | Exact issued values; the field is `taxNumber`, not `vatNumber` |
| **EXISTING** | `siteConfig.name`, `.shortName` | `data/site.js` | Public brand identity | **YES** | Current brand values; these are not substitutes for legal identity |
| **FIELD TO ADD** | Intended `siteConfig.legalForm`, `.tradingName`, `.jurisdiction`, `.operatingCountry` | `data/site.js` | Legal/commerce disclosures where required | **YES — owner/legal** where applicable | Exact registered/operational facts; these fields do not exist today |
| **EXTERNAL RECORD** | Business-owner and legal approval record | Private release record, not `data/site.js` | Internal live-mode evidence | **YES** | Named accountable approver, date and policy versions; do not expose private review notes |

## CONTACT

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.supportEmail` | `data/site.js` | Order help and Contact page | **YES** | Monitored domain mailbox. **EXAMPLE ONLY:** `support@example.com` |
| **EXISTING** | `siteConfig.privacyEmail` | `data/site.js` | Privacy requests/policy | **YES — owner/legal** | Monitored mailbox with an owned response process |
| **EXISTING** | `siteConfig.phone` | `data/site.js` | Contact/legal disclosure | **YES** where required; otherwise **NO** | Approved international-format number |
| **EXISTING** | `siteConfig.features.contactReady` | `data/site.js` | Gates Contact link/page | **FEATURE** | Keep false until a real contact method and complete page exist |
| **FIELD TO ADD** | Intended `siteConfig.contact.supportHours`, `.timezone`, `.responseTimeCopy` | `data/site.js` | Contact expectation | **FEATURE** | Achievable facts only |
| **FIELD TO ADD** | Intended `siteConfig.contact.form.provider`, `.endpoint`, `.consentCopy` | `data/site.js` plus environment configuration | Contact form | **FEATURE — owner/legal** | Working processor, error/success states and consent; never commit secrets |

## PAYMENTS

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.commerce.provider`, `.checkoutUrl` | `data/site.js` | Commerce adapter selection and hosted checkout handoff | **YES** | Approved provider and allowlisted HTTPS checkout URL; no custom card collection |
| **EXISTING** | `siteConfig.features.commerceReady`, `.checkoutReady` | `data/site.js` | Gates checkout | **YES** | Both true only after pricing, inventory, tax, shipping, returns, legal and live provider tests pass |
| **EXISTING** | `siteConfig.features.localCart` | `data/site.js` | Enables safe browser-local cart interactions | **NO** for provider readiness | Current `true` value does not represent a completed order or live payment capability |
| **FIELD TO ADD** | Intended `siteConfig.commerce.environment`, `.storeId` | `data/site.js` / environment configuration | Provider environment/routing | **YES** when required by provider | Public identifiers only; secrets remain server-side/outside the repo |
| **FIELD TO ADD** | Intended `siteConfig.commerce.displayMethods[]` | `data/site.js` or provider response | Optional payment-method area | **FEATURE** | Show only methods truly available in the customer’s market; no decorative badges |
| **EXTERNAL RECORD** | Success, cancel, failure, duplicate, webhook, refund and chargeback tests | Provider/server runbook, not `data/site.js` | Order lifecycle readiness | **YES** | Provider-confirmed end-to-end evidence; frontend never handles raw card details |

## REVIEWS

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.reviewsReady` | `data/site.js` | Gates review UI | **FEATURE** | Keep false until real provider-backed data loads |
| **EXISTING** | `products[].reviews.enabled`, `.provider`, `.rating`, `.count`, `.items[]` | `data/products.js` | Product review integration/data boundary | **FEATURE** | Real data only; never seed or invent reviews. Both site feature and product review state must be ready |
| **FIELD TO ADD** | Intended `products[].reviews.externalProductId` | `data/products.js` | Provider product mapping | **FEATURE** | Exact provider-issued ID; not present today |
| **FIELD TO ADD** | Intended `products[].reviews.publicConfig` only if the provider requires product-level public options | `data/products.js` | Reviews adapter configuration | **FEATURE** | Public values only; no secrets |
| **EXTERNAL RECORD** | Verification, moderation, incentives and disclosure policy | Provider/private runbook | “Verified buyer” and incentive labels | **FEATURE — owner/legal** | Labels must reflect actual provider rules |

## NEWSLETTER

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.newsletterReady` | `data/site.js` | Gates newsletter UI | **FEATURE** | Current adapter has no provider configuration; keep false until integration is complete |
| **FIELD TO ADD** | Intended `siteConfig.newsletter.provider`, `.formId`, `.endpoint` | `data/site.js` / environment configuration | Subscription adapter | **FEATURE** | Approved public identifiers/endpoint; no secret key in browser code |
| **FIELD TO ADD** | Intended `siteConfig.newsletter.consentCopy`, `.privacyPath` | `data/site.js` | Form disclosure | **FEATURE — owner/legal** | Plain-language purpose and valid privacy link; no preselected consent |
| **FIELD TO ADD** | Intended `siteConfig.newsletter.doubleOptIn`, `.markets[]` | `data/site.js` / provider | Confirmation behavior | **FEATURE — owner/legal** | Market-appropriate settings and tested confirmation email |
| **EXTERNAL RECORD** | Audience/list ownership, suppression and unsubscribe test | Provider/private runbook | Subscription lifecycle | **FEATURE** | Test subscribe, duplicate, invalid, confirmation and unsubscribe paths |

## LEGAL

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.legalReady` | `data/site.js` | Gates legal links/pages and live-commerce readiness | **YES** | Keep false until final policies are implemented and approved |
| **EXISTING** | `data/pages.js → pages[id='privacy']`, `pages[id='terms']`, `pages[id='cookies']` | `data/pages.js` | Current legal routes | **YES** | These records are currently `type: 'unavailable'`, `public: false`, `noindex: true`; they contain no policy body/version fields |
| **FIELD TO ADD** | Intended `data/pages.js → pages[id='privacy'].body`, `.version`, `.effectiveDate` | `data/pages.js` | `/privacy/` | **YES — owner/legal** | Final jurisdiction-appropriate content based on actual operations/providers |
| **FIELD TO ADD** | Intended `data/pages.js → pages[id='terms'].body`, `.version`, `.effectiveDate` | `data/pages.js` | `/terms/` and checkout | **YES — owner/legal** | Final selling terms aligned to product, fulfilment and returns |
| **FIELD TO ADD** | Intended `data/pages.js → pages[id='cookies'].body`, `.version`, `.effectiveDate` | `data/pages.js` | `/cookies/` and consent UI | **YES — owner/legal** where storage/tracking applies | Exact technologies, purposes, durations and third parties |
| **FIELD TO ADD** | Intended `siteConfig.consent.categories[]`, `.defaultState`, `.provider` | `data/site.js` | Cookie/analytics consent | **YES — owner/legal** before nonessential tracking | Must match implemented scripts and block optional tags until valid consent |
| **FIELD TO ADD** | Intended `siteConfig.legal.dataController`, `.retention`, `.recipientCategories`, `.transferBasis` | `data/site.js` | Privacy content source | **YES — owner/legal** | Operational facts, not boilerplate; there is no `siteConfig.legal` object today |
| **EXTERNAL RECORD** | Policy approval (`approvedBy`, `approvedAt`, versions) | Private release record, not current config | Internal live-mode evidence | **YES** | Named approver/date/version; no nonexistent approval flags are implied in current schema |

## SOCIAL

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.socialReady` | `data/site.js` | Gates social UI | **FEATURE** | True only when an owned active profile exists |
| **EXISTING** | `siteConfig.socialLinks[]` | `data/site.js` | Future footer links and Organization `sameAs` | **FEATURE** | Define link record shape in the renderer before population; use only canonical owned HTTPS URLs |
| **EXISTING** | `siteConfig.brandAssets.socialImage` | `data/site.js` | Active Open Graph image | **FEATURE** | Keep null until the authentic asset exists |
| **EXISTING** | `siteConfig.brandAssets.socialImageFuturePath` | `data/site.js` | Documents intended OG path | **FEATURE** | Exact current value: `/assets/images/social/zeno-og.webp`; this future path is not proof the file exists |
| **EXTERNAL RECORD** | Account ownership/recovery/publishing owner | Private social runbook | Operational readiness | **NO** | Business-controlled account access and recovery |

## ANALYTICS

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.analyticsReady` | `data/site.js` | Gates analytics loading | **FEATURE** | Keep false until provider, consent and environment filters are implemented |
| **FIELD TO ADD** | Intended `siteConfig.analytics.provider`, `.publicMeasurementId` | `data/site.js` / environment configuration | Analytics adapter | **FEATURE** | Approved public ID only; no secrets |
| **FIELD TO ADD** | Intended `siteConfig.analytics.consentCategory`, `.respectDnt`, `.anonymization` | `data/site.js` | Privacy-preserving load behavior | **FEATURE — owner/legal** | Must match consent implementation/provider capabilities |
| **FIELD TO ADD** | Intended `siteConfig.analytics.events` (`view_item`, `select_item`, `add_to_cart`, `view_cart`, `begin_checkout`, `purchase`) | `data/site.js` / adapter | CRO measurement | **FEATURE** | No direct personal data; `purchase` only after provider-confirmed order success |
| **EXTERNAL RECORD** | Internal-traffic filters, retention and access | Provider/private runbook | Data governance | **FEATURE — owner/legal** | Document filters, retention and authorized users |

## PRODUCT PHOTOGRAPHY

See `docs/PRODUCT-PHOTOGRAPHY-BRIEF.md` for the shot-level contract.

| Schema status | Exact field | Configure in | Customer appearance / use | Launch-blocking? | Required input / example |
|---|---|---|---|---|---|
| **EXISTING** | `siteConfig.features.productPhotographyReady` | `data/site.js` | Photography readiness gate | **YES** for premium commerce launch | True only after core assets, rights, color and crops pass approval |
| **EXISTING** | `products[].media[]` (`id`, `type`, `status`, `src`, `sources`, `zoomSrc`, `focalPoint`, `futureSources`, `width`, `height`, `aspectRatio`, `alt`, `caption`, `placeholderVariant`) | `data/products.js` | PDP gallery, thumbnails, zoom and product visuals | **YES** for core media | `src` renders the fallback; `sources` supplies responsive picture candidates; set `status: 'published'` only after referenced files pass visual checks. `futureSources` documents delivery paths but is not rendered automatically |
| **EXISTING** | Hero `futureSources.avif`, `.webp`, `.zoom` | `products[].media[id='hero']` | Hero/PDP asset handoff | **YES** | Exact filenames: `zeno-drying-towel-hero.avif`, `zeno-drying-towel-hero.webp`, `zeno-drying-towel-hero-zoom.webp` under `/assets/images/products/drying-towel/` |
| **EXISTING** | `futureSources.webp` for media IDs `front`, `folded`, `texture`, `edge`, `branding` | Corresponding `products[].media[]` entries | Core PDP/product-story views | **YES** | Exact filenames are `zeno-drying-towel-<id>.webp` under `/assets/images/products/drying-towel/` |
| **EXISTING** | `products[].media[].width`, `.height`, `.aspectRatio`, `.alt`, `.caption` | `data/products.js` | Layout stability and accessibility | **YES** | Current manifest specifies 1800 × 1800 and `1 / 1`; revise these exact values if approved delivered dimensions differ |
| **EXISTING** | `products[].media[].sources.avif[]`, `.sources.webp[]`, `.zoomSrc`, `.focalPoint.x`, `.focalPoint.y` | `data/products.js` | Responsive `<picture>`, zoom and crop intent | **FEATURE** | Populate source arrays with real `{ src, width }` records, zoom only with an existing file, and normalized focal coordinates. Arrays currently exist but are empty |
| **FIELD TO ADD** | Intended `products[].media[].srcset` only if a direct `<img srcset>` string remains useful in addition to `sources` | `data/products.js` | Optional direct image `srcset` | **FEATURE** | This key is still absent; prefer the existing typed `sources` arrays unless a fallback `srcset` is required |
| **FIELD TO ADD** | Intended new `products[].media[]` records with IDs `lifestyle`, `scale`, `packaging`, `usage-01`…`usage-05` | `data/products.js` | Context/scale/packaging/usage story | **FEATURE** (campaign-quality launch: owner decision) | Use the prefixed future filenames in the photography brief; these media records do not exist today |
| **EXISTING** | `products[].video.id`, `.enabled`, `.type`, `.src`, `.mimeType`, `.poster`, `.captions`, `.width`, `.height`, `.alt`, `.caption` | `data/products.js` | Future gallery video, thumbnail labels and accessible player | **FEATURE** | Keep `.enabled: false` and file fields null until approved assets exist. Preserve `.type: 'video'`; set `.mimeType` for the actual source. Current dimensions are 1920 × 1080 |
| **FIELD TO ADD** | Intended `products[].video.sources[]`, `.transcript` only if multiple encodings and a separately linked transcript are required | `data/products.js` | Multi-source video/transcript | **FEATURE** | These two keys remain absent; the current object supports one `src` and one captions track |
| **EXISTING** | `products[].seo.image`, `siteConfig.brandAssets.socialImage`, `.socialImageFuturePath` | `data/products.js`, `data/site.js` | Product/site social metadata | **FEATURE** | Activate only authentic approved assets; intended site OG path is `/assets/images/social/zeno-og.webp` |
| **EXTERNAL RECORD** | Usage rights, model/property releases, territory and duration | Private asset-rights register | Publication permission | **YES — owner/legal** | Written commercial web/social/advertising rights for every published asset |

## Final live-mode gate

Before setting `siteConfig.storeMode` to `live` and enabling both commerce gates:

1. Complete every **YES** row and retain source evidence/approval.
2. Complete every enabled feature’s **FEATURE** rows; otherwise keep its existing `siteConfig.features.*Ready` value false and omit the module from navigation, sitemap, schema and customer copy.
3. Implement every relied-upon **FIELD TO ADD** path before populating it; do not treat this document as runtime support.
4. Remove all examples, draft policy text, internal TODOs, fake reviews/scarcity and unsupported claims from rendered HTML and structured data.
5. Verify price, tax, inventory, shipping, returns and order status across PDP, cart, provider checkout and transactional email.
6. Exercise successful, failed, cancelled, interrupted and duplicate checkout paths; never collect raw card data in this frontend.
7. Publish only authentic rights-cleared media; set each real file as `products[].media[].src` and keep intrinsic dimensions accurate.
8. Obtain business-owner and appropriate legal/privacy approval for identity, contact, policies, consent behavior and selling markets.
