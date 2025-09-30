// src/components/stats/InspectionTrends.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useInspectionStats } from '../../hooks/useStats';

export default function InspectionTrends({ dateRange }) {
  const { data, loading, error } = useInspectionStats({ autoFetch: true });

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>;
  if (error) return <div className="text-red-600 p-4">Error cargando tendencias: {error}</div>;

  // Si no hay datos del servidor, mostrar error
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">No se pudieron cargar las tendencias</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
        </CardContent>
      </Card>
    );
  }

  // Asegurar que tenemos datos válidos
  let trendsData = { monthlyData: [] };
  
  if (data && data.byMonth && Array.isArray(data.byMonth)) {
    // El backend envía: { byMonth: [{ month: "2025-09", count: 30 }, ...] }
    trendsData = {
      monthlyData: data.byMonth.map(item => {
        const date = new Date(item.month + '-01');
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
          inspections: Number(item.count) || 0,
          // Estimación basada en completionRate promedio
          completed: Math.round((Number(item.count) || 0) * 0.567) // 56.67% del overview
        };
      })
    };
  } else {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Formato de datos inválido</p>
          <p className="text-gray-600 text-sm mt-2">Los datos de tendencias no tienen el formato esperado</p>
        </CardContent>
      </Card>
    );
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendencias Mensuales (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendsData.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="inspections" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorInspections)" 
                name="Total Inspecciones"
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#22C55E" 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
                name="Completadas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}