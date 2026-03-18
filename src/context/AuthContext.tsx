import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../api/baseUrl";
import { AppRole, normalizeRole } from "../utils/role";

type AuthUser = {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: { name?: string } | string | null;
};

type AuthContextValue = {
  token: string | null;
  role: AppRole;
  userName: string;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: { token: string; user?: AuthUser | null }) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  hasRole: (roles: AppRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredName = () =>
  localStorage.getItem("username") || localStorage.getItem("name") || "User";

const parseTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch {
    return null;
  }
};

const extractRoleValue = (raw: unknown): string | null => {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && "name" in raw) {
    const name = (raw as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
};

const extractRoleFromTokenPayload = (payload: any): string | null => {
  if (!payload) return null;
  const direct = extractRoleValue(payload?.role);
  if (direct) return direct;

  const cognitoGroups = payload?.["cognito:groups"];
  if (Array.isArray(cognitoGroups) && cognitoGroups.length > 0) {
    const group = cognitoGroups[0];
    return typeof group === "string" ? group : null;
  }

  return null;
};

const extractUserName = (user?: AuthUser | null) => {
  const name =
    (typeof user?.username === "string" && user.username.trim()) ||
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof user?.email === "string" && user.email.trim()) ||
    "";
  return name || null;
};

const extractNameFromTokenPayload = (payload: any): string | null => {
  if (!payload) return null;
  const candidates = [
    payload?.name,
    payload?.given_name,
    payload?.preferred_username,
    payload?.email,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
};

const isLikelyEmail = (value: string) => value.includes("@");

const pickDisplayName = (options: Array<string | null | undefined>) => {
  const nonEmail = options.find(
    (value) => value && !isLikelyEmail(value)
  );
  if (nonEmail) return nonEmail;
  return options.find((value) => value && value.trim()) || "User";
};

const extractRoleFromUser = (user?: AuthUser | null) => {
  return normalizeRole(extractRoleValue(user?.role));
};

const resolveRoleFromToken = (token: string | null): AppRole => {
  if (!token) return "Employee";
  const payload = parseTokenPayload(token);
  const tokenRole = normalizeRole(extractRoleFromTokenPayload(payload));
  return tokenRole || "Employee";
};

const resolveRole = (token: string | null): AppRole => {
  const storedRole = normalizeRole(localStorage.getItem("role"));
  if (storedRole) return storedRole;
  return resolveRoleFromToken(token);
};

const isTokenExpired = (token: string) => {
  try {
    const payload = parseTokenPayload(token);
    const exp = typeof payload?.exp === "number" ? payload.exp : 0;
    const currentTime = Date.now() / 1000;
    return exp < currentTime;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<AppRole>(() => resolveRole(token));
  const [userName, setUserName] = useState<string>(() => getStoredName());
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    setToken(null);
    setRole("Employee");
    setUserName("User");
  }, []);

  const signIn = useCallback(
    (payload: { token: string; user?: AuthUser | null }) => {
      localStorage.setItem("token", payload.token);
      setToken(payload.token);

      const nextRole =
        extractRoleFromUser(payload.user) || resolveRoleFromToken(payload.token);
      localStorage.setItem("role", nextRole);
      setRole(nextRole);

      const tokenPayload = parseTokenPayload(payload.token);
      const nextName = pickDisplayName([
        extractUserName(payload.user),
        extractNameFromTokenPayload(tokenPayload),
        getStoredName(),
      ]);
      localStorage.setItem("username", nextName);
      setUserName(nextName);
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const payload = parseTokenPayload(token);
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      const nextName = pickDisplayName([
        extractUserName(data),
        extractNameFromTokenPayload(payload),
        getStoredName(),
      ]);
      const nextRole = extractRoleFromUser(data) || resolveRoleFromToken(token);

      localStorage.setItem("username", nextName);
      setUserName(nextName);

      localStorage.setItem("role", nextRole);
      setRole(nextRole);
    } catch {
      // keep existing state on refresh errors
    }
  }, [token]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        setToken(event.newValue);
      }
      if (event.key === "role") {
        const nextRole =
          normalizeRole(event.newValue) || resolveRole(localStorage.getItem("token"));
        setRole(nextRole);
      }
      if (event.key === "username") {
        setUserName(event.newValue || "User");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    let active = true;

    const syncAuth = async () => {
      if (!token) {
        setRole(resolveRole(null));
        setUserName(getStoredName());
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        signOut();
        setLoading(false);
        return;
      }

      const tokenPayload = parseTokenPayload(token);
      setRole(resolveRole(token));
      setUserName(
        pickDisplayName([
          extractNameFromTokenPayload(tokenPayload),
          getStoredName(),
        ])
      );
      setLoading(true);
      await refreshProfile();
      if (active) {
        setLoading(false);
      }
    };

    syncAuth();

    return () => {
      active = false;
    };
  }, [token, refreshProfile, signOut]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = token ? !isTokenExpired(token) : false;
    return {
      token,
      role,
      userName,
      loading,
      isAuthenticated,
      signIn,
      signOut,
      refreshProfile,
      hasRole: (roles: AppRole[]) => roles.includes(role),
    };
  }, [token, role, userName, loading, signIn, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
