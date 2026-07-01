export type CartLineItem = {
  id: string;
  /** VAT-inclusive line price in SEK. */
  priceSek: number;
  image: string;
  imageAlt: string;
};

export type CrossSellItem = {
  id: string;
  priceSek: number;
  image: string;
  imageAlt: string;
  badgeKey?: string;
  categoryKey?: string;
};

export const DESKTOP_CART_ITEMS: CartLineItem[] = [
  {
    id: "sculpt-leggings",
    priceSek: 1250,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrCJ60MN_qjcDhL__P_DXH-z4Y9vUYwe69zwqOXpRNSYCEiI-IJIqVscMheJMIKMb5iMiIgbjBNb_HH7jxGL1EvjSnIU4-BCNyYJxmhFd82_XbhAcjYxCwpRFJePMYHP2oqp_noH14G5YPLP1p4s6SZ0tQd_4XH22fnFJD_kN-tGm2s9-0bqF-TNixmZIfEEagNAUUhZglusqn-zjfrkwixez_DG73k2SBk_C5lQmCdWGG1bTUNx5Rs0-wVcLjAegCroa_cp3C_zI",
    imageAlt: "Sculpt high-rise leggings in charcoal gray",
  },
  {
    id: "zen-bra",
    priceSek: 890,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFA8_PvL2h7iFcPLYN693Zau5T73pCSBbEHWilmdivrhBBhHhh6KSHzOpFGWKM0q0I-jjJEqR53C7tXxSSFfccFZsSivOJ3BQyUWhoRv-UueecQgMcaqU3TPu2QUrVQ-B6P0h4UYgwcvaiiOJ3QSJPhvt5NZrZFSWTT1qy-uTsZV3IseI7haeFyOxjtdpQG1xcic7K4G0Ty6VggtHWkHG2qBFJ-G8yaIkzLXyRmbIfKdR4GdiZR82-U3uRSn5DHGqXMEFi6xyyAaY",
    imageAlt: "Zen Flow sports bra in sage green",
  },
];

export const MOBILE_CART_ITEMS: CartLineItem[] = [
  {
    id: "apex-bra",
    priceSek: 850,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHF9Dbtc8lrVM8aXECvb9OgH7_rOWI-wMeIjNfxuSQEVIfKp-FzpT6-ubBDjdVZZrj0QtjttUQ3Q64CJHRud6MMZD0vyye_2ByaxtoZ0aZMKoWDSRN6zgAMaoNbC27MTAOjg3gk-ghakk4dHkPpnGFLOZe1lFxkgIIjpD8MBn0yOjcyJOEsaPw6OjOW2lNC54g0YxeA9fqvdDnwwub_LH5oELyDDZSHwAOLT342gvYswNTN1UXVin3zr0OaaPJC3oo0RManJwdPBA",
    imageAlt: "Apex Sculpt bra in charcoal",
  },
  {
    id: "flow-legging",
    priceSek: 1200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoA-y7sNl2pp91n8W2-QJ0amhlNEX25ZWIczqnAop-ZgSvcpyo9rHQHM3y-9ipel2nu0AGfmfAZtaKWE_oiqrzQpp8h3ZuaOoi6my9OS9VzGrv5iEvf0ilRKGY2h6BYkFYGiHSuyMEcLZzEyIEr7Z2biJm_lUMVVlnA5YwSYcMTWKDZTJ57nyBISMinI_DKQlB_yCby1HdVt1mrPAWzUdr9SsQ5AX_IKdbmiIfIbAKCAwgmR-bgqaOh-zrR7Ua3xpeAQQdmwGL7QY",
    imageAlt: "Flow leggings in bone color",
  },
];

