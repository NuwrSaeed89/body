export type AccountOrderStatus = "inTransit" | "delivered" | "shipped";

export type AccountOrder = {
  id: string;
  title: string;
  status: AccountOrderStatus;
  date: string;
  itemCount: number;
  totalSek: number;
  estDelivery?: string;
  image: string;
  imageAlt: string;
};

export const DEFAULT_PROFILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADwfOXTuNe-DkPPxKm_ZZktqxYuT047v1aXk-J46xap2r2x_pBWCsgDeKihvhinsdoolKU_AIKldH243m62hmKa0eAYlnpJypD1IJpZM109F7oEgAQ-JPk_WCs1z-3LRoUrsSSQ1Bsja7fSOW6CRHCkP8F9kORjmvddXcxI-05TDSnI8tEKkOBPZesWk_i4qMdyNY40-YOpDIc46c3aLmXclY84u4etZIuGkqbyqtw6vhcd41BQ3Kj";

export const FEATURED_ACCOUNT_ORDER: AccountOrder = {
  id: "MB-99214",
  title: "Performance Compression Set",
  status: "inTransit",
  date: "2024-06-12",
  itemCount: 1,
  totalSek: 1850,
  estDelivery: "Tomorrow",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDtMLsOlF37trbmAdSrbbhJHA_MaZd7XMnbBeUR9wbW8C7TWbpotHxTBJKUreaqKh4gK2bnfW4597D7w61yku6csHPZ0oc-D9Mx1r0YkcZL8wHmY23cIWz_h9goVXqVQ1IOq8jpvjxbO-xC-DSh7k71PiB6V7DEmOW811HcgmBL60ojUo2w5CYzbTfa7x9ltiUdRCAM0OwBWYR3Xx4Zf9gnmUSz4ynbk8oN0WdkXz7FeEF1QWc6j7eO",
  imageAlt:
    "Black performance compression set on a minimalist white mannequin with premium studio lighting.",
};

export const MOCK_ACCOUNT_ORDERS: AccountOrder[] = [
  FEATURED_ACCOUNT_ORDER,
  {
    id: "MB-88542",
    title: "Aero-Knit Training Jacket",
    status: "delivered",
    date: "2023-09-12",
    itemCount: 1,
    totalSek: 1450,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2rVZhLNRMbQggLR1PeiJ3Ebv9HwRH5MzKusu0OK2MTZQStHUGJDxvaXNnzHzh6F7_2_g0AmoTZnsykEtQ0Yp6-BaOPWREpEN-ElHwnZlq1Q4EFoTJPJo0WBwyH8Y3mWkpV6w_swMBhnBGxECylAGaITsKH1lJr1KSX60ldVPVk4akOVdfoGXWGAeGHns-xkTM0GWdwimhDSQWib01rdMAzkhMQb1FZ0ihAiEWipEKyVGutycBo9nSBs2TnvMxTUtZH2stXXiKbOM",
    imageAlt:
      "Premium athletic zip-up jacket in light limestone with minimalist silhouette.",
  },
];

export const MOCK_WISHLIST_ITEMS = [
  {
    id: "seamless-sculpt-bra",
    name: "Seamless Sculpt Bra",
    priceSek: 680,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEefjpmApwiO__cYryBFWrcdecjbizj_5PFWMnHSQ2ujskyq-y5lgvCT1xlbXwhvN8klDQ1N3v5jeq_s0OLNGYehZjckleZa5ndxFS7tpMe9E9RkWv0mxeQf-kMuSQXUiOMmj50SS-6w7DL6UQr87lbUmc30gZNV1FRCpLCnI1FDS-HSuGUoSyVFjHHyB39UkfVwgUIOkB4E40Jjd9Pz9uRTPV48MLjHn9OtAFft0JUCtvvjeikZQJkLfzm2dard4wHG-J9NJwYo4",
    imageAlt: "Seamless sports bra in obsidian black on a neutral studio backdrop.",
  },
  {
    id: "aero-light-shorts",
    name: "Aero-Light Shorts",
    priceSek: 550,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHFa5uNZ4-0wGqxcUzGLSfSpVTG7c3Q76imChby1suht1-ZSYmLQ939OLZ1cjsSbdcT3XsYNSMEgOdomDy6vWvhKxb1QgIeQagUrOy0GPafz5NAlVLe5EO1kpQfU_fUrZ8VGeKPEOgnfbJbSrfsB1XiJAWoMFmj2O0EMpu_R1QUew0Rq0mA5bmFGS_fIPYA0Wbu-8JrsIrumIJWG9e2bQmMamtzTxGPUa-wNjRpp0vZzdlcAioAmYQzEJQovZOnc-O86iMhsRxk7I",
    imageAlt: "High-waisted performance shorts in soft taupe with luxury studio lighting.",
  },
] as const;
