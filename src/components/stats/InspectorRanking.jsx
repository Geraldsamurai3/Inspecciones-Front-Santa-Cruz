// src/components/stats/InspectorRanking.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Trophy, Star } from 'lucide-react';
import { useInspectorStats } from '../../hooks/useStats';

export default function InspectorRanking({ dateRange }) {
  const { data, loading, error } = useInspectorStats({ autoFetch: true });

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>;
  if (error) return <div className="text-red-600 p-4">Error cargando inspectores: {error}</div>;

  // Si no hay datos del servidor, mostrar error
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">No se pudieron cargar los datos de inspectores</p>
          <p className="text-gray-600 text-sm mt-2">Verifique la conexión con el servidor</p>
        </CardContent>
      </Card>
    );
  }

  // Asegurar que tenemos un array válido
  let inspectorsData = [];
  
  if (Array.isArray(data)) {
    inspectorsData = data;
  } else {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Formato de datos inválido</p>
          <p className="text-gray-600 text-sm mt-2">Los datos de inspectores no tienen el formato esperado</p>
        </CardContent>
      </Card>
    );
  }

  // Validar y normalizar datos del backend
  inspectorsData = inspectorsData.map(inspector => ({
    id: inspector.inspectorId,
    name: inspector.inspectorName || 'Inspector sin nombre',
    completed: Number(inspector.byStatus?.archivado) || 0,
    pending: Number(inspector.byStatus?.nuevo) || 0,
    inProgress: Number(inspector.byStatus?.enProceso) || 0,
    reviewed: Number(inspector.byStatus?.revisado) || 0,
    totalInspections: Number(inspector.totalInspections) || 0,
    thisMonth: Number(inspector.thisMonth) || 0,
    avgPerMonth: Number(inspector.avgPerMonth) || 0,
    // Calcular eficiencia basada en inspecciones completadas vs total
    efficiency: inspector.totalInspections > 0 
      ? ((Number(inspector.byStatus?.archivado) || 0) / Number(inspector.totalInspections) * 100)
      : 0
  })).sort((a, b) => b.totalInspections - a.totalInspections); // Ordenar por total

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Ranking de Inspectores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inspectorsData.map((inspector, index) => (
            <div key={inspector.id || `inspector-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {index < 3 ? (
                  <Trophy className={`w-6 h-6 ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' : 'text-orange-500'
                  }`} />
                ) : (
                  <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">
                    #{index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{inspector.name}</h3>
                <div className="flex gap-3 mt-1">
                  <p className="text-xs text-green-600">
                    ✓ {inspector.completed} archivadas
                  </p>
                  <p className="text-xs text-violet-600">
                    👁 {inspector.reviewed} revisadas
                  </p>
                  <p className="text-xs text-amber-600">
                    ⏳ {inspector.inProgress} en proceso
                  </p>
                  <p className="text-xs text-blue-600">
                    📋 {inspector.pending} nuevas
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total: {inspector.totalInspections.toLocaleString()} • Este mes: {inspector.thisMonth.toLocaleString()} • Promedio: {inspector.avgPerMonth.toFixed(1)}/mes
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{inspector.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}