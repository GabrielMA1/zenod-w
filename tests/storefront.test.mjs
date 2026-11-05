import "../data/dictionaries.js";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pages } from "../data/pages.js";
import { getProduct, formatPrice } from "../data/products.js";
import { localizeMarkup, localePath } from "../data/localization.js";
import { toSitePath, toAbsoluteSiteUrl } from "../data/deployment.js";
import {
  initializeCommerce,
  addLine,
  getCart,
  updateLine,
  removeLine,
  canCheckout,
} from "../assets/js/adapters/commerce.js";

test("regional prices change currency without changing product and variant identities", () => {
  const en = getProduct("zeno-drying-towel", "en");
  const ro = getProduct("zeno-drying-towel", "ro");
  assert.equal(en.price, 22.85);
  assert.equal(en.currency, "EUR");
  assert.equal(ro.price, 90);
  assert.equal(ro.currency, "RON");
  assert.match(formatPrice(en), /€22\.85/);
  assert.match(formatPrice(ro), /90,00\sRON/);
  assert.equal(ro.id, en.id);
  assert.deepEqual(
    ro.variants.map((v) => v.id),
    en.variants.map((v) => v.id),
  );
  assert.equal(en.compareAt, null, "No invented previous price");
  assert.equal(ro.compareAt, null);
});

test("localization preserves DOM hooks and schema types while translating accessible content", () => {
  const input =
    '<div class="card product-listing" id="Product"><a href="/shop/" aria-label="Shop">Shop</a><a data-language-link href="/shop/">English · EUR</a><script type="application/ld+json">{"@type":"Product","name":"ZENO DETAIL"}</script></div>';
  const result = localizeMarkup(input, "ro");
  assert.match(result, /class="card product-listing" id="Product"/);
  assert.ok(
    result.includes(
      `href="${localePath("/shop/", "ro")}" aria-label="Magazin">Magazin`,
    ),
  );
  assert.match(result, /data-language-link href="\/shop\/"/);
  assert.match(result, /"@type":"Product"/);
  assert.equal(localePath(toSitePath("/ro/shop/"), "en"), toSitePath("/shop/"));
  assert.equal(
    localePath(localePath("/shop/", "ro"), "ro"),
    localePath("/shop/", "ro"),
  );
});

test("every route has a static, translated counterpart and reciprocal language metadata", () => {
  const english = pages.filter((page) => page.locale === "en");
  assert.equal(english.length, 23);
  for (const page of english) {
    const ro = pages.find(
      (candidate) =>
        candidate.locale === "ro" && candidate.logicalRoute === page.route,
    );
    assert.ok(ro, page.route);
    assert.notEqual(page.title, ro.title, page.route + " translated title");
    const enHtml = readFileSync(
      new URL("../" + page.output, import.meta.url),
      "utf8",
    );
    const roHtml = readFileSync(
      new URL("../" + ro.output, import.meta.url),
      "utf8",
    );
    assert.match(enHtml, /<html lang="en"[\s>]/);
    assert.match(roHtml, /<html lang="ro"[\s>]/);
    if (toAbsoluteSiteUrl("/")) {
      for (const html of [enHtml, roHtml]) {
        assert.ok(
          html.includes(
            `hreflang="en" href="${toAbsoluteSiteUrl(page.route)}"`,
          ),
        );
        assert.ok(
          html.includes(`hreflang="ro" href="${toAbsoluteSiteUrl(ro.route)}"`),
        );
      }
    }
    const schemas = [
      ...roHtml.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ].map((match) => JSON.parse(match[1]));
    assert.ok(schemas.some((schema) => schema["@type"] === "Organization"));
    if (page.type === "product") {
      const product = schemas.find((schema) => schema["@type"] === "Product");
      assert.equal(product.name, "Prosop de uscare ZENO");
      assert.equal(
        product.offers,
        undefined,
        "No purchasable offer until availability is verified",
      );
      assert.ok(roHtml.includes("90,00"));
    }
  }
});

test("the bag persists stable IDs, survives a language change, and cannot create a checkout", () => {
  const saved = new Map();
  globalThis.localStorage = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
    removeItem: (key) => saved.delete(key),
  };
  globalThis.window = {
    location: { pathname: toSitePath("/products/drying-towel/") },
  };
  try {
    initializeCommerce();
    assert.equal(
      addLine({
        productId: "zeno-drying-towel",
        variantId: "single",
        quantity: 2,
      }),
      true,
    );
    assert.equal(addLine({ productId: "unknown", variantId: "single" }), false);
    window.location.pathname = toSitePath("/ro/products/drying-towel/");
    initializeCommerce();
    const line = getCart().lines[0];
    assert.equal(line.quantity, 2);
    assert.equal(getProduct(line.productId).currency, "RON");
    assert.equal(getProduct(line.productId).price * line.quantity, 180);
    updateLine(line.id, 200);
    assert.equal(getCart().lines[0].quantity, 99);
    assert.equal(canCheckout(), false);
    removeLine(line.id);
    assert.deepEqual(getCart().lines, []);
    localStorage.setItem = () => {
      throw new Error("Storage disabled");
    };
    assert.doesNotThrow(() =>
      addLine({ productId: "zeno-drying-towel", variantId: "single" }),
    );
    assert.equal(getCart().lines[0].quantity, 1);
  } finally {
    delete globalThis.localStorage;
    delete globalThis.window;
  }
});

