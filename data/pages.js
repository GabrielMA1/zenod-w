const suffix = ' | ZENO DETAIL';

export const pages = [
  {
    route: '/', output: 'index.html', id: 'home', type: 'home',
    title: 'ZENO DETAIL | Premium Car-Care Products',
    description: 'Discover the ZENO Drying Towel, a soft microfiber towel made for vehicle drying.',
    heading: 'A better final step for every careful wash.',
    intro: 'Premium microfiber made for vehicle drying.',
  },
  {
    route: '/shop/', output: 'shop/index.html', id: 'shop', type: 'collection', collection: 'all-products',
    title: `Shop premium car-care products${suffix}`,
    description: 'Shop the ZENO Drying Towel, a premium microfiber towel made for drying vehicles.',
    heading: 'Shop ZENO', intro: 'Discover the ZENO Drying Towel.',
  },
  {
    route: '/collections/all-products/', output: 'collections/all-products/index.html', id: 'all-products',
    type: 'collection', collection: 'all-products', noindex: true,
    title: `All products${suffix}`,
    description: 'Explore ZENO DETAIL car-care products.',
    heading: 'Shop ZENO', intro: 'Discover the ZENO Drying Towel.',
  },
  {
    route: '/collections/drying/', output: 'collections/drying/index.html', id: 'drying',
    type: 'collection', collection: 'drying', noindex: true,
    title: `Automotive drying products${suffix}`,
    description: 'Explore the ZENO Drying Towel, made from soft microfiber for vehicle drying.',
    heading: 'Vehicle drying', intro: 'A focused tool for the final step of the wash.',
  },
  ...['microfiber', 'exterior', 'interior', 'protection', 'accessories'].map((collection) => ({
    route: `/collections/${collection}/`, output: `collections/${collection}/index.html`, id: collection,
    type: 'unavailable', collection, noindex: true, public: false,
    title: `${collection[0].toUpperCase()}${collection.slice(1)} page not found${suffix}`,
    description: `We couldn’t find the requested ${collection} page.`,
    heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  })),
  {
    route: '/products/drying-towel/', output: 'products/drying-towel/index.html', id: 'drying-towel',
    type: 'product', product: 'zeno-drying-towel',
    title: 'ZENO Drying Towel | Microfiber Car Drying Towel',
    description: 'Discover the ZENO Drying Towel, made from soft microfiber and finished in blue with black edging.',
    heading: 'ZENO Drying Towel', intro: 'Premium microfiber for vehicle drying.',
  },
  {
    route: '/about/', output: 'about/index.html', id: 'about', type: 'about',
    title: `About ZENO DETAIL${suffix}`,
    description: 'ZENO DETAIL creates premium car-care products around clear jobs, thoughtful materials and straightforward value.',
    heading: 'Care, with a clear purpose.', intro: 'Car-care products designed around the work they need to do.',
  },
  {
    route: '/faq/', output: 'faq/index.html', id: 'faq', type: 'faq',
    title: `Drying Towel FAQ${suffix}`,
    description: 'Clear answers about the ZENO Drying Towel, its purpose, material and finish.',
    heading: 'Drying towel questions.', intro: 'The essentials about the ZENO Drying Towel.',
  },
  {
    route: '/contact/', output: 'contact/index.html', id: 'contact', type: 'unavailable', feature: 'contactReady',
    noindex: true, public: false, title: `Contact page not found${suffix}`,
    description: 'We couldn’t find the requested contact page.', heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  },
  {
    route: '/shipping-delivery/', output: 'shipping-delivery/index.html', id: 'shipping', type: 'unavailable',
    feature: 'shippingReady', noindex: true, public: false, title: `Shipping page not found${suffix}`,
    description: 'We couldn’t find the requested shipping and delivery page.', heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  },
  {
    route: '/returns/', output: 'returns/index.html', id: 'returns', type: 'unavailable', feature: 'returnsReady',
    noindex: true, public: false, title: `Returns page not found${suffix}`,
    description: 'We couldn’t find the requested returns page.', heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  },
  ...[
    ['privacy', '/privacy/', 'privacy/index.html'],
    ['terms', '/terms/', 'terms/index.html'],
    ['cookies', '/cookies/', 'cookies/index.html'],
  ].map(([id, route, output]) => ({
    route, output, id, type: 'unavailable', feature: 'legalReady', noindex: true, public: false,
    title: `${id[0].toUpperCase()}${id.slice(1)} page not found${suffix}`,
    description: `We couldn’t find the requested ${id} page.`, heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  })),
  {
    route: '/404.html', output: '404.html', id: 'not-found', type: 'not-found', noindex: true, public: false,
    title: `Page not found${suffix}`,
    description: 'The requested ZENO DETAIL page could not be found.',
    heading: 'Page not found.', intro: 'We couldn’t find the page you requested.',
  },
];

export function getPage(route) {
  return pages.find((page) => page.route === route) ?? pages.find((page) => page.id === 'not-found');
}
