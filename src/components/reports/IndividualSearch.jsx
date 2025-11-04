// src/components/reports/IndividualSearch.jsx
import { useState } from 'react';
import { Search, FileSpreadsheet, FileText, User, Building, MapPin, Calendar, AlertCircle, Landmark, Waves } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function IndividualSearch({ onSearch, onExportCSV, onExportPDF, onExportCSVById, onExportPDFById, loading, inspection, inspections }) {
  const [procedureNumber, setProcedureNumber] = useState('');
  const [searchedProcedureNumber, setSearchedProcedureNumber] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);

  const handleSearch = () => {
    if (procedureNumber.trim()) {
      setSearchedProcedureNumber(procedureNumber.trim());
      setSelectedInspection(null); // Limpiar selección previa
      onSearch(procedureNumber.trim());
    }
  };

  const handleSelectInspection = (insp) => {
    setSelectedInspection(insp);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
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
    <div className="space-y-6">
      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Búsqueda Individual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ingrese el número de trámite..."
              value={procedureNumber}
              onChange={(e) => setProcedureNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !procedureNumber.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ingrese el número de trámite completo para buscar la inspección
          </p>
        </CardContent>
      </Card>

      {/* Selector de Múltiples Inspecciones */}
      {inspections && inspections.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Se encontraron {inspections.length} inspecciones con el número "{searchedProcedureNumber}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Seleccione la inspección que desea visualizar:
            </p>
            {/* Contenedor con scroll - máximo 5 inspecciones visibles */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
              {inspections.map((insp) => (
                <button
                  key={insp.id}
                  onClick={() => handleSelectInspection(insp)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedInspection?.id === insp.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        ID: {insp.id} - {insp.status}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 Fecha: {formatDate(insp.inspectionDate)}</p>
                        <p>👤 Solicitante: {insp.applicantType || 'N/A'}</p>
                        <p>📍 Creada: {formatDate(insp.createdAt)}</p>
                      </div>
                    </div>
                    {selectedInspection?.id === insp.id && (
                      <div className="ml-4 bg-blue-500 text-white rounded-full p-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {/* Indicador de scroll si hay más de 5 inspecciones */}
            {inspections.length > 5 && (
              <p className="text-xs text-orange-600 mt-3 text-center">
                ↕️ Desplace hacia abajo para ver las {inspections.length - 5} inspecciones restantes
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado de la Búsqueda */}
      {(selectedInspection || inspection) && (() => {
        const insp = selectedInspection || inspection;
        console.log('=== INSPECTION DATA ===', insp);
        
        return (
          <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Inspección #{insp.id} - Trámite {insp.procedureNumber || insp.procedure_number || 'Sin número'}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  insp.status === 'Nuevo' ? 'bg-green-100 text-green-800' :
                  insp.status === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                  insp.status === 'Revisado' ? 'bg-yellow-100 text-yellow-800' :
                  insp.status === 'Archivado' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insp.status}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getDependencyLabel(insp.dependency)}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Información General
                  </h4>
                  <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-gray-500">Fecha de Inspección:</span>
                      <p className="font-medium text-gray-900">{formatDate(insp.inspectionDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo de Solicitante:</span>
                      <p className="font-medium text-gray-900">{insp.applicantType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Inspector */}
                {insp.inspectors && insp.inspectors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      Inspector(es)
                    </h4>
                    <div className="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                      {insp.inspectors.map((inspector, idx) => (
                        <div key={idx}>
                          <p className="font-medium text-gray-900">
                            {inspector.firstName} {inspector.lastName1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solicitante Individual */}
                {insp.individualRequest && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-600" />
                      Solicitante (Persona Física)
                    </h4>
                    <div className="text-sm space-y-2 bg-orange-50 p-4 rounded-lg">
                      <div>
                        <span className="text-gray-500">Nombre Completo:</span>
                        <p className="font-medium text-gray-900">
                          {insp.individualRequest.firstName} {insp.individualRequest.lastName1} {insp.individualRequest.lastName2 || ''}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cédula:</span>
                        <p className="font-medium text-gray-900">{insp.individualRequest.physicalId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solicitante Jurídico */}
                {insp.legalEntityRequest && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4 text-orange-600" />
                      Solicitante (Persona Jurídica)
                    </h4>
                    <div className="text-sm space-y-2 bg-orange-50 p-4 rounded-lg">
                      <div>
                        <span className="text-gray-500">Razón Social:</span>
                        <p className="font-medium text-gray-900">{insp.legalEntityRequest.legalName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cédula Jurídica:</span>
                        <p className="font-medium text-gray-900">{insp.legalEntityRequest.legalId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {insp.location && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Ubicación
                    </h4>
                    <div className="text-sm space-y-2 bg-red-50 p-4 rounded-lg">
                      <div>
                        <span className="text-gray-500">Distrito:</span>
                        <p className="font-medium text-gray-900">{insp.location.district}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dirección Exacta:</span>
                        <p className="font-medium text-gray-900">{insp.location.exactAddress}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Datos Adicionales - Previsualización */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-gray-900">Datos Adicionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Construcción */}
                    {insp.construction && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          Construcción
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          {insp.construction.procedure && (
                            <p>• <span className="font-medium">Procedimiento:</span> {insp.construction.procedure}</p>
                          )}
                          {insp.construction.data && Object.keys(insp.construction.data).length > 0 && (
                            <p>• <span className="font-medium">Datos:</span> {Object.keys(insp.construction.data).length} campos</p>
                          )}
                          {insp.construction.photos && insp.construction.photos.length > 0 && (
                            <p>• <span className="font-medium">Fotos:</span> {insp.construction.photos.length}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Uso de Suelo */}
                    {insp.landUse && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Uso de Suelo
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Uso:</span> {insp.landUse.requestedUse}</p>
                          <p>• <span className="font-medium">Coincide:</span> {insp.landUse.matchesLocation ? 'Sí' : 'No'}</p>
                          <p>• <span className="font-medium">Recomendado:</span> {insp.landUse.isRecommended ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                    )}

                    {/* Antigüedad */}
                    {insp.antiquity && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Antigüedad
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Finca:</span> {insp.antiquity.propertyNumber}</p>
                          <p>• <span className="font-medium">Estimada:</span> {insp.antiquity.estimatedAntiquity}</p>
                          {insp.antiquity.photos && insp.antiquity.photos.length > 0 && (
                            <p>• <span className="font-medium">Fotos:</span> {insp.antiquity.photos.length}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Anulación PC */}
                    {insp.pcCancellation && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Anulación PC
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Contrato:</span> {insp.pcCancellation.contractNumber}</p>
                          <p>• <span className="font-medium">PC:</span> {insp.pcCancellation.pcNumber}</p>
                          <p>• <span className="font-medium">Construido:</span> {insp.pcCancellation.built ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                    )}

                    {/* Inspección General */}
                    {insp.generalInspection && (
                      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
                          <Search className="w-4 h-4" />
                          Inspección General
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Finca:</span> {insp.generalInspection.propertyNumber}</p>
                          {insp.generalInspection.observations && (
                            <p className="line-clamp-2">• <span className="font-medium">Obs:</span> {insp.generalInspection.observations}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recibido de Obra */}
                    {insp.workReceipt && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Recibido de Obra
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Fecha:</span> {formatDate(insp.workReceipt.visitDate)}</p>
                          <p>• <span className="font-medium">Estado:</span> {insp.workReceipt.state}</p>
                        </div>
                      </div>
                    )}

                    {/* Alcaldía */}
                    {insp.mayorOffice && (
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <Landmark className="w-4 h-4" />
                          Alcaldía
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Tipo:</span> {insp.mayorOffice.procedureType}</p>
                          {insp.mayorOffice.observations && (
                            <p className="line-clamp-2">• <span className="font-medium">Obs:</span> {insp.mayorOffice.observations}</p>
                          )}
                          {insp.mayorOffice.photos && insp.mayorOffice.photos.length > 0 && (
                            <p>• <span className="font-medium">Fotos:</span> {insp.mayorOffice.photos.length}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ZMT (Zona Marítima) */}
                    {insp.concession && (
                      <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-cyan-700 mb-2 flex items-center gap-1">
                          <Waves className="w-4 h-4" />
                          Zona Marítima
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>• <span className="font-medium">Expediente:</span> {insp.concession.fileNumber}</p>
                          <p>• <span className="font-medium">Tipo:</span> {insp.concession.concessionType}</p>
                          {insp.concession.parcels && insp.concession.parcels.length > 0 && (
                            <p>• <span className="font-medium">Parcelas:</span> {insp.concession.parcels.length}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mensaje cuando no hay datos adicionales */}
                  {!insp.construction && !insp.landUse && !insp.antiquity && 
                   !insp.pcCancellation && !insp.generalInspection && !insp.workReceipt && 
                   !insp.mayorOffice && !insp.concession && (
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No hay datos adicionales para esta inspección</p>
                      </div>
                      
                      {/* Debug: Mostrar estructura completa del objeto */}
                      <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                          🔍 Ver estructura completa de datos (Debug)
                        </summary>
                        <pre className="mt-3 text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                          {JSON.stringify(inspection, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Exportación */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    console.log('=== EXPORTANDO CSV ===');
                    console.log('Inspection object:', insp);
                    console.log('Selected inspection:', selectedInspection);
                    
                    // Si hay una inspección seleccionada (de múltiples), usar su ID
                    if (selectedInspection && selectedInspection.id) {
                      console.log('Usando ID de inspección seleccionada:', selectedInspection.id);
                      onExportCSVById(selectedInspection.id);
                      return;
                    }
                    
                    // Si solo hay una inspección, usar su procedureNumber
                    const procNumber = searchedProcedureNumber || 
                                      insp.procedureNumber || 
                                      insp.procedure_number;
                    
                    console.log('Usando procedureNumber:', procNumber);
                    
                    if (!procNumber) {
                      alert('No se pudo obtener el número de trámite');
                      return;
                    }
                    
                    onExportCSV(procNumber);
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base"
                >
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Exportar CSV
                </Button>

                <Button
                  onClick={() => {
                    console.log('=== EXPORTANDO PDF ===');
                    console.log('Inspection object:', insp);
                    console.log('Selected inspection:', selectedInspection);
                    
                    // Si hay una inspección seleccionada (de múltiples), usar su ID
                    if (selectedInspection && selectedInspection.id) {
                      console.log('Usando ID de inspección seleccionada:', selectedInspection.id);
                      onExportPDFById(selectedInspection.id);
                      return;
                    }
                    
                    // Si solo hay una inspección, usar su procedureNumber
                    const procNumber = searchedProcedureNumber || 
                                      insp.procedureNumber || 
                                      insp.procedure_number;
                    
                    console.log('Usando procedureNumber:', procNumber);
                    
                    if (!procNumber) {
                      alert('No se pudo obtener el número de trámite');
                      return;
                    }
                    
                    onExportPDF(procNumber);
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
        );
      })()}

      {/* Estado Vacío */}
      {!inspection && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Ingrese un número de trámite para buscar la inspección
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

