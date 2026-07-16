import type { SizeChartRow } from "./types";

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

export const HEIGHT_CM_LIMITS = { min: 140, max: 200 } as const;
export const WEIGHT_KG_LIMITS = { min: 35, max: 120 } as const;
