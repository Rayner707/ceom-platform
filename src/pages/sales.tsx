import dynamic from "next/dynamic";
import Layout from "@/components/common/Layout";

// Carga el componente dinámicamente y explícitamente como cliente
const SalesRegistration = dynamic(() => import("@/components/forms/SalesRegistration"), {
  ssr: false,
});

export default function SalesPage() {
  return (
    <Layout>
      <SalesRegistration />
    </Layout>
  );
}