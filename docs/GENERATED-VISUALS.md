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

Original PNGs remain outside the repository under `/workspace/generated_images/`. Earlier drafts are retained there for provenance but are not shipped by the storefront.
