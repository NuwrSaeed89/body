export type CarouselProduct = {
  id: string;
  name: string;
  price: string;
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
  price: string;
  badgeKey?: "limitedRelease" | "exclusive" | "bestSeller";
  image: string;
  imageAlt: string;
  href?: `/shop` | `/shop/${string}`;
  colSpan?: "feature" | "default";
};

export const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB4nG4T8RKzxFXU9rI17T92kRXYYSpthcJon2N2OJ6uklUJyYV4zausRFldBqiox2M1Zf_-NJArO8oGUip70cVVYMtbPgoRem8WDwoP9S40FndwLW1t8uzeQ5SKEhTvqKcd0jL9Fb2Zcn8zUg6SigM8wWqoH90lvw517FPl-bsXYUjWisFV9eN0LHwCh0ET1lylZspcs3CmPJzb9q0Hk4KJgaRJJYTZ4Z0bl8Rh9JSYrQ6jj-omsrxQELTR66q3j4eniUjC92q1tsw";

export const HERO_IMAGE_DESKTOP =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCSVh4e19PdhPbrnasrJlQJ1e74IpYUMkaDEgOQVaSbaRxgAQ7ZHBrpBl-9XUuQYszjv4dAq0nP-WUKyvm4OBN1PK60OnfXPRUnRmuwWEU0J5QP1DZbM2jwzrZmSN1Mmhb8Z6jtr_UPSKDGQv1ncP7IEqGvvkrwqkprEzRSbNcDocnHEUn9xgyw2vErbtiqmT8fGlhf_TdC7NXY0gMcWGk9suuXSNSUJ1Ez2YXRi6vufHyLT5J9MXEvWXnSTO0KQGOZXdPtj_XDEGk";

export const LATEST_DROPS_CAROUSEL: CarouselProduct[] = [
  {
    id: "aerobra-elite",
    name: "AeroBra Elite",
    price: "850 SEK",
    color: "Onyx Black",
    badgeKey: "new",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5PulYY7RsnMOqlKkhhQ6Kp86iTiqavq9nFZR_gHYImjB95CXfYROusWbOw6wmKYiszSdi6hAzagAC4PAbaJ9N0iFk6wV5OJvu-UnYAj6n7W6BjABF-ATOdLnPlKwz0WOYvTB3Gm9WmvLMKsldi44yO8phGyH7Q1eBGyZxKM8977iTX3HCRPPio7rVuwGe2Vzrk-4UFxEzHEyE0LEI_KmE3x3FxtU8S9ktRsAHM8r8Akx4w80bbcBDxRVLJhK3bfBqN3hte4YYJgk",
    imageAlt: "AeroBra Elite sports bra in onyx black",
    href: "/shop/seamless-support-bra",
  },
  {
    id: "sculpt-leggings-carousel",
    name: "Sculpt Leggings",
    price: "1,200 SEK",
    color: "Sand Dune",
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCENdF3y2Y8TtlC5KVqM87fiJSR0NGEZCppa1HzJPHJJ2Tua2qo3iF46J3Co27UlfomaIN41TT7SjAUs9oVA6lRoVIfkf34R7djDXKFbdGZwAAOXfmbSBd5MtmmhvgX6r101IT5UMbLtCsTJUOTFagcmOAtD724gGfwiLCwrqCikIUHjJk5AU4btkqpRqOb15GASAEZiThWIq-e1xwNHnbCAWAU_0rVGdSyUWSl_WHqXZcGtwnOghf47otGrNSxTZOYxFbwtW1_WRo",
    imageAlt: "Sculpt leggings in sand dune",
    href: "/shop/sculpt-leggings",
  },
];

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
    price: "€129",
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
    price: "€89",
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbU7EK9yZxOMMyS4YmQw6Mm7Tgm1Mj8eM9YJNdfAw-XA74VzVHOJlDMla6kEx9kzpF04hAx1HhXZ46H-_oFJ-6LNhbHA0nnuTC5idIydncdEznxx5vdNCEwJKnKuDaawscTIfgQCClLDapsYtOaIobxJo49VE6H8NJDh_hkmDp65N7kz-LDznn9RslA-OQYJYy8x7kn209MfXsvL_EUAJ6vk54XFIvtH77eSOFQOY9qXv4_nGaKBA5Y2O04ueSgSF57dUetloKoH4",
    imageAlt: "Aero-flow leggings in basalt grey",
  },
  {
    id: "sculpt-support-bra",
    series: "03 / KINETIC SERIES",
    name: "SCULPT SUPPORT BRA",
    price: "€59",
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkOkzJ4EZPQkYUdePA2SoqY6SexRTyQgL4-eL-soshRyMEAmUQmJVmAn4jJeIlkOVu_PoJDs5ipCma0OMZ9_UI5hA_XPt4M3ew9ndY_jSJHCTSCapaOHapMGWMPCrVuB27UJ0xAc7keSk_RQeyPAaqZx55IDhBquurxxQ6KoxMWijvCRXEq-2-1KMLuHMgLX0bjxNvyZ7hP50n0N1HM7xcYEQ_NIhi314MV75ISv2qPj63UjO5DwqE1C85ZxUX37iKPrv7QmgnYE",
    imageAlt: "Sculpt support bra in charcoal",
  },
  {
    id: "weightless-windshell",
    series: "04 / KINETIC SERIES",
    name: "WEIGHTLESS WINDSHELL",
    price: "€149",
    badgeKey: "limitedRelease",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3hXJrXinNrxZOnEMB-2Ehed2wZBUWGETa9-8J5N8_SwrplY6Wnzteynh0yZp95nw3I3VO-2i_jKJuDBHkxmJbr2m0PSd9nJAH_9Yot-WFynAPd2TsH-PRHmpUmd6nh82L-swTJ2nK3Bx2LGIJpGAAqB963Aj5iLmQAL4LbHsiMlnHmFP1TAHPCgW2iNqmAwISrRkIhbrA88HlYauAXGdksYRw_Nd7FiW9431-Q0iaRQLyQMWbNPYTpRzVmfoykfkkQNyyGYFCGgo",
    imageAlt: "Weightless windshell jacket",
  },
];

