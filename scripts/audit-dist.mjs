import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../data/pages.js';
import { featureEnabled } from '../data/site.js';
import {
  siteBasePath,
  siteBaseUrl,
  stripBasePath,
  toAbsoluteSiteUrl,
  toSitePath,
} from '../data/deployment.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(projectRoot, 'dist');
const auditOrigin = 'https://dist.zeno.invalid';
const deploymentOrigin = siteBaseUrl ? new URL(siteBaseUrl).origin : null;
const failures = [];

function fail(message) {
  failures.push(message);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtml(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function attribute(attributes, name) {
  const escapedName = escapeRegExp(name);
  const match = attributes.match(new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

function pagePathname(page) {
  return toSitePath(page.route);
}

function outputForPathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(stripBasePath(pathname));
  } catch {
    return null;
  }
  if (!decoded.startsWith('/') || decoded.includes('..')) return null;
  if (decoded === '/') return resolve(distRoot, 'index.html');
  const relative = decoded.replace(/^\/+/, '');
  return decoded.endsWith('/')
    ? resolve(distRoot, relative, 'index.html')
    : resolve(distRoot, relative);
}

function isPassthroughUrl(value) {
  return /^(?:mailto:|tel:|data:|blob:|javascript:|#|\?)/i.test(value);
}

function isUnderBase(pathname) {
  if (siteBasePath === '/') return pathname.startsWith('/');
  const baseWithoutTrailingSlash = siteBasePath.slice(0, -1);
  return pathname === baseWithoutTrailingSlash || pathname.startsWith(siteBasePath);
}

function htmlForPathname(pathname) {
  const output = outputForPathname(pathname);
  if (!output || extname(output).toLowerCase() !== '.html' || !existsSync(output)) return null;
  return readFileSync(output, 'utf8');
}

function verifyFragment(parsed, value, owner) {
  if (!parsed.hash) return;
  const html = htmlForPathname(parsed.pathname);
  if (!html) return;
  let id;
  try {
    id = decodeURIComponent(parsed.hash.slice(1));
  } catch {
    fail(`${owner}: invalid fragment encoding in "${value}".`);
    return;
  }
  if (!new RegExp(`\\sid=(?:"${escapeRegExp(id)}"|'${escapeRegExp(id)}')`, 'i').test(html)) {
    fail(`${owner}: fragment target does not exist: "${value}".`);
  }
}

function verifyInternalUrl(value, owner, documentPathname, { requireFile = true } = {}) {
  if (!value || isPassthroughUrl(value)) return;

  let parsed;
  try {
    parsed = new URL(value, new URL(documentPathname, auditOrigin));
  } catch {
    fail(`${owner}: invalid URL "${value}".`);
    return;
  }
  if (parsed.origin !== auditOrigin && parsed.origin !== deploymentOrigin) return;

  if (!isUnderBase(parsed.pathname)) {
    fail(`${owner}: internal URL bypasses deployment base ${siteBasePath}: "${value}".`);
    return;
  }

  if (requireFile) {
    const output = outputForPathname(parsed.pathname);
    if (!output || !existsSync(output)) fail(`${owner}: deployed target is missing for "${value}".`);
  }
  verifyFragment(parsed, value, owner);
}

function sourceCandidates(value) {
  return String(value ?? '').split(',').map((candidate) => candidate.trim().split(/\s+/)[0]).filter(Boolean);
}

function verifyHtml(path, page) {
  const html = readFileSync(path, 'utf8');
  const documentPathname = pagePathname(page);
  const owner = page.output;

  const canonical = [...html.matchAll(/<link\b([^>]*)>/gi)]
    .find((match) => attribute(match[1], 'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
  const canonicalHref = canonical ? attribute(canonical[1], 'href') : null;
  const expectedCanonical = toAbsoluteSiteUrl(page.route);
  if (expectedCanonical ? canonicalHref !== expectedCanonical : Boolean(canonicalHref)) {
    fail(`${owner}: canonical URL does not match the configured deployment URL.`);
  }

  const ogUrl = [...html.matchAll(/<meta\b([^>]*)>/gi)]
    .find((match) => attribute(match[1], 'property')?.toLowerCase() === 'og:url');
  const ogContent = ogUrl ? attribute(ogUrl[1], 'content') : null;
  if (expectedCanonical ? ogContent !== expectedCanonical : Boolean(ogContent)) {
    fail(`${owner}: og:url does not match the configured deployment URL.`);
  }

  for (const match of html.matchAll(/<meta\b([^>]*)>/gi)) {
    const property = attribute(match[1], 'property')?.toLowerCase();
    const name = attribute(match[1], 'name')?.toLowerCase();
    if (property === 'og:image' || name === 'twitter:image') {
      verifyInternalUrl(attribute(match[1], 'content'), `${owner} social image`, documentPathname);
    }
  }

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attribute(match[1], 'type')?.toLowerCase() !== 'application/ld+json') continue;
    let structuredData;
    try {
      structuredData = JSON.parse(decodeHtml(match[2]));
    } catch {
      continue;
    }
    const visit = (value) => {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
      else if (typeof value === 'string' && /^(?:(?:https?:)?\/\/|\/)/i.test(value)) {
        verifyInternalUrl(value, `${owner} JSON-LD URL`, documentPathname);
      }
    };
    visit(structuredData);
  }

  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    verifyInternalUrl(attribute(match[1], 'href'), `${owner} link`, documentPathname);
  }

  for (const match of html.matchAll(/<(?:img|script|source|video|audio|track|iframe)\b([^>]*)>/gi)) {
    for (const name of ['src', 'poster']) {
      verifyInternalUrl(attribute(match[1], name), `${owner} ${name}`, documentPathname);
    }
    for (const candidate of sourceCandidates(attribute(match[1], 'srcset'))) {
      verifyInternalUrl(candidate, `${owner} srcset`, documentPathname);
    }
  }

  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    const rel = attribute(match[1], 'rel')?.toLowerCase() ?? '';
    if (rel.split(/\s+/).includes('canonical')) continue;
    verifyInternalUrl(attribute(match[1], 'href'), `${owner} link[rel="${rel}"]`, documentPathname);
    for (const candidate of sourceCandidates(attribute(match[1], 'imagesrcset'))) {
      verifyInternalUrl(candidate, `${owner} imagesrcset`, documentPathname);
    }
  }

  for (const match of html.matchAll(/<(?:form)\b([^>]*)>/gi)) {
    verifyInternalUrl(attribute(match[1], 'action'), `${owner} form action`, documentPathname, { requireFile: false });
  }

  if (siteBasePath !== '/') {
    for (const match of html.matchAll(/(?:href|src|poster|action)=(?:"|')(\/(?!\/)[^"']*)/gi)) {
      if (!isUnderBase(new URL(match[1], auditOrigin).pathname)) {
        fail(`${owner}: raw root-relative reference escapes ${siteBasePath}: "${match[1]}".`);
      }
    }
  }
}

function verifyCss(path) {
  const css = readFileSync(path, 'utf8');
  const relative = path.slice(distRoot.length).replaceAll('\\', '/');
  const documentPathname = toSitePath(relative.startsWith('/') ? relative : `/${relative}`);
  for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/gi)) {
    verifyInternalUrl(match[1] ?? match[2] ?? match[3], `${relative} CSS url()`, documentPathname);
  }
}

function verifyBundledMarkup(path) {
  if (siteBasePath === '/') return;
  const source = readFileSync(path, 'utf8');
  const relative = path.slice(distRoot.length).replaceAll('\\', '/');
  for (const match of source.matchAll(/(?:href|src|poster|action)=(?:\\?"|\\?')(\/(?!\/)[^"'`\\]*)/gi)) {
    const pathname = new URL(match[1], auditOrigin).pathname;
    if (!isUnderBase(pathname)) fail(`${relative}: bundled markup contains a root-relative URL outside ${siteBasePath}: "${match[1]}".`);
  }
}

function verifyManifest() {
  const path = resolve(distRoot, 'site.webmanifest');
  if (!existsSync(path)) {
    fail('dist/site.webmanifest is missing.');
    return;
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`dist/site.webmanifest is invalid JSON (${error.message}).`);
    return;
  }
  if (manifest.start_url !== siteBasePath) fail(`Manifest start_url must be ${siteBasePath}.`);
  if (manifest.scope !== siteBasePath) fail(`Manifest scope must be ${siteBasePath}.`);
  for (const icon of manifest.icons ?? []) {
    verifyInternalUrl(icon.src, 'Manifest icon', siteBasePath);
  }
}

function verifySitemap() {
  const path = resolve(distRoot, 'sitemap.xml');
  if (!existsSync(path)) {
    fail('dist/sitemap.xml is missing.');
    return;
  }
  const xml = readFileSync(path, 'utf8');
  const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeHtml(match[1]));
  const expected = pages.filter((page) => !page.noindex && page.public !== false && featureEnabled(page.feature))
    .map((page) => siteBaseUrl ? toAbsoluteSiteUrl(page.route) : toSitePath(page.route));
  for (const location of expected) {
    if (!locations.includes(location)) fail(`Sitemap is missing ${location}.`);
  }
  for (const location of locations) {
    if (siteBaseUrl && !location.startsWith(siteBaseUrl)) fail(`Sitemap URL escapes ${siteBaseUrl}: ${location}.`);
    if (!siteBaseUrl && location.startsWith('/') && !isUnderBase(new URL(location, auditOrigin).pathname)) {
      fail(`Sitemap path escapes ${siteBasePath}: ${location}.`);
    }
  }
}

function verifyRobots() {
  const path = resolve(distRoot, 'robots.txt');
  if (!existsSync(path)) {
    fail('dist/robots.txt is missing.');
    return;
  }
  const robots = readFileSync(path, 'utf8');
  if (!new RegExp(`^Allow:\\s*${escapeRegExp(siteBasePath)}\\s*$`, 'mi').test(robots)) {
    fail(`dist/robots.txt does not allow ${siteBasePath}.`);
  }
  const expectedSitemap = toAbsoluteSiteUrl('/sitemap.xml');
  if (expectedSitemap && !new RegExp(`^Sitemap:\\s*${escapeRegExp(expectedSitemap)}\\s*$`, 'mi').test(robots)) {
    fail(`dist/robots.txt is missing Sitemap: ${expectedSitemap}.`);
  }
}

if (!existsSync(distRoot)) {
  fail('dist/ is missing; run npm run build before npm run audit:dist.');
} else {
  for (const page of pages) {
    const path = resolve(distRoot, page.output);
    if (!existsSync(path)) fail(`Missing built page: dist/${page.output}.`);
    else verifyHtml(path, page);
  }

  const files = walkFiles(distRoot);
  files.filter((path) => extname(path).toLowerCase() === '.css').forEach(verifyCss);
  files.filter((path) => extname(path).toLowerCase() === '.js').forEach(verifyBundledMarkup);
  verifyManifest();
  verifySitemap();
  verifyRobots();
}

const uniqueFailures = [...new Set(failures)];
if (uniqueFailures.length) {
  console.error(`\nDeployment artifact audit failed with ${uniqueFailures.length} issue${uniqueFailures.length === 1 ? '' : 's'}:`);
  uniqueFailures.forEach((message) => console.error(`  ✗ ${message}`));
  process.exitCode = 1;
} else {
  console.log(`\nDeployment artifact audit passed: ${pages.length} routes and all discovered HTML, CSS, JavaScript, manifest, sitemap, robots, fonts, images, icons and internal URLs respect ${siteBasePath}.`);
}
