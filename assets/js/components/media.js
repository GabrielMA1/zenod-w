import { resolveImage } from '../../../data/media.js';
import { siteConfig } from '../../../data/site.js';
import { toSitePath } from '../../../data/deployment.js';
import { escapeHtml } from '../lib/html.js';

function srcset(items) {
  return items.map((item) => `${toSitePath(item.src)} ${item.width}w`).join(', ');
}

function focalStyle(focal) {
  return `${Math.round(focal[0] * 100)}% ${Math.round(focal[1] * 100)}%`;
}

// Renders one image slot at its final position with a fixed aspect ratio. Until the
// approved asset exists the slot shows its library fallback, or a quiet neutral panel.
// Product visualisations always carry a short caption under the image.
export function imageMarkup(slotId, options = {}) {
  const image = resolveImage(slotId);
  const {
    sizes = '100vw', eager = false, className = '', ratio = image.ratio,
    caption = true, frameClass = '', alt,
  } = options;
  const style = `--ratio: ${ratio}; --focal: ${focalStyle(image.focal)}`;
  if (image.kind === 'placeholder') {
    return `<figure class="media media--placeholder ${escapeHtml(className)}" data-image-slot="${escapeHtml(slotId)}" data-image-state="placeholder" aria-hidden="true">
      <div class="media__frame ${escapeHtml(frameClass)}" style="${style}"><img class="media__placeholder-mark" src="${toSitePath(siteConfig.brandAssets.symbolBlack)}" alt="" width="848" height="524" loading="lazy"></div>
    </figure>`;
  }
  const note = caption && image.generated && image.product ? '<figcaption class="media__note">Product visualisation</figcaption>' : '';
  return `<figure class="media ${escapeHtml(className)}" data-image-slot="${escapeHtml(slotId)}" data-image-state="${image.kind}">
    <div class="media__frame ${escapeHtml(frameClass)}" style="${style}"><picture>
      <source type="image/avif" srcset="${escapeHtml(srcset(image.sources.avif))}" sizes="${escapeHtml(sizes)}">
      <img src="${escapeHtml(toSitePath(image.src))}" srcset="${escapeHtml(srcset(image.sources.webp))}" sizes="${escapeHtml(sizes)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(alt ?? image.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"${eager ? ' fetchpriority="high"' : ''}>
    </picture></div>${note}
  </figure>`;
}
