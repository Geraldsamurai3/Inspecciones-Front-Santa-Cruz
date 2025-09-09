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

// lucide-react
import {
  User, MapPin, Building, ClipboardList, Calendar, Hash, Users as UsersIcon, Check,
  Home, Building2, Mountain, Anchor, Waves, Trees, Ship, Umbrella,
  Landmark, DollarSign, HardHat, Receipt, Monitor, MoreHorizontal,
  FileText, MessageSquare, Hammer, History, X, Search, Upload, AlertTriangle,
  Plus, Trash2, ExternalLink, ImagePlus
} from "lucide-react";

// Dominio
import { useInspections } from "@/hooks/useInspections";
import { useUsers } from "@/hooks/useUsers";
import { ApplicantType, District, Dependency, ConstructionProcedure } from "@/domain/enums";

/* ==========================================================================
   UI Data (labels/íconos)
   ==========================================================================*/
const LUCIDE = { Home, Building2, Calendar, Mountain, Anchor, Waves, Trees, Ship, Umbrella, Landmark, DollarSign, HardHat, Receipt, Monitor, MoreHorizontal, MapPin, History, X, Search, Check };

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
    if (!ALLOWED_IMAGE.test(file.type)) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "Solo se permiten imágenes (JPG/PNG)." }));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoErrors((e) => ({ ...e, [fieldKey]: "La imagen supera 10MB." }));
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

/* ==========================================================================
   Validaciones (Zod en JS)
   ==========================================================================*/
const baseSchema = z.object({
  inspectionDate: z.string().min(1, "Requerido"),
  procedureNumber: z.string().min(1, "Requerido"),
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

  // solicitante
  firstName: z.string().optional(),
  lastName1: z.string().optional(),
  lastName2: z.string().optional(),
  physicalId: z.string().optional(),
  companyName: z.string().optional(),
  legalId: z.string().optional(),

  // ubicación
  district: z.enum(Object.values(District)),
  exactAddress: z.string().min(1, "Ingrese la dirección"),

  // dependencia
  dependency: z.enum(Object.values(Dependency)).optional(),

  // constructions
  constructionProcedure: z.enum(Object.values(ConstructionProcedure)).optional(),

  // Uso de suelo
  landUseRequested: z.string().optional(),
  landUseMatches: z.boolean().optional(),
  landUseRecommended: z.boolean().optional(),
  landUseObservations: z.string().optional(),

  // Antigüedad
  antiguedadNumeroFinca: z.string().optional(),
  antiguedadAprox: z.string().optional(),

  // Anulación PC
  pcNumeroContrato: z.string().optional(),
  pcNumero: z.string().optional(),
  pcConstruyo: z.boolean().optional(),
  pcObservaciones: z.string().optional(),

  // Inspección general
  igNumeroFinca: z.string().optional(),
  igObservaciones: z.string().optional(),

  // Recibido de obra
  roFechaVisita: z.string().optional(),
  roEstado: z.enum(["terminada", "proceso", "no_iniciada"]).optional(),

  // Alcaldía
  mo_procedureType: z.string().optional(),
  mo_observations: z.string().optional(),
  mo_photos: z.array(z.string()).optional(),

  // ZMT Concession
  zc_fileNumber: z.string().optional(),
  zc_concessionType: z.enum(["Nueva Concesión", "Renovación", "Modificación"]).optional(),
  zc_grantedAt: z.string().optional(),
  zc_expiresAt: z.string().optional().nullable(),
  zc_observations: z.string().optional().nullable(),
  zc_photos: z.array(z.string()).optional(),
});

