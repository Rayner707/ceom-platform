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
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  createdAt: Timestamp;
  category?: string;
}

export default function FixedCostsPage() {
  const { user, role, loading, activeBusiness } = useUser();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [costs, setCosts] = useState<FixedCost[]>([]);

  useEffect(() => {
    const fetchCosts = async () => {
      if (!activeBusiness) return;
      const q = query(
        collection(db, "fixed_costs"),
        where("businessId", "==", activeBusiness.id)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setCosts(list);
    };
    fetchCosts();
  }, [activeBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!activeBusiness) {
      setError("Debes seleccionar un negocio.");
      return;
    }

    try {
      const newCost = {
        name,
        amount: parseFloat(amount),
        frequency: "semanal",
        businessId: activeBusiness.id,
        userId: user?.uid,
        category,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, "fixed_costs"), newCost);
      setName("");
      setAmount("");
      setCategory("");
      setCosts([...costs, { id: docRef.id, ...newCost }]);
    } catch (err) {
      console.error(err);
      setError("Error al crear costo fijo.");
    }
  };

  const handleEdit = async (cost: FixedCost) => {
    const newName = prompt("Nuevo nombre:", cost.name);
    const newAmount = prompt("Nuevo monto:", cost.amount.toString());

    if (!newName || !newAmount) return;
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum)) {
      alert("Monto inválido");
      return;
    }

    try {
      const costRef = doc(db, "fixed_costs", cost.id);
      await updateDoc(costRef, { name: newName, amount: amountNum });

      const updated = costs.map((c) =>
        c.id === cost.id ? { ...c, name: newName, amount: amountNum } : c
      );
      setCosts(updated);
    } catch (err) {
      console.error("Error al editar costo:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este costo?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "fixed_costs", id));
      setCosts(costs.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  if (loading) return null;
  const isReadonly = role === "admin";

  if (!activeBusiness) {
    return (
      <Layout>
        <div className="p-4 text-yellow-500">
          Por favor selecciona un negocio desde el Dashboard para ver los costos fijos.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Costos Fijos</h1>

        {!isReadonly && (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 bg-white text-black p-4 rounded shadow"
          >
            <h2 className="text-lg font-semibold">Agregar Costo Fijo</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="text"
              placeholder="Nombre del Costo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <select
              className="w-full border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Servicios">Servicios</option>
              <option value="Transporte">Transporte</option>
              <option value="Personal">Personal</option>
              <option value="Otro">Otro</option>
            </select>
            <input
              type="number"
              placeholder="Monto (Bs)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
              Guardar
            </button>
          </form>
        )}

        {costs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Costos Registrados</h2>
            <ul className="space-y-2">
              {costs.map((cost) => (
                <li
                  key={cost.id}
                  className="border p-3 rounded bg-gray-900 text-white"
                >
                  <p className="font-bold">{cost.name}</p>
                  <p className="text-sm text-gray-300">
                    💰 Monto: {cost.amount} Bs | 📆 Frecuencia: {cost.frequency}
                  </p>
                  {!isReadonly && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(cost)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}