import React, { useEffect, useState } from "react";

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
          // Icono de luna (modo oscuro)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          // Icono de sol (modo claro)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
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
