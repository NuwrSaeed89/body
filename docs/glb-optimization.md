# GLB Optimization

## Automatic (admin upload — works on Vercel)

When you upload a **`.glb`** file from **Admin → Products → Edit**:

1. Your browser accepts raw files up to **100 MB**
2. **Draco compression** runs in the browser (`@gltf-transform` + Draco WASM from `/public/draco/`)
3. The optimized file is uploaded **directly to Supabase** (signed URL — no large request through Vercel)
4. The product is linked for the storefront 3D viewer

This avoids Vercel’s **~4.5 MB serverless body limit** and function timeouts. Progress shows **“Uploading and optimizing…”**.

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
