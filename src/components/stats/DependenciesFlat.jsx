// src/components/stats/DependenciesFlat.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Landmark, 
  Waves, 
  Banknote, 
  Store, 
  Lock, 
  Building,
  Ruler,
  Clock,
  Ban,
  Search,
  FileCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axiosInstance from '../../config/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Iconos para cada dependencia
const dependencyIcons = {
  'Construcción': <Building2 className="w-5 h-5" />,
  'Uso de Suelo': <Ruler className="w-5 h-5" />,
  'Antigüedad': <Clock className="w-5 h-5" />,
  'Anulación de PC': <Ban className="w-5 h-5" />,
  'Inspección General': <Search className="w-5 h-5" />,
  'Recibido de Obra': <FileCheck className="w-5 h-5" />,
  'Alcaldía': <Landmark className="w-5 h-5" />,
  'Bienes Inmuebles': <Building className="w-5 h-5" />,
  'Cobranza': <Banknote className="w-5 h-5" />,
  'Impuestos y Licencias': <Store className="w-5 h-5" />,
  'Plataforma de Servicios': <Building className="w-5 h-5" />,
  'Zona Marítima': <Waves className="w-5 h-5" />,
  'Cierre de Obra': <Lock className="w-5 h-5" />
};

// Colores para el gráfico
const getDependencyColor = (nombre, esSubdependencia) => {
  if (esSubdependencia) {
    // Colores para subdependencias (tonos más claros)
    const colors = {
      'Uso de Suelo': '#93C5FD',
      'Antigüedad': '#A78BFA',
      'Anulación de PC': '#FCA5A5',
      'Inspección General': '#86EFAC',
      'Recibido de Obra': '#FDE047'
    };
    return colors[nombre] || '#E5E7EB';
  }
  
  // Colores para dependencias principales
  const colors = {
    'Construcción': '#3B82F6',
    'Alcaldía': '#8B5CF6',
    'Bienes Inmuebles': '#10B981',
    'Cobranza': '#EF4444',
    'Impuestos y Licencias': '#F59E0B',
    'Plataforma de Servicios': '#14B8A6',
    'Zona Marítima': '#06B6D4',
    'Cierre de Obra': '#6366F1'
  };
  return colors[nombre] || '#6B7280';
};

export default function DependenciesFlat() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart', 'cards', 'table'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`${API_URL}/dashboard/stats/dependencies/flat`);
      console.log('📊 Datos de dependencias flat:', response.data);
      setData(response.data);
    } catch (err) {
      console.error('❌ Error cargando dependencias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error cargando estadísticas</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{item.nombre}</p>
          {item.esSubdependencia && (
            <p className="text-xs text-gray-500 mb-2">↳ Subdependencia de {item.padre}</p>
          )}
          <p className="text-sm text-gray-700">
            Total: <span className="font-bold">{item.total}</span> inspecciones
          </p>
          <p className="text-sm text-gray-700">
            Porcentaje: <span className="font-bold">{item.porcentaje}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dependencias y Subdependencias
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                Gráfico
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Tarjetas
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tabla
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Vista de Gráfico */}
          {viewMode === 'chart' && (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart 
                data={data} 
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total" name="Total de Inspecciones" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getDependencyColor(entry.nombre, entry.esSubdependencia)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Vista de Tarjetas */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((dep, index) => (
                <Card 
                  key={index}
                  className={`${
                    dep.esSubdependencia 
                      ? 'border-l-4 border-l-blue-400 bg-blue-50' 
                      : 'border-l-4 border-l-green-500'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        dep.esSubdependencia ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {dependencyIcons[dep.nombre] || <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {dep.nombre}
                        </p>
                        {dep.esSubdependencia && (
                          <p className="text-xs text-gray-500 mt-1">
                            ↳ {dep.padre}
                          </p>
                        )}
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {dep.total}
                        </p>
                        <p className="text-xs text-gray-600">
                          {dep.porcentaje}% del total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Vista de Tabla */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Dependencia</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Porcentaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((dep, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50 transition-colors ${
                        dep.esSubdependencia ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {dependencyIcons[dep.nombre] || <Building2 className="w-4 h-4" />}
                          <span className="font-medium text-gray-900">
                            {dep.esSubdependencia && '  ↳ '}
                            {dep.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {dep.esSubdependencia ? (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Subdependencia
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            Principal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900">{dep.total}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700">{dep.porcentaje}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 font-bold text-gray-900">
                      Total General
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
                      {data.reduce((sum, dep) => sum + dep.total, 0)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-900">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Dependencias Principales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-gray-700">Subdependencias de Construcción</span>
            </div>
            <div className="ml-auto text-gray-600">
              Total de dependencias: <span className="font-bold">{data.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
