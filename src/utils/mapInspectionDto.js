// src/utils/mapInspectionDto.js
import { toDMY, nullIfEmpty, cleanEmpty } from "@/utils/date-helpers";

function normalizeApplicantType(applicantType) {
  if (!applicantType) return "Anonimo";
  const raw = String(applicantType).trim();
  const upper = raw.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();

  switch (upper) {
    case "FISICA":
    case "PERSONA FISICA":
      return "Persona Física";
    case "JURIDICA":
    case "PERSONA JURIDICA":
      return "Persona Jurídica";
    case "ANONIMO":
    default:
      return "Anonimo";
  }
}

function extractInspectorIds(userIds = []) {
  return userIds
    .map((v) => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v))
    .filter((v) => Number.isFinite(v))
    .map((v) => Number(v));
}



export function mapInspectionDto(values = {}) {
  const {
    inspectionDate,
    procedureNumber,
    inspectorIds = [],
    applicantType,
    individualRequest,
    legalEntityRequest,
    location,
    dependency,
    mayorOffice,
    constructions,
    zmtConcession,
    servicePlatform,
    collection,
    workClosure,
  } = values;

  const applicant = normalizeApplicantType(applicantType);
  const normalizedInspectorIds = extractInspectorIds(inspectorIds);

  const dto = {
    inspectionDate: inspectionDate, // Send as-is, let backend handle the transformation
    procedureNumber: nullIfEmpty(procedureNumber),
    applicantType: applicant,
  };

  // Solo agregar dependency si tiene un valor válido
  if (dependency && dependency.trim() !== '') {
    dto.dependency = dependency;
  }

  if (normalizedInspectorIds.length) dto.inspectorIds = normalizedInspectorIds;
  
  // Location
  if (location && location.district && location.exactAddress) {
    dto.location = {
      district: location.district,
      exactAddress: nullIfEmpty(location.exactAddress),
    };
  }

  // Solicitante
  if (applicant === "Persona Física" && individualRequest) {
    dto.individualRequest = {
      firstName: nullIfEmpty(individualRequest.firstName),
      lastName1: nullIfEmpty(individualRequest.lastName1),
      lastName2: nullIfEmpty(individualRequest.lastName2),
      physicalId: nullIfEmpty(individualRequest.physicalId),
    };
  } else if (applicant === "Persona Jurídica" && legalEntityRequest) {
    dto.legalEntityRequest = {
      legalName: nullIfEmpty(legalEntityRequest.legalName),
      legalId: nullIfEmpty(legalEntityRequest.legalId),
    };
  }

  // Mayor Office
  if (dependency === "MayorOffice" && mayorOffice) {
    dto.mayorOffice = {
      procedureType: nullIfEmpty(mayorOffice.procedureType),
      observations: nullIfEmpty(mayorOffice.observations),
    };
  }

  // Constructions - map to specific DTO fields based on procedure type
  if (dependency === "Constructions" && constructions) {
    const { procedure, data } = constructions;
    
    if (procedure === "UsoSuelo" && data) {
      dto.landUse = {
        requestedUse: nullIfEmpty(data.landUseRequested),
        matchesLocation: data.landUseMatches,
        isRecommended: data.landUseRecommended,
        observations: nullIfEmpty(data.observations),
      };
    }
    
    if (procedure === "Antiguedad" && data) {
      dto.antiquity = {
        propertyNumber: nullIfEmpty(data.propertyNumber),
        estimatedAntiquity: nullIfEmpty(data.estimatedAge),
      };
    }
    
    if (procedure === "AnulacionPC" && data) {
      dto.pcCancellation = {
        contractNumber: nullIfEmpty(data.contractNumber),
        pcNumber: nullIfEmpty(data.pcNumber),
        wasBuilt: data.built, // Backend espera 'wasBuilt' no 'built'
        observations: nullIfEmpty(data.observations),
      };
    }
    
    if (procedure === "InspeccionGeneral" && data) {
      dto.generalInspection = {
        propertyNumber: nullIfEmpty(data.propertyNumber),
        observations: nullIfEmpty(data.observations),
      };
    }
    
    if (procedure === "RecibidoObra" && data) {
      dto.workReceipt = {
        visitDate: data.visitedAt,
        state: data.status,
      };
    }
  }

  // Maritime Zone Concession
  if (dependency === "MaritimeZone" && zmtConcession) {
    console.log('🏝️ Processing ZMT Concession:', zmtConcession);
    
    // Map parcels PRIMERO
    let mappedParcels = [];
    if (zmtConcession.parcels && zmtConcession.parcels.length > 0) {
      console.log('🗺️ Mapping ZMT parcels:', zmtConcession.parcels);
      
      mappedParcels = zmtConcession.parcels.map((p, index) => {
        console.log(`📍 Parcel ${index + 1}:`, p);
        
        // Normalizar booleanos (pueden venir como string "si"/"no" o boolean true/false)
        const normalizeBoolean = (value) => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') return value.toLowerCase() === 'si' || value.toLowerCase() === 'true';
          return false;
        };
        
        // Normalizar fenceTypes (puede venir como array o string separado por comas)
        const normalizeFenceTypes = (value) => {
          if (Array.isArray(value)) return value.filter(Boolean);
          if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
          return [];
        };
        
        const mappedParcel = {
          // Campos obligatorios - NO pueden ser null
          planType: p.planType || "",
          planNumber: p.planNumber || "",
          area: p.area ? String(p.area) : "0", // Backend espera string
          mojonType: p.mojonType || "Físico",
          planComplies: normalizeBoolean(p.planComplies),
          respectsBoundary: normalizeBoolean(p.respectsBoundary),
          anchorageMojones: p.anchorageMojones || "",
          topography: p.topography || "",
          fencesInvadePublic: normalizeBoolean(p.fencesInvadePublic),
          roadHasPublicAccess: normalizeBoolean(p.roadHasPublicAccess),
          roadMatchesPlan: normalizeBoolean(p.roadMatchesPlan),
          
          // Campos opcionales - pueden ser null
          topographyOther: nullIfEmpty(p.topographyOther),
          fenceTypes: normalizeFenceTypes(p.fenceTypes),
          roadDescription: nullIfEmpty(p.roadDescription),
          roadLimitations: nullIfEmpty(p.roadLimitations),
          rightOfWayWidth: nullIfEmpty(p.rightOfWayWidth),
        };
        
        console.log(`✅ Mapped parcel ${index + 1}:`, mappedParcel);
        return mappedParcel;
      });
      
      console.log(`📦 Total parcels mapped: ${mappedParcels.length}`);
    } else {
      console.warn('⚠️ No parcels found in zmtConcession or parcels array is empty');
    }
    
    // Crear concession SIN parcels (el backend los espera por separado en la creación)
    dto.concession = {
      fileNumber: nullIfEmpty(zmtConcession.fileNumber),
      concessionType: nullIfEmpty(zmtConcession.concessionType),
      grantedAt: zmtConcession.grantedAt,
      expiresAt: zmtConcession.expiresAt || null,
      observations: zmtConcession.observations || "", // Backend requires string, not null
    };
    
    // Enviar parcels como array separado (aunque el backend los devuelva dentro de concession)
    if (mappedParcels.length > 0) {
      dto.concessionParcels = mappedParcels;
    }
    
    console.log('✅ Final concession DTO (without parcels):', JSON.stringify(dto.concession, null, 2));
    console.log('✅ Parcels as separate array:', JSON.stringify(dto.concessionParcels, null, 2));
    console.log('✅ Parcels count:', mappedParcels.length);
  }

  // Service Platform
  if (dependency === "ServicePlatform" && values.servicePlatform) {
    const sp = values.servicePlatform;
    dto.servicePlatform = {
      procedureNumber: sp.procedureNumber || "",
      observation: nullIfEmpty(sp.observation),
    };
  }

  // Collections
  if (dependency === "Collections" && values.collection) {
    const col = values.collection;
    dto.collection = {
      notifierSignatureUrl: nullIfEmpty(col.notifierSignatureUrl),
      nobodyPresent: col.nobodyPresent || null,
      wrongAddress: col.wrongAddress || null,
      movedAddress: col.movedAddress || null,
      refusedToSign: col.refusedToSign || null,
      notLocated: col.notLocated || null,
      other: nullIfEmpty(col.other),
    };
  }

  // Work Closure
  if (dependency === "WorkClosure" && values.workClosure) {
    const wc = values.workClosure;
    dto.workClosure = {
      propertyNumber: nullIfEmpty(wc.propertyNumber),
      cadastralNumber: nullIfEmpty(wc.cadastralNumber),
      contractNumber: nullIfEmpty(wc.contractNumber),
      permitNumber: nullIfEmpty(wc.permitNumber),
      assessedArea: nullIfEmpty(wc.assessedArea),
      builtArea: nullIfEmpty(wc.builtArea),
      visitNumber: nullIfEmpty(wc.visitNumber),
      workReceipt: !!wc.workReceipt,
      actions: nullIfEmpty(wc.actions),
      observations: nullIfEmpty(wc.observations),
      photoUrls: wc.photoUrls || [],
    };
  }

  console.log('📦 DTO before cleanEmpty:', dto);
  const cleaned = cleanEmpty(dto);
  console.log('📦 DTO after cleanEmpty:', cleaned);
  
  return cleaned || {};
}
