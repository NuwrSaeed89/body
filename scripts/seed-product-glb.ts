import { loadEnvLocal } from "./load-env-local";

const DEMO_GLB_URL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

async function main() {
  loadEnvLocal();

  const { createSupabaseAdminClient } = await import("../src/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("slug", "sculpt-leggings")
    .maybeSingle();

  if (productError) throw productError;
  if (!product) {
    console.log("Product sculpt-leggings not found — skip GLB seed.");
    return;
  }

  const { data: existing, error: existingError } = await supabase
    .from("product_media")
    .select("id")
    .eq("product_id", product.id)
    .eq("kind", "glb")
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) {
    console.log("GLB media already exists for sculpt-leggings.");
    return;
  }

  const { error: insertError } = await supabase.from("product_media").insert({
    product_id: product.id,
    kind: "glb",
    storage_bucket: "product-media",
    storage_path: "seed/sculpt-leggings/model.glb",
    public_url: DEMO_GLB_URL,
    alt_text: "Sculpt high-rise leggings 3D model",
    sort_order: 99,
    is_primary: false,
  });

  if (insertError) throw insertError;
  console.log("Inserted GLB media for sculpt-leggings.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
