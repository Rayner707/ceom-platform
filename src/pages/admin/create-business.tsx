import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import { subcategoriesByCategory } from "@/constants/subcategoriesByCategory";

interface Emprendedor {
  id: string;
  name: string;
  email: string;
}

export default function CreateBusinessPage() {
  const { role } = useUser();
  const [emprendedores, setEmprendedores] = useState<Emprendedor[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmprendedores = async () => {
      const q = query(collection(db, "users"), where("role", "==", "emprendedor"));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string; email: string }),
      }));
      setEmprendedores(list);
    };

    fetchEmprendedores();
  }, []);

  if (role !== "admin") {
    return <p className="p-4 text-red-500">Acceso denegado.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const businessRef = await addDoc(collection(db, "businesses"), {
        name,
        ownerId: selectedUserId,
        location,
        category,
        subcategory,
        createdAt: new Date(),
      });

      // Resetear formularios
      setName("");
      setLocation("");
      setCategory("");
      setSubcategory("");
      setSelectedUserId("");

      alert("Negocio creado exitosamente.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al crear el negocio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white text-black p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Registrar nuevo negocio</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Seleccione un emprendedor</option>
            {emprendedores.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded p-2"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Seleccione categoría</option>
            <option value="alimentos">Alimentos</option>
            <option value="servicios">Servicios</option>
            <option value="retail">Retail</option>
          </select>

          {category && (
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Seleccione subcategoría</option>
              {(subcategoriesByCategory[category] || []).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear negocio"}
          </button>
        </form>
      </div>
    </Layout>
  );
}