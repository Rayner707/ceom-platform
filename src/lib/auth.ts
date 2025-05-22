import { signOut, getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebase";
import { initializeApp, getApps, getApp } from "firebase/app";
import { NextRouter } from "next/router";

// App principal
export const auth = getAuth();

// App secundaria para crear usuarios sin afectar sesión actual
let secondaryApp;
const apps = getApps();
if (apps.some(app => app.name === "Secondary")) {
  secondaryApp = getApp("Secondary");
} else {
  secondaryApp = initializeApp(firebaseConfig, "Secondary");
}
export const secondaryAuth = getAuth(secondaryApp);

// Logout normal
export async function logoutUser(router: NextRouter) {
  try {
    await signOut(auth);
    router.push("/auth/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}