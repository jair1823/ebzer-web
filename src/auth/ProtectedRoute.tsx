import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { Role } from "./types";

const FullPageSpinner: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-secondary text-sm">Cargando...</div>
  </div>
);

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RequireRole: React.FC<{ role: Role }> = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;
  if (!user || user.role !== role) return <Navigate to="/orders" replace />;
  return <Outlet />;
};
