"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";
import {
  AUTH_COOKIE,
  AUTH_STORAGE_KEY,
  parseAuthSession,
  serializeAuthSession,
  type MockUser,
} from "@/lib/auth-session";
import { routing, type Locale } from "@/i18n/routing";

type SignUpInput = {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

type SignUpResult = {
  user: MockUser;
  sessionCreated: boolean;
};

type AuthContextValue = {
  user: MockUser | null;
  isAuthenticated: boolean;
  mounted: boolean;
  signIn: (email: string, password?: string) => Promise<MockUser>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readPathLocale(): Locale {
  if (typeof window === "undefined") return routing.defaultLocale;
  const segment = window.location.pathname.split("/")[1];
  return routing.locales.includes(segment as Locale)
    ? (segment as Locale)
    : routing.defaultLocale;
}

function authCallbackUrl(redirectPath: string): string {
  const locale = readPathLocale();
  const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  const resolved = `/${locale}${path}`;
  return `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(resolved)}`;
}

function persistSession(user: MockUser | null) {
  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, serializeAuthSession(user));
    document.cookie = `${AUTH_COOKIE}=1;path=/;max-age=31536000;sameSite=lax`;
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE}=;path=/;max-age=0;sameSite=lax`;
  }
  window.dispatchEvent(new CustomEvent("mbody-auth-change"));
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (shouldUseAuthMock()) {
      const saved = parseAuthSession(window.localStorage.getItem(AUTH_STORAGE_KEY));
      setUser(saved);
      setMounted(true);

      const onAuthChange = () => {
        setUser(parseAuthSession(window.localStorage.getItem(AUTH_STORAGE_KEY)));
      };
      window.addEventListener("mbody-auth-change", onAuthChange);
      return () => window.removeEventListener("mbody-auth-change", onAuthChange);
    }

    const supabase = createSupabaseBrowserClient();
    let isActive = true;
    let keepAliveInFlight = false;
    let keepAliveTimer: number | null = null;

    const toMockUser = (
      authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
    ): MockUser | null => {
      if (!authUser?.email) return null;
      const metadata = authUser.user_metadata ?? {};
      return {
        id: authUser.id,
        email: authUser.email.toLowerCase(),
        firstName: typeof metadata.first_name === "string" ? metadata.first_name : undefined,
        lastName: typeof metadata.last_name === "string" ? metadata.last_name : undefined,
      };
    };

    const keepAlive = () => {
      if (keepAliveInFlight) return;
      if (keepAliveTimer) return;

      keepAliveTimer = window.setTimeout(() => {
        keepAliveTimer = null;
        keepAliveInFlight = true;
        void fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
          .catch(() => undefined)
          .finally(() => {
            keepAliveInFlight = false;
          });
      }, 250);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;
      setUser(toMockUser(session?.user ?? null));
      if (event === "INITIAL_SESSION") {
        setMounted(true);
      }
    });

    const onFocus = () => keepAlive();
    const onVisible = () => {
      if (document.visibilityState === "visible") keepAlive();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const keepAliveInterval = window.setInterval(keepAlive, 4 * 60 * 1000);

    return () => {
      isActive = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(keepAliveInterval);
      if (keepAliveTimer) window.clearTimeout(keepAliveTimer);
    };
  }, []);

  const signIn = useCallback(async (email: string, password?: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (shouldUseAuthMock()) {
      const next: MockUser = {
        id: normalizedEmail,
        email: normalizedEmail,
      };
      setUser(next);
      persistSession(next);
      return next;
    }

    if (!password) throw new Error("Password is required");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
    if (!data.user?.email) throw new Error("Could not resolve authenticated user");

    const next: MockUser = {
      id: data.user.id,
      email: data.user.email.toLowerCase(),
      firstName:
        typeof data.user.user_metadata?.first_name === "string"
          ? data.user.user_metadata.first_name
          : undefined,
      lastName:
        typeof data.user.user_metadata?.last_name === "string"
          ? data.user.user_metadata.last_name
          : undefined,
    };
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const firstName = input.firstName?.trim() || undefined;
      const lastName = input.lastName?.trim() || undefined;

      if (shouldUseAuthMock()) {
        const next: MockUser = {
          id: normalizedEmail,
          email: normalizedEmail,
          firstName,
          lastName,
        };
        setUser(next);
        persistSession(next);
        return { user: next, sessionCreated: true };
      }

      if (!input.password) throw new Error("Password is required");
      const supabase = createSupabaseBrowserClient();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: input.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName || undefined,
          },
          emailRedirectTo: authCallbackUrl("/account"),
        },
      });
      if (error) throw error;

      const next: MockUser = {
        id: data.user?.id ?? normalizedEmail,
        email: normalizedEmail,
        firstName,
        lastName,
      };

      const sessionCreated = !!data.session;
      if (sessionCreated) {
        setUser(next);
      }
      return { user: next, sessionCreated };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (shouldUseAuthMock()) {
      setUser(null);
      persistSession(null);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      mounted,
      signIn,
      signUp,
      signOut,
    }),
    [user, mounted, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
