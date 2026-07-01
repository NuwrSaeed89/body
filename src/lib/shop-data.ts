import type { ProductStats } from "@/lib/product-stats";

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
  /** VAT-inclusive catalog price in SEK. */
  priceSek: number;
  category: ShopCategory;
  badgeKey?: "new" | "limitedRelease" | "bestSeller";
  stockStatus?: "in-stock" | "low" | "out-of-stock";
  stockLeft?: number;
  image: string;
  imageAlt: string;
  colors?: string[];
};

export type ProductDetail = Omit<ShopProduct, "colors"> & {
  series: string;
  description: string;
  /** Denormalized engagement counters (products.view_count, like_count, etc.). */
  stats: ProductStats;
  stockLeft: number;
  images: Array<{ src: string; alt: string }>;
  /** GLB URL for interactive 3D product view (model-viewer). */
  modelGlbUrl?: string;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
};

/** Placeholder GLB until per-product assets are uploaded. */
const DEMO_GLB_URL =
  "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

/** Mock stats aligned with database/008_seed_catalog.sql engagement seed. */
const MOCK_PRODUCT_STATS: Record<string, ProductStats> = {
  "sculpt-leggings": { viewCount: 1240, likeCount: 186, waitingCount: 0, unitsSold: 412 },
  "zen-flow-bra": { viewCount: 890, likeCount: 142, waitingCount: 0, unitsSold: 278 },
  "essence-seamless-top": { viewCount: 640, likeCount: 98, waitingCount: 3, unitsSold: 156 },
  "terra-ribbed-shorts": { viewCount: 520, likeCount: 76, waitingCount: 12, unitsSold: 94 },
  "power-set": { viewCount: 710, likeCount: 118, waitingCount: 0, unitsSold: 201 },
  "aero-flow-leggings": { viewCount: 980, likeCount: 164, waitingCount: 0, unitsSold: 335 },
  "elite-bra": { viewCount: 430, likeCount: 67, waitingCount: 0, unitsSold: 112 },
  "performance-headband": { viewCount: 210, likeCount: 34, waitingCount: 0, unitsSold: 88 },
};

const DEFAULT_PRODUCT_STATS: ProductStats = {
  viewCount: 420,
  likeCount: 64,
  waitingCount: 0,
  unitsSold: 96,
};

function getMockStatsForSlug(slug: string): ProductStats {
  return MOCK_PRODUCT_STATS[slug] ?? DEFAULT_PRODUCT_STATS;
}

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

const TOP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBghrGHdipO4TPdjJQzMSbKWeGziZKEGJnS-oeGXCU5151P3jT8tkdCZPZ0AAGfuz9mb1FMkk1rOya3D6wfP8FVVjCRTKaXS2jdL2al7ldcejbWye2-VIk3Yr6pb-mjk8035JYfehkrXIpKWCXlKaPzp_5V-iChKKM2YCmIiPNTree9GDxH-Cv-nTqP9Z1dUwcCybyBs3xpshvL-yRPO2YdQOBcIDB8gXWLf93pR5Xt5nV8FIXVtU4nkSaoBc5Y6SM-SfdoZPR7dfA";

const ZEN_BRA_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtar0I75HatgKN4jX09VnRrOQaj3mXdyW1L4GRiVLlmhWZwp7yNNdihLEfkwRNSg9VY-jGTEoWOaDjUFhcmdgOq6kDD5mIpparV841KySQp2f5xg7ridAyrKQ5LKi-pS35a0W3Qxdoj2Gn_BM91Cjy5cP491DBPk2dcP5bZ1DRCm3b5Z0kfvpCYXBumei5wjrQpdWP1zRHq4kNd5M3aaXbBzj7oHXnii6MUZNwDzgZ7AMxjMNgegQP1x4Q_ILP-TduZEnB-wRn5VQ";

