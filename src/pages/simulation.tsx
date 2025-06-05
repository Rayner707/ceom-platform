import Layout from "@/components/common/Layout";
import { useUser } from "@/context/UserContext";
import simulationFormsBySubcategory from "@/constants/simulationFormsBySubcategory";

export default function SimulationPage() {
  const { activeBusiness, loading } = useUser();

  const FormComponent = activeBusiness
    ? simulationFormsBySubcategory[(activeBusiness.subcategory || "").toLowerCase().trim()]
    : null;

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Simulador Operativo</h1>

        {FormComponent ? (
          <FormComponent />
        ) : (
          <p className="text-gray-600 text-sm">
            No hay un simulador disponible para esta subcategoría.
          </p>
        )}
      </div>
    </Layout>
  );
}