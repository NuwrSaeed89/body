# GLB Optimization Before Upload

Use this workflow to compress 3D models before uploading to product media.

## Why

- Faster 3D load on mobile and slow networks.
- Lower storage and bandwidth cost.
- Better UX for `model-viewer` in PDP.

## Commands

Run from `mbody/`:

```bash
# Default (draco)
pnpm glb:optimize -- ./tmp/model-source.glb ./tmp/model-optimized.glb

# Explicit draco
pnpm glb:optimize:draco -- ./tmp/model-source.glb ./tmp/model-optimized.glb

# Meshopt alternative
pnpm glb:optimize:meshopt -- ./tmp/model-source.glb ./tmp/model-optimized.glb
```

The script prints original size, optimized size, and saved percentage.

## Recommended Targets

- GLB file target: 1-5 MB for normal PDP use.
- Keep visual quality acceptable on iOS Safari and Android Chrome.
- If quality drops too much, test the other method (`draco` vs `meshopt`).

## Upload Policy

- Keep original source file with design team.
- Upload only the optimized `.glb` to storage.
- Link optimized URL in product media (`kind = glb`).
