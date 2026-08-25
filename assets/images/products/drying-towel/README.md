# ZENO Drying Towel media directory

Place only approved, web-optimized derivatives here. Keep RAW files, layered masters, releases and color references outside the website repository.

The complete capture, crop, lighting, responsive-output and claim-safety specification is in [`../../../../docs/PRODUCT-PHOTOGRAPHY-BRIEF.md`](../../../../docs/PRODUCT-PHOTOGRAPHY-BRIEF.md).

The active media contract lives in [`../../../../data/products.js`](../../../../data/products.js). Its canonical slots are:

- `zeno-drying-towel-hero.*`
- `zeno-drying-towel-front.*`
- `zeno-drying-towel-folded.*`
- `zeno-drying-towel-texture.*`
- `zeno-drying-towel-edge.*`
- `zeno-drying-towel-branding.*`

For every approved slot, populate `src`, responsive `sources.avif` / `sources.webp`, intrinsic `width` / `height`, optional `zoomSrc`, focal point and accurate alt text. Set `status: 'published'` only after every referenced file exists and has been visually checked. The first PDP/home image is prioritized; later media remains lazy-loaded.

Do not publish concept packaging, generated product photography, baked-in marketing text or visuals that imply unverified performance.
