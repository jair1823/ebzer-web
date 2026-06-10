import type { AuthUser, LoginResponse, RefreshResponse } from "./types";
import { clearTokens, getRefreshToken, setTokens } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const apiKeyHeader = (): HeadersInit => (
  API_KEY ? { "X-API-Key": API_KEY } : {}
);

const parseError = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => ({}));
  return (body as { error?: string; message?: string }).error
    ?? (body as { message?: string }).message
    ?? response.statusText;
};

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...apiKeyHeader() },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const message = await parseError(response);
      throw new Error(message);
    }

    const data: LoginResponse = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async refresh(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...apiKeyHeader() },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new Error("Refresh token invalid or expired");
    }

    const data: RefreshResponse = await response.json();
    setTokens(data.access_token);
    return data.access_token;
  },

  async me(accessToken: string): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, ...apiKeyHeader() },
    });

    if (!response.ok) {
      const message = await parseError(response);
      throw new Error(message);
    }

    return response.json();
  },

  async logout(accessToken?: string): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...apiKeyHeader(),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }).catch(() => {
      // ignore network errors on logout
    });
    clearTokens();
  },
};
