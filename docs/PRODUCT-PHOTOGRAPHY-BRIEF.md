# ZENO Drying Towel — product photography brief

> **Production handoff.** This brief may be given directly to a photographer, retoucher or renderer. It defines the required evidence and crops; it does not authorize new product claims. Shoot the approved production towel, not a pre-production substitute, unless the business owner signs off on the difference in writing.

## Truth baseline and stop conditions

The only product facts currently cleared for visual planning are:

- Product: **ZENO Drying Towel**
- Intended role: vehicle drying
- Material description: soft microfiber construction
- Appearance: blue towel with black edging and authentic ZENO branding

Size, GSM, blend, weave, weight, sidedness, edge method, absorption, vehicle coverage, lint behavior, paint safety, ceramic-coating compatibility, durability, care and packaging specifications are **not established by this brief**. Do not imply them through captions, graphics, demonstrations or retouching.

Before production, the ZENO owner must supply or approve:

1. A representative production unit and sample/reference ID.
2. The correct color target under neutral light.
3. The original approved logo files; logo path geometry must not be altered.
4. A shot-day usage method before any in-use sequence is captured.
5. Final packaging before the packaging slot is captured.
6. Any performance test protocol before a water-demonstration slot is commissioned.

If any supplied sample conflicts with approved product data, stop and request written direction. Do not solve the discrepancy in retouching.

## Visual direction

Aim for restrained European automotive presentation: precise, dark graphite/neutral surfaces, controlled cyan-blue accents created by the real product, clean highlights and credible material texture. The result should feel like premium product engineering, not neon cyberpunk, gaming artwork, fake luxury or a generic marketplace listing.

- Preserve the real towel’s silhouette, thickness, pile, edge, seams, color variation and logo placement.
- Use a neutral or graphite vehicle with clean, representative paint. Avoid prominent manufacturer badges and distinctive competitor accessories.
- Keep the blue accurate; do not shift it toward electric cyan simply to match the interface accent.
- Retouch dust, temporary handling marks and set reflections conservatively. Do not add fiber density, loft, water capacity, gloss, beading or a flawless paint result that was not captured.
- Do not bake headlines, prices, ratings, dimension lines or promotional badges into product photographs. UI copy remains HTML.
- Use actual ZENO branding on the physical item. Never paste a cleaner or larger logo over the fabric.

## Capture and delivery standard

### Masters

- Photograph RAW at **24 MP minimum**; 40 MP or higher is preferred for front and macro work. Deliver 16-bit TIFF/PSD masters with non-destructive layers and an embedded working profile.
- For each lighting setup, capture a calibrated gray card and color target before the product moves. Lock white balance and exposure for each sequence.
- Maintain usable focus across the intended crop. Focus stacking is allowed for macros if the result remains physically honest.
- Photograph enough perimeter for every specified desktop and mobile crop. A crop is not approved if it cuts the logo, edge evidence or the action being explained.
- Archive masters outside the public website repository using `ZENO-DT_<SLOT>_MASTER_v01.tif`. Do not place RAW, layered masters, releases or color charts in `assets/`.

### Website derivatives

Product output root: `assets/images/products/drying-towel/`

The current `data/products.js` manifest expects these exact core filenames:

- `zeno-drying-towel-hero.avif`
- `zeno-drying-towel-hero.webp`
- `zeno-drying-towel-hero-zoom.webp`
- `zeno-drying-towel-front.webp`
- `zeno-drying-towel-folded.webp`
- `zeno-drying-towel-texture.webp`
- `zeno-drying-towel-edge.webp`
- `zeno-drying-towel-branding.webp`

The six current media records declare `width: 1800`, `height: 1800` and `aspectRatio: '1 / 1'`; therefore deliver the canonical gallery crops at exactly **1800 × 1800** unless the manifest is deliberately updated with the true approved output dimensions. The capture master can remain larger and differently oriented for future art direction.