export const DESKTOP_CROSS_SELL: CrossSellItem[] = [
  {
    id: "cloud-hoodie",
    priceSek: 1510,
    badgeKey: "newArrival",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqlMwNctSj4m1XV9ZwBFi4IiB_RywgAENp_b81Xktko2eQcrfa_Gg_tZUCeFLNQOj5gefavhCrPwg_1wmzZLEgfBsAc2INaQqgpzTqFNawtUI1YHug9STKNhfBrdHLTydQX0gfKG_t6p_PZgDtPlqJ28x1C33kLI4rvvl-QxU103WIAmhxKuxgymIufOe3S_tUi_U8gSx4jN7r3E8zA716WVHsdjoJ9GbWIF6g4_xsxSyA600UolCuUCAormbEdIFBb0txAlDpTwk",
    imageAlt: "Cloud cropped hoodie in ivory",
  },
  {
    id: "ankle-sock",
    priceSek: 190,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCRym8LTD41IjRMSqJVrJ10zXwnf2Tnky3AQKUqzu-TuKQD_Al7hhqeu2g0fiX8yCLCYQX_o0aPI3yuP4Lae9YvY_fRqHmmf-PYKuwABjJp9O68MfQ-QrlK7qCNWxJKRq2G4gjtbRG1FQn3g7V-wubOiYab8hIhPuVFMcNxTXhVkzdA3vIsEal3xpfqIrZ9wdGxoTJldpFopFUUDoOfruLJUcZfGctByosY8Hnu709xVb-t5CW8YqKRKxQLV4eqTboCvitiG5GdWY",
    imageAlt: "Performance ankle sock",
  },
  {
    id: "core-flask",
    priceSek: 470,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsDKOXR8ItnNymI91WYsh5zPrco8-POoge-m-frSswzd_vI5ugTVa9SvBviOzNaIN2dFPoC1eKORXYSkYozGdwRqW4b09QWLdVaEmDh-Gp3pIlCBv1SPMta70KYDa_YRfjdVFK5-aMaPAk3PQnRdyrqJXI9l_YbIkOD3ra0pbtu7iLaHW0dk_-ZqWhNBd5pufd1hifJkA6wqAdhCq_C03hzQwzBtsjQdWi12Nybn27qfRh-kc7zm_5erLA2uvZ13jpzEFcRi1da2I",
    imageAlt: "Core 500ml flask",
  },
  {
    id: "yoga-mat",
    priceSek: 1145,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvWTKXgk11fZRvIBYENuLJiR63pLdqWrZqnqoc0b5YnSbLw6wj-_Dvf5chwHczmJQnIoGhDfxkNdQYCJdyvT17-8lK4GHZXziyvAL9ZismKW_J9EZbXTmp12OrRUOIFg_k2sizSAGmvqG2fH6D9n4T-hAVSt_zSvPBJkpOY0IpQ8zwKIdIfXUC1Z-UPqfhYwwvlek22xvV_xQ8vZwiZEETIzH7XMO6awEYhehz4cf1OKpFDu1qfozsiKExO5RNRW2eU46ZheEBXR4",
    imageAlt: "Grip motion yoga mat",
  },
];

