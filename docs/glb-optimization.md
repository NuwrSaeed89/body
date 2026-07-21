# GLB Optimization

## Automatic (admin upload — works on Vercel)

When you upload a **`.glb`** file from **Admin → Products → Edit**:

1. Your browser accepts raw files up to **100 MB**
2. Compression runs in the browser:
   - Mesh simplify (~55% triangles kept)
   - Textures → WebP, max **1024×1024**
   - Geometry → **Draco** (aggressive quantization)
3. Progress shows each step and the size result (`66 MB → 2.1 MB (−97%)`)
4. The optimized file uploads **directly to Supabase** (signed URL — no large request through Vercel)
5. The product is linked for the storefront 3D viewer

This avoids Vercel’s **~4.5 MB serverless body limit** and function timeouts.

**First upload** may take longer while Draco WASM loads from the app (`/draco/1.5.7/`).

## Manual (CLI)

For batch work or testing before upload, run from `mbody/`:

```bash
pnpm glb:optimize -- ./tmp/model-source.glb ./tmp/model-optimized.glb
pnpm glb:optimize:draco -- ./tmp/model-source.glb ./tmp/model-optimized.glb
pnpm glb:optimize:meshopt -- ./tmp/model-source.glb ./tmp/model-optimized.glb
```

## Recommended targets

- GLB file target: **1–5 MB** for normal PDP use
- Stored models must stay under **50 MB** (Supabase bucket limit)
- `.gltf` and `.usdz` are **not** auto-optimized — compress manually if needed

## Policy

- Keep the original source file with the design team
- On Vercel, never upload unoptimized GLB through the API — optimization is always client-side first