`products[].media[].src` is the rendered fallback source. Once a canonical file exists, set that record’s `src` to its WebP path. Populate the existing `sources.avif[]` and `sources.webp[]` arrays with real `{ src, width }` records, set the existing `zoomSrc` where supplied, adjust the existing normalized `focalPoint`, and set the existing `status` to `published` only after every referenced file has passed visual review. `futureSources` documents intended delivery paths but is not rendered automatically.

Responsive `products[].media[].sources.avif[]` / `.sources.webp[]` and `zoomSrc` fields are present in every current media record. A direct `products[].media[].srcset` key is still absent; treat it as a **field to add** only if an `<img srcset>` fallback is needed in addition to the existing typed source arrays.

Derivatives must be sRGB, orientation-normalized and stripped of private/location metadata. Tune compression by inspection at 100% for pile smearing, edge halos, banding and AVIF/WebP color shifts.

A future homepage-specific art-directed crop may be generated from the approved hero master, but it requires a **field/media record to add** before it can be selected independently; the current manifest has one shared `hero` media record. Do not use CSS to stretch or distort a product image. The renderer currently prioritizes the first PDP/home image and lazy-loads later media.

## Required shot register

Every “Do not imply” instruction applies to the photograph, retouch, caption, alt text and surrounding campaign copy.

