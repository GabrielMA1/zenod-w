# Pricing and ordering handoff

The owner requested a price target 25% below an equivalent Flash Detail product, giving 120 RON → 90 RON as an example. The redesign currently shows these **proposed regional launch prices** for the single towel:

| Storefront | Price |
| --- | --- |
| English, default `/` | €18.00 |
| Romanian, `/ro/` | 90.00 RON |

These are independently configured regional prices in `data/products.js`, not a live currency conversion. The €18 proposal uses a simple approximate 5 RON/EUR positioning assumption; it is not an exchange-rate quotation. The owner’s example did not verify the competitor’s current listing, specification or delivered price.

Reading `https://flashdetail.ro/` was blocked by the cloud network policy (proxy CONNECT 403). Required domain entries `flashdetail.ro` and `www.flashdetail.ro` were saved to the environment draft. The competitor’s live design and prices have **not** been inspected. After access is applied, compare the matching towel’s dimensions, material, quantity, taxes and delivered cost. Recalculate the target as `comparable current price × 0.75` and check it against landed cost, payment fees, shipping contribution and the required margin. Do not present a competitor’s price as ZENO’s former price: `compareAt` remains null and no discount percentage or competitor claim is published.

## What works now

The product can be added to a browser-local bag. Quantity changes, subtotals, removal and persistence work in both languages. Switching languages preserves product IDs, quantities and the selected market. Language no longer determines price: the independent market selector controls EUR versus RON. A Romanian-speaking customer in another European destination can use Romanian with EUR; a German-speaking customer in Romania can use German with RON. In a real checkout, derive prices and shipping from the validated delivery country, not a client-supplied market or price.

## Approved delivery and payment choices

The owner selected **Stripe**, delivery across **Europe**, **free shipping in Romania**, and shipping elsewhere in Europe priced by address. Warehouse and office locations are pending. These approved delivery terms are published in English and Romanian. `shippingInfoReady` controls this information; `shippingReady` stays false until actual rates and fulfilment are configured. No other European rate or delivery timeframe has been invented.

## What is needed to take real orders

The current repository has no order-processing backend or connected payment provider. Checkout remains disabled and the site clearly says ordering is not open yet. To activate sales:

1. Connect the owner’s Stripe account to a hosted server-side checkout service. GitHub Pages serves static files and cannot hold Stripe secret keys or run order-processing/webhook code. The service must validate product IDs, quantities, regional prices and delivery quotes before creating a Stripe Checkout Session, and verify Stripe webhook signatures before treating an order as paid. The existing adapter is not an implemented Stripe service; setting a URL alone will not transfer the bag or create an order. Keep credentials in the hosting platform’s secret settings, never in this repository or browser JavaScript.
2. Confirm final prices and VAT treatment, stock/SKU, the precise supported European destinations, address-based shipping rates outside Romania, dispatch details and delivery estimates. Romania shipping is already approved at zero.
3. Provide approved seller identity, support contact, returns and legal content, then implement and enable the corresponding pages.
4. Verify the actual product attributes and photos; keep unsupported performance claims and reviews unpublished.
5. Test order success, cancellation, failure and confirmation against the chosen provider before enabling `commerceReady` and `checkoutReady`.

No payment or order data is collected by the current store. The public site is deployed through the repository’s existing GitHub Pages workflow. Publication of the storefront does not activate payment or order collection.

## European price increase requested

The owner requested keeping Romania at 90 RON and increasing the other-European-market EUR price to slightly below comparable premium towels. The suggested target is 5–10% below a verified like-for-like delivered retail price, subject to costs and margin. No higher EUR figure has been published without source data; the existing €18 remains until the comparison is completed.

The owner requested using Flash Detail at flashdetail.ro / flashdetail.com as a specification reference. The latest attempt to read flashdetail.ro returned proxy CONNECT 403. Both domains, their www variants, search providers and comparison sites are saved in the cloud settings draft; the restarted executor still reports an enforced policy with no custom domains. Review, save and publish the pending environment configuration to enable research.

Record the exact listing URL, observation date, regular/current price, tax treatment, dimensions, GSM, weave, blend and delivered cost before selecting a comparator. Candidate ranges for research include Gyeon SilkDryer EVO, CARPRO DHydrate and The Rag Company drying towels; none is claimed to be the best or a verified match yet. Specifications published by another seller describe that seller’s product. Confirm matching ZENO supply before presenting them as verified ZENO attributes.

The owner subsequently reported that flashdetail.com is under maintenance for Black Friday and deferred the Flash Detail specification lookup. Dimensions, blend and weave remain pending. The owner subsequently selected 850 GSM as the product specification; it is recorded as owner-provided, not independently laboratory-verified. European price research can use other accessible retailers independently.

## Owner-provided GSM specification

The current specification is **850 GSM**, supplied by the owner. It is published in every language, including the product subtitle, description, verified-specification table and Product/FAQ structured data. This source records owner approval rather than an independent test. GSM describes fabric mass per area; no absorption-capacity, scratch-safety or durability result is inferred from it. Confirm the supplied inventory matches 850 GSM before activating sales.
