import { locales, markets } from './locales.js';
import { localizedProduct, currentLocale } from './localization.js';
import { productGallerySlots, socialImagePath } from './media.js';

export const products = [
  {
    id: 'zeno-drying-towel',
    handle: 'drying-towel',
    slug: '/products/drying-towel/',
    title: 'ZENO Drying Towel',
    name: 'ZENO Drying Towel',
    shortTitle: 'Drying Towel',
    subtitle: '850 GSM microfiber for vehicle drying',
    categoryId: 'drying',
    status: 'active',
    description: 'An 850 GSM microfiber towel designed for drying vehicles after washing. Finished in blue with black edging and ZENO branding.',
    shortDescription: 'An 850 GSM microfiber drying towel made for the final step of a careful wash.',
    heroCopy: {
      eyebrow: 'ZENO Drying Towel',
      heading: 'A better final step for every careful wash.',
      body: 'A premium microfiber towel made for vehicle drying, finished in blue with black edging.',
    },
    price: 22.85,
    regionalPrices: { EUR: 22.85, RON: 90 },
    compareAt: null,
    currency: 'EUR',
    sku: null,
    barcode: null,
    availability: null,
    inventory: null,
    purchasable: true,
    shippingClass: null,
    color: 'Blue with black edging',
    materialSummary: 'Soft microfiber construction',
    benefits: [
      { title: 'Made for drying', body: 'Designed for the final step after washing your vehicle.', icon: 'drop' },
      { title: 'Soft microfiber', body: 'A soft microfiber construction for vehicle drying.', icon: 'surface' },
      { title: 'ZENO finish', body: 'Blue microfiber, black edging and clean ZENO branding.', icon: 'edge' },
    ],
    specifications: [
      { key: 'productType', label: 'Product type', value: 'Automotive drying towel', verified: true },
      { key: 'material', label: 'Material', value: 'Soft microfiber construction', verified: true },
      { key: 'color', label: 'Colour', value: 'Blue with black edging', verified: true },
      { key: 'dimensions', label: 'Dimensions', value: null, verified: false },
      { key: 'gsm', label: 'Fabric weight', value: '850 GSM', verified: true, source: 'Owner-provided specification' },
      { key: 'blend', label: 'Microfiber blend', value: null, verified: false },
      { key: 'weave', label: 'Pile / weave', value: null, verified: false },
      { key: 'edge', label: 'Edge construction', value: null, verified: false },
      { key: 'weight', label: 'Towel weight', value: null, verified: false },
      { key: 'origin', label: 'Country of origin', value: null, verified: false },
    ],
    dimensions: null,
    gsm: 850,
    blend: null,
    weave: null,
    edge: null,
    weight: null,
    origin: null,
    colors: [{ id: 'zeno-blue', name: 'ZENO blue / black', value: null }],
    variants: [
      { id: 'single', title: 'Single towel', quantity: 1, enabled: true, price: 22.85, regionalPrices: { EUR: 22.85, RON: 90 }, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
      { id: 'two-pack', title: '2-pack', quantity: 2, enabled: false, price: null, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
      { id: 'three-pack', title: '3-pack', quantity: 3, enabled: false, price: null, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
    ],
    // Resolved from data/image-manifest.json: approved assets replace fallbacks automatically.
    media: productGallerySlots().map((image) => ({
      id: image.slotId, slot: image.slotId, type: 'image', status: image.kind, generated: image.generated,
      src: image.src, sources: image.sources, zoomSrc: image.src,
      width: image.width, height: image.height, aspectRatio: `${image.width} / ${image.height}`,
      focal: image.focal, alt: image.alt, caption: image.caption,
    })),
    video: {
      id: 'product-video', enabled: false, type: 'video', src: null, mimeType: null,
      poster: null, captions: null, width: 1920, height: 1080,
      alt: 'ZENO Drying Towel product-use video', caption: 'Product video',
    },
    care: { ready: false, instructions: [] },
    usage: { ready: false, steps: [] },
    faqs: [
      { question: 'What does 850 GSM mean?', answer: 'GSM means grams per square metre. The fabric weight specified for this towel is 850 GSM.' },
      { question: 'What is the ZENO Drying Towel for?', answer: 'It is designed for drying vehicles after washing.' },
      { question: 'What is it made from?', answer: 'The towel has a soft microfiber construction.' },
      { question: 'What colour is the towel?', answer: 'It is blue with black edging and ZENO branding.' },
    ],
    reviews: { enabled: false, provider: null, rating: null, count: 0, items: [] },
    bundles: [],
    relatedProductIds: [],
    comparison: { enabled: false, columns: [], rows: [] },
    seo: {
      title: 'ZENO 850 GSM Drying Towel | Microfiber Car Care',
      description: 'ZENO Drying Towel: 850 GSM blue microfiber with black edging, for drying your car after washing. Free delivery in Romania; shipping elsewhere in Europe priced by address.',
      image: socialImagePath(),
    },
  },
];

export function getProduct(productId, locale = currentLocale()) {
  return localizedProduct(products.find((product) => product.id === productId), locale);
}

export function getProductByHandle(handle) {
  return products.find((product) => product.handle === handle) ?? null;
}

export function getPublicVariants(product) {
  return product.variants.filter((variant) => variant.enabled);
}

export function getVerifiedSpecifications(product) {
  return product.specifications.filter((specification) => specification.verified && specification.value);
}

export function formatMoney(amount, currency, locale = typeof window !== 'undefined' ? locales[currentLocale()].format : currency === 'RON' ? 'ro-RO' : 'en-IE') {
  if (amount == null || !currency) return null;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatPrice(product, variant = null) {
  const selectedVariant = variant ?? getPublicVariants(product)[0] ?? null;
  return formatMoney(selectedVariant?.price ?? product.price, product.currency, locales[product.locale ?? 'en'].format);
}

// The configured price in every approved market, formatted for one language. The page
// renders the default market's price; the client swaps it when another market is chosen.
export function marketPrices(product, variant = null, locale = product.locale ?? 'en') {
  const selectedVariant = variant ?? getPublicVariants(product)[0] ?? null;
  const regional = selectedVariant?.regionalPrices ?? product.regionalPrices ?? {};
  return Object.fromEntries(Object.values(markets).map((market) => [
    market.id, formatMoney(regional[market.currency], market.currency, locales[locale].format),
  ]));
}
