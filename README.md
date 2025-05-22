# 🧠 CEOM Panel – Plataforma de Gestión y Simulación Financiera

Panel administrativo desarrollado para la plataforma **CEOM**, orientado a la gestión de productos, producción, costos y simulaciones operativas de emprendimientos. Soporta múltiples usuarios, con roles diferenciados para **emprendedores** y **administradores**.

## 🚀 Características principales

- 🔐 Autenticación con Firebase (registro e inicio de sesión)
- 🏢 Gestión de negocios y productos por usuario
- 📦 Registro de producción semanal por tipo de producto
- 💸 Gestión de costos fijos clasificados por categoría
- 📈 Visualización de métricas financieras clave por semana:
  - Ingresos
  - Costos variables
  - Costos fijos
  - Utilidad bruta y neta
- ⚖️ Cálculo del punto de equilibrio por producto
- 📊 Gráficas interactivas (ventas, utilidad, etc.)
- 🧪 Módulo de simulación de operación:
  - Variación de personal, hornos, eficiencia y horas
  - Costo y tiempo estimado
- 📤 Exportación de datos en PDF y CSV
- 🧭 Responsive y adaptado a escritorio y móvil
- 👤 Panel de administración (solo visualización, sin edición)

---

## 🛠️ Tecnologías usadas

- [Next.js](https://nextjs.org/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Chart.js](https://www.chartjs.org/) para gráficas
- [jsPDF](https://github.com/parallax/jsPDF) + [autoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) para exportar a PDF

---

## 📦 Instalación local

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/ceom-panel.git
cd ceom-panel
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura Firebase:

Crea un archivo `.env.local` con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

Accede a [http://localhost:3000](http://localhost:3000)

⸻

☁️ Despliegue en Vercel
	1.	Haz push del proyecto a GitHub.
	2.	Entra a https://vercel.com y crea un nuevo proyecto desde el repositorio.
	3.	Agrega tus variables de entorno desde Project Settings > Environment Variables.
	4.	Dale deploy 🚀

⸻

📂 Estructura del proyecto

src/
├── components/        → Componentes UI reutilizables
├── context/           → Contexto de usuario y auth
├── lib/               → Configuración Firebase
├── pages/             → Vistas principales (Next.js routing)
├── styles/            → Estilos globales


⸻

👤 Roles disponibles

Rol	Funcionalidad
emprendedor	CRUD completo de productos, costos y producción
admin	Visualización de todos los módulos y negocios, sin capacidad de edición


⸻

✨ Créditos

Desarrollado con ❤️ por el equipo de TechSolutions Studio

⸻

📄 Licencia

MIT

---
