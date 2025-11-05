import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from 'sweetalert2'; // Importa SweetAlert2

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SecurityAlert } from "@/components/ui/security-alert";

// lucide-react
import {
  User, MapPin, Building, ClipboardList, Calendar, Hash, Users as UsersIcon, Check,
  Home, Building2, Mountain, Anchor, Waves, Trees, Ship, Umbrella,
  Landmark, DollarSign, HardHat, Receipt, Monitor, MoreHorizontal,
  FileText, MessageSquare, Hammer, History, X, Search, Upload, AlertTriangle,
  Plus, Trash2, ExternalLink, ImagePlus, Ban
} from "lucide-react";

// Dominio
import { useInspections } from "@/hooks/useInspections";
import { useUsers } from "@/hooks/useUsers";
import { ApplicantType, District, Dependency, ConstructionProcedure } from "@/domain/enums";

/* ==========================================================================
   UI Data (labels/íconos)
   ==========================================================================*/
const LUCIDE = { Home, Building2, Calendar, Mountain, Anchor, Waves, Trees, Ship, Umbrella, Landmark, DollarSign, HardHat, Receipt, Monitor, MoreHorizontal, MapPin, History, X, Search, Check, Ban };

const DISTRICT_OPTIONS = [
  { key: District.SantaCruz, label: "Santa Cruz", icon: "Building2" },
  { key: District.Bolson, label: "Bolsón", icon: "Home" },
  { key: District.VeintisieteAbril, label: "27 de abril", icon: "Calendar" },
  { key: District.Tempate, label: "Tempate", icon: "Mountain" },
  { key: District.Cartagena, label: "Cartagena", icon: "Anchor" },
  { key: District.Cuajiniquil, label: "Cuajiniquil", icon: "Waves" },
  { key: District.Diria, label: "Diriá", icon: "Trees" },
  { key: District.Cabovelas, label: "Cabo Velas", icon: "Ship" },
  { key: District.Tamarindo, label: "Tamarindo", icon: "Umbrella" },
];

const DEPENDENCY_OPTIONS = [
  { key: Dependency.MayorOffice, title: "Alcaldía", icon: "Landmark" },
  { key: Dependency.RealEstate, title: "Bienes Inmuebles", icon: "Home" },
  { key: Dependency.Collections, title: "Cobros", icon: "DollarSign" },
  { key: Dependency.Constructions, title: "Construcciones", icon: "HardHat" },
  { key: Dependency.TaxesAndLicenses, title: "Rentas y Patentes", icon: "Receipt" },
  { key: Dependency.ServicePlatform, title: "Plataformas de servicios", icon: "Monitor" },
  { key: Dependency.MaritimeZone, title: "ZMT", icon: "Waves" },
  { key: Dependency.WorkClosure, title: "Clausura de Obra", icon: "Ban" },
];

const CONSTRUCTION_TRAMITES = [
  { key: ConstructionProcedure.UsoSuelo, label: "Uso de suelo", icon: "MapPin" },
  { key: ConstructionProcedure.Antiguedad, label: "Antigüedad", icon: "History" },
  { key: ConstructionProcedure.AnulacionPC, label: "Anulación de PC", icon: "X" },
  { key: ConstructionProcedure.InspeccionGeneral, label: "Inspección general", icon: "Search" },
  { key: ConstructionProcedure.RecibidoObra, label: "Recibido de obra", icon: "Check" },
];

// Simulación de usuarios del sistema (reemplazar por fetch real)
// Ahora se obtiene de la API

/* ==========================================================================
   Helpers y componentes pequeños
   ==========================================================================*/
const safeId = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE = /^image\//;
const formatFileSize = (b = 0) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const yn = (v) => v === "si";

const UrlList = ({ title, items, setItems }) => (
  <div className="space-y-2">
    <Label className="mb-1 block">{title}</Label>
    {items.map((v, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <Input value={v} onChange={(e) => { const copy = [...items]; copy[idx] = e.target.value; setItems(copy); }} placeholder="https://…" />
        <Button type="button" variant="ghost" onClick={() => { const copy = [...items]; copy.splice(idx, 1); setItems(copy.length ? copy : [""]); }}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ))}
    <Button type="button" variant="outline" onClick={() => setItems([...items, ""]) }>
      <ImagePlus className="w-4 h-4 mr-2" /> Añadir URL de foto
    </Button>
    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
      <ExternalLink className="w-3.5 h-3.5" /> Pega URLs absolutas a imágenes/planos ya alojados.
    </div>
  </div>
);

const PhotoField = ({ fieldKey, label, photos, setPhotos, photoErrors, setPhotoErrors }) => {
  const onChange = (file) => {
    if (!file) {
      setPhotos((p) => ({ ...p, [fieldKey]: null }));
      setPhotoErrors((e) => ({ ...e, [fieldKey]: null }));
      return;
    }
    
    // Validaciones de seguridad mejoradas
    if (!ALLOWED_IMAGE.test(file.type)) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "Solo se permiten imágenes (JPG/PNG/WEBP)." }));
      return;
    }
    
    // Validar nombre de archivo seguro
    if (!isFilenameSafe(file.name)) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "Nombre de archivo contiene caracteres no permitidos." }));
      return;
    }
    
    // Validar tipo de imagen permitido
    if (!isAllowedImageType(file.name)) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF." }));
      return;
    }
    
    // Validar tamaño de archivo
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "La imagen supera 10MB." }));
      return;
    }
    
    // Validar longitud del nombre de archivo
    if (file.name.length > 255) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "Nombre de archivo muy largo (máximo 255 caracteres)." }));
      return;
    }
    
    // Validar que no sea un archivo vacío
    if (file.size === 0) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "El archivo está vacío." }));
      return;
    }
    
    setPhotoErrors((e) => ({ ...e, [fieldKey]: null }));
    setPhotos((p) => ({ ...p, [fieldKey]: file }));
  };

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`photo-${fieldKey}`}
        />
        <label htmlFor={`photo-${fieldKey}`} className={`relative flex flex-col items-center justify-center w-full px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
          photos[fieldKey] ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
        } group-hover:scale-[1.02] group-hover:shadow-lg`}>
          <div className={`p-2 sm:p-3 rounded-full mb-3 sm:mb-4 transition-colors duration-300 ${
            photos[fieldKey] ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
          }`}>
            {photos[fieldKey] ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
          <span className={`text-sm font-medium transition-colors duration-300 text-center ${
            photos[fieldKey] ? "text-blue-700" : "text-slate-600 group-hover:text-blue-700"
          }`}>
            {photos[fieldKey] ? "Fotografía seleccionada" : "Seleccionar fotografía"}
          </span>
          <span className="text-xs text-slate-500 mt-1">JPG/PNG (máx. 10MB)</span>
        </label>
      </div>
      {photos[fieldKey] && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700 truncate flex-1 mr-2">{photos[fieldKey].name}</div>
            <div className="text-xs text-slate-500 flex-shrink-0">— {formatFileSize(photos[fieldKey].size)}</div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {photoErrors[fieldKey] && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {photoErrors[fieldKey]}</p>
        </div>
      )}
    </div>
  );
};

