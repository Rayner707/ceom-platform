interface Section {
  name: string;
  path: string;
}

type CategorySections = {
  [category: string]: Section[];
};

export const sectionsByCategory: CategorySections = {
  alimentos: [
    { name: "Producción", path: "/production" },
    { name: "Historial de Producción", path: "/production-history" },
    { name: "Productos", path: "/products" },
    { name: "Costos Fijos", path: "/fixed-costs" },
    { name: "Punto de Equilibrio", path: "/break-even" },
    { name: "Simulaciones", path: "/simulation" },
    { name: "Resumen", path: "/summary" },
  ],
  servicios: [
    { name: "Servicios", path: "/products" },
    { name: "Costos Fijos", path: "/fixed-costs" },
    { name: "Simulaciones", path: "/simulation" },
    { name: "Resumen", path: "/summary" },
  ],
  retail: [
    { name: "Inventario", path: "/products" },
    { name: "Simulaciones", path: "/simulation" },
    { name: "Costos Fijos", path: "/fixed-costs" },
    { name: "Resumen", path: "/summary" },
  ],
  // Puedes seguir agregando categorías y herramientas personalizadas aquí
};