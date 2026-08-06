import React, { useState, useEffect } from 'react';
import { History, RefreshCw, ArrowUpRight, ArrowDownRight, Search, Calendar, Filter } from 'lucide-react';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/movimientos');
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudo obtener el historial.`);
      const data = await res.json();
      setMovimientos(data);
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const filteredMovimientos = movimientos.filter((m) => {
    const matchesSearch =
      m.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toString().includes(searchTerm) ||
      m.producto_id.toString().includes(searchTerm);

    const matchesTipo = tipoFilter === 'TODOS' || m.tipo === tipoFilter;

    return matchesSearch && matchesTipo;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-700" />
            Historial de Movimientos de Inventario
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro de auditoría de Entradas y Salidas almacenado en MySQL.
          </p>
        </div>

        <button
          onClick={fetchMovimientos}
          id="btn-refresh-movimientos"
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold border border-slate-300 shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Historial</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            id="search-movimientos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de producto o ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <select
            id="tipo-filter"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="ENTRADA">Solo ENTRADA</option>
            <option value="SALIDA">Solo SALIDA</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Enterprise Movements Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID Mov.</th>
                <th className="py-3 px-4">ID Prod.</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Tipo Movimiento</th>
                <th className="py-3 px-4">Cantidad</th>
                <th className="py-3 px-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    Cargando historial...
                  </td>
                </tr>
              ) : filteredMovimientos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 text-xs">
                    No se encontraron registros de movimientos.
                  </td>
                </tr>
              ) : (
                filteredMovimientos.map((m) => {
                  const isEntrada = m.tipo === 'ENTRADA';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500">#{m.id}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">#{m.producto_id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-pre">
                        {m.producto_nombre}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          isEntrada
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {isEntrada ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                          {m.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {m.cantidad} u.
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(m.fecha)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
