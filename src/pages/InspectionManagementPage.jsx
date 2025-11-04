import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { 
  Search, 
  MapPin, 
  Clock, 
  User, 
  Building, 
  Eye, 
  FileText,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Archive,
  CheckCircle,
  Play,
  Phone,
  Mail,
  Hash,
  Image,
  ZoomIn,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Hooks
import { useInspections } from '@/hooks/useInspections';
import { formatRelativeTime } from '@/utils/date-helpers';
import { Dependency, InspectionStatus } from '@/domain/enums';

// Debug: Verificar valores del enum
console.log('InspectionStatus enum values:', InspectionStatus);

// Función para normalizar el estado desde el backend
const normalizeStatus = (status) => {
  if (!status) return InspectionStatus.NUEVO;
  
  // Mapeo de posibles valores del backend a nuestro enum
  const statusMap = {
    'Nuevo': InspectionStatus.NUEVO,
    'nuevo': InspectionStatus.NUEVO,
    'NUEVO': InspectionStatus.NUEVO,
    
    'En Proceso': InspectionStatus.EN_PROCESO,
    'En proceso': InspectionStatus.EN_PROCESO,
    'en proceso': InspectionStatus.EN_PROCESO,
    'EN_PROCESO': InspectionStatus.EN_PROCESO,
    'EnProceso': InspectionStatus.EN_PROCESO,
    
    'Revisado': InspectionStatus.REVISADO,
    'revisado': InspectionStatus.REVISADO,
    'REVISADO': InspectionStatus.REVISADO,
    'Respondido': InspectionStatus.REVISADO,
    'respondido': InspectionStatus.REVISADO,
    'RESPONDIDO': InspectionStatus.REVISADO,
    'Completado': InspectionStatus.REVISADO,
    'completado': InspectionStatus.REVISADO,
    
    'Archivado': InspectionStatus.ARCHIVADO,
    'archivado': InspectionStatus.ARCHIVADO,
    'ARCHIVADO': InspectionStatus.ARCHIVADO,
  };
  
  return statusMap[status] || status; // Si no encuentra mapeo, devuelve el original
};

// Deducir dependencia efectiva (coincidir con la usada para renderizar la tarjeta)
const getEffectiveDependencyKey = (inspection) => {
  let key = inspection?.dependency;
  if (!key || key.trim() === '') {
    if (inspection?.mayorOffice) return 'MayorOffice';
    if (inspection?.landUse || inspection?.antiquity || inspection?.pcCancellation || inspection?.generalInspection || inspection?.workReceipt) return 'Constructions';
    if (inspection?.concession) return 'MaritimeZone';
    if (inspection?.realEstate) return 'RealEstate';
    if (inspection?.collections) return 'Collections';
    if (inspection?.taxesAndLicenses) return 'TaxesAndLicenses';
    if (inspection?.servicePlatform) return 'ServicePlatform';
  }
  return key;
};

// Mapeo de estados
const statusConfig = {
  [InspectionStatus.NUEVO]: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Nuevo',
    actions: ['view', 'start', 'trash']
  },
  [InspectionStatus.EN_PROCESO]: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    label: 'En Proceso',
    actions: ['view', 'complete', 'trash']
  },
  [InspectionStatus.REVISADO]: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Revisado',
    actions: ['view', 'archive', 'trash']
  },
  [InspectionStatus.ARCHIVADO]: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    label: 'Archivado',
    actions: ['view', 'trash']
  },
  [InspectionStatus.PAPELERA]: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    label: 'Papelera',
    actions: ['view', 'restore']
  }
};

// Función helper para obtener configuración de estado con fallback
const getStatusConfig = (status) => {
  const normalizedStatus = normalizeStatus(status);
  return statusConfig[normalizedStatus] || statusConfig[InspectionStatus.NUEVO];
};

