import React from "react";
import type { CreateUserPayload, Role, UpdateUserPayload, User } from "../../auth";
import { usersService } from "../../services";
import { ConfirmModal, Toast } from "../../components";
import { useConfirmModal, useToast } from "../../hooks";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  operator: "Operador",
  guest: "Invitado",
};

const initialCreateForm: CreateUserPayload = {
  name: "",
  email: "",
  password: "",
  role: "operator",
};

const toInputDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createForm, setCreateForm] = React.useState<CreateUserPayload>(initialCreateForm);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editForm, setEditForm] = React.useState<UpdateUserPayload>({});
  const [saving, setSaving] = React.useState(false);
  const {
    isOpen: isConfirmOpen,
    config: confirmConfig,
    openConfirm,
    closeConfirm,
  } = useConfirmModal();
  const {
    isVisible: isToastVisible,
    config: toastConfig,
    hideToast,
    showSuccess,
    showError,
  } = useToast();

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersService.list();
      setUsers(response);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      password: "",
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await usersService.create(createForm);
      setCreateForm(initialCreateForm);
      showSuccess("Usuario creado");
      await loadUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;

    const payload: UpdateUserPayload = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      is_active: editForm.is_active,
    };
    if (editForm.password?.trim()) {
      payload.password = editForm.password;
    }

    setSaving(true);
    try {
      await usersService.update(editingUser.id, payload);
      showSuccess("Usuario actualizado");
      closeEdit();
      await loadUsers();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al actualizar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (user: User) => {
    openConfirm({
      title: "Desactivar usuario",
      message: `¿Deseas desactivar a "${user.name}"? Este usuario ya no podrá iniciar sesión.`,
      confirmText: "Desactivar",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: async () => {
        try {
          await usersService.deactivate(user.id);
          showSuccess("Usuario desactivado");
          await loadUsers();
        } catch (error) {
          showError(error instanceof Error ? error.message : "Error al desactivar usuario");
        }
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Usuarios</h1>
          <p className="mt-1 text-sm text-secondary">
            Administra accesos, roles y estado de usuarios.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mb-6 surface-card rounded-lg px-5 py-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-primary">Nuevo usuario</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_10rem_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-primary">Nombre</span>
            <input
              className="input-base"
              value={createForm.name}
              onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-primary">Correo</span>
            <input
              className="input-base"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((form) => ({ ...form, email: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-primary">Contraseña</span>
            <input
              className="input-base"
              type="password"
              minLength={8}
              value={createForm.password}
              onChange={(event) => setCreateForm((form) => ({ ...form, password: event.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-primary">Rol</span>
            <select
              className="input-base"
              value={createForm.role}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, role: event.target.value as Role }))
              }
            >
              <option value="admin">Admin</option>
              <option value="operator">Operador</option>
              <option value="guest">Invitado</option>
            </select>
          </label>
          <button
            type="submit"
            className="btn-base btn-secondary rounded-md whitespace-nowrap"
            disabled={saving}
          >
            Crear
          </button>
        </div>
      </form>

      <div className="overflow-hidden surface-card rounded-lg">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-secondary">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-secondary">No hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle">
              <thead className="bg-primary-soft">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Usuario</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Rol</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">Creado</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle bg-surface">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-primary">{user.name}</div>
                      <div className="text-xs text-secondary">{user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-primary">{roleLabels[user.role]}</td>
                    <td className="px-5 py-4">
                      <span className={user.is_active ? "badge-success" : "badge-danger"}>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-secondary">{toInputDate(user.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn-base btn-outline rounded-md px-3 py-1 text-xs"
                          onClick={() => openEdit(user)}
                        >
                          Editar
                        </button>
                        {user.is_active && (
                          <button
                            type="button"
                            className="btn-base btn-outline rounded-md px-3 py-1 text-xs text-danger"
                            onClick={() => handleDeactivate(user)}
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm" style={{ backgroundColor: "rgb(var(--background) / 0.7)" }}>
          <form onSubmit={handleUpdate} className="w-full max-w-lg overflow-hidden rounded-lg border border-subtle bg-surface shadow-2xl">
            <div className="border-b border-subtle px-6 py-4">
              <h2 className="text-base font-semibold text-primary">Editar usuario</h2>
              <p className="mt-1 text-sm text-secondary">{editingUser.email}</p>
            </div>
            <div className="grid gap-4 px-6 py-5">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Nombre</span>
                <input
                  className="input-base"
                  value={editForm.name ?? ""}
                  onChange={(event) => setEditForm((form) => ({ ...form, name: event.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Correo</span>
                <input
                  className="input-base"
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={(event) => setEditForm((form) => ({ ...form, email: event.target.value }))}
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-primary">Rol</span>
                  <select
                    className="input-base"
                    value={editForm.role ?? "operator"}
                    onChange={(event) =>
                      setEditForm((form) => ({ ...form, role: event.target.value as Role }))
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operador</option>
                    <option value="guest">Invitado</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-primary">Estado</span>
                  <select
                    className="input-base"
                    value={editForm.is_active ? "active" : "inactive"}
                    onChange={(event) =>
                      setEditForm((form) => ({ ...form, is_active: event.target.value === "active" }))
                    }
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-primary">Nueva contraseña</span>
                <input
                  className="input-base"
                  type="password"
                  minLength={8}
                  value={editForm.password ?? ""}
                  onChange={(event) => setEditForm((form) => ({ ...form, password: event.target.value }))}
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-subtle bg-surface-elevated px-6 py-4">
              <button type="button" className="btn-base btn-outline rounded-md" onClick={closeEdit}>
                Cancelar
              </button>
              <button type="submit" className="btn-base btn-primary rounded-md" disabled={saving}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmConfig && (
        <ConfirmModal isOpen={isConfirmOpen} onClose={closeConfirm} {...confirmConfig} />
      )}
      <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
    </div>
  );
};
