# ZENO DETAIL — image production queue

The storefront is built and every image slot already exists at its final position. Each slot is defined in [`data/image-manifest.json`](../data/image-manifest.json) with its ratio, crop focal point, destination, alt text and a temporary fallback. Until a final asset is approved, the site shows the fallback (one of the four existing visualisations) or, where nothing suitable exists, keeps the slot out of the page.

**Everything produced with ChatGPT Images is a product visualisation.** The site captions it as such. It never establishes dimensions, weave, blend, absorbency, paint safety or packaging. Real photographs of the manufactured towel are still required before launch (see the end of this file).

## Status key

| Status | Meaning |
| --- | --- |
| `Awaiting user image` | Prompt below is final; waiting for your ChatGPT Images export |
| `Needs generation` | Prompt is final; lower priority |
| `Ready for review` | Processed into AVIF/WebP; needs visual approval |
| `Implemented` | Approved and live on the site |
| `Interim` | Rendered now from existing approved artwork |
| `Blocked` | Cannot be produced honestly until a product fact is confirmed |

## How to hand an image back

1. Generate the image with the prompt and the listed attachments. Export at the largest size ChatGPT Images offers for that ratio (at least 1536 × 1024 for 3:2, 1024 × 1024 for 1:1).
2. Send it back with its **output filename**. I check it against the validation criteria, then run:
   ```bash
   npm run images:process -- <slot> path/to/file.png
   ```
   This validates the ratio and size, writes AVIF and WebP widths to the destination, keeps the original in `media-source/<slot>/` with a checksum, and marks the slot `Ready for review`. `--crop --focal=x,y` crops a mismatched ratio instead of failing. `focal` is a CSS object-position pair from 0 to 1 (0 aligns the left/top edge, 1 the right/bottom edge), used both for that crop and for every responsive crop on the site.
3. After visual review: `npm run images:approve -- <slot>`, then `npm run generate`. The page switches from the fallback to the final asset; nothing else changes. `npm run images:status` lists every slot.

## The ZENO towel — keep it identical in every image

Paste this description into every prompt (it is already included below). Attach the same references each time.

> The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos anywhere on the towel.

**Attach to every product image** (approved references since 6 November 2026):
- `media-source/product-folded/zeno-drying-towel-folded.webp` — towel colour, pile, binding and label reference
- `media-source/product-edge-label/zeno-drying-towel-edge-label.webp` — pile loops, binding width and stitching
- `assets/images/brand/zeno-logo-white-transparent-bg.png` — the authentic white ZENO DETAIL logo (do not let the generator redraw it from memory)

**Logo rule.** Check the label against `assets/images/brand/zeno-logo-web-white.svg`. The Z must be two sharp blades, ZENO must be wide and squared, DETAIL must be widely spaced. If the generator distorts any letter, regenerate with the label **blank** (replace the logo sentence with "a small plain black woven label with no marks") and send me that version: I will composite the authentic logo onto the label with a perspective transform so it sits flat on the fabric at the right scale, rather than looking pasted on (`scripts/composite-logo-on-label.py`, which can also erase and replace malformed lettering on an existing label).

**Photographic look for every image.** Natural, soft daylight from a large window or open roller door; neutral white balance (about 5500 K); true-to-life contrast; real optical depth of field; fine natural grain allowed. Commercial product photography, not CGI, not a render, not an illustration.

**Never in any image:** text, prices, badges, watermarks, extra logos, car-maker emblems or recognisable car models, people's faces, distorted hands, warped wheels or bodywork, impossible reflections, glowing edges, HDR, oversharpening, neon or blue colour casts, smoke, sparkles, water splashes frozen mid-air, more than one towel unless stated, packaging, measuring tapes or dimension lines.

---

## Delivered so far

