import Layout from "@/components/common/Layout";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";

interface Business {
  id: string;
  name: string;
  location?: string;
  sector?: string;
  createdAt?: any;
}

export default function DashboardPage() {
  const { user, role, loading } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    if (role === "emprendedor" && user) {
      const fetchBusinesses = async () => {
        const q = query(collection(db, "businesses"), where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Business[];

        setBusinesses(list);
      };

      fetchBusinesses();
    }
  }, [role, user]);

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
          <div>
            <h2 className="text-xl font-semibold mb-2">Tus negocios</h2>
            {businesses.length === 0 ? (
              <p className="text-gray-400">Aún no tienes negocios registrados.</p>
            ) : (
              <ul className="space-y-3">
                {businesses.map((biz) => (
                  <li key={biz.id} className="border border-gray-700 rounded p-4 bg-gray-900">
                    <h3 className="text-lg font-bold">{biz.name}</h3>
                    <p className="text-sm text-gray-400">
                      {biz.location && `📍 ${biz.location}`}{" "}
                      {biz.sector && ` | 🏷️ ${biz.sector}`}
                    </p>
                    {biz.createdAt?.toDate && (
                      <p className="text-xs text-gray-500">
                        Creado el: {biz.createdAt.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}