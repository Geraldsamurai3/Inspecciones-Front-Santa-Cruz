// src/pages/StatsPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Activity,
  Wifi
} from 'lucide-react';

// Importar componentes de estadísticas
import SummaryCards from '../components/stats/SummaryCards';
import StatusChart from '../components/stats/StatusChart';
import InspectionTrends from '../components/stats/InspectionTrends';
import InspectorRanking from '../components/stats/InspectorRanking';
import DepartmentComparison from '../components/stats/DepartmentComparison';
import DependenciesFlat from '../components/stats/DependenciesFlat';
import DependenciesNested from '../components/stats/DependenciesNested';
import DetailedAnalytics from '../components/stats/DetailedAnalytics';
import StatsConnectionTest from '../components/stats/StatsConnectionTest';
import StatsErrorBoundary from '../components/stats/StatsErrorBoundary';

export default function StatsPage() {
  const [activeView, setActiveView] = useState('summary');
  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh - en tu implementación aquí llamarías a refresh de los hooks
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const views = [
    {
      id: 'summary',
      label: 'Resumen General',
      icon: <Activity size={18} />,
      description: 'Vista general con métricas principales'
    },
    {
      id: 'status',
      label: 'Estados',
      icon: <PieChart size={18} />,
      description: 'Distribución por estados de inspecciones'
    },
    {
      id: 'trends',
      label: 'Tendencias',
      icon: <TrendingUp size={18} />,
      description: 'Análisis temporal y tendencias'
    },
    {
      id: 'inspectors',
      label: 'Inspectores',
      icon: <Users size={18} />,
      description: 'Ranking y productividad por inspector'
    },
    {
      id: 'dependencies-flat',
      label: 'Dependencias Detalladas',
      icon: <Building2 size={18} />,
      description: 'Subdependencias como ítems independientes'
    },
    {
      id: 'dependencies-nested',
      label: 'Dependencias Jerárquicas',
      icon: <Building2 size={18} />,
      description: 'Vista expandible con subdependencias'
    },
    {
      id: 'departments',
      label: 'Dependencias',
      icon: <Building2 size={18} />,
      description: 'Comparación entre dependencias'
    },
    {
      id: 'detailed',
      label: 'Análisis Detallado',
      icon: <BarChart3 size={18} />,
      description: 'Vista completa con métricas avanzadas'
    },
    {
      id: 'connection-test',
      label: 'Prueba de Conexión',
      icon: <Wifi size={18} />,
      description: 'Verificar endpoints del backend'
    }
  ];

  const dateRanges = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'summary':
        return (
          <StatsErrorBoundary>
            <SummaryCards dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'status':
        return (
          <StatsErrorBoundary>
            <StatusChart dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'trends':
        return (
          <StatsErrorBoundary>
            <InspectionTrends dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'inspectors':
        return (
          <StatsErrorBoundary>
            <InspectorRanking dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'dependencies-flat':
        return (
          <StatsErrorBoundary>
            <DependenciesFlat />
          </StatsErrorBoundary>
        );
      case 'dependencies-nested':
        return (
          <StatsErrorBoundary>
            <DependenciesNested />
          </StatsErrorBoundary>
        );
      case 'departments':
        return (
          <StatsErrorBoundary>
            <DepartmentComparison dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'detailed':
        return (
          <StatsErrorBoundary>
            <DetailedAnalytics dateRange={dateRange} />
          </StatsErrorBoundary>
        );
      case 'connection-test':
        return <StatsConnectionTest />;
      default:
        return (
          <StatsErrorBoundary>
            <SummaryCards dateRange={dateRange} />
          </StatsErrorBoundary>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Estadísticas e Informes
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis completo del rendimiento de inspecciones
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Selector de rango de fechas */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón de refresh */}
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              {/* Botón de exportar */}
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  p-3 rounded-lg text-left transition-all duration-200
                  ${activeView === view.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {view.icon}
                  <span className="font-medium text-sm">{view.label}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {view.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vista activa */}
      <div className="min-h-[400px]">
        {renderActiveView()}
      </div>

      {/* Footer con información adicional */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Última actualización: {new Date().toLocaleString()}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Datos en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Vista: {views.find(v => v.id === activeView)?.label}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}