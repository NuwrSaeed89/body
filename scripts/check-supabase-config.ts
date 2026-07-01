import { loadEnvLocal } from "./load-env-local";

async function main() {
  loadEnvLocal();

  const { getSupabaseConfigStatus } = await import("../src/lib/supabase/config");
  const status = getSupabaseConfigStatus();

  console.log("Mbody — Supabase configuration\n");
  console.log(`  configured:        ${status.configured}`);
  console.log(`  useMockData:       ${status.useMockData}`);
  console.log(`  URL set:           ${status.urlSet}`);
  console.log(`  anon key set:      ${status.anonKeySet}`);
  console.log(`  service role set:  ${status.serviceRoleKeySet}`);

  if (status.missing.length > 0) {
    console.log("\nMissing env vars:");
    status.missing.forEach((key) => console.log(`  - ${key}`));
    console.log("\nCopy mbody/.env.example → mbody/.env.local and fill Supabase keys.");
    console.log("Guide: mbody/docs/supabase-setup.md");
    process.exit(1);
  }

  if (status.recommended.length > 0) {
    console.log("\nRecommended (server webhooks / admin writes):");
    status.recommended.forEach((key) => console.log(`  - ${key}`));
  }

  console.log("\nOK — Supabase client env vars present.");
  console.log("Next: run database/mbody_init.sql, then GET /api/dev/supabase-config");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
