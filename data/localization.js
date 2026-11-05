import { stripBasePath, toSitePath } from "./deployment.js";
import { romanian } from "./romanian.js";

export function currentLocale() {
  return typeof window !== "undefined" &&
    /^\/ro(?:\/|$)/.test(stripBasePath(window.location.pathname))
    ? "ro"
    : "en";
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const translationPattern = new RegExp(
  Object.keys(romanian)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|"),
  "g",
);

export function translate(value, locale = currentLocale()) {
  if (locale !== "ro" || typeof value !== "string") return value;
  return value.replace(translationPattern, (match) => romanian[match]);
}

export function localePath(path, locale = currentLocale()) {
  const logical = stripBasePath(path).replace(/^\/ro(?=\/|$)/, "") || "/";
  return toSitePath(locale === "ro" ? `/ro${logical}` : logical);
}

export function localizeMarkup(markup, locale = currentLocale()) {
  if (locale !== "ro") return markup;
  const translated = markup
    .split(/(<script\b[\s\S]*?<\/script>)/g)
    .map((part) => {
      if (part.startsWith("<script")) return part;
      return part.replace(/<[^>]+>|[^<]+/g, (token) => {
        if (!token.startsWith("<")) return translate(token, locale);
        return token.replace(
          /(aria-label|alt|title|placeholder|content)="([^"]*)"/g,
          (_, name, value) => `${name}="${translate(value, locale)}"`,
        );
      });
    })
    .join("");
  return translated.replace(/<a\b[^>]*>/g, (tag) => {
    if (tag.includes("data-language-link")) return tag;
    return tag.replace(/href="(\/[^\"]*)"/, (_, path) => {
      if (stripBasePath(path).startsWith("/assets/")) return `href="${path}"`;
      return `href="${localePath(path, locale)}"`;
    });
  });
}

export function localizedProduct(product, locale = currentLocale()) {
  if (!product) return null;
  if (locale !== "ro") return product;
  const localize = (value, key) => {
    if (
      [
        "id",
        "handle",
        "categoryId",
        "placeholderVariant",
        "src",
        "zoomSrc",
        "image",
        "status",
      ].includes(key)
    )
      return value;
    if (typeof value === "string") return translate(value, locale);
    if (Array.isArray(value)) return value.map((item) => localize(item));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([name, child]) => [
          name,
          localize(child, name),
        ]),
      );
    return value;
  };
  const result = localize(product);
  result.slug = `/ro${product.slug}`;
  result.price = product.regionalPrices?.RON ?? null;
  result.currency = "RON";
  result.variants = result.variants.map((variant) => ({
    ...variant,
    price:
      product.variants.find((item) => item.id === variant.id)?.regionalPrices
        ?.RON ?? (variant.id === "single" ? result.price : null),
  }));
  return result;
}
