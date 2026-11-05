// Original artwork generated for ZENO DETAIL. See docs/GENERATED-VISUALS.md.
export const images = {
  hero: {
    name: "workshop-car",
    width: 1536,
    height: 1024,
    alt: "Graphite estate car in a workshop, with natural daylight reflected on clean paint",
  },
  detail: {
    name: "drying-moment",
    width: 1536,
    height: 1024,
    alt: "Blue ZENO DETAIL towel resting on graphite paint in soft daylight",
  },
  towel: {
    name: "drying-towel",
    width: 1024,
    height: 1024,
    widths: [480, 768, 1024],
    alt: "AI product visualisation of a folded blue microfiber towel with black edging",
  },
};

export function imageFiles(image) {
  return (image.widths ?? [480, 960, image.width])
    .filter((value, index, all) => all.indexOf(value) === index)
    .flatMap((width) =>
      ["avif", "webp"].map(
        (format) => `/assets/images/editorial/${image.name}-${width}.${format}`,
      ),
    );
}
