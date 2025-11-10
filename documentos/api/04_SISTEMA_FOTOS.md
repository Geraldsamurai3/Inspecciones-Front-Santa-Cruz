# 📸 Sistema de Subida de Fotos

## 📋 Índice
- [Visión General](#visión-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Flujo de Subida](#flujo-de-subida)
- [Validación de Archivos](#validación-de-archivos)
- [Integración con Cloudinary](#integración-con-cloudinary)
- [PhotoField Component](#photofield-component)
- [DTO Mapping](#dto-mapping)
- [Secciones con Fotos](#secciones-con-fotos)
- [Seguridad](#seguridad)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Visión General

El sistema de fotos permite cargar imágenes a **Cloudinary** ANTES de crear la inspección. Las URLs de Cloudinary se incluyen directamente en el payload de creación, garantizando que las fotos se guarden correctamente en la base de datos.

### Características Principales
- ✅ Subida a Cloudinary antes de crear inspección
- ✅ Validación exhaustiva de archivos (tipo, tamaño, nombre)
- ✅ Soporte para 7 secciones diferentes con fotos
- ✅ Manejo de errores detallado
- ✅ Prevención de ataques de seguridad
- ✅ URLs seguras almacenadas en BD

### Cambio de Arquitectura (IMPORTANTE)

**❌ Arquitectura Antigua (INCORRECTA)**:
```
1. Crear inspección en BD (sin fotos)
2. Subir fotos a /inspections/:id/photos
3. Backend actualiza inspección con URLs
```
**Problema**: Las fotos no se guardaban en `photos` field.

**✅ Arquitectura Nueva (CORRECTA)**:
```
1. Subir fotos a /cloudinary/upload (obtener URLs)
2. Incluir URLs en el payload de creación
3. Crear inspección con fotos ya incluidas
```
**Beneficio**: Las fotos se guardan correctamente desde el inicio.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE SUBIDA DE FOTOS                     │
└─────────────────────────────────────────────────────────────────┘

1. SELECCIÓN DE ARCHIVO
   Usuario selecciona foto → input type="file"
      ↓
   onChange → handleFileChange()
      ↓
   Validaciones de seguridad

2. VALIDACIONES
   ✓ Tipo de archivo (MIME type)
   ✓ Extensión permitida (.jpg, .png, .webp, .gif)
   ✓ Tamaño máximo (10MB)
   ✓ Longitud de nombre (< 255 caracteres)
   ✓ Caracteres seguros en nombre
   ✓ Archivo no vacío

3. ALMACENAMIENTO LOCAL
   setPhotos({ ...photos, [fieldKey]: File })
      ↓
   File object guardado en estado React
   (NO se sube aún)

4. SUBMIT DEL FORMULARIO
   Usuario hace clic en "Guardar"
      ↓
   react-hook-form validation
      ↓
   Validación de fotos requeridas
      ↓
   handleSubmit()

5. SUBIDA A CLOUDINARY (Para cada foto)
   ┌─────────────────────────────────────────┐
   │ const formData = new FormData()         │
   │ formData.append('file', photoFile)      │
   │                                         │
   │ POST /cloudinary/upload                 │
   │ Authorization: Bearer <token>           │
   │                                         │
   │ Response: {                             │
   │   secure_url: "https://res.cloudinary...│
   │ }                                       │
   └─────────────────────────────────────────┘
      ↓
   URL guardada en array local

6. TRANSFORMACIÓN DTO
   mapInspectionDto(formData)
      ↓
   {
     mayorOffice: {
       procedureType: "...",
       observations: "...",
       photos: [url1, url2, url3]  ← URLs de Cloudinary
     }
   }

7. CREACIÓN DE INSPECCIÓN
   POST /inspections
      ↓
   Backend guarda todo (incluye photos URLs)
      ↓
   Base de datos:
   inspection.mayorOffice.photos = [url1, url2, url3]

8. ÉXITO
   Navigate to /admin/inspections-management
   Fotos disponibles para visualizar
```

---

## 🔄 Flujo de Subida Detallado

### Paso 1: Usuario Selecciona Foto

```jsx
// InspectionForm.jsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => handleFileChange(e, fieldKey)}
  id={`photo-${fieldKey}`}
  className="hidden"
/>
```

**Props importantes:**
- `accept="image/*"` - Solo permite seleccionar imágenes
- `hidden` - Input oculto, activado por label estilizado

### Paso 2: Validación del Archivo

```javascript
const handleFileChange = (e, fieldKey) => {
  const file = e.target.files?.[0];
  if (!file) {
    resetFileInput();
    return;
  }

  // 1. Validar MIME type
  if (!ALLOWED_IMAGE.test(file.type)) {
    setPhotoErrors({ [fieldKey]: "Solo se permiten imágenes (JPG/PNG/WEBP)." });
    return;
  }

  // 2. Validar caracteres en nombre
  if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(file.name)) {
    setPhotoErrors({ [fieldKey]: "Nombre de archivo contiene caracteres no permitidos." });
    return;
  }

  // 3. Validar extensión permitida
  if (!isAllowedImageType(file.name)) {
    setPhotoErrors({ [fieldKey]: "Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF." });
    return;
  }

  // 4. Validar tamaño (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    setPhotoErrors({ [fieldKey]: "La imagen supera 10MB." });
    return;
  }

  // 5. Validar longitud de nombre
  if (file.name.length > 255) {
    setPhotoErrors({ [fieldKey]: "Nombre de archivo muy largo (máximo 255 caracteres)." });
    return;
  }

  // 6. Validar que no esté vacío
  if (file.size === 0) {
    setPhotoErrors({ [fieldKey]: "El archivo está vacío." });
    return;
  }

  // ✅ TODO OK - Guardar en estado
  setPhotoErrors({ [fieldKey]: null });
  setPhotos({ ...photos, [fieldKey]: file });
};
```

### Paso 3: Validación de Fotos Requeridas

```javascript
const validateRequiredPhotos = (vals) => {
  const required = getRequiredPhotoKeys(vals); // Determina qué fotos son requeridas
  const missing = required.filter((k) => !photos[k]);

  setPhotoErrors((prev) => {
    const upd = { ...prev };
    required.forEach((k) => delete upd[k]);
    missing.forEach((k) => { upd[k] = "Esta foto es requerida."; });
    return upd;
  });

  return missing.length === 0;
};

// En handleSubmit
if (!validateRequiredPhotos(formData)) {
  Swal.fire('Error', 'Por favor complete todas las fotografías requeridas.', 'error');
  return;
}
```

### Paso 4: Subida a Cloudinary (Por Sección)

#### Mayor Office (Alcaldía) - 3 Fotos

```javascript
// InspectionForm.jsx - handleSubmit()
if (formData.dependency === "MayorOffice") {
  const photoKeys = ["mo1", "mo2", "mo3"];
  const photoUrls = [];

  for (const key of photoKeys) {
    if (photos[key]) {
      const fd = new FormData();
      fd.append("file", photos[key]);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
          method: "POST",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Error al subir ${key}`);
        }

        const data = await res.json();
        photoUrls.push(data.secure_url); // URL de Cloudinary
      } catch (err) {
        console.error(`Error subiendo ${key}:`, err);
        throw err;
      }
    }
  }

  // Incluir URLs en el payload
  payload.mayorOffice = {
    ...payload.mayorOffice,
    photos: photoUrls,
  };
}
```

#### Constructions - Procedimientos con Fotos

```javascript
if (formData.dependency === "Constructions") {
  const { procedure } = formData.constructions;

  // ANTIGUEDAD - 3 fotos
  if (procedure === "Antiguedad") {
    const photoKeys = ["antiguedad1", "antiguedad2", "antiguedad3"];
    const photoUrls = [];

    for (const key of photoKeys) {
      if (photos[key]) {
        const fd = new FormData();
        fd.append("file", photos[key]);

        const res = await fetch(`${API_URL}/cloudinary/upload`, {
          method: "POST",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        photoUrls.push(data.secure_url);
      }
    }

    payload.constructions.data.photos = photoUrls;
  }

  // ANULACIÓN PC - 1 foto
  if (procedure === "AnulacionPC" && photos.pc1) {
    const fd = new FormData();
    fd.append("file", photos.pc1);

    const res = await fetch(`${API_URL}/cloudinary/upload`, {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    payload.constructions.data.photos = [data.secure_url];
  }

  // INSPECCIÓN GENERAL - 1 foto
  if (procedure === "InspeccionGeneral" && photos.ig1) {
    // Similar...
    payload.constructions.data.photos = [url];
  }

  // RECIBIDO DE OBRA - 1 foto
  if (procedure === "RecibidoObra" && photos.ro1) {
    // Similar...
    payload.constructions.data.photos = [url];
  }
}
```

#### ZMT Concession - 3 Fotos

```javascript
if (formData.dependency === "MaritimeZone") {
  const photoKeys = ["zmt1", "zmt2", "zmt3"];
  const photoUrls = [];

  for (const key of photoKeys) {
    if (photos[key]) {
      const fd = new FormData();
      fd.append("file", photos[key]);

      const res = await fetch(`${API_URL}/cloudinary/upload`, {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      photoUrls.push(data.secure_url);
    }
  }

  payload.zmtConcession.photos = photoUrls;
}
```

#### Work Closure - 3 Fotos

```javascript
if (formData.dependency === "WorkClosure") {
  const photoKeys = ["wc1", "wc2", "wc3"];
  const photoUrls = [];

  for (const key of photoKeys) {
    if (photos[key]) {
      const fd = new FormData();
      fd.append("file", photos[key]);

      const res = await fetch(`${API_URL}/cloudinary/upload`, {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      photoUrls.push(data.secure_url);
    }
  }

  payload.workClosure = {
    ...payload.workClosure,
    photos: photoUrls, // IMPORTANTE: Campo correcto es 'photos', no 'photoUrls'
  };
}
```

### Paso 5: Transformación DTO

```javascript
// mapInspectionDto.js

// Mayor Office
if (dependency === "MayorOffice" && mayorOffice) {
  dto.mayorOffice = {
    procedureType: nullIfEmpty(mayorOffice.procedureType),
    observations: nullIfEmpty(mayorOffice.observations),
    photos: mayorOffice.photos || [], // ← URLs de Cloudinary
  };
}

// Constructions - Antiguedad
if (procedure === "Antiguedad" && data) {
  dto.antiquity = {
    propertyNumber: nullIfEmpty(data.propertyNumber),
    estimatedAntiquity: nullIfEmpty(data.estimatedAge),
    photos: data.photos || [], // ← URLs de Cloudinary
  };
}

// ZMT Concession
if (dependency === "MaritimeZone" && zmtConcession) {
  dto.concession = {
    fileNumber: nullIfEmpty(zmtConcession.fileNumber),
    concessionType: nullIfEmpty(zmtConcession.concessionType),
    grantedAt: zmtConcession.grantedAt,
    expiresAt: zmtConcession.expiresAt || null,
    observations: zmtConcession.observations || "",
    photos: zmtConcession.photos || [], // ← URLs de Cloudinary
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
    photos: wc.photos || [], // ← CORRECTO: Campo 'photos', no 'photoUrls'
  };
}
```

### Paso 6: Creación de Inspección

```javascript
// useInspections.js
const createInspectionFromForm = useCallback(async (formData) => {
  try {
    setLoading(true);

    // 1. Transformar datos (incluye fotos)
    const dto = mapInspectionDto(formData);

    // 2. Crear inspección con fotos incluidas
    const newInspection = await inspectionsService.createInspection(dto);

    // 3. Refrescar lista
    await fetchInspections(initialParamsRef.current);

    return newInspection;
  } catch (err) {
    setError(err.message || 'Error al crear inspección');
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchInspections]);
```

**Request al backend:**
```json
POST /inspections
Content-Type: application/json
Authorization: Bearer <token>

{
  "inspectionDate": "2024-01-15",
  "procedureNumber": "2024-001",
  "applicantType": "Persona Física",
  "dependency": "MayorOffice",
  "inspectorIds": [5],
  "location": {
    "district": "SantaCruz",
    "exactAddress": "Calle Principal, 100m norte"
  },
  "individualRequest": {
    "firstName": "Juan",
    "lastName1": "Pérez",
    "lastName2": "García",
    "physicalId": "1-1234-5678"
  },
  "mayorOffice": {
    "procedureType": "Permiso",
    "observations": "Observaciones",
    "photos": [
      "https://res.cloudinary.com/your-cloud/image/upload/v123/photo1.jpg",
      "https://res.cloudinary.com/your-cloud/image/upload/v123/photo2.jpg",
      "https://res.cloudinary.com/your-cloud/image/upload/v123/photo3.jpg"
    ]
  }
}
```

**Backend guarda:**
```sql
INSERT INTO inspection (...) VALUES (...);
INSERT INTO mayor_office (inspection_id, procedure_type, observations, photos) 
VALUES (123, 'Permiso', 'Observaciones', '["url1", "url2", "url3"]');
```

---

## ✅ Validación de Archivos

### Validaciones Implementadas

#### 1. Tipo MIME

```javascript
const ALLOWED_IMAGE = /^image\//;

if (!ALLOWED_IMAGE.test(file.type)) {
  // Error: Solo imágenes
}
```

**Tipos permitidos:**
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

#### 2. Extensión de Archivo

```javascript
// security-validators.js
const ALLOWED_IMAGE_TYPES = /\.(jpg|jpeg|png|gif|webp)$/i;

export const isAllowedImageType = (filename) => {
  if (typeof filename !== 'string') return false;
  return ALLOWED_IMAGE_TYPES.test(filename);
};
```

#### 3. Tamaño Máximo

```javascript
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_SIZE) {
  // Error: Archivo muy grande
}
```

#### 4. Nombre Seguro

```javascript
const SAFE_CHARS = /^[a-zA-Z0-9\s\-_.()]+$/;

if (!SAFE_CHARS.test(file.name)) {
  // Error: Caracteres no permitidos
}

// Validación adicional
if (file.name.length > 255) {
  // Error: Nombre muy largo
}
```

#### 5. Archivo No Vacío

```javascript
if (file.size === 0) {
  // Error: Archivo vacío
}
```

### Validación en PhotoField Component

```jsx
const PhotoField = ({ fieldKey, label, photos, setPhotos, photoErrors, setPhotoErrors }) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetFileInput();
      return;
    }

    // Ejecutar TODAS las validaciones
    if (!ALLOWED_IMAGE.test(file.type)) {
      setPhotoErrors({ [fieldKey]: "Solo se permiten imágenes (JPG/PNG/WEBP)." });
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(file.name)) {
      setPhotoErrors({ [fieldKey]: "Nombre de archivo contiene caracteres no permitidos." });
      return;
    }

    if (!isAllowedImageType(file.name)) {
      setPhotoErrors({ [fieldKey]: "Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoErrors({ [fieldKey]: "La imagen supera 10MB." });
      return;
    }

    if (file.name.length > 255) {
      setPhotoErrors({ [fieldKey]: "Nombre de archivo muy largo (máximo 255 caracteres)." });
      return;
    }

    if (file.size === 0) {
      setPhotoErrors({ [fieldKey]: "El archivo está vacío." });
      return;
    }

    // ✅ Validación exitosa
    setPhotoErrors({ [fieldKey]: null });
    setPhotos({ ...photos, [fieldKey]: file });
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id={`photo-${fieldKey}`}
        className="hidden"
      />
      <label htmlFor={`photo-${fieldKey}`} className={/* estilos */}>
        {/* UI del selector */}
      </label>

      {/* Mostrar archivo seleccionado */}
      {photos[fieldKey] && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <div className="text-sm text-slate-700">{photos[fieldKey].name}</div>
          <div className="text-xs text-slate-500">{formatFileSize(photos[fieldKey].size)}</div>
        </div>
      )}

      {/* Mostrar errores */}
      {photoErrors[fieldKey] && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" /> {photoErrors[fieldKey]}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## ☁️ Integración con Cloudinary

### Endpoint del Backend

```
POST /cloudinary/upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

FormData:
  file: File (binary data)
```

### Request desde Frontend

```javascript
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/cloudinary/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al subir imagen');
  }

  const data = await response.json();
  return data.secure_url; // URL segura de Cloudinary
};
```

### Response del Backend

```json
{
  "secure_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1705000000/inspecciones/abc123.jpg",
  "public_id": "inspecciones/abc123",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "bytes": 1234567
}
```

### Cloudinary Helper (cloudinary.js)

```javascript
// src/utils/cloudinary.js
const CLOUDINARY_UPLOAD_URL = `${import.meta.env.VITE_API_URL}/cloudinary/upload`;

export const uploadImageToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir imagen');
    }

    const data = await response.json();
    return data.secure_url; // Retorna URL segura
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, token) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadImageToCloudinary(file, token)
  );

  return await Promise.all(uploadPromises);
};
```

### Validación de URLs de Cloudinary

```javascript
// security-validators.js
const CLOUDINARY_URL_PATTERN = /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9\-_]+\/image\/upload\/.+\.(jpg|jpeg|png|gif|webp)$/i;

export const isValidCloudinaryURL = (url) => {
  if (typeof url !== 'string') return false;
  return CLOUDINARY_URL_PATTERN.test(url);
};
```

---

## 📦 PhotoField Component

### Props

```typescript
interface PhotoFieldProps {
  fieldKey: string;          // Identificador único (ej: "mo1", "zmt2")
  label: string;             // Etiqueta mostrada al usuario
  photos: { [key: string]: File | null }; // Estado de fotos
  setPhotos: (photos: any) => void;       // Setter de fotos
  photoErrors: { [key: string]: string }; // Errores por campo
  setPhotoErrors: (errors: any) => void;  // Setter de errores
}
```

### Uso

```jsx
<PhotoField
  fieldKey="mo1"
  label="Fotografía 1"
  photos={photos}
  setPhotos={setPhotos}
  photoErrors={photoErrors}
  setPhotoErrors={setPhotoErrors}
/>
```

### Implementación Completa

```jsx
const PhotoField = ({ fieldKey, label, photos, setPhotos, photoErrors, setPhotoErrors }) => {
  const resetFileInput = () => {
    const input = document.getElementById(`photo-${fieldKey}`);
    if (input) input.value = "";
    setPhotos((p) => ({ ...p, [fieldKey]: null }));
    setPhotoErrors((e) => ({ ...e, [fieldKey]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetFileInput();
      return;
    }

    // Validaciones (ver sección anterior)
    // ...

    // Si todo OK:
    setPhotoErrors((e) => ({ ...e, [fieldKey]: null }));
    setPhotos((p) => ({ ...p, [fieldKey]: file }));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Input oculto */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id={`photo-${fieldKey}`}
        className="hidden"
      />

      {/* Label estilizado como botón */}
      <label 
        htmlFor={`photo-${fieldKey}`} 
        className={`relative flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          photos[fieldKey] ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <div className={`p-3 rounded-full mb-2 ${
          photos[fieldKey] ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
        }`}>
          {photos[fieldKey] ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
        </div>
        
        <div className={`text-base font-medium ${
          photos[fieldKey] ? "text-blue-700" : "text-slate-600"
        }`}>
          {photos[fieldKey] ? "Fotografía seleccionada" : "Seleccionar fotografía"}
        </div>
      </label>

      {/* Mostrar archivo seleccionado */}
      {photos[fieldKey] && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <div className="text-sm text-slate-700 truncate">{photos[fieldKey].name}</div>
          <div className="text-xs text-slate-500">{formatFileSize(photos[fieldKey].size)}</div>
        </div>
      )}

      {/* Botón para eliminar */}
      {photos[fieldKey] && (
        <button
          type="button"
          onClick={resetFileInput}
          className="text-red-600 text-sm hover:text-red-800"
        >
          <X className="w-4 h-4 mr-1" /> Eliminar
        </button>
      )}

      {/* Mostrar errores */}
      {photoErrors[fieldKey] && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-red-600 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" /> {photoErrors[fieldKey]}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 🗂️ Secciones con Fotos

### 1. Mayor Office (Alcaldía)
- **Fotos**: 3 requeridas
- **Keys**: `mo1`, `mo2`, `mo3`
- **DTO Field**: `mayorOffice.photos`

### 2. Constructions - Antiguedad
- **Fotos**: 3 requeridas
- **Keys**: `antiguedad1`, `antiguedad2`, `antiguedad3`
- **DTO Field**: `antiquity.photos`

### 3. Constructions - Anulación PC
- **Fotos**: 1 requerida
- **Keys**: `pc1`
- **DTO Field**: `pcCancellation.photos`

### 4. Constructions - Inspección General
- **Fotos**: 1 requerida
- **Keys**: `ig1`
- **DTO Field**: `generalInspection.photos`

### 5. Constructions - Recibido de Obra
- **Fotos**: 1 requerida
- **Keys**: `ro1`
- **DTO Field**: `workReceipt.photos`

### 6. ZMT Concession
- **Fotos**: 3 requeridas
- **Keys**: `zmt1`, `zmt2`, `zmt3`
- **DTO Field**: `concession.photos`

### 7. Work Closure
- **Fotos**: 3 requeridas
- **Keys**: `wc1`, `wc2`, `wc3`
- **DTO Field**: `workClosure.photos`

### Tabla Resumen

| Sección | # Fotos | Keys | DTO Field | Requeridas |
|---------|---------|------|-----------|------------|
| Mayor Office | 3 | mo1, mo2, mo3 | `mayorOffice.photos` | ✅ |
| ZMT Concession | 3 | zmt1, zmt2, zmt3 | `concession.photos` | ✅ |
| Work Closure | 3 | wc1, wc2, wc3 | `workClosure.photos` | ✅ |
| Antiguedad | 3 | antiguedad1, antiguedad2, antiguedad3 | `antiquity.photos` | ✅ |
| Anulación PC | 1 | pc1 | `pcCancellation.photos` | ✅ |
| Inspección General | 1 | ig1 | `generalInspection.photos` | ✅ |
| Recibido de Obra | 1 | ro1 | `workReceipt.photos` | ✅ |

---

## 🔒 Seguridad

### 1. Validación de Tipo MIME
Previene subida de archivos maliciosos disfrazados de imágenes.

```javascript
if (!ALLOWED_IMAGE.test(file.type)) {
  // Rechazar
}
```

### 2. Validación de Extensión
Doble verificación mediante extensión del nombre.

```javascript
if (!isAllowedImageType(file.name)) {
  // Rechazar
}
```

### 3. Sanitización de Nombres
Previene inyección de caracteres maliciosos.

```javascript
if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(file.name)) {
  // Rechazar
}
```

### 4. Límite de Tamaño
Previene ataques de denegación de servicio (DoS).

```javascript
if (file.size > 10 * 1024 * 1024) {
  // Rechazar (10MB max)
}
```

### 5. Validación de URLs
Solo acepta URLs de Cloudinary con formato seguro.

```javascript
const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\/.+\.(jpg|jpeg|png|webp|gif)$/i;

if (!CLOUDINARY_URL.test(url)) {
  // Rechazar
}
```

### 6. Autenticación en Upload
El endpoint de Cloudinary requiere JWT válido.

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 7. HTTPS Obligatorio
Todas las comunicaciones usan HTTPS para prevenir man-in-the-middle.

---

## 🐛 Solución de Problemas

### Problema: Fotos no se guardan en BD

**Síntoma**: `photos: null` en la base de datos

**Causa**: Las fotos se suben DESPUÉS de crear la inspección (arquitectura antigua)

**Solución**: 
1. Subir fotos a Cloudinary ANTES de crear inspección
2. Incluir URLs en el payload de creación
3. Verificar que el DTO mapper incluye el campo `photos`

```javascript
// ❌ INCORRECTO
const newInspection = await createInspection(dto);
await uploadPhotos(newInspection.id, photos); // Muy tarde

// ✅ CORRECTO
const photoUrls = await uploadPhotosToCloudinary(photos);
const dto = {
  mayorOffice: {
    photos: photoUrls // URLs incluidas desde el inicio
  }
};
const newInspection = await createInspection(dto);
```

---

### Problema: Error "unknown section"

**Síntoma**: Backend rechaza con "unknown section: mayorOfficePhotos"

**Causa**: Frontend envía parámetro `section` que el backend no espera

**Solución**: Eliminar el parámetro `section` de todas las llamadas

```javascript
// ❌ INCORRECTO
await uploadPhotos(inspectionId, files, "mayorOfficePhotos");

// ✅ CORRECTO (usar endpoint de Cloudinary directamente)
const formData = new FormData();
formData.append('file', file);
const response = await fetch(`${API_URL}/cloudinary/upload`, {
  method: 'POST',
  body: formData
});
```

---

### Problema: Fotos se suben pero no aparecen

**Síntoma**: Cloudinary tiene las fotos pero no aparecen en la inspección

**Causa**: El DTO mapper usa el campo incorrecto (ej: `photoUrls` en lugar de `photos`)

**Solución**: Verificar nombres de campos en `mapInspectionDto.js`

```javascript
// ❌ INCORRECTO
dto.workClosure = {
  photoUrls: wc.photos // Campo incorrecto
};

// ✅ CORRECTO
dto.workClosure = {
  photos: wc.photos // Campo correcto esperado por el backend
};
```

---

### Problema: Error de validación al submit

**Síntoma**: "Por favor complete todas las fotografías requeridas"

**Causa**: Las fotos requeridas no están seleccionadas

**Solución**: 
1. Verificar que `getRequiredPhotoKeys` detecta correctamente la dependencia
2. Asegurarse de que las fotos están en el estado `photos`
3. Validar que los fieldKeys coinciden

```javascript
const getRequiredPhotoKeys = (vals) => {
  if (vals.dependency === "MayorOffice") {
    return ["mo1", "mo2", "mo3"];
  }
  // ...
};
```

---

### Problema: Error al subir a Cloudinary

**Síntoma**: "Error al subir imagen" en la consola

**Causas posibles**:
1. Token JWT inválido o expirado
2. Archivo muy grande (> límite del backend)
3. Formato no soportado
4. Problemas de red

**Solución**:
1. Verificar que el token está en localStorage
2. Reducir tamaño/resolución de la imagen
3. Convertir a formato soportado (JPG/PNG)
4. Revisar logs del backend

```javascript
try {
  const response = await fetch(`${API_URL}/cloudinary/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Cloudinary error:', error);
    throw new Error(error.message);
  }
} catch (err) {
  console.error('Upload failed:', err);
  Swal.fire('Error', `No se pudo subir la imagen: ${err.message}`, 'error');
}
```

---

## 📚 Referencias

- **Archivos principales:**
  - `src/components/inspections/InspectionForm.jsx` (líneas 101-200, 2137-2455)
  - `src/utils/mapInspectionDto.js` (líneas 95-260)
  - `src/utils/cloudinary.js`
  - `src/utils/security-validators.js`

- **Endpoints:**
  - `POST /cloudinary/upload` - Subir foto a Cloudinary
  - `POST /inspections` - Crear inspección con fotos

- **Documentación externa:**
  - [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
  - [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
  - [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File)

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
