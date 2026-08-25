import { siteBaseUrl } from './deployment.js';

export const siteConfig = {
  name: 'ZENO DETAIL',
  shortName: 'ZENO',
  locale: 'en-US',
  baseUrl: siteBaseUrl,
  currency: null,
  storeMode: 'prelaunch',
  legalEntity: null,
  registeredAddress: null,
  registrationNumber: null,
  taxNumber: null,
  supportEmail: null,
  privacyEmail: null,
  phone: null,
  socialLinks: [],
  announcement: { enabled: false, text: null, link: null },
  features: {
    localCart: true,
    commerceReady: false,
    checkoutReady: false,
    reviewsReady: false,
    newsletterReady: false,
    legalReady: false,
    shippingReady: false,
    returnsReady: false,
    contactReady: false,
    productPhotographyReady: false,
    comparisonReady: false,
    guidesReady: false,
    searchReady: false,
    socialReady: false,
    analyticsReady: false,
  },
  commerce: { provider: null, checkoutUrl: null },
  shipping: { regions: [], summary: null },
  returns: { windowDays: null, summary: null },
  brandAssets: {
    logoBlack: '/assets/images/brand/zeno-logo-web-black.svg',
    logoWhite: '/assets/images/brand/zeno-logo-web-white.svg',
    symbolBlack: '/assets/images/brand/zeno-symbol-black.svg',
    symbolWhite: '/assets/images/brand/zeno-symbol-white.svg',
    socialImage: null,
    socialImageFuturePath: '/assets/images/social/zeno-og.webp',
  },
};

export const primaryNavigation = [
  { label: 'Shop', href: '/shop/' },
  { label: 'Drying Towel', href: '/products/drying-towel/' },
  { label: 'Why ZENO', href: '/#why-zeno' },
  { label: 'About', href: '/about/' },
  { label: 'FAQ', href: '/faq/' },
];

export const footerNavigation = {
  Shop: [
    { label: 'ZENO Drying Towel', href: '/products/drying-towel/' },
    { label: 'Shop', href: '/shop/' },
  ],
  Explore: [
    { label: 'Why ZENO', href: '/#why-zeno' },
    { label: 'About ZENO', href: '/about/' },
    { label: 'FAQ', href: '/faq/' },
  ],
  Support: [
    { label: 'Contact', href: '/contact/', feature: 'contactReady' },
    { label: 'Shipping & delivery', href: '/shipping-delivery/', feature: 'shippingReady' },
    { label: 'Returns', href: '/returns/', feature: 'returnsReady' },
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
