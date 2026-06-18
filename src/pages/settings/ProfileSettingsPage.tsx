import React, { useState } from "react";
import { KeyRound, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../../auth";
import { accountService } from "../../services";
import { useTheme, type Theme } from "../../theme";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  operator: "Operador",
  guest: "Invitado",
};

const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return "No se pudo actualizar la contraseña.";
  return error.message.replace(/^HTTP \d+:\s*/, "");
};

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      await accountService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Contraseña actualizada correctamente.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const themeOptions: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
    { value: "light", label: "Claro", Icon: Sun },
    { value: "dark", label: "Oscuro", Icon: Moon },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 lg:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-brand-primary">
          <Settings size={22} strokeWidth={2} aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-primary">Ajustes</h1>
        </div>
        <p className="text-sm text-secondary">
          Gestiona la seguridad de tu cuenta y la apariencia de la aplicación.
        </p>
      </header>

      <section className="rounded-lg border border-default bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-subtle pb-4">
          <h2 className="text-lg font-semibold text-primary">Cuenta</h2>
          <p className="text-sm text-secondary">
            {user?.name} · @{user?.username} · {user ? roleLabels[user.role] ?? user.role : ""}
          </p>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleChangePassword}>
          <div className="flex items-center gap-2 text-primary">
            <KeyRound size={18} strokeWidth={2} aria-hidden="true" />
            <h3 className="text-base font-semibold">Cambiar contraseña</h3>
          </div>

          {error && (
            <div className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-success-muted bg-success-soft px-3 py-2 text-sm text-success" role="status">
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-primary">
              Contraseña actual
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="input-base"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-primary">
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="input-base"
                minLength={8}
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-primary">
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="input-base"
                minLength={8}
                required
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound size={16} strokeWidth={2} aria-hidden="true" />
              {submitting ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-default bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">Tema</h2>
          <p className="text-sm text-secondary">
            Elige cómo quieres ver la aplicación en este navegador.
          </p>
        </div>

        <div className="mt-5 inline-flex rounded-lg border border-default bg-surface-elevated p-1">
          {themeOptions.map(({ value, label, Icon }) => {
            const active = theme === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={active}
                className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-secondary hover:bg-surface hover:text-primary"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