export const PREMIUM_COLLECTION: Product[] = [
  {
    id: "sculpt-leggings",
    series: "PREMIUM",
    name: "SCULPT LEGGINGS",
    price: "€95",
    badgeKey: "exclusive",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbU7EK9yZxOMMyS4YmQw6Mm7Tgm1Mj8eM9YJNdfAw-XA74VzVHOJlDMla6kEx9kzpF04hAx1HhXZ46H-_oFJ-6LNhbHA0nnuTC5idIydncdEznxx5vdNCEwJKnKuDaawscTIfgQCClLDapsYtOaIobxJo49VE6H8NJDh_hkmDp65N7kz-LDznn9RslA-OQYJYy8x7kn209MfXsvL_EUAJ6vk54XFIvtH77eSOFQOY9qXv4_nGaKBA5Y2O04ueSgSF57dUetloKoH4",
    imageAlt: "Sculpt leggings premium collection",
    href: "/shop/sculpt-leggings",
  },
  {
    id: "performance-shorts",
    series: "PREMIUM",
    name: "PIVOT PERFORMANCE SHORTS",
    price: "€72",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZEMTAp7BcRPMV8Rg5ASgdw8pi9fLe9-vgN19C3fxF2UVOS5d3dm5DseAGzrrcRv5jnQ1CXVDW2fPOAqaWAnBdpHQXT28l9dVMmQAUEMfuqjC8bvA0hJIfZ1vQuUXGavCyqDg8G19QHJk4CeGdG5oaJM0WMs1Ugsw483sc7YyYJhQLCcmuUKej7VREBev-XF3hOOx4F7057PxYvUAkwhGinea668heT3kfGTlc9FO3J4Pp6HuwI_3fQrjHxRmp8Vz6PTAGd9inZr0",
    imageAlt: "Pivot performance shorts",
    href: "/shop",
  },
  {
    id: "elite-bra",
    series: "PREMIUM",
    name: "ELITE SUPPORT BRA",
    price: "€68",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkOkzJ4EZPQkYUdePA2SoqY6SexRTyQgL4-eL-soshRyMEAmUQmJVmAn4jJeIlkOVu_PoJDs5ipCma0OMZ9_UI5hA_XPt4M3ew9ndY_jSJHCTSCapaOHapMGWMPCrVuB27UJ0xAc7keSk_RQeyPAaqZx55IDhBquurxxQ6KoxMWijvCRXEq-2-1KMLuHMgLX0bjxNvyZ7hP50n0N1HM7xcYEQ_NIhi314MV75ISv2qPj63UjO5DwqE1C85ZxUX37iKPrv7QmgnYE",
    imageAlt: "elite support bra",
    href: "/shop",
  },
];

