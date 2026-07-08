import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugifyColorCode, suggestColorFromHex } from "./color-palette";
import type { AdminColorDetail, ColorWriteInput } from "./types";

type DbColorRow = {
  id: string;
  code: string;
  hex: string | null;
  sort_order: number;
  color_translations: { locale: string; name: string }[];
};

function pickEnglishName(row: DbColorRow): string {
  return (
    row.color_translations.find((t) => t.locale === "en")?.name ??
    row.color_translations[0]?.name ??
    row.code
  );
}

function mapColorDetail(row: DbColorRow): AdminColorDetail {
  return {
    id: row.id,
    code: row.code,
    hex: row.hex ?? "#000000",
    name: pickEnglishName(row),
    sortOrder: row.sort_order,
  };
}

async function resolveUniqueCode(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  baseCode: string,
): Promise<string> {
  let code = baseCode;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("colors")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return code;
    code = `${baseCode}-${suffix}`;
    suffix += 1;
  }
}

export async function createColor(input: ColorWriteInput): Promise<AdminColorDetail> {
  const supabase = createSupabaseAdminClient();
  const suggestion = suggestColorFromHex(input.hex);
  const hex = suggestion?.hex ?? input.hex;
  const name = input.name.trim();
  const baseCode = input.code?.trim() || suggestion?.code || slugifyColorCode(name);

  const { data: existingHex, error: existingHexError } = await supabase
    .from("colors")
    .select("id, code, hex, sort_order, color_translations(locale, name)")
    .eq("hex", hex)
    .maybeSingle();

  if (existingHexError) throw existingHexError;
  if (existingHex) return mapColorDetail(existingHex as DbColorRow);

  const code = await resolveUniqueCode(supabase, baseCode);

  const { data: maxSortRow, error: maxSortError } = await supabase
    .from("colors")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxSortError) throw maxSortError;
  const sortOrder = Number(maxSortRow?.sort_order ?? 0) + 1;

  const { data: created, error: insertError } = await supabase
    .from("colors")
    .insert({ code, hex, sort_order: sortOrder })
    .select("id, code, hex, sort_order")
    .single();

  if (insertError) throw insertError;

  const translations = [
    { color_id: created.id, locale: "en", name },
    { color_id: created.id, locale: "sv", name },
    { color_id: created.id, locale: "es", name },
    { color_id: created.id, locale: "de", name },
  ];

  const { error: translationError } = await supabase
    .from("color_translations")
    .insert(translations);

  if (translationError) throw translationError;

  return {
    id: created.id,
    code: created.code,
    hex: created.hex ?? hex,
    name,
    sortOrder: created.sort_order,
  };
}

export function mapSupabaseColorCrudError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "23505") return "A color with this code already exists.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not save color.";
}
