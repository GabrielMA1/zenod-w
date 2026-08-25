import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../data/pages.js';
import {
  formatMoney,
  getPublicVariants,
  getVerifiedSpecifications,
  products,
} from '../data/products.js';
import { categories, footerNavigation, primaryNavigation, siteConfig } from '../data/site.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const notices = [];
const htmlByRoute = new Map();
const generatedOrigin = 'https://audit.zeno.invalid';

const forbiddenConsumerPhrases = [
  'launch preview',
  'photography pending',
  'css product preview',
  'cart preview',
  'preview item',
  'add to cart preview',
  'checkout integration pending',
  'no data is transmitted',
  'no invented figures',
  'verified specifications only',
  'future range',
  'range roadmap',
  'draft template',
  'guide planned',
  'category in development',
  'price confirmed at launch',
  'launch information in progress',
  'legal entity details pending',
  'support details being',
  'reviews will be',
  'business information required',
  'not a detailing service',
  'specifications remain hidden',
];

function fail(message) {
  failures.push(message);
}

function notice(message) {
  notices.push(message);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtml(value) {
  return String(value)
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function normalizeText(value) {
  return decodeHtml(String(value ?? ''))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(attributes, name) {
  const escapedName = escapeRegExp(name);
  const match = attributes.match(new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function hasAttribute(attributes, name) {
  return new RegExp(`(?:^|\\s)${escapeRegExp(name)}(?:\\s|=|$)`, 'i').test(attributes);
}

function capture(source, pattern, group = 1) {
  return [...source.matchAll(pattern)].map((match) => match[group]);
}

function uniqueValues(items, label, identity = (item) => item) {
  const occurrences = new Map();
  for (const item of items) {
    const value = identity(item);
    if (value == null || value === '') {
      fail(`Missing ${label}.`);
      continue;
    }
    const owner = item.output ?? item.id ?? value;
    occurrences.set(value, [...(occurrences.get(value) ?? []), owner]);
  }
  for (const [value, owners] of occurrences) {
    if (owners.length > 1) fail(`Duplicate ${label} "${value}" (${owners.join(', ')}).`);
  }
}

function isFeatureEnabled(feature) {
  return !feature || Boolean(siteConfig.features?.[feature]);
}

function isInactivePage(page) {
  return Boolean(page.feature && !isFeatureEnabled(page.feature));
}

function isIndexedPage(page) {
  return !page.noindex && !isInactivePage(page) && page.public !== false;
}

function cleanRoutePath(pathname) {
  if (pathname === '/') return '/';
  if (pathname.endsWith('.html')) return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function pageForPathname(pathname) {
  return pages.find((page) => page.route === pathname)
    ?? pages.find((page) => cleanRoutePath(page.route) === cleanRoutePath(pathname));
}

function localUrl(value, pageRoute = '/') {
  if (!value || /^(?:mailto:|tel:|data:|blob:|javascript:)/i.test(value)) return null;
  let parsed;
  try {
    parsed = new URL(value, new URL(pageRoute, generatedOrigin));
  } catch {
    return null;
  }
  return parsed.origin === generatedOrigin ? parsed : null;
}

function localFileForPathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const localPath = decoded.replace(/^\/+/, '');
  const candidates = [resolve(projectRoot, localPath), resolve(projectRoot, 'public', localPath)];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function routeOrAssetExists(value, pageRoute = '/') {
  if (!value || value === '#') return false;
  if (/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(value)) return true;
  const parsed = localUrl(value, pageRoute);
  if (!parsed) return false;
  return Boolean(pageForPathname(parsed.pathname) || localFileForPathname(parsed.pathname));
}

function anchorExists(value, pageRoute = '/') {
  const parsed = localUrl(value, pageRoute);
  if (!parsed || !parsed.hash) return true;
  const targetPage = pageForPathname(parsed.pathname);
  if (!targetPage) return true;
  const targetHtml = htmlByRoute.get(targetPage.route);
  if (!targetHtml) return false;
  let id;
  try {
    id = decodeURIComponent(parsed.hash.slice(1));
  } catch {
    return false;
  }
  return new RegExp(`\\sid=(?:"${escapeRegExp(id)}"|'${escapeRegExp(id)}')`, 'i').test(targetHtml);
}

function hasNoindex(html) {
  return [...html.matchAll(/<meta\b([^>]*)>/gi)].some((match) => {
    const name = attribute(match[1], 'name');
    const content = attribute(match[1], 'content');
    return name?.toLowerCase() === 'robots' && /(?:^|,)\s*noindex\b/i.test(content ?? '');
  });
}

function visibleBodyText(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  return normalizeText(body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' '));
}

function staticElementContent(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? null;
}

function anchorHrefs(fragment) {
  return [...String(fragment ?? '').matchAll(/<a\b([^>]*)>/gi)]
    .map((match) => attribute(match[1], 'href'))
    .filter(Boolean);
}

function generatedAssetReferences(html) {
  const references = [];
  for (const match of html.matchAll(/<(?:img|script|source|video|audio|iframe)\b([^>]*)>/gi)) {
    for (const name of ['src', 'poster']) {
      const value = attribute(match[1], name);
      if (value) references.push({ name, value });
    }
    const srcset = attribute(match[1], 'srcset');
    if (srcset) {
      for (const candidate of srcset.split(',')) {
        const value = candidate.trim().split(/\s+/)[0];
        if (value) references.push({ name: 'srcset', value });
      }
    }
  }
  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    const href = attribute(match[1], 'href');
    const rel = attribute(match[1], 'rel')?.toLowerCase() ?? '';
    if (href && !rel.includes('canonical')) references.push({ name: 'href', value: href });
  }
  return references;
}

function isWrappedByLabel(html, elementIndex) {
  const before = html.slice(0, elementIndex).toLowerCase();
  const lastOpen = before.lastIndexOf('<label');
  const lastClose = before.lastIndexOf('</label>');
  return lastOpen > lastClose && html.toLowerCase().indexOf('</label>', elementIndex) !== -1;
}

function checkGeneratedAccessibility(html, page) {
  const ids = capture(html, /\sid\s*=\s*["']([^"']+)["']/gi);
  const idSet = new Set(ids);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) fail(`${page.output}: duplicate IDs: ${duplicates.join(', ')}.`);

  for (const match of html.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    const [,, attributes] = match;
    for (const name of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      const references = attribute(attributes, name)?.trim().split(/\s+/).filter(Boolean) ?? [];
      for (const reference of references) {
        if (!idSet.has(reference)) fail(`${page.output}: ${name} references missing ID "${reference}".`);
      }
    }
  }

  for (const match of html.matchAll(/<label\b([^>]*)>/gi)) {
    const target = attribute(match[1], 'for');
    if (target && !idSet.has(target)) fail(`${page.output}: label references missing control ID "${target}".`);
  }

  for (const match of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const [, tag, attributes] = match;
    if (tag.toLowerCase() === 'input' && attribute(attributes, 'type')?.toLowerCase() === 'hidden') continue;
    const id = attribute(attributes, 'id');
    const ariaLabel = attribute(attributes, 'aria-label');
    const labelledBy = attribute(attributes, 'aria-labelledby');
    const hasForLabel = id && new RegExp(`<label\\b[^>]*\\bfor\\s*=\\s*(?:"${escapeRegExp(id)}"|'${escapeRegExp(id)}')`, 'i').test(html);
    const validLabelledBy = labelledBy && labelledBy.split(/\s+/).every((labelId) => idSet.has(labelId));
    if (!ariaLabel?.trim() && !validLabelledBy && !hasForLabel && !isWrappedByLabel(html, match.index)) {
      fail(`${page.output}: <${tag.toLowerCase()}>${id ? `#${id}` : ''} has no accessible label.`);
    }
  }

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const attributes = match[1];
    const text = normalizeText(match[2].replace(/<svg\b[\s\S]*?<\/svg>/gi, ' '));
    const labelledBy = attribute(attributes, 'aria-labelledby');
    const validLabelledBy = labelledBy && labelledBy.split(/\s+/).every((labelId) => idSet.has(labelId));
    if (!text && !attribute(attributes, 'aria-label')?.trim() && !attribute(attributes, 'title')?.trim() && !validLabelledBy) {
      fail(`${page.output}: button without an accessible name.`);
    }
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attributes = match[1];
    const text = normalizeText(match[2].replace(/<svg\b[\s\S]*?<\/svg>/gi, ' '));
    const labelledBy = attribute(attributes, 'aria-labelledby');
    const validLabelledBy = labelledBy && labelledBy.split(/\s+/).every((labelId) => idSet.has(labelId));
    if (!text && !attribute(attributes, 'aria-label')?.trim() && !attribute(attributes, 'title')?.trim() && !validLabelledBy) {
      fail(`${page.output}: link without an accessible name.`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!hasAttribute(match[1], 'alt')) fail(`${page.output}: image without an alt attribute.`);
    const width = Number(attribute(match[1], 'width'));
    const height = Number(attribute(match[1], 'height'));
    if (!Number.isInteger(width) || width <= 0) fail(`${page.output}: image is missing a positive integer width.`);
    if (!Number.isInteger(height) || height <= 0) fail(`${page.output}: image is missing a positive integer height.`);
  }

  for (const match of html.matchAll(/<dialog\b([^>]*)>/gi)) {
    const attributes = match[1];
    const labelledBy = attribute(attributes, 'aria-labelledby');
    const validLabelledBy = labelledBy && labelledBy.split(/\s+/).every((labelId) => idSet.has(labelId));
    if (!attribute(attributes, 'aria-label')?.trim() && !validLabelledBy) {
      fail(`${page.output}: dialog${attribute(attributes, 'id') ? `#${attribute(attributes, 'id')}` : ''} has no valid accessible name.`);
    }
  }
}

function readStructuredData(html, page) {
  const values = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attribute(match[1], 'type')?.toLowerCase() !== 'application/ld+json') continue;
    try {
      values.push(JSON.parse(decodeHtml(match[2])));
    } catch (error) {
      fail(`${page.output}: invalid JSON-LD (${error.message}).`);
    }
  }
  return values;
}

function schemaNodes(values) {
  const output = [];
  function visit(value) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (value['@type']) output.push(value);
    if (Array.isArray(value['@graph'])) value['@graph'].forEach(visit);
  }
  values.forEach(visit);
  return output;
}

function schemasOfType(nodes, type) {
  return nodes.filter((node) => {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    return types.includes(type);
  });
}

function requireVisibleSchemaText(value, bodyText, page, field) {
  const expected = normalizeText(value);
  if (expected && !bodyText.toLocaleLowerCase(siteConfig.locale).includes(expected.toLocaleLowerCase(siteConfig.locale))) {
    fail(`${page.output}: JSON-LD ${field} is not present in visible page content.`);
  }
}

function effectiveProductPrice(product) {
  const variant = getPublicVariants(product).find((item) => item.price != null);
  return variant?.price ?? product.price ?? null;
}

function checkProductSchema(page, html, nodes) {
  const product = products.find((item) => item.id === page.product);
  if (!product) return;
  const productSchemas = schemasOfType(nodes, 'Product');
  if (productSchemas.length !== 1) {
    fail(`${page.output}: expected exactly one Product JSON-LD object, found ${productSchemas.length}.`);
    return;
  }

  const schema = productSchemas[0];
  const bodyText = visibleBodyText(html);
  const expectedName = product.title ?? product.name;
  if (schema.name !== expectedName) fail(`${page.output}: Product schema name does not match product data.`);
  if (![product.description, product.shortDescription].filter(Boolean).includes(schema.description)) {
    fail(`${page.output}: Product schema description is not a product-data description.`);
  }
  requireVisibleSchemaText(schema.name, bodyText, page, 'name');
  requireVisibleSchemaText(schema.description, bodyText, page, 'description');

  const verifiedSpecs = getVerifiedSpecifications(product);
  const verifiedValues = new Set(verifiedSpecs.map((specification) => normalizeText(specification.value).toLowerCase()));
  for (const [field, value] of [['material', schema.material], ['color', schema.color]]) {
    if (!value) continue;
    const normalized = normalizeText(value).toLowerCase();
    const supported = verifiedValues.has(normalized)
      || [product.materialSummary, product.color].filter(Boolean).some((item) => normalizeText(item).toLowerCase() === normalized);
    if (!supported) fail(`${page.output}: Product schema ${field} is not backed by verified product data.`);
    requireVisibleSchemaText(value, bodyText, page, field);
  }

  const verifiedPropertyPairs = new Set(verifiedSpecs.map((specification) => `${normalizeText(specification.label)}\u0000${normalizeText(specification.value)}`));
  const additionalProperties = schema.additionalProperty == null
    ? []
    : Array.isArray(schema.additionalProperty) ? schema.additionalProperty : [schema.additionalProperty];
  for (const property of additionalProperties) {
    const pair = `${normalizeText(property.name)}\u0000${normalizeText(property.value)}`;
    if (!verifiedPropertyPairs.has(pair)) fail(`${page.output}: Product schema contains an unverified additionalProperty.`);
    requireVisibleSchemaText(property.name, bodyText, page, 'specification label');
    requireVisibleSchemaText(property.value, bodyText, page, 'specification value');
  }

  const offers = Array.isArray(schema.offers) ? schema.offers : schema.offers ? [schema.offers] : [];
  const price = effectiveProductPrice(product);
  if (offers.length && (price == null || !product.currency)) {
    fail(`${page.output}: Product schema publishes an offer without a configured price and currency.`);
  }
  for (const offer of offers) {
    if (Number(offer.price) !== Number(price)) fail(`${page.output}: Product schema offer price does not match visible product data.`);
    if (offer.priceCurrency !== product.currency) fail(`${page.output}: Product schema offer currency does not match product data.`);
    const formatted = price == null ? null : formatMoney(price, product.currency, siteConfig.locale);
    if (formatted && !bodyText.includes(formatted) && !bodyText.includes(String(price))) {
      fail(`${page.output}: Product schema offer price is not visible on the page.`);
    }
  }

  const reviewReady = Boolean(siteConfig.features?.reviewsReady && product.reviews?.enabled && product.reviews?.count > 0);
  if (!reviewReady && (schema.aggregateRating || schema.review)) {
    fail(`${page.output}: Product schema contains review data while reviews are not public.`);
  }
  const realMedia = (product.media ?? []).filter((media) => media.src);
  if (!realMedia.length && schema.image) fail(`${page.output}: Product schema publishes an image while product media is unset.`);
}

function checkFaqSchema(page, html, nodes) {
  const faqSchemas = schemasOfType(nodes, 'FAQPage');
  if (page.type === 'faq' && !faqSchemas.length) fail(`${page.output}: public FAQ page is missing FAQPage JSON-LD.`);
  if (faqSchemas.length > 1) fail(`${page.output}: more than one FAQPage JSON-LD object is present.`);
  if (!faqSchemas.length) return;

  const bodyText = visibleBodyText(html);
  const allowedFaqs = page.product
    ? (products.find((product) => product.id === page.product)?.faqs ?? [])
    : products.flatMap((product) => ['active', 'published'].includes(product.status) ? product.faqs ?? [] : []);
  const allowedPairs = new Set(allowedFaqs
    .filter((faq) => faq.question?.trim() && faq.answer?.trim())
    .map((faq) => `${normalizeText(faq.question)}\u0000${normalizeText(faq.answer)}`));
  const entities = faqSchemas[0].mainEntity ?? [];
  if (!Array.isArray(entities) || !entities.length) fail(`${page.output}: FAQPage schema has no questions.`);
  for (const entity of Array.isArray(entities) ? entities : []) {
    const question = normalizeText(entity.name);
    const answer = normalizeText(entity.acceptedAnswer?.text);
    if (!question || !answer) {
      fail(`${page.output}: FAQPage schema contains an unanswered question.`);
      continue;
    }
    if (!allowedPairs.has(`${question}\u0000${answer}`)) fail(`${page.output}: FAQ schema contains copy not backed by answered product FAQ data.`);
    requireVisibleSchemaText(question, bodyText, page, 'question');
    requireVisibleSchemaText(answer, bodyText, page, 'answer');
  }
}

function checkGeneratedPage(page, html) {
  const title = normalizeText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description = [...html.matchAll(/<meta\b([^>]*)>/gi)]
    .find((match) => attribute(match[1], 'name')?.toLowerCase() === 'description');
  const descriptionContent = normalizeText(description ? attribute(description[1], 'content') : '');
  if (title !== page.title) fail(`${page.output}: generated title does not match data/pages.js.`);
  if (descriptionContent !== page.description) fail(`${page.output}: generated meta description does not match data/pages.js.`);
  const language = attribute(html.match(/<html\b([^>]*)>/i)?.[1] ?? '', 'lang');
  if (language !== siteConfig.locale) fail(`${page.output}: html lang does not match siteConfig.locale.`);

  const canonicalLinks = [...html.matchAll(/<link\b([^>]*)>/gi)]
    .filter((match) => attribute(match[1], 'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
  const expectedCanonical = siteConfig.baseUrl ? new URL(page.route, siteConfig.baseUrl).href : null;
  if (canonicalLinks.length !== 1) fail(`${page.output}: expected exactly one canonical link.`);
  else {
    const canonicalHref = attribute(canonicalLinks[0][1], 'href');
    if (expectedCanonical && canonicalHref !== expectedCanonical) fail(`${page.output}: canonical URL does not match the configured route.`);
    if (!expectedCanonical && canonicalHref) fail(`${page.output}: local build must not emit a relative or invented canonical URL.`);
    if (attribute(canonicalLinks[0][1], 'data-canonical-path') !== page.route) fail(`${page.output}: canonical route data does not match the page route.`);
  }
  const ogUrl = [...html.matchAll(/<meta\b([^>]*)>/gi)]
    .find((match) => attribute(match[1], 'property')?.toLowerCase() === 'og:url');
  if (expectedCanonical && (!ogUrl || attribute(ogUrl[1], 'content') !== expectedCanonical)) fail(`${page.output}: og:url does not match the canonical URL.`);
  if (!expectedCanonical && ogUrl) fail(`${page.output}: local build must not emit a relative or invented og:url.`);

  if (isInactivePage(page) && !hasNoindex(html)) fail(`${page.output}: inactive ${page.feature} page must be noindex.`);
  if ((page.noindex || page.public === false) && !hasNoindex(html)) fail(`${page.output}: non-public page must be noindex.`);
  if (!page.noindex && page.public !== false && !isInactivePage(page) && hasNoindex(html)) fail(`${page.output}: indexable page unexpectedly contains noindex.`);

  const header = staticElementContent(html, 'header');
  const footer = staticElementContent(html, 'footer');
  const main = staticElementContent(html, 'main');
  if ((html.match(/<header\b/gi)?.length ?? 0) !== 1) fail(`${page.output}: generated HTML must contain exactly one header.`);
  if ((html.match(/<footer\b/gi)?.length ?? 0) !== 1) fail(`${page.output}: generated HTML must contain exactly one footer.`);
  if ((html.match(/<main\b/gi)?.length ?? 0) !== 1) fail(`${page.output}: generated HTML must contain exactly one main landmark.`);
  if (header == null || (!normalizeText(header) && !/<(?:img|svg)\b/i.test(header))) fail(`${page.output}: generated HTML has no static header content.`);
  if (footer == null || !normalizeText(footer)) fail(`${page.output}: generated HTML has no static footer content.`);
  if (main == null || !normalizeText(main)) fail(`${page.output}: generated HTML has no static main content.`);
  if (!/<main\b[^>]*\bid\s*=\s*["']main-content["']/i.test(html)) fail(`${page.output}: main landmark is missing id="main-content".`);
  const h1Count = (main ?? '').match(/<h1\b/gi)?.length ?? 0;
  if (h1Count !== 1) fail(`${page.output}: generated main content must contain exactly one H1 (found ${h1Count}).`);
  const documentH1Count = html.match(/<h1\b/gi)?.length ?? 0;
  if (documentH1Count !== 1) fail(`${page.output}: generated document must contain exactly one H1 (found ${documentH1Count}).`);

  const headerHrefs = anchorHrefs(header);
  const footerHrefs = anchorHrefs(footer);
  for (const link of primaryNavigation) {
    const expected = link.public !== false && isFeatureEnabled(link.feature);
    if (expected && !headerHrefs.includes(link.href)) fail(`${page.output}: static header is missing public navigation link ${link.href}.`);
    if (!expected && headerHrefs.includes(link.href)) fail(`${page.output}: static header exposes inactive navigation link ${link.href}.`);
  }
  for (const link of Object.values(footerNavigation).flat()) {
    const expected = link.public !== false && isFeatureEnabled(link.feature);
    if (expected && !footerHrefs.includes(link.href)) fail(`${page.output}: static footer is missing public navigation link ${link.href}.`);
    if (!expected && footerHrefs.includes(link.href)) fail(`${page.output}: static footer exposes inactive navigation link ${link.href}.`);
  }

  for (const phrase of forbiddenConsumerPhrases) {
    if (new RegExp(escapeRegExp(phrase).replaceAll('\\ ', '\\s+'), 'i').test(html)) fail(`${page.output}: forbidden consumer phrase "${phrase}".`);
  }

  checkGeneratedAccessibility(html, page);

  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    const href = attribute(match[1], 'href');
    if (!href) {
      fail(`${page.output}: anchor is missing href.`);
      continue;
    }
    if (!routeOrAssetExists(href, page.route)) fail(`${page.output}: broken local link "${href}".`);
    else if (!anchorExists(href, page.route)) fail(`${page.output}: link target fragment does not exist: "${href}".`);
    const parsed = localUrl(href, page.route);
    const targetPage = parsed ? pageForPathname(parsed.pathname) : null;
    if (targetPage && isInactivePage(targetPage) && targetPage.route !== page.route) {
      fail(`${page.output}: generated customer link points to inactive route ${targetPage.route}.`);
    }
  }

  for (const reference of generatedAssetReferences(html)) {
    if (/^(?:https?:|data:|blob:)/i.test(reference.value)) continue;
    const parsed = localUrl(reference.value, page.route);
    if (!parsed || !localFileForPathname(parsed.pathname)) fail(`${page.output}: missing local ${reference.name} asset "${reference.value}".`);
  }

  const pageProduct = page.product ? products.find((product) => product.id === page.product) : null;
  const configuredSocialImage = pageProduct?.seo?.image ?? siteConfig.brandAssets?.socialImage ?? null;
  const ogImages = [...html.matchAll(/<meta\b([^>]*)>/gi)].filter((match) => attribute(match[1], 'property')?.toLowerCase() === 'og:image');
  if (!configuredSocialImage && ogImages.length) fail(`${page.output}: placeholder og:image is present while the page social image is null.`);
  if (configuredSocialImage) {
    if (ogImages.length !== 1) fail(`${page.output}: expected one configured og:image meta tag.`);
    else {
      const ogPath = attribute(ogImages[0][1], 'content') ?? attribute(ogImages[0][1], 'data-og-image-path');
      if (!ogPath?.includes(configuredSocialImage)) fail(`${page.output}: og:image does not use the configured social image.`);
      const socialUrl = localUrl(configuredSocialImage);
      if (!socialUrl || !localFileForPathname(socialUrl.pathname)) fail(`${page.output}: configured social image is missing.`);
    }
  }

  const schemas = schemaNodes(readStructuredData(html, page));
  const organizations = schemasOfType(schemas, 'Organization');
  if (organizations.length !== 1) fail(`${page.output}: expected exactly one Organization JSON-LD object, found ${organizations.length}.`);
  else {
    if (organizations[0].name !== siteConfig.name) fail(`${page.output}: Organization schema name does not match siteConfig.`);
    requireVisibleSchemaText(organizations[0].name, visibleBodyText(html), page, 'organization name');
    if (!siteConfig.baseUrl && (organizations[0].url || organizations[0].logo)) fail(`${page.output}: Organization schema contains production URLs while baseUrl is null.`);
  }
  if (page.type === 'product') checkProductSchema(page, html, schemas);
  checkFaqSchema(page, html, schemas);
  if (siteConfig.baseUrl && !schemasOfType(schemas, 'BreadcrumbList').length && ['product', 'collection'].includes(page.type)) {
    fail(`${page.output}: missing BreadcrumbList JSON-LD for configured production URL.`);
  }
}

function checkMoneyField(owner, field, value) {
  if (value == null) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) fail(`${owner}: ${field} must be null or a non-negative finite number.`);
}

function checkProductData() {
  uniqueValues(products, 'product ID', (product) => product.id);
  uniqueValues(products, 'product handle', (product) => product.handle);
  uniqueValues(products, 'product slug', (product) => product.slug);
  uniqueValues(categories, 'category ID', (category) => category.id);
  uniqueValues(categories, 'category route', (category) => category.href);
  const productIds = new Set(products.map((product) => product.id));
  const categoryIds = new Set(categories.map((category) => category.id));
  const globalVariantIds = new Set();
  const globalMediaIds = new Set();
  for (const field of ['sku', 'barcode']) {
    const seen = new Map();
    for (const product of products) {
      if (!product[field]) continue;
      if (seen.has(product[field])) fail(`Duplicate product ${field} "${product[field]}" (${seen.get(product[field])}, ${product.id}).`);
      else seen.set(product[field], product.id);
    }
  }

  for (const product of products) {
    const owner = `Product ${product.id}`;
    if (!categoryIds.has(product.categoryId)) fail(`${owner}: unknown categoryId "${product.categoryId}".`);
    if (!pageForPathname(product.slug)) fail(`${owner}: slug does not resolve to a generated route (${product.slug}).`);
    const isPublished = ['active', 'published'].includes(product.status);
    const productPage = pages.find((page) => page.product === product.id);
    if (isPublished && !productPage) fail(`${owner}: no page references this active product.`);
    if (product.inventory != null && (!Number.isInteger(product.inventory) || product.inventory < 0)) fail(`${owner}: inventory must be null or a non-negative integer.`);

    for (const field of ['price', 'compareAt']) checkMoneyField(owner, field, product[field]);
    if (product.currency != null && !/^[A-Z]{3}$/.test(product.currency)) fail(`${owner}: currency must be null or an ISO-style three-letter uppercase code.`);
    const variants = product.variants ?? [];
    const variantIds = new Set();
    for (const variant of variants) {
      if (!variant.id?.trim()) fail(`${owner}: variant is missing an ID.`);
      else if (variantIds.has(variant.id)) fail(`${owner}: duplicate variant ID "${variant.id}".`);
      else {
        variantIds.add(variant.id);
        const globalId = `${product.id}:${variant.id}`;
        if (globalVariantIds.has(globalId)) fail(`${owner}: duplicate product-scoped variant ID "${variant.id}".`);
        globalVariantIds.add(globalId);
      }
      for (const field of ['price', 'compareAt', 'perUnitPrice', 'savings']) checkMoneyField(`${owner}/${variant.id ?? 'variant'}`, field, variant[field]);
      if (variant.compareAt != null && variant.price == null) fail(`${owner}/${variant.id}: compareAt requires a price.`);
      if (variant.compareAt != null && variant.price != null && variant.compareAt < variant.price) fail(`${owner}/${variant.id}: compareAt cannot be lower than price.`);
    }
    if (isPublished && !variants.some((variant) => variant.enabled)) fail(`${owner}: active catalog data has no enabled variant.`);

    const moneyValues = [product.price, product.compareAt, ...variants.flatMap((variant) => [variant.price, variant.compareAt, variant.perUnitPrice, variant.savings])]
      .filter((value) => value != null);
    if (moneyValues.length && !product.currency) fail(`${owner}: monetary values require product.currency.`);
    if (product.currency && siteConfig.currency && product.currency !== siteConfig.currency) fail(`${owner}: currency differs from siteConfig.currency.`);
    if (product.compareAt != null && product.price == null) fail(`${owner}: compareAt requires a price.`);
    if (product.compareAt != null && product.price != null && product.compareAt < product.price) fail(`${owner}: compareAt cannot be lower than price.`);

    const specifications = product.specifications ?? [];
    const specificationKeys = new Set();
    for (const specification of specifications) {
      if (!specification.key?.trim()) fail(`${owner}: specification is missing a key.`);
      else if (specificationKeys.has(specification.key)) fail(`${owner}: duplicate specification key "${specification.key}".`);
      else specificationKeys.add(specification.key);
      if (specification.verified && !normalizeText(specification.value)) fail(`${owner}/${specification.key}: verified specification has no value.`);
      if (isPublished && normalizeText(specification.value) && !specification.verified) {
        fail(`${owner}/${specification.key}: active product has a populated but unverified specification.`);
      }
    }
    if (isPublished) {
      const technicalFields = [
        ['dimensions', 'dimensions'], ['gsm', 'gsm'], ['blend', 'blend'], ['weave', 'weave'],
        ['edge', 'edge'], ['weight', 'weight'], ['origin', 'origin'], ['color', 'color'],
        ['materialSummary', 'material'],
      ];
      for (const [field, specificationKey] of technicalFields) {
        if (product[field] == null || product[field] === '') continue;
        const specification = specifications.find((item) => item.key === specificationKey);
        if (!specification?.verified || !normalizeText(specification.value)) {
          fail(`${owner}: populated ${field} is not backed by a verified "${specificationKey}" specification.`);
        }
      }
    }

    const mediaIds = new Set();
    for (const media of product.media ?? []) {
      const mediaOwner = `${owner}/${media.id ?? 'media'}`;
      if (!media.id?.trim()) fail(`${owner}: media item is missing an ID.`);
      else if (mediaIds.has(media.id)) fail(`${owner}: duplicate media ID "${media.id}".`);
      else {
        mediaIds.add(media.id);
        const globalId = `${product.id}:${media.id}`;
        if (globalMediaIds.has(globalId)) fail(`${owner}: duplicate product-scoped media ID "${media.id}".`);
        globalMediaIds.add(globalId);
      }
      if (!['image', 'video'].includes(media.type)) fail(`${mediaOwner}: unsupported media type "${media.type}".`);
      if (!normalizeText(media.alt)) fail(`${mediaOwner}: media alt text is required.`);
      if (!Number.isInteger(media.width) || media.width <= 0) fail(`${mediaOwner}: width must be a positive integer.`);
      if (!Number.isInteger(media.height) || media.height <= 0) fail(`${mediaOwner}: height must be a positive integer.`);
      if (media.src) {
        const parsed = localUrl(media.src);
        if (!parsed || !localFileForPathname(parsed.pathname)) fail(`${mediaOwner}: configured media source is missing (${media.src}).`);
      }
    }

    if (product.video?.enabled) {
      if (!product.video.src) fail(`${owner}: enabled video requires src.`);
      if (!product.video.poster) fail(`${owner}: enabled video requires poster.`);
    }

    for (const relatedId of product.relatedProductIds ?? []) {
      if (relatedId === product.id) fail(`${owner}: cannot relate to itself.`);
      else if (!productIds.has(relatedId)) fail(`${owner}: unknown related product ID "${relatedId}".`);
    }
    for (const bundle of product.bundles ?? []) {
      for (const relatedId of bundle.productIds ?? bundle.products ?? []) {
        const id = typeof relatedId === 'string' ? relatedId : relatedId.productId;
        if (!productIds.has(id)) fail(`${owner}: bundle references unknown product ID "${id}".`);
      }
    }

    if (isPublished && (effectiveProductPrice(product) == null || !product.currency)) {
      notice(`${product.title ?? product.name}: price and currency are not configured; price and offer schema remain hidden.`);
    }
    if (isPublished) {
      const missingOperationalFields = [
        ['SKU', product.sku], ['barcode', product.barcode], ['availability', product.availability],
        ['inventory', product.inventory], ['shipping class', product.shippingClass],
      ].filter(([, value]) => value == null || value === '').map(([label]) => label);
      if (missingOperationalFields.length) notice(`${product.title ?? product.name}: operational product inputs still required: ${missingOperationalFields.join(', ')}.`);
      const unpublishedGuidance = [
        !product.care?.ready ? 'care instructions' : null,
        !product.usage?.ready ? 'usage instructions' : null,
      ].filter(Boolean);
      if (unpublishedGuidance.length) notice(`${product.title ?? product.name}: ${unpublishedGuidance.join(' and ')} are not verified and remain hidden.`);
    }
    const missingMedia = (product.media ?? []).filter((media) => !media.src).length;
    if (isPublished && missingMedia) notice(`${product.title ?? product.name}: ${missingMedia} product media source${missingMedia === 1 ? ' is' : 's are'} still required.`);
    const pendingSpecs = specifications.filter((specification) => !specification.verified || !normalizeText(specification.value));
    if (pendingSpecs.length) notice(`${product.title ?? product.name}: ${pendingSpecs.length} specification${pendingSpecs.length === 1 ? '' : 's'} remain unverified and hidden.`);
  }

  for (const category of categories) {
    const ids = category.productIds ?? [];
    const categoryPage = pageForPathname(category.href);
    if (!categoryPage) fail(`Category ${category.id}: href does not resolve (${category.href}).`);
    else if (categoryPage.collection !== category.id) fail(`Category ${category.id}: route is assigned to collection "${categoryPage.collection ?? 'none'}".`);
    if (new Set(ids).size !== ids.length) fail(`Category ${category.id}: duplicate product IDs.`);
    for (const productId of ids) {
      const product = products.find((item) => item.id === productId);
      if (!product) fail(`Category ${category.id}: unknown product ID "${productId}".`);
      else if (product.categoryId !== category.id) fail(`Category ${category.id}: product ${productId} has categoryId "${product.categoryId}".`);
    }
    if (category.public && !ids.some((id) => ['active', 'published'].includes(products.find((product) => product.id === id)?.status))) {
      fail(`Public category ${category.id} has no active product.`);
    }
  }

  for (const page of pages) {
    if (page.product && !productIds.has(page.product)) fail(`${page.output}: references unknown product ID "${page.product}".`);
    if (page.collection && page.collection !== 'all-products' && !categoryIds.has(page.collection)) {
      fail(`${page.output}: references unknown collection ID "${page.collection}".`);
    }
  }
}

function checkNavigation() {
  const publicLinks = [
    ...primaryNavigation.filter((link) => link.public !== false && isFeatureEnabled(link.feature)),
    ...Object.values(footerNavigation).flat().filter((link) => link.public !== false && isFeatureEnabled(link.feature)),
  ];
  for (const link of publicLinks) {
    if (!link.href || !routeOrAssetExists(link.href)) fail(`Public navigation link "${link.label ?? 'unnamed'}" does not resolve (${link.href ?? 'missing href'}).`);
    else if (!anchorExists(link.href)) fail(`Public navigation fragment does not resolve (${link.href}).`);
    const parsed = localUrl(link.href);
    const target = parsed ? pageForPathname(parsed.pathname) : null;
    if (target && isInactivePage(target)) fail(`Public navigation links to inactive page ${target.route}.`);
  }

  const emptyCategoryRoutes = new Map(categories
    .filter((category) => !(category.productIds ?? []).some((id) => ['active', 'published'].includes(products.find((product) => product.id === id)?.status)))
    .map((category) => [cleanRoutePath(category.href), category.id]));
  for (const page of pages) {
    const html = htmlByRoute.get(page.route);
    if (!html) continue;
    for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
      const href = attribute(match[1], 'href');
      if (href?.startsWith('#')) continue;
      const parsed = localUrl(href, page.route);
      if (parsed && emptyCategoryRoutes.has(cleanRoutePath(parsed.pathname))) {
        fail(`${page.output}: links to empty category "${emptyCategoryRoutes.get(cleanRoutePath(parsed.pathname))}".`);
      }
    }
  }
}

function normalizeSitemapLocation(value) {
  try {
    const parsed = new URL(value, generatedOrigin);
    return cleanRoutePath(parsed.pathname);
  } catch {
    return cleanRoutePath(value);
  }
}

function checkSitemap() {
  const path = resolve(projectRoot, 'public/sitemap.xml');
  if (!existsSync(path)) {
    fail('Missing public/sitemap.xml.');
    return;
  }
  const xml = readFileSync(path, 'utf8');
  const locations = capture(xml, /<loc>\s*([^<]+?)\s*<\/loc>/gi).map((value) => normalizeSitemapLocation(decodeHtml(value)));
  const duplicates = [...new Set(locations.filter((location, index) => locations.indexOf(location) !== index))];
  if (duplicates.length) fail(`Sitemap contains duplicate routes: ${duplicates.join(', ')}.`);
  const actual = new Set(locations);
  const expected = new Set(pages.filter(isIndexedPage).map((page) => cleanRoutePath(page.route)));
  for (const route of expected) if (!actual.has(route)) fail(`Sitemap is missing indexable route ${route}.`);
  for (const route of actual) if (!expected.has(route)) fail(`Sitemap contains non-indexable or unknown route ${route}.`);
  for (const page of pages.filter(isInactivePage)) {
    if (actual.has(cleanRoutePath(page.route))) fail(`Inactive ${page.feature} route appears in sitemap: ${page.route}.`);
  }
}

function checkManifest() {
  const path = resolve(projectRoot, 'public/site.webmanifest');
  if (!existsSync(path)) {
    fail('Missing public/site.webmanifest.');
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`Invalid public/site.webmanifest (${error.message}).`);
    return;
  }
  if (!Array.isArray(manifest.icons) || !manifest.icons.length) {
    fail('site.webmanifest must declare at least one icon.');
    return;
  }
  for (const icon of manifest.icons) {
    if (!icon.src) {
      fail('Manifest icon is missing src.');
      continue;
    }
    const parsed = localUrl(icon.src);
    if (!parsed || !localFileForPathname(parsed.pathname)) fail(`Manifest icon file does not exist: ${icon.src}.`);
    if (!icon.sizes?.trim()) fail(`Manifest icon ${icon.src} is missing sizes.`);
    if (!icon.type?.startsWith('image/')) fail(`Manifest icon ${icon.src} is missing a valid image MIME type.`);
  }
}

function launchBlockerNotices() {
  const blockers = [
    ['Production domain', siteConfig.baseUrl],
    ['Store currency', siteConfig.currency],
    ['Legal entity', siteConfig.legalEntity],
    ['Registered/trading address', siteConfig.registeredAddress],
    ['Company registration number', siteConfig.registrationNumber],
    ['Tax/VAT number', siteConfig.taxNumber ?? siteConfig.vatNumber],
    ['Support email', siteConfig.supportEmail],
    ['Privacy email', siteConfig.privacyEmail],
    ['Commerce provider', siteConfig.commerce?.provider],
  ].filter(([, value]) => !value).map(([label]) => label);
  if (blockers.length) notice(`Launch inputs still required (${blockers.length}): ${blockers.join(', ')}.`);

  const inactiveFeatures = Object.entries(siteConfig.features ?? {})
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature);
  if (inactiveFeatures.length) notice(`Feature gates intentionally off (${inactiveFeatures.length}): ${inactiveFeatures.join(', ')}.`);
  if (!siteConfig.brandAssets?.socialImage) notice('Social/OG image is not configured; OG image metadata remains omitted.');
}

function generatePages() {
  const script = resolve(projectRoot, 'scripts/generate-pages.mjs');
  if (!existsSync(script)) {
    fail('Missing scripts/generate-pages.mjs.');
    return;
  }
  const result = spawnSync(process.execPath, [script], { cwd: projectRoot, encoding: 'utf8' });
  if (result.error) fail(`Page generation could not start: ${result.error.message}.`);
  else if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    fail(`Page generation failed${detail ? `: ${detail}` : '.'}`);
  }
}

