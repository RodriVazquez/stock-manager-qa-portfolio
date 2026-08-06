import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductosPage from './pages/ProductosPage';
import NuevoProductoPage from './pages/NuevoProductoPage';
import MovimientosPage from './pages/MovimientosPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-sans">
        {/* Navbar Header */}
        <Navbar />

        {/* Main Workspace Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<ProductosPage />} />
            <Route path="/nuevo-producto" element={<NuevoProductoPage />} />
            <Route path="/historial" element={<MovimientosPage />} />
          </Routes>
        </main>

        {/* System Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
            <p>Stock Manager - Sistema de Control de Inventario</p>
            <p>QA Portfolio: Black-Box (UI) & Grey-Box (MySQL DB)</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