| Web filename / master | Purpose | Orientation and minimum source | Desktop crop and use | Mobile crop and use | Background and lighting | Logo and negative space | People / car / hands | Product evidence that must remain visible | Do not imply |
|---|---|---|---|---|---|---|---|---|---|
| `zeno-drying-towel-hero.webp` + `.avif` + `-zoom.webp` / `ZENO-DT_HERO_MASTER_v01.tif` | Flagship campaign image; establish product desire and recognizable brand | Landscape 3:2, at least 6000 × 4000 px, composed for a strong square crop; capture a vertical companion if useful | Current PDP/home output is 1800 × 1800 (1:1); preserve a wider master with **35–45% copy-safe space** for a future separately configured campaign crop | Current gallery output remains 1:1; towel and authentic mark must read clearly at phone width with **10–15% breathing room** | Dark neutral/graphite seamless or controlled automotive bay; large soft side key, restrained rear rim and flags for black-edge separation; no saturated blue wash | Authentic physical mark clearly readable in at least one approved crop; do not overlay it; copy-safe side must stay low-detail | No person/hands. A non-branded vehicle form may sit deep in background only if it does not compete | Real blue, black edge, surface texture and true product volume | Any absorption/coverage/speed/safety claim; exaggerated thickness; imaginary packaging; “professional tested” atmosphere without evidence |
| `zeno-drying-towel-front.webp` / `ZENO-DT_FRONT_MASTER_v01.tif` | Show the complete item, silhouette, edging and logo placement | True overhead, square-safe composition; ≥6000 px long edge and ≥4800 × 4800 usable crop | 1800 × 1800 (1:1), full towel with 8–12% clear perimeter | Same 1:1 output; no edge or logo clipped and product remains large enough to inspect | Neutral light-gray or charcoal seamless chosen for accurate edge separation; broad cross-light, even exposure, minimal perspective | Authentic logo and full perimeter visible; even negative margin on all sides | None | Entire outline, all visible edges, real proportions, color and logo placement | Unverified dimensions, aspect ratio, sidedness or edge construction labels; no measurement graphic until verified |
| `zeno-drying-towel-folded.webp` / `ZENO-DT_FOLDED_MASTER_v01.tif` | Premium merchandising view; communicate the real hand/volume of the item | Landscape 5:4 master composed for square crop; ≥6000 px long edge | 1800 × 1800 (1:1) gallery and homepage product story | Same 1:1 output, centered on fold stack and mark; keep edge detail clear | Matte graphite plinth/seamless; soft key 30–45° above/side, controlled negative fill, subtle grounded shadow | Show authentic logo only if its natural placement permits; reserve 20–30% low-detail space in the master | None | Natural folds, real pile response, black edge, true thickness | Artificial padding/loft, extra layers, a towel count not actually present, or “more substantial” performance language |
| `zeno-drying-towel-texture.webp` / `ZENO-DT_TEXTURE_MASTER_v01.tif` | Macro evidence of the real microfiber surface | Macro square-safe composition; ≥5000 px long edge after focus stack/crop | 1800 × 1800 (1:1) feature/gallery image | Same 1:1 output with a clear in-focus region away from controls | Neutral surround; grazing soft light 20–35° across pile, polarize only enough to control glare; retain natural micro-shadow | Logo not required; leave one quiet corner only if copy is placed beside—not on—the image | None | Representative fibers/pile over a meaningful area, scale-free and honestly sharpened | GSM, blend, weave name, softness, lint-free behavior, absorption or paint-safety conclusion from appearance alone |
| `zeno-drying-towel-edge.webp` / `ZENO-DT_EDGE_MASTER_v01.tif` | Construction close-up and black-edge confidence | Macro landscape 4:3 master with square-safe crop; ≥5000 px long edge | 1800 × 1800 (1:1) detail/gallery image | Same 1:1 output with edge entering diagonally and a clear focus point | Neutral charcoal; raking side key and restrained fill to separate blue pile from black edge | Logo not required; 20% clear field opposite the edge detail | None | Actual edge, joins/corners if present, adjacent surface and honest stitching/finish | “Scratch-safe,” edgeless, laser-cut or named stitch/construction unless technically verified; do not repair genuine production geometry into a different method |
| `zeno-drying-towel-branding.webp` / `ZENO-DT_BRANDING_MASTER_v01.tif` | Prove the authentic ZENO mark on the product | Square-safe macro; ≥5000 px long edge | 1800 × 1800 (1:1) gallery and brand-detail feature | Same 1:1 output with the full mark and surrounding fabric intact | Soft oblique key with neutral fill; avoid glare or crushed blacks | Entire physical mark readable and geometrically unchanged; 10–15% breathing room around it | None | Actual application method, placement, color and nearby fabric | Embroidery/printing method, durability, certification, authenticity seal or warranty unless verified; never replace with a vector overlay |
| **FIELD TO ADD:** `zeno-drying-towel-lifestyle.webp` / `ZENO-DT_LIFESTYLE_MASTER_v01.tif` | Place the product credibly in a careful vehicle-drying context | Landscape 3:2 at ≥6000 × 4000; capture a vertical 4:5 companion or a crop-safe wider frame | 16:9/3:2 full-width story or, if added to the current gallery, a separately approved 1:1 export | 4:5 campaign crop or 1:1 gallery export according to the media record added; action and towel stay central | Controlled studio/daylight automotive bay; neutral dark/graphite car; broad soft source reflected naturally in paint, no dramatic colored fog | Natural product logo visible if physically oriented toward camera; retain 25–35% low-detail space on one side for editorial use | Real car and hands; cropped person permitted. Wardrobe plain black/graphite, no third-party branding, clean hands/gloves only if normal approved method | Real towel contacting a clean wet panel; black edge and blue material identifiable | One-pass/full-car drying, scratch prevention, ceramic compatibility, speed, “professional” status or perfect before/after paint; do not remove remaining water to fake completion |
| **FIELD TO ADD:** `zeno-drying-towel-scale.webp` / `ZENO-DT_SCALE_MASTER_v01.tif` | Give honest visual context for physical scale once dimensions are known | Vertical 4:5 preferred, ≥4800 × 6000; also capture a square/landscape safety frame | 4:5 story crop or 1:1 gallery export as explicitly configured; dimension overlay remains HTML and only after approval | 4:5 story crop or 1:1 gallery export; full relevant product boundary and recognizable reference remain | Neutral bay or seamless with real car panel; even soft light and minimal perspective distortion | Logo visible if natural; leave a clean outside margin for future verified dimension annotations | Real car panel and hands/person permitted; use normal lens distance, not forced perspective | Full towel or a clearly defined proportion against a real reference | Exact size, number of vehicles/panels it can dry, person height or measurement from perspective alone; no scaled CGI mismatch |
| **FIELD TO ADD:** `zeno-drying-towel-packaging.webp` / `ZENO-DT_PACKAGING_MASTER_v01.tif` | Show the delivered retail presentation **only after final packaging exists** | 4:5 plus square-safe crop; ≥5000 px long edge | 4:5 story crop or 1:1 gallery export as explicitly configured | Crop must keep package, product relationship and required label area readable | Neutral light or graphite tabletop; clean high-key/soft side light according to final pack finish | Physical package logo fully visible and unchanged; leave 10% perimeter | No person; optional unboxing hand only in a separately approved shot | Exact final package, included quantity and labels that the customer will receive | Concept packaging as final; recyclable/sustainable, protective, sealed, premium, certified, warranty or included-item claims not printed/approved; no hidden mismatch to shipped pack |
| **FIELD TO ADD:** `zeno-drying-towel-usage-01.webp` / `ZENO-DT_USAGE-01_MASTER_v01.tif` | Sequence setup: approved starting condition before towel contact | Landscape 3:2 plus 4:5/square-safe crop, ≥6000 × 4000 | Step 01 in horizontal desktop sequence; add 1:1 export only if inserted in `products[].media[]` | 4:5/3:4 vertical step or explicitly configured 1:1 gallery crop; focal action centered | Same neutral vehicle, bay, exposure and camera-height family as all sequence shots | Logo optional; leave consistent small top area for HTML step number | Car and hands/person as required by approved script | Clean vehicle surface and the actual approved starting condition | That any wash/rinse procedure shown is required or universally safe; no chemical brand/product implied unless approved |
| **FIELD TO ADD:** `zeno-drying-towel-usage-02.webp` / `ZENO-DT_USAGE-02_MASTER_v01.tif` | Sequence placement: show the approved way the towel first meets the surface | Landscape 3:2 plus 4:5/square-safe crop, ≥6000 × 4000 | Step 02; action readable without caption | 4:5 or explicitly configured 1:1 crop centered on hands, edge and contact area | Match sequence lighting and white balance; paint reflections must be continuous and honest | Natural logo only; keep step-number area clear | Real car and hands; neutral wardrobe | Hand positions, full contacting portion and black edge where possible | Pressure level, scratch safety, recommended technique or coating compatibility unless the usage script explicitly verifies it |
| **FIELD TO ADD:** `zeno-drying-towel-usage-03.webp` / `ZENO-DT_USAGE-03_MASTER_v01.tif` | Sequence motion: depict one owner-approved drying movement | Landscape 3:2 plus 4:5/square-safe crop, ≥6000 × 4000; use fast enough shutter to preserve useful detail | Step 03; movement direction may be explained in HTML only | 4:5 or explicitly configured 1:1 crop; beginning/end context remains understandable | Match sequence; no artificial motion streak, duplicated towel or composited water trail | Logo not required if movement would hide it; no added logo | Real car and hands/person | Actual towel deformation and real water state during the approved movement | Instant absorption, one-pass result, minimum pressure, scratch-free outcome or speed; no edited dry path wider than captured |
| **FIELD TO ADD:** `zeno-drying-towel-usage-04.webp` / `ZENO-DT_USAGE-04_MASTER_v01.tif` | Sequence reposition: show an approved change to a dry section/fold **only if validated** | Landscape 3:2 plus 4:5/square-safe crop, ≥6000 × 4000 | Step 04 detail; hands and material orientation clear | 4:5 or explicitly configured 1:1 crop with folds and hand positions central | Match sequence; slightly closer framing is allowed but color/exposure must remain consistent | Natural logo if present; leave stable step-number space | Hands and partial car permitted | True fold/section change and actual product thickness | That this method is required, that a dry section remains, or a specific capacity/coverage; omit shot if the approved method differs |
| **FIELD TO ADD:** `zeno-drying-towel-usage-05.webp` / `ZENO-DT_USAGE-05_MASTER_v01.tif` | Sequence completion/care handoff; show the product after use without a staged performance claim | Landscape 3:2 plus 4:5/square-safe crop, ≥6000 × 4000 | Final step or transition to verified care instructions | 4:5 or explicitly configured 1:1 crop with towel state and context visible | Match sequence; honest surface/towel moisture and finish | Natural logo where possible; quiet area for HTML link to care | Hands/car optional according to approved script | Representative post-use towel and honest panel state | Full-vehicle completion, total water removed, time elapsed, capacity, no streaks/lint, or washing instructions not separately verified |
| `/assets/images/social/zeno-og.webp` / `ZENO-DT_SOCIAL-OG_MASTER_v01.psd` | Site/product social share card | Compose master at 2400 × 1260 (1.905:1); export 1200 × 630 | Open Graph preview; all essential content inside central share-safe 80% | Social apps may center-crop toward square; towel and ZENO identity must survive a centered 1:1 crop | Use an approved authentic hero/folded image on restrained graphite; no fake scene extension around the product | Use approved web logo derivative separately from the authentic product mark; keep 10% outer safe area and do not repeat branding excessively | Follow the source photo’s approved release status | Towel recognizable, logo sharp, no tiny technical details relied upon | Price, discount, star rating, review count, availability, delivery promise, competitor comparison or performance claim; do not use CSS placeholder art |
| `products[].video.poster` future value `zeno-drying-towel-video-poster.webp` / `ZENO-DT_VIDEO-POSTER_MASTER_v01.tif` | Accessible future gallery-video poster before playback | Landscape 16:9 at ≥3840 × 2160; subject inside center 4:5 safe zone | Gallery video poster at 16:9 | Center 4:5 crop must retain towel/action; play control is UI, not baked in | Frame from approved footage or matched still setup; neutral grade | Natural product mark if visible; no baked play icon/headline | Car/hands permitted only under approved video script/releases | A truthful, representative video moment | A result not shown in the final approved video; do not stage a more dramatic poster than the evidence |