export const MOBILE_CROSS_SELL: CrossSellItem[] = [
  {
    id: "aero-jacket",
    priceSek: 2400,
    badgeKey: "newArrival",
    categoryKey: "newArrival",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKbcOSeXdbGpO135lbIPZhXnTmMwPD_i55zy5T05c7gddSs-SELP8eHH2rmeLebeWDMjYJ68-7FRVVoFDK0Er_LLM0O2DPTVYpa-Iply-yrhi_kVXjYIaA26w3A5K7rWdhWCrUWzhULtjd7_SSmlFbLUxryZ7GzKaEs2Rip3UzNms72B87b_AZZGIu2Sn0Dlo7w0sxc7mMWZ5XN0Sj8x5WeFouqZzhIr9Xl6qArfnwbQILfBuCePAc1TFtqtChjLW2yZS7arI3iQY",
    imageAlt: "Aero shell jacket",
  },
  {
    id: "studio-tote",
    priceSek: 1100,
    categoryKey: "essentials",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAozN_QBmeygJAb1uIL6MWzEV9EWCQRtaXO-9ckGJFPiXRN_DD5LIaY3JvKaezp4leAxGcrCsBSFCAHPxzldqHvW1YuNNlWeU9IUkVNKDt-Tw6tvyoTcnoLRaWZh0mHsimWF3J0WKJvLBoOeBQZnE_nxqDc1Az5bxxaLcN331sBO2u8geXTZn2q4VKTe5vnFxnH5dB_ehQrUV03l8zgqzTvFS5gE8Xy_q357f68LnYjzyuvHBH3jH3pV88bsc_zfgIqX5_UMKDEuyM",
    imageAlt: "Core studio tote",
  },
  {
    id: "crew-socks",
    priceSek: 150,
    categoryKey: "accessories",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4VHgj3YcKsY96ZC8191KMd2OH_SnxIqZjk8vRYkdWx9JlZjTd-PGyw--wTITK6ZFuZq99_Cn9XT7zdCsUsqlD7CkPfhuW1uDZyQ3soP_GEGBD_dRzv-6A92_UY-rzzwzKumha2cfvQhQVaCFuOgf7PHEFj4JqS21_qI7DoyoJ8N_Lj_xXvC2Blv0wG1TDhxjeBKpho6GtMxlpblNFHeR85cAOfzpg8sJDE-mgdnKWc6C5bMYU3XVvWsn8qffVFCE2bFmwhvHOG1Y",
    imageAlt: "Flow crew socks",
  },
];

export type EmptyArrivalItem = {
  id: string;
  priceSek: number;
  colorKey: string;
  image: string;
  imageAlt: string;
  badgeKey?: string;
};

export type EmptyMustHaveItem = {
  id: string;
  priceSek: number;
  categoryKey: string;
  image: string;
  imageAlt: string;
  cartItemId: string;
};

export const EMPTY_DESKTOP_ARRIVALS: EmptyArrivalItem[] = [
  {
    id: "aero-sculpt-legging",
    priceSek: 1200,
    colorKey: "carbonBlack",
    badgeKey: "newArrival",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP9W6dOoMxkloQToxgDTzeo0NNG1grV6tqvfMEwIlytZkZWWwasMovmn6wwWtiEjk1vLCRE1fARNYLePRv_Op5T6fj7919TcICe5dkvTZV1NKDd2aMoy6BYloGPUHYAAq-zWaWMrXHJlgM4bCLXScmzOyw_gbfxXmDi3Fs3kC1rmTKL-G58e22Lj3nvNxM9q5BDupLOT0-K9hv87q2ieukpziyW4X7gAv4-uqYIRYL7a1OmojNxgwC1VM9vDb7H3eKJgmLUaD328U",
    imageAlt: "Aero-Sculpt Legging in carbon black",
  },
  {
    id: "precision-bra",
    priceSek: 810,
    colorKey: "slateGrey",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5VH-o3YlZx2Gets5liEFznYWtf8TUMGF3MvvsQs1qPGYTSmoZ-5GYnRMCbQsT1AcBv8JGvZB9kzbqCoMOq0yjpXWKBbpkbLT3ayNP3uanvqi8A_iuUsqtObPs-I0qougzGVd12mhAUKbxYZ2TtYqU3aktlTO8qX1BGBsa4EzArV1lt5o032D1thQVT4XexE8XGmLuR1D2xCRVpEJ-gAEaQj7ohh0dJfE9CXqMs7D33kzCFaaSYUa9iDVYnWYrd3X6t9t7viPQYmA",
    imageAlt: "Precision Support Bra in slate grey",
  },
  {
    id: "vapor-shell",
    priceSek: 1920,
    colorKey: "oysterWhite",
    badgeKey: "limited",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZNehoOuSNmLyv9SV5rb-zsUE36ThcBb4dPAwCwq9WZi5zrNT_MDUoZhzX-B_9hCCEMReoZxXZqolFDuylD7m-IhxW841PEHGkMyxTAsLUMHJk876O64mVXEfDDekIcdBmJTodGeaacmGt9mVQLYJ3_efUdcYk__l7qtbqjuNyMIdR8jHzKYxoaGd-thBrbCVA93M2W5IIgF81RwUd7EDzOGB6ncxSUfiBYIoYGuHa74yFgBYyzqnEotTVFoTQLSihHBkkG7vqx-M",
    imageAlt: "Vapor Shell Jacket in oyster white",
  },
  {
    id: "ribbed-short",
    priceSek: 680,
    colorKey: "mossGreen",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbXBsoRabx6Q4tNIkJ8p-vj0kqmFhIk0RsMuFIAVczJvgQ1Stcem-4_ROhYZKqvzQT56N9uS7HM9ZeA3h7vdfAeJEHQqGXNW6xOIyk_vF9yghm0v82cyOtm9a_wG6QHuFeRmqR4Eul-7pd_oTEYD_ZrHFgavhgaIA6ftL3uaQrOhcLbK5ns_BJF5EJSzrvZf3VllP_hgPEN6pUsHPQG_PL2iWKZ11SNaQmYEUHsCnSkJWKFAzp7ZM9TB8eK8q8kCR1DBHNW0cYqeY",
    imageAlt: "Ribbed Core Short in moss green",
  },
];

