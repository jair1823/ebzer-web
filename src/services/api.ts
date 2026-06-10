const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
});

const handleResponse = async <TResponse>(response: Response): Promise<TResponse> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = (errorBody as { message?: string }).message ?? response.statusText;
    throw new Error(`HTTP ${response.status}: ${message}`);
  }
  return response.json();
};

export const api = {
    get: async <TResponse = unknown>(endpoint: string): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: authHeaders(),
      });
      return handleResponse<TResponse>(response);
    },
    post: async <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      data: TBody
    ): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<TResponse>(response);
    },
    put: async <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      data: TBody
    ): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<TResponse>(response);
    },
    delete: async <TResponse = unknown>(endpoint: string): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      return handleResponse<TResponse>(response);
    },
 };
