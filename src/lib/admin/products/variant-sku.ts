export function buildVariantSku(slug: string, sizeCode: string, colorCode: string): string {
  const product = slug.replace(/-/g, "_").toUpperCase();
  const size = sizeCode.toUpperCase();
  const color = colorCode.replace(/-/g, "_").toUpperCase();
  return `${product}-${size}-${color}`;
}
