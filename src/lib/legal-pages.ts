export const LEGAL_PATHS = {
  terms: "/terms",
  privacy: "/privacy",
  returns: "/returns",
} as const;

export type LegalPageSlug = keyof typeof LEGAL_PATHS;

export type LegalSection = {
  id: string;
};

export const LEGAL_PAGE_SECTIONS: Record<
  LegalPageSlug,
  { namespace: LegalPageSlug; sections: LegalSection[] }
> = {
  terms: {
    namespace: "terms",
    sections: [
      { id: "introduction" },
      { id: "orders" },
      { id: "pricing" },
      { id: "shipping" },
      { id: "liability" },
      { id: "law" },
    ],
  },
  privacy: {
    namespace: "privacy",
    sections: [
      { id: "controller" },
      { id: "dataCollected" },
      { id: "legalBasis" },
      { id: "rights" },
      { id: "cookies" },
      { id: "transfers" },
      { id: "contact" },
    ],
  },
  returns: {
    namespace: "returns",
    sections: [
      { id: "withdrawal" },
      { id: "conditions" },
      { id: "process" },
      { id: "refunds" },
      { id: "defective" },
      { id: "exceptions" },
    ],
  },
};