| Slot | Received | Review notes |
| --- | --- | --- |
| `home-hero` | 1536 × 1024 | Composition, colour, binding, bonnet and reflections pass. The generator malformed "DETAIL" on the label (barred D, broken L), so the authentic logo was composited onto the label with a perspective warp; only the label area changed. Both the original and the corrected file are in `media-source/home-hero/`. Crop alignment set to `focal: [0.75, 0.45]` so the square phone crop keeps the whole towel. |
| `product-folded` | 1254 × 1254 | Passes. Label matches the logo. Side margins are tighter (≈5%) than the 10–15% requested; acceptable in the square gallery frame. |
| `product-edge-label` | 1254 × 1254 | Passes. Label letterforms match the logo; stitching and pile are believable. |
| `social-default` | composed | Owner's layout: authentic white logo on ink at left, the approved `product-folded` image (630 × 630) at right. |
| `product-texture` | 1254 × 1254 | Passes. Looped pile consistent with the other images; no logo. |
| `guide-drying` | 1536 × 1024 | Passes. No badges or recognisable model; believable beading. |
| `guide-microfiber-care` | 1536 × 1024 | Passes. One towel, label matches the logo, no third-party brands. |
| `guide-choosing` | 1536 × 1024 | Passes. Five correctly formed digits; label matches the logo. Crop alignment `focal: [0.5, 0.55]` keeps the hand and label in the wide article cover. |
| *(not used)* towel laid flat on a roof | 1536 × 1024 | Rejected for `product-on-paint`: the pile is flat and fleece-like with a thinner binding, unlike every approved image, and it shows the whole towel outline (unverified proportions). See the revised prompt below. |

The 1536-pixel square widths were not produced because the sources are 1254 px; the site serves 480, 768 and 1024 for those slots.

## Priority 1

### 1. `zeno-home-hero` — Home page opening image
| | |
| --- | --- |
| Slot | `home-hero` · status **Implemented** (6 November 2026) |
| Where | Home page first screen: left of the product tag on desktop (cropped to 4:3), first element on phones (cropped to 1:1) |
| Output filename | `zeno-home-hero.png` |
| Destination | `assets/images/campaign/zeno-home-hero-{640,1024,1536,2048}.{avif,webp}` |
| Aspect ratio | 3:2 landscape |
| Composition | Towel loosely folded in quarters, resting on the bonnet of a dark graphite metallic estate car, placed right of centre and in the upper-middle of the frame (focal point ≈ 68% across, 42% down) so both the 4:3 and the centred 1:1 crops keep the whole towel and its label. Camera at bonnet height, slightly above, 50 mm look, towel sharp, windscreen base softly out of focus behind. Water beads across the paint in the left foreground. Keep the bottom 20% of the frame quiet (paint and beads only): the product tag overlaps that edge. |
| Lighting | Overcast daylight through a large open roller door behind and to the left; one broad, soft window reflection across the bonnet; gentle shadow under the towel. |
| Environment | Clean, modern, slightly industrial wash bay: concrete, pale grey walls, out-of-focus window frames. No branding, no equipment clutter. |
| Attachments | `drying-towel-1024.webp`, `zeno-logo-white-transparent-bg.png`, and `drying-moment-1536.webp` as the scene reference |
| Restrictions | No car badge, grille or recognisable model. Bonnet shape continuous and believable. Beads realistic in size, not perfectly uniform. Towel not wet-looking or crumpled. |

**Prompt**
```
Create a realistic commercial product photograph, 3:2 landscape.

Subject: the ZENO DETAIL drying towel, loosely folded in quarters and resting on the bonnet of a dark graphite metallic estate car that has just been washed. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos anywhere on the towel. Match the towel colour, pile, binding and label of the attached product reference exactly.

Composition: the towel sits right of centre in the upper-middle of the frame (about 68% across, 42% down), fully visible with its label facing the camera at the front corner. Camera at bonnet height, slightly above, natural 50 mm perspective. The towel is in sharp focus; the base of the windscreen behind it falls softly out of focus. Realistic water beads of varied size cover the paint in the left foreground. Keep the bottom fifth of the frame calm — just paint and a few beads.

Lighting: soft overcast daylight from a large open roller door behind and to the left, creating one broad, soft reflection across the bonnet and a gentle contact shadow under the towel. Neutral white balance, true-to-life contrast.

Environment: a clean, modern wash bay with concrete and pale grey walls, out-of-focus window frames in the background. No equipment clutter.

Style: real photograph taken with a full-frame camera, natural depth of field, fine natural grain, restrained colour grade. Not CGI, not a render.

Avoid: any text, prices, badges, watermarks or extra logos; car-maker emblems, grilles or a recognisable car model; warped bodywork; impossible or mirror-perfect reflections; HDR; oversharpening; glow; blue colour cast; splashes; a crumpled or soaking-wet towel; more than one towel.
```
**Validation:** whole towel and label inside both a centred 1:1 crop and a 4:3 crop; logo matches the SVG; blue matches the reference (not cyan/navy); bonnet geometry and reflections believable; no emblems; nothing important in the bottom 20%.

