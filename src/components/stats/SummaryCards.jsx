// src/components/stats/SummaryCards.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2
} from 'lucide-react';
import { useCompleteOverviewStats } from '../../hooks/useStats';

export default function SummaryCards({ dateRange }) {
  const { data, loading, error } = useCompleteOverviewStats({ 
    autoFetch: true,
    refreshInterval: 30000 // Refresh cada 30 segundos
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error al cargar las estadísticas: {error}</p>
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
          <p className="text-yellow-700 font-medium">No se pudieron cargar las estadísticas</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
        </CardContent>
      </Card>
    );
  }

  // Validar y sanitizar datos del servidor (nuevos endpoints)
  const summaryData = {
    totalInspections: Number(data.regular?.total) || 0,
    completedInspections: Number(data.regular?.byStatus?.archivado) || 0,
    pendingInspections: Number(data.regular?.byStatus?.nuevo) || 0,
    inProgressInspections: Number(data.regular?.byStatus?.enProceso) || 0,
    revisedInspections: Number(data.regular?.byStatus?.revisado) || 0,
    totalInspectors: Number(data.overview?.activeInspectors) || 0,
    completionRate: Number(data.overview?.completionRate) || 0,
    recentInspections: Number(data.regular?.recent) || 0,
    trends: data.trends ? {
      growth: Number(data.trends.growth) || 0,
      thisMonth: Number(data.trends.thisMonth) || 0,
      lastMonth: Number(data.trends.lastMonth) || 0
    } : {
      growth: 0,
      thisMonth: 0,
      lastMonth: 0
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, suffix = '', color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100'
    };

    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </p>
              {trend !== undefined && (
                <div className="flex items-center mt-2">
                  {trend > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(trend)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Inspecciones"
            value={summaryData.totalInspections}
            icon={ClipboardList}
            trend={summaryData.trends?.growth}
            color="blue"
          />
          <StatCard
            title="Completadas"
            value={summaryData.completedInspections}
            icon={CheckCircle}
            trend={summaryData.trends?.growth > 0 ? summaryData.trends.growth : undefined}
            color="green"
          />
          <StatCard
            title="Pendientes"
            value={summaryData.pendingInspections}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="En Proceso"
            value={summaryData.inProgressInspections}
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            title="Revisadas"
            value={summaryData.revisedInspections}
            icon={CheckCircle}
            color="purple"
          />
        </div>
      </div>

      {/* Métricas del equipo */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas del Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Inspectores Activos"
            value={summaryData.totalInspectors}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Tasa de Completación"
            value={summaryData.completionRate}
            suffix="%"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Recientes (7 días)"
            value={summaryData.recentInspections}
            icon={Clock}
            color="blue"
          />
        </div>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Eficiencia General</p>
              <p className="text-2xl font-bold text-green-600">
                {summaryData.completionRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Crecimiento Mensual</p>
              <p className={`text-2xl font-bold ${summaryData.trends.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryData.trends.growth >= 0 ? '+' : ''}{summaryData.trends.growth.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Inspecciones Este Mes</p>
              <p className="text-2xl font-bold text-blue-600">
                {summaryData.trends.thisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}