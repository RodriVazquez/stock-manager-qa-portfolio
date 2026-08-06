# 📦 Stock Manager - QA Trainee / Junior Portfolio Project

[![QA Testing](https://img.shields.io/badge/QA-Black--Box%20%26%20Grey--Box-blue.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Express%20%7C%20MySQL-emerald.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](#)

Aplicación web full-stack de **Gestión de Inventario (Stock Manager)** diseñada como **Portfolio QA Trainee / Junior**. Su objetivo es demostrar habilidades prácticas en **Testing Funcional de Interfaz de Usuario (Black-Box)**, **Testing de API REST** y **Validación de Base de Datos relacional MySQL (Grey-Box/SQL)**.

---

## 🎯 Objetivo del Proyecto

Este proyecto simula un entorno real de gestión de inventario para una empresa, en el cual se han **sembrado 3 fallas o bugs intencionales ("Bugs por Diseño")**. 

Permite a reclutadores, QA Leads y evaluadores técnicos:
1. **Ejecutar casos de prueba de UI y API** sobre un sistema real.
2. **Validar la persistencia e integridad de datos** realizando consultas directas en MySQL / phpMyAdmin.
3. **Reportar incidentes** estructurados estilo Jira / Azure DevOps basados en evidencias reales del sistema.

---

## 🛠️ Arquitectura y Tecnologías

- **Front-End:** React 18, Vite, React Router DOM v6, Tailwind CSS (estilo corporativo de sistema ERP), Lucide Icons.
- **Back-End API:** Node.js, Express, conector `mysql2/promise`, CORS, dotenv.
- **Base de Datos:** MySQL (ejecutado localmente vía MAMP, XAMPP o MySQL Workbench).

---

## 📖 Guía del Usuario: ¿Cómo navegar y utilizar la aplicación?

### 1. Página Principal: Catálogo de Productos (`/`)
- **Visualización de Inventario:** Muestra la lista de productos con su ID, nombre, stock actual y precio unitario.
- **Indicadores clave (KPIs):** Resumen de total de productos, unidades totales en almacén y alertas de stock crítico/negativo.
- **Ajuste de Stock (Entradas / Salidas):**
  - Haz clic en el botón **`[+ Entrada]`** para abrir el modal, ingresar una cantidad y sumar stock.
  - Haz clic en el botón **`[- Salida]`** para descontar stock. *(Tip QA: Observa lo que ocurre cuando descuentas más unidades de las disponibles)*.

### 2. Página: Registrar Nuevo Producto (`/nuevo-producto`)
- Formulario para dar de alta nuevos artículos en el catálogo.
- Requiere ingresar: **Nombre del Producto**, **Stock Inicial** y **Precio Unitario ($)**.
- *(Tip QA: Prueba ingresar nombres con espacios sobrantes antes/después o precios con decimales)*.

### 3. Página: Historial de Movimientos (`/historial`)
- Muestra una tabla con el registro completo de auditoría de todas las entradas y salidas.
- Permite filtrar por tipo de movimiento (`ENTRADA` / `SALIDA`) o buscar por nombre del producto o ID.

---

## 🐞 Bugs Intencionales Sembrados ("Bugs por Diseño")

| # | Tipo de Prueba | Componente | Descripción del Bug Intencional | Resultado Esperado vs. Obtenido |
|---|---|---|---|---|
| **Bug 1** | Lógica de Negocio (Backend API) | `PUT /api/productos/:id/stock` | Al realizar un movimiento de `SALIDA`, la API **no valida si la cantidad a descontar supera el stock disponible**, permitiendo que el stock quede en números negativos (ej. `-5`). | **Esperado:** La API debe rechazar la transacción con error `400 Bad Request`.<br>**Obtenido:** La transacción se procesa y el stock queda en negativo. |
| **Bug 2** | UI / Validación Formulario | `POST /api/productos` | El formulario de alta de producto **no ejecuta `.trim()` sobre el campo Nombre**, enviando y guardando texto con espacios sobrantes (ej. `"   Teclado RGB   "`). | **Esperado:** El frontend o backend debe limpiar espacios sobrantes.<br>**Obtenido:** El nombre se guarda tal cual con espacios. |
| **Bug 3** | Persistencia / Decimales | `POST /api/productos` | Al crear un nuevo producto con precio decimal (ej. `$150.99`), el backend **trunca la parte decimal mediante `Math.floor()`**, guardándolo como `$150.00` en MySQL. | **Esperado:** Guardar la precisión decimal ingresada (`$150.99`).<br>**Obtenido:** Se truncan los centavos a `.00`. |

---

## 🔍 Consultas SQL para Pruebas Grey-Box (MySQL / phpMyAdmin)

Para validar la integridad de la base de datos durante las sesiones de prueba, ejecuta estas consultas en phpMyAdmin o MySQL Workbench:

```sql
-- 1. Detectar productos con stock en negativo (Comprobar Bug 1)
SELECT id, nombre, cantidad FROM productos WHERE cantidad < 0;

-- 2. Detectar nombres de productos con espacios sobrantes (Comprobar Bug 2)
SELECT id, nombre, LENGTH(nombre) AS longitud_caracteres 
FROM productos 
WHERE nombre LIKE ' %' OR nombre LIKE '% ';

-- 3. Verificar productos con precios truncados a .00 (Comprobar Bug 3)
SELECT id, nombre, precio FROM productos;

-- 4. Consultar el historial completo de movimientos con JOIN de producto
SELECT m.id AS movimiento_id, p.nombre AS producto, m.tipo, m.cantidad, m.fecha 
FROM movimientos m 
JOIN productos p ON m.producto_id = p.id 
ORDER BY m.fecha DESC;
```

---

## 🚀 Guía de Instalación Local Paso a Paso

### 1. Base de Datos (MySQL / MAMP)
1. Inicia los servicios de MySQL en tu MAMP / XAMPP.
2. Abre phpMyAdmin (`http://localhost/phpMyAdmin` o `http://localhost:8889/phpMyAdmin`).
3. Ve a la pestaña **Importar** y selecciona el archivo [`database.sql`](database.sql) incluido en la raíz de este repositorio.
4. Ejecuta el script. Se creará la base de datos `stock_manager` con sus tablas y datos semilla de prueba.

### 2. Iniciar el Back-End API (`/backend`)
```bash
cd backend
npm install
npm run dev
```
*Servidor escuchando en: `http://localhost:5000` (Conectado a MySQL en 127.0.0.1:3306).*

### 3. Iniciar el Front-End React (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
*Aplicación abierta en: `http://localhost:3000`.*

---

## 📁 Estructura del Proyecto

```text
stock-manager/
├── database.sql           # Script SQL para importar tablas y datos de prueba
├── README.md              # Documentación y guía de pruebas QA
├── .gitignore             # Archivos excluidos de Git
├── backend/
│   ├── .env               # Configuración local de BD (Host, User, Password, Port)
│   ├── .env.example       # Plantilla de variables de entorno
│   ├── package.json       # Dependencias backend (Express, mysql2, cors)
│   └── server.js          # API REST Express con lógica y bugs por diseño
└── frontend/
    ├── index.html         # HTML5 principal con metadatos SEO
    ├── package.json       # Dependencias frontend (React, Vite, Tailwind)
    ├── tailwind.config.js # Configuración de tema corporativo ERP
    └── src/
        ├── App.jsx        # Enrutamiento React Router DOM
        ├── components/
        │   ├── Navbar.jsx     # Navegación del sistema
        │   └── StockModal.jsx # Modal para movimientos de entrada/salida
        └── pages/
            ├── ProductosPage.jsx     # Página 1: Catálogo e inventario
            ├── NuevoProductoPage.jsx # Página 2: Formulario de alta
            └── MovimientosPage.jsx   # Página 3: Historial de movimientos
```
