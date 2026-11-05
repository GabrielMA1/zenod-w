import { escapeHtml } from '../lib/html.js';
import { toSitePath } from '../../../data/deployment.js';
import { icon } from './icons.js';
import { hasIllustratedMedia, productVisualMarkup } from './product.js';

function mediaLabel(media, index, count) {
  return `${media.caption || media.alt || 'Product view'}, ${index + 1} of ${count}`;
}

function videoMarkup(media) {
  return `<figure class="gallery__video">
    <video controls preload="metadata" ${media.poster ? `poster="${escapeHtml(toSitePath(media.poster))}"` : ''} width="${media.width}" height="${media.height}" aria-label="${escapeHtml(media.alt)}">
      <source src="${escapeHtml(toSitePath(media.src))}"${media.mimeType ? ` type="${escapeHtml(media.mimeType)}"` : ''}>
      ${media.captions ? `<track kind="captions" src="${escapeHtml(toSitePath(media.captions))}" srclang="en" label="English" default>` : ''}
    </video>
  </figure>`;
}

export function galleryMarkup(product) {
  const media = product.media.filter((item) => item.type === 'image' && item.src);
  if (product.video?.enabled && product.video.src) media.push(product.video);
  const many = media.length > 1;

  return `<section class="gallery" data-product-gallery aria-label="${escapeHtml(product.title)} images">
    <div class="gallery__stage" data-gallery-stage>
      ${media.map((item, index) => `<div class="gallery__slide" data-gallery-slide="${escapeHtml(item.id)}" ${index ? 'hidden' : ''}>
        ${item.type === 'video' ? videoMarkup(item) : `<button class="gallery__zoom" type="button" data-gallery-zoom aria-label="Enlarge ${escapeHtml(item.caption || product.title)}">
          ${productVisualMarkup(product, item, { eager: index === 0, className: 'gallery__media', sizes: '(min-width: 64rem) 52vw, 100vw' })}
          <span class="gallery__zoom-hint">${icon('zoom')}<span>Enlarge</span></span>
        </button>`}
      </div>`).join('')}
      ${many ? `<button class="gallery__arrow gallery__arrow--previous" type="button" data-gallery-previous aria-label="Previous image">${icon('chevronLeft')}</button>
      <button class="gallery__arrow gallery__arrow--next" type="button" data-gallery-next aria-label="Next image">${icon('chevronRight')}</button>` : ''}
      <p class="gallery__count" data-gallery-count aria-live="polite">${escapeHtml(mediaLabel(media[0], 0, media.length))}</p>
    </div>
    ${many ? `<div class="gallery__thumbs" aria-label="Choose a product view">
      ${media.map((item, index) => `<button class="gallery__thumb" type="button" data-gallery-thumbnail="${escapeHtml(item.id)}" aria-label="${escapeHtml(mediaLabel(item, index, media.length))}" ${index === 0 ? 'aria-current="true"' : ''}>
        ${productVisualMarkup(product, item, { className: 'gallery__thumb-media', sizes: '6rem', alt: '' })}
      </button>`).join('')}
    </div>` : ''}
    ${hasIllustratedMedia(product) ? '<p class="gallery__note">Product visualisations. Final product details may vary.</p>' : ''}
    <dialog class="zoom" data-gallery-dialog aria-label="Enlarged product view">
      <div class="zoom__panel">
        <button class="icon-button zoom__close" type="button" data-close-gallery aria-label="Close enlarged image">${icon('close')}</button>
        ${media.filter((item) => item.type === 'image').map((item, index) => `<figure class="zoom__media" data-zoom-media="${escapeHtml(item.id)}" ${index ? 'hidden' : ''}>
          <img src="${escapeHtml(toSitePath(item.zoomSrc || item.src))}" alt="${escapeHtml(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async">
          <figcaption>${escapeHtml(item.caption)}</figcaption>
        </figure>`).join('')}
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
        if (thumbnailIndex === activeIndex) thumbnail.setAttribute('aria-current', 'true');
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
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') select(0, true);
        else if (event.key === 'End') select(slides.length - 1, true);
        else select(activeIndex + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1), true);
      });
    });

    gallery.querySelector('[data-gallery-previous]')?.addEventListener('click', () => select(activeIndex - 1));
    gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => select(activeIndex + 1));

    const stage = gallery.querySelector('[data-gallery-stage]');
    stage?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
    stage?.addEventListener('touchend', (event) => {
      if (touchStartX == null || slides.length < 2) return;
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
