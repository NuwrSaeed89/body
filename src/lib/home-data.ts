export type CarouselProduct = {
  id: string;
  name: string;
  /** VAT-inclusive catalog price in SEK. */
  priceSek: number;
  color: string;
  badgeKey?: "new" | "limitedRelease";
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
};

export type BentoTile = {
  id: string;
  title: string;
  label?: string;
  cta?: string;
  image: string;
  imageAlt: string;
  variant: "feature" | "tile";
  href?: string;
};

export type Product = {
  id: string;
  series: string;
  name: string;
  /** VAT-inclusive catalog price in SEK. */
  priceSek: number;
  badgeKey?: "limitedRelease" | "exclusive" | "bestSeller";
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
  colSpan?: "feature" | "default";
};

export const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwruB1y1uBWIFYtkB7Fx_yKve7ln51ZL0y5dQQRIo1i-e7wkS-OIDcjLL-gdY7XgHmKO_ISYyaTF06txdWz8sXgUlmo2jv5S0D1aoJzn27q9YC_qy3e911r1pupxULgvAl0OklwsLsAmIszufuPGMNU47sp0Pud9nQYdLHOESxpQBdZE4pEqwhz2UZ4MxKl01qsm_P2z4RrAM1MOMFV-QpEplibGvi6HhpKTW7aX_ZAKF9b7hmKl9uTQIpmwR_7pF0ZwgTPScMCDU";

export const HERO_IMAGE_DESKTOP = HERO_IMAGE;

export type DropProduct = {
  id: string;
  name: string;
  color: string;
  /** VAT-inclusive catalog price in SEK. */
  priceSek: number;
  badgeKey?: "limited";
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
};

export const LATEST_DROP_PRODUCTS: DropProduct[] = [
  {
    id: "aero-pro-legging",
    name: "Aero Pro Legging",
    color: "Bone White",
    priceSek: 1200,
    badgeKey: "limited",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBTzYjUYv_QcXdDzfX_1IJrLTyPoLU-CVwkpYmoJjoFuQWnqhGl36MsUiEToAvljDnD7dUyczwWx7SNVgnX3dEEOGFaeHMd_LbR4YAfutXfpKtk8cpVBAQYaSx2Ki8hU0Zao46Pf52J2FOABnc3w3G3UTB2NmQey0Fx6dcKkpH9a-eLtzlpvOwwujhgvFJfKmKqQLoxedsAgdaMz2QwH7sZAl1QWzUaBtbYo8AYeo9wGjxTMKJN13nrshaD7pxNDiSGe3XIlC3jFo",
    imageAlt: "Aero Pro Legging in bone white",
    href: "/shop/sculpt-leggings",
  },
  {
    id: "aero-sculpt-bra",
    name: "Aero Sculpt Bra",
    color: "Obsidian",
    priceSek: 850,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAWwlDJTdOuaXiLQ9Gy7YcxCGlKtdZfWf3Ld5SlWKeF0609USQ_BAKiOt8syqEhlLUh_PdSlN3WFfP0Xg3lnH5QQtAYTgMVbguzpfM_4VNUwyVsRmgBjoFV2VUFaWy3HcXsd8i4Ja5N2ZlvE1UAbCLVDw9JG2HuS3lC0M8-wfaPRmwtYuYSAFgmQ98dMziVeijst73l4mFKs66BMZRtdwSsYluUw2h78J8RR2JeBo_27i39TfcWBOMMLor5J3HX_IWHz7KIriKEmI",
    imageAlt: "Aero Sculpt Bra in obsidian black",
    href: "/shop/seamless-support-bra",
  },
  {
    id: "aero-shell-jacket",
    name: "Aero Shell Jacket",
    color: "Eclipse",
    priceSek: 1950,
    badgeKey: "limited",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCOhXvtviNQMr9JS7FgQ7eFni7DuP76nUvvQAvuhaD-CCUUY2YKBwmzYEDtFt163bg2RkR0ZkzV1Q29HuGW0IrtdYbFhDAzP32jO2W3vVHDDGXBPXom17AzbZOfFGSkBZg1J1E3iI3QFwJYQGLPk2_ZJAkzizl7Hi_xmQ36yIKupvl7tU9aDHyOzF5aAxBDRi9mkS925qPjUadIVrgQ_ZHWz7L5rUr4WJczXSYZhqerwkzwq1PJRcIm4mM3RaZT4i0y8YDcmcJILg",
    imageAlt: "Aero Shell Jacket in eclipse charcoal",
    href: "/shop",
  },
  {
    id: "aero-tech-tee",
    name: "Aero Tech Tee",
    color: "Graphite",
    priceSek: 950,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAiTXqY3JSqx_T53R-mYGe8gbArenJK5gJvqTkcBgvg0ENKE9iOmP9W7K9kTL0TgQ8UPt9KLFPZLpLQgW4d1MrSy3iINQoxeWsF_R4nI-DIBL9bw4_Ij6aF271ALmqxhfDh6Up48Pwta-eplMNt2AdGEF0yQW4Xk5ZfTOb7LoCDCAnsnYnx6j6Vc2uHQFtXVJoHuch8UIrc5HpyGGEw8hY7PBwEe8JeLnzbpyROl3VCCPbCe5q0MztSMw-4TBDwc5fXCYbRklAQcWg",
    imageAlt: "Aero Tech Tee in graphite",
    href: "/shop",
  },
];

