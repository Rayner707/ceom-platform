import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HamburguesasSimulatorForm() {
  const [people, setPeople] = useState(2);
  const [grills, setGrills] = useState(1);
  const [capacityPerGrill, setCapacityPerGrill] = useState(4);
  const [minutesPerBurger, setMinutesPerBurger] = useState(5);
  const [prepTimePerBurger, setPrepTimePerBurger] = useState(1);

  const [dailyHours, setDailyHours] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [efficiency, setEfficiency] = useState(85);
  const [wagePerHour, setWagePerHour] = useState(18);
  const [gasCostPerGrillHour, setGasCostPerGrillHour] = useState(6);
  const [period, setPeriod] = useState<"diario" | "semanal">("semanal");

  const inputAvailability = 1000;
  const estimatedDemand = 850;

  const totalHours = period === "diario" ? dailyHours : dailyHours * daysPerWeek;
  const totalMinutes = totalHours * 60;
  const effectiveMinutes = totalMinutes * (efficiency / 100);
  const cycleMinutes = minutesPerBurger + prepTimePerBurger;
  const totalCycles = Math.floor(effectiveMinutes / cycleMinutes);
  const burgersProduced = totalCycles * grills * capacityPerGrill;

  const laborCost = people * totalHours * wagePerHour;
  const gasCost = grills * totalHours * gasCostPerGrillHour;
  const totalCost = laborCost + gasCost;

  const chartData = {
    labels: [period === "diario" ? "Producción Diaria" : "Producción Semanal"],
    datasets: [
      {
        label: "Hamburguesas",
        data: [burgersProduced],
        backgroundColor: "rgba(34, 197, 94, 0.7)",
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

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="diario" checked={period === "diario"} onChange={() => setPeriod("diario")} />
          Diario
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="semanal" checked={period === "semanal"} onChange={() => setPeriod("semanal")} />
          Semanal
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Personas</label>
          <input type="number" value={people} onChange={(e) => setPeople(+e.target.value)} className="w-full border rounded p-2" min={1} />
        </div>
        <div>
          <label className="block text-sm">Parrillas</label>
          <input type="number" value={grills} onChange={(e) => setGrills(+e.target.value)} className="w-full border rounded p-2" min={1} />
        </div>
        <div>
          <label className="block text-sm">Capacidad por parrilla</label>
          <input type="number" value={capacityPerGrill} onChange={(e) => setCapacityPerGrill(+e.target.value)} className="w-full border rounded p-2" min={1} />
        </div>
        <div>
          <label className="block text-sm">Minutos por hamburguesa</label>
          <input type="number" value={minutesPerBurger} onChange={(e) => setMinutesPerBurger(+e.target.value)} className="w-full border rounded p-2" min={1} />
        </div>
        <div>
          <label className="block text-sm">Tiempo preparación extra (min)</label>
          <input type="number" value={prepTimePerBurger} onChange={(e) => setPrepTimePerBurger(+e.target.value)} className="w-full border rounded p-2" min={0} />
        </div>
        <div>
          <label className="block text-sm">Horas por día</label>
          <input type="number" value={dailyHours} onChange={(e) => setDailyHours(+e.target.value)} className="w-full border rounded p-2" min={1} />
        </div>
        <div>
          <label className="block text-sm">Días por semana</label>
          <input type="number" value={daysPerWeek} onChange={(e) => setDaysPerWeek(+e.target.value)} className="w-full border rounded p-2" min={1} max={7} />
        </div>
        <div>
          <label className="block text-sm">Eficiencia (%)</label>
          <input type="number" value={efficiency} onChange={(e) => setEfficiency(+e.target.value)} className="w-full border rounded p-2" min={1} max={100} />
        </div>
        <div>
          <label className="block text-sm">Salario por hora (Bs)</label>
          <input type="number" value={wagePerHour} onChange={(e) => setWagePerHour(+e.target.value)} className="w-full border rounded p-2" min={0} />
        </div>
        <div>
          <label className="block text-sm">Costo gas por parrilla/hora (Bs)</label>
          <input type="number" value={gasCostPerGrillHour} onChange={(e) => setGasCostPerGrillHour(+e.target.value)} className="w-full border rounded p-2" min={0} />
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <Bar options={chartOptions} data={chartData} />
        <p className="mt-4 text-center font-semibold text-lg">
          Producción estimada: <span className="text-green-600">{burgersProduced}</span> hamburguesas ({period})
        </p>
      </div>

      <div className="mt-6 bg-gray-100 rounded p-4 text-sm text-gray-800">
        <p><strong>Costos estimados:</strong></p>
        <ul className="mt-2 list-disc list-inside">
          <li>🧑‍💼 Mano de obra: Bs {laborCost.toFixed(2)}</li>
          <li>🔥 Costo gas: Bs {gasCost.toFixed(2)}</li>
          <li>💸 Total {period === "diario" ? "diario" : "semanal"}: Bs {totalCost.toFixed(2)}</li>
        </ul>
        <p className="mt-2">📦 Insumos disponibles: {inputAvailability}</p>
        <p className="mt-1">📈 Demanda estimada: {estimatedDemand}</p>
      </div>
    </div>
  );
}