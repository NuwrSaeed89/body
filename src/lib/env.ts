export const APP_ENVIRONMENTS = ["development", "staging", "production"] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

function readAppEnvironment(): AppEnvironment {
  const value = process.env.NEXT_PUBLIC_APP_ENV;
  if (value === "staging" || value === "production") return value;
  return "development";
}

function readBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") return defaultValue;
  return value === "true" || value === "1";
}

/** Variables exposed to the browser (`NEXT_PUBLIC_*`). */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appEnv: readAppEnvironment(),
  useMockData: readBooleanEnv(process.env.NEXT_PUBLIC_USE_MOCK_DATA, true),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "",
} as const;

/** Server-only secrets — do not import from client components. */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

export function isStaging(): boolean {
  return publicEnv.appEnv === "staging";
}

export function isProduction(): boolean {
  return publicEnv.appEnv === "production";
}

export function hasSupabaseConfig(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}