/** @deprecated Use LATEST_DROP_PRODUCTS */
export const LATEST_DROPS_CAROUSEL: CarouselProduct[] = LATEST_DROP_PRODUCTS.map(
  (p) => ({
    id: p.id,
    name: p.name,
    priceSek: p.priceSek,
    color: p.color,
    badgeKey: p.badgeKey === "limited" ? "limitedRelease" : undefined,
    image: p.image,
    imageAlt: p.imageAlt,
    href: p.href,
  }),
);

export const SCULPT_COLLECTION = {
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCt4TO5K_Cdrp7arPStUCOir64rDyRhcEJ-x1rRTUUIxz5_QhVqtAxIqK5HdYMmc6DTiaTIwLrTR9Biklfz21fxdPc2Bp4PNNIsZj1AxOjQI5inqtuJi8fUgdsF5ro2erNwDwoKxBo7mF1BgERTnpmGV3678lFfkfsgwZ39fSa9fmisdra-h_vHHGoADFcgGrASvR62XwHjPcRdC4itlTqOAlt06nZOg_8qZjN3IfalojbAzj8lh0JrtPKrBexFqzqUs2tk9M9tOyM",
  imageAlt:
    "Athlete in monochromatic activewear walking through minimalist concrete architecture",
  fabricImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC7oxc_FOjPZLIisoOU0cScEUuTA1ePHMk3ouRxb1nN1tajniFbOXhfhFtmKUC93b21EfVzbJuuapAQ7oFyl9UYsWE0JVXxoG2nevcz2zZ5tvlZe2rqMXp2bnf3iZluRuqwgzU5KFZmbpM3hDUoKNukfa7juX2G43Fd8lC36O_0mbSIItCzdcPRXrhnWDidKEFuJ6CX7tq6W1l4CQs5sNsr1D0sSpLgWX0tb-Esme76-DYo6pW-pGTb_0Ty7YqNurV8T_SD6iQrjYw",
  fabricImageAlt: "Close-up of premium athletic fabric weave",
  href: "/shop",
};