export const EMPTY_MOBILE_MUST_HAVES: EmptyMustHaveItem[] = [
  {
    id: "sculpt-legging-mh",
    priceSek: 1145,
    categoryKey: "compression",
    cartItemId: "sculpt-leggings",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpmDMiq3fUmZXvHcIF-2QXNYZgH7W6mT_gIKNV3ouPKhTQDj2msg0KwatNvV6A1C-Z2AVsP3___qz2Fu9myMvQkLcDl8z3g0KKUjShAw7R9QR5LSQVg885nkw-BUXzB2nJmXn1Q6KYAUla94qzGVB5x-akjMrcmMaugIVN8VMTRF1QAD2SiIDoaXkfZnKqbq7GkrS4ZFDNA6lxbKPBsNm940Vex6ha_Keih42l1EyYI76QjGPZCd6f9A6XwCJGiDxXFXxYzLGTYa4",
    imageAlt: "Sculpt High-Rise Legging",
  },
  {
    id: "ribbed-bra-mh",
    priceSek: 710,
    categoryKey: "essentials",
    cartItemId: "zen-bra",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCCWLCbSNMneQbzCJJI-mZzcPaL4bd12jvqUu6lz4Krw0Yh3lDBzLC_85jW0fJ0JnLYlyNLjHGIMCs-slWfRa53akS2OsYakeU2KZaHwhRPUf5wJZN5HRp8h1x5zBqopCMhbghdjkHhFoJiKuWOb9kCUW1R4r1VMZF0cLSv3obCvxnR8L9STwuLO2dhf4-tigAbQG7fNUX29JPCYElGjxv1I8ddTa7wH4o9M3V3_PkPMXEW8e5UqZoxaGWb8AsWmByVgQe2kwNrPEE",
    imageAlt: "Ribbed Core Bra",
  },
  {
    id: "studio-parka-mh",
    priceSek: 1920,
    categoryKey: "outerwear",
    cartItemId: "apex-bra",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBH7u9T8n7upHuPv4hMeUK3s4szb9WLzvtH4WcFzDn4krrr_Ebo5k5PC69Kg9tebPTgLRIBodKr5ijX5cqnoMBMCfiekyz6KEXSO1XlBvSfqEQQ0hUYmWYwQtTYqag7PmKsxpoEiA5dILpToJwKz3kegR-VEGNRp4nuaC28_Fj2gIPPJ371hTb5bh_a5hQIRiHIpwIGw9jzEDfVqcUjJnpwEDM7RsbPC--AZGQJYVUJXPHORlyeAEImiXrYGLBCL1pti22fD5HwIAU",
    imageAlt: "Over-Sized Studio Parka",
  },
];
