export type ShopCategory =
  | "all"
  | "leggings"
  | "sports-bras"
  | "tops"
  | "shorts"
  | "matching-sets"
  | "accessories";

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  category: ShopCategory;
  badgeKey?: "new" | "limitedRelease" | "bestSeller";
  image: string;
  imageAlt: string;
  colors?: string[];
};

export type ProductDetail = Omit<ShopProduct, "colors"> & {
  series: string;
  description: string;
  socialProof: string;
  stockLeft: number;
  images: Array<{ src: string; alt: string }>;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
};

const LEGGINGS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzEQA-iy1d5qkRDPEgXv2zaN-rsbH53gs9bhijbcCoRRUWYFymm09wSZv-NChprTcCJknOzluGYvsaKEhI1I_ASSVccuxG2Ox0V-35Y7-6xKZ_Vr1uq1-0kq20Rp3-TmIiasfuMx9WB7-mxWBIXQm_4gEdvw2Ew2iKHQ620-2TkkK5oPCyxNpwihJYJi4EeFGvkJkJeLyUtR6QxnZX5tMAE-WaLa94KhQt7r1QfT9cQw3jIvf8AlQWMluenSgoXq1r1IR5v50p3hs";

const BRA_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkOkzJ4EZPQkYUdePA2SoqY6SexRTyQgL4-eL-soshRyMEAmUQmJVmAn4jJeIlkOVu_PoJDs5ipCma0OMZ9_UI5hA_XPt4M3ew9ndY_jSJHCTSCapaOHapMGWMPCrVuB27UJ0xAc7keSk_RQeyPAaqZx55IDhBquurxxQ6KoxMWijvCRXEq-2-1KMLuHMgLX0bjxNvyZ7hP50n0N1HM7xcYEQ_NIhi314MV75ISv2qPj63UjO5DwqE1C85ZxUX37iKPrv7QmgnYE";

const SHORTS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZEMTAp7BcRPMV8Rg5ASgdw8pi9fLe9-vgN19C3fxF2UVOS5d3dm5DseAGzrrcRv5jnQ1CXVDW2fPOAqaWAnBdpHQXT28l9dVMmQAUEMfuqjC8bvA0hJIfZ1vQuUXGavCyqDg8G19QHJk4CeGdG5oaJM0WMs1Ugsw483sc7YyYJhQLCcmuUKej7VREBev-XF3hOOx4F7057PxYvUAkwhGinea668heT3kfGTlc9FO3J4Pp6HuwI_3fQrjHxRmp8Vz6PTAGd9inZr0";

export const SHOP_CATEGORIES: ShopCategory[] = [
  "all",
  "leggings",
  "sports-bras",
  "tops",
  "shorts",
  "matching-sets",
  "accessories",
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "core-sculpt-leggings",
    slug: "sculpt-leggings",
    name: "Core Sculpt Leggings",
    price: "€89",
    category: "leggings",
    badgeKey: "new",
    image: LEGGINGS_IMAGE,
    imageAlt: "Core sculpt leggings in charcoal grey",
  },
  {
    id: "seamless-support-bra",
    slug: "seamless-support-bra",
    name: "Seamless Support Bra",
    price: "€59",
    category: "sports-bras",
    image: BRA_IMAGE,
    imageAlt: "Seamless support bra",
  },
  {
    id: "flow-crop-top",
    slug: "flow-crop-top",
    name: "Flow Crop Top",
    price: "€49",
    category: "tops",
    badgeKey: "bestSeller",
    image: BRA_IMAGE,
    imageAlt: "Flow crop top",
  },
  {
    id: "stride-shorts",
    slug: "stride-shorts",
    name: "Stride Performance Shorts",
    price: "€65",
    category: "shorts",
    image: SHORTS_IMAGE,
    imageAlt: "Stride performance shorts",
  },
  {
    id: "power-set",
    slug: "power-set",
    name: "The Power Matching Set",
    price: "€199",
    category: "matching-sets",
    badgeKey: "limitedRelease",
    image: LEGGINGS_IMAGE,
    imageAlt: "Power matching set",
  },
  {
    id: "aero-flow-leggings",
    slug: "aero-flow-leggings",
    name: "Aero-Flow Leggings",
    price: "€89",
    category: "leggings",
    image: LEGGINGS_IMAGE,
    imageAlt: "Aero-flow leggings",
  },
  {
    id: "elite-bra",
    slug: "elite-bra",
    name: "Elite Support Bra",
    price: "€68",
    category: "sports-bras",
    image: BRA_IMAGE,
    imageAlt: "Elite support bra",
  },
  {
    id: "performance-headband",
    slug: "performance-headband",
    name: "Performance Headband",
    price: "€24",
    category: "accessories",
    image: SHORTS_IMAGE,
    imageAlt: "Performance headband",
  },
];

