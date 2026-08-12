import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NuevoProductoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    precio: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nombre') {
      if (value.length > 40) {
        e.target.setCustomValidity('El nombre del producto no puede superar los 40 caracteres.');
      } else {
        e.target.setCustomValidity('');
      }
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.nombre || formData.cantidad === '' || formData.precio === '') {
      setStatusMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios.' });
      return;
    }

    if (formData.nombre.length > 40) {
      setStatusMessage({ type: 'error', text: 'El nombre del producto no puede superar los 40 caracteres.' });
      return;
    }

    const precioNum = parseFloat(formData.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setStatusMessage({ type: 'error', text: 'el valor debe ser superior a 0' });
      return;
    }

    try {
      setLoading(true);

      // BUG 2 INTENCIONAL: Se envía formData.nombre DIRECTAMENTE sin hacer .trim()
      const payload = {
        nombre: formData.nombre, // Sin trim()
        cantidad: parseInt(formData.cantidad, 10),
        precio: parseFloat(formData.precio)
      };

      const res = await fetch('http://localhost:5000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el producto.');
      }

      setStatusMessage({
        type: 'success',
        text: `¡Producto guardado correctamente! Redirigiendo a productos... (ID: ${data.producto.id})`
      });

      setTimeout(() => {
        navigate('/', { state: { notification: `¡Producto "${data.producto.nombre}" guardado exitosamente!` } });
      }, 1200);

    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-700" />
          Alta de Nuevo Producto
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ingresa los datos requeridos para dar de alta el artículo en el inventario.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-3.5 rounded-md text-xs font-medium flex items-center gap-2.5 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Corporate Form Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Nombre Field */}
          <div>
            <label htmlFor="nombre" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Teclado Mecánico RGB"
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            />
          </div>

          {/* Grid: Cantidad & Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div>
              <label htmlFor="cantidad" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Stock Inicial (Cantidad) *
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                min="0"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="Ej: 10"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label htmlFor="precio" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Precio Unitario ($) *
              </label>
              <input
                type="number"
                step="0.01"
                id="precio"
                name="precio"
                min="0.01"
                value={formData.precio}
                onChange={handleChange}
                onInvalid={(e) => e.target.setCustomValidity('el valor debe ser superior a 0')}
                onInput={(e) => {
                  e.target.setCustomValidity('');
                  handleChange(e);
                }}
                placeholder="Ej: 150.99"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-guardar-producto"
              disabled={loading}
              className={`px-5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
