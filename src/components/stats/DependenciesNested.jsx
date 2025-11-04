// src/components/stats/DependenciesNested.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import axiosInstance from '../../config/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DependenciesNested() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set(['construccion']));

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`${API_URL}/dashboard/stats/dependencies`);
      console.log('📊 Datos de dependencias nested:', response.data);
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

  const toggleRow = (key) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

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

  if (!data || !data.dependencias) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const deps = data.dependencias;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Estadísticas Jerárquicas de Dependencias
          </CardTitle>
          <div className="text-sm text-gray-600">
            Total de inspecciones: <span className="font-bold">{data.totalInspecciones}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Dependencia</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Porcentaje</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Construcción con subdependencias */}
              <tr 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleRow('construccion')}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    {expandedRows.has('construccion') ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    🏗️ Construcción
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold">{deps.construccion?.total || 0}</td>
                <td className="px-4 py-3 text-center">{deps.construccion?.porcentaje || 0}%</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {Object.keys(deps.construccion?.subdependencias || {}).length} subdependencias
                  </span>
                </td>
              </tr>

              {/* Subdependencias de Construcción */}
              {expandedRows.has('construccion') && deps.construccion?.subdependencias && (
                <>
                  {deps.construccion.subdependencias.usoSuelo && (
                    <tr className="bg-blue-50/30">
                      <td className="px-4 py-3 pl-12">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">↳</span>
                          📐 Uso de Suelo
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.usoSuelo.total}</td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.usoSuelo.porcentaje}%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                  {deps.construccion.subdependencias.antiguedad && (
                    <tr className="bg-blue-50/30">
                      <td className="px-4 py-3 pl-12">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">↳</span>
                          ⏰ Antigüedad
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.antiguedad.total}</td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.antiguedad.porcentaje}%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                  {deps.construccion.subdependencias.anulacionPC && (
                    <tr className="bg-blue-50/30">
                      <td className="px-4 py-3 pl-12">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">↳</span>
                          🚫 Anulación de PC
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.anulacionPC.total}</td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.anulacionPC.porcentaje}%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                  {deps.construccion.subdependencias.inspeccionGeneral && (
                    <tr className="bg-blue-50/30">
                      <td className="px-4 py-3 pl-12">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">↳</span>
                          🔍 Inspección General
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.inspeccionGeneral.total}</td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.inspeccionGeneral.porcentaje}%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                  {deps.construccion.subdependencias.recibidoObra && (
                    <tr className="bg-blue-50/30">
                      <td className="px-4 py-3 pl-12">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">↳</span>
                          📋 Recibido de Obra
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.recibidoObra.total}</td>
                      <td className="px-4 py-3 text-center">{deps.construccion.subdependencias.recibidoObra.porcentaje}%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                </>
              )}

              {/* Otras dependencias */}
              {deps.alcaldia && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">🏛️ Alcaldía</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.alcaldia.total}</td>
                  <td className="px-4 py-3 text-center">{deps.alcaldia.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.bienesInmuebles && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">🏢 Bienes Inmuebles</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.bienesInmuebles.total}</td>
                  <td className="px-4 py-3 text-center">{deps.bienesInmuebles.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.cobranza && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">💵 Cobranza</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.cobranza.total}</td>
                  <td className="px-4 py-3 text-center">{deps.cobranza.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.impuestosLicencias && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">🏪 Impuestos y Licencias</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.impuestosLicencias.total}</td>
                  <td className="px-4 py-3 text-center">{deps.impuestosLicencias.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.plataformaServicios && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">�️ Plataforma de Servicios</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.plataformaServicios.total}</td>
                  <td className="px-4 py-3 text-center">{deps.plataformaServicios.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.zonaMaritima && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">�️ Zona Marítima</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.zonaMaritima.total}</td>
                  <td className="px-4 py-3 text-center">{deps.zonaMaritima.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}

              {deps.cierreObra && (
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">🔒 Cierre de Obra</td>
                  <td className="px-4 py-3 text-center font-bold">{deps.cierreObra.total}</td>
                  <td className="px-4 py-3 text-center">{deps.cierreObra.porcentaje}%</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ayuda */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">💡 Consejo:</p>
          <p>Haz clic en "Construcción" para expandir o contraer las subdependencias.</p>
        </div>
      </CardContent>
    </Card>
  );
}
