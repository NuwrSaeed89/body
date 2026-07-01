export const AUTH_COOKIE = "mbody-auth";
export const AUTH_STORAGE_KEY = "mbody-auth-session";

export type MockUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export function userIdFromEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseAuthSession(raw: string | null | undefined): MockUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MockUser;
    if (typeof parsed.id === "string" && typeof parsed.email === "string") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function serializeAuthSession(user: MockUser): string {
  return JSON.stringify(user);
}
