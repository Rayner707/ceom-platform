import { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
  id: string;
  name: string;
}

interface ProductionRecord {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  registeredAt: any;
}

export default function ProductionHistoryPage() {
  const { user, role, loading, activeBusiness } = useUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!activeBusiness) return;

    const fetchData = async () => {
      const productQ = query(
        collection(db, "products"),
        where("businessId", "==", activeBusiness.id)
      );
      const productSnap = await getDocs(productQ);
      const productList = productSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setProducts(productList);

      const productionQ = query(
        collection(db, "production"),
        where("businessId", "==", activeBusiness.id),
        orderBy("registeredAt", "desc")
      );
      const prodSnap = await getDocs(productionQ);
      const prodList = prodSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRecords(prodList);
    };

    fetchData();
  }, [activeBusiness]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Producto desconocido";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await deleteDoc(doc(db, "production", id));
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error eliminando el registro:", err);
    }
  };

  const handleEdit = async (rec: ProductionRecord) => {
    const newQty = prompt("Nueva cantidad:", rec.quantity.toString());
    if (newQty === null) return;
    const parsed = parseInt(newQty);
    if (isNaN(parsed)) {
      alert("Cantidad inválida");
      return;
    }

    try {
      await updateDoc(doc(db, "production", rec.id), { quantity: parsed });
      setRecords(records.map(r => r.id === rec.id ? { ...r, quantity: parsed } : r));
    } catch (err) {
      console.error("Error actualizando la cantidad:", err);
    }
  };

  const filteredRecords = records.filter((rec) => {
    if (!startDate && !endDate) return true;
    const recDate = new Date(rec.date);
    if (startDate && recDate < new Date(startDate)) return false;
    if (endDate && recDate > new Date(endDate)) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ["Producto", "Fecha", "Cantidad", "Registrado"];
    const rows = filteredRecords.map((rec) => [
      getProductName(rec.productId),
      rec.date,
      rec.quantity.toString(),
      rec.registeredAt?.toDate ? rec.registeredAt.toDate().toLocaleString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial_produccion.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    setExporting(true);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.text("Historial de Producción", 14, 20);

    const rows = filteredRecords.map((rec) => [
      getProductName(rec.productId),
      rec.date,
      rec.quantity.toString(),
      rec.registeredAt?.toDate ? rec.registeredAt.toDate().toLocaleString() : "",
    ]);

    autoTable(doc, {
      head: [["Producto", "Fecha", "Cantidad", "Registrado"]],
      body: rows,
      startY: 30,
    });

    doc.save("historial_produccion.pdf");
    setExporting(false);
  };

  if (loading) return null;
  if (role !== "emprendedor" && role !== "admin")
    return <p className="p-4 text-red-500">Acceso denegado.</p>;

  if (!activeBusiness) {
    return (
      <Layout>
        <div className="p-4 text-yellow-500">
          Por favor selecciona un negocio desde el Dashboard para ver el historial.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Historial de Producción</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-white">Desde:</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-white">Hasta:</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
          >
            Exportar PDF
          </button>
        </div>

        {filteredRecords.length > 0 ? (
          <ul className="space-y-2">
            {filteredRecords.map((rec) => (
              <li key={rec.id} className="border rounded p-4 bg-gray-900 text-white">
                <p><strong>📦 Producto:</strong> {getProductName(rec.productId)}</p>
                <p><strong>📅 Fecha:</strong> {rec.date}</p>
                <p><strong>🔢 Cantidad:</strong> {rec.quantity}</p>
                <p className="text-sm text-gray-400">
                  Registrado el:{" "}
                  {rec.registeredAt?.toDate
                    ? rec.registeredAt.toDate().toLocaleString()
                    : "N/A"}
                </p>
                {role === "emprendedor" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay registros de producción.</p>
        )}
      </div>
    </Layout>
  );
}