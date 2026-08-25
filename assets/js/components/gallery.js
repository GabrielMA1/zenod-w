import { escapeHtml } from '../lib/html.js';
import { icon } from './icons.js';
import { productVisualMarkup } from './product.js';

function mediaLabel(media, index, count) {
  return `${media.caption || media.alt || 'Product view'}, ${index + 1} of ${count}`;
}

function videoMarkup(media) {
  return `<figure class="gallery-video gallery-media">
    <video controls preload="metadata" ${media.poster ? `poster="${escapeHtml(media.poster)}"` : ''} width="${media.width}" height="${media.height}" aria-label="${escapeHtml(media.alt)}">
      <source src="${escapeHtml(media.src)}"${media.mimeType ? ` type="${escapeHtml(media.mimeType)}"` : ''}>
      ${media.captions ? `<track kind="captions" src="${escapeHtml(media.captions)}" srclang="en" label="English" default>` : ''}
    </video>
  </figure>`;
}

function thumbnailMediaMarkup(product, media) {
  if (media.type !== 'video') return productVisualMarkup(product, media, { className: 'gallery-thumbnail__media', sizes: '7rem' });
  const fallback = product.media[0];
  return `<span class="gallery-video-thumbnail">
    ${media.poster ? `<img src="${escapeHtml(media.poster)}" alt="" width="${media.width}" height="${media.height}" loading="lazy">` : productVisualMarkup(product, fallback, { className: 'gallery-thumbnail__media', sizes: '7rem' })}
    ${icon('play')}
  </span>`;
}

export function galleryMarkup(product) {
  const media = product.media.filter((item) => item.type === 'image' && (item.src || item.status === 'placeholder'));
  if (product.video?.enabled && product.video.src) media.push(product.video);

  return `<section class="product-gallery" data-product-gallery aria-label="${escapeHtml(product.title)} media">
    <div class="gallery-stage">
      <div class="gallery-stage__track" data-gallery-stage aria-live="polite">
        ${media.map((item, index) => `<div class="gallery-slide" data-gallery-slide="${escapeHtml(item.id)}" ${index ? 'hidden' : ''}>
          ${item.type === 'video' ? videoMarkup(item) : `<button class="gallery-zoom-trigger" type="button" data-gallery-zoom aria-label="Enlarge ${escapeHtml(item.caption || product.title)}">
            ${productVisualMarkup(product, item, { eager: index === 0, className: 'gallery-media', sizes: '(min-width: 64rem) 58vw, 100vw' })}
            <span class="gallery-zoom-label">${icon('zoom')} Enlarge</span>
          </button>`}
        </div>`).join('')}
      </div>
      <button class="gallery-arrow gallery-arrow--previous" type="button" data-gallery-previous aria-label="Previous image">${icon('chevronLeft')}</button>
      <button class="gallery-arrow gallery-arrow--next" type="button" data-gallery-next aria-label="Next image">${icon('chevronRight')}</button>
      <p class="gallery-count" data-gallery-count>${escapeHtml(mediaLabel(media[0], 0, media.length))}</p>
    </div>
    <div class="gallery-thumbnails" role="tablist" aria-label="Choose a product view">
      ${media.map((item, index) => `<button class="gallery-thumbnail" type="button" role="tab" data-gallery-thumbnail="${escapeHtml(item.id)}" aria-label="${escapeHtml(mediaLabel(item, index, media.length))}" aria-selected="${index === 0}" ${index === 0 ? 'aria-current="true"' : ''}>
        ${thumbnailMediaMarkup(product, item)}
        <span>${escapeHtml(item.caption)}</span>
      </button>`).join('')}
    </div>
    <dialog class="zoom-dialog" data-gallery-dialog aria-label="Enlarged product view">
      <div class="zoom-dialog__panel">
        <button class="icon-button zoom-dialog__close" type="button" data-close-gallery aria-label="Close enlarged image">${icon('close')}</button>
        ${media.filter((item) => item.type === 'image').map((item, index) => `<div class="zoom-media" data-zoom-media="${escapeHtml(item.id)}" ${index ? 'hidden' : ''}>
          ${productVisualMarkup(product, item.zoomSrc ? { ...item, src: item.zoomSrc } : item, { className: 'zoom-media__visual', sizes: '95vw' })}
          <p>${escapeHtml(item.caption)}</p>
        </div>`).join('')}
      </div>
    </dialog>
  </section>`;
}

export function initGalleries() {
  document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
    const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
    const thumbnails = [...gallery.querySelectorAll('[data-gallery-thumbnail]')];
    const zoomMedia = [...gallery.querySelectorAll('[data-zoom-media]')];
    const dialog = gallery.querySelector('[data-gallery-dialog]');
    const count = gallery.querySelector('[data-gallery-count]');
    let activeIndex = 0;
    let touchStartX = null;

    function select(index, focusThumbnail = false) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== activeIndex; });
      thumbnails.forEach((thumbnail, thumbnailIndex) => {
        const active = thumbnailIndex === activeIndex;
        thumbnail.setAttribute('aria-selected', String(active));
        if (active) thumbnail.setAttribute('aria-current', 'true');
        else thumbnail.removeAttribute('aria-current');
      });
      zoomMedia.forEach((item, itemIndex) => { item.hidden = itemIndex !== activeIndex; });
      const media = thumbnails[activeIndex];
      if (count && media) count.textContent = media.getAttribute('aria-label');
      if (focusThumbnail) thumbnails[activeIndex]?.focus({ preventScroll: true });
    }

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => select(index));
      thumbnail.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') select(0, true);
        else if (event.key === 'End') select(slides.length - 1, true);
        else select(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
    });

    gallery.querySelector('[data-gallery-previous]')?.addEventListener('click', () => select(activeIndex - 1));
    gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => select(activeIndex + 1));

    const stage = gallery.querySelector('[data-gallery-stage]');
    stage?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    stage?.addEventListener('touchend', (event) => {
      if (touchStartX == null) return;
      const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
      if (Math.abs(distance) > 44) select(activeIndex + (distance < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });

    gallery.querySelectorAll('[data-gallery-zoom]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        dialog.returnFocusElement = trigger;
        dialog.showModal();
        dialog.querySelector('[data-close-gallery]')?.focus();
        document.body.classList.add('is-locked');
      });
    });

    dialog?.querySelector('[data-close-gallery]')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog?.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
      dialog.returnFocusElement?.focus();
      dialog.returnFocusElement = null;
    });
  });
}
