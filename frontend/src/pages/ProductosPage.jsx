import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, Plus, Minus, RefreshCw, AlertTriangle, Search, Layers, CheckCircle2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import StockModal from '../components/StockModal';

export default function ProductosPage() {
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState('ENTRADA');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/productos');
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar los productos.`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      setError(err.message || 'Error de conexión con el backend (asegúrate de que el servidor en puerto 5000 esté corriendo).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Check for navigation notification (e.g. from NuevoProductoPage)
  useEffect(() => {
    if (location.state?.notification) {
      setNotification({
        type: 'creado',
        title: 'Producto Creado',
        message: location.state.notification
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleOpenModal = (producto, tipo) => {
    setSelectedProduct(producto);
    setModalType(tipo);
    setIsModalOpen(true);
  };

  const handleStockSubmit = async (productoId, tipo, cantidad) => {
    const res = await fetch(`http://localhost:5000/api/productos/${productoId}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, cantidad })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al actualizar el stock');
    }

    const prod = productos.find(p => p.id === productoId);
    const prodName = prod ? prod.nombre : 'Producto';

    if (tipo === 'ENTRADA') {
      setNotification({
        type: 'entrada',
        title: 'Entrada de Stock Registrada',
        message: `¡Se agregaron ${cantidad} unidad(es) de stock a "${prodName}"!`
      });
    } else {
      setNotification({
        type: 'salida',
        title: 'Salida de Stock Registrada',
        message: `¡Se descontaron/quitaron ${cantidad} unidad(es) de stock a "${prodName}"!`
      });
    }

    await fetchProductos();
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  const totalProductos = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const stockNegativoOCero = productos.filter(p => p.cantidad <= 0).length;

  return (
    <div className="space-y-6">
      
      {/* Header & Main Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-700" />
            Gestión de Inventario de Productos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Panel de control de existencias en almacén y registro de stock.
          </p>
        </div>

        <button
          onClick={fetchProductos}
          id="btn-refresh-productos"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-300 shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Tabla</span>
        </button>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div className={`p-4 rounded-lg border shadow-xs flex items-center justify-between transition-all ${
          notification.type === 'entrada'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : notification.type === 'salida'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${
              notification.type === 'entrada'
                ? 'bg-emerald-200/80 text-emerald-800'
                : notification.type === 'salida'
                ? 'bg-amber-200/80 text-amber-800'
                : 'bg-blue-200/80 text-blue-800'
            }`}>
              {notification.type === 'entrada' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : notification.type === 'salida' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">{notification.title}</p>
              <p className="text-sm font-medium mt-0.5">{notification.message}</p>
            </div>
          </div>

          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-black/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Productos</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalProductos}</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-100 text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Total Almacén</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalStock} u.</p>
          </div>
          <div className="p-2.5 rounded-md bg-blue-50 text-blue-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Alerta / Negativo</p>
            <p className={`text-2xl font-bold mt-0.5 ${stockNegativoOCero > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stockNegativoOCero}
            </p>
          </div>
          <div className={`p-2.5 rounded-md ${stockNegativoOCero > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            id="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID o nombre de producto..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Enterprise Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Descripción del Producto</th>
                <th className="py-3 px-4">Cantidad (Stock)</th>
                <th className="py-3 px-4">Precio Unitario</th>
                <th className="py-3 px-4 text-center">Acciones de Inventario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                    Cargando inventario...
                  </td>
                </tr>
              ) : filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 text-xs">
                    No hay productos disponibles en la base de datos.
                  </td>
                </tr>
              ) : (
                filteredProductos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">#{p.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <span className="whitespace-pre">{p.nombre}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        p.cantidad < 0
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : p.cantidad === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {p.cantidad < 0 && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        {p.cantidad} u.
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      ${parseFloat(p.precio).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(p, 'ENTRADA')}
                          id={`btn-entrada-${p.id}`}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Entrada</span>
                        </button>

                        <button
                          onClick={() => handleOpenModal(p, 'SALIDA')}
                          id={`btn-salida-${p.id}`}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>- Salida</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        producto={selectedProduct}
        tipo={modalType}
        onConfirm={handleStockSubmit}
      />

    </div>
  );
}