const formSchema = baseSchema.superRefine((val, ctx) => {
  // Reglas por tipo solicitante
  if (val.applicantType === ApplicantType.FISICA) {
    if (!val.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre requerido", path: ["firstName"] });
    if (!val.lastName1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Primer apellido requerido", path: ["lastName1"] });
    if (!val.physicalId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Identificación requerida", path: ["physicalId"] });
  }
  if (val.applicantType === ApplicantType.JURIDICA) {
    if (!val.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Razón social requerida", path: ["companyName"] });
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
  });
  const [photoErrors, setPhotoErrors] = useState({});

  // Fotos como URLs (MayorOffice, ZMT)
  // MayorOffice photos ahora usan campos de subida (mo1, mo2, mo3)
  // ZMT photos ahora usan campos de subida (zmt1, zmt2, zmt3)

  // ZMT Parcels
  const generateParcelId = () => `parcel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const emptyParcel = { id: generateParcelId(), planType: "", planNumber: "", area: "", mojonType: "Físico", planComplies: "si", respectsBoundary: "si", anchorageMojones: "", topography: "", topographyOther: "", fenceTypes: "", fencesInvadePublic: "no", roadHasPublicAccess: "si", roadDescription: "", roadLimitations: "", roadMatchesPlan: "si", rightOfWayWidth: "" };
  const [parcel, setParcel] = useState({ ...emptyParcel });

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { register, handleSubmit, watch, setValue, trigger, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inspectionDate: today,
      procedureNumber: "",
      applicantType: ApplicantType.ANONIMO,
      userIds: "[]",

      // solicitante
      firstName: "", lastName1: "", lastName2: "", physicalId: "",
      companyName: "", legalId: "",

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
    },
    mode: "onChange", // Cambiado para actualizar valores inmediatamente
  });

  useEffect(() => {
    if (userIdsRef.current) {
      userIdsRef.current.value = watch("userIds") || "[]";
    }
  }, [watch("userIds")]);

  const dependency = watch("dependency");
  const constructionProcedure = watch("constructionProcedure");
  const applicantType = watch("applicantType");

  // Función helper para manejar cambios en parcelas de manera segura
  const updateParcel = useCallback((field, value) => {
    setParcel(prevParcel => ({ ...prevParcel, [field]: value }));
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
    if (step === 1) return trigger(["inspectionDate", "procedureNumber", "applicantType", "userIds", ...(applicantType === ApplicantType.FISICA ? ["firstName", "lastName1", "physicalId"] : []), ...(applicantType === ApplicantType.JURIDICA ? ["companyName", "legalId"] : [])]);
    if (step === 2) return trigger(["district", "exactAddress"]);
    if (step === 3) return trigger(["dependency"]);
    if (step === 4) {
      if (dependency === Dependency.MayorOffice) return trigger(["mo_procedureType"]);
      if (dependency === Dependency.Constructions) {
        const ok = await trigger(["constructionProcedure"]);
        if (!ok) return false;
        if (constructionProcedure === ConstructionProcedure.UsoSuelo) return trigger(["landUseRequested", "landUseMatches", "landUseRecommended"]);
        if (constructionProcedure === ConstructionProcedure.Antiguedad) return trigger(["antiguedadNumeroFinca", "antiguedadAprox"]);
        if (constructionProcedure === ConstructionProcedure.AnulacionPC) return trigger(["pcNumeroContrato", "pcNumero", "pcConstruyo"]);
        if (constructionProcedure === ConstructionProcedure.InspeccionGeneral) return trigger(["igNumeroFinca"]);
        if (constructionProcedure === ConstructionProcedure.RecibidoObra) return trigger(["roFechaVisita", "roEstado"]);
      }
      if (dependency === Dependency.MaritimeZone) return trigger(["zc_fileNumber", "zc_concessionType", "zc_grantedAt"]);
      return true;
    }
    return true;
  };

  const nextStep = async () => { if (navBusy) return; setNavBusy(true); const ok = await validateStep(currentStep); if (ok) setCurrentStep((s) => Math.min(totalSteps, s + 1)); setNavBusy(false); };
  const prevStep = () => { if (navBusy) return; setCurrentStep((s) => Math.max(1, s - 1)); };

  /* ---------------------------- UI de progreso --------------------------- */
  const ProgressWizard = () => (
    <div className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-200">
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded" />
        <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded transition-all" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }} />
        <div className="relative z-10 grid grid-cols-4 gap-1 sm:gap-2">
          {[User, MapPin, Building, ClipboardList].map((Icon, idx) => {
            const step = idx + 1; const active = step === currentStep; const done = step < currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-1 sm:gap-2">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"}`}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

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
          <Input type="date" {...register("inspectionDate")} readOnly aria-invalid={!!errors.inspectionDate} className="w-full" />
          {errors.inspectionDate && <p className="text-sm text-red-600 mt-1">{errors.inspectionDate.message}</p>}
        </div>
        <div>
          <Label className="mb-2 flex items-center gap-2 text-sm"><Hash className="w-4 h-4 text-blue-600" /> Número de Trámite</Label>
          <Input placeholder="INS-0001" {...register("procedureNumber")} aria-invalid={!!errors.procedureNumber} className="w-full" />
          {errors.procedureNumber && <p className="text-sm text-red-600 mt-1">{errors.procedureNumber.message}</p>}
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
                      setValue("userIds", JSON.stringify(newArr), { shouldValidate: true, shouldDirty: true });
                      if (userIdsRef.current) {
                        userIdsRef.current.value = JSON.stringify(newArr);
                      }
                    } else {
                      const newArr = curr.filter(id => id !== u.id);
                      setValue("userIds", JSON.stringify(newArr), { shouldValidate: true, shouldDirty: true });
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
        {errors.userIds && <p className="text-sm text-red-600 mt-1">{errors.userIds.message}</p>}

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
        {errors.applicantType && <p className="text-sm text-red-600 mt-1">{errors.applicantType.message}</p>}
      </div>

      {applicantType === ApplicantType.FISICA && (
        <Card key="fisica" className="mt-4 border-slate-200">
          <CardHeader className="pb-3"><CardTitle className="text-base text-blue-700">Datos de Persona Física</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><Label className="text-sm">Nombre</Label><Input {...register("firstName")} aria-invalid={!!errors.firstName} className="w-full" /></div>
            <div><Label className="text-sm">Primer Apellido</Label><Input {...register("lastName1")} aria-invalid={!!errors.lastName1} className="w-full" /></div>
            <div><Label className="text-sm">Segundo Apellido</Label><Input {...register("lastName2")} className="w-full" /></div>
            <div><Label className="text-sm">Cédula</Label><Input {...register("physicalId")} aria-invalid={!!errors.physicalId} className="w-full" /></div>
          </CardContent>
        </Card>
      )}

      {applicantType === ApplicantType.JURIDICA && (
        <Card key="juridica" className="mt-4 border-slate-200">
          <CardHeader className="pb-3"><CardTitle className="text-base text-blue-700">Datos de Persona Jurídica</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><Label className="text-sm">Razón Social</Label><Input {...register("companyName")} aria-invalid={!!errors.companyName} className="w-full" /></div>
            <div><Label className="text-sm">Cédula Jurídica</Label><Input {...register("legalId")} aria-invalid={!!errors.legalId} className="w-full" /></div>
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
        {errors.district && <p className="text-sm text-red-600 mt-1">{errors.district.message}</p>}
      </div>
      <div>
        <Label className="mb-2 text-sm">Dirección Exacta</Label>
        <Textarea rows={textareaRows} placeholder="Ingrese la dirección completa..." {...register("exactAddress")} aria-invalid={!!errors.exactAddress} className="w-full resize-none" />
        {errors.exactAddress && <p className="text-sm text-red-600 mt-1">{errors.exactAddress.message}</p>}
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
        {errors.dependency && <p className="text-sm text-red-600 mt-1">{errors.dependency.message}</p>}
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
          <Input placeholder="Ej. Permiso especial" {...register("mo_procedureType")} aria-invalid={!!errors.mo_procedureType} />
          {errors.mo_procedureType && <p className="text-sm text-red-600 mt-1">{errors.mo_procedureType.message}</p>}
        </div>
        <div>
          <Label>Observaciones</Label>
          <Textarea rows={3} {...register("mo_observations")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <PhotoField key="mo1" fieldKey="mo1" label="Fotografía N.º 1" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
          <PhotoField key="mo2" fieldKey="mo2" label="Fotografía N.º 2" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
          <PhotoField key="mo3" fieldKey="mo3" label="Fotografía N.º 3" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
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
          {errors.constructionProcedure && <p className="text-sm text-red-600 mt-1">{errors.constructionProcedure.message}</p>}
        </div>

        {constructionProcedure === ConstructionProcedure.UsoSuelo && (
          <Card key="uso-suelo" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Uso de Suelo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Uso de suelo solicitado</Label><Input {...register("landUseRequested")} aria-invalid={!!errors.landUseRequested} /></div>
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
                        onCheckedChange={(checked) => setValue("landUseMatches", checked ? false : undefined)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
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
                        onCheckedChange={(checked) => setValue("landUseRecommended", checked ? false : undefined)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
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
                <div><Label>N.º de finca</Label><Input {...register("antiguedadNumeroFinca")} aria-invalid={!!errors.antiguedadNumeroFinca} /></div>
                <div><Label>Antigüedad aproximada</Label><Input {...register("antiguedadAprox")} aria-invalid={!!errors.antiguedadAprox} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <PhotoField key="antiguedad1" fieldKey="antiguedad1" label="Fotografía N.º 1" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
                <PhotoField key="antiguedad2" fieldKey="antiguedad2" label="Fotografía N.º 2" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
                <PhotoField key="antiguedad3" fieldKey="antiguedad3" label="Fotografía N.º 3" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
              </div>
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.AnulacionPC && (
          <Card key="anulacion-pc" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><X className="w-4 h-4" /> Anulación de PC</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>N.º de contrato</Label><Input {...register("pcNumeroContrato")} aria-invalid={!!errors.pcNumeroContrato} /></div>
                <div><Label>N.º de PC</Label><Input {...register("pcNumero")} aria-invalid={!!errors.pcNumero} /></div>
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
                        onCheckedChange={(checked) => setValue("pcConstruyo", checked ? false : undefined)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      No
                    </Label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea rows={3} {...register("pcObservaciones")} />
              </div>
              <PhotoField fieldKey="pc1" label="Fotografía N.º 1" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.InspeccionGeneral && (
          <Card key="inspeccion-general" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Search className="w-4 h-4" /> Inspección general</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>N.º de finca</Label><Input {...register("igNumeroFinca")} aria-invalid={!!errors.igNumeroFinca} /></div>
              <div><Label>Observaciones</Label><Textarea rows={3} {...register("igObservaciones")} /></div>
              <PhotoField fieldKey="ig1" label="Fotografía N.º 1" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
            </CardContent>
          </Card>
        )}

        {constructionProcedure === ConstructionProcedure.RecibidoObra && (
          <Card key="recibido-obra" className="border-slate-200">
            <CardHeader><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Check className="w-4 h-4" /> Recibido de obra</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Fecha de la visita</Label><Input type="date" {...register("roFechaVisita")} aria-invalid={!!errors.roFechaVisita} /></div>
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
                </div>
              </div>
              <PhotoField fieldKey="ro1" label="Fotografía N.º 1" photos={photos} setPhotos={setPhotos} photoErrors={photoErrors} setPhotoErrors={setPhotoErrors} />
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
                aria-invalid={!!errors.zc_fileNumber}
                className="mt-1"
              />
              {errors.zc_fileNumber && <p className="text-sm text-red-600 mt-1">{errors.zc_fileNumber.message}</p>}
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
              {errors.zc_concessionType && <p className="text-sm text-red-600 mt-1">{errors.zc_concessionType.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Fecha otorgamiento *</Label>
                <Input
                  type="date"
                  {...register("zc_grantedAt")}
                  aria-invalid={!!errors.zc_grantedAt}
                  className="mt-1"
                />
                {errors.zc_grantedAt && <p className="text-sm text-red-600 mt-1">{errors.zc_grantedAt.message}</p>}
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
            Parcela
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card key={parcel.id} className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-700">Información de la Parcela</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Información básica de la parcela */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="planType" className="text-sm font-medium">Tipo de plano *</Label>
                    <Input
                      id="planType"
                      defaultValue={parcel.planType ?? ""}
                      onBlur={(e) => {
                        updateParcel('planType', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Ej. Catastral"
                      data-parcel-input
                    />
                  </div>
                  <div>
                    <Label htmlFor="planNumber" className="text-sm font-medium">Número de plano *</Label>
                    <Input
                      id="planNumber"
                      defaultValue={parcel.planNumber ?? ""}
                      onBlur={(e) => {
                        updateParcel('planNumber', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Ej. 123-45"
                      data-parcel-input
                    />
                  </div>
                  <div>
                    <Label htmlFor="area" className="text-sm font-medium">Área (decimal) *</Label>
                    <Input
                      id="area"
                      defaultValue={parcel.area ?? ""}
                      onBlur={(e) => {
                        updateParcel('area', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Ej. 250.5"
                      data-parcel-input
                    />
                  </div>
                </div>

                {/* Tipo de mojón */}
                <div>
                  <Label htmlFor="mojonType" className="text-sm font-medium">Tipo de mojón *</Label>
                  <select
                    id="mojonType"
                    className="w-full border border-slate-200 rounded-lg p-3 mt-1"
                    value={parcel.mojonType}
                    onChange={(e) => {
                      updateParcel('mojonType', e.target.value);
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
                      <Label htmlFor="planComplies-si" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="planComplies-si"
                          checked={parcel.planComplies === "si"}
                          onCheckedChange={(checked) => {
                            updateParcel('planComplies', checked ? "si" : "no");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        Sí
                      </Label>
                      <Label htmlFor="planComplies-no" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="planComplies-no"
                          checked={parcel.planComplies === "no"}
                          onCheckedChange={(checked) => {
                            updateParcel('planComplies', checked ? "no" : "si");
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
                      <Label htmlFor="respectsBoundary-si" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="respectsBoundary-si"
                          checked={parcel.respectsBoundary === "si"}
                          onCheckedChange={(checked) => {
                            updateParcel('respectsBoundary', checked ? "si" : "no");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        Sí
                      </Label>
                      <Label htmlFor="respectsBoundary-no" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="respectsBoundary-no"
                          checked={parcel.respectsBoundary === "no"}
                          onCheckedChange={(checked) => {
                            updateParcel('respectsBoundary', checked ? "no" : "si");
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
                    <Label htmlFor="anchorageMojones" className="text-sm font-medium">Anclaje de mojones *</Label>
                    <Input
                      id="anchorageMojones"
                      defaultValue={parcel.anchorageMojones ?? ""}
                      onBlur={(e) => {
                        updateParcel('anchorageMojones', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Ej. Concreto"
                      data-parcel-input
                    />
                  </div>
                  <div>
                    <Label htmlFor="topography" className="text-sm font-medium">Topografía *</Label>
                    <Input
                      id="topography"
                      defaultValue={parcel.topography ?? ""}
                      onBlur={(e) => {
                        updateParcel('topography', e.target.value);
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
                    <Label htmlFor="topographyOther" className="text-sm font-medium">Topografía (otra)</Label>
                    <Input
                      id="topographyOther"
                      defaultValue={parcel.topographyOther ?? ""}
                      onBlur={(e) => {
                        updateParcel('topographyOther', e.target.value);
                      }}
                      className="mt-1"
                      placeholder="Especificar si es otra"
                      data-parcel-input
                    />
                  </div>
                  <div>
                    <Label htmlFor="fenceTypes" className="text-sm font-medium">Tipos de cercas (coma)</Label>
                    <Input
                      id="fenceTypes"
                      defaultValue={parcel.fenceTypes ?? ""}
                      onBlur={(e) => {
                        updateParcel('fenceTypes', e.target.value);
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
                      <Label htmlFor="fencesInvadePublic-no" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="fencesInvadePublic-no"
                          checked={parcel.fencesInvadePublic === "no"}
                          onCheckedChange={(checked) => {
                            updateParcel('fencesInvadePublic', checked ? "no" : "si");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        No
                      </Label>
                      <Label htmlFor="fencesInvadePublic-si" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="fencesInvadePublic-si"
                          checked={parcel.fencesInvadePublic === "si"}
                          onCheckedChange={(checked) => {
                            updateParcel('fencesInvadePublic', checked ? "si" : "no");
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
                      <Label htmlFor="roadHasPublicAccess-si" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="roadHasPublicAccess-si"
                          checked={parcel.roadHasPublicAccess === "si"}
                          onCheckedChange={(checked) => {
                            updateParcel('roadHasPublicAccess', checked ? "si" : "no");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        Sí
                      </Label>
                      <Label htmlFor="roadHasPublicAccess-no" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="roadHasPublicAccess-no"
                          checked={parcel.roadHasPublicAccess === "no"}
                          onCheckedChange={(checked) => {
                            updateParcel('roadHasPublicAccess', checked ? "no" : "si");
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
                      <Label htmlFor="roadMatchesPlan-si" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="roadMatchesPlan-si"
                          checked={parcel.roadMatchesPlan === "si"}
                          onCheckedChange={(checked) => {
                            updateParcel('roadMatchesPlan', checked ? "si" : "no");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        Sí
                      </Label>
                      <Label htmlFor="roadMatchesPlan-no" className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          id="roadMatchesPlan-no"
                          checked={parcel.roadMatchesPlan === "no"}
                          onCheckedChange={(checked) => {
                            updateParcel('roadMatchesPlan', checked ? "no" : "si");
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          data-parcel-input
                        />
                        No
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Ancho de servidumbre */}
                <div>
                  <Label htmlFor="rightOfWayWidth" className="text-sm font-medium">Ancho de servidumbre</Label>
                  <Input
                    id="rightOfWayWidth"
                    defaultValue={parcel.rightOfWayWidth ?? ""}
                    onBlur={(e) => {
                      updateParcel('rightOfWayWidth', e.target.value);
                    }}
                    className="mt-1"
                    placeholder="Ej. 10 metros"
                    data-parcel-input
                  />
                </div>
              </CardContent>
            </Card>
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
              label="Fotografía N.º 1"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="zmt2"
              fieldKey="zmt2"
              label="Fotografía N.º 2"
              photos={photos}
              setPhotos={setPhotos}
              photoErrors={photoErrors}
              setPhotoErrors={setPhotoErrors}
            />
            <PhotoField
              key="zmt3"
              fieldKey="zmt3"
              label="Fotografía N.º 3"
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

  const Step4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <StepHeader icon={ClipboardList} title="Detalles específicos" subtitle="Según la dependencia seleccionada" step={4} />
      {dependency === Dependency.MayorOffice && <MayorOfficeForm key="mayor-office" />}
      {dependency === Dependency.Constructions && <ConstructionsForm key="constructions" />}
      {dependency === Dependency.MaritimeZone && <ZmtForm key="zmt" />}
      {![Dependency.MayorOffice, Dependency.Constructions, Dependency.MaritimeZone].includes(dependency || "") && (
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
      // Reglas de fotos mínimas por trámite
      const need = (keys) => keys.every((k) => photos[k]);
      if (values.dependency === Dependency.Constructions) {
        if (values.constructionProcedure === ConstructionProcedure.Antiguedad && !need(["antiguedad1", "antiguedad2", "antiguedad3"]))
          return await Swal.fire({
            title: 'Faltan fotografías',
            text: 'Sube las 3 fotografías de Antigüedad.',
            icon: 'warning',
            timer: 4000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        if (values.constructionProcedure === ConstructionProcedure.AnulacionPC && !need(["pc1"]))
          return await Swal.fire({
            title: 'Falta fotografía',
            text: 'Sube la fotografía N.º 1 para Anulación de PC.',
            icon: 'warning',
            timer: 4000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        if (values.constructionProcedure === ConstructionProcedure.InspeccionGeneral && !need(["ig1"]))
          return await Swal.fire({
            title: 'Falta fotografía',
            text: 'Sube la fotografía N.º 1 para Inspección general.',
            icon: 'warning',
            timer: 4000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        if (values.constructionProcedure === ConstructionProcedure.RecibidoObra && !need(["ro1"]))
          return await Swal.fire({
            title: 'Falta fotografía',
            text: 'Sube la fotografía N.º 1 para Recibido de obra.',
            icon: 'warning',
            timer: 4000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
      }

      // Armar payload
      const applicant =
        values.applicantType === ApplicantType.FISICA
          ? { applicantType: values.applicantType, individualRequest: { firstName: values.firstName, lastName1: values.lastName1, lastName2: values.lastName2 || null, physicalId: values.physicalId } }
          : values.applicantType === ApplicantType.JURIDICA
          ? { applicantType: values.applicantType, legalEntityRequest: { companyName: values.companyName, legalId: values.legalId } }
          : { applicantType: values.applicantType };

      const location = { district: values.district, exactAddress: values.exactAddress };

      const mayorOffice = values.dependency === Dependency.MayorOffice ? { procedureType: values.mo_procedureType, observations: values.mo_observations || null, photos: [] } : undefined;

      let constructions;
      if (values.dependency === Dependency.Constructions) {
        constructions = { procedure: values.constructionProcedure, data: undefined };
        if (values.constructionProcedure === ConstructionProcedure.UsoSuelo) {
          constructions.data = { landUseRequested: values.landUseRequested, landUseMatches: !!values.landUseMatches, landUseRecommended: !!values.landUseRecommended, observations: values.landUseObservations || null };
        }
        if (values.constructionProcedure === ConstructionProcedure.Antiguedad) {
          constructions.data = { propertyNumber: values.antiguedadNumeroFinca, estimatedAge: values.antiguedadAprox };
        }
        if (values.constructionProcedure === ConstructionProcedure.AnulacionPC) {
          constructions.data = { contractNumber: values.pcNumeroContrato, pcNumber: values.pcNumero, built: !!values.pcConstruyo, observations: values.pcObservaciones || null };
        }
        if (values.constructionProcedure === ConstructionProcedure.InspeccionGeneral) {
          constructions.data = { propertyNumber: values.igNumeroFinca, observations: values.igObservaciones || null };
        }
        if (values.constructionProcedure === ConstructionProcedure.RecibidoObra) {
          constructions.data = { visitedAt: values.roFechaVisita, status: values.roEstado };
        }
      }

      const zmtConcession = values.dependency === Dependency.MaritimeZone ? {
        fileNumber: values.zc_fileNumber,
        concessionType: values.zc_concessionType,
        grantedAt: values.zc_grantedAt,
        expiresAt: values.zc_expiresAt || null,
        observations: values.zc_observations || null,
        photos: [],
        parcels: [{
          planType: parcel.planType,
          planNumber: parcel.planNumber,
          area: parcel.area ? String(parcel.area) : "0",
          mojonType: parcel.mojonType,
          planComplies: parcel.planComplies,
          respectsBoundary: parcel.respectsBoundary,
          anchorageMojones: parcel.anchorageMojones,
          topography: parcel.topography,
          topographyOther: parcel.topographyOther || "",
          fenceTypes: parcel.fenceTypes,
          fencesInvadePublic: parcel.fencesInvadePublic,
          roadHasPublicAccess: parcel.roadHasPublicAccess,
          roadDescription: parcel.roadDescription || "",
          roadLimitations: parcel.roadLimitations || "",
          roadMatchesPlan: parcel.roadMatchesPlan,
          rightOfWayWidth: parcel.rightOfWayWidth || "",
        }],
      } : undefined;

      // Parse and normalize userIds
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
      };

      const photosBySection = {
        antiguedadPhotos: [photos.antiguedad1, photos.antiguedad2, photos.antiguedad3].filter(Boolean),
        pcCancellationPhotos: [photos.pc1].filter(Boolean),
        generalInspectionPhotos: [photos.ig1].filter(Boolean),
        workReceiptPhotos: [photos.ro1].filter(Boolean),
        mayorOfficePhotos: [photos.mo1, photos.mo2, photos.mo3].filter(Boolean),
        zmtConcessionPhotos: [photos.zmt1, photos.zmt2, photos.zmt3].filter(Boolean),
      };

      const created = await createInspectionFromForm(payload, photosBySection);
      // Reset form
      reset({
        inspectionDate: today,
        procedureNumber: "",
        applicantType: ApplicantType.ANONIMO,
        userIds: "[]",
        firstName: "", lastName1: "", lastName2: "", physicalId: "",
        companyName: "", legalId: "",
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
      });
      setPhotoErrors({});
      setParcel({ ...emptyParcel });

      // Mostrar SweetAlert de éxito con timer
      await Swal.fire({
        title: '¡Éxito!',
        text: `Inspección creada correctamente. ID: ${created?.id || "OK"}`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
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
              // Verificaciones de seguridad exhaustivas
              if (!e || !e.key || !e.target) return;
              
              // Prevenir Enter en inputs y selects para evitar envío accidental del formulario
              if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                
                // Verificar que el método closest existe antes de usarlo
                if (typeof e.target.closest === 'function') {
                  // Solo permitir Enter en inputs de parcelas
                  if (e.target.closest('[data-parcel-input]')) {
                    return; // Permitir Enter en inputs de parcelas
                  }
                }
                
                // Prevenir en inputs y selects
                if (['INPUT', 'SELECT'].includes(e.target.tagName)) {
                  e.preventDefault();
                }
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
