import { useState } from "react";

interface CostItem {
  name: string;
  value: string;
}

interface DynamicCostListProps {
  label: string; // Ej: "Ingrediente", "Material"
  items: CostItem[];
  setItems: (items: CostItem[]) => void;
}

export default function DynamicCostList({ label, items, setItems }: DynamicCostListProps) {
  const handleChange = (index: number, field: keyof CostItem, value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", value: "" }]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium">
              Nombre del {label.toLowerCase()}
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleChange(idx, "name", e.target.value)}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium">
              Costo (Bs)
              <input
                type="number"
                value={item.value}
                onChange={(e) => handleChange(idx, "value", e.target.value)}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </label>
          </div>
          <button
            onClick={() => removeItem(idx)}
            className="text-red-600 hover:underline text-sm"
          >
            Eliminar
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        type="button"
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
      >
        + Agregar {label}
      </button>
    </div>
  );
}