// Mapeo de colores por dependencia
const dependencyConfig = {
  'MayorOffice': {
    borderColor: '#10b981', // emerald-500
    bgColor: '#ecfdf5', // emerald-50
    badgeStyle: { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' },
    label: 'Alcaldía',
    icon: Building
  },
  'RealEstate': {
    borderColor: '#84cc16', // lime-500
    bgColor: '#f7fee7', // lime-50
    badgeStyle: { backgroundColor: '#ecfccb', color: '#365314', border: '1px solid #d9f99d' },
    label: 'Bienes Inmuebles',
    icon: Building
  },
  'Collections': {
    borderColor: '#f59e0b', // amber-500
    bgColor: '#fffbeb', // amber-50
    badgeStyle: { backgroundColor: '#fde68a', color: '#92400e', border: '1px solid #fcd34d' },
    label: 'Cobros',
    icon: FileText
  },
  'Constructions': {
    borderColor: '#3b82f6', // blue-500
    bgColor: '#eff6ff', // blue-50
    badgeStyle: { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
    label: 'Construcciones',
    icon: Building
  },
  'TaxesAndLicenses': {
    borderColor: '#ef4444', // red-500
    bgColor: '#fef2f2', // red-50
    badgeStyle: { backgroundColor: '#fecaca', color: '#991b1b', border: '1px solid #fca5a5' },
    label: 'Impuestos y Licencias',
    icon: FileText
  },
  'ServicePlatform': {
    borderColor: '#d946ef', // fuchsia-500
    bgColor: '#fdf4ff', // fuchsia-50
    badgeStyle: { backgroundColor: '#fae8ff', color: '#86198f', border: '1px solid #f5d0fe' },
    label: 'Plataforma de Servicios',
    icon: Building
  },
  'MaritimeZone': {
    borderColor: '#06b6d4', // cyan-500
    bgColor: '#ecfeff', // cyan-50
    badgeStyle: { backgroundColor: '#cffafe', color: '#155e75', border: '1px solid #a5f3fc' },
    label: 'Zona Marítima',
    icon: MapPin
  }
};

// Componente para mostrar galería de fotos
const PhotoGallery = ({ photos, title }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!photos || photos.length === 0) return null;

  const openImage = (photo) => {
    setSelectedImage(photo);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4" />
          <span className="font-medium">{title} ({photos.length})</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
              onClick={() => openImage(photo)}
            >
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 bg-gray-200 items-center justify-center">
                <Image className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 ml-1">Error al cargar</span>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all duration-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Imagen de la inspección"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 bg-gray-800 rounded-lg items-center justify-center">
              <div className="text-center text-white">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Error al cargar la imagen</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente del modal de detalles
const InspectionDetailModal = ({ inspection, isOpen, onClose, onStatusChange, onMoveToTrash }) => {
  if (!isOpen || !inspection) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No especificada';
    
    try {
      let date;
      
      // Si es solo una fecha (YYYY-MM-DD), agregar la zona horaria para evitar problemas
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr + 'T00:00:00');
      } else {
        date = new Date(dateStr);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      
      // Si el string original incluye hora (T o :), mostrar fecha y hora
      if (dateStr.includes('T') || dateStr.includes(':')) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Solo fecha
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'dateStr:', dateStr);
      return dateStr;
    }
  };

  const DependencyIcon = dependencyConfig[inspection.dependency]?.icon || Building;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Inspección #{inspection.procedureNumber}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Fecha de Inspección</label>
              <p className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-4 h-4" />
                {formatDate(inspection.inspectionDate)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <div className="mt-1">
                <Badge className={getStatusConfig(inspection.status).color}>
                  {getStatusConfig(inspection.status).label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          {inspection.location && (
            <div>
              <label className="text-sm font-medium text-gray-500">Ubicación</label>
              <div className="flex items-start gap-2 text-gray-900">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">{inspection.location.district}</p>
                  <p className="text-sm text-gray-600">{inspection.location.exactAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dependencia */}
          {inspection.dependency && (
            <div>
              <label className="text-sm font-medium text-gray-500">Dependencia</label>
              <div className="flex items-center gap-2 text-gray-900">
                <DependencyIcon className="w-4 h-4" />
                {dependencyConfig[inspection.dependency]?.label || inspection.dependency}
              </div>
            </div>
          )}

          {/* Inspectores */}
          {inspection.inspectors && inspection.inspectors.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Inspectores Asignados</label>
              <div className="space-y-3">
                {inspection.inspectors.map((inspector) => (
                  <div key={inspector.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {inspector.firstName} {inspector.lastName} {inspector.secondLastName}
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {inspector.role}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {inspector.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{inspector.email}</span>
                        </div>
                      )}
                      {inspector.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{inspector.phone}</span>
                        </div>
                      )}
                      {inspector.cedula && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          <span>Cédula: {inspector.cedula}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de solicitante */}
          {inspection.applicantType && (
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Solicitante</label>
              <p className="text-gray-900">{inspection.applicantType}</p>
            </div>
          )}

          {/* Datos del solicitante - Persona Física */}
          {inspection.individualRequest && (
            <div>
              <label className="text-sm font-medium text-gray-500">Datos del Solicitante (Persona Física)</label>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Nombre:</span> {inspection.individualRequest.firstName}</p>
                <p><span className="font-medium">Primer Apellido:</span> {inspection.individualRequest.lastName1}</p>
                <p><span className="font-medium">Segundo Apellido:</span> {inspection.individualRequest.lastName2}</p>
                <p><span className="font-medium">Cédula:</span> {inspection.individualRequest.physicalId}</p>
              </div>
            </div>
          )}

          {/* Datos del solicitante - Persona Jurídica */}
          {inspection.legalEntityRequest && (
            <div>
              <label className="text-sm font-medium text-gray-500">Datos del Solicitante (Persona Jurídica)</label>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Razón Social:</span> {inspection.legalEntityRequest.legalName}</p>
                <p><span className="font-medium">Cédula Jurídica:</span> {inspection.legalEntityRequest.legalId}</p>
              </div>
            </div>
          )}

          {/* Detalles específicos de la dependencia */}
          {inspection.mayorOffice && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Alcaldía</label>
              <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Tipo de trámite:</span> {inspection.mayorOffice.procedureType}</p>
                {inspection.mayorOffice.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.mayorOffice.observations}</p>
                )}
                
                {/* Fotos de alcaldía */}
                {inspection.mayorOffice.photos && inspection.mayorOffice.photos.length > 0 && (
                  <PhotoGallery photos={inspection.mayorOffice.photos} title="Fotos del trámite" />
                )}
              </div>
            </div>
          )}

          {/* Construcciones */}
          {inspection.construction && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Construcciones</label>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                {inspection.construction.procedure && (
                  <p><span className="font-medium">Procedimiento:</span> {inspection.construction.procedure}</p>
                )}
                {inspection.construction.data && Object.keys(inspection.construction.data).length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Datos específicos:</span>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(inspection.construction.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Fotos de construcción */}
                {inspection.construction.photos && inspection.construction.photos.length > 0 && (
                  <PhotoGallery photos={inspection.construction.photos} title="Fotos de la construcción" />
                )}
              </div>
            </div>
          )}

          {/* Uso de Suelo */}
          {inspection.landUse && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Uso de Suelo</label>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Uso solicitado:</span> {inspection.landUse.requestedUse}</p>
                <p><span className="font-medium">Concuerda con ubicación:</span> {inspection.landUse.matchesLocation ? 'Sí' : 'No'}</p>
                <p><span className="font-medium">Recomendado:</span> {inspection.landUse.isRecommended ? 'Sí' : 'No'}</p>
                {inspection.landUse.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.landUse.observations}</p>
                )}
                
                {/* Fotos de uso de suelo */}
                {inspection.landUse.photos && inspection.landUse.photos.length > 0 && (
                  <PhotoGallery photos={inspection.landUse.photos} title="Fotos del uso de suelo" />
                )}
              </div>
            </div>
          )}

          {/* Antigüedad */}
          {inspection.antiquity && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Antigüedad</label>
              <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Número de Finca:</span> {inspection.antiquity.propertyNumber}</p>
                <p><span className="font-medium">Antigüedad Estimada:</span> {inspection.antiquity.estimatedAntiquity}</p>
                
                {/* Fotos de antigüedad */}
                {inspection.antiquity.photos && inspection.antiquity.photos.length > 0 && (
                  <PhotoGallery photos={inspection.antiquity.photos} title="Fotos de la propiedad" />
                )}
              </div>
            </div>
          )}

          {/* Anulación PC */}
          {inspection.pcCancellation && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Anulación PC</label>
              <div className="bg-red-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Número de Contrato:</span> {inspection.pcCancellation.contractNumber}</p>
                <p><span className="font-medium">Número PC:</span> {inspection.pcCancellation.pcNumber}</p>
                <p><span className="font-medium">Construido:</span> {inspection.pcCancellation.built ? 'Sí' : 'No'}</p>
                {inspection.pcCancellation.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.pcCancellation.observations}</p>
                )}
                
                {/* Fotos de anulación PC */}
                {inspection.pcCancellation.photos && inspection.pcCancellation.photos.length > 0 && (
                  <PhotoGallery photos={inspection.pcCancellation.photos} title="Fotos de la anulación PC" />
                )}
              </div>
            </div>
          )}

          {/* Inspección General */}
          {inspection.generalInspection && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Inspección General</label>
              <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Número de Finca:</span> {inspection.generalInspection.propertyNumber}</p>
                {inspection.generalInspection.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.generalInspection.observations}</p>
                )}
                
                {/* Fotos de inspección general */}
                {inspection.generalInspection.photos && inspection.generalInspection.photos.length > 0 && (
                  <PhotoGallery photos={inspection.generalInspection.photos} title="Fotos de la inspección" />
                )}
              </div>
            </div>
          )}

          {/* Recibido de Obra */}
          {inspection.workReceipt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Recibido de Obra</label>
              <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Fecha de Visita:</span> {formatDate(inspection.workReceipt.visitDate)}</p>
                <p><span className="font-medium">Estado:</span> {inspection.workReceipt.state}</p>
                
                {/* Fotos del recibido de obra */}
                {inspection.workReceipt.photos && inspection.workReceipt.photos.length > 0 && (
                  <PhotoGallery photos={inspection.workReceipt.photos} title="Fotos del recibido de obra" />
                )}
              </div>
            </div>
          )}

          {/* Concesión ZMT */}
          {inspection.concession && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Zona Marítima Terrestre</label>
              <div className="bg-cyan-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p><span className="font-medium">Número de Expediente:</span> {inspection.concession.fileNumber}</p>
                  <p><span className="font-medium">Tipo de Concesión:</span> {inspection.concession.concessionType}</p>
                  <p><span className="font-medium">Fecha de Otorgamiento:</span> {formatDate(inspection.concession.grantedAt)}</p>
                  {inspection.concession.expiresAt && (
                    <p><span className="font-medium">Fecha de Vencimiento:</span> {formatDate(inspection.concession.expiresAt)}</p>
                  )}
                </div>
                {inspection.concession.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.concession.observations}</p>
                )}
                
                {/* Fotos de la concesión */}
                {inspection.concession.photos && inspection.concession.photos.length > 0 && (
                  <PhotoGallery photos={inspection.concession.photos} title="Fotos de la concesión" />
                )}
                
                {inspection.concession.parcels && inspection.concession.parcels.length > 0 && (
                  <div>
                    <span className="font-medium">Parcelas ({inspection.concession.parcels.length}):</span>
                    <div className="mt-2 space-y-4">
                      {inspection.concession.parcels.map((parcel, index) => (
                        <div key={index} className="bg-white p-4 rounded border">
                          <p className="font-medium text-sm mb-3 text-cyan-700">Parcela #{index + 1}</p>
                          
                          {/* Sección 1: Datos del Plano */}
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Datos del Plano y Mojones</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {parcel.planType && <p><span className="font-medium">Tipo de Plano:</span> {parcel.planType}</p>}
                              {parcel.planNumber && <p><span className="font-medium">Número de Plano:</span> {parcel.planNumber}</p>}
                              {parcel.area && <p><span className="font-medium">Área:</span> {parcel.area} m²</p>}
                              {parcel.mojonType && <p><span className="font-medium">Tipo de Mojón:</span> {parcel.mojonType}</p>}
                              <p><span className="font-medium">¿Plano cumple?</span> {parcel.planComplies ? 'Sí' : 'No'}</p>
                              <p><span className="font-medium">¿Respeta linderos?</span> {parcel.respectsBoundary ? 'Sí' : 'No'}</p>
                              {parcel.anchorageMojones && <p className="col-span-2"><span className="font-medium">Anclaje de mojones:</span> {parcel.anchorageMojones}</p>}
                            </div>
                          </div>

                          {/* Sección 2: Topografía y Cercas */}
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Topografía y Cercas</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {parcel.topography && <p><span className="font-medium">Topografía:</span> {parcel.topography}</p>}
                              {parcel.topographyOther && <p><span className="font-medium">Otra topografía:</span> {parcel.topographyOther}</p>}
                              {parcel.fenceTypes && parcel.fenceTypes.length > 0 && (
                                <p className="col-span-2"><span className="font-medium">Tipos de cerca:</span> {parcel.fenceTypes.join(', ')}</p>
                              )}
                              <p><span className="font-medium">¿Cercas invaden?</span> {parcel.fencesInvadePublic ? 'Sí' : 'No'}</p>
                            </div>
                          </div>

                          {/* Sección 3: Acceso Vial */}
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-2">Acceso Vial</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <p><span className="font-medium">¿Acceso público?</span> {parcel.roadHasPublicAccess ? 'Sí' : 'No'}</p>
                              <p><span className="font-medium">¿Coincide con plano?</span> {parcel.roadMatchesPlan ? 'Sí' : 'No'}</p>
                              {parcel.roadDescription && <p className="col-span-2"><span className="font-medium">Descripción de vía:</span> {parcel.roadDescription}</p>}
                              {parcel.roadLimitations && <p className="col-span-2"><span className="font-medium">Limitaciones de vía:</span> {parcel.roadLimitations}</p>}
                              {parcel.rightOfWayWidth && <p><span className="font-medium">Ancho de servidumbre:</span> {parcel.rightOfWayWidth}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de revisión */}
          {inspection.reviewedAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Información de Revisión</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">Revisado el:</span> {formatDate(inspection.reviewedAt)}</p>
              </div>
            </div>
          )}

          {/* Fotos generales de la inspección */}
          {inspection.photos && inspection.photos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Fotos de la Inspección</label>
              <PhotoGallery photos={inspection.photos} title="Fotos generales" />
            </div>
          )}

          {/* Fechas de auditoría */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-500 block mb-2">Información del Sistema</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span><span className="font-medium">Creado:</span> {formatDate(inspection.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span><span className="font-medium">Actualizado:</span> {formatDate(inspection.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span><span className="font-medium">ID:</span> {inspection.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-2">
          {getStatusConfig(inspection.status).actions?.includes('start') && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onStatusChange(inspection.id, InspectionStatus.EN_PROCESO)}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}
          {getStatusConfig(inspection.status).actions?.includes('complete') && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onStatusChange(inspection.id, InspectionStatus.REVISADO)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completar
            </Button>
          )}
          {getStatusConfig(inspection.status).actions?.includes('archive') && (
            <Button variant="outline" onClick={() => onStatusChange(inspection.id, InspectionStatus.ARCHIVADO)}>
              <Archive className="w-4 h-4 mr-2" />
              Archivar
            </Button>
          )}
          {getStatusConfig(inspection.status).actions?.includes('trash') && (
            <Button variant="destructive" onClick={() => onMoveToTrash(inspection.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Mover a Papelera
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal
export default function InspectionManagementPage() {
  const { inspections, loading, error, fetchInspections, updateInspectionStatus, moveToTrash } = useInspections({ 
    autoFetch: true,
    initialParams: {}
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dependencyFilter, setDependencyFilter] = useState('Todos');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState({}); // Para manejar el loading de botones individuales
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const Pagination = React.lazy(() => import("@/components/ui/pagination"));

  // Filtros disponibles
  const statuses = ['Todos', ...Object.values(InspectionStatus)];
  
  // Dependencias disponibles (siempre mostrar las del config + cualquier adicional de los datos)
  const availableDependencies = useMemo(() => {
    // Empezar con las dependencias del config
    const configLabels = Object.values(dependencyConfig).map(config => config.label);
    
    // Agregar dependencias adicionales de los datos reales que no estén en el config
    const additionalDeps = new Set();
    inspections.forEach(inspection => {
      if (inspection.dependency && 
          inspection.dependency.trim() !== '' && 
          !configLabels.includes(inspection.dependency) &&
          !Object.keys(dependencyConfig).includes(inspection.dependency)) {
        additionalDeps.add(inspection.dependency);
      }
    });
    
    return ['Todos', ...configLabels.sort(), ...Array.from(additionalDeps).sort()];
  }, [inspections]);

  // Filtrado de inspecciones y cálculo de métricas
  const filteredInspections = useMemo(() => {
    console.log('=== DEPENDENCY FILTER DEBUG ===');
    console.log('dependencyFilter selected:', dependencyFilter);
    console.log('📊 Total inspections:', inspections.length);
    
    if (inspections.length > 0) {
      console.log('🔍 Sample inspection dependencies:');
      inspections.slice(0, 3).forEach((insp, i) => {
        console.log(`  ${i+1}. dependency:`, {
          raw: insp.dependency,
          type: typeof insp.dependency,
          isUndefined: insp.dependency === undefined,
          isNull: insp.dependency === null,
          isEmpty: insp.dependency === '',
          stringified: JSON.stringify(insp.dependency)
        });
      });
      console.log('📋 Full first inspection:', inspections[0]);
    }
    
    return inspections.filter(inspection => {
      const matchesSearch = search === '' || 
        inspection.procedureNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.location?.exactAddress?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.location?.district?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.inspectors?.some(inspector => 
          `${inspector.firstName} ${inspector.lastName}`.toLowerCase().includes(search.toLowerCase())
        );

      // Filtro de dependencias usando dependencia efectiva
      const effectiveKey = getEffectiveDependencyKey(inspection);
      let matchesDependency = false;
      if (dependencyFilter === 'Todos') {
        matchesDependency = true;
      } else {
        // Coincidencia si seleccionan la clave directa o el nombre exacto devuelto por el backend
        if (effectiveKey === dependencyFilter || inspection.dependency === dependencyFilter) {
          matchesDependency = true;
        } else {
          // Coincidencia por label del config (por ejemplo 'Alcaldía' vs 'MayorOffice')
          const labelForEffective = dependencyConfig[effectiveKey]?.label;
          if (labelForEffective && labelForEffective === dependencyFilter) {
            matchesDependency = true;
          }
        }
      }
        
      const matchesStatus = statusFilter === 'Todos' || normalizeStatus(inspection.status) === statusFilter;
      
      const passes = matchesSearch && matchesStatus && matchesDependency;
      
      if (dependencyFilter !== 'Todos') {
        console.log(`Inspection ${inspection.procedureNumber}:`);
        console.log(`  raw dependency: "${inspection.dependency}" | effective: "${effectiveKey}"`);
        console.log(`  matchesDependency: ${matchesDependency}`);
        console.log(`  passes filter: ${passes}`);
      }
      
      return passes;
    });
  }, [inspections, search, statusFilter, dependencyFilter]);

  // Slice paginado de tarjetas
  const pageCount = Math.max(1, Math.ceil(filteredInspections.length / ITEMS_PER_PAGE));
  const pagedInspections = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredInspections.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInspections, page]);

  // Cálculo de métricas
  const metrics = useMemo(() => {
    const total = inspections.length;
    const byStatus = {
      nuevo: inspections.filter(i => normalizeStatus(i.status) === InspectionStatus.NUEVO).length,
      enProceso: inspections.filter(i => normalizeStatus(i.status) === InspectionStatus.EN_PROCESO).length,
      revisado: inspections.filter(i => normalizeStatus(i.status) === InspectionStatus.REVISADO).length,
      archivado: inspections.filter(i => normalizeStatus(i.status) === InspectionStatus.ARCHIVADO).length,
    };
    
    const criticos = inspections.filter(i => {
      const daysSinceCreated = Math.floor((new Date() - new Date(i.createdAt)) / (1000 * 60 * 60 * 24));
      return daysSinceCreated > 7 && normalizeStatus(i.status) === InspectionStatus.NUEVO;
    }).length;

    return { total, ...byStatus, criticos };
  }, [inspections]);

  // Funciones de manejo
  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (inspectionId, newStatus) => {
    // Marcar como loading
    setLoadingStates(prev => ({ ...prev, [inspectionId]: true }));
    
    console.log('handleStatusChange called with:', { inspectionId, newStatus, statusType: typeof newStatus });
    
    try {
      await updateInspectionStatus(inspectionId, newStatus);
      
      // Cerrar el modal después de actualizar el estado
      setIsModalOpen(false);
      setSelectedInspection(null);
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: `Estado cambiado a "${newStatus}" correctamente.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      // El estado se actualizará automáticamente por el hook useInspections
    } catch (error) {
      console.error('Error updating inspection status:', error);
      
      // Mostrar mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo actualizar el estado de la inspección.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      // Remover el estado de loading
      setLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[inspectionId];
        return newStates;
      });
    }
  };

  const handleMoveToTrash = async (inspectionId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas mover esta inspección a la papelera?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, mover a papelera',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setLoadingStates(prev => ({ ...prev, [inspectionId]: true }));
      
      try {
        await moveToTrash(inspectionId);
        setIsModalOpen(false);
        setSelectedInspection(null);
        Swal.fire({
          title: '¡Movido!',
          text: 'La inspección ha sido movida a la papelera correctamente.',
          icon: 'success',
          confirmButtonColor: '#16a34a'
        });
      } catch (error) {
        console.error('Error moving to trash:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo mover la inspección a la papelera.',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      } finally {
        setLoadingStates(prev => {
          const newStates = { ...prev };
          delete newStates[inspectionId];
          return newStates;
        });
      }
    }
  };



  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <p className="text-red-600">Error al cargar las inspecciones: {error.message}</p>
          <Button onClick={fetchInspections} className="mt-4">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inspecciones</h1>
          <p className="text-gray-600 mt-1">Panel de control para administrar trámites de inspección</p>
        </div>

        {/* Filtros Modernos */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 ring-1 ring-gray-200/70 overflow-hidden">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          {/* Header de Filtros */}
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Barra de búsqueda mejorada */}
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar trámites por número, dirección, inspector..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 pr-4 py-3 w-full border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Filtro de Dependencias mejorado */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>Dependencia:</span>
                </div>
                <select
                  value={dependencyFilter}
                  onChange={(e) => setDependencyFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium min-w-[200px] shadow-sm"
                >
                  {availableDependencies.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep === 'Todos' ? 'Todas las dependencias' : dep}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs de Estado Mejorados */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filtrar por Estado</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setStatusFilter('Todos');
                }}
                className={`group relative px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  statusFilter === 'Todos'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    statusFilter === 'Todos'
                      ? 'bg-white/20' 
                      : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <BarChart3 className={`w-4 h-4 ${
                      statusFilter === 'Todos' ? 'text-white' : 'text-blue-600'
                    }`} />
                  </div>
                  <span>Todos</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusFilter === 'Todos'
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }`}>
                    {metrics.total}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter(InspectionStatus.NUEVO);
                }}
                className={`group relative px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  statusFilter === InspectionStatus.NUEVO
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    statusFilter === InspectionStatus.NUEVO
                      ? 'bg-white/20' 
                      : 'bg-amber-100 group-hover:bg-amber-200'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 ${
                      statusFilter === InspectionStatus.NUEVO ? 'text-white' : 'text-amber-600'
                    }`} />
                  </div>
                  <span>Pendientes</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusFilter === InspectionStatus.NUEVO
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-amber-100 group-hover:text-amber-700'
                  }`}>
                    {metrics.nuevo}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter(InspectionStatus.EN_PROCESO);
                }}
                className={`group relative px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  statusFilter === InspectionStatus.EN_PROCESO
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    statusFilter === InspectionStatus.EN_PROCESO
                      ? 'bg-white/20' 
                      : 'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <Play className={`w-4 h-4 ${
                      statusFilter === InspectionStatus.EN_PROCESO ? 'text-white' : 'text-orange-600'
                    }`} />
                  </div>
                  <span>En Proceso</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusFilter === InspectionStatus.EN_PROCESO
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700'
                  }`}>
                    {metrics.enProceso}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter(InspectionStatus.REVISADO);
                }}
                className={`group relative px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  statusFilter === InspectionStatus.REVISADO
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    statusFilter === InspectionStatus.REVISADO
                      ? 'bg-white/20' 
                      : 'bg-emerald-100 group-hover:bg-emerald-200'
                  }`}>
                    <CheckCircle className={`w-4 h-4 ${
                      statusFilter === InspectionStatus.REVISADO ? 'text-white' : 'text-emerald-600'
                    }`} />
                  </div>
                  <span>Resueltos</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusFilter === InspectionStatus.REVISADO
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}>
                    {metrics.revisado}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter(InspectionStatus.ARCHIVADO);
                }}
                className={`group relative px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                  statusFilter === InspectionStatus.ARCHIVADO
                    ? 'bg-gradient-to-r from-slate-500 to-gray-600 text-white shadow-lg shadow-slate-500/25'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    statusFilter === InspectionStatus.ARCHIVADO
                      ? 'bg-white/20' 
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}>
                    <Archive className={`w-4 h-4 ${
                      statusFilter === InspectionStatus.ARCHIVADO ? 'text-white' : 'text-slate-600'
                    }`} />
                  </div>
                  <span>Archivados</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusFilter === InspectionStatus.ARCHIVADO
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-slate-100 group-hover:text-slate-700'
                  }`}>
                    {metrics.archivado}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de inspecciones - Con más espaciado */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Trámites de Inspección
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pagedInspections.map((inspection) => {
          // Determinar la dependencia basada en los datos disponibles
          let dependencyKey = inspection.dependency;
          
          // Si no hay dependency directo, determinarlo por los campos presentes
          if (!dependencyKey) {
            if (inspection.mayorOffice) {
              dependencyKey = 'MayorOffice';
            } else if (inspection.landUse || inspection.antiquity || inspection.pcCancellation || inspection.generalInspection || inspection.workReceipt) {
              dependencyKey = 'Constructions';
            } else if (inspection.concession) {
              dependencyKey = 'MaritimeZone';
            } else if (inspection.realEstate) {
              dependencyKey = 'RealEstate';
            } else if (inspection.collections) {
              dependencyKey = 'Collections';
            } else if (inspection.taxesAndLicenses) {
              dependencyKey = 'TaxesAndLicenses';
            } else if (inspection.servicePlatform) {
              dependencyKey = 'ServicePlatform';
            }
          }
          
          const dependencyInfo = dependencyConfig[dependencyKey] || {
            borderColor: '#6b7280', // gray-500
            bgColor: '#f9fafb', // gray-50
            badgeStyle: { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
            label: dependencyKey || 'Trámite General',
            icon: Building
          };
          const DependencyIcon = dependencyInfo.icon;
          const statusInfo = getStatusConfig(inspection.status);
          
          return (
            <Card 
              key={inspection.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4"
              style={{ 
                borderLeftColor: dependencyInfo.borderColor,
                backgroundColor: dependencyInfo.bgColor
              }}
            >
              <CardContent className="p-6">
                {/* Header con título y estado */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      Trámite #{inspection.procedureNumber}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatRelativeTime(inspection.createdAt)}</span>
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Dependencia con badge colorido */}
                <div className="flex items-center gap-2 mb-3">
                  <DependencyIcon className="w-4 h-4 text-gray-600" />
                  <Badge 
                    className="text-xs font-medium border rounded-full px-2 py-1"
                    style={dependencyInfo.badgeStyle}
                  >
                    {dependencyInfo.label}
                  </Badge>
                </div>

                {/* Información del solicitante */}
                {inspection.applicant && (
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {inspection.applicant.name}
                      </p>
                      {inspection.applicant.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {inspection.applicant.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {inspection.location && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {inspection.location.district}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {inspection.location.exactAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* Detalles específicos por dependencia */}
                <div className="mb-3">
                  {inspection.mayorOffice && inspection.mayorOffice.procedureType && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {inspection.mayorOffice.procedureType}
                      </span>
                    </div>
                  )}
                  
                  {inspection.landUse && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Uso de Suelo - {inspection.landUse.requestedUse}
                      </span>
                    </div>
                  )}
                  
                  {inspection.antiquity && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Antigüedad - Finca #{inspection.antiquity.propertyNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.pcCancellation && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Anulación PC - #{inspection.pcCancellation.pcNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.generalInspection && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Inspección General - Finca #{inspection.generalInspection.propertyNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.workReceipt && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Recibido de Obra - {inspection.workReceipt.state}
                      </span>
                    </div>
                  )}
                  
                  {inspection.concession && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {inspection.concession.concessionType} - Exp. #{inspection.concession.fileNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inspectores */}
                {inspection.inspectors && inspection.inspectors.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-gray-600">
                        {inspection.inspectors.length === 1 
                          ? `${inspection.inspectors[0].firstName} ${inspection.inspectors[0].lastName}`
                          : `${inspection.inspectors.length} inspectores asignados`
                        }
                      </span>
                      {inspection.inspectors.length === 1 && inspection.inspectors[0].email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {inspection.inspectors[0].email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Acción única: Ver más */}
                <div className="flex justify-end items-center">
                  <Button
                    onClick={() => handleViewInspection(inspection)}
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-8"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver más
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estado vacío */}
      {filteredInspections.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron inspecciones</h3>
          <p className="text-gray-500">
            {search || statusFilter !== 'Todos' || dependencyFilter !== 'Todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay inspecciones registradas aún'
            }
          </p>
        </div>
      )}

      {/* Paginación */}
      {filteredInspections.length > ITEMS_PER_PAGE && (
        <div className="mt-8">
          <React.Suspense fallback={<div className="flex justify-center text-sm text-gray-500">Cargando paginación…</div>}>
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={(p) => setPage(p)}
            />
          </React.Suspense>
        </div>
      )}

      {/* Modal de detalles */}
      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInspection(null);
        }}
        onStatusChange={handleStatusChange}
        onMoveToTrash={handleMoveToTrash}
      />
        </div>
      </div>
    </div>
  );
}