const PDP_GALLERY = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCphuXgWNNnxzcIcAUimpbsIdhp2ImorKJN27oxxvrwHNOuOwDLggHl1nD1DMzF-r3WRpG9QtyjFgOzXDbhJi6zuf7-qY9Y0N_WpGdbU_9ee_t8GndU_4W1NHr9qpwL05kudzin3IN-SRQNt5uxCk9fe7o47tKeX3Ahscw04Jez51Pd3cRoFowVPOWkunGsqYcpW9HqT09k5xTrEjWOVd6z9Pew-U96njvXU2Ui6N6iLHK_ym_Y-yo1NY5-gNuViv2llyyCpE1gCfw",
    alt: "Sculpt high-rise leggings full body studio shot",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuABGZANuCWWO-DRiVkqdHDKzFJimfp7TISyTGoFtemW0kZ7g4-967bYRmlAqezvHkpQg5jSoSpBj8lNfVdEOEo4gxrynBEdTEmVox71xkfOQhNylfvfZp2g-xb6h-SgAPYK4h_BRlpPhgOVYSzNCuPNL5G2Sb9g39GJ2iyWBGxal2H2Cl-BYqaJwds-vhQ0yaXb750-2aqBXSsSiNbVTHG0KNxVI4-JZoh071CgAvWR81Cl7YNxH5U6UvimcACWli4cINuhC3PjO0g",
    alt: "Close-up of sculpt leggings waistband",
  },
  {
    src: LEGGINGS_IMAGE,
    alt: "Sculpt leggings side profile",
  },
];

export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  "sculpt-leggings": {
    id: "sculpt-leggings",
    slug: "sculpt-leggings",
    name: "Sculpt High-Rise Leggings",
    series: "PREMIUM COLLECTION",
    price: "€89",
    category: "leggings",
    badgeKey: "new",
    image: PDP_GALLERY[0].src,
    imageAlt: PDP_GALLERY[0].alt,
    description:
      "High-rise sculpting leggings engineered with four-way stretch compression. Seamless construction, moisture-wicking finish, and a second-skin feel for studio to street.",
    socialProof: "1,240+",
    stockLeft: 5,
    images: PDP_GALLERY,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal Black", hex: "#121212" },
      { name: "Basalt Grey", hex: "#3D3E3F" },
      { name: "Stone", hex: "#E5E5E0" },
    ],
  },
};

export function getProductBySlug(slug: string): ProductDetail | undefined {
  if (PRODUCT_DETAILS[slug]) return PRODUCT_DETAILS[slug];
  const shopProduct = SHOP_PRODUCTS.find((p) => p.slug === slug);
  if (!shopProduct) return undefined;
  return {
    ...shopProduct,
    series: "MBODY",
    description: `${shopProduct.name} — premium performance activewear with sculpted fit and technical fabrics.`,
    socialProof: "840+",
    stockLeft: 12,
    images: [{ src: shopProduct.image, alt: shopProduct.imageAlt }],
    sizes: ["XS", "S", "M", "L"],
    colors: [{ name: "Charcoal Black", hex: "#121212" }],
  };
}

export function getAllProductSlugs(): string[] {
  const slugs = new Set(SHOP_PRODUCTS.map((p) => p.slug));
  Object.keys(PRODUCT_DETAILS).forEach((slug) => slugs.add(slug));
  return Array.from(slugs);
}