### Conditional performance slot

`zeno-drying-towel-water-demo.webp` is **not commissioned by default** and has no current `products[].media[]` record. It may be added only after a written, reproducible test protocol and approved claim language exist. If commissioned, add the media record explicitly and document the towel sample, water volume, panel/surface, ambient conditions, number of passes, edits/cuts and full result. The public image/video must not show or imply more water, coverage or speed than the documented test supports.

## Video-ready architecture (future; do not fabricate now)

The current `products[].video` object already has `id`, `enabled`, `type`, `src`, `mimeType`, `poster`, `captions`, `width`, `height`, `alt` and `caption`. Use these intended values without creating empty/fake files:

- `products[].video.poster`: `/assets/images/products/drying-towel/zeno-drying-towel-video-poster.webp`
- `products[].video.src`: `/assets/images/products/drying-towel/zeno-drying-towel-demo.mp4`
- `products[].video.type`: `video` (the gallery uses this value to dispatch video markup)
- `products[].video.mimeType`: `video/mp4`
- `products[].video.captions`: `/assets/images/products/drying-towel/zeno-drying-towel-demo.en.vtt`

Confirm the existing 1920 × 1080 dimensions match the delivered poster/video and revise them if needed; retain meaningful `alt` and `caption` text. A WebM alternative and transcript are not represented by the current data object. If required, add the intended fields `products[].video.sources[]` and `products[].video.transcript` before delivering `/assets/images/products/drying-towel/zeno-drying-towel-demo.webm` and `/assets/images/products/drying-towel/zeno-drying-towel-demo-transcript.txt`.

