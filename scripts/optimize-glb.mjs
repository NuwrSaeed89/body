#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = { method: "draco", input: "", output: "" };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--") continue;
    if (token === "--method") {
      args.method = argv[i + 1] ?? "draco";
      i += 1;
      continue;
    }
    if (!args.input) {
      args.input = token;
      continue;
    }
    if (!args.output) {
      args.output = token;
    }
  }
  return args;
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function run() {
  const { method, input, output } = parseArgs(process.argv);
  if (!input || !output) {
    console.error(
      "Usage: pnpm glb:optimize -- <input.glb> <output.glb> [--method draco|meshopt]",
    );
    process.exit(1);
  }

  if (method !== "draco" && method !== "meshopt") {
    console.error("Method must be either 'draco' or 'meshopt'.");
    process.exit(1);
  }

  const inFile = resolve(input);
  const outFile = resolve(output);

  const before = statSync(inFile).size;

  const result = spawnSync(
    "npx",
    [
      "--yes",
      "@gltf-transform/cli",
      "optimize",
      inFile,
      outFile,
      "--compress",
      method,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const after = statSync(outFile).size;
  const savedBytes = before - after;
  const savedPercent = before > 0 ? ((savedBytes / before) * 100).toFixed(1) : "0.0";

  console.log("\nGLB optimization complete:");
  console.log(`- Method: ${method}`);
  console.log(`- Input:  ${formatKb(before)}`);
  console.log(`- Output: ${formatKb(after)}`);
  console.log(`- Saved:  ${formatKb(savedBytes)} (${savedPercent}%)`);
}

run();
