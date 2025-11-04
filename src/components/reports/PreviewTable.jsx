// src/components/reports/PreviewTable.jsx
import { FileText, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PreviewTable({ preview }) {
  if (!preview) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDependencyLabel = (dependency) => {
    const labels = {
      MayorOffice: 'Alcaldía',
      RealEstate: 'Bienes Inmuebles',
      Collections: 'Cobros',
      Constructions: 'Construcciones',
      TaxesAndLicenses: 'Rentas y Patentes',
      ServicePlatform: 'Plataformas de Servicios',
      MaritimeZone: 'Zona Marítima Terrestre',
      WorkClosure: 'Clausura de Obra',
    };
    return labels[dependency] || dependency;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Resultados de la Búsqueda
        </CardTitle>
        <div className="text-sm text-gray-600">
          Se encontraron <strong className="text-blue-600">{preview.total}</strong> inspecciones
        </div>
      </CardHeader>

      <CardContent>
        {preview.total === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron inspecciones con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            {preview.sample && preview.sample.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">N.º Trámite</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Dependencia</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Inspector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample.map((inspection) => (
                      <tr key={inspection.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{inspection.id}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">
                            {inspection.procedureNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {getDependencyLabel(inspection.dependency)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(inspection.inspectionDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            inspection.status === 'Nuevo' ? 'bg-green-100 text-green-800' :
                            inspection.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                            inspection.status === 'Revisado' ? 'bg-yellow-100 text-yellow-800' :
                            inspection.status === 'Archivado' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inspection.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {inspection.inspectors && inspection.inspectors.length > 0
                            ? `${inspection.inspectors[0].firstName} ${inspection.inspectors[0].lastName1}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {preview.total > preview.sample.length && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Mostrando {preview.sample.length} de {preview.total} resultados
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
