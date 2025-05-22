import { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Business {
  id: string;
  name: string;
  ownerId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface FixedCost {
  id: string;
  name: string;
  amount: number;
}

export default function BreakEvenPage() {
  const { user, role, loading } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    if (!user || !role) return;

    const fetchBusinesses = async () => {
      const q = role === "admin"
        ? query(collection(db, "businesses"))
        : query(collection(db, "businesses"), where("ownerId", "==", user.uid));

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setBusinesses(list);
    };

    fetchBusinesses();
  }, [user, role]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBusinessId) return;

      const productQ = query(collection(db, "products"), where("businessId", "==", selectedBusinessId));
      const productSnap = await getDocs(productQ);
      const productList = productSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setProducts(productList);

      const costQ = query(collection(db, "fixed_costs"), where("businessId", "==", selectedBusinessId));
      const costSnap = await getDocs(costQ);
      const costList = costSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setCosts(costList);
    };

    fetchData();
  }, [selectedBusinessId]);

    // Filtrar los costos fijos por fecha y categoría
    const filteredCosts = costs.filter((c: any) => {
    const createdAt = c.createdAt?.toDate?.();
    const dateOk =
        (!startDate || (createdAt && createdAt >= new Date(startDate))) &&
        (!endDate || (createdAt && createdAt <= new Date(endDate)));

    const categoryOk =
        !categoryFilter || c.category?.toLowerCase() === categoryFilter.toLowerCase();

    return dateOk && categoryOk;
    });

    // Calcular total filtrado
    const totalFixedCosts = filteredCosts.reduce((acc, c) => acc + c.amount, 0);

    // Calcular punto de equilibrio ponderado total
    const validProducts = products.filter(p => p.price > p.cost);
    const totalRevenuePerUnit = validProducts.reduce((acc, p) => acc + (p.price - p.cost), 0);

    const totalWeightedBreakEven = totalRevenuePerUnit > 0
      ? (totalFixedCosts / totalRevenuePerUnit).toFixed(2)
      : "N/A";

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Análisis de Punto de Equilibrio", 14, 20);

    const data = products.map(p => [
      p.name,
      `${p.price} Bs`,
      `${p.cost} Bs`,
      `${(totalFixedCosts / (p.price - p.cost)).toFixed(2)} unidades`,
    ]);

    autoTable(doc, {
      head: [["Producto", "Precio", "Costo Variable", "Punto de Equilibrio"]],
      body: data,
      startY: 30,
    });

    doc.save("break_even_analysis.pdf");
  };

  const exportToCSV = () => {
    const headers = ["Producto", "Precio", "Costo Variable", "Punto de Equilibrio"];
    const rows = products.map(p => [
      p.name,
      `${p.price} Bs`,
      `${p.cost} Bs`,
      `${(totalFixedCosts / (p.price - p.cost)).toFixed(2)} unidades`,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "break_even_analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartLabels = products.map((p) => p.name);
  const chartData = products.map((p) =>
    p.price > p.cost
      ? Number((totalFixedCosts / (p.price - p.cost)).toFixed(2))
      : 0
  );

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: "Punto de Equilibrio (unidades)",
        data: chartData,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Comparación de Punto de Equilibrio por Producto",
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "white" },
      },
    },
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Punto de Equilibrio</h1>

        <select
          className="w-full p-2 border rounded"
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
        >
          <option value="">Selecciona un negocio</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {selectedBusinessId && (
          <>
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >Exportar CSV</button>
              <button
                onClick={exportToPDF}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
              >Exportar PDF</button>
            </div>

            <p className="bg-blue-800 text-white p-4 rounded shadow font-semibold text-center">
              Punto de Equilibrio Total Estimado: <span className="text-yellow-300">{totalWeightedBreakEven}</span> unidades
            </p>
            <ul className="space-y-3 mt-4">
              {products.map(p => {
                const showWarning = p.price <= p.cost;
                const pe = p.price > p.cost
                    ? (totalFixedCosts / (p.price - p.cost)).toFixed(2)
                    : "N/A";

                return (
                    <li key={p.id} className={`p-4 border rounded ${showWarning ? 'bg-red-800' : 'bg-gray-900'} text-white`}>
                    <p><strong>📦 Producto:</strong> {p.name}</p>
                    <p><strong>💲 Precio:</strong> {p.price} Bs</p>
                    <p><strong>🧾 Costo Variable:</strong> {p.cost} Bs</p>
                    <p><strong>⚖️ Punto de Equilibrio:</strong> {pe} unidades</p>
                    {showWarning && (
                        <p className="text-yellow-300 text-sm font-semibold mt-2">
                        ⚠️ El precio es menor o igual al costo. No genera utilidad.
                        </p>
                    )}
                    </li>
                );
                })}
            </ul>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label className="text-sm text-white">Desde</label>
            <input
            type="date"
            className="w-full p-2 border rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            />
        </div>
        <div>
            <label className="text-sm text-white">Hasta</label>
            <input
            type="date"
            className="w-full p-2 border rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            />
        </div>
        <div>
            <label className="text-sm text-white">Categoría</label>
            <select
            className="w-full p-2 border rounded"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            >
            <option value="">Todas</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Servicios">Servicios</option>
            <option value="Transporte">Transporte</option>
            <option value="Personal">Personal</option>
            <option value="Otro">Otro</option>
            </select>
        </div>
      </div>
      <div className="mt-10 bg-gray-900 p-6 rounded shadow">
        <Bar data={data} options={options} />
      </div>
    </Layout>
  );
}