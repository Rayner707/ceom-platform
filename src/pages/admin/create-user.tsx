import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { secondaryAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function CreateUserPage() {
  const { role } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (role !== "admin") {
    return <p className="p-4 text-red-500">Acceso denegado.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role: "emprendedor",
        createdAt: new Date(),
      });

      setEmail("");
      setPassword("");
      setName("");
      alert("Usuario creado correctamente.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white text-black p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Registrar nuevo usuario</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear usuario"}
          </button>
        </form>
      </div>
    </Layout>
  );
}