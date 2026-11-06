# ZENO DETAIL visual assets

The current set contains four original images recreated with ChatGPT Images for a natural, restrained commercial photography treatment. They use diffuse daylight, neutral workshop and tabletop backgrounds, plausible fabric folds, consistent branding and modest optical depth of field. The previous blue-lit car and product images have been replaced.

These are generated visualisations, not photographs documenting physical inventory. Product surfaces retain a small “Product visualisation” label, and the gallery explains that final product details may vary. Generated images do not establish physical specifications or tested performance.

| Asset | Purpose | Original generated file |
| --- | --- | --- |
| `workshop-car` | Graphite estate car in a daylight workshop; homepage and journal | `exec-821bcffa-00bb-48e8-8f5c-2879c3682ad3.png` |
| `drying-towel` | The blue towel on a neutral tabletop | `exec-5c91ce80-2419-4db7-a93c-4429fec1afe9.png` |
| `towel-detail` | Fibres, binding and the woven ZENO DETAIL label | `exec-5b0bfdfd-4428-45fd-84d5-ab3517680573.png` |
| `drying-moment` | The same towel on freshly washed graphite paint | `exec-91b84214-88e8-4910-9c02-24f6094433a4.png` |

The towel images reference `assets/images/brand/zeno-logo-white-transparent-bg.png` for the actual angular Z symbol and complete ZENO DETAIL lockup. The tabletop image provides the colour, fabric and label reference for the macro and car-context images.

Optimized exports live in `assets/images/editorial/`, in both AVIF and WebP. Square product images use 480, 768 and 1024-pixel widths; landscape images use 480, 960 and 1536-pixel widths. Every responsive `<source>` declares its actual display `sizes`, including gallery thumbnails. Critical images load eagerly with high priority; secondary images load lazily. The three-image product gallery supports keyboard navigation, swipe and zoom.

## Since the redesign (November 2026)

- These four files are now the **library** in `data/image-manifest.json`. Each website position is a **slot** that names one of them as its temporary fallback until a final asset is approved; the manifest crops each fallback to the slot's ratio around a focal point. The production plan for replacing them is `docs/IMAGE-PRODUCTION-QUEUE.md`.
- The label lettering in these generated images approximates the real logo but is not geometrically exact (the Z blades are heavier). Final assets must match `assets/images/brand/zeno-logo-web-white.svg`, or have the vector composited onto a blank label.
- `assets/images/brand/zeno-wordmark-{white,black}.svg` contain the ZENO DETAIL letterform paths copied unaltered from `zeno-logo-web-*.svg` with a tighter `viewBox`, for the header's symbol + wordmark arrangement. The horizontal arrangement is a layout choice and should be confirmed by the owner.
- **6 November 2026:** the owner supplied three ChatGPT Images visualisations generated from the prompts in `docs/IMAGE-PRODUCTION-QUEUE.md`. They now fill `home-hero`, `product-folded` and `product-edge-label` (`assets/images/campaign/`, `assets/images/products/drying-towel/`; originals in `media-source/`). The hero's label lettering was replaced with the authentic logo by perspective compositing because the generator malformed "DETAIL". They are still visualisations and remain captioned as such.
- `assets/images/social/zeno-og-1200.{jpg,webp,avif}` is the Open Graph image for every page: the approved folded-towel visualisation beside the authentic white logo PNG on ink. It replaced the interim card; the layout (logo left, towel right) follows the owner's version.
- Also on 6 November: `product-texture`, `guide-drying`, `guide-microfiber-care` and `guide-choosing` were supplied and approved. A flat-on-roof image was rejected because its pile and binding did not match the approved towel and it showed the full outline.

Original PNGs remain outside the repository under `/workspace/generated_images/`. Earlier drafts are retained there for provenance but are not shipped by the storefront.
