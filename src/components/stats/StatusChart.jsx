// src/components/stats/StatusChart.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart as PieIcon,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useStatusCounts } from '../../hooks/useStats';

export default function StatusChart({ dateRange }) {
  const [chartType, setChartType] = useState('pie'); // 'pie' o 'bar'
  const { data, loading, error } = useStatusCounts({ autoFetch: true });

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error al cargar los datos: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos del servidor, mostrar error
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">No se pudieron cargar los datos de estado</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
        </CardContent>
      </Card>
    );
  }

  // Validar y sanitizar datos del servidor (nuevos endpoints)
  let statusData = {};
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // El backend envía: {"nuevo": 25, "enProceso": 40, "revisado": 60, "archivado": 25}
    statusData = {
      nuevo: Number(data.nuevo) || 0,
      enProceso: Number(data.enProceso) || 0,
      revisado: Number(data.revisado) || 0,
      archivado: Number(data.archivado) || 0
    };
  } else {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Formato de datos inválido</p>
          <p className="text-gray-600 text-sm mt-2">Los datos recibidos del servidor no tienen el formato esperado</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    nuevo: {
      label: 'Nuevo',
      color: '#3B82F6', // blue-500
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: Clock
    },
    enProceso: {
      label: 'En Proceso',
      color: '#F59E0B', // amber-500
      lightColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      icon: AlertTriangle
    },
    revisado: {
      label: 'Revisado',
      color: '#8B5CF6', // violet-500
      lightColor: 'bg-violet-100',
      textColor: 'text-violet-700',
      icon: Eye
    },
    archivado: {
      label: 'Archivado',
      color: '#22C55E', // green-500
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
      icon: CheckCircle
    }
  };

  // Función para obtener config con fallback
  const getStatusConfig = (status) => {
    return statusConfig[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: '#6B7280',
      lightColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      icon: Clock
    };
  };

  const total = Object.values(statusData).reduce((sum, count) => sum + (count || 0), 0);

  // Preparar datos para Recharts - FILTRAR items con valor 0
  const chartData = Object.entries(statusData)
    .filter(([status, count]) => count > 0) // Solo mostrar si tiene valor mayor a 0
    .map(([status, count]) => ({
      name: getStatusConfig(status).label,
      value: count,
      color: getStatusConfig(status).color,
      percentage: ((count / total) * 100).toFixed(1)
    }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const StatusCard = ({ status, count, config }) => {
    // Validar que config existe y tiene las propiedades necesarias
    if (!config || !config.icon) {
      console.warn(`Config no encontrado para estado: ${status}`);
      return null; // No renderizar si no hay config válido
    }

    const percentage = ((count / total) * 100).toFixed(1);
    const Icon = config.icon;

    return (
      <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-lg ${config.lightColor || 'bg-gray-100'} mr-4`}>
          <Icon className={`w-6 h-6 ${config.textColor || 'text-gray-700'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{config.label || status}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{(count || 0).toLocaleString()}</span>
            <span className="text-sm text-gray-500">({percentage}%)</span>
          </div>
        </div>
      </div>
    );
  };

  const PieChartComponent = () => {
    // Label personalizado con separación vertical dinámica
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent, index }) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 20; // Reducido a 20
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      const isRightSide = x > cx;
      const verticalSpacing = 16;
      let adjustedY = y;
      
      if (isRightSide && percent < 0.05) {
        adjustedY = cy - 10 + (index * verticalSpacing);
      }

      return (
        <text 
          x={x} 
          y={adjustedY} 
          fill="#1F2937"
          textAnchor={isRightSide ? 'start' : 'end'} 
          dominantBaseline="central"
          style={{ 
            fontSize: '12px', 
            fontWeight: '600'
          }}
        >
          {`${name}: ${(percent * 100).toFixed(1)}%`}
        </text>
      );
    };

    return (
      <div className="w-full">
        {/* Gráfico de Pie */}
        <ResponsiveContainer width="100%" height={380}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={{
                stroke: '#9CA3AF',
                strokeWidth: 1
              }}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={30}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Detalles por estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
          {Object.entries(statusData).map(([status, count]) => {
            const config = getStatusConfig(status);
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={status} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }}></div>
                <span className="text-sm text-gray-700 flex-1 font-medium">{config.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 block">{count.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total */}
        <div className="mt-6 pt-6 border-t border-gray-200 px-4">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg">
            <span className="text-base font-semibold text-gray-700">Total de Inspecciones</span>
            <span className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const BarChartComponent = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(statusData).map(([status, count]) => (
          <StatusCard
            key={status}
            status={status}
            count={count}
            config={getStatusConfig(status)}
          />
        ))}
      </div>

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-5 h-5" />
              Distribución por Estados
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieIcon className="w-4 h-4 mr-1" />
                Circular
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Barras
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {chartType === 'pie' ? <PieChartComponent /> : <BarChartComponent />}
        </CardContent>
      </Card>
    </div>
  );
}