const RadioCard = ({ value, selected, children, htmlFor }) => (
  <Label htmlFor={htmlFor ?? value} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all block ${
    selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50"
  }`}>
    {children}
  </Label>
);

// Importar validaciones de seguridad
import { 
  sanitizeString, 
  validateEmail, 
  validateCedula, 
  validatePhone, 
  validateProcedureNumber,
  isSQLSafe,
  isValidLength,
  isFilenameSafe,
  isAllowedImageType
} from "@/utils/security-validators";

/* ==========================================================================
   Validaciones (Zod en JS) con Seguridad Mejorada
   ==========================================================================*/
const baseSchema = z.object({
  inspectionDate: z.string().min(1, "Requerido"),
  procedureNumber: z.string()
    .min(1, "Requerido")
    .refine((val) => validateProcedureNumber(val) !== null, "Formato de número de procedimiento inválido")
    .refine((val) => isSQLSafe(val), "Caracteres no permitidos detectados")
    .transform((val) => sanitizeString(val)),
  applicantType: z.enum(Object.values(ApplicantType)),
  // usuarios del sistema
  userIds: z.string().refine((val) => {
    try {
      const arr = JSON.parse(val || "[]");
      return arr.length > 0;
    } catch {
      return false;
    }
  }, "Seleccione al menos un usuario"),

  // solicitante - con validaciones de seguridad
  firstName: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Caracteres no permitidos o muy largo")
    .transform((val) => val ? sanitizeString(val) : val),
  lastName1: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Caracteres no permitidos o muy largo")
    .transform((val) => val ? sanitizeString(val) : val),
  lastName2: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Caracteres no permitidos o muy largo")
    .transform((val) => val ? sanitizeString(val) : val),
  physicalId: z.string()
    .optional()
    .refine((val) => !val || validateCedula(val) !== null, "Formato de cédula inválido")
    .transform((val) => val ? sanitizeString(val) : val),
  legalName: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 200)), "Caracteres no permitidos o muy largo")
    .transform((val) => val ? sanitizeString(val) : val),
  legalId: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Formato de cédula jurídica inválido")
    .transform((val) => val ? sanitizeString(val) : val),

  // ubicación - con validaciones de seguridad
  district: z.enum(Object.values(District)),
  exactAddress: z.string()
    .min(1, "Ingrese la dirección")
    .refine((val) => isSQLSafe(val) && isValidLength(val, 500), "Dirección contiene caracteres no permitidos o es muy larga")
    .transform((val) => sanitizeString(val)),

  // dependencia
  dependency: z.enum(Object.values(Dependency)).optional(),

  // constructions
  constructionProcedure: z.enum(Object.values(ConstructionProcedure)).optional(),

  // Uso de suelo - con validaciones de seguridad
  landUseRequested: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 200)), "Texto contiene caracteres no permitidos o es muy largo")
    .transform((val) => val ? sanitizeString(val) : val),
  landUseMatches: z.boolean().optional(),
  landUseRecommended: z.boolean().optional(),
  landUseObservations: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),

  // Antigüedad - con validaciones de seguridad
  antiguedadNumeroFinca: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número de finca contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  antiguedadAprox: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Antigüedad contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),

  // Anulación PC - con validaciones de seguridad
  pcNumeroContrato: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número de contrato contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  pcNumero: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número PC contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  pcConstruyo: z.boolean().optional(),
  pcObservaciones: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),

  // Inspección general - con validaciones de seguridad
  igNumeroFinca: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número de finca contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  igObservaciones: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),

  // Recibido de obra
  roFechaVisita: z.string().optional(),
  roEstado: z.enum(["terminada", "proceso", "no_iniciada"]).optional(),

  // Alcaldía - con validaciones de seguridad
  mo_procedureType: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 200)), "Tipo de procedimiento contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  mo_observations: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),
  mo_photos: z.array(z.string()).optional(),

  // ZMT Concession - con validaciones de seguridad
  zc_fileNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número de expediente contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  zc_concessionType: z.enum(["Nueva Concesión", "Renovación", "Modificación"]).optional(),
  zc_grantedAt: z.string().optional(),
  zc_expiresAt: z.string().optional().nullable(),
  zc_observations: z.string()
    .optional()
    .nullable()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),
  zc_photos: z.array(z.string()).optional(),

  // Plataformas de Servicios - con validaciones de seguridad
  ps_procedureNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 100)), "Número de trámite contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  ps_observation: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 1000)), "Observación contiene caracteres no permitidos o es muy larga")
    .transform((val) => val ? sanitizeString(val) : val),

  // Cobros (Collections) - con validaciones de seguridad
  col_notifierSignatureUrl: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 500)), "URL contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  col_nobodyPresent: z.boolean().optional(),
  col_wrongAddress: z.boolean().optional(),
  col_movedAddress: z.boolean().optional(),
  col_refusedToSign: z.boolean().optional(),
  col_notLocated: z.boolean().optional(),
  col_other: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 300)), "Texto contiene caracteres no permitidos o es muy largo")
    .transform((val) => val ? sanitizeString(val) : val),

  // Clausura de Obra (Work Closure) - con validaciones de seguridad
  wc_propertyNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Número de finca contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_cadastralNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Número de catastro contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_contractNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Número de contrato contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_permitNumber: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 50)), "Número de permiso contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_assessedArea: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 24)), "Área tasada contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_builtArea: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 24)), "Área construida contiene caracteres no permitidos")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_visitNumber: z.string().optional(),
  wc_workReceipt: z.boolean().optional(),
  wc_actions: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 500)), "Acciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_observations: z.string()
    .optional()
    .refine((val) => !val || (isSQLSafe(val) && isValidLength(val, 500)), "Observaciones contienen caracteres no permitidos o son muy largas")
    .transform((val) => val ? sanitizeString(val) : val),
  wc_photos: z.array(z.string()).optional(),
});

const formSchema = baseSchema.superRefine((val, ctx) => {
  // Reglas por tipo solicitante
  if (val.applicantType === ApplicantType.FISICA) {
    if (!val.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre requerido", path: ["firstName"] });
    if (!val.lastName1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Primer apellido requerido", path: ["lastName1"] });
    if (!val.physicalId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Identificación requerida", path: ["physicalId"] });
  }
  if (val.applicantType === ApplicantType.JURIDICA) {
    if (!val.legalName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Razón social requerida", path: ["legalName"] });
    if (!val.legalId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cédula jurídica requerida", path: ["legalId"] });
  }

  // Dependencias
  if (val.dependency === Dependency.MayorOffice) {
    if (!val.mo_procedureType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de trámite requerido", path: ["mo_procedureType"] });
  }

  if (val.dependency === Dependency.Constructions) {
    if (!val.constructionProcedure) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Seleccione tipo de trámite", path: ["constructionProcedure"] });

    if (val.constructionProcedure === ConstructionProcedure.UsoSuelo) {
      if (!val.landUseRequested) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Uso de suelo solicitado", path: ["landUseRequested"] });
      if (typeof val.landUseMatches !== "boolean") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique si concuerda la ubicación", path: ["landUseMatches"] });
      if (typeof val.landUseRecommended !== "boolean") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique si se recomienda", path: ["landUseRecommended"] });
    }

    if (val.constructionProcedure === ConstructionProcedure.Antiguedad) {
      if (!val.antiguedadNumeroFinca) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N.º de finca requerido", path: ["antiguedadNumeroFinca"] });
      if (!val.antiguedadAprox) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Antigüedad aproximada requerida", path: ["antiguedadAprox"] });
    }

    if (val.constructionProcedure === ConstructionProcedure.AnulacionPC) {
      if (!val.pcNumeroContrato) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N.º de contrato requerido", path: ["pcNumeroContrato"] });
      if (!val.pcNumero) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N.º de PC requerido", path: ["pcNumero"] });
      if (typeof val.pcConstruyo !== "boolean") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique si construyó", path: ["pcConstruyo"] });
    }

    if (val.constructionProcedure === ConstructionProcedure.InspeccionGeneral) {
      if (!val.igNumeroFinca) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N.º de finca requerido", path: ["igNumeroFinca"] });
    }

    if (val.constructionProcedure === ConstructionProcedure.RecibidoObra) {
      if (!val.roFechaVisita) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fecha de visita requerida", path: ["roFechaVisita"] });
      if (!val.roEstado) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Estado requerido", path: ["roEstado"] });
    }
  }

  if (val.dependency === Dependency.MaritimeZone) {
    if (!val.zc_fileNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "N.º de expediente requerido", path: ["zc_fileNumber"] });
    if (!val.zc_concessionType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tipo de concesión requerido", path: ["zc_concessionType"] });
    if (!val.zc_grantedAt) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fecha de otorgamiento requerida", path: ["zc_grantedAt"] });
  }

  // Validación Plataformas de Servicios
  if (val.dependency === Dependency.ServicePlatform) {
    if (!val.ps_procedureNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número de trámite requerido", path: ["ps_procedureNumber"] });
  }

  // Validación Cobros (Collections)
  if (val.dependency === Dependency.Collections) {
    // Al menos debe tener la firma del notificador O un motivo de no firma
    const hasSignature = val.col_notifierSignatureUrl && val.col_notifierSignatureUrl.trim() !== '';
    const hasReason = val.col_nobodyPresent || val.col_wrongAddress || val.col_movedAddress || 
                      val.col_refusedToSign || val.col_notLocated || 
                      (val.col_other && val.col_other.trim() !== '');
    
    if (!hasSignature && !hasReason) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Debe ingresar la firma del notificador o seleccionar un motivo de no firma", 
        path: ["col_notifierSignatureUrl"] 
      });
    }
  }

  // Validación Clausura de Obra (Work Closure)
  if (val.dependency === Dependency.WorkClosure) {
    // Al menos debe tener número de finca o número de catastro
    if (!val.wc_propertyNumber && !val.wc_cadastralNumber) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Debe ingresar número de finca o número de catastro", 
        path: ["wc_propertyNumber"] 
      });
    }
    
    // Visita es requerida
    if (!val.wc_visitNumber) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Número de visita requerido", 
        path: ["wc_visitNumber"] 
      });
    }

    // Acciones es requerido
    if (!val.wc_actions || val.wc_actions.trim() === '') {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: "Acciones requeridas", 
        path: ["wc_actions"] 
      });
    }
  }

  // Validación Rentas y Patentes
  if (val.dependency === Dependency.TaxesAndLicenses) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "La funcionalidad de Rentas y Patentes aún no está disponible. Por favor, seleccione otra dependencia.", 
      path: ["dependency"] 
    });
  }

  // Validación Bienes Inmuebles
  if (val.dependency === Dependency.RealEstate) {
    ctx.addIssue({ 
      code: z.ZodIssueCode.custom, 
      message: "La funcionalidad de Bienes Inmuebles aún no está disponible. Por favor, seleccione otra dependencia.", 
      path: ["dependency"] 
    });
  }
});

/* ==========================================================================
   Componente principal
   ==========================================================================*/
export default function InspectionForm() {
  const { createInspectionFromForm } = useInspections({ autoFetch: false });
  const { users, loading: usersLoading } = useUsers({ skipFetchOnMount: false });

  const [currentStep, setCurrentStep] = useState(1);
  const [navBusy, setNavBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 4;
  const [textareaRows, setTextareaRows] = useState(3);
  const [systemUsers, setSystemUsers] = useState([]);
  const userIdsRef = useRef();

  useEffect(() => {
    let timeoutId;
    const updateTextareaRows = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setTextareaRows(window.innerWidth >= 640 ? 4 : 3);
      }, 100); // Debounce para evitar llamadas excesivas
    };
    
    updateTextareaRows();
    window.addEventListener('resize', updateTextareaRows);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateTextareaRows);
    };
  }, []);

  // Fotos por secciones de Construcciones
  const [photos, setPhotos] = useState({
    antiguedad1: null, antiguedad2: null, antiguedad3: null,
    pc1: null, ig1: null, ro1: null,
    mo1: null, mo2: null, mo3: null,
    zmt1: null, zmt2: null, zmt3: null,
    wc1: null, wc2: null, wc3: null,
    col_signature: null,
  });
  const [photoErrors, setPhotoErrors] = useState({});

  // Helper para validar fotos requeridas según dependencia/trámite
  const getRequiredPhotoKeys = (vals) => {
    const req = [];
    if (vals.dependency === Dependency.MayorOffice) {
      req.push('mo1','mo2','mo3');
    }
    if (vals.dependency === Dependency.Constructions) {
      if (vals.constructionProcedure === ConstructionProcedure.Antiguedad) req.push('antiguedad1','antiguedad2','antiguedad3');
      if (vals.constructionProcedure === ConstructionProcedure.AnulacionPC) req.push('pc1');
      if (vals.constructionProcedure === ConstructionProcedure.InspeccionGeneral) req.push('ig1');
      if (vals.constructionProcedure === ConstructionProcedure.RecibidoObra) req.push('ro1');
    }
    if (vals.dependency === Dependency.MaritimeZone) {
      req.push('zmt1','zmt2','zmt3');
    }
    return req;
  };

  const validateRequiredPhotos = (vals) => {
    const required = getRequiredPhotoKeys(vals);
    if (!required.length) return true;
    const missing = required.filter((k) => !photos[k]);
    if (missing.length === 0) return true;
    // Marcar errores inline
    setPhotoErrors((prev) => {
      const next = { ...prev };
      missing.forEach((k) => { next[k] = 'Este campo es requerido.'; });
      return next;
    });
    // Enfocar/scroll al primero
    const first = missing[0];
    const el = document.getElementById(`photo-${first}`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  };

  // Fotos como URLs (MayorOffice, ZMT)
  // MayorOffice photos ahora usan campos de subida (mo1, mo2, mo3)
  // ZMT photos ahora usan campos de subida (zmt1, zmt2, zmt3)

  // ZMT Parcels - Multiple parcels support
  const generateParcelId = () => `parcel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const emptyParcel = { id: generateParcelId(), planType: "", planNumber: "", area: "", mojonType: "Físico", planComplies: "si", respectsBoundary: "si", anchorageMojones: "", topography: "", topographyOther: "", fenceTypes: "", fencesInvadePublic: "no", roadHasPublicAccess: "si", roadDescription: "", roadLimitations: "", roadMatchesPlan: "si", rightOfWayWidth: "" };
  const [parcels, setParcels] = useState([{ ...emptyParcel }]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { register, handleSubmit, watch, setValue, trigger, reset, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
    delayError: 300,
    shouldUnregister: false,
    defaultValues: {
      inspectionDate: today,
      procedureNumber: "",
      applicantType: ApplicantType.ANONIMO,
      userIds: "[]",

      // solicitante
      firstName: "", lastName1: "", lastName2: "", physicalId: "",
      legalName: "", legalId: "",

      // ubicación
      district: District.SantaCruz,
      exactAddress: "",

      // dependencia
      dependency: undefined,
      constructionProcedure: undefined,

      // uso de suelo
      landUseRequested: "",
      landUseMatches: undefined,
      landUseRecommended: undefined,
      landUseObservations: "",

      // antigüedad
      antiguedadNumeroFinca: "",
      antiguedadAprox: "",

      // Anulación PC
      pcNumeroContrato: "",
      pcNumero: "",
      pcConstruyo: undefined,
      pcObservaciones: "",

      // IG
      igNumeroFinca: "",
      igObservaciones: "",

      // RO
      roFechaVisita: "",
      roEstado: undefined,

      // Alcaldía
      mo_procedureType: "",
      mo_observations: "",
      mo_photos: [],

      // ZMT
      zc_fileNumber: "",
      zc_concessionType: undefined,
      zc_grantedAt: "",
      zc_expiresAt: "",
      zc_observations: "",
      zc_photos: [],

      // Plataformas de Servicios
      ps_procedureNumber: "",
      ps_observation: "",

      // Cobros (Collection)
      col_notifierSignatureUrl: "",
      col_nobodyPresent: undefined,
      col_wrongAddress: undefined,
      col_movedAddress: undefined,
      col_refusedToSign: undefined,
      col_notLocated: undefined,
      col_other: "",

      // Clausura de Obra (Work Closure)
      wc_propertyNumber: "",
      wc_cadastralNumber: "",
      wc_contractNumber: "",
      wc_permitNumber: "",
      wc_assessedArea: "",
      wc_builtArea: "",
      wc_visitNumber: undefined,
      wc_workReceipt: undefined,
      wc_actions: "",
      wc_observations: "",
      wc_photos: [],
    },
  });

  useEffect(() => {
    if (userIdsRef.current) {
      userIdsRef.current.value = watch("userIds") || "[]";
    }
  }, [watch("userIds")]);

  const dependency = watch("dependency");
  const constructionProcedure = watch("constructionProcedure");
  const applicantType = watch("applicantType");

  // Mostrar errores sólo tras intentar avanzar o si el campo fue tocado
  const [showStepErrors, setShowStepErrors] = useState({ 1: false, 2: false, 3: false, 4: false });

  // Función helper para manejar cambios en parcelas de manera segura
  const updateParcel = useCallback((parcelId, field, value) => {
    setParcels(prevParcels => 
      prevParcels.map(parcel => 
        parcel.id === parcelId 
          ? { ...parcel, [field]: value }
          : parcel
      )
    );
  }, []);

  // Función para agregar una nueva parcela
  const addParcel = useCallback(() => {
    const newParcel = { ...emptyParcel, id: generateParcelId() };
    setParcels(prevParcels => [...prevParcels, newParcel]);
  }, []);

  // Función para remover una parcela
  const removeParcel = useCallback((parcelId) => {
    setParcels(prevParcels => prevParcels.filter(parcel => parcel.id !== parcelId));
  }, []);

  useEffect(() => {
    if (!usersLoading && users.length > 0) {
      // Map all users to the expected format: { id, name, role }
      const mappedUsers = users.map(user => ({
        id: user.id?.toString() || user.id, // Handle id as string or number
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario', // Combine names or use existing name
        role: user.role || 'User', // Default role if not present
      }));
      setSystemUsers(mappedUsers);
    } else if (!usersLoading && users.length === 0) {
      // No users available
      setSystemUsers([]);
    }
  }, [users, usersLoading]);

  const validateStep = async (step) => {
    if (step === 1) return trigger(["inspectionDate", "procedureNumber", "applicantType", "userIds", ...(applicantType === ApplicantType.FISICA ? ["firstName", "lastName1", "physicalId"] : []), ...(applicantType === ApplicantType.JURIDICA ? ["legalName", "legalId"] : [])], { shouldFocus: true });
    if (step === 2) return trigger(["district", "exactAddress"], { shouldFocus: true });
    if (step === 3) return trigger(["dependency"], { shouldFocus: true });
    if (step === 4) {
      let ok = true;
      if (dependency === Dependency.MayorOffice) {
        ok = await trigger(["mo_procedureType"], { shouldFocus: true });
      } else if (dependency === Dependency.Constructions) {
        ok = await trigger(["constructionProcedure"], { shouldFocus: true });
        if (!ok) return false;
        if (constructionProcedure === ConstructionProcedure.UsoSuelo) ok = await trigger(["landUseRequested", "landUseMatches", "landUseRecommended"], { shouldFocus: true });
        if (constructionProcedure === ConstructionProcedure.Antiguedad) ok = await trigger(["antiguedadNumeroFinca", "antiguedadAprox"], { shouldFocus: true });
        if (constructionProcedure === ConstructionProcedure.AnulacionPC) ok = await trigger(["pcNumeroContrato", "pcNumero", "pcConstruyo"], { shouldFocus: true });
        if (constructionProcedure === ConstructionProcedure.InspeccionGeneral) ok = await trigger(["igNumeroFinca"], { shouldFocus: true });
        if (constructionProcedure === ConstructionProcedure.RecibidoObra) ok = await trigger(["roFechaVisita", "roEstado"], { shouldFocus: true });
      } else if (dependency === Dependency.MaritimeZone) {
        ok = await trigger(["zc_fileNumber", "zc_concessionType", "zc_grantedAt"], { shouldFocus: true });
      }
      if (!ok) return false;
      // Validar fotos requeridas para la dependencia/trámite
      const photosOk = validateRequiredPhotos(watch());
      return photosOk;
    }
    return true;
  };

  const nextStep = async () => {
    if (navBusy) return;
    setNavBusy(true);
    const ok = await validateStep(currentStep);
    if (ok) {
      setShowStepErrors((prev) => ({ ...prev, [currentStep]: false }));
      setCurrentStep((s) => Math.min(totalSteps, s + 1));
    } else {
      setShowStepErrors((prev) => ({ ...prev, [currentStep]: true }));
    }
    setNavBusy(false);
  };
  const prevStep = () => { if (navBusy) return; setCurrentStep((s) => Math.max(1, s - 1)); };

  /* ---------------------------- UI de progreso --------------------------- */
  const ProgressWizard = () => {
    const steps = [
      { icon: User, label: 'Solicitante' },
      { icon: MapPin, label: 'Ubicación' },
      { icon: Building, label: 'Dependencia' },
      { icon: ClipboardList, label: 'Detalles' },
    ];
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return (
      <div className="bg-slate-50/80 backdrop-blur px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-200">
        <div className="relative h-20">
          {/* Track */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
          {/* Progress */}
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Steps - full width */}
          <div className="relative z-10 grid grid-cols-4 h-full">
            {steps.map(({ icon: Icon, label }, idx) => {
              const step = idx + 1;
              const done = step < currentStep;
              const active = step === currentStep;
              return (
                <div key={step} className="relative">
                  {/* Circle centered on the line */}
                  <div
                    aria-current={active ? 'step' : undefined}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 shadow-sm transition-all
                    ${done ? 'bg-emerald-500 text-white ring-emerald-300 shadow-md' : ''}
                    ${active ? 'bg-blue-600 text-white ring-blue-300 shadow-lg' : ''}
                    ${!done && !active ? 'bg-white text-slate-400 ring-slate-300' : ''}`}
                  >
                    {/* Glow pulse for active step */}
                    {active && (
                      <span className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-blue-300/40 animate-ping" />
                    )}
                    <Icon className="w-4 h-4" />
                  </div>
                  {/* Label below the line */}
                  <span className="absolute left-1/2 -translate-x-1/2 top-[calc(50%+1.4rem)] text-[10px] sm:text-xs text-slate-600 font-medium select-none">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const StepHeader = ({ icon: Icon, title, subtitle, step }) => (
    <div className="flex items-start gap-3 sm:gap-4 pb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 id={`step-${step}-heading`} tabIndex={-1} className="text-lg sm:text-xl font-semibold text-slate-800">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  /* --------------------------------- Pasos --------------------------------- */
  const Step1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <StepHeader icon={User} title="Información del solicitante" subtitle="Datos básicos" step={1} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-blue-600" /> Fecha de Inspección</Label>
          <Input type="date" {...register("inspectionDate")} readOnly aria-invalid={!!errors.inspectionDate && (touchedFields.inspectionDate || showStepErrors[1])} className="w-full" />
          {errors.inspectionDate && (touchedFields.inspectionDate || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.inspectionDate.message}</p>}
        </div>
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm"><Hash className="w-4 h-4 text-blue-600" /> Número de Trámite</Label>
          <Input placeholder="INS-0001" {...register("procedureNumber")} aria-invalid={!!errors.procedureNumber && (touchedFields.procedureNumber || showStepErrors[1])} className="w-full" />
          {errors.procedureNumber && (touchedFields.procedureNumber || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.procedureNumber.message}</p>}
        </div>
      </div>

      <div>
        <Label className="mb-3 flex items-center gap-2 text-sm"><UsersIcon className="w-4 h-4 text-blue-600" /> Usuarios del sistema</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {systemUsers.length > 0 ? (
            systemUsers.map((u) => (
              <Label key={u.id} className="flex items-center gap-3 p-3 sm:p-4 border border-slate-200 rounded-lg sm:rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                <Checkbox
                  checked={(JSON.parse(watch("userIds") || "[]")).includes(u.id)}
                  onCheckedChange={(checked) => {
                    const curr = JSON.parse(watch("userIds") || "[]");
                    if (checked) {
                      const newArr = [...curr, u.id];
                      setValue("userIds", JSON.stringify(newArr), { shouldValidate: false, shouldDirty: true });
                      if (userIdsRef.current) {
                        userIdsRef.current.value = JSON.stringify(newArr);
                      }
                    } else {
                      const newArr = curr.filter(id => id !== u.id);
                      setValue("userIds", JSON.stringify(newArr), { shouldValidate: false, shouldDirty: true });
                      if (userIdsRef.current) {
                        userIdsRef.current.value = JSON.stringify(newArr);
                      }
                    }
                  }}
                  className="flex-shrink-0 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-800 text-sm sm:text-base truncate">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.role}</div>
                </div>
              </Label>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-slate-500 text-sm">
              No hay usuarios para mostrar
            </div>
          )}
        </div>
        <input type="hidden" name="userIds" ref={userIdsRef} {...register("userIds")} />
  {errors.userIds && (showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.userIds.message}</p>}

      </div>

      <div>
        <Label className="mb-3 flex items-center gap-2 text-sm"><User className="w-4 h-4 text-blue-600" /> Tipo de Solicitante</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[ApplicantType.ANONIMO, ApplicantType.FISICA, ApplicantType.JURIDICA].map((opt) => {
            const id = safeId(opt);
            return (
              <div key={opt}>
                <input
                  type="radio"
                  {...register("applicantType")}
                  value={opt}
                  id={id}
                  className="peer sr-only"
                />
                <RadioCard htmlFor={id} value={opt} selected={watch("applicantType") === opt}>
                  <div className="text-blue-700 font-semibold text-sm sm:text-base">
                    {opt === ApplicantType.ANONIMO ? "Anónimo" : opt === ApplicantType.FISICA ? "Persona Física" : "Persona Jurídica"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {opt === ApplicantType.ANONIMO ? "Sin identificación" : opt === ApplicantType.FISICA ? "Individual" : "Empresa/Organización"}
                  </div>
                </RadioCard>
              </div>
            );
          })}
        </div>
  {errors.applicantType && (touchedFields.applicantType || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.applicantType.message}</p>}
      </div>

      {applicantType === ApplicantType.FISICA && (
        <Card key="fisica" className="mt-4 border-slate-200">
          <CardHeader className="pb-3"><CardTitle className="text-base text-blue-700">Datos de Persona Física</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-sm">Nombre</Label>
              <Input {...register("firstName")} aria-invalid={!!errors.firstName && (touchedFields.firstName || showStepErrors[1])} className="w-full" />
              {errors.firstName && (touchedFields.firstName || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Primer Apellido</Label>
              <Input {...register("lastName1")} aria-invalid={!!errors.lastName1 && (touchedFields.lastName1 || showStepErrors[1])} className="w-full" />
              {errors.lastName1 && (touchedFields.lastName1 || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.lastName1.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Segundo Apellido</Label>
              <Input {...register("lastName2")} className="w-full" />
            </div>
            <div>
              <Label className="text-sm">Cédula</Label>
              <Input {...register("physicalId")} aria-invalid={!!errors.physicalId && (touchedFields.physicalId || showStepErrors[1])} className="w-full" />
              {errors.physicalId && (touchedFields.physicalId || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.physicalId.message}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {applicantType === ApplicantType.JURIDICA && (
        <Card key="juridica" className="mt-4 border-slate-200">
          <CardHeader className="pb-3"><CardTitle className="text-base text-blue-700">Datos de Persona Jurídica</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-sm">Razón Social</Label>
              <Input {...register("legalName")} aria-invalid={!!errors.legalName && (touchedFields.legalName || showStepErrors[1])} className="w-full" />
              {errors.legalName && (touchedFields.legalName || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.legalName.message}</p>}
            </div>
            <div>
              <Label className="text-sm">Cédula Jurídica</Label>
              <Input {...register("legalId")} aria-invalid={!!errors.legalId && (touchedFields.legalId || showStepErrors[1])} className="w-full" />
              {errors.legalId && (touchedFields.legalId || showStepErrors[1]) && <p className="text-sm text-red-600 mt-1">{errors.legalId.message}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const Step2 = () => (
    <div className="space-y-4 sm:space-y-6">
      <StepHeader icon={MapPin} title="Ubicación" subtitle="Distrito y dirección" step={2} />
      <div>
        <Label className="mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-blue-600" /> Distrito</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DISTRICT_OPTIONS.map((d) => {
            const Icon = LUCIDE[d.icon];
            const id = safeId(d.key);
            return (
              <div key={d.key}>
                <input
                  type="radio"
                  {...register("district")}
                  value={d.key}
                  id={id}
                  className="peer sr-only"
                />
                <Label htmlFor={id} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all block ${
                  watch("district") === d.key ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {Icon && <Icon className="w-4 h-4 text-blue-600 shrink-0" />}
                    <span className="text-blue-700 font-semibold text-sm sm:text-base">{d.label}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
  {errors.district && (touchedFields.district || showStepErrors[2]) && <p className="text-sm text-red-600 mt-1">{errors.district.message}</p>}
      </div>
      <div>
        <Label className="mb-2 text-sm">Dirección Exacta</Label>
  <Textarea rows={textareaRows} placeholder="Ingrese la dirección completa..." {...register("exactAddress")} aria-invalid={!!errors.exactAddress && (touchedFields.exactAddress || showStepErrors[2])} className="w-full resize-none" />
  {errors.exactAddress && (touchedFields.exactAddress || showStepErrors[2]) && <p className="text-sm text-red-600 mt-1">{errors.exactAddress.message}</p>}
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-4 sm:space-y-6">
      <StepHeader icon={Building} title="Dependencias municipales" subtitle="Seleccione un área" step={3} />
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DEPENDENCY_OPTIONS.map((dep) => {
            const Icon = LUCIDE[dep.icon];
            const id = safeId(dep.key);
            return (
              <div key={dep.key}>
                <input
                  type="radio"
                  {...register("dependency")}
                  value={dep.key}
                  id={id}
                  className="peer sr-only"
                />
                <Label htmlFor={id} className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all block ${
                  watch("dependency") === dep.key ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {Icon && <Icon className="w-4 h-4 text-blue-600 shrink-0" />}
                    <div className="text-blue-700 font-semibold text-sm sm:text-base">{dep.title}</div>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
  {errors.dependency && (touchedFields.dependency || showStepErrors[3]) && <p className="text-sm text-red-600 mt-1">{errors.dependency.message}</p>}
      </div>
    </div>
  );

  // 4A: Alcaldía
  const MayorOfficeForm = () => (
    <Card key="mayor-office-card">
      <CardHeader><CardTitle className="text-base">Alcaldía</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Tipo de trámite</Label>
          <Input placeholder="Ej. Permiso especial" {...register("mo_procedureType")} aria-invalid={!!errors.mo_procedureType && (touchedFields.mo_procedureType || showStepErrors[4])} />
          {errors.mo_procedureType && (touchedFields.mo_procedureType || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.mo_procedureType.message}</p>}
        </div>
        <div>
          <Label>Observaciones</Label>
          <Textarea rows={3} {...register("mo_observations")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <PhotoField key="mo1" fieldKey="mo1" label="Fotografía N.º 1 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
          <PhotoField key="mo2" fieldKey="mo2" label="Fotografía N.º 2 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
          <PhotoField key="mo3" fieldKey="mo3" label="Fotografía N.º 3 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
        </div>
      </CardContent>
    </Card>
  );

  // 4B: Construcciones
  const ConstructionsForm = () => (
    <Card key="constructions-card">
      <CardHeader><CardTitle className="text-base">Construcciones</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm"><Hammer className="w-4 h-4 text-blue-600" /> Tipo de trámite</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {CONSTRUCTION_TRAMITES.map((t) => {
              const Icon = LUCIDE[t.icon];
              const id = safeId(t.key);
              return (
                <div key={t.key}>
                  <input
                    type="radio"
                    {...register("constructionProcedure")}
                    value={t.key}
                    id={id}
                    className="peer sr-only"
                  />
                  <RadioCard htmlFor={id} value={t.key} selected={constructionProcedure === t.key}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />}
                      <div className="text-blue-700 font-semibold text-xs sm:text-sm">{t.label}</div>
                    </div>
                  </RadioCard>
                </div>
              );
            })}
          </div>
          {errors.constructionProcedure && (touchedFields.constructionProcedure || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.constructionProcedure.message}</p>}
        </div>

        {constructionProcedure === ConstructionProcedure.UsoSuelo && (
          <Card key="uso-suelo" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Uso de Suelo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Uso de suelo solicitado</Label><Input {...register("landUseRequested")} aria-invalid={!!errors.landUseRequested && (touchedFields.landUseRequested || showStepErrors[4])} />
                {errors.landUseRequested && (touchedFields.landUseRequested || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.landUseRequested.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>¿Concuerda con la ubicación?</Label>
                  <div className="flex gap-6 mt-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("landUseMatches")}
                        checked={watch("landUseMatches")}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      Sí
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={watch("landUseMatches") === false}
                        onCheckedChange={(checked) => setValue("landUseMatches", checked ? false : undefined, { shouldValidate: false, shouldDirty: true })}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
                    {errors.landUseMatches && (touchedFields.landUseMatches || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.landUseMatches.message}</p>}
                  </div>
                </div>
                <div>
                  <Label>¿Se recomienda?</Label>
                  <div className="flex gap-6 mt-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("landUseRecommended")}
                        checked={watch("landUseRecommended")}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      Sí
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={watch("landUseRecommended") === false}
                        onCheckedChange={(checked) => setValue("landUseRecommended", checked ? false : undefined, { shouldValidate: false, shouldDirty: true })}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
                    {errors.landUseRecommended && (touchedFields.landUseRecommended || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.landUseRecommended.message}</p>}
                  </div>
                </div>
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea rows={3} {...register("landUseObservations")} />
              </div>
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.Antiguedad && (
          <Card key="antiguedad" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><History className="w-4 h-4" /> Antigüedad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>N.º de finca</Label><Input {...register("antiguedadNumeroFinca")} aria-invalid={!!errors.antiguedadNumeroFinca && (touchedFields.antiguedadNumeroFinca || showStepErrors[4])} />{errors.antiguedadNumeroFinca && (touchedFields.antiguedadNumeroFinca || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.antiguedadNumeroFinca.message}</p>}</div>
                <div><Label>Antigüedad aproximada</Label><Input {...register("antiguedadAprox")} aria-invalid={!!errors.antiguedadAprox && (touchedFields.antiguedadAprox || showStepErrors[4])} />{errors.antiguedadAprox && (touchedFields.antiguedadAprox || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.antiguedadAprox.message}</p>}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <PhotoField key="antiguedad1" fieldKey="antiguedad1" label="Fotografía N.º 1 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
                <PhotoField key="antiguedad2" fieldKey="antiguedad2" label="Fotografía N.º 2 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
                <PhotoField key="antiguedad3" fieldKey="antiguedad3" label="Fotografía N.º 3 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
              </div>
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.AnulacionPC && (
          <Card key="anulacion-pc" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><X className="w-4 h-4" /> Anulación de PC</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>N.º de contrato</Label><Input {...register("pcNumeroContrato")} aria-invalid={!!errors.pcNumeroContrato && (touchedFields.pcNumeroContrato || showStepErrors[4])} />{errors.pcNumeroContrato && (touchedFields.pcNumeroContrato || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.pcNumeroContrato.message}</p>}</div>
                <div><Label>N.º de PC</Label><Input {...register("pcNumero")} aria-invalid={!!errors.pcNumero && (touchedFields.pcNumero || showStepErrors[4])} />{errors.pcNumero && (touchedFields.pcNumero || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.pcNumero.message}</p>}</div>
                <div>
                  <Label>¿Construyó?</Label>
                  <div className="flex gap-6 mt-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("pcConstruyo")}
                        checked={watch("pcConstruyo")}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      Sí
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={watch("pcConstruyo") === false}
                        onCheckedChange={(checked) => setValue("pcConstruyo", checked ? false : undefined, { shouldValidate: false, shouldDirty: true })}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
                    {errors.pcConstruyo && (touchedFields.pcConstruyo || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.pcConstruyo.message}</p>}
                  </div>
                </div>
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea rows={3} {...register("pcObservaciones")} />
              </div>
              <PhotoField fieldKey="pc1" label="Fotografía N.º 1 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.InspeccionGeneral && (
          <Card key="inspeccion-general" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Search className="w-4 h-4" /> Inspección general</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>N.º de finca</Label><Input {...register("igNumeroFinca")} aria-invalid={!!errors.igNumeroFinca && (touchedFields.igNumeroFinca || showStepErrors[4])} />{errors.igNumeroFinca && (touchedFields.igNumeroFinca || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.igNumeroFinca.message}</p>}</div>
              <div><Label>Observaciones</Label><Textarea rows={3} {...register("igObservaciones")} /></div>
              <PhotoField fieldKey="ig1" label="Fotografía N.º 1 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.RecibidoObra && (
          <Card key="recibido-obra" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Check className="w-4 h-4" /> Recibido de obra</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Fecha de la visita</Label><Input type="date" {...register("roFechaVisita")} aria-invalid={!!errors.roFechaVisita && (touchedFields.roFechaVisita || showStepErrors[4])} />{errors.roFechaVisita && (touchedFields.roFechaVisita || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.roFechaVisita.message}</p>}</div>
                <div className="md:col-span-2">
                  <Label>Estado</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {[
                      ["terminada", "Obra terminada"],
                      ["proceso", "Obra en proceso"],
                      ["no_iniciada", "Obra no iniciada"]
                    ].map(([v, l]) => (
                      <Label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          {...register("roEstado")}
                          value={v}
                          checked={watch("roEstado") === v}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                        />
                        {l}
                      </Label>
                    ))}
                  </div>
                  {errors.roEstado && (touchedFields.roEstado || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.roEstado.message}</p>}
                </div>
              </div>
              <PhotoField fieldKey="ro1" label="Fotografía N.º 1 (requerida)" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  // 4C: ZMT
  const ZmtForm = () => (
    <div key="zmt-form" className="space-y-6">
      {/* Card 1: Información básica de la concesión */}
      <Card key="zmt-info" className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información de la Concesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-sm font-medium">N.º de expediente/contrato *</Label>
              <Input
                placeholder='Ej. "EXP-1313-2004"'
                {...register("zc_fileNumber")}
                aria-invalid={!!errors.zc_fileNumber && (touchedFields.zc_fileNumber || showStepErrors[4])}
                className="mt-1"
              />
              {errors.zc_fileNumber && (touchedFields.zc_fileNumber || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.zc_fileNumber.message}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium">Tipo de concesión *</Label>
              <select
                className="w-full border border-slate-200 rounded-lg p-3 mt-1"
                {...register("zc_concessionType")}
                defaultValue=""
              >
                <option value="" disabled>Seleccione…</option>
                <option value="Nueva Concesión">Nueva Concesión</option>
                <option value="Renovación">Renovación</option>
                <option value="Modificación">Modificación</option>
              </select>
              {errors.zc_concessionType && (touchedFields.zc_concessionType || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.zc_concessionType.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Fecha otorgamiento *</Label>
                <Input
                  type="date"
                  {...register("zc_grantedAt")}
                  aria-invalid={!!errors.zc_grantedAt && (touchedFields.zc_grantedAt || showStepErrors[4])}
                  className="mt-1"
                />
                {errors.zc_grantedAt && (touchedFields.zc_grantedAt || showStepErrors[4]) && <p className="text-sm text-red-600 mt-1">{errors.zc_grantedAt.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de vencimiento (opcional)</Label>
                <Input
                  type="date"
                  {...register("zc_expiresAt")}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Observaciones (opcional)</Label>
              <Textarea
                rows={3}
                {...register("zc_observations")}
                className="mt-1 resize-none"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Parcelas */}
      <Card key="zmt-parcels" className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Parcelas
          </CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 mt-1">Información de las parcelas de la concesión</p>
            <Button 
              type="button" 
              onClick={addParcel} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Parcela
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {parcels.map((parcel, index) => (
            <Card key={parcel.id} className="border border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base text-slate-700">
                    Parcela #{index + 1}
                  </CardTitle>
                  {parcels.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeParcel(parcel.id)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Información básica de la parcela */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`planType-${parcel.id}`} className="text-sm font-medium">Tipo de plano *</Label>
                      <Input
                        id={`planType-${parcel.id}`}
                        defaultValue={parcel.planType ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'planType', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Ej. Catastral"
                        data-parcel-input
                      />
                    </div>
                    <div>
                      <Label htmlFor={`planNumber-${parcel.id}`} className="text-sm font-medium">Número de plano *</Label>
                      <Input
                        id={`planNumber-${parcel.id}`}
                        defaultValue={parcel.planNumber ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'planNumber', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Ej. 123-45"
                        data-parcel-input
                      />
                    </div>
                    <div>
                      <Label htmlFor={`area-${parcel.id}`} className="text-sm font-medium">Área (decimal) *</Label>
                      <Input
                        id={`area-${parcel.id}`}
                        defaultValue={parcel.area ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'area', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Ej. 250.5"
                        data-parcel-input
                      />
                    </div>
                  </div>

                  {/* Tipo de mojón */}
                  <div>
                    <Label htmlFor={`mojonType-${parcel.id}`} className="text-sm font-medium">Tipo de mojón *</Label>
                    <select
                      id={`mojonType-${parcel.id}`}
                      className="w-full border border-slate-200 rounded-lg p-3 mt-1"
                      value={parcel.mojonType}
                      onChange={(e) => {
                        updateParcel(parcel.id, 'mojonType', e.target.value);
                      }}
                      data-parcel-input
                    >
                      <option value="Físico">Físico</option>
                      <option value="Poste">Poste</option>
                      <option value="Pintado">Pintado</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Verificaciones */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Plano cumple *</Label>
                      <div className="flex gap-4 mt-2">
                        <Label htmlFor={`planComplies-si-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`planComplies-si-${parcel.id}`}
                            checked={parcel.planComplies === "si"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'planComplies', checked ? "si" : "no");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          Sí
                        </Label>
                        <Label htmlFor={`planComplies-no-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`planComplies-no-${parcel.id}`}
                            checked={parcel.planComplies === "no"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'planComplies', checked ? "no" : "si");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          No
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Respeta lindero *</Label>
                      <div className="flex gap-4 mt-2">
                        <Label htmlFor={`respectsBoundary-si-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`respectsBoundary-si-${parcel.id}`}
                            checked={parcel.respectsBoundary === "si"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'respectsBoundary', checked ? "si" : "no");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          Sí
                        </Label>
                        <Label htmlFor={`respectsBoundary-no-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`respectsBoundary-no-${parcel.id}`}
                            checked={parcel.respectsBoundary === "no"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'respectsBoundary', checked ? "no" : "si");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          No
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Información técnica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`anchorageMojones-${parcel.id}`} className="text-sm font-medium">Anclaje de mojones *</Label>
                      <Input
                        id={`anchorageMojones-${parcel.id}`}
                        defaultValue={parcel.anchorageMojones ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'anchorageMojones', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Ej. Concreto"
                        data-parcel-input
                      />
                    </div>
                    <div>
                      <Label htmlFor={`topography-${parcel.id}`} className="text-sm font-medium">Topografía *</Label>
                      <Input
                        id={`topography-${parcel.id}`}
                        defaultValue={parcel.topography ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'topography', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Plano / Rugoso / ..."
                        data-parcel-input
                      />
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`topographyOther-${parcel.id}`} className="text-sm font-medium">Topografía (otra)</Label>
                      <Input
                        id={`topographyOther-${parcel.id}`}
                        defaultValue={parcel.topographyOther ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'topographyOther', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Especificar si es otra"
                        data-parcel-input
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fenceTypes-${parcel.id}`} className="text-sm font-medium">Tipos de cercas (coma)</Label>
                      <Input
                        id={`fenceTypes-${parcel.id}`}
                        defaultValue={parcel.fenceTypes ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'fenceTypes', e.target.value);
                        }}
                        className="mt-1"
                        placeholder='Ej. "Alambrado, Madera"'
                        data-parcel-input
                      />
                    </div>
                  </div>

                  {/* Verificaciones finales */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Cercas invaden DP *</Label>
                      <div className="flex gap-4 mt-2">
                        <Label htmlFor={`fencesInvadePublic-no-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`fencesInvadePublic-no-${parcel.id}`}
                            checked={parcel.fencesInvadePublic === "no"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'fencesInvadePublic', checked ? "no" : "si");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          No
                        </Label>
                        <Label htmlFor={`fencesInvadePublic-si-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`fencesInvadePublic-si-${parcel.id}`}
                            checked={parcel.fencesInvadePublic === "si"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'fencesInvadePublic', checked ? "si" : "no");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          Sí
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Vía con acceso público *</Label>
                      <div className="flex gap-4 mt-2">
                        <Label htmlFor={`roadHasPublicAccess-si-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`roadHasPublicAccess-si-${parcel.id}`}
                            checked={parcel.roadHasPublicAccess === "si"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'roadHasPublicAccess', checked ? "si" : "no");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          Sí
                        </Label>
                        <Label htmlFor={`roadHasPublicAccess-no-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`roadHasPublicAccess-no-${parcel.id}`}
                            checked={parcel.roadHasPublicAccess === "no"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'roadHasPublicAccess', checked ? "no" : "si");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          No
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">¿Vía coincide con plano? *</Label>
                      <div className="flex gap-4 mt-2">
                        <Label htmlFor={`roadMatchesPlan-si-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`roadMatchesPlan-si-${parcel.id}`}
                            checked={parcel.roadMatchesPlan === "si"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'roadMatchesPlan', checked ? "si" : "no");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          Sí
                        </Label>
                        <Label htmlFor={`roadMatchesPlan-no-${parcel.id}`} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id={`roadMatchesPlan-no-${parcel.id}`}
                            checked={parcel.roadMatchesPlan === "no"}
                            onCheckedChange={(checked) => {
                              updateParcel(parcel.id, 'roadMatchesPlan', checked ? "no" : "si");
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            data-parcel-input
                          />
                          No
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Información de vía */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`roadDescription-${parcel.id}`} className="text-sm font-medium">Descripción de vía</Label>
                      <Input
                        id={`roadDescription-${parcel.id}`}
                        defaultValue={parcel.roadDescription ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'roadDescription', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Descripción de la vía"
                        data-parcel-input
                      />
                    </div>
                    <div>
                      <Label htmlFor={`roadLimitations-${parcel.id}`} className="text-sm font-medium">Limitaciones de vía</Label>
                      <Input
                        id={`roadLimitations-${parcel.id}`}
                        defaultValue={parcel.roadLimitations ?? ""}
                        onBlur={(e) => {
                          updateParcel(parcel.id, 'roadLimitations', e.target.value);
                        }}
                        className="mt-1"
                        placeholder="Limitaciones observadas"
                        data-parcel-input
                      />
                    </div>
                  </div>

                  {/* Ancho de servidumbre */}
                  <div>
                    <Label htmlFor={`rightOfWayWidth-${parcel.id}`} className="text-sm font-medium">Ancho de servidumbre</Label>
                    <Input
                      id={`rightOfWayWidth-${parcel.id}`}
                      defaultValue={parcel.rightOfWayWidth ?? ""}
                      onBlur={(e) => {
                        updateParcel(parcel.id, 'rightOfWayWidth', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Ej. 10 metros"
                      data-parcel-input
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </CardContent>
      </Card>

      {/* Card 3: Fotografías */}
      <Card key="zmt-photos" className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <ImagePlus className="w-5 h-5" />
            Fotografías de la Concesión
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Sube las fotografías que documenten la concesión ZMT</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PhotoField
              key="zmt1"
              fieldKey="zmt1"
              label="Fotografía N.º 1 (requerida)"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="zmt2"
              fieldKey="zmt2"
              label="Fotografía N.º 2 (requerida)"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="zmt3"
              fieldKey="zmt3"
              label="Fotografía N.º 3 (requerida)"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Plataformas de Servicios Form
  const ServicePlatformForm = () => (
    <Card key="service-platform-card">
      <CardHeader><CardTitle className="text-base">Plataformas de Servicios</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Número de trámite *</Label>
          <Input 
            placeholder="Ingrese el número de trámite" 
            {...register("ps_procedureNumber")} 
            aria-invalid={!!errors.ps_procedureNumber && (touchedFields.ps_procedureNumber || showStepErrors[4])} 
          />
          {errors.ps_procedureNumber && (touchedFields.ps_procedureNumber || showStepErrors[4]) && (
            <p className="text-sm text-red-600 mt-1">{errors.ps_procedureNumber.message}</p>
          )}
        </div>
        <div>
          <Label>Observación</Label>
          <Textarea 
            rows={3} 
            placeholder="Ingrese observaciones (opcional)"
            {...register("ps_observation")} 
          />
        </div>
      </CardContent>
    </Card>
  );

  // Cobros (Collections) Form
  const CollectionsForm = () => (
    <Card key="collections-card">
      <CardHeader><CardTitle className="text-base">Cobros</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Firma del notificador</Label>
          <PhotoField
            key="col_signature"
            fieldKey="col_signature"
            label="Firma del Notificador"
            photos={photos}
            setPhotos={setPhotos}
            photoErrors={photoErrors}
            setPhotoErrors={setPhotoErrors}
          />
          <p className="text-xs text-gray-500 mt-1">* Requerido si no selecciona un motivo de no firma</p>
        </div>
        
        <div className="border-t pt-4">
          <Label className="mb-3 block">Motivos de no firma (seleccione al menos uno si no hay firma)</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col_nobodyPresent"
                {...register("col_nobodyPresent")}
                className="w-4 h-4"
              />
              <Label htmlFor="col_nobodyPresent" className="font-normal cursor-pointer">No había nadie</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col_wrongAddress"
                {...register("col_wrongAddress")}
                className="w-4 h-4"
              />
              <Label htmlFor="col_wrongAddress" className="font-normal cursor-pointer">Dirección incorrecta</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col_movedAddress"
                {...register("col_movedAddress")}
                className="w-4 h-4"
              />
              <Label htmlFor="col_movedAddress" className="font-normal cursor-pointer">Cambió domicilio</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col_refusedToSign"
                {...register("col_refusedToSign")}
                className="w-4 h-4"
              />
              <Label htmlFor="col_refusedToSign" className="font-normal cursor-pointer">No quiso firmar</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="col_notLocated"
                {...register("col_notLocated")}
                className="w-4 h-4"
              />
              <Label htmlFor="col_notLocated" className="font-normal cursor-pointer">No se localiza</Label>
            </div>
          </div>
        </div>

        <div>
          <Label>Otro motivo</Label>
          <Input 
            placeholder="Especifique otro motivo (opcional)" 
            {...register("col_other")} 
          />
        </div>
      </CardContent>
    </Card>
  );

  // Clausura de Obra (Work Closure) Form
  const WorkClosureForm = () => (
    <Card key="work-closure-card">
      <CardHeader><CardTitle className="text-base">Clausura de Obra</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800">* Debe ingresar al menos <strong>número de finca</strong> o <strong>número de catastro</strong></p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Número de finca *</Label>
            <Input 
              placeholder="Ej. 123456" 
              {...register("wc_propertyNumber")}
              aria-invalid={!!errors.wc_propertyNumber && (touchedFields.wc_propertyNumber || showStepErrors[4])}
            />
            {errors.wc_propertyNumber && (touchedFields.wc_propertyNumber || showStepErrors[4]) && (
              <p className="text-sm text-red-600 mt-1">{errors.wc_propertyNumber.message}</p>
            )}
          </div>
          <div>
            <Label>Número de catastro *</Label>
            <Input 
              placeholder="Ej. CAT-789" 
              {...register("wc_cadastralNumber")}
              aria-invalid={!!errors.wc_cadastralNumber && (touchedFields.wc_cadastralNumber || showStepErrors[4])}
            />
          </div>
          <div>
            <Label>No. de contrato</Label>
            <Input placeholder="Ej. CONT-2025-001" {...register("wc_contractNumber")} />
          </div>
          <div>
            <Label>Número de permiso</Label>
            <Input placeholder="Ej. PERM-456" {...register("wc_permitNumber")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Área tasada</Label>
            <Input placeholder="Ej. 120 m²" {...register("wc_assessedArea")} />
          </div>
          <div>
            <Label>Área construida</Label>
            <Input placeholder="Ej. 100 m²" {...register("wc_builtArea")} />
          </div>
        </div>

        <div>
          <Label>Número de visita *</Label>
          <select
            {...register("wc_visitNumber")}
            className="w-full px-3 py-2 border rounded-md"
            aria-invalid={!!errors.wc_visitNumber && (touchedFields.wc_visitNumber || showStepErrors[4])}
          >
            <option value="">Seleccione...</option>
            <option value="visita_1">Visita 1</option>
            <option value="visita_2">Visita 2</option>
            <option value="visita_3">Visita 3</option>
          </select>
          {errors.wc_visitNumber && (touchedFields.wc_visitNumber || showStepErrors[4]) && (
            <p className="text-sm text-red-600 mt-1">{errors.wc_visitNumber.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="wc_workReceipt"
            {...register("wc_workReceipt")}
            className="w-4 h-4"
          />
          <Label htmlFor="wc_workReceipt" className="font-normal cursor-pointer">Recibo de obra</Label>
        </div>

        <div>
          <Label>Acciones *</Label>
          <Textarea 
            rows={3} 
            placeholder="Describa las acciones tomadas (requerido)"
            {...register("wc_actions")}
            aria-invalid={!!errors.wc_actions && (touchedFields.wc_actions || showStepErrors[4])}
          />
          {errors.wc_actions && (touchedFields.wc_actions || showStepErrors[4]) && (
            <p className="text-sm text-red-600 mt-1">{errors.wc_actions.message}</p>
          )}
        </div>

        <div>
          <Label>Observaciones</Label>
          <Textarea 
            rows={3} 
            placeholder="Observaciones adicionales (opcional)"
            {...register("wc_observations")} 
          />
        </div>

        <div>
          <Label>Fotografías de la clausura</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <PhotoField
              key="wc1"
              fieldKey="wc1"
              label="Fotografía N.º 1"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="wc2"
              fieldKey="wc2"
              label="Fotografía N.º 2"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="wc3"
              fieldKey="wc3"
              label="Fotografía N.º 3"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const Step4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <StepHeader icon={ClipboardList} title="Detalles específicos" subtitle="Según la dependencia seleccionada" step={4} />
      {dependency === Dependency.MayorOffice && <MayorOfficeForm key="mayor-office" />}
      {dependency === Dependency.Constructions && <ConstructionsForm key="constructions" />}
      {dependency === Dependency.MaritimeZone && <ZmtForm key="zmt" />}
      {dependency === Dependency.ServicePlatform && <ServicePlatformForm key="service-platform" />}
      {dependency === Dependency.Collections && <CollectionsForm key="collections" />}
      {dependency === Dependency.WorkClosure && <WorkClosureForm key="work-closure" />}
      {![Dependency.MayorOffice, Dependency.Constructions, Dependency.MaritimeZone, Dependency.ServicePlatform, Dependency.Collections, Dependency.WorkClosure].includes(dependency || "") && (
        <div key="unsupported" className="text-center py-8 sm:py-10 text-slate-500">
          <Building className="w-10 h-10 sm:w-11 sm:h-11 mx-auto mb-3 text-slate-300" />
          <p className="text-sm sm:text-base">Seleccione una dependencia soportada para continuar</p>
        </div>
      )}
    </div>
  );

  /* --------------------------------- Submit -------------------------------- */
  const onFinalSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      // Validación unificada de fotos requeridas (inline + scroll)
      const photosOkBeforeSubmit = validateRequiredPhotos(values);
      if (!photosOkBeforeSubmit) return; // solo inline errors

      // Armar payload
      const applicant =
        values.applicantType === ApplicantType.FISICA
          ? { applicantType: values.applicantType, individualRequest: { firstName: values.firstName, lastName1: values.lastName1, lastName2: values.lastName2 || null, physicalId: values.physicalId } }
          : values.applicantType === ApplicantType.JURIDICA
          ? { applicantType: values.applicantType, legalEntityRequest: { legalName: values.legalName, legalId: values.legalId } }
          : { applicantType: values.applicantType };

      const location = { district: values.district, exactAddress: values.exactAddress };

      // Alcaldía (Mayor Office) - Subir fotos ANTES de crear inspección
      let mayorOffice = undefined;
      if (values.dependency === Dependency.MayorOffice) {
        const mayorOfficePhotoUrls = [];
        const mayorOfficePhotoFiles = [photos.mo1, photos.mo2, photos.mo3].filter(Boolean);
        
        for (let i = 0; i < mayorOfficePhotoFiles.length; i++) {
          const photoFile = mayorOfficePhotoFiles[i];
          
          try {
            const formData = new FormData();
            formData.append('file', photoFile);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
            mayorOfficePhotoUrls.push(data.secure_url);
          } catch (error) {
            console.error('Error subiendo foto de Alcaldía:', error);
          }
        }

        mayorOffice = {
          procedureType: values.mo_procedureType,
          observations: values.mo_observations || null,
          photos: mayorOfficePhotoUrls.length > 0 ? mayorOfficePhotoUrls : []
        };
      }

      // Constructions - Procesar cada tipo y subir fotos a Cloudinary ANTES
      let constructions;
      if (values.dependency === Dependency.Constructions) {
        constructions = { procedure: values.constructionProcedure, data: undefined };
        
        // Uso de Suelo - No tiene fotos
        if (values.constructionProcedure === ConstructionProcedure.UsoSuelo) {
          constructions.data = { 
            landUseRequested: values.landUseRequested, 
            landUseMatches: !!values.landUseMatches, 
            landUseRecommended: !!values.landUseRecommended, 
            observations: values.landUseObservations || null 
          };
        }
        
        // Antigüedad - Tiene 3 fotos (antiguedad1, antiguedad2, antiguedad3)
        if (values.constructionProcedure === ConstructionProcedure.Antiguedad) {
          const antiquityPhotoUrls = [];
          const antiquityPhotoFiles = [photos.antiguedad1, photos.antiguedad2, photos.antiguedad3].filter(Boolean);
          
          for (let i = 0; i < antiquityPhotoFiles.length; i++) {
            const photoFile = antiquityPhotoFiles[i];
            
            try {
              const formData = new FormData();
              formData.append('file', photoFile);
              
              const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
              }

              const data = await response.json();
              if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
              antiquityPhotoUrls.push(data.secure_url);
            } catch (error) {
              console.error('Error subiendo foto de Antigüedad:', error);
            }
          }
          
          constructions.data = { 
            propertyNumber: values.antiguedadNumeroFinca, 
            estimatedAge: values.antiguedadAprox,
            photos: antiquityPhotoUrls.length > 0 ? antiquityPhotoUrls : []
          };
        }
        
        // Anulación PC - Tiene 1 foto (pc1)
        if (values.constructionProcedure === ConstructionProcedure.AnulacionPC) {
          const pcPhotoUrls = [];
          if (photos.pc1) {
            
            try {
              const formData = new FormData();
              formData.append('file', photos.pc1);
              
              const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
              }

              const data = await response.json();
              if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
              pcPhotoUrls.push(data.secure_url);
            } catch (error) {
              console.error('Error subiendo foto de Anulación PC:', error);
            }
          }
          
          constructions.data = { 
            contractNumber: values.pcNumeroContrato, 
            pcNumber: values.pcNumero, 
            built: !!values.pcConstruyo, 
            observations: values.pcObservaciones || null,
            photos: pcPhotoUrls.length > 0 ? pcPhotoUrls : []
          };
        }
        
        // Inspección General - Tiene 1 foto (ig1)
        if (values.constructionProcedure === ConstructionProcedure.InspeccionGeneral) {
          const igPhotoUrls = [];
          if (photos.ig1) {
            
            try {
              const formData = new FormData();
              formData.append('file', photos.ig1);
              
              const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
              }

              const data = await response.json();
              if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
              igPhotoUrls.push(data.secure_url);
            } catch (error) {
              console.error('Error subiendo foto de Inspección General:', error);
            }
          }
          
          constructions.data = { 
            propertyNumber: values.igNumeroFinca, 
            observations: values.igObservaciones || null,
            photos: igPhotoUrls.length > 0 ? igPhotoUrls : []
          };
        }
        
        // Recibido de Obra - Tiene 1 foto (ro1)
        if (values.constructionProcedure === ConstructionProcedure.RecibidoObra) {
          const roPhotoUrls = [];
          if (photos.ro1) {
            
            try {
              const formData = new FormData();
              formData.append('file', photos.ro1);
              
              const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
              }

              const data = await response.json();
              if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
              roPhotoUrls.push(data.secure_url);
            } catch (error) {
              console.error('Error subiendo foto de Recibido de Obra:', error);
            }
          }
          
          constructions.data = { 
            visitedAt: values.roFechaVisita, 
            status: values.roEstado,
            photos: roPhotoUrls.length > 0 ? roPhotoUrls : []
          };
        }
      }

      // ZMT Concession - Subir fotos ANTES de crear inspección
      let zmtConcession = undefined;
      if (values.dependency === Dependency.MaritimeZone) {
        const zmtPhotoUrls = [];
        const zmtPhotoFiles = [photos.zmt1, photos.zmt2, photos.zmt3].filter(Boolean);
        
        for (let i = 0; i < zmtPhotoFiles.length; i++) {
          const photoFile = zmtPhotoFiles[i];
          
          try {
            const formData = new FormData();
            formData.append('file', photoFile);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
            zmtPhotoUrls.push(data.secure_url);
          } catch (error) {
            console.error('Error subiendo foto de ZMT:', error);
          }
        }

        zmtConcession = {
          fileNumber: values.zc_fileNumber,
          concessionType: values.zc_concessionType,
          grantedAt: values.zc_grantedAt,
          expiresAt: values.zc_expiresAt || null,
          observations: values.zc_observations || null,
          photos: zmtPhotoUrls.length > 0 ? zmtPhotoUrls : [],
          parcels: parcels.map((parcel) => {
          return {
            planType: parcel.planType,
            planNumber: parcel.planNumber,
            area: parcel.area,
            mojonType: parcel.mojonType,
            planComplies: parcel.planComplies,
            respectsBoundary: parcel.respectsBoundary,
            anchorageMojones: parcel.anchorageMojones,
            topography: parcel.topography,
            topographyOther: parcel.topographyOther || null,
            fenceTypes: parcel.fenceTypes,
            fencesInvadePublic: parcel.fencesInvadePublic,
            roadHasPublicAccess: parcel.roadHasPublicAccess,
            roadDescription: parcel.roadDescription || null,
            roadLimitations: parcel.roadLimitations || null,
            roadMatchesPlan: parcel.roadMatchesPlan,
            rightOfWayWidth: parcel.rightOfWayWidth || null,
          };
        })
        };
      }

      // Parse and normalize userIds
      // Plataformas de Servicios
      const platformAndService = values.dependency === Dependency.ServicePlatform ? {
        procedureNumber: values.ps_procedureNumber,
        observation: values.ps_observation || null,
      } : undefined;

      // Subir firma del notificador a Cloudinary si existe
      let signatureUrl = null;
      if (values.dependency === Dependency.Collections && photos.col_signature) {
        try {
          // Usar la función de Cloudinary para subir
          const formData = new FormData();
          formData.append('file', photos.col_signature);
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to upload signature');
          }

          const data = await response.json();
          signatureUrl = data.secure_url;
        } catch (error) {
          console.error('Error uploading signature:', error);
          throw new Error('Error al subir la firma del notificador');
        }
      }

      // Cobros (Collections)
      const collection = values.dependency === Dependency.Collections ? {
        notifierSignatureUrl: signatureUrl || null,
        nobodyPresent: values.col_nobodyPresent ? 'X' : null,
        wrongAddress: values.col_wrongAddress ? 'X' : null,
        movedAddress: values.col_movedAddress ? 'X' : null,
        refusedToSign: values.col_refusedToSign ? 'X' : null,
        notLocated: values.col_notLocated ? 'X' : null,
        other: values.col_other || null,
      } : undefined;

      // Clausura de Obra (Work Closure) - Subir fotos ANTES de crear inspección
      let workClosure = undefined;
      if (values.dependency === Dependency.WorkClosure) {
        const workClosurePhotoUrls = [];
        const workClosurePhotoFiles = [photos.wc1, photos.wc2, photos.wc3].filter(Boolean);
        
        for (let i = 0; i < workClosurePhotoFiles.length; i++) {
          const photoFile = workClosurePhotoFiles[i];
          
          try {
            const formData = new FormData();
            formData.append('file', photoFile);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload photo: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.secure_url) throw new Error('Cloudinary no devolvió secure_url');
            workClosurePhotoUrls.push(data.secure_url);
          } catch (error) {
            console.error('Error subiendo foto de Work Closure:', error);
          }
        }

        workClosure = {
          propertyNumber: values.wc_propertyNumber || null,
          cadastralNumber: values.wc_cadastralNumber || null,
          contractNumber: values.wc_contractNumber || null,
          permitNumber: values.wc_permitNumber || null,
          assessedArea: values.wc_assessedArea || null,
          builtArea: values.wc_builtArea || null,
          visitNumber: values.wc_visitNumber || null,
          workReceipt: !!values.wc_workReceipt,
          actions: values.wc_actions || null,
          observations: values.wc_observations || null,
          photos: workClosurePhotoUrls.length > 0 ? workClosurePhotoUrls : null
        };
      }

      const parsedUserIds = (() => {
        try {
          return JSON.parse(values.userIds || "[]");
        } catch {
          return [];
        }
      })();

      const inspectorIdsToSend = parsedUserIds.map((id) => {
        if (typeof id === "string" && id !== "" && /^-?\d+$/.test(id)) return Number(id);
        return id;
      });

      const payload = {
        inspectionDate: values.inspectionDate,
        procedureNumber: values.procedureNumber,
        inspectorIds: inspectorIdsToSend,
        ...applicant,
        location: values.exactAddress.trim() ? { district: values.district, exactAddress: values.exactAddress } : undefined,
        dependency: values.dependency,
        mayorOffice,
        constructions,
        zmtConcession,
        platformAndService,
        collection,
        workClosure,
      };

      const photosBySection = {};
      const created = await createInspectionFromForm(payload, photosBySection);
      // Reset form
      reset({
        inspectionDate: today,
        procedureNumber: "",
        applicantType: ApplicantType.ANONIMO,
        userIds: "[]",
        firstName: "", lastName1: "", lastName2: "", physicalId: "",
        legalName: "", legalId: "",
        district: District.SantaCruz,
        exactAddress: "",
        dependency: undefined,
        constructionProcedure: undefined,
        landUseRequested: "",
        landUseMatches: undefined,
        landUseRecommended: undefined,
        landUseObservations: "",
        antiguedadNumeroFinca: "",
        antiguedadAprox: "",
        pcNumeroContrato: "",
        pcNumero: "",
        pcConstruyo: undefined,
        pcObservaciones: "",
        igNumeroFinca: "",
        igObservaciones: "",
        roFechaVisita: "",
        roEstado: undefined,
        mo_procedureType: "",
        mo_observations: "",
        mo_photos: [],
        zc_fileNumber: "",
        zc_concessionType: undefined,
        zc_grantedAt: "",
        zc_expiresAt: "",
        zc_observations: "",
        zc_photos: [],
      });
      setCurrentStep(1);
      setPhotos({
        antiguedad1: null, antiguedad2: null, antiguedad3: null,
        pc1: null, ig1: null, ro1: null,
        mo1: null, mo2: null, mo3: null,
        zmt1: null, zmt2: null, zmt3: null,
        wc1: null, wc2: null, wc3: null,
        col_signature: null,
      });
      setPhotoErrors({});
      setParcels([{ ...emptyParcel }]);

      // Mostrar SweetAlert de éxito con timer
      await Swal.fire({
        title: '¡Éxito!',
        text: `Inspección creada correctamente. ID: ${created?.id || "OK"}`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setShowStepErrors({ 1: false, 2: false, 3: false, 4: false });
    } catch (err) {
      console.error(err);
      // Mostrar SweetAlert de error con mensaje específico del backend
      await Swal.fire({
        title: 'Error',
        text: err.message || 'Hubo un problema al enviar la inspección. Inténtalo de nuevo.',
        icon: 'error',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="w-full">
        <Card className="overflow-hidden border-slate-200 shadow-lg bg-white w-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-blue-200" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Nueva Inspección</h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Gestión integral de inspecciones por dependencias municipales</p>
              </div>
            </div>
          </div>

          <ProgressWizard />

          <CardContent className="p-4 sm:p-6 lg:p-8 w-full">
            <form onSubmit={onFinalSubmit} onKeyDown={(e) => {
              // Reducir interferencia con escritura y composición
              if (!e || !e.key || !e.target) return;
              const tag = e.target.tagName;
              const isTextInput = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
              // Evitar bloquear IME (teclados en otros idiomas)
              if (e.isComposing) return;
              // Solo prevenir Enter para submit accidental en inputs generales (no textareas ni campos de parcela)
              if (e.key === 'Enter' && tag !== 'TEXTAREA') {
                if (typeof e.target.closest === 'function' && e.target.closest('[data-parcel-input]')) return;
                if (isTextInput) e.preventDefault();
              }
            }} className="w-full">
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step3 />}
              {currentStep === 4 && <Step4 />}

              <Separator className="my-6" />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 sm:items-center sm:justify-between w-full">
                <Button type="button" variant="secondary" onClick={prevStep} disabled={currentStep === 1 || navBusy} className="order-2 sm:order-1 w-full sm:w-auto">
                  Anterior
                </Button>
                <div className="text-sm text-slate-500 text-center order-1 sm:order-2">
                  Paso {currentStep} de {totalSteps}
                </div>
                {currentStep === totalSteps ? (
                  <Button type="submit" disabled={submitting} className="order-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    {submitting ? "Enviando..." : <><Check className="w-4 h-4 mr-2" /> Finalizar Inspección</>}
                  </Button>
                ) : (
                  <Button type="button" className="order-3 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={nextStep} disabled={navBusy}>
                    Siguiente
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
