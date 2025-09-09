import React, { useState, useMemo } from 'react';
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
  History,
  XCircle,
  ClipboardCheck,
  Hammer
} from 'lucide-react';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Hooks
import { useInspections } from '@/hooks/useInspections';
import { formatRelativeTime } from '@/utils/date-helpers';
import { Dependency } from '@/domain/enums';

// Mapeo de estados
const statusConfig = {
  'Nuevo': { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Nuevo',
    actions: ['view', 'start']
  },
  'En Proceso': { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    label: 'En Proceso',
    actions: ['view', 'complete']
  },
  'Respondido': { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Completado',
    actions: ['view', 'archive']
  },
  'Archivado': { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    label: 'Archivado',
    actions: ['view']
  }
};

// Mapeo de colores por dependencia
const dependencyConfig = {
  'MayorOffice': {
    borderColor: '#8b5cf6', // purple-500
    bgColor: '#faf5ff', // purple-50
    badgeStyle: { backgroundColor: '#e9d5ff', color: '#6b21a8', border: '1px solid #d8b4fe' },
    label: 'Alcaldía',
    icon: Building
  },
  'RealEstate': {
    borderColor: '#10b981', // emerald-500
    bgColor: '#ecfdf5', // emerald-50
    badgeStyle: { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' },
    label: 'Bienes Inmuebles',
    icon: Building
  },
  'Collections': {
    borderColor: '#f97316', // orange-500
    bgColor: '#fff7ed', // orange-50
    badgeStyle: { backgroundColor: '#fed7aa', color: '#9a3412', border: '1px solid #fdba74' },
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
    borderColor: '#6366f1', // indigo-500
    bgColor: '#eef2ff', // indigo-50
    badgeStyle: { backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' },
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

// Función helper para determinar la dependencia de una inspección
const getDependencyKey = (inspection) => {
  if (inspection.dependency) return inspection.dependency;
  
  if (inspection.mayorOffice) return 'MayorOffice';
  if (inspection.landUse || inspection.antiquity || inspection.pcCancellation || inspection.generalInspection || inspection.workReceipt) return 'Constructions';
  if (inspection.concession) return 'MaritimeZone';
  if (inspection.realEstate) return 'RealEstate';
  if (inspection.collections) return 'Collections';
  if (inspection.taxesAndLicenses) return 'TaxesAndLicenses';
  if (inspection.servicePlatform) return 'ServicePlatform';
  
  return null;
};

// Componente del modal de detalles
const InspectionDetailModal = ({ inspection, isOpen, onClose, onStatusChange }) => {
  if (!isOpen || !inspection) return null;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
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
                <Badge className={statusConfig[inspection.status]?.color}>
                  {statusConfig[inspection.status]?.label || inspection.status}
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
                <p><span className="font-medium">Nombre de la Empresa:</span> {inspection.legalEntityRequest.companyName}</p>
                <p><span className="font-medium">Cédula Jurídica:</span> {inspection.legalEntityRequest.legalId}</p>
              </div>
            </div>
          )}

          {/* Detalles específicos de la dependencia */}
          {inspection.mayorOffice && (
            <div>
              <label className="text-sm font-medium text-gray-500">Detalles - Alcaldía</label>
              <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Tipo de trámite:</span> {inspection.mayorOffice.procedureType}</p>
                {inspection.mayorOffice.observations && (
                  <p><span className="font-medium">Observaciones:</span> {inspection.mayorOffice.observations}</p>
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
                {inspection.concession.parcels && inspection.concession.parcels.length > 0 && (
                  <div>
                    <span className="font-medium">Parcelas ({inspection.concession.parcels.length}):</span>
                    <div className="mt-2 space-y-2">
                      {inspection.concession.parcels.map((parcel, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <p className="font-medium text-sm">Parcela #{index + 1}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            {parcel.planType && <p><span className="font-medium">Tipo de Plano:</span> {parcel.planType}</p>}
                            {parcel.planNumber && <p><span className="font-medium">Número de Plano:</span> {parcel.planNumber}</p>}
                            {parcel.area && <p><span className="font-medium">Área:</span> {parcel.area} m²</p>}
                            {parcel.mojonType && <p><span className="font-medium">Tipo de Mojón:</span> {parcel.mojonType}</p>}
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
          {statusConfig[inspection.status]?.actions?.includes('start') && (
            <Button onClick={() => onStatusChange(inspection.id, 'En Proceso')}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}
          {statusConfig[inspection.status]?.actions?.includes('complete') && (
            <Button onClick={() => onStatusChange(inspection.id, 'Respondido')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completar
            </Button>
          )}
          {statusConfig[inspection.status]?.actions?.includes('archive') && (
            <Button variant="outline" onClick={() => onStatusChange(inspection.id, 'Archivado')}>
              <Archive className="w-4 h-4 mr-2" />
              Archivar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal
export default function InspectionManagementPage() {
  const { inspections, loading, error, fetchInspections, updateInspection } = useInspections({ 
    autoFetch: true,
    initialParams: {}
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [dependencyFilter, setDependencyFilter] = useState('Todos');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros disponibles
  const statuses = ['Todos', ...Object.keys(statusConfig)];
  const dependencies = ['Todos', ...Object.keys(dependencyConfig)];

  // Filtrado de inspecciones
  const filteredInspections = useMemo(() => {
    console.log('Filtros aplicados:', { search, statusFilter, dependencyFilter });
    console.log('Total inspecciones:', inspections.length);
    
    const filtered = inspections.filter(inspection => {
      const matchesSearch = search === '' || 
        inspection.procedureNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.location?.exactAddress?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.location?.district?.toLowerCase().includes(search.toLowerCase()) ||
        inspection.inspectors?.some(inspector => 
          `${inspector.firstName} ${inspector.lastName}`.toLowerCase().includes(search.toLowerCase())
        );

      const matchesStatus = statusFilter === 'Todos' || inspection.status === statusFilter;      
      const dependencyKey = getDependencyKey(inspection);
      const matchesDependency = dependencyFilter === 'Todos' || dependencyKey === dependencyFilter;

      const result = matchesSearch && matchesStatus && matchesDependency;
      if (!result) {
        console.log('Filtro fallido para inspección', inspection.procedureNumber, {
          matchesSearch, matchesStatus, matchesDependency,
          status: inspection.status, dependencyKey
        });
      }
      return result;
    });
    
    console.log('Inspecciones filtradas:', filtered.length);
    return filtered;
  }, [inspections, search, statusFilter, dependencyFilter]);

  // Funciones de manejo
  const handleViewInspection = (inspection) => {
    setSelectedInspection(inspection);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (inspectionId, newStatus) => {
    try {
      await updateInspection(inspectionId, { status: newStatus });
      setIsModalOpen(false);
      setSelectedInspection(null);
    } catch (error) {
      console.error('Error updating inspection status:', error);
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
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Inspecciones</h1>
        <p className="text-gray-600 mt-1">Administra los trámites de inspección recibidos</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número de trámite, dirección o inspector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'Todos' ? 'Todos los estados' : statusConfig[status]?.label || status}
                  </option>
                ))}
              </select>
              <select
                value={dependencyFilter}
                onChange={(e) => setDependencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dependencies.map(dep => (
                  <option key={dep} value={dep}>
                    {dep === 'Todos' ? 'Todas las dependencias' : dependencyConfig[dep]?.label || dep}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de inspecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInspections.map((inspection) => {
          const dependencyKey = getDependencyKey(inspection);
          
          const dependencyInfo = dependencyConfig[dependencyKey] || {
            borderColor: '#6b7280', // gray-500
            bgColor: '#f9fafb', // gray-50
            badgeStyle: { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' },
            label: dependencyKey || 'Trámite General',
            icon: Building
          };
          const DependencyIcon = dependencyInfo.icon;
          const statusInfo = statusConfig[inspection.status] || statusConfig['Nuevo'];
          
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
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Uso de Suelo - {inspection.landUse.requestedUse}
                      </span>
                    </div>
                  )}
                  
                  {inspection.antiquity && (
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Antigüedad - Finca #{inspection.antiquity.propertyNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.pcCancellation && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Anulación PC - #{inspection.pcCancellation.pcNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.generalInspection && (
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Inspección General - Finca #{inspection.generalInspection.propertyNumber}
                      </span>
                    </div>
                  )}
                  
                  {inspection.workReceipt && (
                    <div className="flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Recibido de Obra - {inspection.workReceipt.state}
                      </span>
                    </div>
                  )}
                  
                  {inspection.concession && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
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

                {/* Botón de ver detalles */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleViewInspection(inspection)}
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalles
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

      {/* Modal de detalles */}
      <InspectionDetailModal
        inspection={selectedInspection}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInspection(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
