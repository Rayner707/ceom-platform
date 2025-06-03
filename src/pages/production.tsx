import { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
  id: string;
  name: string;
}

export default function ProductionPage() {
  const { user, role, loading, activeBusiness } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [date, setDate] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  // Cargar productos del negocio activo
  useEffect(() => {
    if (!activeBusiness) return;

    const fetchProducts = async () => {
      const q = query(collection(db, "products"), where("businessId", "==", activeBusiness.id));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setProducts(list);
    };

    fetchProducts();
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const entries = Object.entries(quantities).filter(([_, qty]) => qty !== "");
      for (const [productId, qtyStr] of entries) {
        const cantidad = parseInt(qtyStr);
        if (isNaN(cantidad) || cantidad < 0) continue;

        await addDoc(collection(db, "production"), {
          businessId: activeBusiness?.id,
          productId,
          userId: user?.uid,
          date,
          quantity: cantidad,
          registeredAt: new Date(),
        });
      }

      setQuantities({});
      setMessage("Producción registrada correctamente.");
    } catch (err) {
      console.error("Error al registrar producción:", err);
      setMessage("Ocurrió un error.");
    }
  };

  if (loading) return null;
  if (role !== "emprendedor" && role !== "admin")
    return <p className="p-4 text-red-500">Acceso denegado.</p>;

  if (!activeBusiness) {
    return (
      <Layout>
        <div className="p-4 text-yellow-500">
          Por favor selecciona un negocio desde el Dashboard para continuar.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Registro de Producción</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white text-black p-4 rounded shadow space-y-4"
        >
          <h2 className="text-lg font-semibold">Semana y Cantidades</h2>

          <label className="block text-sm font-medium">
            Semana:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full border p-2 mt-1 rounded"
              required
            />
          </label>

          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id}>
                <label className="block font-medium text-sm">
                  {product.name}
                  <input
                    type="number"
                    placeholder="Cantidad producida"
                    value={quantities[product.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setQuantities((prev) => ({ ...prev, [product.id]: val }));
                      }
                    }}
                    className="block w-full border mt-1 p-2 rounded"
                  />
                </label>
              </div>
            ))}
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Registrar producción
          </button>

          {message && (
            <p className="text-center text-sm text-green-700 mt-2">{message}</p>
          )}
        </form>
      </div>
    </Layout>
  );
}