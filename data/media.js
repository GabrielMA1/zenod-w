// Image slots and their temporary fallbacks. See data/image-manifest.json and
// docs/IMAGE-PRODUCTION-QUEUE.md. Generated artwork is never presented as a
// photograph of manufactured inventory: product visualisations are captioned.
import manifest from './image-manifest.json' with { type: 'json' };

export const imageManifest = manifest;

function filesFor(path, widths) {
  return {
    avif: widths.map((width) => ({ src: `/${path}-${width}.avif`, width })),
    webp: widths.map((width) => ({ src: `/${path}-${width}.webp`, width })),
  };
}

function ratioValue([width, height]) {
  return `${width} / ${height}`;
}

// Resolve a slot to what the site can honestly show today:
//   kind 'final'       → the approved asset for this slot
//   kind 'fallback'    → an existing visual from the library, cropped to the slot ratio
//   kind 'placeholder' → no suitable image exists yet
export function resolveImage(slotId) {
  const slot = manifest.slots[slotId];
  if (!slot) throw new Error(`Unknown image slot "${slotId}"`);
  const base = { slotId, ratio: ratioValue(slot.ratio), status: slot.status, caption: slot.caption ?? null };
  if (slot.status === 'implemented' && slot.width && slot.height) {
    const sources = filesFor(slot.destination, slot.widths);
    return {
      ...base, kind: 'final', sources,
      src: sources.webp.at(-1).src, width: slot.width, height: slot.height,
      focal: slot.focal ?? [0.5, 0.5], alt: slot.alt,
      generated: Boolean(slot.generated), product: Boolean(slot.product),
    };
  }
  const fallback = slot.fallback ? manifest.library[slot.fallback] : null;
  if (fallback) {
    const sources = filesFor(fallback.path, fallback.widths);
    return {
      ...base, kind: 'fallback', sources,
      src: sources.webp.at(-1).src, width: fallback.width, height: fallback.height,
      focal: slot.fallbackFocal ?? slot.focal ?? [0.5, 0.5], alt: fallback.alt,
      generated: Boolean(fallback.generated), product: Boolean(fallback.product),
    };
  }
  return { ...base, kind: 'placeholder', sources: null, src: null, width: slot.ratio[0], height: slot.ratio[1], focal: [0.5, 0.5], alt: '', generated: false, product: false };
}

// Gallery media for the product page, ordered by the manifest. Slots without an
// approved image or a fallback stay out of the gallery rather than showing an empty frame.
export function productGallerySlots() {
  return Object.entries(manifest.slots)
    .filter(([, slot]) => Number.isInteger(slot.gallery) && slot.status !== 'blocked')
    .filter(([, slot]) => (slot.galleryOnlyWhenImplemented ? slot.status === 'implemented' : true))
    .sort(([, a], [, b]) => a.gallery - b.gallery)
    .map(([id]) => resolveImage(id))
    .filter((image) => image.kind !== 'placeholder');
}

// Every file the renderer can reference, for the build's asset copy step.
export function publishedImageFiles() {
  const files = [];
  // Library visuals ship only while a slot still falls back to them.
  const usedFallbacks = new Set(Object.values(manifest.slots)
    .filter((slot) => slot.status !== 'implemented' && slot.fallback)
    .map((slot) => slot.fallback));
  for (const [id, entry] of Object.entries(manifest.library)) {
    if (!usedFallbacks.has(id)) continue;
    const { avif, webp } = filesFor(entry.path, entry.widths);
    files.push(...avif.map((item) => item.src), ...webp.map((item) => item.src));
  }
  for (const [slotId, entry] of Object.entries(manifest.slots)) {
    const slot = { ...entry, slotId };
    if (slot.status === 'implemented' && slot.widths) {
      const { avif, webp } = filesFor(slot.destination, slot.widths);
      files.push(...avif.map((item) => item.src), ...webp.map((item) => item.src));
    }
    if (slot.status === 'implemented' && slot.slotId === 'social-default') files.push(`/${slot.destination}-1200.jpg`);
    if (slot.status === 'interim' && slot.interimFile) files.push(`/${slot.interimFile}`);
  }
  return [...new Set(files)];
}

export function socialImagePath() {
  const slot = manifest.slots['social-default'];
  if (slot.status === 'implemented') return `/${slot.destination}-1200.jpg`;
  return slot.interimFile ? `/${slot.interimFile}` : null;
}
