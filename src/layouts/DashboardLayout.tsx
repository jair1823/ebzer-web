import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};