### 2. `zeno-drying-towel-folded` — Product gallery image 1, shop, bag
| | |
| --- | --- |
| Slot | `product-folded` · status **Implemented** (6 November 2026) |
| Where | First image of the product gallery, shop listing, bag thumbnail, home close-up (small) |
| Output filename | `zeno-drying-towel-folded.png` |
| Destination | `assets/images/products/drying-towel/zeno-drying-towel-folded-{480,768,1024,1536}.{avif,webp}` |
| Aspect ratio | 1:1 |
| Composition | Towel neatly folded into a square stack (folded twice), centred, filling about 70% of the frame with 10–15% clear margin all round; label at the front-right corner, upright and readable. Camera 35–40° above the surface, 85 mm look, whole stack sharp. |
| Lighting | Large soft window light from the left, gentle fill from the right, soft natural contact shadow to the lower right. |
| Environment | Seamless warm light-grey matte surface and background (like smooth concrete or paper, close to #D9D0C8), no props. |
| Attachments | `drying-towel-1024.webp`, `zeno-logo-white-transparent-bg.png` |
| Restrictions | Folds must look like real fabric: soft rounded fold edges, natural slight unevenness; no artificial padding or exaggerated thickness; one towel only. |

**Prompt**
```
Create a realistic studio product photograph, square 1:1.

Subject: one ZENO DETAIL drying towel, neatly folded twice into a soft square stack. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos anywhere on the towel. Match the attached product reference exactly.

Composition: the folded towel is centred and fills about 70% of the frame with an even clear margin; the label sits at the front-right corner, upright and readable. Camera 35–40 degrees above the surface with a natural 85 mm perspective; the whole towel is sharp.

Lighting: large soft window light from the left, gentle fill from the right, a soft natural contact shadow to the lower right. Neutral white balance.

Environment: seamless warm light-grey matte surface and background, like smooth fine concrete, no props.

Style: real commercial product photograph, full-frame camera, true-to-life texture and colour. Fold edges soft and rounded, with the natural slight unevenness of real fabric. Not CGI.

Avoid: text, prices, badges, watermarks, extra logos; more than one towel; exaggerated thickness or puffiness; plastic-looking or overly perfect fabric; HDR; oversharpening; glow; blue cast; packaging.
```
**Validation:** single towel; label readable and matches the SVG; even margin; colour matches the reference; fold edges believable; surface colour close to the page ground.

### 3. `zeno-drying-towel-edge-label` — Product gallery image 2, home close-up
| | |
| --- | --- |
| Slot | `product-edge-label` · status **Implemented** (6 November 2026) |
| Where | Product gallery image 2; large image in the home "close-up" section |
| Output filename | `zeno-drying-towel-edge-label.png` |
| Destination | `assets/images/products/drying-towel/zeno-drying-towel-edge-label-{480,768,1024,1536}.{avif,webp}` |
| Aspect ratio | 1:1 |
| Composition | Macro of one corner: the black binding enters from the right edge and curves around the corner at the lower right; the label sits slightly right of and below centre (focal ≈ 55%, 55%), parallel to the edge; blue pile fills the upper left. Sharp focus on label and nearby stitching, pile falls gently out of focus towards the top-left corner. |
| Lighting | Low, raking soft light from the upper left to show pile texture and stitching relief; no glare on the label. |
| Environment | The towel lies on the same warm light-grey surface, visible only in the lower-right corner beyond the binding. |
| Attachments | `towel-detail-1024.webp`, `zeno-logo-white-transparent-bg.png` |
| Restrictions | Stitching realistic and continuous; label edges woven, not printed sticker; logo exact. |

**Prompt**
```
Create a realistic macro product photograph, square 1:1.

Subject: a close-up of one corner of the ZENO DETAIL drying towel. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos anywhere on the towel. Match the attached close-up reference.

Composition: the black binding enters from the right edge and curves around a rounded corner in the lower right. The label sits slightly right of and below centre, parallel to the binding. Blue pile fills the upper left. Focus is sharp on the label and the nearby stitching; the pile falls gently out of focus towards the top-left corner. A sliver of warm light-grey surface shows beyond the binding in the lower right.

Lighting: low, raking soft daylight from the upper left that reveals the pile loops and the stitching relief, with no glare on the label.

Style: real macro photograph, 100 mm macro lens, natural shallow depth of field, true-to-life colour and texture. Not CGI.

Avoid: text other than the logo, printed-sticker look, distorted letters, frayed or melted-looking binding, oversharpening, HDR, glow, blue cast, more than one towel.
```
**Validation:** logo letterforms identical to the SVG; stitching continuous; pile texture natural; corner shape consistent with images 1 and 2.

## Priority 2

### 4. `zeno-drying-towel-on-paint` — Product gallery image 3 (revised prompt)
| | |
| --- | --- |
| Slot | `product-on-paint` · status **Awaiting user image** (fallback: `drying-moment`) |
| Where | Product gallery image 3 (square) |
| Output filename | `zeno-drying-towel-on-paint.png` |
| Destination | `assets/images/products/drying-towel/zeno-drying-towel-on-paint-{480,768,1024,1536}.{avif,webp}` |
| Aspect ratio | 1:1 |
| Composition | Towel folded in half and draped over the edge of a wet graphite car roof, one end hanging just over the edge. The full outline of the towel must never be visible. Camera slightly above roof height looking along the roof; towel centred; label visible; water beads in front. |
| Why revised | The first attempt laid the towel flat (showing its full proportions) and drew a flat fleece pile with a thin binding. The prompt now forbids both and names the approved references. |
| Attachments | `zeno-drying-towel-folded.webp`, `zeno-drying-towel-edge-label.webp` (from `media-source/`), `zeno-logo-white-transparent-bg.png`, and `media-source/home-hero/zeno-home-hero.png` for the car and light |

**Prompt**
```
Create a realistic commercial photograph, square 1:1.

Subject: the ZENO DETAIL drying towel, folded in half and draped over the edge of the roof of a freshly washed dark graphite car, so that one folded end hangs just over the roof edge. Only part of the towel is visible: never show its complete outline, and never lay it out flat. The towel must be identical to the attached approved references: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple) with a dense, clearly looped, slightly shaggy pile exactly like the attached close-up — not a flat fleece or velvet surface. Its perimeter is finished with a black fabric binding about 1 cm wide, as thick as in the references, with neat matching stitching and gently rounded corners. A small square black woven label sewn just inside one corner carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos.

Composition: camera slightly above roof height looking along the roof; the folded towel is centred and sharp with the label visible near the front; realistic water beads of varied size on the roof in the foreground; the roof edge and side window curve away naturally.

Lighting: soft daylight from behind and to the left, one long soft reflection along the roof, a gentle shadow where the towel touches the paint. Match the light and paint of the attached hero image.

Environment: a clean daylight wash bay, softly out of focus.

Style: real photograph, natural depth of field, restrained colour. Not CGI.

Avoid: a flat or fully spread towel, the whole towel outline, flat fleece texture, a thin binding, text, badges, car-maker emblems, recognisable models, warped roof lines, impossible reflections, HDR, glow, blue cast, splashes, more than one towel.
```
**Validation:** pile and binding indistinguishable from the folded and edge images; no complete outline; roof geometry believable; label exact.

### 5. `zeno-drying-towel-texture` — Product gallery image 4 (added automatically)
| | |
| --- | --- |
| Slot | `product-texture` · status **Implemented** (6 November 2026) |
| Where | Product gallery image 4 |
| Output filename | `zeno-drying-towel-texture.png` |
| Destination | `assets/images/products/drying-towel/zeno-drying-towel-texture-{480,768,1024,1536}.{avif,webp}` |
| Aspect ratio | 1:1 |
| Composition | Macro of the pile across one soft fold that runs diagonally from lower left to upper right; no label, no binding; sharp band of focus along the fold crest. |
| Lighting | Grazing soft light from the right to show pile depth. |
| Attachments | `towel-detail-1024.webp` (pile and colour reference only) |

**Prompt**
```
Create a realistic macro photograph, square 1:1, of the blue microfiber surface of the ZENO DETAIL drying towel: a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple) with a dense, even, slightly looped pile and a soft matte surface, matching the attached reference.

Composition: the fabric forms one soft fold running diagonally from lower left to upper right. A narrow band of sharp focus runs along the crest of the fold; the pile on either side falls gently out of focus. No label, no binding, no logo in the frame.

Lighting: grazing soft daylight from the right that reveals the depth of the pile, with natural micro-shadows.

Style: real 100 mm macro photograph, true-to-life colour, natural texture. Not CGI.

Avoid: text, logos, fibres that look like fur or plastic, exaggerated pile length, oversharpening, HDR, glow, blue cast, water droplets.
```
**Validation:** pile looks like real microfiber at macro scale; colour matches; no logo; nothing suggesting a specific weave name.

### 6. `zeno-drying-in-use` — Home routine section; gallery image 5 once approved
| | |
| --- | --- |
| Slot | `drying-in-use` · status **Awaiting user image** (fallback: `workshop-car`) |
| Where | Home page "Drying a car, in four steps" (fills the left half on desktop, 4:3 on phones); product gallery image 5 (square crop) once implemented |
| Output filename | `zeno-drying-in-use.png` |
| Destination | `assets/images/campaign/zeno-drying-in-use-{640,1024,1536,2048}.{avif,webp}` |
| Aspect ratio | 3:2 landscape; keep the action inside the centre square |
| Composition | Two hands and forearms (plain black long-sleeve top, no logos, no face) lay the unfolded towel flat on the roof of a washed graphite car and draw it slowly towards the camera. Action in the centre of the frame; the label visible at the towel's near corner. Ahead of the towel, beads of water; behind it, a slightly darker, damp but not mirror-dry path. Camera at shoulder height on the far side of the car. |
| Lighting | Soft daylight from the open bay door behind the car; natural reflection on the roof. |
| Environment | Same wash bay; background softly out of focus. |
| Attachments | `media-source/product-folded/zeno-drying-towel-folded.webp`, `media-source/product-edge-label/zeno-drying-towel-edge-label.webp`, `zeno-logo-white-transparent-bg.png`, and `media-source/home-hero/zeno-home-hero.png` for the car and light |
| Restrictions | Exactly two anatomically correct hands with five fingers each; light, flat contact (no scrubbing gesture); water state realistic — do not show a perfectly dry streak. |

**Prompt**
```
Create a realistic documentary-style commercial photograph, 3:2 landscape, with the action inside the centre square of the frame.

Subject: two hands and forearms in a plain black long-sleeve top (no logos, no face visible) lay the unfolded ZENO DETAIL drying towel flat on the roof of a freshly washed dark graphite car and draw it slowly towards the camera with light, flat contact. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file — the angular two-blade Z symbol above the wide ZENO wordmark, with DETAIL spaced out underneath. No other text, tags or logos anywhere on the towel. The pile must be dense and clearly looped exactly like the attached close-up, never flat fleece, and the binding as wide as in the references. Match the attached product references.

Composition: camera at shoulder height on the far side of the car looking across the roof. The label is visible at the towel's near corner. In front of the towel there are realistic water beads; behind it the paint is darker and damp, not mirror-dry.

Lighting: soft daylight from the open wash-bay door behind the car, natural reflections on the roof.

Environment: a clean, modern daylight wash bay, softly out of focus.

Style: real photograph, 35–50 mm perspective, natural depth of field, honest colour. Not CGI.

Avoid: faces, extra or malformed fingers, scrubbing or pressing gestures, a perfectly dry streak, splashes, text, badges, car-maker emblems, recognisable car models, warped bodywork, HDR, glow, blue cast, more than one towel.
```
**Validation:** hands anatomically correct; contact looks gentle; water state honest (no "one pass dries everything"); centre square works as a 1:1 crop; consistent towel identity.

## Priority 3 — care guide covers (shown 21:9 on desktop, 3:2 in lists)

Keep everything important inside the middle 60% of the height: desktop article covers crop the top and bottom.

### 7. `zeno-guide-drying` — "How to dry your car after washing"
| | |
| --- | --- |
| Slot | `guide-drying` · status **Implemented** (6 November 2026) |
| Output filename | `zeno-guide-drying.png` |
| Destination | `assets/images/guides/zeno-guide-drying-{480,960,1536}.{avif,webp}` |
| Aspect ratio | 3:2 |
| Attachments | `drying-moment-1536.webp` (scene reference) |

**Prompt**
```
Create a realistic photograph, 3:2 landscape: water beading on the bonnet of a freshly rinsed dark graphite car in a clean daylight wash bay. Low camera angle along the bonnet; beads of varied, natural size in sharp focus across the middle band of the frame; the windscreen base and the bay softly out of focus behind. Soft overcast daylight from an open roller door creating one broad, soft reflection. Keep the top and bottom fifths of the frame calm. Real photograph, natural depth of field, honest colour. No towel, no people, no text, no badges or car-maker emblems, no recognisable car model, no splashes, no HDR, no glow, no blue cast.
```
**Validation:** believable beads (not glass marbles); continuous bonnet surface; content survives a 21:9 centre crop.

### 8. `zeno-guide-microfiber-care` — "A better routine for your microfiber"
| | |
| --- | --- |
| Slot | `guide-microfiber-care` · status **Implemented** (6 November 2026) |
| Output filename | `zeno-guide-microfiber-care.png` |
| Destination | `assets/images/guides/zeno-guide-microfiber-care-{480,960,1536}.{avif,webp}` |
| Aspect ratio | 3:2 |
| Attachments | `drying-towel-1024.webp`, `zeno-logo-white-transparent-bg.png` |

**Prompt**
```
Create a realistic photograph, 3:2 landscape, of one clean, neatly folded ZENO DETAIL drying towel on a plain pale wooden shelf in a bright utility room, beside a simple woven laundry basket. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface. Its entire perimeter is finished with a narrow black fabric binding, about 1 cm wide, with neat matching stitching and gently rounded corners. A small square black woven label is sewn just inside one corner; it carries the white ZENO DETAIL logo exactly as in the attached logo file. Match the attached product reference. The towel sits left of centre in the middle band of the frame with its label visible; the basket is to the right and slightly out of focus; a plain white wall behind. Soft window daylight from the left. Real photograph, calm and tidy, honest colour. No text, no detergent brands or labelled bottles, no other towels, no washing machine controls, no HDR, no glow.
```
**Validation:** one towel only (no implied multi-pack); no third-party brands; label exact.

### 9. `zeno-guide-choosing` — "What matters in a car drying towel?"
| | |
| --- | --- |
| Slot | `guide-choosing` · status **Implemented** (6 November 2026) |
| Output filename | `zeno-guide-choosing.png` |
| Destination | `assets/images/guides/zeno-guide-choosing-{480,960,1536}.{avif,webp}` |
| Aspect ratio | 3:2 |
| Attachments | `towel-detail-1024.webp`, `zeno-logo-white-transparent-bg.png` |

**Prompt**
```
Create a realistic close-up photograph, 3:2 landscape: one hand (natural skin, short clean nails, no rings, no sleeve logos) gently pressing its fingertips into the pile near the black-bound edge of the ZENO DETAIL drying towel, which lies flat on a warm light-grey surface. The ZENO DETAIL drying towel: a plush automotive microfiber drying towel in a deep royal cobalt blue (in neutral daylight close to #2A4FBF — not cyan, not navy, not purple), with a dense, even, slightly looped pile and a soft matte surface, finished with a narrow black fabric binding about 1 cm wide with neat stitching; a small square black woven label with the white ZENO DETAIL logo exactly as in the attached logo file sits at the corner, visible at the right of the frame. Fingertips and pile in sharp focus in the centre; soft raking daylight from the left. Real macro-style photograph, honest colour. Exactly five correctly formed fingers. No text, no measuring tools, no other towels, no HDR, no glow, no blue cast.
```
**Validation:** hand anatomy correct; nothing implying a measurement or performance test.

## Priority 4

### 10. `zeno-og` — social sharing card
| | |
| --- | --- |
| Slot | `social-default` · status **Implemented** (6 November 2026): composed from the approved `product-folded` image and the authentic white logo PNG |
| Output | No generation needed. Recompose it the same way whenever `product-folded` changes. |

## Blocked — do not generate yet

| Slot | Why it is blocked |
| --- | --- |
| `product-flat` — the complete towel laid flat from above | Shows the towel's proportions. Wait for verified dimensions, then photograph the real towel. |
| `product-packaging` — what the customer receives | Must show the final production packaging, photographed for real. A generated pack would misrepresent what ships. |

## Real photographs still required before launch

Generated visualisations are fine for a prelaunch storefront. Before ordering opens, replace at least slots 2, 3, 5 and the blocked flat view with photographs of the manufactured towel (see `docs/PRODUCT-PHOTOGRAPHY-BRIEF.md` for capture standards), so customers see the real colour, pile, edge and label method. Process them with the same commands plus `--photo`, which sets `generated: false` for the slot so the "Product visualisation" caption is removed.
