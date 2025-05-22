import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useUser } from "@/context/UserContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useUser();

  if (loading) return null; // evita parpadeos mientras se detecta

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {user && <Sidebar />}

      <div className="flex-1 flex flex-col">
        {user && <Navbar />}

        <main className="flex-grow p-4">{children}</main>

        <footer className="bg-black text-center p-2 text-sm text-gray-500">
          © {new Date().getFullYear()} CEOM
        </footer>
      </div>
    </div>
  );
}