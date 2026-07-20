import "server-only";

import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type GlbOptimizeResult = {
  buffer: Buffer;
  originalBytes: number;
  optimizedBytes: number;
  didOptimize: boolean;
};

const OPTIMIZE_TIMEOUT_MS = 300_000;

/**
 * Compress GLB geometry with Draco (same pipeline as `pnpm glb:optimize:draco`).
 * Returns the smaller buffer when optimization helps; otherwise the original bytes.
 */
export async function optimizeGlbBytes(source: Buffer): Promise<GlbOptimizeResult> {
  const originalBytes = source.length;
  if (originalBytes === 0) {
    throw new Error("GLB file is empty");
  }

  const tempDir = await mkdtemp(join(tmpdir(), "mbody-glb-opt-"));
  const inputPath = join(tempDir, "source.glb");
  const outputPath = join(tempDir, "optimized.glb");

  try {
    await writeFile(inputPath, source);

    const result = spawnSync(
      "npx",
      [
        "--yes",
        "@gltf-transform/cli",
        "optimize",
        inputPath,
        outputPath,
        "--compress",
        "draco",
      ],
      { encoding: "utf8", timeout: OPTIMIZE_TIMEOUT_MS },
    );

    if (result.status !== 0) {
      throw new Error(
        result.stderr?.trim() ||
          result.stdout?.trim() ||
          "GLB optimization failed",
      );
    }

    const optimized = await readFile(outputPath);
    if (optimized.length <= 0) {
      throw new Error("GLB optimization produced an empty file");
    }

    const didOptimize = optimized.length < originalBytes;
    return {
      buffer: didOptimize ? optimized : source,
      originalBytes,
      optimizedBytes: didOptimize ? optimized.length : originalBytes,
      didOptimize,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