export const BEST_SELLERS: Product[] = [
  {
    id: "core-leggings",
    series: "BEST SELLER",
    name: "CORE LEGGINGS",
    price: "€79",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbU7EK9yZxOMMyS4YmQw6Mm7Tgm1Mj8eM9YJNdfAw-XA74VzVHOJlDMla6kEx9kzpF04hAx1HhXZ46H-_oFJ-6LNhbHA0nnuTC5idIydncdEznxx5vdNCEwJKnKuDaawscTIfgQCClLDapsYtOaIobxJo49VE6H8NJDh_hkmDp65N7kz-LDznn9RslA-OQYJYy8x7kn209MfXsvL_EUAJ6vk54XFIvtH77eSOFQOY9qXv4_nGaKBA5Y2O04ueSgSF57dUetloKoH4",
    imageAlt: "Core leggings best seller",
    href: "/shop",
  },
  {
    id: "flow-top",
    series: "BEST SELLER",
    name: "FLOW CROP TOP",
    price: "€49",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGkOkzJ4EZPQkYUdePA2SoqY6SexRTyQgL4-eL-soshRyMEAmUQmJVmAn4jJeIlkOVu_PoJDs5ipCma0OMZ9_UI5hA_XPt4M3ew9ndY_jSJHCTSCapaOHapMGWMPCrVuB27UJ0xAc7keSk_RQeyPAaqZx55IDhBquurxxQ6KoxMWijvCRXEq-2-1KMLuHMgLX0bjxNvyZ7hP50n0N1HM7xcYEQ_NIhi314MV75ISv2qPj63UjO5DwqE1C85ZxUX37iKPrv7QmgnYE",
    imageAlt: "Flow crop top",
    href: "/shop",
  },
  {
    id: "stride-shorts",
    series: "BEST SELLER",
    name: "STRIDE SHORTS",
    price: "€65",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZEMTAp7BcRPMV8Rg5ASgdw8pi9fLe9-vgN19C3fxF2UVOS5d3dm5DseAGzrrcRv5jnQ1CXVDW2fPOAqaWAnBdpHQXT28l9dVMmQAUEMfuqjC8bvA0hJIfZ1vQuUXGavCyqDg8G19QHJk4CeGdG5oaJM0WMs1Ugsw483sc7YyYJhQLCcmuUKej7VREBev-XF3hOOx4F7057PxYvUAkwhGinea668heT3kfGTlc9FO3J4Pp6HuwI_3fQrjHxRmp8Vz6PTAGd9inZr0",
    imageAlt: "Stride shorts",
    href: "/shop",
  },
  {
    id: "seamless-bra",
    series: "BEST SELLER",
    name: "SEAMLESS BRA",
    price: "€55",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGn5Majttsmcbegp8RAvuuPF2hkqlmM3RDR3Wm8R19qpsWKoD2J5w6nN1Ayx-2rRJdD65sDg3yxQJa6Knt4qU_-X2fZXpmacT_1bmJZshi8iyinoldQcErutVg4bZSYH7FC7SSMHdYvqWi4bKsxl1NXr6CBDxTUQTJ0BLM1dIw2odHKlrepXiHOHZxtgzSwcdD4W5Ta3uNJI2IaaiWgLejPbkMvTQ7xIAJvtAdZjJURVKOhh82manSzhAqlurnX9BkJEFKwvaxCP0",
    imageAlt: "Seamless bra",
    href: "/shop",
  },
];

export const COMPLETE_THE_LOOK = {
  title: "The Kinetic Bundle",
  description:
    "A complete ensemble engineered for high-intensity training. Features our signature AeroBra, Sculpt Leggings, and Flow Shell.",
  price: "2,400 SEK",
  compareAtPrice: "2,850 SEK",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWRvm_xrZvHTDbCuYb9C4CiGApEdJaJbRwFr2OEFLEEzdcfqv5bQPeM67pfE39HfVy5a2rb5g7VtZ9a0QClrp5exuBLPZwY8pZzdL689uWPzvs8vu4srk5pV-07YniTCuhZB4tHhO0DV4ZwwXR7HunA85Ot4sTmNuHSkUfUX4BNdU1PevdYR0mZ09tNkSOQeSws6KKl8Cv--B2fy00SbGDmJ1hOdvKCgaNCp9gH5S72jNDiDTITYVlCX75nnFdK2hrPNo1sXmLek4",
  itemKeys: ["sculptLeggings", "supportBra", "flowCropTop"] as const,
  colors: ["#000000", "#5d5f5d", "#e3e3de"],
};

/** Fixed drop target so server and client share the same countdown anchor. */
export const DROP_TARGET_ISO = "2026-06-28T18:00:00.000Z";