export const CORE_ELEMENTS: BentoTile[] = [
  {
    id: "monochrome-series",
    title: "The Monochrome Series",
    cta: "EXPLORE",
    variant: "feature",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjCHVB1UjyVSxh_WCCeTf6u_No1eOfk2mOlaNRsbPwehiPqZiOY6q4BJEng6yRbbf7rk2SrnfO1-hAp5d3IlQr7UQ1Q0MBgDM_ugaCYi500v3FYhvt5GMXIWvijGUfSP9Veh7VgZ-H2I5NYSArlWMKdzqxWBntWddZ-FChMMM3gI9OXkx6VvaIAYs4EmQIwDMZ1KHof0gCYOR7fKKqh72KQfhZBtWG0fn0CNDIlX9NCdfWzxPzdHeaNOqSZ4fYJshDkKZjwTeTlgI",
    imageAlt: "Athletes in monochromatic activewear sets",
    href: "/shop",
  },
  {
    id: "textures",
    label: "TEXTURES",
    title: "Textures",
    variant: "tile",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9sgDh3Y5qf990pMKVDwfGv1TwYJufRHGzp5WwGWTlNbro_s0wk3uUtC5CG_ukiCW4P_3CD5fqa8z7ALrP0XwevOEdWToabes-oOVVIeeBpGUnR3Q6PFgaSmsJffyr4T1fQ7-wy4gDAmovSYBOg7OlfLWcPFzCLCMpg-BDrokFbrmY92aKTmwDxD5J1sfAt4j1blJL6CGl-pkuLphur950bxn4RHOFcVjFlpu4Z0w4FW-EZpb7isRdtYwdRByWXM2ImUWGUrGNM_I",
    imageAlt: "Close-up of premium activewear fabric texture",
    href: "/shop",
  },
  {
    id: "equipment",
    label: "EQUIPMENT",
    title: "Equipment",
    variant: "tile",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5_aHEsMl7uJUydM1ovKhZY8l5t2ZmfzcM9gTibXGcSJVUhdqkwcXgSJDRAk4mEPACrE9PS062yBHkPPdq1OAYGZ_6v-q3X35Av7dQXz6m9mYJPf30o_xL5Tavt8zyQvJWx62ghmoGsziuwhLWvaNOy-v3_e9z0CM4tAEpGjAxwEqrWiqs_DOUHKXl3xCWHBNpnfQ9qc4iXs1Il3Wo135211PHxyIRQdUYGkSxxEu1SUjb01U6NrQ1YwMBTYaIqcG5GXag4TEaYfI",
    imageAlt: "Minimalist athletic equipment flat lay",
    href: "/shop",
  },
];

export const NEW_DROPS: Product[] = [
  {
    id: "kinetic-bodysuit",
    series: "01 / KINETIC SERIES",
    name: "ULTRA-COMPRESSION BODYSUIT",
    priceSek: 1450,
    badgeKey: "limitedRelease",
    colSpan: "feature",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGn5Majttsmcbegp8RAvuuPF2hkqlmM3RDR3Wm8R19qpsWKoD2J5w6nN1Ayx-2rRJdD65sDg3yxQJa6Knt4qU_-X2fZXpmacT_1bmJZshi8iyinoldQcErutVg4bZSYH7FC7SSMHdYvqWi4bKsxl1NXr6CBDxTUQTJ0BLM1dIw2odHKlrepXiHOHZxtgzSwcdD4W5Ta3uNJI2IaaiWgLejPbkMvTQ7xIAJvtAdZjJURVKOhh82manSzhAqlurnX9BkJEFKwvaxCP0",
    imageAlt: "Model in obsidian Kinetic bodysuit",
  },
  {
    id: "aero-flow-leggings",
    series: "02 / KINETIC SERIES",
    name: "AERO-FLOW LEGGINGS",
    priceSek: 990,
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbU7EK9yZxOMMyS4YmQw6Mm7Tgm1Mj8eM9YJNdfAw-XA74VzVHOJlDMla6kEx9kzpF04hAx1HhXZ46H-_oFJ-6LNhbHA0nnuTC5idIydncdEznxx5vdNCEwJKnKuDaawscTIfgQCClLDapsYtOaIobxJo49VE6H8NJDh_hkmDp65N7kz-LDznn9RslA-OQYJYy8x7kn209MfXsvL_EUAJ6vk54XFIvtH77eSOFQOY9qXv4_nGaKBA5Y2O04ueSgSF57dUetloKoH4",
    imageAlt: "Aero-flow leggings in basalt grey",
  },
  {
    id: "sculpt-support-bra",
    series: "03 / KINETIC SERIES",
    name: "SCULPT SUPPORT BRA",
    priceSek: 650,
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkOkzJ4EZPQkYUdePA2SoqY6SexRTyQgL4-eL-soshRyMEAmUQmJVmAn4jJeIlkOVu_PoJDs5ipCma0OMZ9_UI5hA_XPt4M3ew9ndY_jSJHCTSCapaOHapMGWMPCrVuB27UJ0xAc7keSk_RQeyPAaqZx55IDhBquurxxQ6KoxMWijvCRXEq-2-1KMLuHMgLX0bjxNvyZ7hP50n0N1HM7xcYEQ_NIhi314MV75ISv2qPj63UjO5DwqE1C85ZxUX37iKPrv7QmgnYE",
    imageAlt: "Sculpt support bra in charcoal",
  },
  {
    id: "weightless-windshell",
    series: "04 / KINETIC SERIES",
    name: "WEIGHTLESS WINDSHELL",
    priceSek: 1650,
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3hXJrXinNrxZOnEMB-2Ehed2wZBUWGETa9-8J5N8_SwrplY6Wnzteynh0yZp95nw3I3VO-2i_jKJuDBHkxmJbr2m0PSd9nJAH_9Yot-WFynAPd2TsH-PRHmpUmd6nh82L-swTJ2nK3Bx2LGIJpGAAqB963Aj5iLmQAL4LbHsiMlnHmFP1TAHPCgW2iNqmAwISrRkIhbrA88HlYauAXGdksYRw_Nd7FiW9431-Q0iaRQLyQMWbNPYTpRzVmfoykfkkQNyyGYFCGgo",
    imageAlt: "Weightless windshell jacket",
  },
];

