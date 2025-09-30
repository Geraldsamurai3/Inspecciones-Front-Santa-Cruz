// src/components/stats/DependencyComparison.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building2, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import statsService from '../../services/statsService';

export default function DependencyComparison() {
  const [period, setPeriod] = useState('7days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar datos
  const loadData = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando dependencias con período:', selectedPeriod);
      const result = await statsService.getDependencies({ period: selectedPeriod });
      console.log('✅ Datos recibidos:', result);
      setData(result);
    } catch (err) {
      console.error('❌ Error cargando dependencias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar y cuando cambie el período
  useEffect(() => {
    loadData(period);
  }, [period]);

  // Cambiar período
  const handlePeriodChange = (newPeriod) => {
    console.log('📅 Cambiando período a:', newPeriod);
    setPeriod(newPeriod);
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>;
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error cargando dependencias</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <Button onClick={() => loadData(period)} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos del servidor, mostrar error
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building2 className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">No se pudieron cargar los datos de dependencias</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
          <Button onClick={() => loadData(period)} className="mt-4" variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Log para debugging
  console.log('📊 Datos para renderizar:', data);

  // Asegurar que tenemos un array válido y transformar para gráfico
  let dependenciesData = [];
  
  if (!Array.isArray(data.byDependency)) {
    console.warn('⚠️ byDependency no es un array:', data.byDependency);
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Formato de datos inválido</p>
          <p className="text-gray-600 text-sm mt-2">Los datos de dependencias no tienen el formato esperado</p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
              Ver datos recibidos
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  if (data.byDependency.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Estadísticas por Dependencia
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1">
                {['7days', '1week', '15days', '1month'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodChange(p)}
                  >
                    {periodLabels[p]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No hay datos para este período</p>
          <p className="text-gray-500 text-sm mt-2">
            {data.period}: {data.startDate} - {data.endDate}
          </p>
        </CardContent>
      </Card>
    );
  }

  dependenciesData = data.byDependency.map(dep => {
    const transformed = {
      name: dep.dependency || 'Sin dependencia',
      total: Number(dep.total) || 0,
      archivadas: Number(dep.byStatus?.archivado) || 0,
      revisadas: Number(dep.byStatus?.revisado) || 0,
      enProceso: Number(dep.byStatus?.enProceso) || 0,
      nuevas: Number(dep.byStatus?.nuevo) || 0,
      percentage: Number(dep.percentage) || 0
    };
    console.log('🔄 Transformando:', dep.dependency, '→', transformed);
    return transformed;
  });

  const colors = {
    archivadas: '#22C55E',
    revisadas: '#8B5CF6',
    enProceso: '#F59E0B',
    nuevas: '#3B82F6'
  };

  const periodLabels = {
    '7days': 'Últimos 7 días',
    '1week': 'Última semana',
    '15days': 'Últimos 15 días',
    '1month': 'Último mes'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
          <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
            Total: <span className="font-bold">{total}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Estadísticas por Dependencia
          </CardTitle>
          
          {/* Filtros de período */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
              {['7days', '1week', '15days', '1month'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange(p)}
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Información del período */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {data.period}
          </span>
          <span>
            {new Date(data.startDate).toLocaleDateString('es-ES')} - {new Date(data.endDate).toLocaleDateString('es-ES')}
          </span>
          <span className="font-semibold">
            Total: {data.total?.toLocaleString()} inspecciones
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Debug info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="font-semibold text-blue-900 mb-1">🔍 Debug Info:</p>
          <p className="text-blue-700">Período actual: <span className="font-mono">{period}</span></p>
          <p className="text-blue-700">Total inspecciones: <span className="font-mono">{data.total}</span></p>
          <p className="text-blue-700">Dependencias encontradas: <span className="font-mono">{dependenciesData.length}</span></p>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600 hover:underline">Ver datos procesados</summary>
            <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-40">
              {JSON.stringify(dependenciesData, null, 2)}
            </pre>
          </details>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <BarChart 
            data={dependenciesData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            barSize={Math.min(40, 600 / dependenciesData.length)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#374151"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11, fill: '#374151' }}
            />
            <YAxis 
              stroke="#374151" 
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="archivadas" stackId="a" fill={colors.archivadas} name="Archivadas" radius={[0, 0, 0, 0]} />
            <Bar dataKey="revisadas" stackId="a" fill={colors.revisadas} name="Revisadas" radius={[0, 0, 0, 0]} />
            <Bar dataKey="enProceso" stackId="a" fill={colors.enProceso} name="En Proceso" radius={[0, 0, 0, 0]} />
            <Bar dataKey="nuevas" stackId="a" fill={colors.nuevas} name="Nuevas" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Tabla de resumen */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen por Dependencia</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Dependencia</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">Total</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">%</th>
                  <th className="px-4 py-2 text-center font-medium text-green-600">Archivadas</th>
                  <th className="px-4 py-2 text-center font-medium text-violet-600">Revisadas</th>
                  <th className="px-4 py-2 text-center font-medium text-amber-600">En Proceso</th>
                  <th className="px-4 py-2 text-center font-medium text-blue-600">Nuevas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dependenciesData.map((dep, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{dep.name}</td>
                    <td className="px-4 py-3 text-center font-semibold">{dep.total}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{dep.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-green-600">{dep.archivadas}</td>
                    <td className="px-4 py-3 text-center text-violet-600">{dep.revisadas}</td>
                    <td className="px-4 py-3 text-center text-amber-600">{dep.enProceso}</td>
                    <td className="px-4 py-3 text-center text-blue-600">{dep.nuevas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjetas de resumen rápido */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Archivadas</p>
            <p className="text-2xl font-bold text-green-600">
              {dependenciesData.reduce((sum, i) => sum + i.archivadas, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((dependenciesData.reduce((sum, i) => sum + i.archivadas, 0) / data.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Revisadas</p>
            <p className="text-2xl font-bold text-violet-600">
              {dependenciesData.reduce((sum, i) => sum + i.revisadas, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((dependenciesData.reduce((sum, i) => sum + i.revisadas, 0) / data.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">En Proceso</p>
            <p className="text-2xl font-bold text-amber-600">
              {dependenciesData.reduce((sum, i) => sum + i.enProceso, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((dependenciesData.reduce((sum, i) => sum + i.enProceso, 0) / data.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Nuevas</p>
            <p className="text-2xl font-bold text-blue-600">
              {dependenciesData.reduce((sum, i) => sum + i.nuevas, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((dependenciesData.reduce((sum, i) => sum + i.nuevas, 0) / data.total) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}