test('every supported language has static pages and reciprocal language alternates', async () => {
  const { localeIds } = await import('../data/locales.js');
  for (const locale of localeIds) {
    for (const page of pages.filter(item => item.locale === locale)) {
      const html = readFileSync(new URL('../' + page.output, import.meta.url), 'utf8');
      assert.match(html, new RegExp(`<html lang="${locale}"[\\s>]`), page.output);
      if (toAbsoluteSiteUrl('/')) {
        for (const alternate of localeIds) {
          assert.ok(html.includes(`hreflang="${alternate}" href="${toAbsoluteSiteUrl(localePath(page.route, alternate))}"`), page.output + ' → ' + alternate);
        }
      }
      if (page.type === 'product') {
        const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
        assert.equal(schemas.find(item => item['@type'] === 'Product').name, getProduct('zeno-drying-towel', locale).name);
        assert.equal(schemas.find(item => item['@type'] === 'Product').offers, undefined);
      }
    }
  }
});

test('market prices are independent of language and cannot mutate product IDs or base data', async () => {
  const { localizedProduct, translate } = await import('../data/localization.js');
  const { products } = await import('../data/products.js');
  const { localeIds } = await import('../data/locales.js');
  const original = JSON.stringify(products);
  for (const locale of localeIds) {
    const eu = localizedProduct(products[0], locale, 'EU');
    const ro = localizedProduct(products[0], locale, 'RO');
    assert.equal(eu.currency, 'EUR'); assert.equal(eu.price, 22.85);
    assert.equal(ro.currency, 'RON'); assert.equal(ro.price, 90);
    assert.equal(ro.title, eu.title);
    assert.equal(ro.id, eu.id);
    assert.deepEqual(ro.variants.map(item => item.id), eu.variants.map(item => item.id));
    assert.equal(ro.variants[0].price, 90);
    assert.equal(eu.variants[0].price, 22.85);
    assert.equal(eu.compareAt, null);
  }
  assert.equal(JSON.stringify(products), original);
  assert.equal(translate(translate('Material', 'it'), 'it'), 'Materiale');
  assert.equal(translate(translate('Product', 'es'), 'es'), 'Producto');
  assert.equal(translate(translate('Contact', 'pt'), 'pt'), 'Contacto');
});

test('market URL overrides saved preferences and gracefully handles unavailable browser storage', async () => {
  const { currentMarket } = await import('../data/locales.js');
  globalThis.window = { location: { href: 'https://zenodetail.com/de/?market=RO' }, localStorage: { getItem: () => 'EU' } };
  try {
    assert.equal(currentMarket('de'), 'RO');
    window.location.href = 'https://zenodetail.com/ro/';
    assert.equal(currentMarket('ro'), 'EU');
    window.localStorage.getItem = () => { throw Error('Storage blocked'); };
    assert.equal(currentMarket('ro'), 'RO');
    window.location.href = 'https://zenodetail.com/de/?market=INVALID';
    assert.equal(currentMarket('de'), 'EU');
  } finally { delete globalThis.window; }
});

test('branch publication validates its source revision and rejects changed files or unsafe paths', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { digest, releasePath, validateBranchRelease } = await import('../scripts/branch-release.mjs');
  const root = mkdtempSync(join(tmpdir(), 'zeno-release-'));
  const revision = 'a'.repeat(40);
  try {
    mkdirSync(join(root,'assets'));
    const names = ['index.html','404.html','robots.txt','sitemap.xml','site.webmanifest'];
    for (const name of names) writeFileSync(join(root,name), name === 'index.html' ? `<meta name="build-revision" content="${revision}"><script src="/assets/app-12345678.js"></script>` : 'test');
    writeFileSync(join(root,'.nojekyll'),'');
    writeFileSync(join(root,'.pages-release.json'),JSON.stringify({sourceRevision:revision,files:Object.fromEntries(names.map(name=>[name,digest(join(root,name))]))}));
    assert.equal(validateBranchRelease(root,revision),revision);
    assert.throws(()=>validateBranchRelease(root,'b'.repeat(40)),/fresh branch release/);
    assert.throws(()=>releasePath(root,'assets/../../private'),/Invalid release path/);
    assert.throws(()=>releasePath(root,'.git/config'),/Unsupported release path/);
    writeFileSync(join(root,'index.html'),'changed');
    assert.throws(()=>validateBranchRelease(root,revision),/Release content changed/);
  } finally { rmSync(root,{recursive:true,force:true}); }
});
