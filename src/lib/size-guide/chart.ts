import type { SizeChartRow, SizeGuideProfile } from "./types";

/**
 * Mbody women's performance size chart (EU).
 * Replace ranges when the client provides their official chart.
 */
export const MBODY_SIZE_CHART: readonly SizeChartRow[] = [
  {
    size: "XS",
    heightCm: [150, 160],
    weightKg: [42, 52],
    bustCm: [78, 84],
    waistCm: [58, 64],
    hipCm: [84, 90],
  },
  {
    size: "S",
    heightCm: [155, 165],
    weightKg: [50, 60],
    bustCm: [84, 90],
    waistCm: [64, 70],
    hipCm: [90, 96],
  },
  {
    size: "M",
    heightCm: [160, 170],
    weightKg: [58, 68],
    bustCm: [90, 96],
    waistCm: [70, 76],
    hipCm: [96, 102],
  },
  {
    size: "L",
    heightCm: [165, 175],
    weightKg: [66, 78],
    bustCm: [96, 104],
    waistCm: [76, 84],
    hipCm: [102, 110],
  },
  {
    size: "XL",
    heightCm: [168, 180],
    weightKg: [75, 92],
    bustCm: [104, 112],
    waistCm: [84, 94],
    hipCm: [110, 118],
  },
] as const;

/**
 * Sports bra fit profile. Uses a tighter bust-focused range.
 */
export const MBODY_BRA_SIZE_CHART: readonly SizeChartRow[] = [
  {
    size: "XS",
    heightCm: [150, 162],
    weightKg: [42, 50],
    bustCm: [76, 82],
    waistCm: [58, 64],
    hipCm: [84, 92],
  },
  {
    size: "S",
    heightCm: [155, 167],
    weightKg: [48, 57],
    bustCm: [82, 88],
    waistCm: [64, 70],
    hipCm: [90, 98],
  },
  {
    size: "M",
    heightCm: [160, 172],
    weightKg: [55, 65],
    bustCm: [88, 94],
    waistCm: [70, 76],
    hipCm: [96, 104],
  },
  {
    size: "L",
    heightCm: [164, 176],
    weightKg: [63, 75],
    bustCm: [94, 102],
    waistCm: [76, 84],
    hipCm: [102, 112],
  },
  {
    size: "XL",
    heightCm: [168, 182],
    weightKg: [72, 88],
    bustCm: [102, 110],
    waistCm: [84, 94],
    hipCm: [110, 120],
  },
] as const;

export function getSizeChart(profile: SizeGuideProfile = "default"): readonly SizeChartRow[] {
  return profile === "bra" ? MBODY_BRA_SIZE_CHART : MBODY_SIZE_CHART;
}

export const HEIGHT_CM_LIMITS = { min: 140, max: 200 } as const;
export const WEIGHT_KG_LIMITS = { min: 35, max: 120 } as const;
