export type PaletteSwatch = {
  hex: string;
  name: string;
  code: string;
};

/** Curated fashion palette — names auto-suggest when picking nearby hues. */
export const FASHION_COLOR_PALETTE: PaletteSwatch[] = [
  { hex: "#121212", name: "Charcoal Black", code: "charcoal-black" },
  { hex: "#0A0A0A", name: "Obsidian", code: "obsidian" },
  { hex: "#1A1A1C", name: "Eclipse", code: "eclipse" },
  { hex: "#3D3E3F", name: "Basalt Grey", code: "basalt-grey" },
  { hex: "#4A4A48", name: "Graphite", code: "graphite" },
  { hex: "#E5E5E0", name: "Stone", code: "stone" },
  { hex: "#F5F2EB", name: "Bone White", code: "bone-white" },
  { hex: "#C9B89A", name: "Sandstone", code: "sandstone" },
  { hex: "#9CAF88", name: "Sage", code: "sage" },
  { hex: "#2F4538", name: "Forest", code: "forest" },
  { hex: "#1E2A44", name: "Midnight Navy", code: "midnight-navy" },
  { hex: "#4A3728", name: "Espresso", code: "espresso" },
  { hex: "#6B2E2E", name: "Burgundy", code: "burgundy" },
  { hex: "#B5523A", name: "Terracotta", code: "terracotta" },
  { hex: "#D4A5A5", name: "Blush", code: "blush" },
  { hex: "#8B7355", name: "Taupe", code: "taupe" },
  { hex: "#5C6B7A", name: "Slate Blue", code: "slate-blue" },
  { hex: "#C4A574", name: "Camel", code: "camel" },
];

type Rgb = { r: number; g: number; b: number };

export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toUpperCase()}`;
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

function colorDistance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;

  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;

  h *= 60;
  if (h < 0) h += 360;

  return { h, s, l };
}

function genericFashionName(rgb: Rgb): string {
  const { h, s, l } = rgbToHsl(rgb);

  if (s < 0.1) {
    if (l < 0.12) return "Obsidian";
    if (l < 0.28) return "Charcoal";
    if (l < 0.55) return "Stone Grey";
    if (l < 0.82) return "Stone";
    return "Bone White";
  }

  if (h < 20 || h >= 340) return l < 0.35 ? "Burgundy" : l < 0.6 ? "Clay" : "Blush";
  if (h < 45) return l < 0.45 ? "Espresso" : "Sandstone";
  if (h < 70) return l < 0.5 ? "Olive" : "Camel";
  if (h < 150) return l < 0.35 ? "Forest" : "Sage";
  if (h < 200) return "Slate Blue";
  if (h < 260) return l < 0.35 ? "Midnight Navy" : "Steel Blue";
  if (h < 310) return l < 0.4 ? "Plum" : "Lilac";
  return "Mauve";
}

export function slugifyColorCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export type ColorSuggestion = {
  name: string;
  code: string;
  hex: string;
  fromPalette: boolean;
};

/** Suggests a display name and SKU code slug from a hex value. */
export function suggestColorFromHex(hex: string): ColorSuggestion | null {
  const normalized = normalizeHex(hex);
  const rgb = hexToRgb(normalized ?? hex);
  if (!rgb || !normalized) return null;

  let nearest: PaletteSwatch | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const swatch of FASHION_COLOR_PALETTE) {
    const swatchRgb = hexToRgb(swatch.hex);
    if (!swatchRgb) continue;
    const distance = colorDistance(rgb, swatchRgb);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = swatch;
    }
  }

  if (nearest && nearestDistance < 42) {
    return {
      name: nearest.name,
      code: nearest.code,
      hex: normalized,
      fromPalette: true,
    };
  }

  const name = genericFashionName(rgb);
  return {
    name,
    code: slugifyColorCode(name),
    hex: normalized,
    fromPalette: false,
  };
}
