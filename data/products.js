import { localizedProduct, currentLocale } from './localization.js';

export const products = [
  {
    id: 'zeno-drying-towel',
    handle: 'drying-towel',
    slug: '/products/drying-towel/',
    title: 'ZENO Drying Towel',
    name: 'ZENO Drying Towel',
    shortTitle: 'Drying Towel',
    subtitle: 'Premium microfiber for vehicle drying',
    categoryId: 'drying',
    status: 'active',
    description: 'A soft microfiber towel designed for drying vehicles after washing. Finished in blue with black edging and ZENO branding.',
    shortDescription: 'A soft microfiber drying towel made for the final step of a careful wash.',
    heroCopy: {
      eyebrow: 'ZENO Drying Towel',
      heading: 'A better final step for every careful wash.',
      body: 'A premium microfiber towel made for vehicle drying, finished in blue with black edging.',
    },
    price: 18,
    regionalPrices: { EUR: 18, RON: 90 },
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
      { key: 'color', label: 'Color', value: 'Blue with black edging', verified: true },
      { key: 'dimensions', label: 'Dimensions', value: null, verified: false },
      { key: 'gsm', label: 'GSM', value: null, verified: false },
      { key: 'blend', label: 'Microfiber blend', value: null, verified: false },
      { key: 'weave', label: 'Pile / weave', value: null, verified: false },
      { key: 'edge', label: 'Edge construction', value: null, verified: false },
      { key: 'weight', label: 'Towel weight', value: null, verified: false },
      { key: 'origin', label: 'Country of origin', value: null, verified: false },
    ],
    dimensions: null,
    gsm: null,
    blend: null,
    weave: null,
    edge: null,
    weight: null,
    origin: null,
    colors: [{ id: 'zeno-blue', name: 'ZENO blue / black', value: null }],
    variants: [
      { id: 'single', title: 'Single towel', quantity: 1, enabled: true, price: 18, regionalPrices: { EUR: 18, RON: 90 }, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
      { id: 'two-pack', title: '2-pack', quantity: 2, enabled: false, price: null, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
      { id: 'three-pack', title: '3-pack', quantity: 3, enabled: false, price: null, compareAt: null, perUnitPrice: null, savings: null, badge: null, sku: null, barcode: null, availability: null, inventory: null, shippingClass: null },
    ],
    media: [
      {
        id: 'hero', type: 'image', status: 'illustration', generated: true,
        src: '/assets/images/editorial/drying-towel-1024.webp',
        sources: {
          avif: [480, 768, 1024].map((width) => ({ src: `/assets/images/editorial/drying-towel-${width}.avif`, width })),
          webp: [480, 768, 1024].map((width) => ({ src: `/assets/images/editorial/drying-towel-${width}.webp`, width })),
        },
        zoomSrc: '/assets/images/editorial/drying-towel-1024.webp',
        width: 1024, height: 1024, aspectRatio: '1 / 1',
        alt: 'Product visualisation of the blue ZENO DETAIL microfiber drying towel with black edging',
        caption: 'The ZENO drying towel',
      },
      {
        id: 'detail', type: 'image', status: 'illustration', generated: true,
        src: '/assets/images/editorial/towel-detail-1024.webp',
        sources: {
          avif: [480, 768, 1024].map((width) => ({ src: `/assets/images/editorial/towel-detail-${width}.avif`, width })),
          webp: [480, 768, 1024].map((width) => ({ src: `/assets/images/editorial/towel-detail-${width}.webp`, width })),
        },
        zoomSrc: '/assets/images/editorial/towel-detail-1024.webp',
        width: 1024, height: 1024, aspectRatio: '1 / 1',
        alt: 'Product visualisation of blue microfiber, black edging and the ZENO DETAIL logo',
        caption: 'A closer look',
      },
      {
        id: 'in-context', type: 'image', status: 'illustration', generated: true,
        src: '/assets/images/editorial/drying-moment-1536.webp',
        sources: {
          avif: [480, 960, 1536].map((width) => ({ src: `/assets/images/editorial/drying-moment-${width}.avif`, width })),
          webp: [480, 960, 1536].map((width) => ({ src: `/assets/images/editorial/drying-moment-${width}.webp`, width })),
        },
        zoomSrc: '/assets/images/editorial/drying-moment-1536.webp',
        width: 1536, height: 1024, aspectRatio: '3 / 2',
        alt: 'Product visualisation of the ZENO DETAIL towel on a freshly washed car',
        caption: 'In your routine',
      },
    ],
    video: {
      id: 'product-video', enabled: false, type: 'video', src: null, mimeType: null,
      poster: null, captions: null, width: 1920, height: 1080,
      alt: 'ZENO Drying Towel product-use video', caption: 'Product video',
    },
    care: { ready: false, instructions: [] },
    usage: { ready: false, steps: [] },
    faqs: [
      { question: 'What is the ZENO Drying Towel for?', answer: 'It is designed for drying vehicles after washing.' },
      { question: 'What is it made from?', answer: 'The towel has a soft microfiber construction.' },
      { question: 'What color is the towel?', answer: 'It is blue with black edging and ZENO branding.' },
    ],
    reviews: { enabled: false, provider: null, rating: null, count: 0, items: [] },
    bundles: [],
    relatedProductIds: [],
    comparison: { enabled: false, columns: [], rows: [] },
    seo: {
      title: 'ZENO Drying Towel | Microfiber Car Drying Towel',
      description: 'Discover the ZENO Drying Towel, made from soft microfiber and finished in blue with black edging.',
      image: '/assets/images/editorial/drying-towel-1024.webp',
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

export function formatMoney(amount, currency, locale = currency === 'RON' ? 'ro-RO' : 'en-IE') {
  if (amount == null || !currency) return null;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatPrice(product, variant = null) {
  const selectedVariant = variant ?? getPublicVariants(product)[0] ?? null;
  return formatMoney(selectedVariant?.price ?? product.price, product.currency);
}
