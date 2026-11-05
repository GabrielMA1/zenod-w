export const articles = [
  {
    id: "how-to-dry-your-car",
    route: "/journal/how-to-dry-your-car/",
    title: "How to dry your car after washing",
    teaser: "A little patience. A clean towel. A better finish to your wash.",
    category: "The routine",
    readingTime: "4 min read",
    image: "hero",
    description:
      "Learn a careful car-drying routine: work in the shade, inspect your microfiber towel, dry from the roof down and keep dirty towels off clean paint.",
    sections: [
      {
        title: "Start with a properly washed surface",
        paragraphs: [
          "Drying belongs at the end of a wash, after loose dirt and shampoo have been rinsed away. Wiping a dusty or gritty panel with a drying towel can drag contamination across the finish.",
          "Work in the shade when possible, with the bodywork cool to the touch. Hot panels allow water to evaporate quickly, which can leave mineral deposits before you have time to dry.",
        ],
      },
      {
        title: "Check your towel before it touches the car",
        paragraphs: [
          "Choose a clean microfiber towel intended for vehicle drying. Inspect both sides for grit, debris or hardened residue. If the towel falls on the ground, put it aside for washing and use a clean one.",
          "Keep towels used on wheels, tyres and lower dirty areas separate from those used on paint. A fresh-looking towel is not necessarily free from contamination.",
        ],
      },
      {
        title: "Work from the roof down",
        paragraphs: [
          "Start with the roof, glass and upper body panels, then work down. Fold your towel to give yourself clean sections and change the contact face as you go. Use gentle contact and avoid pressing grit into the surface.",
          "Pat or use a controlled, light pass according to the towel maker’s guidance. When a towel becomes saturated, switch to another clean towel. Repeated scrubbing is not a substitute for a fresh drying surface.",
        ],
      },
      {
        title: "Finish with the places water collects",
        paragraphs: [
          "Check mirror housings, door handles and panel gaps for drips. Open doors only where safe and use a separate clean towel for the jambs. Keep those towels out of your paintwork rotation.",
          "Inspect the finish in good light. If you find a water mark, use a method suitable for the paint or coating and follow its manufacturer’s guidance; do not try to remove stubborn deposits by rubbing harder.",
        ],
      },
    ],
  },
  {
    id: "microfiber-towel-care",
    route: "/journal/microfiber-towel-care/",
    title: "A better routine for your microfiber",
    teaser:
      "Keep your drying towel ready for the next wash, and the one after that.",
    category: "Care notes",
    readingTime: "3 min read",
    image: "towel",
    description:
      "Practical microfiber towel care: separate dirty towels, follow the care label, avoid fabric softener, and store clean towels away from dust.",
    sections: [
      {
        title: "The care label comes first",
        paragraphs: [
          "Microfiber towels differ in fibre blend, construction and edging. Always follow the care label for detergent, wash temperature and drying method. These general tips do not replace a product’s specific washing instructions.",
        ],
      },
      {
        title: "Separate towels by the job they do",
        paragraphs: [
          "Wash paintwork towels separately from cloths that have collected wheel grime, oily residue or polishing compound. Avoid mixing microfiber with cotton items that shed lint.",
          "Do not leave a wet towel bundled up in a closed bag. Let it air out until you can clean it, keeping it away from dusty floors and dirty surfaces.",
        ],
      },
      {
        title: "Keep the wash simple",
        paragraphs: [
          "Use a detergent suitable for microfiber and the care label’s recommended amount. Fabric softener and dryer sheets can leave residues that change how the fibres interact with water, so leave them out.",
          "Avoid bleach or high heat unless the towel maker explicitly permits them. Check the label before choosing a washing or tumble-drying programme.",
        ],
      },
      {
        title: "Store it clean, dry and protected",
        paragraphs: [
          "Make sure towels are fully dry before storing them in a clean, covered container. Keep paintwork towels separate from towels reserved for wheels, engine bays or household cleaning.",
          "Before the next wash, check the surface and edging again. Retire a towel from paintwork duty if it is contaminated, hardened or damaged.",
        ],
      },
    ],
  },
  {
    id: "choosing-a-drying-towel",
    route: "/journal/choosing-a-drying-towel/",
    title: "What matters in a car drying towel?",
    teaser:
      "Look beyond a big number. Choose the towel that fits your routine.",
    category: "Buying well",
    readingTime: "4 min read",
    image: "detail",
    description:
      "Compare car drying towels by intended use, dimensions, construction, care requirements and total delivered price, without relying on unsupported claims.",
    sections: [
      {
        title: "Choose for the job",
        paragraphs: [
          "A towel used to dry a freshly washed car has a different job from a cloth used on wheels or interior trim. Start by checking its intended use and the maker’s guidance.",
          "Consider how you wash: a large vehicle, limited drying space or a preference for smaller folded towels can change which size is comfortable to handle.",
        ],
      },
      {
        title: "GSM is one detail, not the whole story",
        paragraphs: [
          "GSM describes the fabric’s mass per square metre. It does not, by itself, tell you how much water a towel will absorb or how it will behave on your paint.",
          "Dimensions, fibre construction, edging, cleanliness and technique all matter. Treat an advertised absorption figure as a test claim: look for the conditions and evidence behind it.",
        ],
      },
      {
        title: "Compare like for like",
        paragraphs: [
          "When comparing prices, check the towel’s dimensions, number of towels in the pack and intended use. Include delivery charges and any applicable taxes in the total.",
          "A bundle only offers value if you need its contents. Look for clear current prices and genuine savings instead of treating every crossed-out price as proof of a good deal.",
        ],
      },
      {
        title: "Give care information the same attention",
        paragraphs: [
          "A product page should make its verified material details and care information easy to find. If a specification is missing, ask the seller before relying on it.",
          "Choose a towel you can wash, dry and store properly. A careful routine and a clean contact surface matter each time you use it.",
        ],
      },
    ],
  },
];

export function getArticle(id) {
  return articles.find((article) => article.id === id);
}
