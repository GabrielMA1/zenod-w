import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { pages } from './data/pages.js';
import { products } from './data/products.js';
import { siteConfig } from './data/site.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const stableBrandAssets = [
  'assets/images/brand/zeno-logo-web-black.svg',
  'assets/images/brand/zeno-logo-web-white.svg',
  'assets/images/brand/zeno-symbol-black.svg',
  'assets/images/brand/zeno-symbol-white.svg',
  'assets/images/brand/favicon.svg',
  'assets/images/brand/favicon-16.png',
  'assets/images/brand/favicon-32.png',
  'assets/images/brand/apple-touch-icon-180.png',
  'assets/images/brand/icon-192.png',
  'assets/images/brand/icon-512.png',
  'assets/images/brand/icon-maskable-512.png',
];

const publishedMediaAssets = products.flatMap((product) => product.media)
  .flatMap((media) => [media.src, media.zoomSrc, ...(media.sources?.avif ?? []).map((item) => item.src), ...(media.sources?.webp ?? []).map((item) => item.src)])
  .filter(Boolean)
  .map((asset) => asset.replace(/^\//, ''));

const publishedVideoAssets = products
  .flatMap((product) => [product.video?.src, product.video?.poster, product.video?.captions])
  .filter(Boolean)
  .map((asset) => asset.replace(/^\//, ''));

const optionalAssets = [siteConfig.brandAssets.socialImage].filter(Boolean).map((asset) => asset.replace(/^\//, ''));
const stableAssets = [...new Set([...stableBrandAssets, ...publishedMediaAssets, ...publishedVideoAssets, ...optionalAssets])];

function copyStableAssets() {
  return {
    name: 'copy-published-zeno-assets',
    closeBundle() {
      for (const relativePath of stableAssets) {
        const source = resolve(projectRoot, relativePath);
        if (!existsSync(source)) continue;
        const destination = resolve(projectRoot, 'dist', relativePath);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(source, destination);
      }
    },
  };
}

const htmlEntries = Object.fromEntries(
  pages.map((page) => [page.output.replace(/\.html$/, ''), resolve(projectRoot, page.output)]),
);

export default defineConfig({
  root: projectRoot,
  publicDir: 'public',
  plugins: [copyStableAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    sourcemap: false,
    rollupOptions: { input: htmlEntries },
  },
});
