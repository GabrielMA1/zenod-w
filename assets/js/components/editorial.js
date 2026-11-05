import { images } from "../../../data/media.js";
import { toSitePath } from "../../../data/deployment.js";
import { escapeHtml } from "../lib/html.js";
import { icon } from "./icons.js";

export function editorialImage(
  key,
  { className = "", eager = false, sizes = "100vw", alt } = {},
) {
  const image = images[key];
  const widths = [...new Set(image.widths ?? [480, 960, image.width])];
  const srcset = (format) =>
    widths
      .map(
        (width) =>
          `${toSitePath(`/assets/images/editorial/${image.name}-${width}.${format}`)} ${width}w`,
      )
      .join(", ");
  return `<picture class="editorial-image ${escapeHtml(className)}">
    <source type="image/avif" srcset="${escapeHtml(srcset("avif"))}" sizes="${escapeHtml(sizes)}">
    <img src="${toSitePath(`/assets/images/editorial/${image.name}-${image.width}.webp`)}" srcset="${escapeHtml(srcset("webp"))}" sizes="${escapeHtml(sizes)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(alt ?? image.alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async" ${eager ? 'fetchpriority="high"' : ""}>
  </picture>`;
}

export function closingCta() {
  return `<section class="closing-cta"><div class="shell closing-cta__inner"><div><p class="eyebrow">THE NEXT WASH STARTS HERE</p><h2>Make the last step count.</h2></div><a class="button button--light" href="${toSitePath("/products/drying-towel/")}">Discover the towel ${icon("arrow")}</a></div></section>`;
}
