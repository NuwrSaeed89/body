import { getSizeChart } from "./chart";
import {
  MBODY_SIZES,
  type BodyType,
  type MbodySize,
  type SizeRecommendation,
  type SizeRecommendationInput,
} from "./types";

const BODY_TYPE_OFFSET: Record<BodyType, number> = {
  slim: -1,
  athletic: 0,
  curvy: 1,
};

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function distanceToRange(value: number, min: number, max: number): number {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

function scoreRow(heightCm: number, weightKg: number, row: { heightCm: readonly [number, number]; weightKg: readonly [number, number] }): number {
  const [hMin, hMax] = row.heightCm;
  const [wMin, wMax] = row.weightKg;

  const heightHit = inRange(heightCm, hMin, hMax);
  const weightHit = inRange(weightKg, wMin, wMax);

  if (heightHit && weightHit) return 100;

  const heightDist = distanceToRange(heightCm, hMin, hMax);
  const weightDist = distanceToRange(weightKg, wMin, wMax);

  // Weight fit matters more for compression activewear.
  const penalty = heightDist * 1.2 + weightDist * 2.4;
  return Math.max(0, 80 - penalty);
}

function clampSizeIndex(index: number): number {
  return Math.max(0, Math.min(MBODY_SIZES.length - 1, index));
}

function resolveAvailable(size: MbodySize, available: readonly string[]): MbodySize | null {
  if (available.includes(size)) return size;

  const start = MBODY_SIZES.indexOf(size);
  for (let offset = 1; offset < MBODY_SIZES.length; offset += 1) {
    const up = MBODY_SIZES[clampSizeIndex(start + offset)];
    if (available.includes(up)) return up;
    const down = MBODY_SIZES[clampSizeIndex(start - offset)];
    if (available.includes(down)) return down;
  }
  return null;
}

/**
 * Recommend a size from the Mbody client chart using height, weight, and body type.
 */
export function recommendSize(input: SizeRecommendationInput): SizeRecommendation | null {
  const heightCm = Number(input.heightCm);
  const weightKg = Number(input.weightKg);

  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
  if (heightCm <= 0 || weightKg <= 0) return null;

  const sizeChart = getSizeChart(input.profile);
  const scored = sizeChart.map((row) => ({
    size: row.size,
    score: scoreRow(heightCm, weightKg, row),
  })).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const second = scored[1];
  if (!best) return null;

  const baseIndex = MBODY_SIZES.indexOf(best.size);
  const adjustedIndex = clampSizeIndex(baseIndex + BODY_TYPE_OFFSET[input.bodyType]);
  let recommended = MBODY_SIZES[adjustedIndex];

  const available =
    input.availableSizes && input.availableSizes.length > 0
      ? input.availableSizes
      : MBODY_SIZES;

  const resolved = resolveAvailable(recommended, available);
  if (!resolved) return null;
  recommended = resolved;

  const between =
    second != null &&
    Math.abs(best.score - second.score) <= 8 &&
    BODY_TYPE_OFFSET[input.bodyType] === 0;

  let alternateSize: MbodySize | null = null;
  if (between) {
    const alt = resolveAvailable(second.size, available);
    alternateSize = alt && alt !== recommended ? alt : null;
  }

  let notes: SizeRecommendation["notes"] = "true_to_size";
  if (input.bodyType === "slim" && adjustedIndex < baseIndex) notes = "size_down";
  else if (input.bodyType === "curvy" && adjustedIndex > baseIndex) notes = "size_up";
  else if (alternateSize) notes = "between_sizes";

  const confidence: SizeRecommendation["confidence"] =
    best.score >= 90 ? "high" : best.score >= 55 ? "medium" : "low";

  return {
    size: recommended,
    confidence,
    alternateSize,
    notes,
  };
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbToKg(lb: number): number {
  return Math.round(lb / 2.20462);
}
