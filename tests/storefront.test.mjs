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
  assert.equal(en.price, 18);
  assert.equal(en.currency, "EUR");
  assert.equal(ro.price, 90);
  assert.equal(ro.currency, "RON");
  assert.match(formatPrice(en), /€18\.00/);
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
    assert.match(enHtml, /<html lang="en">/);
    assert.match(roHtml, /<html lang="ro">/);
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
