import Link from "next/link";
import { useState } from "react";
import router, { useRouter } from "next/router";
import { logoutUser } from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useRouter();

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === href
          ? "bg-blue-700 text-white"
          : "text-white hover:bg-blue-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="md:hidden bg-blue-600 text-white p-4 flex items-center justify-between relative z-10">
      <h1 className="text-xl font-bold">CEOM</h1>
      <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
        ☰
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full bg-blue-500 shadow-md mt-2 rounded-b-md">
          <div className="p-2 flex flex-col space-y-2">
            {navItem("/dashboard", "Dashboard")}
            {navItem("/products", "Productos")}
            {navItem("/production", "Producción")}
            {navItem("/production-history", "Historial de Producción")}
            {navItem("/fixed-costs", "Costos Fijos")}
            {navItem("/break-even", "Punto de Equilibrio")}
            {navItem("/summary", "Resumen Financiero")}
            {navItem("/simulation", "Simulación")}
            {<button
  onClick={() => {
    setOpen(false);
    logoutUser(router);
  }}
  className="block px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-red-600"
>
  Cerrar sesión
</button>}
          </div>
        </div>
      )}
    </nav>
  );
}