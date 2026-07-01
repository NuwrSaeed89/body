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
import {
  AUTH_COOKIE,
  AUTH_STORAGE_KEY,
  parseAuthSession,
  serializeAuthSession,
  userIdFromEmail,
  type MockUser,
} from "@/lib/auth-session";

type AuthContextValue = {
  user: MockUser | null;
  isAuthenticated: boolean;
  mounted: boolean;
  signIn: (email: string) => MockUser;
  signUp: (input: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) => MockUser;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const saved = parseAuthSession(window.localStorage.getItem(AUTH_STORAGE_KEY));
    setUser(saved);
    setMounted(true);

    const onAuthChange = () => {
      setUser(parseAuthSession(window.localStorage.getItem(AUTH_STORAGE_KEY)));
    };
    window.addEventListener("mbody-auth-change", onAuthChange);
    return () => window.removeEventListener("mbody-auth-change", onAuthChange);
  }, []);

  const signIn = useCallback((email: string) => {
    const next: MockUser = {
      id: userIdFromEmail(email),
      email: email.trim().toLowerCase(),
    };
    setUser(next);
    persistSession(next);
    return next;
  }, []);

  const signUp = useCallback(
    (input: { email: string; firstName?: string; lastName?: string }) => {
      const next: MockUser = {
        id: userIdFromEmail(input.email),
        email: input.email.trim().toLowerCase(),
        firstName: input.firstName?.trim() || undefined,
        lastName: input.lastName?.trim() || undefined,
      };
      setUser(next);
      persistSession(next);
      return next;
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    persistSession(null);
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
