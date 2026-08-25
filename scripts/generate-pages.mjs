import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { pages } from '../data/pages.js';
import { getProduct } from '../data/products.js';
import { featureEnabled, siteConfig } from '../data/site.js';
import {
  siteBasePath,
  toAbsoluteSiteUrl,
  toSitePath,
  toSiteSrcset,
} from '../data/deployment.js';
import { announcementMarkup, footerMarkup, headerMarkup, overlayMarkup } from '../assets/js/components/shell.js';
import { renderPage } from '../assets/js/pages.js';
import { pageSchemas } from '../assets/js/seo.js';
import { escapeHtml } from '../assets/js/lib/html.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function writeGeneratedFile(destination, content) {
  const maximumAttempts = 8;
  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      await writeFile(destination, content, 'utf8');
      return;
    } catch (error) {
      const retryable = ['EBUSY', 'EPERM'].includes(error?.code);
      if (!retryable || attempt === maximumAttempts - 1) throw error;
      await wait(Math.min(50 * (2 ** attempt), 1000));
    }
  }
}

function pageIsPublic(page) {
  return page.public !== false && !page.noindex && featureEnabled(page.feature);
}

function pageHtml(page) {
  const product = page.product ? getProduct(page.product) : page.type === 'home' || page.type === 'faq' ? getProduct('zeno-drying-towel') : null;
  const noindex = !pageIsPublic(page);
  const canonical = toAbsoluteSiteUrl(page.route);
  const socialImage = product?.seo?.image ?? siteConfig.brandAssets.socialImage;
  const socialImageUrl = socialImage ? toAbsoluteSiteUrl(socialImage) ?? toSitePath(socialImage) : null;
  const criticalMedia = ['home', 'product'].includes(page.type) ? product?.media?.[0] : null;
  const contextAttributes = [
    `data-page="${escapeHtml(page.type)}"`, `data-page-id="${escapeHtml(page.id)}"`, `data-route="${escapeHtml(page.route)}"`,
    page.collection ? `data-collection="${escapeHtml(page.collection)}"` : '',
    page.product ? `data-product="${escapeHtml(page.product)}"` : '',
  ].filter(Boolean).join(' ');

  return `<!doctype html>
<html lang="${escapeHtml(siteConfig.locale)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#090c0f">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
    <link rel="canonical"${canonical ? ` href="${escapeHtml(canonical)}"` : ''} data-canonical-path="${escapeHtml(page.route)}">
    <meta property="og:site_name" content="${escapeHtml(siteConfig.name)}">
    <meta property="og:type" content="${page.type === 'product' ? 'product' : 'website'}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" data-canonical-path="${escapeHtml(page.route)}">` : ''}
    ${socialImageUrl ? `<meta property="og:image" content="${escapeHtml(socialImageUrl)}"><meta name="twitter:image" content="${escapeHtml(socialImageUrl)}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.description)}">
    <link rel="icon" href="/assets/images/brand/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/assets/images/brand/favicon-32.png" sizes="32x32" type="image/png">
    <link rel="icon" href="/assets/images/brand/favicon-16.png" sizes="16x16" type="image/png">
    <link rel="apple-touch-icon" href="/assets/images/brand/apple-touch-icon-180.png">
    <link rel="manifest" href="/site.webmanifest">
    ${criticalMedia?.src ? `<link rel="preload" as="image" href="${escapeHtml(toSitePath(criticalMedia.src))}"${criticalMedia.srcset ? ` imagesrcset="${escapeHtml(toSiteSrcset(criticalMedia.srcset))}"` : ''} imagesizes="(min-width: 64rem) 58vw, 100vw">` : ''}
    <link rel="stylesheet" href="/assets/css/main.css">
    ${pageSchemas(page, product)}
    <script type="module" src="/assets/js/app.js"></script>
  </head>
  <body ${contextAttributes}>
    <a class="skip-link" href="#main-content">Skip to content</a>
    ${announcementMarkup()}
    ${headerMarkup(page.route)}
    <main id="main-content">${renderPage(page)}</main>
    ${footerMarkup()}
    ${overlayMarkup(page.route)}
    <div class="sr-only" aria-live="polite" aria-atomic="true" id="site-live-region"></div>
  </body>
</html>
`;
}

for (const page of pages) {
  const destination = resolve(projectRoot, page.output);
  mkdirSync(dirname(destination), { recursive: true });
  await writeGeneratedFile(destination, pageHtml(page));
}

const sitemapRoutes = pages.filter(pageIsPublic).map((page) => page.route);
const sitemap = siteConfig.baseUrl
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${toAbsoluteSiteUrl(route)}</loc></url>`).join('\n')}\n</urlset>\n`
  : `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Set SITE_BASE_URL to emit production-absolute sitemap URLs. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${toSitePath(route)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeGeneratedFile(resolve(projectRoot, 'public/sitemap.xml'), sitemap);

const robots = `User-agent: *\nAllow: ${siteBasePath}\n${siteConfig.baseUrl ? `\nSitemap: ${toAbsoluteSiteUrl('/sitemap.xml')}\n` : ''}`;
await writeGeneratedFile(resolve(projectRoot, 'public/robots.txt'), robots);

const manifest = {
  name: siteConfig.name,
  short_name: siteConfig.shortName,
  description: 'Premium automotive car-care products.',
  start_url: siteBasePath, scope: siteBasePath, display: 'standalone', background_color: '#f4f6f7', theme_color: '#090c0f',
  icons: [
    { src: toSitePath('/assets/images/brand/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: toSitePath('/assets/images/brand/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: toSitePath('/assets/images/brand/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
await writeGeneratedFile(resolve(projectRoot, 'public/site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${pages.length} static HTML pages, metadata and site infrastructure files.`);