When video is approved:

- Capture 4K UHD (3840 × 2160), 25/30 fps unless a higher rate is intentionally used for brief real-time detail; retain a 4:5 center-safe composition or capture a dedicated vertical version.
- Target a concise 15–45 second gallery cut. No autoplay, artificial absorption sound, unmarked time compression or repetitive loop that could imply performance.
- Begin with an immediate product/action frame; provide native controls, captions, transcript and a descriptive poster. Do not rely on audio for instructions.
- Show the same production product, method, water state and result that the approved script describes. Keep cuts chronologically honest; disclose a demonstrative test context where needed.
- Encode the configured MP4 only after playback, mobile bandwidth and reduced-motion behavior are tested. Add a `sources[]` field before relying on multiple encodings.
- Populate the existing `products[].video.poster`, `.src`, `.mimeType` and `.captions` fields only after all configured files exist; verify the existing ID, video type, dimensions, alt and caption, then set `.enabled: true`. Until then keep `.enabled: false` and file fields null.

## Data and accessibility handoff

After final files are approved, update the matching existing `products[].media[]` entry in `data/products.js` with:

- existing `id` matching the shot slot;
- existing `type: "image"`;
- existing `src` set to the delivered canonical WebP path (the renderer reads `src`, not `futureSources`);
- existing `status` changed from `placeholder` to `published` only after every referenced derivative is present and checked;
- existing `width`, `height` and `aspectRatio` set to the true exported dimensions/ratio;
- existing concise `alt` and `caption`; keep `placeholderVariant` only as the fallback-art identifier;
- existing `sources.avif[]` / `sources.webp[]` populated only with corresponding files and true widths;
- existing `zoomSrc` set when a checked zoom file exists and existing normalized `focalPoint.x` / `.y` adjusted for the approved crop;
- **field to add** `srcset` only if a direct fallback string is required in addition to the existing typed `sources` arrays.

