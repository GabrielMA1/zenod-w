import { siteBaseUrl } from './deployment.js';
import { socialImagePath } from './media.js';

export const siteConfig = {
  name: 'ZENO DETAIL',
  shortName: 'ZENO',
  locale: 'en-US',
  baseUrl: siteBaseUrl,
  currency: 'EUR',
  storeMode: 'prelaunch',
  legalEntity: null,
  registeredAddress: null,
  registrationNumber: null,
  taxNumber: null,
  supportEmail: null,
  privacyEmail: null,
  phone: null,
  socialLinks: [],
  // Market-specific notice shown above the header. Plain operational facts only.
  announcement: {
    enabled: true,
    byMarket: {
      RO: 'Free delivery in Romania. Online ordering opens soon.',
      EU: 'Delivery across Europe, priced for your address. Online ordering opens soon.',
    },
    link: '/shipping-delivery/',
  },
  features: {
    localCart: true,
    commerceReady: false,
    checkoutReady: false,
    reviewsReady: false,
    newsletterReady: false,
    legalReady: false,
    shippingReady: false,
    shippingInfoReady: true,
    returnsReady: false,
    contactReady: false,
    productPhotographyReady: false,
    comparisonReady: false,
    guidesReady: true,
    searchReady: true,
    socialReady: false,
    analyticsReady: false,
  },
  commerce: { provider: 'stripe', checkoutUrl: null },
  shipping: {
    regions: ['Europe'],
    summary: 'Free delivery in Romania. Shipping elsewhere in Europe is priced by address.',
    romaniaCost: 0,
    otherEuropeanRates: null,
  },
  returns: { windowDays: null, summary: null },
  brandAssets: {
    logoBlack: '/assets/images/brand/zeno-logo-web-black.svg',
    logoWhite: '/assets/images/brand/zeno-logo-web-white.svg',
    symbolBlack: '/assets/images/brand/zeno-symbol-black.svg',
    symbolWhite: '/assets/images/brand/zeno-symbol-white.svg',
    socialImage: socialImagePath(),
    socialImageFuturePath: '/assets/images/social/zeno-og.webp',
  },
};

export const primaryNavigation = [
  { label: 'Drying towel', href: '/products/drying-towel/' },
  { label: 'Guides', href: '/journal/' },
  { label: 'Delivery', href: '/shipping-delivery/', feature: 'shippingInfoReady' },
  { label: 'About', href: '/about/' },
  { label: 'FAQ', href: '/faq/' },
];

export const footerNavigation = {
  Shop: [
    { label: 'ZENO Drying Towel', href: '/products/drying-towel/' },
    { label: 'All products', href: '/shop/' },
  ],
  Help: [
    { label: 'Delivery', href: '/shipping-delivery/', feature: 'shippingInfoReady' },
    { label: 'FAQ', href: '/faq/' },
    { label: 'Care guides', href: '/journal/' },
    { label: 'Contact', href: '/contact/', feature: 'contactReady' },
    { label: 'Returns', href: '/returns/', feature: 'returnsReady' },
  ],
  Company: [
    { label: 'About ZENO', href: '/about/' },
  ],
  Legal: [
    { label: 'Privacy policy', href: '/privacy/', feature: 'legalReady' },
    { label: 'Terms & conditions', href: '/terms/', feature: 'legalReady' },
    { label: 'Cookie policy', href: '/cookies/', feature: 'legalReady' },
  ],
};

// Future catalog taxonomy stays centralized, but only public categories are linked or indexed.
export const categories = [
  {
    id: 'drying',
    title: 'Drying',
    eyebrow: 'Vehicle drying',
    description: 'Tools made for the final step of a careful wash.',
    href: '/collections/drying/',
    public: true,
    productIds: ['zeno-drying-towel'],
  },
  { id: 'microfiber', title: 'Microfiber', href: '/collections/microfiber/', public: false, description: null, productIds: [] },
  { id: 'exterior', title: 'Exterior', href: '/collections/exterior/', public: false, description: null, productIds: [] },
  { id: 'interior', title: 'Interior', href: '/collections/interior/', public: false, description: null, productIds: [] },
  { id: 'protection', title: 'Protection', href: '/collections/protection/', public: false, description: null, productIds: [] },
  { id: 'accessories', title: 'Accessories', href: '/collections/accessories/', public: false, description: null, productIds: [] },
];

export function featureEnabled(feature) {
  return feature ? Boolean(siteConfig.features[feature]) : true;
}

export function visibleFooterNavigation() {
  return Object.fromEntries(
    Object.entries(footerNavigation)
      .map(([heading, links]) => [heading, links.filter((link) => featureEnabled(link.feature))])
      .filter(([, links]) => links.length),
  );
}

// Store questions shown on the FAQ page. Facts only: each answer reflects current configuration.
export const storeFaqs = [
  { question: 'Can I order now?', answer: 'Not yet. Online ordering has not opened. You can add the towel to your bag, and it stays saved on this device until ordering opens.' },
  { question: 'How much does delivery cost?', answer: 'Delivery within Romania is free. For other European addresses, shipping is calculated for the delivery address; there is no single flat rate.' },
  { question: 'Which currency are prices shown in?', answer: 'Prices are shown in RON for the Romania shopping region and in EUR for Europe / International. You can change the shopping region at any time under Language and region.' },
  { question: 'Can I read the site in one language and shop in another region?', answer: 'Yes. Language and shopping region are separate settings. For example, you can read the site in Romanian and see European prices in EUR.' },
];
