import { logoutUser } from "@/lib/auth";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { sectionsByCategory } from "@/constants/sectionsByCategory";

export default function Sidebar() {
  const { pathname } = useRouter();
  const { role, activeBusiness, loading } = useUser();

  const navItem = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        pathname === href
          ? "bg-blue-700 text-white"
          : "text-gray-200 hover:bg-blue-600 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const businessCategory = activeBusiness?.category ?? "";
  const userSections = sectionsByCategory[businessCategory] ?? [];

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-gray-900 text-white shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-6 text-white">CEOM</h2>
      <nav className="flex flex-col gap-2">
        {navItem("/dashboard", "Dashboard")}
        {userSections.map((section) => navItem(section.path, section.name))}

        {role === "emprendedor" && (
          navItem("/pricing", "Cálculo de Precio")
        )}

        {role === "admin" && (
          <>
            <hr className="my-4 border-gray-700" />
            <p className="text-sm text-gray-400 mb-1">Administración</p>
            {navItem("/admin/create-user", "Crear Usuario")}
            {navItem("/admin/create-business", "Crear Negocio")}
          </>
        )}

        <button
          onClick={() => logoutUser(router)}
          className="mt-auto px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:bg-red-600 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}