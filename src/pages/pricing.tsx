import { useState } from "react";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DynamicCostList from "@/components/forms/DynamicCostList";

interface CostItem {
  name: string;
  value: string;
}

export default function PricingPage() {
  const { activeBusiness, role, loading, user } = useUser();
  const [costItems, setCostItems] = useState<CostItem[]>([{ name: "", value: "" }]);
  const [laborPercentage, setLaborPercentage] = useState("30");
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [productName, setProductName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [productQuantity, setProductQuantity] = useState<string>("");

  if (loading) return null;

  if (!activeBusiness) {
    return (
      <Layout>
        <div className="p-4 text-yellow-500">Selecciona un negocio para continuar.</div>
      </Layout>
    );
  }

  const category = activeBusiness.category;

  const labelByCategory: Record<string, string> = {
    alimentos: "Ingrediente",
    servicios: "Material o Insumo",
    retail: "Insumo o Empaque",
  };

  const defaultLaborByCategory: Record<string, number> = {
    alimentos: 30,
    servicios: 50,
    retail: 20,
  };

  const handleCalculate = () => {
    const total = costItems.reduce((sum, item) => {
      const val = parseFloat(item.value);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const labor = parseFloat(laborPercentage || defaultLaborByCategory[category]?.toString() || "30");

    let unit = total;
    let unitPrice = total + (total * (labor / 100));

    if (category === "alimentos") {
      const qty = parseInt(productQuantity);
      if (!isNaN(qty) && qty > 0) {
        unit = total / qty;
        unitPrice = unit + (unit * (labor / 100));
      }
    }

    setTotalCost(total);
    setUnitCost(unit);
    setSuggestedPrice(unitPrice);
    setSaveSuccess(false);
  };

  const saveAsProduct = async () => {
    if (!productName || !user || !activeBusiness || suggestedPrice === null) return;
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: suggestedPrice,
        cost: unitCost,
        businessId: activeBusiness.id,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      setSaveSuccess(true);
      setProductName("");
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Cálculo de Precio de Venta</h1>

        <form className="bg-white text-black p-4 rounded shadow space-y-4" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-lg font-semibold">
            {category === "servicios" ? "Costos del Servicio" : "Costos del Producto"}
          </h2>

          <DynamicCostList
            label={labelByCategory[category] || "Ítem"}
            items={costItems}
            setItems={setCostItems}
          />

          {category === "alimentos" && (
            <label className="block text-sm font-medium">
              Cantidad de productos resultantes (ej. número de Hamburguesas)
              <input
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                className="block w-full border p-2 mt-1 rounded"
              />
            </label>
          )}

          <label className="block text-sm font-medium">
            % de Mano de Obra
            <input
              type="number"
              value={laborPercentage}
              onChange={(e) => setLaborPercentage(e.target.value)}
              className="block w-full border p-2 mt-1 rounded"
            />
          </label>

          <button
            onClick={handleCalculate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Calcular Precio Sugerido
          </button>

          {suggestedPrice !== null && (
            <div className="space-y-4 pt-4">
              <p className="text-lg font-semibold text-green-600 text-center">
                Precio de venta sugerido: Bs. {suggestedPrice.toFixed(2)}
              </p>

              <label className="block text-sm font-medium">
                Nombre del producto o servicio
                <input
                  type="text"
                  placeholder="Ej. Hamburguesa Clásica"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="block w-full border p-2 mt-1 rounded"
                />
              </label>

              <button
                onClick={saveAsProduct}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Guardar como producto
              </button>

              {saveSuccess && (
                <p className="text-sm text-green-700 text-center">
                  ✅ Producto guardado correctamente.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}