export type EditorialProduct = {
  id: string;
  name: string;
  color: string;
  /** VAT-inclusive catalog price in SEK. */
  priceSek: number;
  aspectRatio: "3/4" | "4/5";
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
};

export type EditorialImageTile = {
  aspectRatio: "square" | "16/9";
  image: string;
  imageAlt: string;
  labelKey?: "fabricLabel";
};

export type PremiumCollectionEditorial = {
  columns: Array<{
    product: EditorialProduct;
    tile: EditorialImageTile;
  }>;
};

export const PREMIUM_COLLECTION_EDITORIAL: PremiumCollectionEditorial = {
  columns: [
    {
      product: {
        id: "signature-sculpt-jumpsuit",
        name: "Signature Sculpt Jumpsuit",
        color: "Obsidian",
        priceSek: 1850,
        aspectRatio: "3/4",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCt4TO5K_Cdrp7arPStUCOir64rDyRhcEJ-x1rRTUUIxz5_QhVqtAxIqK5HdYMmc6DTiaTIwLrTR9Biklfz21fxdPc2Bp4PNNIsZj1AxOjQI5inqtuJi8fUgdsF5ro2erNwDwoKxBo7mF1BgERTnpmGV3678lFfkfsgwZ39fSa9fmisdra-h_vHHGoADFcgGrASvR62XwHjPcRdC4itlTqOAlt06nZOg_8qZjN3IfalojbAzj8lh0JrtPKrBexFqzqUs2tk9M9tOyM",
        imageAlt: "Signature sculpt jumpsuit in obsidian",
        href: "/shop/sculpt-leggings",
      },
      tile: {
        aspectRatio: "square",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC7oxc_FOjPZLIisoOU0cScEUuTA1ePHMk3ouRxb1nN1tajniFbOXhfhFtmKUC93b21EfVzbJuuapAQ7oFyl9UYsWE0JVXxoG2nevcz2zZ5tvlZe2rqMXp2bnf3iZluRuqwgzU5KFZmbpM3hDUoKNukfa7juX2G43Fd8lC36O_0mbSIItCzdcPRXrhnWDidKEFuJ6CX7tq6W1l4CQs5sNsr1D0sSpLgWX0tb-Esme76-DYo6pW-pGTb_0Ty7YqNurV8T_SD6iQrjYw",
        imageAlt: "Close-up of premium performance rib fabric texture",
        labelKey: "fabricLabel",
      },
    },
    {
      product: {
        id: "aero-dynamic-windbreaker",
        name: "Aero-Dynamic Windbreaker",
        color: "Eclipse",
        priceSek: 2200,
        aspectRatio: "4/5",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBCOhXvtviNQMr9JS7FgQ7eFni7DuP76nUvvQAvuhaD-CCUUY2YKBwmzYEDtFt163bg2RkR0ZkzV1Q29HuGW0IrtdYbFhDAzP32jO2W3vVHDDGXBPXom17AzbZOfFGSkBZg1J1E3iI3QFwJYQGLPk2_ZJAkzizl7Hi_xmQ36yIKupvl7tU9aDHyOzF5aAxBDRi9mkS925qPjUadIVrgQ_ZHWz7L5rUr4WJczXSYZhqerwkzwq1PJRcIm4mM3RaZT4i0y8YDcmcJILg",
        imageAlt: "Aero-dynamic windbreaker in eclipse charcoal",
        href: "/shop",
      },
      tile: {
        aspectRatio: "16/9",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCRjP0cDuEKyMwWMseVUQKV-zSExVcg2RiEaEYyy0wNFA7Xaetn5HHza3313STcF4GSRml5D3EOEOs9arD0rQwMAWvIsZLwNJ0dikxc0OkK7eUa5oglB2eJKSr4sgynGUWQKQM3R6fVfNv9KMBTRH8KAOL8pLjKuelyf5Zlq1IP2JNGb-GYyrJy54xsBFQ1UjdvtcSAwP_aDYnww5IMvlKWQABea11QomxmmaiWIzrPxFenrR9A3OcdsSar77QBQsisb5wBfDLCRmA",
        imageAlt: "Athlete at a minimalist yoga studio in monochromatic activewear",
      },
    },
  ],
};

