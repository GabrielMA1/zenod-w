import { locales, localeIds, defaultMarket, marketStorageKey, languageStorageKey } from '../data/locales.js';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { pages } from '../data/pages.js';
import { localizeMarkup } from '../data/localization.js';
import { getProduct } from '../data/products.js';
import { featureEnabled, siteConfig } from '../data/site.js';
import {
  siteBasePath,
  toAbsoluteSiteUrl,
  toSitePath,
} from '../data/deployment.js';
import { announcementMarkup, footerMarkup, headerMarkup, overlayMarkup } from '../assets/js/components/shell.js';
import { renderPage } from '../assets/js/pages.js';
import { pageSchemas } from '../assets/js/seo.js';
import { escapeHtml } from '../assets/js/lib/html.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRevision = process.env.SITE_SOURCE_REVISION ?? process.env.GITHUB_SHA;
const buildRevision = /^[a-f0-9]{40}$/i.test(sourceRevision ?? '') ? sourceRevision : null;

async function writeGeneratedFile(destination, content) {
  const maximumAttempts = 8;
  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      await writeFile(destination, content.replace(/^[ \t]+$/gm, ''), 'utf8');
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

// Runs before first paint: applies an explicitly chosen market (URL or saved) so prices and
// market-specific text never flash the default region. Without JavaScript the default shows.
const marketBootstrap = `<script>(function(){var d=document.documentElement,m=null;try{m=new URLSearchParams(location.search).get('market')}catch(e){}if(m!=='RO'&&m!=='EU'){try{m=localStorage.getItem('${marketStorageKey}')}catch(e){m=null}}if((m==='RO'||m==='EU')&&m!==d.getAttribute('data-market')){d.setAttribute('data-market',m);d.setAttribute('data-market-pending','')}})();</script>`;

// English home only: a visitor who arrives from outside the site and previously chose another
// language in the preferences selector returns to it. First visits, crawlers and internal
// navigation are never redirected; every direct language URL is always respected.
const languageBootstrap = `<script>(function(){try{var l=localStorage.getItem('${languageStorageKey}'),r=document.referrer,s=false;try{s=!!r&&new URL(r).origin===location.origin}catch(e){}if(l&&l!=='en'&&${JSON.stringify(localeIds.filter((id) => id !== 'en'))}.indexOf(l)>-1&&!s){location.replace('${siteBasePath}'+l+'/'+location.search+location.hash)}}catch(e){}})();</script>`;

function pageHtml(page) {
  const product = page.product ? getProduct(page.product, page.locale) : page.type === 'faq' ? getProduct('zeno-drying-towel', page.locale) : null;
  const noindex = !pageIsPublic(page);
  const canonical = toAbsoluteSiteUrl(page.route);
  const socialImage = (page.type === 'product' ? product?.seo?.image : null) ?? siteConfig.brandAssets.socialImage;
  const socialImageUrl = socialImage ? toAbsoluteSiteUrl(socialImage) ?? toSitePath(socialImage) : null;
  const languageLinks = siteConfig.baseUrl ? [...localeIds, 'x-default'].map((lang) => {
    const route = lang !== 'en' && lang !== 'x-default' ? `/${lang}${page.logicalRoute}` : page.logicalRoute;
    return `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(toAbsoluteSiteUrl(route))}">`;
  }).join('\n    ') : '';
  const contextAttributes = [
    `data-page="${escapeHtml(page.type)}"`, `data-page-id="${escapeHtml(page.id)}"`, `data-route="${escapeHtml(page.route)}"`,
    page.collection ? `data-collection="${escapeHtml(page.collection)}"` : '',
    page.product ? `data-product="${escapeHtml(page.product)}"` : '',
    page.public === false ? 'data-public="false"' : '',
  ].filter(Boolean).join(' ');

  return localizeMarkup(`<!doctype html>
<html lang="${page.locale}" data-market="${defaultMarket(page.locale)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    ${page.type === 'home' && page.locale === 'en' ? languageBootstrap : ''}
    ${marketBootstrap}
    <meta name="theme-color" content="#17181a">
    ${buildRevision ? `<meta name="build-revision" content="${buildRevision}">` : ''}
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
    <link rel="canonical"${canonical ? ` href="${escapeHtml(canonical)}"` : ''} data-canonical-path="${escapeHtml(page.route)}">
    ${languageLinks}
    <meta property="og:locale" content="${locales[page.locale].og}">
    <meta property="og:site_name" content="${escapeHtml(siteConfig.name)}">
    <meta property="og:type" content="${page.type === 'article' ? 'article' : page.type === 'product' ? 'product' : 'website'}">
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
    <link rel="stylesheet" href="/assets/css/main.css">
    ${pageSchemas(page, product)}
    <script type="module" src="/assets/js/app.js"></script>
  </head>
  <body ${contextAttributes}>
    <a class="skip-link" href="#main-content">Skip to content</a>
    ${announcementMarkup()}
    ${headerMarkup(page.public === false ? '/' : page.route, page.locale)}
    <main id="main-content">${renderPage(page)}</main>
    ${footerMarkup(page.public === false ? '/' : page.route, page.locale)}
    ${overlayMarkup(page.public === false ? '/' : page.route, page.locale)}
    <div class="sr-only" aria-live="polite" aria-atomic="true" id="site-live-region"></div>
  </body>
</html>
`, page.locale);
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
  description: 'Car-care accessories from ZENO DETAIL.',
  start_url: siteBasePath, scope: siteBasePath, display: 'standalone', background_color: '#efeeeb', theme_color: '#17181a',
  icons: [
    { src: toSitePath('/assets/images/brand/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: toSitePath('/assets/images/brand/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: toSitePath('/assets/images/brand/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
await writeGeneratedFile(resolve(projectRoot, 'public/site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${pages.length} static HTML pages, metadata and site infrastructure files.`);
