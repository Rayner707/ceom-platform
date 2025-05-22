

import React, { useState } from "react";

interface EditProductModalProps {
  isOpen: boolean;
  initialName: string;
  initialPrice: number;
  initialCost: number;
  onClose: () => void;
  onSave: (updated: { name: string; price: number; cost: number }) => void;
}

export default function EditProductModal({
  isOpen,
  initialName,
  initialPrice,
  initialCost,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice.toString());
  const [cost, setCost] = useState(initialCost.toString());
  const [error, setError] = useState("");

  const handleSave = () => {
    const priceNum = parseFloat(price);
    const costNum = parseFloat(cost);

    if (!name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    if (isNaN(priceNum) || isNaN(costNum)) {
      setError("Precio o costo inválido.");
      return;
    }

    onSave({ name: name.trim(), price: priceNum, cost: costNum });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Producto</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) setPrice(val);
          }}
          className="w-full border rounded p-2 mb-3"
        />

        <input
          type="number"
          placeholder="Costo"
          value={cost}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) setCost(val);
          }}
          className="w-full border rounded p-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}