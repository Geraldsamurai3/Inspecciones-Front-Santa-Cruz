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
  } = values;

  const applicant = normalizeApplicantType(applicantType);
  const normalizedInspectorIds = extractInspectorIds(inspectorIds);

  const dto = {
    inspectionDate: inspectionDate, // Send as-is, let backend handle the transformation
    procedureNumber: nullIfEmpty(procedureNumber),
    applicantType: applicant,
    dependency: nullIfEmpty(dependency),
  };



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
      companyName: nullIfEmpty(legalEntityRequest.companyName),
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
        built: data.built,
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
    dto.concession = {
      fileNumber: nullIfEmpty(zmtConcession.fileNumber),
      concessionType: nullIfEmpty(zmtConcession.concessionType),
      grantedAt: zmtConcession.grantedAt,
      expiresAt: zmtConcession.expiresAt,
      observations: nullIfEmpty(zmtConcession.observations),
    };
    
    // Map parcels if they exist
    if (zmtConcession.parcels && zmtConcession.parcels.length > 0) {
      dto.concessionParcels = zmtConcession.parcels.map((p) => ({
        planType: nullIfEmpty(p.planType),
        planNumber: nullIfEmpty(p.planNumber),
        area: p.area ? String(p.area) : "0",
        mojonType: nullIfEmpty(p.mojonType),
        planComplies: p.planComplies === "si",
        respectsBoundary: p.respectsBoundary === "si",
        anchorageMojones: nullIfEmpty(p.anchorageMojones),
        topography: nullIfEmpty(p.topography),
        topographyOther: nullIfEmpty(p.topographyOther),
        fenceTypes: p.fenceTypes ? p.fenceTypes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        fencesInvadePublic: p.fencesInvadePublic === "si",
        roadHasPublicAccess: p.roadHasPublicAccess === "si",
        roadDescription: p.roadDescription || "",
        roadLimitations: p.roadLimitations || "",
        roadMatchesPlan: p.roadMatchesPlan === "si",
        rightOfWayWidth: p.rightOfWayWidth || "",
      }));
    }
  }

  return cleanEmpty(dto) || {};
}
