// src/components/stats/DetailedAnalytics.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, Activity } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useDetailedStats } from '../../hooks/useStats';

export default function DetailedAnalytics({ dateRange }) {
  const { data, loading, error } = useDetailedStats({ autoFetch: true });

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>;
  if (error) return <div className="text-red-600 p-4">Error cargando análisis detallado: {error}</div>;

  // Si no hay datos del servidor, mostrar error
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">No se pudieron cargar los análisis detallados</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
        </CardContent>
      </Card>
    );
  }

  // Asegurar que tenemos datos válidos
  let analyticsData = {
    overview: {
      totalInspections: 0,
      activeInspectors: 0,
      completionRate: 0
    },
    trends: {
      growth: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    radarData: []
  };
  
  if (data && typeof data === 'object') {
    // Usar datos del endpoint /stats/detailed
    analyticsData = {
      overview: {
        totalInspections: Number(data.overview?.totalInspections) || 0,
        activeInspectors: Number(data.overview?.activeInspectors) || 0,
        completionRate: Number(data.overview?.completionRate) || 0
      },
      trends: {
        growth: Number(data.trends?.growth) || 0,
        thisMonth: Number(data.trends?.thisMonth) || 0,
        lastMonth: Number(data.trends?.lastMonth) || 0
      },
      // Crear datos para radar chart con métricas reales
      radarData: [
        {
          metric: 'Completación',
          value: Number(data.overview?.completionRate) || 0,
          fullMark: 100
        },
        {
          metric: 'Actividad',
          value: data.overview?.totalInspections ? Math.min((Number(data.overview.totalInspections) / 200) * 100, 100) : 0,
          fullMark: 100
        },
        {
          metric: 'Crecimiento',
          value: Math.min(Math.abs(Number(data.trends?.growth) || 0), 100),
          fullMark: 100
        },
        {
          metric: 'Inspectores',
          value: data.overview?.activeInspectors ? Math.min((Number(data.overview.activeInspectors) / 15) * 100, 100) : 0,
          fullMark: 100
        },
        {
          metric: 'Eficiencia',
          value: data.overview?.totalInspections && data.overview?.activeInspectors 
            ? Math.min((Number(data.overview.totalInspections) / Number(data.overview.activeInspectors) / 20) * 100, 100)
            : 0,
          fullMark: 100
        }
      ]
    };
  } else {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Formato de datos inválido</p>
          <p className="text-gray-600 text-sm mt-2">Los datos de análisis no tienen el formato esperado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs en grid de 4 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <Activity className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-blue-600 mb-1">
            {analyticsData.overview.totalInspections.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 font-medium">Total Inspecciones</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-green-600 mb-1">
            {analyticsData.overview.completionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 font-medium">Tasa de Completación</p>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <Target className="w-10 h-10 text-violet-600 mx-auto mb-3" />
          <p className="text-3xl font-bold text-violet-600 mb-1">
            {analyticsData.overview.activeInspectors}
          </p>
          <p className="text-sm text-gray-600 font-medium">Inspectores Activos</p>
        </div>
        
        <div className={`text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${analyticsData.trends.growth >= 0 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
          <TrendingUp className={`w-10 h-10 mx-auto mb-3 ${analyticsData.trends.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
          <p className={`text-3xl font-bold mb-1 ${analyticsData.trends.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {analyticsData.trends.growth >= 0 ? '+' : ''}{analyticsData.trends.growth.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 font-medium">Crecimiento Mensual</p>
        </div>
      </div>

      {/* Radar Chart de Rendimiento - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análisis de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={450}>
            <RadarChart data={analyticsData.radarData}>
              <PolarGrid stroke="#E5E7EB" strokeWidth={1.5} />
              <PolarAngleAxis 
                dataKey="metric" 
                stroke="#374151" 
                style={{ 
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Radar 
                name="Métricas de Rendimiento" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          
          {/* Información adicional */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Este Mes</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.trends.thisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">inspecciones</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Mes Anterior</p>
              <p className="text-2xl font-bold text-gray-600">{analyticsData.trends.lastMonth}</p>
              <p className="text-xs text-gray-500 mt-1">inspecciones</p>
            </div>
            <div className="text-center p-4 bg-violet-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Promedio por Inspector</p>
              <p className="text-2xl font-bold text-violet-600">
                {analyticsData.overview.activeInspectors > 0 
                  ? Math.round(analyticsData.overview.totalInspections / analyticsData.overview.activeInspectors)
                  : 0
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">inspecciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}