export const BOUTIQUE_FAVORITES: DropProduct[] = [
  {
    id: "m-form-tank",
    name: "M-Form Tank",
    color: "",
    priceSek: 650,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFH2JlxWmXHLca75Ub_pnVtd0iOsU7F8hQrIxqGeRudkJ2iS5t4sUT1nHhK_-dphzxlsa5JgEgMIiySFofhdcuatpvyYVmU3Q7Q5JUzj4NZrSXx6mzS30S4nYivbkwAxnW2dfJvarp2hi8vtBV1UQzkxBX81i8xIY4F_YtkK8c3atfldeAd5MlsGNQkojFiihKBaxIYxsaOR0g3vuaV_cvsKVUO47KTAADLwzPjgPyHrGfTFIII59skAVqekXss10Aw95lYetEiyY",
    imageAlt: "M-Form Tank in charcoal grey",
    href: "/shop",
  },
  {
    id: "aero-flow-short",
    name: "Aero Flow Short",
    color: "",
    priceSek: 700,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB17D_hvcPITgj39lfiyTzeoIYCBnpwe8ayuKG8OZFIODplPMGy0384KuuLK9BWfiNylxIQS7Y6s5Rqph2cu39afxbWTVnPX5jSS5bzKXTymHS7kxPK8_Xh_XZNNkKH_bUs0gFwsP-1jhmPaqvAYUh2hdtO3Ecyjo5tF2yg7-YFkr_QCX_8CslwVbTJNTA1GDGSCfvQ-QvUPnmOgpgivLQlpFERldEYQFHoaTa7wGpKB0ezge2C1IMSYAHzoBG3JQ0ImSNMYj3sWww",
    imageAlt: "Aero Flow Short in sage green",
    href: "/shop",
  },
  {
    id: "compression-ls",
    name: "Compression LS",
    color: "",
    priceSek: 1100,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAiTXqY3JSqx_T53R-mYGe8gbArenJK5gJvqTkcBgvg0ENKE9iOmP9W7K9kTL0TgQ8UPt9KLFPZLpLQgW4d1MrSy3iINQoxeWsF_R4nI-DIBL9bw4_Ij6aF271ALmqxhfDh6Up48Pwta-eplMNt2AdGEF0yQW4Xk5ZfTOb7LoCDCAnsnYnx6j6Vc2uHQFtXVJoHuch8UIrc5HpyGGEw8hY7PBwEe8JeLnzbpyROl3VCCPbCe5q0MztSMw-4TBDwc5fXCYbRklAQcWg",
    imageAlt: "Compression long sleeve top in navy",
    href: "/shop",
  },
  {
    id: "velocity-trainer",
    name: "Velocity Trainer",
    color: "",
    priceSek: 1600,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9uHZTMPBK0E2u7nVWpPaTIzhi2D8BCuEJjNwMuzzbg1pbl6db1Su1V7dp9_amDXBIZhpxnZxPkz9l__gP3a_XzXvqzoT-ekh7XIkvhWM5n8N-TbOMs-tDLiEX4kUViCaYemdvHgD4URgNL1H6-OeS2nLSwLyGH-AAtDpMsGbgN-HU9DDxDzzXgq4dNVjEGcFdlo1lwQ9Me9qx69iKk6vWJzg9lTMH9Faa1WfMIyDzHRj-Pift-49ZR9Uph_KrLMGzBQOmIqioj10",
    imageAlt: "Velocity Trainer shoes in off-white",
    href: "/shop",
  },
];

