import React from "react";
import { Navbar } from "../components/Navbar";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="">
        <Navbar />
        {/* main content */}
        <main className="">
          {children}
        </main>
    </div>
  );
};