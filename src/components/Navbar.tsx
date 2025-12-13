import React from "react";
import { NavLink } from "react-router-dom";

export const Navbar: React.FC = () => {
  const navItems = [
    { path: "/", label: "Pedidos" },
    { path: "/incomes", label: "Ingresos" },
    { path: "/expenses", label: "Gastos" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="shrink-0">
                <h1 className="font-mono font-bold text-red-900 text-2xl">
                  Creaciones Eben-Ezer
                </h1>
              </div>
              <div className="hidden md:flex gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-red-400/80 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* todo: make this button functional */}
              <button
                type="button"
                command="--toggle"
                commandfor="mobile-menu"
                className="bg-red-500 relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-6 in-aria-expanded:hidden"
                >
                  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-6 not-in-aria-expanded:hidden"
                >
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