generatePages();

uniqueValues(pages, 'page route', (page) => page.route);
uniqueValues(pages, 'page output', (page) => page.output);
uniqueValues(pages, 'page ID', (page) => page.id);
uniqueValues(pages, 'page title', (page) => page.title);
uniqueValues(pages, 'page description', (page) => page.description);

for (const page of pages) {
  if (!page.route?.startsWith('/')) fail(`${page.output ?? page.id}: route must start with "/".`);
  if (!page.output || page.output.startsWith('/') || page.output.includes('..')) fail(`${page.route ?? page.id}: output must be a safe project-relative path.`);
  if (page.feature && !(page.feature in (siteConfig.features ?? {}))) fail(`${page.output}: unknown feature gate "${page.feature}".`);
  if (isInactivePage(page) && page.public !== false) fail(`${page.output}: inactive feature page must set public: false.`);
  const path = resolve(projectRoot, page.output ?? '');
  if (!existsSync(path)) {
    fail(`Missing generated page: ${page.output}.`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  htmlByRoute.set(page.route, html);
}

checkProductData();

for (const page of pages) {
  const html = htmlByRoute.get(page.route);
  if (html) checkGeneratedPage(page, html);
}

checkNavigation();
checkSitemap();
checkManifest();
launchBlockerNotices();

const requiredInfrastructure = [
  'package.json',
  'vite.config.js',
  'README.md',
  'public/robots.txt',
  'public/site.webmanifest',
  'docs/LAUNCH-REQUIREMENTS.md',
  'docs/PRODUCT-PHOTOGRAPHY-BRIEF.md',
];
for (const filename of requiredInfrastructure) {
  if (!existsSync(resolve(projectRoot, filename))) fail(`Missing required project file: ${filename}.`);
}

const uniqueFailures = [...new Set(failures)];
const uniqueNotices = [...new Set(notices)];

if (uniqueFailures.length) {
  console.error(`\nPhase 2 audit failed with ${uniqueFailures.length} implementation defect${uniqueFailures.length === 1 ? '' : 's'}:`);
  uniqueFailures.forEach((message) => console.error(`  ✗ ${message}`));
} else {
  console.log(`\nPhase 2 audit passed: ${pages.length} generated pages, ${products.length} product${products.length === 1 ? '' : 's'}, static content, navigation, data integrity, accessibility basics, schema parity, assets, manifest and sitemap.`);
}

console.log(`\nLaunch-readiness notices (${uniqueNotices.length}; non-failing):`);
if (uniqueNotices.length) uniqueNotices.forEach((message) => console.log(`  • ${message}`));
else console.log('  • None.');

if (uniqueFailures.length) process.exitCode = 1;
