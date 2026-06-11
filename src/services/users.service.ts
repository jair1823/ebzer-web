import { api } from "./api";
import type { CreateUserPayload, UpdateUserPayload, User } from "../auth";

interface UsersResponse {
  users: User[];
}

export const usersService = {
  list: async (): Promise<User[]> => {
    const response = await api.get<UsersResponse>("/users");
    return response.users;
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    return api.post<User, CreateUserPayload>("/users", data);
  },

  update: async (id: number, data: UpdateUserPayload): Promise<User> => {
    return api.put<User, UpdateUserPayload>(`/users/${id}`, data);
  },

  deactivate: async (id: number): Promise<{ deactivated: boolean }> => {
    return api.delete<{ deactivated: boolean }>(`/users/${id}`);
  },
};
