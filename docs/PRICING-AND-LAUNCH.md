# Pricing and ordering handoff

The owner requested a price target 25% below an equivalent Flash Detail product, giving 120 RON → 90 RON as an example. The redesign currently shows these **proposed regional launch prices** for the single towel:

| Storefront | Price |
| --- | --- |
| English, default `/` | €18.00 |
| Romanian, `/ro/` | 90.00 RON |

These are independently configured regional prices in `data/products.js`, not a live currency conversion. The €18 proposal uses a simple approximate 5 RON/EUR positioning assumption; it is not an exchange-rate quotation. The owner’s example did not verify the competitor’s current listing, specification or delivered price.

Reading `https://flashdetail.ro/` was blocked by the cloud network policy (proxy CONNECT 403). Required domain entries `flashdetail.ro` and `www.flashdetail.ro` were saved to the environment draft. The competitor’s live design and prices have **not** been inspected. After access is applied, compare the matching towel’s dimensions, material, quantity, taxes and delivered cost. Recalculate the target as `comparable current price × 0.75` and check it against landed cost, payment fees, shipping contribution and the required margin. Do not present a competitor’s price as ZENO’s former price: `compareAt` remains null and no discount percentage or competitor claim is published.

## What works now

The product can be added to a browser-local bag. Quantity changes, subtotals, removal and persistence work in both languages. Switching languages preserves product IDs and quantities and displays the corresponding regional price.

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
