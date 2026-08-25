const nodeEnvironment = typeof process !== 'undefined' && process.versions?.node
  ? process.env
  : null;

const viteBasePath = typeof import.meta.env === 'object'
  ? import.meta.env.BASE_URL
  : null;

const injectedBaseUrl = typeof __SITE_BASE_URL__ === 'string'
  ? __SITE_BASE_URL__
  : null;

const passthroughProtocol = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export function normalizeBasePath(value = '/') {
  const input = String(value ?? '/').trim();
  if (!input || input === '/') return '/';
  if (/[?#\\]/.test(input) || /^[a-z][a-z\d+.-]*:/i.test(input)) {
    throw new Error(`SITE_BASE_PATH must be a pathname, received "${input}".`);
  }

  const segments = input.split('/').filter(Boolean);
  if (!segments.length) return '/';
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('SITE_BASE_PATH cannot contain relative path segments.');
  }

  return `/${segments.join('/')}/`;
}

function normalizeBaseUrl(value, basePath) {
  if (value == null || String(value).trim() === '') return null;

  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch {
    throw new Error(`SITE_BASE_URL must be an absolute URL, received "${value}".`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('SITE_BASE_URL must be a clean HTTP(S) URL without credentials, a query, or a fragment.');
  }

  const urlBasePath = normalizeBasePath(parsed.pathname);
  if (urlBasePath !== basePath) {
    throw new Error(`SITE_BASE_URL pathname "${urlBasePath}" must match SITE_BASE_PATH "${basePath}".`);
  }

  parsed.pathname = basePath;
  return parsed.href;
}

export const siteBasePath = normalizeBasePath(
  nodeEnvironment?.SITE_BASE_PATH ?? viteBasePath ?? '/',
);

export const siteBaseUrl = normalizeBaseUrl(
  nodeEnvironment?.SITE_BASE_URL ?? injectedBaseUrl,
  siteBasePath,
);

function splitPathSuffix(value) {
  const suffixIndex = value.search(/[?#]/);
  return suffixIndex === -1
    ? { pathname: value, suffix: '' }
    : { pathname: value.slice(0, suffixIndex), suffix: value.slice(suffixIndex) };
}

export function toSitePath(value) {
  if (value == null) return value;
  const input = String(value);
  if (!input || input.startsWith('#') || input.startsWith('?') || passthroughProtocol.test(input)) return input;
  if (!input.startsWith('/') || siteBasePath === '/') return input;

  const { pathname, suffix } = splitPathSuffix(input);
  const baseWithoutTrailingSlash = siteBasePath.slice(0, -1);
  if (pathname === baseWithoutTrailingSlash || pathname.startsWith(siteBasePath)) return `${pathname}${suffix}`;
  return `${baseWithoutTrailingSlash}${pathname}${suffix}`;
}

export function stripBasePath(value) {
  if (value == null) return value;
  const input = String(value);
  if (!input || siteBasePath === '/' || passthroughProtocol.test(input)) return input;

  const { pathname, suffix } = splitPathSuffix(input);
  const baseWithoutTrailingSlash = siteBasePath.slice(0, -1);
  if (pathname === baseWithoutTrailingSlash) return `/${suffix}`;
  if (!pathname.startsWith(siteBasePath)) return input;
  return `/${pathname.slice(siteBasePath.length)}${suffix}`;
}

export function toSiteSrcset(value) {
  if (!value) return value;
  return String(value).split(',').map((candidate) => {
    const match = candidate.trim().match(/^(\S+)(\s+.+)?$/);
    if (!match) return candidate.trim();
    return `${toSitePath(match[1])}${match[2] ?? ''}`;
  }).join(', ');
}

export function toAbsoluteSiteUrl(value = '/') {
  if (!siteBaseUrl || value == null) return null;
  const input = String(value);
  if (/^https?:/i.test(input)) return new URL(input).href;
  if (passthroughProtocol.test(input)) return input;

  const logicalPath = stripBasePath(input);
  const relativePath = logicalPath.startsWith('/') ? logicalPath.slice(1) : logicalPath;
  return new URL(relativePath, siteBaseUrl).href;
}
