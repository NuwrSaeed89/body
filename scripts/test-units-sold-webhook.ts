#!/usr/bin/env npx tsx
/**
 * p4-7 — verify units_sold trigger via payment webhook (CLI).
 *
 * Usage:
 *   pnpm test:units-sold -- --orderNumber MB-20260720-1234
 *   pnpm test:units-sold -- --orderNumber MB-... --action refund
 *   pnpm test:units-sold -- --orderNumber MB-... --preview
 */
import { loadEnvLocal } from "./load-env-local";
import {
  previewUnitsSoldForOrder,
  runUnitsSoldPayTest,
  runUnitsSoldRefundTest,
} from "../src/lib/orders/verify-units-sold-webhook";

loadEnvLocal();

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const orderId = readArg("--orderId");
const orderNumber = readArg("--orderNumber");
const action = readArg("--action") ?? "pay";
const previewOnly = process.argv.includes("--preview");

if (!orderId && !orderNumber) {
  console.error(
    "Usage: pnpm test:units-sold -- --orderNumber MB-YYYYMMDD-1234 [--action pay|refund] [--preview]",
  );
  process.exit(1);
}

async function main() {
  if (previewOnly) {
    const preview = await previewUnitsSoldForOrder({ orderId, orderNumber });
    console.log(JSON.stringify(preview, null, 2));
    process.exit(preview.ok ? 0 : 1);
  }

  const result =
    action === "refund"
      ? await runUnitsSoldRefundTest({ orderId, orderNumber })
      : await runUnitsSoldPayTest({ orderId, orderNumber });

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
