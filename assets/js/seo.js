import { siteConfig } from '../../data/site.js';
import { toAbsoluteSiteUrl } from '../../data/deployment.js';
import { getVerifiedSpecifications, formatPrice } from '../../data/products.js';
import { escapeJsonForHtml } from './lib/html.js';

function absolute(path) {
  return toAbsoluteSiteUrl(path);
}

export function pageSchemas(page, product = null) {
  const schemas = [];
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    ...(absolute('/') ? { url: absolute('/') } : {}),
    ...(absolute(siteConfig.brandAssets.logoBlack) ? { logo: absolute(siteConfig.brandAssets.logoBlack) } : {}),
  };
  schemas.push(organization);

  if (product && page.type === 'product') {
    const price = formatPrice(product);
    const primaryVariant = product.variants.find((variant) => variant.enabled) ?? null;
    const offerAmount = primaryVariant?.price ?? product.price;
    const offerAvailability = primaryVariant?.availability ?? product.availability;
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      brand: { '@type': 'Brand', name: siteConfig.name },
      color: product.color,
      material: product.materialSummary,
      additionalProperty: getVerifiedSpecifications(product).map((specification) => ({
        '@type': 'PropertyValue', name: specification.label, value: specification.value,
      })),
    };
    const image = product.media.find((media) => media.src)?.src;
    if (image && absolute(image)) productSchema.image = absolute(image);
    if (product.sku) productSchema.sku = product.sku;
    if (price && offerAmount != null && offerAvailability && absolute(product.slug)) {
      productSchema.offers = {
        '@type': 'Offer', url: absolute(product.slug), price: offerAmount,
        priceCurrency: product.currency, availability: offerAvailability,
      };
    }
    schemas.push(productSchema);
  }

  if (product && ['home', 'product', 'faq'].includes(page.type) && product.faqs.length) {
    schemas.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: product.faqs.map((item) => ({
        '@type': 'Question', name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  if (siteConfig.baseUrl && page.route !== '/') {
    const items = [{ name: 'Home', path: '/' }];
    if (page.type === 'product') items.push({ name: 'Shop', path: '/shop/' });
    items.push({ name: page.heading, path: page.route });
    schemas.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path),
      })),
    });
  }

  return schemas.map((schema) => `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`).join('\n    ');
}
