// src/components/stats/StatsConfig.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Users,
  Building2
} from 'lucide-react';

export default function StatsConfig({ onConfigChange, currentConfig = {} }) {
  const [config, setConfig] = useState({
    dateRange: 'last30days',
    departments: ['all'],
    inspectors: ['all'],
    statusFilter: ['all'],
    groupBy: 'department',
    refreshInterval: 30,
    ...currentConfig
  });

  const handleConfigUpdate = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const dateRangeOptions = [
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'last90days', label: 'Últimos 3 meses' },
    { value: 'last6months', label: 'Últimos 6 meses' },
    { value: 'lastyear', label: 'Último año' },
    { value: 'custom', label: 'Rango personalizado' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'revisado', label: 'Revisado' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'Todos los departamentos' },
    { value: 'construcciones', label: 'Construcciones' },
    { value: 'zona_maritima', label: 'Zona Marítima' },
    { value: 'alcaldia_mayor', label: 'Alcaldía Mayor' }
  ];

  const groupByOptions = [
    { value: 'department', label: 'Por Departamento' },
    { value: 'inspector', label: 'Por Inspector' },
    { value: 'status', label: 'Por Estado' },
    { value: 'date', label: 'Por Fecha' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración de Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rango de Fechas */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Rango de Fechas
          </Label>
          <select
            value={config.dateRange}
            onChange={(e) => handleConfigUpdate('dateRange', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departamentos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departamentos
            </Label>
            <select
              value={config.departments[0]}
              onChange={(e) => handleConfigUpdate('departments', [e.target.value])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estados */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Estados
            </Label>
            <select
              value={config.statusFilter[0]}
              onChange={(e) => handleConfigUpdate('statusFilter', [e.target.value])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agrupación */}
        <div className="space-y-2">
          <Label>Agrupar por</Label>
          <select
            value={config.groupBy}
            onChange={(e) => handleConfigUpdate('groupBy', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {groupByOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Intervalo de Actualización */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Actualización Automática (segundos)
          </Label>
          <Input
            type="number"
            min="10"
            max="300"
            value={config.refreshInterval}
            onChange={(e) => handleConfigUpdate('refreshInterval', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            onClick={() => onConfigChange?.(config)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Aplicar Filtros
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Lógica para exportar configuración
              const configBlob = new Blob([JSON.stringify(config, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(configBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'stats-config.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Config
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const defaultConfig = {
                dateRange: 'last30days',
                departments: ['all'],
                inspectors: ['all'],
                statusFilter: ['all'],
                groupBy: 'department',
                refreshInterval: 30
              };
              setConfig(defaultConfig);
              onConfigChange?.(defaultConfig);
            }}
          >
            Restablecer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}