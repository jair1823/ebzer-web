import { authService, clearTokens, getAccessToken } from "../auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const buildHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => ({}));
  return (body as { error?: string }).error
    ?? (body as { message?: string }).message
    ?? response.statusText;
};

let refreshPromise: Promise<string> | null = null;

const apiRequest = async <TResponse>(
  method: string,
  endpoint: string,
  body?: unknown
): Promise<TResponse> => {
  const doFetch = (headers: HeadersInit) =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

  let response = await doFetch(buildHeaders());

  if (response.status === 401) {
    try {
      refreshPromise ??= authService.refresh();
      await refreshPromise;
      response = await doFetch(buildHeaders());
    } catch {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    } finally {
      refreshPromise = null;
    }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  return response.json();
};

export const api = {
  get: <TResponse = unknown>(endpoint: string): Promise<TResponse> =>
    apiRequest<TResponse>("GET", endpoint),

  post: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody
  ): Promise<TResponse> => apiRequest<TResponse>("POST", endpoint, data),

  put: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody
  ): Promise<TResponse> => apiRequest<TResponse>("PUT", endpoint, data),

  patch: <TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody
  ): Promise<TResponse> => apiRequest<TResponse>("PATCH", endpoint, data),

  delete: <TResponse = unknown>(endpoint: string): Promise<TResponse> =>
    apiRequest<TResponse>("DELETE", endpoint),
};
