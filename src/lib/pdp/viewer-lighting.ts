/**
 * PDP 3D viewer lighting & shadows.
 *
 * Tune defaults here, or override via CSS on `.product-model-viewer`:
 *   --mv-environment-intensity
 *   --mv-shadow-intensity
 *   --mv-shadow-softness
 *   --mv-shadow-angle-deg
 *   --mv-shadow-elevation-deg
 *
 * model-viewer uses IBL (environment) + contact soft-shadow mapping.
 * `shadowIntensity` attribute is internally scaled by 0.5 — use 1–2 for strong shadows.
 */

export type ViewerLightingConfig = {
  /** IBL / background light strength → `exposure` (+ Three `environmentIntensity`). */
  environmentIntensity: number;
  /** Contact shadow strength 0–2 (1 = strong, 2 ≈ max). */
  shadowIntensity: number;
  /** 0 = hard/crisp map, 1 = very soft. */
  shadowSoftness: number;
  /** Key-light azimuth in degrees (0 = front, 90 = right). Rotates environment map. */
  shadowAngleDeg: number;
  /** Key-light elevation in degrees (90 = overhead, 20 = low). */
  shadowElevationDeg: number;
  /** Built-in HDR: "neutral" | "legacy" | URL */
  environmentImage: string;
};

export const VIEWER_LIGHTING_DEFAULTS: ViewerLightingConfig = {
  environmentIntensity: 1.15,
  shadowIntensity: 1,
  shadowSoftness: 0.35,
  shadowAngleDeg: 45,
  shadowElevationDeg: 55,
  environmentImage: "neutral",
};

export const VIEWER_LIGHTING_RANGES = {
  environmentIntensity: { min: 0.35, max: 2.2, step: 0.05 },
  shadowAngleDeg: { min: 0, max: 360, step: 5 },
  shadowElevationDeg: { min: 15, max: 89, step: 1 },
  shadowIntensity: { min: 0, max: 2, step: 0.05 },
  shadowSoftness: { min: 0, max: 1, step: 0.05 },
} as const;

const CSS_VAR_MAP = {
  environmentIntensity: "--mv-environment-intensity",
  shadowIntensity: "--mv-shadow-intensity",
  shadowSoftness: "--mv-shadow-softness",
  shadowAngleDeg: "--mv-shadow-angle-deg",
  shadowElevationDeg: "--mv-shadow-elevation-deg",
} as const;

function readCssNumber(
  styles: CSSStyleDeclaration,
  name: string,
  fallback: number,
): number {
  const raw = styles.getPropertyValue(name).trim();
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Merge defaults with optional CSS custom properties on an element. */
export function resolveViewerLighting(
  host?: Element | null,
  overrides?: Partial<ViewerLightingConfig>,
): ViewerLightingConfig {
  const base = { ...VIEWER_LIGHTING_DEFAULTS, ...overrides };
  if (!host || typeof getComputedStyle === "undefined") return base;

  const styles = getComputedStyle(host);
  return {
    environmentIntensity: readCssNumber(
      styles,
      CSS_VAR_MAP.environmentIntensity,
      base.environmentIntensity,
    ),
    shadowIntensity: readCssNumber(
      styles,
      CSS_VAR_MAP.shadowIntensity,
      base.shadowIntensity,
    ),
    shadowSoftness: readCssNumber(
      styles,
      CSS_VAR_MAP.shadowSoftness,
      base.shadowSoftness,
    ),
    shadowAngleDeg: readCssNumber(
      styles,
      CSS_VAR_MAP.shadowAngleDeg,
      base.shadowAngleDeg,
    ),
    shadowElevationDeg: readCssNumber(
      styles,
      CSS_VAR_MAP.shadowElevationDeg,
      base.shadowElevationDeg,
    ),
    environmentImage: base.environmentImage,
  };
}

type ModelViewerLightingElement = HTMLElement & {
  exposure: number;
  shadowIntensity: number;
  shadowSoftness: number;
  environmentImage: string | null;
};

type ThreeSceneLike = {
  isScene?: boolean;
  environmentIntensity?: number;
  environmentRotation?: { set: (x: number, y: number, z: number) => void };
  queueRender?: () => void;
};

function findThreeScene(viewer: HTMLElement): ThreeSceneLike | null {
  for (const sym of Object.getOwnPropertySymbols(viewer)) {
    const value = (viewer as unknown as Record<symbol, unknown>)[sym];
    if (
      value &&
      typeof value === "object" &&
      (value as ThreeSceneLike).isScene === true
    ) {
      return value as ThreeSceneLike;
    }
  }
  return null;
}

/**
 * Convert azimuth + elevation into environmentRotation (radians).
 * Elevation 90° → light from above; lower values push light toward the horizon.
 */
export function shadowAnglesToEnvironmentRotation(
  angleDeg: number,
  elevationDeg: number,
): { pitch: number; yaw: number } {
  const yaw = (angleDeg * Math.PI) / 180;
  const clampedElevation = Math.min(89, Math.max(1, elevationDeg));
  const pitch = ((90 - clampedElevation) * Math.PI) / 180;
  return { pitch, yaw };
}

/** Apply IBL intensity + full contact shadows + environment rotation (shadow angle). */
export function applyViewerLighting(
  viewer: ModelViewerLightingElement,
  config: ViewerLightingConfig,
): void {
  viewer.environmentImage = config.environmentImage;
  viewer.exposure = config.environmentIntensity;
  viewer.shadowIntensity = config.shadowIntensity;
  viewer.shadowSoftness = config.shadowSoftness;

  const scene = findThreeScene(viewer);
  if (!scene) return;

  if (typeof scene.environmentIntensity === "number") {
    scene.environmentIntensity = config.environmentIntensity;
  }

  if (scene.environmentRotation) {
    const { pitch, yaw } = shadowAnglesToEnvironmentRotation(
      config.shadowAngleDeg,
      config.shadowElevationDeg,
    );
    scene.environmentRotation.set(pitch, yaw, 0);
  }

  scene.queueRender?.();
}
