import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
};
