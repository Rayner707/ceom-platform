import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold">CEOM</h1>
        <p>Cargando...</p>
      </div>
    </main>
  );
}