/**
 * Browser-side GLB optimization (Draco). Works on Vercel — no server body limit.
 * Loaded dynamically only when an admin uploads a .glb file.
 */

import { PRODUCT_MODEL_MAX_BYTES } from "./model-formats";

const DRACO_VERSION = "1.5.7";
/** Self-hosted under /public — avoids CDN 404s and works on Vercel. */
const DRACO_BASE = `/draco/${DRACO_VERSION}`;

type DracoWindow = Window & {
  DracoDecoderModule?: () => Promise<unknown>;
  DracoEncoderModule?: () => Promise<unknown>;
};

export type GlbClientOptimizeResult = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
  didOptimize: boolean;
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

export async function optimizeGlbFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<GlbClientOptimizeResult> {
  const originalBytes = file.size;
  onProgress?.(5);

  const [{ WebIO }, { ALL_EXTENSIONS }, { dedup, draco, flatten, join, prune, weld }] =
    await Promise.all([
      import("@gltf-transform/core"),
      import("@gltf-transform/extensions"),
      import("@gltf-transform/functions"),
    ]);

  onProgress?.(12);

  const dracoDeps = await createDracoDependencies();
  onProgress?.(22);

  const io = new WebIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies(dracoDeps);

  const sourceBuffer = new Uint8Array(await file.arrayBuffer());
  onProgress?.(32);

  const document = await io.readBinary(sourceBuffer);
  onProgress?.(48);

  await document.transform(dedup(), weld(), join(), flatten(), prune(), draco());
  onProgress?.(78);

  const optimizedBuffer = await io.writeBinary(document);
  onProgress?.(92);

  const optimizedBytes = optimizedBuffer.byteLength;
  const didOptimize = optimizedBytes > 0 && optimizedBytes < originalBytes;
  const outputBytes: Uint8Array = didOptimize ? optimizedBuffer : sourceBuffer;
  const finalBytes = didOptimize ? optimizedBytes : originalBytes;

  if (finalBytes > PRODUCT_MODEL_MAX_BYTES) {
    throw new Error(
      `After optimization the model is still ${(finalBytes / (1024 * 1024)).toFixed(1)} MB. ` +
        `Maximum stored size is ${Math.round(PRODUCT_MODEL_MAX_BYTES / (1024 * 1024))} MB — simplify the mesh in your 3D tool.`,
    );
  }

  const blob = new Blob([new Uint8Array(outputBytes)], { type: "model/gltf-binary" });
  const optimizedFile = new File([blob], file.name, { type: "model/gltf-binary" });

  onProgress?.(100);

  return {
    file: optimizedFile,
    originalBytes,
    optimizedBytes: finalBytes,
    didOptimize,
  };
}
