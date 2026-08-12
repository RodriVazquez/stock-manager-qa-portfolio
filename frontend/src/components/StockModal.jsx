import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

export default function StockModal({ isOpen, onClose, producto, tipo, onConfirm }) {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !producto) return null;

  const isEntrada = tipo === 'ENTRADA';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cantNum = parseInt(cantidad, 10);
    if (isNaN(cantNum) || cantNum <= 0) {
      setError('La cantidad debe ser un número entero mayor a 0');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(producto.id, tipo, cantNum);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al procesar el movimiento de stock.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-md ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isEntrada ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ajustar Stock: <span className={isEntrada ? 'text-emerald-700' : 'text-rose-700'}>{tipo}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">{producto.nombre}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="modal-close-btn"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Stock Info */}
        <div className="my-4 p-3 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center text-xs font-medium">
          <span className="text-slate-600">Stock Actual registrado:</span>
          <span className={`font-mono font-bold text-sm ${producto.cantidad < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {producto.cantidad} unidades
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-cantidad-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Cantidad a {isEntrada ? 'ingresar' : 'descontar'}
            </label>
            <input
              id="modal-cantidad-input"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              placeholder="Ej: 5"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 ${
                isEntrada
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Procesando...' : `Confirmar ${tipo}`}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}
