import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type AuthUser = {
  uuid: string;
  id: string;
  email: string;
  nickname: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
};

const STORAGE_KEY = "auth";

function loadStored(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthState;
    if (!data.user || !data.accessToken) return null;
    return data;
  } catch {
    return null;
  }
}

function saveToStorage(state: AuthState | null) {
  if (!state?.user || !state?.accessToken) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  }) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadStored() ?? { user: null, accessToken: null, refreshToken: null, expiresIn: null });

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const login = useCallback(
    (data: { accessToken: string; refreshToken: string; expiresIn: number; user: AuthUser }) => {
      setState({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    const prev = state.refreshToken;
    setState({ user: null, accessToken: null, refreshToken: null, expiresIn: null });
    if (prev) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: prev }),
        });
      } catch {
        // ignore
      }
    }
  }, [state.refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isAuthenticated: !!state.user && !!state.accessToken,
      login,
      logout,
    }),
    [state.user, state.accessToken, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
