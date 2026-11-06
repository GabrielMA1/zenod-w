# ZENO Drying Towel images

Website derivatives for the product slots in [`data/image-manifest.json`](../../../../data/image-manifest.json) are written here by the processing script — do not add files by hand:

```bash
npm run images:process -- <slot> path/to/source.png   # validates, writes AVIF/WebP, marks ready-for-review
npm run images:approve -- <slot>                      # after visual review, renders it on the site
npm run images:status
```

Prompts, attachments and validation criteria are in [`docs/IMAGE-PRODUCTION-QUEUE.md`](../../../../docs/IMAGE-PRODUCTION-QUEUE.md). Capture standards for real photography are in [`docs/PRODUCT-PHOTOGRAPHY-BRIEF.md`](../../../../docs/PRODUCT-PHOTOGRAPHY-BRIEF.md). Originals are kept in `media-source/<slot>/`; RAW files, layered masters and releases stay outside the repository.