const TERRA_SHORTS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAazS27C55ywxPpQf2v5wRlMu7VfRGt6zrYYHEPvI05xI3tfT8mbjeheB4r99FH2CyRqd0Zd--I8CBgHg67kxHyzIgtm0vm8hzj14Jx64sgL3zHEzZ1YvzDf78smKU-gs6U5y1inENTG6Yg3d882AZovxKRAYBeFd2O1E9iRGS34-Tz6iBwhW2TTEaMetpq9g_7Xre9hasEzLx48jMz9fa5UcqhOBAriSVAgl13MyW7kAgyShOvlgImI-qx1kpOu4Lav42505oAODI";

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "core-sculpt-leggings",
    slug: "sculpt-leggings",
    name: "Core Sculpt Leggings",
    priceSek: 1150,
    category: "leggings",
    badgeKey: "new",
    image: LEGGINGS_IMAGE,
    imageAlt: "Core sculpt leggings in charcoal grey",
  },
  {
    id: "zen-flow-bra",
    slug: "zen-flow-bra",
    name: "Zen Flow Sports Bra",
    priceSek: 750,
    category: "sports-bras",
    badgeKey: "limitedRelease",
    image: ZEN_BRA_IMAGE,
    imageAlt: "Zen Flow sports bra",
  },
  {
    id: "essence-seamless-top",
    slug: "essence-seamless-top",
    name: "Essence Seamless Top",
    priceSek: 880,
    category: "tops",
    stockStatus: "low",
    stockLeft: 3,
    image: TOP_IMAGE,
    imageAlt: "Essence seamless top",
  },
  {
    id: "terra-ribbed-shorts",
    slug: "terra-ribbed-shorts",
    name: "Terra Ribbed Shorts",
    priceSek: 720,
    category: "shorts",
    stockStatus: "out-of-stock",
    image: TERRA_SHORTS_IMAGE,
    imageAlt: "Terra ribbed shorts",
  },
  {
    id: "power-set",
    slug: "power-set",
    name: "The Power Matching Set",
    priceSek: 2190,
    category: "matching-sets",
    badgeKey: "limitedRelease",
    image: LEGGINGS_IMAGE,
    imageAlt: "Power matching set",
  },
  {
    id: "aero-flow-leggings",
    slug: "aero-flow-leggings",
    name: "Aero-Flow Leggings",
    priceSek: 990,
    category: "leggings",
    image: LEGGINGS_IMAGE,
    imageAlt: "Aero-flow leggings",
  },
  {
    id: "elite-bra",
    slug: "elite-bra",
    name: "Elite Support Bra",
    priceSek: 750,
    category: "sports-bras",
    image: BRA_IMAGE,
    imageAlt: "Elite support bra",
  },
  {
    id: "performance-headband",
    slug: "performance-headband",
    name: "Performance Headband",
    priceSek: 265,
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
    priceSek: 990,
    category: "leggings",
    badgeKey: "new",
    image: PDP_GALLERY[0].src,
    imageAlt: PDP_GALLERY[0].alt,
    description:
      "High-rise sculpting leggings engineered with four-way stretch compression. Seamless construction, moisture-wicking finish, and a second-skin feel for studio to street.",
    stats: getMockStatsForSlug("sculpt-leggings"),
    stockLeft: 5,
    images: PDP_GALLERY,
    modelGlbUrl: DEMO_GLB_URL,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal Black", hex: "#121212" },
      { name: "Basalt Grey", hex: "#3D3E3F" },
      { name: "Stone", hex: "#E5E5E0" },
    ],
  },
};

export function getShopProductById(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): ProductDetail | undefined {
  if (PRODUCT_DETAILS[slug]) return PRODUCT_DETAILS[slug];
  const shopProduct = SHOP_PRODUCTS.find((p) => p.slug === slug);
  if (!shopProduct) return undefined;
  return {
    ...shopProduct,
    series: "MBODY",
    description: `${shopProduct.name} — premium performance activewear with sculpted fit and technical fabrics.`,
    stats: getMockStatsForSlug(slug),
    stockLeft: shopProduct.stockStatus === "out-of-stock" ? 0 : shopProduct.stockLeft ?? 12,
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
