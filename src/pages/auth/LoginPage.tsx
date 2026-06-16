import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/orders" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl shadow-sm surface-card">
        <div className="px-8 py-8">
          {/* Brand */}
          <div className="mb-6 text-center">
            <h1 className="text-brand-primary font-mono text-xl font-bold tracking-tight">
              Creaciones Eben-Ezer
            </h1>
            <p className="mt-1 text-sm text-secondary">Inicia sesión para continuar</p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                className="input-base rounded-md placeholder-tertiary disabled:opacity-60"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="input-base rounded-md placeholder-tertiary disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="btn-base btn-primary w-full rounded-md py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
