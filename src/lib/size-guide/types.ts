export const MBODY_SIZES = ["XS", "S", "M", "L", "XL"] as const;

export type MbodySize = (typeof MBODY_SIZES)[number];

export const BODY_TYPES = ["slim", "athletic", "curvy"] as const;

export type BodyType = (typeof BODY_TYPES)[number];

export type SizeChartRow = {
  size: MbodySize;
  /** Inclusive height range in cm */
  heightCm: readonly [number, number];
  /** Inclusive weight range in kg */
  weightKg: readonly [number, number];
  bustCm: readonly [number, number];
  waistCm: readonly [number, number];
  hipCm: readonly [number, number];
};

export type SizeRecommendationInput = {
  heightCm: number;
  weightKg: number;
  bodyType: BodyType;
  /** Product sizes to clamp against; defaults to full chart */
  availableSizes?: readonly string[];
};

export type SizeRecommendation = {
  size: MbodySize;
  confidence: "high" | "medium" | "low";
  /** Alternate size if between sizes */
  alternateSize: MbodySize | null;
  notes: "true_to_size" | "size_down" | "size_up" | "between_sizes";
};
