/**
 * Browser-side GLB optimization. Works on Vercel — no server body limit.
 * Pipeline: simplify mesh → compress textures → Draco geometry.
 */

import { MeshoptSimplifier } from "meshoptimizer";
import { PRODUCT_MODEL_MAX_BYTES } from "./model-formats";

const DRACO_VERSION = "1.5.7";
/** Self-hosted under /public — avoids CDN 404s and works on Vercel. */
const DRACO_BASE = `/draco/${DRACO_VERSION}`;

type DracoWindow = Window & {
  DracoDecoderModule?: () => Promise<unknown>;
  DracoEncoderModule?: () => Promise<unknown>;
};

export type GlbOptimizePhase =
  | "loading"
  | "reading"
  | "simplifying"
  | "textures"
  | "draco"
  | "writing"
  | "done";

export type GlbOptimizeProgress = {
  percent: number;
  phase: GlbOptimizePhase;
  label: string;
};

export type GlbClientOptimizeResult = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
  didOptimize: boolean;
  savedPercent: number;
};

const scriptPromises = new Map<string, Promise<void>>();

function loadScriptOnce(src: string, id: string): Promise<void> {
  const existing = scriptPromises.get(id);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  scriptPromises.set(id, promise);
  return promise;
}

async function createDracoDependencies(): Promise<Record<string, unknown>> {
  await loadScriptOnce(`${DRACO_BASE}/draco_decoder_gltf.js`, "mbody-draco-decoder");
  await loadScriptOnce(`${DRACO_BASE}/draco_encoder.js`, "mbody-draco-encoder");

  const win = window as DracoWindow;
  if (!win.DracoDecoderModule || !win.DracoEncoderModule) {
    throw new Error("Draco compression libraries failed to load");
  }

  return {
    "draco3d.decoder": await win.DracoDecoderModule(),
    "draco3d.encoder": await win.DracoEncoderModule(),
  };
}

function report(
  onProgress: ((progress: GlbOptimizeProgress) => void) | undefined,
  percent: number,
  phase: GlbOptimizePhase,
  label: string,
) {
  onProgress?.({ percent, phase, label });
}

export async function optimizeGlbFile(
  file: File,
  onProgress?: (progress: GlbOptimizeProgress) => void,
): Promise<GlbClientOptimizeResult> {
  const originalBytes = file.size;
  report(onProgress, 4, "loading", "Loading compression tools…");

  const [
    { WebIO },
    { ALL_EXTENSIONS },
    { dedup, draco, flatten, join, prune, simplify, textureCompress, weld },
  ] = await Promise.all([
    import("@gltf-transform/core"),
    import("@gltf-transform/extensions"),
    import("@gltf-transform/functions"),
  ]);

  report(onProgress, 10, "loading", "Loading Draco encoder…");
  const dracoDeps = await createDracoDependencies();

  report(onProgress, 16, "loading", "Preparing mesh simplifier…");
  await MeshoptSimplifier.ready;

  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies(dracoDeps);

  report(onProgress, 22, "reading", "Reading GLB file…");
  const sourceBuffer = new Uint8Array(await file.arrayBuffer());
  const document = await io.readBinary(sourceBuffer);

  report(onProgress, 32, "simplifying", "Simplifying mesh…");
  await document.transform(
    dedup(),
    weld({ overwrite: false }),
    simplify({
      simplifier: MeshoptSimplifier,
      // Keep ~55% of triangles — aggressive but usually still looks good on PDP.
      ratio: 0.55,
      error: 0.01,
    }),
    join(),
    flatten(),
    prune(),
  );

  report(onProgress, 52, "textures", "Compressing textures (WebP)…");
  await document.transform(
    textureCompress({
      targetFormat: "webp",
      // Cap texture resolution for storefront viewing.
      resize: [1024, 1024],
    }),
  );

  report(onProgress, 72, "draco", "Compressing geometry (Draco)…");
  await document.transform(
    draco({
      method: "edgebreaker",
      // Lower = slower encode, smaller file.
      encodeSpeed: 3,
      decodeSpeed: 5,
      // Fewer bits = smaller geometry (slightly lossy).
      quantizePosition: 12,
      quantizeNormal: 8,
      quantizeTexcoord: 10,
      quantizeColor: 8,
      quantizeGeneric: 12,
    }),
  );

  report(onProgress, 88, "writing", "Writing optimized GLB…");
  const optimizedBuffer = await io.writeBinary(document);

  const optimizedBytes = optimizedBuffer.byteLength;
  const didOptimize = optimizedBytes > 0 && optimizedBytes < originalBytes;
  const outputBytes: Uint8Array = didOptimize ? optimizedBuffer : sourceBuffer;
  const finalBytes = didOptimize ? optimizedBytes : originalBytes;
  const savedPercent =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - finalBytes) / originalBytes) * 100))
      : 0;

  if (finalBytes > PRODUCT_MODEL_MAX_BYTES) {
    throw new Error(
      `After optimization the model is still ${(finalBytes / (1024 * 1024)).toFixed(1)} MB. ` +
        `Maximum stored size is ${Math.round(PRODUCT_MODEL_MAX_BYTES / (1024 * 1024))} MB — simplify the mesh in your 3D tool.`,
    );
  }

  const blob = new Blob([new Uint8Array(outputBytes)], { type: "model/gltf-binary" });
  const optimizedFile = new File([blob], file.name, { type: "model/gltf-binary" });

  report(onProgress, 100, "done", "Compression complete");

  return {
    file: optimizedFile,
    originalBytes,
    optimizedBytes: finalBytes,
    didOptimize,
    savedPercent,
  };
}
