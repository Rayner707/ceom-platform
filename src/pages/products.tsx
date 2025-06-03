import EditProductModal from "@/components/forms/EditProductModal";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import Layout from "@/components/common/Layout";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  createdAt?: Timestamp;
}

export default function ProductsPage() {
  const {
    user,
    role,
    loading,
    activeBusiness,
  } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Obtener productos del negocio activo
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
    setError("");

    if (!activeBusiness) {
      setError("Debes seleccionar un negocio.");
      return;
    }

    try {
      const newProduct = {
        name,
        price: parseFloat(price),
        cost: parseFloat(cost),
        businessId: activeBusiness.id,
        ownerId: user?.uid,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "products"), newProduct);

      setName("");
      setPrice("");
      setCost("");

      const snapshot = await getDocs(
        query(collection(db, "products"), where("businessId", "==", activeBusiness.id))
      );
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setProducts(list);
    } catch (err: any) {
      console.error(err);
      setError("Error al crear producto.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const handleSaveEdit = async (updated: { name: string; price: number; cost: number }) => {
    if (!editProduct) return;
    try {
      const docRef = doc(db, "products", editProduct.id);
      await updateDoc(docRef, {
        name: updated.name,
        price: updated.price,
        cost: updated.cost,
      });

      const updatedList = products.map(p =>
        p.id === editProduct.id ? { ...p, ...updated } : p
      );
      setProducts(updatedList);
      setEditProduct(null);
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  if (loading) return null;

  return (
    <>
      {editProduct && (
        <EditProductModal
          isOpen={!!editProduct}
          initialName={editProduct.name}
          initialPrice={editProduct.price}
          initialCost={editProduct.cost}
          onClose={() => setEditProduct(null)}
          onSave={handleSaveEdit}
        />
      )}
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>

          {!activeBusiness ? (
            <p className="text-gray-400">Selecciona un negocio desde el Dashboard.</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3 bg-white text-black p-4 rounded shadow">
                <h2 className="text-lg font-semibold">Crear producto</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio de venta"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) setPrice(value);
                  }}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Costo variable"
                  value={cost}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) setCost(value);
                  }}
                  className="w-full border p-2 rounded"
                  required
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                  Crear producto
                </button>

                <Link
                  href="/pricing"
                  className="text-sm text-blue-600 hover:underline block mt-2"
                >
                  ¿No sabes qué precio poner? Calcula tu precio aquí →
                </Link>
              </form>

              {products.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Productos registrados</h2>
                  <ul className="space-y-2">
                    {products.map((prod) => (
                      <li key={prod.id} className="border p-3 rounded bg-gray-900 space-y-1">
                        <h3 className="font-bold">{prod.name}</h3>
                        <p className="text-sm text-gray-300">
                          💲 Precio: {prod.price} | 🧾 Costo: {prod.cost}
                        </p>
                        {prod.createdAt?.toDate && (
                          <p className="text-xs text-gray-500">
                            Creado el: {prod.createdAt.toDate().toLocaleDateString()}
                          </p>
                        )}
                        {role === "emprendedor" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEdit(prod)}
                              className="px-2 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
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
            </>
          )}
        </div>
      </Layout>
    </>
  );
}