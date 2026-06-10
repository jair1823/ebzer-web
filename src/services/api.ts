const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = {
    get: async <TResponse = unknown>(endpoint: string): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      return response.json();
    },
    post: async <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      data: TBody
    ): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    put: async <TResponse = unknown, TBody = unknown>(
      endpoint: string,
      data: TBody
    ): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async <TResponse = unknown>(endpoint: string): Promise<TResponse> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
      });
      return response.json();
    },
 };
