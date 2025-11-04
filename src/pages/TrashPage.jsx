// src/pages/TrashPage.jsx
import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Calendar, FileText, AlertCircle, Eye, X } from 'lucide-react';
import { useInspections } from '@/hooks/useInspections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

export default function TrashPage() {
  const [trashInspections, setTrashInspections] = useState([]);
  const { getTrashInspections, restoreFromTrash, loading } = useInspections({ autoFetch: false });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadTrash = async () => {
    setRefreshing(true);
    try {
      const data = await getTrashInspections();
      setTrashInspections(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la papelera',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (inspection) => {
    const result = await Swal.fire({
      title: '¿Restaurar inspección?',
      html: `
        <p class="text-gray-600 mb-2">Se restaurará la inspección:</p>
        <p class="font-semibold text-gray-800">Trámite N.º ${inspection.procedureNumber}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        await restoreFromTrash(inspection.id);
        await Swal.fire({
          icon: 'success',
          title: 'Inspección restaurada',
          text: 'La inspección ha sido restaurada correctamente',
          timer: 2000,
        });
        await loadTrash();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo restaurar la inspección',
        });
      }
    }
  };

  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInspection(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
              <p className="text-sm text-gray-500">
                Inspecciones eliminadas - {trashInspections.length} elemento(s)
              </p>
            </div>
          </div>
          <Button
            onClick={loadTrash}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {loading || refreshing ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : trashInspections.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                La papelera está vacía
              </h3>
              <p className="text-gray-500">
                No hay inspecciones en la papelera
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trashInspections.map((inspection) => (
            <Card key={inspection.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      Trámite N.º {inspection.procedureNumber}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {getDependencyLabel(inspection.dependency)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Inspeccionado: {formatDate(inspection.inspectionDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewDetails(inspection)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver más
                    </Button>
                    <Button
                      onClick={() => handleRestore(inspection)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restaurar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>
                    Eliminado el: <strong className="text-gray-700">{formatDate(inspection.deletedAt)}</strong>
                  </span>
                </div>
                
                {inspection.individualRequest && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Solicitante:</strong> {inspection.individualRequest.firstName} {inspection.individualRequest.lastName1}
                  </div>
                )}
                
                {inspection.legalEntityRequest && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Empresa:</strong> {inspection.legalEntityRequest.legalName}
                  </div>
                )}
                
                {inspection.location && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Ubicación:</strong> {inspection.location.district} - {inspection.location.exactAddress}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      {showModal && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Detalles de Inspección</h2>
                  <p className="text-red-100 text-sm">Trámite N.º {selectedInspection.procedureNumber}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-red-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body del Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {/* Información General */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">Información General</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Fecha de Inspección:</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedInspection.inspectionDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dependencia:</span>
                      <p className="font-medium text-gray-900">{getDependencyLabel(selectedInspection.dependency)}</p>
                    </div>
                  </div>
                </div>

                {/* Solicitante */}
                {selectedInspection.individualRequest && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900">Solicitante (Persona Física)</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                      <div>
                        <span className="text-gray-500">Nombre:</span>
                        <p className="font-medium text-gray-900">
                          {selectedInspection.individualRequest.firstName} {selectedInspection.individualRequest.lastName1} {selectedInspection.individualRequest.lastName2}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cédula:</span>
                        <p className="font-medium text-gray-900">{selectedInspection.individualRequest.physicalId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedInspection.legalEntityRequest && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900">Solicitante (Persona Jurídica)</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                      <div>
                        <span className="text-gray-500">Razón Social:</span>
                        <p className="font-medium text-gray-900">{selectedInspection.legalEntityRequest.legalName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cédula Jurídica:</span>
                        <p className="font-medium text-gray-900">{selectedInspection.legalEntityRequest.legalId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {selectedInspection.location && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900">Ubicación</h3>
                    <div className="text-sm bg-blue-50 p-4 rounded-lg">
                      <div className="mb-2">
                        <span className="text-gray-500">Distrito:</span>
                        <p className="font-medium text-gray-900">{selectedInspection.location.district}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dirección Exacta:</span>
                        <p className="font-medium text-gray-900">{selectedInspection.location.exactAddress}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inspector */}
                {selectedInspection.inspectors && selectedInspection.inspectors.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900">Inspector(es)</h3>
                    <div className="space-y-2">
                      {selectedInspection.inspectors.map((inspector, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                          <p className="font-medium text-gray-900">
                            {inspector.firstName} {inspector.lastName1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información de Eliminación */}
                <div className="border-t pt-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">Estado de Eliminación</h3>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p><strong>Eliminado el:</strong> {formatDate(selectedInspection.deletedAt)}</p>
                      <p className="mt-1"><strong>Estado:</strong> En Papelera</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
              <Button
                onClick={() => {
                  closeModal();
                  handleRestore(selectedInspection);
                }}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Restaurar
              </Button>
              <Button
                onClick={closeModal}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
