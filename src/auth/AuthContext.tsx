import React, { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "./types";
import { authService } from "./authService";
import { clearTokens, getAccessToken } from "./tokenStorage";
import { AuthContext } from "./authContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    authService
      .me(token)
      .then((authUser) => setUser(authUser))
      .catch(() => {
        // Token invalid or expired — try refresh before giving up
        return authService
          .refresh()
          .then((newToken) => authService.me(newToken))
          .then((authUser) => setUser(authUser))
          .catch(() => {
            clearTokens();
          });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    const token = getAccessToken() ?? undefined;
    await authService.logout(token);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
