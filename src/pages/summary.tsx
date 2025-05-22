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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

interface Business {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface Production {
  productId: string;
  quantity: number;
  date: string; // YYYY-MM-DD
}

interface FixedCost {
  amount: number;
  frequency: string; // should be 'semanal'
  createdAt: Timestamp;
}

export default function SummaryPage() {
  const { user, role, loading } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    if (!user || !role) return;

    const fetchBusinesses = async () => {
      const q = role === "admin"
        ? query(collection(db, "businesses"))
        : query(collection(db, "businesses"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      setBusinesses(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
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

      const prodQ = query(collection(db, "production"), where("businessId", "==", selectedBusinessId));
      const prodSnap = await getDocs(prodQ);
      setProductions(prodSnap.docs.map(doc => doc.data() as Production));

      const costQ = query(collection(db, "fixed_costs"), where("businessId", "==", selectedBusinessId));
      const costSnap = await getDocs(costQ);
      setCosts(costSnap.docs.map(doc => doc.data() as FixedCost));
    };

    fetchData();
  }, [selectedBusinessId]);

  const groupByWeek = () => {
    const grouped: Record<string, { ingresos: number; costosVar: number; utilidad: number }> = {};

    productions.forEach((prod) => {
      const product = products.find((p) => p.id === prod.productId);
      if (!product) return;
      const week = format(new Date(prod.date), "yyyy-'W'II");
      const ingreso = product.price * prod.quantity;
      const costoVar = product.cost * prod.quantity;

      if (!grouped[week]) {
        grouped[week] = { ingresos: 0, costosVar: 0, utilidad: 0 };
      }

      grouped[week].ingresos += ingreso;
      grouped[week].costosVar += costoVar;
      grouped[week].utilidad += ingreso - costoVar;
    });

    return grouped;
  };

  const resumen = groupByWeek();
  const semanasDisponibles = Object.keys(resumen).sort().reverse();
  const selected = resumen[selectedWeek];
  const fixedWeekly = costs.reduce((acc, c) => acc + c.amount, 0);
  const utilidadNeta = selected ? selected.utilidad - fixedWeekly : 0;

  const exportToCSV = () => {
    if (!selected || !selectedWeek) return;

    const rows = [
      ["Semana", "Ingresos", "Costos Variables", "Utilidad Bruta", "Costos Fijos", "Utilidad Neta"],
      [
        selectedWeek,
        selected.ingresos.toFixed(2),
        selected.costosVar.toFixed(2),
        selected.utilidad.toFixed(2),
        fixedWeekly.toFixed(2),
        utilidadNeta.toFixed(2),
      ],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumen_${selectedWeek}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    if (!selected || !selectedWeek) return;

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.text(`Resumen Financiero - ${selectedWeek}`, 14, 20);

    autoTable(doc, {
      head: [["Semana", "Ingresos", "Costos Variables", "Utilidad Bruta", "Costos Fijos", "Utilidad Neta"]],
      body: [[
        selectedWeek,
        `Bs ${selected.ingresos.toFixed(2)}`,
        `Bs ${selected.costosVar.toFixed(2)}`,
        `Bs ${selected.utilidad.toFixed(2)}`,
        `Bs ${fixedWeekly.toFixed(2)}`,
        `Bs ${utilidadNeta.toFixed(2)}`
      ]],
      startY: 30,
    });

    doc.save(`resumen_${selectedWeek}.pdf`);
  };

  const chartData = {
    labels: Object.keys(resumen),
    datasets: [
      {
        label: "Ingresos",
        data: Object.values(resumen).map((r) => r.ingresos),
        backgroundColor: "rgba(59, 130, 246, 0.6)", // azul
      },
      {
        label: "Costos Variables",
        data: Object.values(resumen).map((r) => r.costosVar),
        backgroundColor: "rgba(234, 179, 8, 0.6)", // amarillo
      },
      {
        label: "Utilidad Bruta",
        data: Object.values(resumen).map((r) => r.utilidad),
        backgroundColor: "rgba(34, 197, 94, 0.6)", // verde
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Resumen Financiero por Semana",
      },
    },
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Resumen Financiero</h1>

        {Object.keys(resumen).length > 0 && (
          <div className="bg-white rounded shadow p-4">
            <Bar options={chartOptions} data={chartData} />
          </div>
        )}

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
            <select
              className="w-full p-2 border rounded"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">Selecciona una semana</option>
              {semanasDisponibles.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            {selected && (
              <div className="flex gap-4 mt-4">
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
            )}

            {selected && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-900 text-white p-4 rounded shadow">
                  <p className="text-sm">Ingresos Totales</p>
                  <h2 className="text-2xl font-bold">Bs {selected.ingresos.toFixed(2)}</h2>
                </div>
                <div className="bg-yellow-800 text-white p-4 rounded shadow">
                  <p className="text-sm">Costos Variables</p>
                  <h2 className="text-2xl font-bold">Bs {selected.costosVar.toFixed(2)}</h2>
                </div>
                <div className="bg-green-800 text-white p-4 rounded shadow">
                  <p className="text-sm">Utilidad Bruta</p>
                  <h2 className="text-2xl font-bold">Bs {selected.utilidad.toFixed(2)}</h2>
                </div>
                <div className="bg-pink-900 text-white p-4 rounded shadow">
                  <p className="text-sm">Costos Fijos Semanales</p>
                  <h2 className="text-2xl font-bold">Bs {fixedWeekly.toFixed(2)}</h2>
                </div>
                <div className="bg-indigo-900 text-white p-4 rounded shadow">
                  <p className="text-sm">Utilidad Neta</p>
                  <h2 className="text-2xl font-bold">Bs {utilidadNeta.toFixed(2)}</h2>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
