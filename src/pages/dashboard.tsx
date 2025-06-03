import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const {
    user,
    role,
    loading,
    businesses,
    activeBusiness,
    setActiveBusiness,
  } = useUser();

  if (loading) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Bienvenido, {user?.email}
        </h1>

        {role === "admin" && (
          <div className="text-gray-200">
            <p className="text-lg">Eres administrador del sistema CEOM.</p>
            <p>Puedes crear usuarios, asignar negocios y gestionar los datos.</p>
          </div>
        )}

        {role === "emprendedor" && (
          <div className="text-white">
            <h2 className="text-xl font-semibold mb-2">Tus negocios</h2>

            {businesses.length === 0 ? (
              <p className="text-gray-400">Aún no tienes negocios registrados.</p>
            ) : (
              <div className="space-y-4">
                {businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className={`border rounded p-4 cursor-pointer ${
                      activeBusiness?.id === biz.id
                        ? "border-blue-500 bg-blue-950"
                        : "border-gray-700 bg-gray-900 hover:border-blue-500"
                    }`}
                    onClick={() => setActiveBusiness(biz)}
                  >
                    <h3 className="text-lg font-bold">{biz.name}</h3>
                    <p className="text-sm text-gray-400">
                      {biz.location && `📍 ${biz.location}`}{" "}
                      {biz.category && ` | 🏷️ ${biz.category}`}
                    </p>
                    {biz.createdAt?.toDate && (
                      <p className="text-xs text-gray-500">
                        Creado el: {biz.createdAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}

                <div className="mt-4 p-4 border border-green-600 rounded bg-green-900 text-white">
                  <p className="font-semibold">Negocio activo:</p>
                  <p>
                    <strong>{activeBusiness?.name}</strong> (
                    {activeBusiness?.category})
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}