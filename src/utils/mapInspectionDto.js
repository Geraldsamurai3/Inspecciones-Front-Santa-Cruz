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
    userIds = [],
    applicantType,
    individualRequest,
    legalEntityRequest,
    district,
    exactAddress,
    dependency,
    mayorOffice,
    constructions,
    zmtConcession,
  } = values;

  const applicant = normalizeApplicantType(applicantType);
  const inspectorIds = extractInspectorIds(userIds);

  const dto = {
    inspectionDate: toDMY(inspectionDate),
    procedureNumber: nullIfEmpty(procedureNumber),
    applicantType: applicant,
    location: { district, exactAddress },
  };

  if (inspectorIds.length) dto.inspectorIds = inspectorIds;

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

  // Dependencias
  if (dependency === "MayorOffice" && mayorOffice) {
    dto.mayorOffice = {
      procedureType: nullIfEmpty(mayorOffice.procedureType),
      observations: nullIfEmpty(mayorOffice.observations),
    };
  }

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
        visitDate: toDMY(data.visitedAt),
        state: data.status,
      };
    }
  }

  if (dependency === "MaritimeZone" && zmtConcession) {
    dto.concession = {
      fileNumber: nullIfEmpty(zmtConcession.fileNumber),
      concessionType: nullIfEmpty(zmtConcession.concessionType),
      grantedAt: toDMY(zmtConcession.grantedAt),
      expiresAt: toDMY(zmtConcession.expiresAt),
      observations: nullIfEmpty(zmtConcession.observations),
      parcels: zmtConcession.parcels?.map((p) => ({
        planType: nullIfEmpty(p.planType),
        planNumber: nullIfEmpty(p.planNumber),
        area: p.area ? Number(p.area) : null,
        mojonType: nullIfEmpty(p.mojonType),
        planComplies: p.planComplies === "si",
        respectsBoundary: p.respectsBoundary === "si",
        anchorageMojones: nullIfEmpty(p.anchorageMojones),
        topography: nullIfEmpty(p.topography),
        topographyOther: nullIfEmpty(p.topographyOther),
        fenceTypes: p.fenceTypes ? p.fenceTypes.split(",").map((s) => s.trim()).filter(Boolean) : [],
        fencesInvadePublic: p.fencesInvadePublic === "si",
        roadHasPublicAccess: p.roadHasPublicAccess === "si",
        roadDescription: nullIfEmpty(p.roadDescription),
        roadLimitations: nullIfEmpty(p.roadLimitations),
        roadMatchesPlan: p.roadMatchesPlan === "si",
        rightOfWayWidth: nullIfEmpty(p.rightOfWayWidth),
      })) || [],
    };
  }

  return cleanEmpty(dto) || {};
}
