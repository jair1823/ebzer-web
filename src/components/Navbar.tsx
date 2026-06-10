import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Pedidos", icon: "📦" },
    { path: "/agenda", label: "Agenda", icon: "🗓️" },
    { path: "/expenses", label: "Gastos", icon: "📊" },
    { path: "/settings/statuses", label: "Estados", icon: "⚙️" },
  ];

  return (
    <>
      {/* Skip to main content link - Accessibility best practice from Carbon */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-md focus:px-4 focus:py-2 focus:outline-none focus:ring-2 bg-surface text-primary focus-ring"
      >
        Ir al contenido principal
      </a>

      {/* Header - Carbon UI Shell inspired */}
      <header
        className="sticky top-0 z-40 w-full border-b bg-surface shadow-sm border-default"
        role="banner"
      >
        <nav
          className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-4 lg:px-6"
          aria-label="Navegación principal"
        >
          {/* Left section: Product branding (Carbon: product-level) */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Brand/Logo */}
            <div className="flex shrink-0 items-center">
              <h1 className="text-brand-primary font-mono text-base font-bold tracking-tight lg:text-lg">
                <span className="hidden sm:inline">Creaciones </span>Eben-Ezer
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-1 md:flex" role="navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
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
                      <span className="text-base" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right section: Mobile menu button (Carbon: system-level controls) */}
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
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu panel - Follows Carbon responsive pattern */}
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
                  end={item.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary-soft text-brand-primary"
                        : "text-primary hover:bg-surface-elevated hover:text-primary"
                    }`
                  }
                >
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
