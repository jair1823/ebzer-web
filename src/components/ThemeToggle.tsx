import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getInitialTheme = (): "light" | "dark" => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return savedTheme || (prefersDark ? "dark" : "light");
};

/**
 * ThemeToggle - Componente de desarrollo para cambio rápido de tema
 * Solo visible en modo desarrollo
 * Persiste preferencia en localStorage
 */
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  // Sincronizar tema con el DOM y localStorage.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle entre light y dark
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.MODE !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleTheme}
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          backgroundColor: theme === "light" ? "#f43f5e" : "#34d3ee",
          color: "#ffffff",
        }}
        aria-label={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
        title={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
      >
        {theme === "light" ? (
          <Moon size={24} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun size={24} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      {/* Badge indicador */}
      <div
        className="pointer-events-none absolute -top-1 -left-1 rounded-full px-2 py-0.5 text-xs font-bold shadow-md"
        style={{
          backgroundColor: theme === "light" ? "#334155" : "#f8fafc",
          color: theme === "light" ? "#f8fafc" : "#334155",
        }}
      >
        DEV
      </div>
    </div>
  );
};
