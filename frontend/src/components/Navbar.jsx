import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, PlusCircle, History, Boxes } from 'lucide-react';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-sm">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Stock Manager
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Sistema de Inventario
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5">
            <NavLink to="/" id="nav-productos" className={linkClass} end>
              <Package className="w-4 h-4" />
              <span>Catálogo de Productos</span>
            </NavLink>

            <NavLink to="/nuevo-producto" id="nav-nuevo-producto" className={linkClass}>
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </NavLink>

            <NavLink to="/historial" id="nav-historial" className={linkClass}>
              <History className="w-4 h-4" />
              <span>Historial de Movimientos</span>
            </NavLink>
          </nav>

        </div>
      </div>
    </header>
  );
}