Eager/lazy loading is currently selected by the renderer according to context and media position; there is no `products[].media[].loading` field. `sizes` is also supplied by the rendering component, not stored in the current product data.

Alt text must describe what the image contributes—such as “ZENO Drying Towel shown flat with blue microfiber and black edging”—without claiming softness by sight, keyword stuffing, dimensions not yet approved or results the image cannot prove. Do not put filenames, “product image,” or internal shot-status language in alt text.

## Approval checklist

No slot is production-ready until all applicable checks pass:

- [ ] The photographed/rendered object matches the approved production sample and quantity.
- [ ] Blue color and black edging were checked against the physical sample under neutral viewing conditions.
- [ ] ZENO logo geometry, placement and proportions are authentic and unaltered.
- [ ] Retouch preserves real fibers, seams, edge, thickness, folds, water and paint result.
- [ ] Required desktop and mobile crops work without cutting evidence or action.
- [ ] No required meaning depends on text baked into the image.
- [ ] Responsive AVIF/WebP files are sharp, color-consistent and free of pile/edge compression artifacts.
- [ ] Core filenames exactly match `products[].media[].futureSources`; active `src`, intrinsic dimensions, ratio, alt text and caption match `data/products.js`.
- [ ] Any visible usage step matches approved product guidance; any performance demonstration has substantiation.
- [ ] Packaging shown is the final customer-delivered packaging.
- [ ] Photographer/renderer rights, model releases, property releases and vehicle/logo permissions cover commercial web, social and advertising use in intended territories and duration.
- [ ] The business owner approved the master, retouch, each crop and the final social composite before `siteConfig.features.productPhotographyReady` becomes `true`.

### Renderer-specific requirement

A renderer may be used only with measured reference, approved material/color targets and the original logo geometry. A hypothetical towel, invented weave, enhanced pile, altered edge, idealized logo application or impossible water behavior is concept art—not product evidence—and must not replace authentic commerce photography. Record render source/version and approvals in the private asset manifest.
