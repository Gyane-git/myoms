export type AuthUser = {
  id: number;
  username: string;
  fullName: string;
  companyCode: string;
  companyName: string;
};

export type AuthResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthUser;
};

const AUTH_TOKEN_KEY = "biz-auth-token";
const AUTH_REFRESH_TOKEN_KEY = "biz-auth-refresh-token";
const AUTH_USER_KEY = "biz-auth-user";

function getDefaultApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5176").replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getDefaultApiBaseUrl()}${normalizedPath}`;
}

function getStorageByPreference(remember: boolean) {
  return remember ? window.localStorage : window.sessionStorage;
}

function clearAuthStorage(storage: Storage) {
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
}

export function storeAuthSession(
  payload: Required<Pick<AuthResponse, "token" | "refreshToken">> & {
    user?: AuthUser;
  },
  remember: boolean
) {
  if (typeof window === "undefined") {
    return;
  }

  const activeStorage = getStorageByPreference(remember);
  const inactiveStorage = remember ? window.sessionStorage : window.localStorage;

  clearAuthStorage(activeStorage);
  clearAuthStorage(inactiveStorage);

  activeStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  activeStorage.setItem(AUTH_REFRESH_TOKEN_KEY, payload.refreshToken);

  if (payload.user) {
    activeStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
}

export function getAuthPermissions(): string[] {
  const token = getAuthToken();
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { permission?: string | string[] };
    const value = payload.permission;
    return Array.isArray(value) ? value : value ? [value] : [];
  } catch {
    return [];
  }
}

export function hasAuthPermission(permission: string) {
  return getAuthPermissions().includes(permission);
}

export function getAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser =
    window.localStorage.getItem(AUTH_USER_KEY) ??
    window.sessionStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  clearAuthStorage(window.localStorage);
  clearAuthStorage(window.sessionStorage);
}
