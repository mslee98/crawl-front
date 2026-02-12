/**
 * 인증 컨텍스트 (AuthContext)
 * - 로그인 상태(user, accessToken, refreshToken)를 전역으로 보관
 * - localStorage에 저장하여 새로고침 후에도 로그인 유지
 * - 로그아웃 시 POST /auth/logout 으로 refreshToken 무효화
 * @see docs/AUTH.md
 */
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

/** 로그인 응답에 포함되는 사용자 정보 (백엔드 user 객체와 동일) */
export type AuthUser = {
  uuid: string;
  id: string;
  email: string;
  nickname: string;
};

/** 인증 상태 (메모리 + localStorage 동기화) */
type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
};

const STORAGE_KEY = "auth";

/** localStorage에서 이전 세션 복원 (앱 로드 시 1회) */
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

/** state 변경 시 localStorage에 반영 (로그인 유지용) */
function saveToStorage(state: AuthState | null) {
  if (!state?.user || !state?.accessToken) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** useAuth() 로 제공되는 값 타입 */
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

  /** 로그인 성공 시 SignInForm에서 호출. 토큰·유저 저장 */
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

  /** 로그아웃: 로컬 상태 초기화 + 서버에 refreshToken 무효화 요청 */
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

/** AuthProvider 내부에서만 사용. 인증 상태·login·logout 접근 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
