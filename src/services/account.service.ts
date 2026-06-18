import { api } from "./api";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export const accountService = {
  changePassword: async (data: ChangePasswordPayload): Promise<{ updated: boolean }> => {
    return api.put<{ updated: boolean }, ChangePasswordPayload>("/auth/password", data);
  },
};