export type LookItem = {
  id: string;
  name: string;
  priceSek: number;
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
};

export const COMPLETE_THE_LOOK = {
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCRjP0cDuEKyMwWMseVUQKV-zSExVcg2RiEaEYyy0wNFA7Xaetn5HHza3313STcF4GSRml5D3EOEOs9arD0rQwMAWvIsZLwNJ0dikxc0OkK7eUa5oglB2eJKSr4sgynGUWQKQM3R6fVfNv9KMBTRH8KAOL8pLjKuelyf5Zlq1IP2JNGb-GYyrJy54xsBFQ1UjdvtcSAwP_aDYnww5IMvlKWQABea11QomxmmaiWIzrPxFenrR9A3OcdsSar77QBQsisb5wBfDLCRmA",
  imageAlt: "Woman at a high-end yoga studio in sandstone activewear set",
  bundlePriceSek: 3400,
  items: [
    {
      id: "sandstone-lift-bra",
      name: "Sandstone Lift Bra",
      priceSek: 750,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAeI4N-c2Kk6sYReOvgKatU-grSss_YlR8UXE15Jd7GFJlLG8gudUwxGbFfXrfpPQpvf1q08LcNjVSR7Pt1buy2lF7S3h5thlf2J2-n0nZLlXOE9O2Qk4AlK-hJRHHNoQVQUMh-KyqbgTNg96DjdtXkoKIZ62x4HeS547hFPhcrpScVk5w5Fj0TyEfNiSBJXcyDYsNKxOZf9IsQRkMBuS7QeXFJPyQgOV0Haohp4234g4hte6r2bOSIs83_icw_-LAs6uYjWIFBHqQ",
      imageAlt: "Sandstone Lift Bra",
      href: "/shop",
    },
    {
      id: "sandstone-high-rise",
      name: "Sandstone High-Rise",
      priceSek: 1250,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAztf9UUq9BDTyoSu_xNb7Z73o8ZO_Bsqn3QboNI57NXtZIDnPGcDD8bVoDUISDu6oz7gXMlzkyDtq96-O74bYDKVed1veKCQMCuSwJ_v_RLyIqIJEDWZ_Fua8ULGJYu7fuaI5_Nx0hLVmiCJvBrjLdrV876cz5h1bhOVKEqajuat7cDYjICasSWHTkJ7LHG0XizETNDBGpZjM5Kzf2Yge8ERwiYebVgI3yeFbuzRAUhHNuKzHQI-J45vmq0XT2pqXWzIYBzk5oGgc",
      imageAlt: "Sandstone High-Rise Leggings",
      href: "/shop/sculpt-leggings",
    },
    {
      id: "recovery-hoodie",
      name: "Recovery Hoodie",
      priceSek: 1400,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCvJrr9GoxPnY_R4A-v_APTYfiD4rq7aVhNx_muGLAjUlFFs8AReR9DR-L3d_ruucvJ8PndSo-HYM1pVQOSnWUpMmVvTquyMtEfVKwxtN5G2fHuvhpxM6oZelfKazpEPSfpUul9HErg1YIcsQ8STzNOtyyW7dukO4kjTIn_J1gBohW7u5JrvPo2mLE1zmc8w-abJmRTp4sVeUoqW1u1ocN6DzbQYvfqo9Emdxq15z8mun2ivxZUAxbLfvVNdt4tgCFJUEEjYunIBkE",
      imageAlt: "Recovery Hoodie in sandstone",
      href: "/shop",
    },
  ] satisfies LookItem[],
};

/** @deprecated */
export const BEST_SELLERS: Product[] = BOUTIQUE_FAVORITES.map((p) => ({
  id: p.id,
  series: "BOUTIQUE",
  name: p.name.toUpperCase(),
  priceSek: p.priceSek,
  image: p.image,
  imageAlt: p.imageAlt,
  href: p.href,
}));

/** Fixed drop target so server and client share the same countdown anchor. */
export const DROP_TARGET_ISO = "2026-06-28T18:00:00.000Z";