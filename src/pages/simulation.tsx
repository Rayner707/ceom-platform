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

interface Business {
  id: string;
  name: string;
}

export default function SimulationPage() {
  const { user, role, loading } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [people, setPeople] = useState(1);
  const [ovens, setOvens] = useState(1);
  const [timePerEmpanada, setTimePerEmpanada] = useState(2); // minutos por unidad

  const [efficiency, setEfficiency] = useState(100); // %
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [wagePerHour, setWagePerHour] = useState(15); // Bs por persona
  const [energyCostPerOvenHour, setEnergyCostPerOvenHour] = useState(5); // Bs por horno
  const [batchSize, setBatchSize] = useState(10);
  const [minutesPerBatch, setMinutesPerBatch] = useState(20);

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

  const totalMinutes = weeklyHours * 60;
  const adjustedMinutes = (efficiency / 100) * totalMinutes;
  const totalBatchCapacity = people * ovens * (adjustedMinutes / minutesPerBatch);
  const empanadasMax = Math.floor(totalBatchCapacity * batchSize);
  const laborCost = people * weeklyHours * wagePerHour;
  const energyCost = ovens * weeklyHours * energyCostPerOvenHour;
  const totalCost = laborCost + energyCost;

  const chartData = {
    labels: ["Simulación"],
    datasets: [
      {
        label: "Empanadas por Semana",
        data: [empanadasMax],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Proyección de Producción" },
    },
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Simulador Operativo</h1>

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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm">Personas disponibles</label>
                <input
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value))}
                  className="w-full border rounded p-2"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm">Hornos disponibles</label>
                <input
                  type="number"
                  value={ovens}
                  onChange={(e) => setOvens(parseInt(e.target.value))}
                  className="w-full border rounded p-2"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm">Minutos por empanada</label>
                <input
                  type="number"
                  value={timePerEmpanada}
                  onChange={(e) => setTimePerEmpanada(parseInt(e.target.value))}
                  className="w-full border rounded p-2"
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Eficiencia (%)</label>
                <input type="number" value={efficiency} onChange={(e) => setEfficiency(parseInt(e.target.value))} className="w-full border rounded p-2" min={1} max={100} />
              </div>
              <div>
                <label className="block text-sm">Horas semanales</label>
                <input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(parseInt(e.target.value))} className="w-full border rounded p-2" min={1} />
              </div>
              <div>
                <label className="block text-sm">Tamaño del lote (empanadas)</label>
                <input type="number" value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))} className="w-full border rounded p-2" min={1} />
              </div>
              <div>
                <label className="block text-sm">Minutos por lote</label>
                <input type="number" value={minutesPerBatch} onChange={(e) => setMinutesPerBatch(parseInt(e.target.value))} className="w-full border rounded p-2" min={1} />
              </div>
              <div>
                <label className="block text-sm">Salario por hora (Bs)</label>
                <input type="number" value={wagePerHour} onChange={(e) => setWagePerHour(parseFloat(e.target.value))} className="w-full border rounded p-2" min={0} />
              </div>
              <div>
                <label className="block text-sm">Costo energético por horno/hora (Bs)</label>
                <input type="number" value={energyCostPerOvenHour} onChange={(e) => setEnergyCostPerOvenHour(parseFloat(e.target.value))} className="w-full border rounded p-2" min={0} />
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <Bar options={chartOptions} data={chartData} />
              <p className="mt-4 text-center font-semibold text-lg">
                Capacidad estimada: <span className="text-blue-700">{empanadasMax}</span> empanadas por semana
              </p>
            </div>

            <div className="mt-6 bg-gray-100 rounded p-4 text-sm text-gray-800">
              <p><strong>Costos estimados:</strong></p>
              <ul className="mt-2 list-disc list-inside">
                <li>🧑‍💼 Costo de mano de obra: Bs {laborCost.toFixed(2)}</li>
                <li>🔥 Costo de energía: Bs {energyCost.toFixed(2)}</li>
                <li>💸 Costo total semanal: Bs {totalCost.toFixed(2)}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}