import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { canManageOrderStatuses, canManageUsers, useAuth } from "../auth";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const allNavItems = [
    { path: "/orders", label: "Pedidos", icon: "📦", adminOnly: false },
    { path: "/agenda", label: "Agenda", icon: "🗓️", adminOnly: false },
    { path: "/expenses", label: "Gastos", icon: "📊", adminOnly: false },
    { path: "/settings/statuses", label: "Estados", icon: "⚙️", canShow: canManageOrderStatuses },
    { path: "/settings/users", label: "Usuarios", icon: "👥", canShow: canManageUsers },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.canShow || (user && item.canShow(user.role))
  );

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    operator: "Operador",
    guest: "Invitado",
  };

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:px-4 focus:py-2 focus:outline-none focus:ring-2 bg-surface text-primary focus-ring"
      >
        Ir al contenido principal
      </a>

      <header
        className="sticky top-0 z-40 w-full border-b bg-surface shadow-sm border-default"
        role="banner"
      >
        <nav
          className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4 lg:px-6"
          aria-label="Navegación principal"
        >
          {/* Left: branding + desktop nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex shrink-0 items-center">
              <h1 className="text-brand-primary font-mono text-base font-bold tracking-tight lg:text-lg">
                <span className="hidden sm:inline">Creaciones </span>Eben-Ezer
              </h1>
            </div>

            <div className="hidden items-center gap-1 md:flex" role="navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/orders"}
                  className={({ isActive }) =>
                    `group relative flex h-12 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "border-primary text-brand-primary"
                        : "border-transparent text-secondary hover:border-border hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="text-base" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right: user info + logout (desktop) + mobile menu button */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-primary font-medium">{user.name}</span>
                <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-brand-primary">
                  {roleLabels[user.role] ?? user.role}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
                >
                  Salir
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-surface-elevated hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus-ring"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="border-t bg-surface md:hidden border-default"
            role="navigation"
            aria-label="Navegación móvil"
          >
            <div className="space-y-1 px-3 pb-3 pt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/orders"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary-soft text-brand-primary"
                        : "text-primary hover:bg-surface-elevated hover:text-primary"
                    }`
                  }
                >
                  <span className="text-lg" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {/* Mobile user info + logout */}
              {user && (
                <div className="mt-2 border-t border-subtle pt-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{user.name}</span>
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-brand-primary">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
