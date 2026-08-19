# 📦 Stock-Manager App — Sistema de Gestión de Inventario (QA Target Environment)

[![Stack](https://img.shields.io/badge/Stack-Fullstack_JS-blue.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB.svg)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8.svg)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%7C_Express-339933.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1.svg)](https://www.mysql.com/)
[![QA Target](https://img.shields.io/badge/QA-Manual_%26_Database_Testing-FF4081.svg)](https://github.com/RodriVazquez/QA-Manual-Backend-Testing-Portfolio)

Aplicación web de **Gestión de Inventario (Stock-Manager App)** *full-stack* desarrollada intencionalmente como **Sistema Bajo Prueba (SUT - System Under Test)** para la práctica, validación y documentación de estrategias de **Quality Assurance (QA)**, Pruebas Manuales en interfaz web y Validación de Base de Datos (phpMyAdmin / MySQL).

Este proyecto forma parte de mi **[Portfolio de QA Manual y Backend Testing](https://github.com/RodriVazquez/QA-Manual-Backend-Testing-Portfolio)**.

---

## 🎯 Propósito del Proyecto (QA Context)

A diferencia de una aplicación de gestión comercial convencional, este sistema fue concebido y desarrollado para simular un entorno real de desarrollo donde conviven funcionalidades operativas junto con **comportamientos defectuosos intencionales (Bugs Forzados)**. 

Permite realizar el ciclo completo de QA:
1. **Diseño y Ejecución de Casos de Prueba Manuales** a través de la interfaz web (`TC-001` a `TC-025`) evaluando funcionalidades de Alta de Productos, Ajustes de Stock (Entradas / Salidas), Historial de Movimientos e Indicadores de Almacén.
2. **Detección y Reporte de Defectos** (Bug Reports en Jira con pasos para reproducir, resultado esperado vs. obtenido y severidad).
3. **Validación de Base de Datos en phpMyAdmin** (Consultas SQL directas a tablas `productos` y `movimientos` para verificar la consistencia de datos, integridad referencial y actualización de stock tras registrar entradas y salidas).

---

## 🐛 Desafíos de QA & Bugs Intencionales (Forced Bugs)

El sistema incluye **4 fallos intencionales clave** diseñados para ser detectados durante el proceso de pruebas:

> [!WARNING]
> **Bug #1: Falta de sanitización (trim) en campo 'Nombre' al dar de alta un producto**
> - **Ubicación:** Formulario de Alta (`/nuevo-producto`).
> - **Caso de Prueba asociado:** `TC-006` (Desde la interfaz web).
> - **Comportamiento defectuoso:** El sistema no aplica recorte automático de espacios en blanco al inicio o final del nombre (ej: `' Ryzen 5 3600 '`), permitiendo registrar el producto con espacios vacíos que generan inconsistencias visuales y registros duplicados en la base de datos.

> [!WARNING]
> **Bug #2: Inexistencia de validación ante caracteres especiales en el campo 'Nombre'**
> - **Ubicación:** Formulario de Alta (`/nuevo-producto`).
> - **Caso de Prueba asociado:** `TC-007` (Desde la interfaz web).
> - **Comportamiento defectuoso:** El sistema permite guardar nombres de producto que contienen símbolos especiales y caracteres no permitidos (ej: `#MouseGamer$!!`), sin aplicar una validación por expresión regular alfanumérica ni mostrar un mensaje de restricción.

> [!WARNING]
> **Bug #3: Salida de stock superior a la cantidad disponible generando valores de stock negativo**
> - **Ubicación:** Modal de Ajuste de Stock (SALIDA) / Base de Datos MySQL.
> - **Casos de Prueba asociados:** `TC-011` (Desde la interfaz web) / `TC-025` (Desde phpMyAdmin / Base de Datos).
> - **Comportamiento defectuoso:** Al registrar una salida de inventario que supera las unidades disponibles (ej: retirar 7 unidades de un producto con stock de 5), el sistema no bloquea la operación y actualiza la cantidad a valores negativos (ej: `-2 u.`), comprometiendo la salud financiera e integridad del almacén.

> [!WARNING]
> **Bug #4: Truncamiento de decimales en el campo 'Precio' al registrar productos con centavos**
> - **Ubicación:** Formulario de Alta / Vista de Catálogo.
> - **Caso de Prueba asociado:** `TC-021` (Desde la interfaz web).
> - **Comportamiento defectuoso:** Al ingresar un precio con valores decimales/centavos explícitos (ej: `$350000.98`), el sistema elimina la fracción decimal y muestra `$350000.00` en el catálogo, generando pérdida de precisión en los datos de facturación e inventario.

---

## 🛠️ Tecnologías Utilizadas

### **Front-End**
- **React 18** & **Vite**: Interfaz dinámica y de rápida renderización.
- **React Router DOM**: Gestión de rutas del cliente (`/`, `/nuevo-producto`, `/historial`).
- **Tailwind CSS**: Diseño moderno responsive con tarjetas de indicadores y modales interactivos.
- **State Management**: Manejo de estado para catálogo, ajustes de stock y modales.

### **Back-End API**
- **Node.js** & **Express**: Servidor RESTful para la gestión de catálogo y auditoría de movimientos.
- **`mysql2/promise`**: Pool de conexiones asíncronas con soporte de transacciones e integridad referencial.
- **CORS & Dotenv**: Seguridad y configuración por variables de entorno.

### **Base de Datos**
- **MySQL / phpMyAdmin** (compatible con MAMP, XAMPP o MySQL Server Local).

---

## 📁 Estructura del Proyecto

```
stock-manager/
├── database.sql               # Script SQL con estructura relacional y datos de prueba
├── README.md                  # Documentación del proyecto (QA Target Environment)
├── backend/                   # API RESTful (Node.js + Express)
│   ├── .env                   # Variables de entorno (Puerto, BD, Credenciales)
│   ├── .env.example
│   ├── db.js                  # Conexión al pool de MySQL
│   ├── package.json
│   └── server.js              # Servidor Express, lógica de negocio y endpoints
└── frontend/                  # Cliente (React 18 + Vite + Tailwind CSS)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Enrutador principal del cliente
        ├── index.css          # Estilos globales con Tailwind CSS
        ├── components/        # Modales de Entrada/Salida de stock e indicadores
        └── pages/
            ├── Inventory.jsx  # Vista principal con catálogo de productos y acciones
            ├── NewProduct.jsx # Formulario de alta de nuevo producto (Contiene Bug #1, Bug #2 y Bug #4)
            └── History.jsx    # Historial y auditoría de movimientos
```

---

## 🚀 Guía de Instalación y Ejecución Local

### **Requisitos Previos**
- **Node.js** (v18 o superior)
- **Servidor MySQL** (activo a través de MAMP, XAMPP o servicio local de MySQL en el puerto `3306`)

---

### **Paso 1: Configurar la Base de Datos MySQL**

> [!TIP]
> **Inicialización:** Asegúrate de tener activo tu servidor MySQL. Puedes crear la base de datos `stock_manager` e importar el script `database.sql` incluido en la raíz de este proyecto.

*(Importación manual):*
1. Abre phpMyAdmin (`http://localhost/phpMyAdmin5/`).
2. Crea la base de datos `stock_manager`.
3. Importa el archivo `database.sql`.

---

### **Paso 2: Ejecutar el Back-End (API Server)**

En una terminal, ubícate en la carpeta `backend`:

```bash
cd backend
npm install
npm run dev
```

El servidor REST iniciará en: `http://localhost:5000`

---

### **Paso 3: Ejecutar el Front-End (React App)**

En una segunda terminal, ubícate en la carpeta `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Abre tu navegador en la URL indicada por Vite (habitualmente `http://localhost:3000` o `http://localhost:5173`).

---

## 📡 Endpoints de la API REST (Backend)

| Método | Endpoint | Descripción | Cobertura QA / Casos de Prueba (TC) |
|---|---|---|---|
| `GET` | `/api/health` | Verificación de estado del servidor API | Verificación de disponibilidad del servicio |
| `GET` | `/api/productos` | Obtención del catálogo de productos y stock | `TC-008` (Límite 40 chars), `TC-015` (Stock almacén), `TC-017` (Formato moneda), `TC-020` (Búsqueda palabra clave), `TC-021` (Precisión decimal - Bug #4) |
| `POST` | `/api/productos` | Alta de nuevo producto en inventario | `TC-001` (Éxito), `TC-002` (Nombre vacío), `TC-003` (Precio $0), `TC-004` (Precio negativo), `TC-005` (Stock negativo), `TC-006` (Espacios - Bug #1), `TC-007` (Chars especiales - Bug #2), `TC-022` (Persistencia SQL) |
| `POST` | `/api/movimientos` | Registro de ajuste de stock (Entrada / Salida) | `TC-009` (Entrada exitosa), `TC-010` (Salida exitosa), `TC-011` (Salida > disponible - Bug #3), `TC-012` (Entrada 0), `TC-013` (Salida 0), `TC-014` (Cancelar modal), `TC-016` (Campo vacío), `TC-023` (Persistencia referencial), `TC-024` (Actualización stock SQL), `TC-025` (Auditoría stock negativo) |
| `GET` | `/api/movimientos` | Consulta de historial de movimientos de stock | `TC-018` (Filtrado por tipo Entrada/Salida), `TC-019` (Estado vacío sin movimientos) |

---

## 🔗 Portafolio de QA & Documentación Relacionada

Puedes revisar la documentación completa de testing (Planes de Prueba, Casos de Prueba en Excel/Jira y Reportes de Defectos) en mi repositorio principal:

👉 **[Repository: QA Manual & Backend Testing Portfolio](https://github.com/RodriVazquez/QA-Manual-Backend-Testing-Portfolio)**

---

## ✒️ Licencia y Autor

Desarrollado por **Rodrigo Vazquez** — QA Manual & Backend Testing.
Proyecto de código abierto desarrollado con fines educativos y de demostración técnica en Quality Assurance.
