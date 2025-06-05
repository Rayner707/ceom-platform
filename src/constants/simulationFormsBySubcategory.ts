import type { FC } from "react";
import HamburguesasSimulatorForm from "@/components/simulation/forms/HamburguesasSimulatorForm";
// En el futuro puedes importar aquí más formularios:
// import PizzasSimulatorForm from "@/components/simulation/forms/PizzasSimulatorForm";

const simulationFormsBySubcategory: Record<string, FC | undefined> = {
  hamburguesas: HamburguesasSimulatorForm,
  // pizzas: PizzasSimulatorForm,
};

export default simulationFormsBySubcategory;