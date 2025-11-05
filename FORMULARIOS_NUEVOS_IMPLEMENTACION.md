# Implementación de Nuevos Formularios

## 📋 Resumen de Implementación

Se implementaron 3 nuevos formularios para el sistema de inspecciones municipales:

1. **Cobros (Collections)**
2. **Clausuras de Obra (Work Closures)**
3. **Plataforma de Servicios (Platform and Services)**

---

## 🔧 Cambios Realizados

### 1. **Enums Actualizados** (`src/domain/enums.js`)

#### VisitNumber
```javascript
export const VisitNumber = Object.freeze({
  VISIT_1: "visita_1",  // Primera visita
  VISIT_2: "visita_2",  // Segunda visita
  VISIT_3: "visita_3"   // Tercera visita
});
```

**Justificación**: Los valores ahora coinciden con lo que espera el backend (`visita_1`, `visita_2`, `visita_3`).

---

### 2. **Utility para Cloudinary** (`src/utils/cloudinary.js`)

Se creó un archivo de utilidades para manejar la subida de imágenes a Cloudinary:

#### Funciones Principales:

- **`uploadImageToCloudinary(file, token)`**: Sube una imagen individual
- **`uploadMultipleImages(files, token)`**: Sube múltiples imágenes en paralelo
- **`isValidImage(file)`**: Valida formato y tamaño de imagen
- **`validateMultipleImages(files)`**: Valida múltiples archivos y separa válidos/inválidos

#### Configuración:
```javascript
const CLOUDINARY_UPLOAD_URL = `${import.meta.env.VITE_API_URL}/cloudinary/upload`;
```

**Validaciones**:
- Formatos permitidos: JPG, PNG, GIF, WEBP
- Tamaño máximo: 5MB

---

### 3. **Mapeo de DTOs** (`src/utils/mapInspectionDto.js`)

Se actualizó el mapeo para los 3 nuevos formularios:

#### Service Platform (Nombre correcto: platformAndService)
```javascript
if (dependency === "ServicePlatform" && values.platformAndService) {
  const pas = values.platformAndService;
  dto.platformAndService = {
    procedureNumber: pas.procedureNumber || "",
    observation: nullIfEmpty(pas.observation),
  };
}
```

**Nota**: El frontend usa `ServicePlatform` pero el backend espera `platformAndService`.

#### Collections (Ya estaba implementado)
```javascript
dto.collection = {
  notifierSignatureUrl: nullIfEmpty(col.notifierSignatureUrl),
  nobodyPresent: col.nobodyPresent || null,
  wrongAddress: col.wrongAddress || null,
  movedAddress: col.movedAddress || null,
  refusedToSign: col.refusedToSign || null,
  notLocated: col.notLocated || null,
  other: nullIfEmpty(col.other),
};
```

#### Work Closure (Ya estaba implementado)
```javascript
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
```

---

### 4. **Formulario de Inspecciones** (`src/components/inspections/InspectionForm.jsx`)

#### 4.1 Validaciones Zod (Ya implementadas)

Todos los campos de los 3 formularios ya tenían validaciones implementadas:

**Cobros**:
- `col_notifierSignatureUrl`: URL opcional con validación de longitud (500 chars)
- `col_nobodyPresent`, `col_wrongAddress`, etc.: Checkboxes booleanos
- `col_other`: String opcional (300 chars)

**Clausura de Obra**:
- `wc_propertyNumber`, `wc_cadastralNumber`: Al menos uno requerido
- `wc_visitNumber`: Requerido (enum)
- `wc_actions`: Requerido (500 chars)
- `wc_workReceipt`: Boolean

**Plataforma de Servicios**:
- `ps_procedureNumber`: Requerido (100 chars)
- `ps_observation`: Opcional (1000 chars)

#### 4.2 Componente CollectionsForm

**ANTES**:
```javascript
<Input 
  placeholder="URL de la firma o ruta del archivo" 
  {...register("col_notifierSignatureUrl")}
/>
```

**DESPUÉS**:
```javascript
<PhotoField
  key="col_signature"
  fieldKey="col_signature"
  label="Firma del Notificador"
  photos={photos}
  setPhotos={setPhotos}
  photoErrors={photoErrors}
  setPhotoErrors={setPhotoErrors}
/>
```

**Cambios**:
1. Se cambió de campo de texto a campo de subida de archivo
2. Utiliza el componente `PhotoField` existente para consistencia
3. La firma se sube a Cloudinary ANTES de enviar el formulario
4. La URL resultante se incluye en el payload de `collection`

#### 4.3 Componente WorkClosureForm

**ANTES**:
```javascript
<option value="Visita 1">Visita 1</option>
<option value="Visita 2">Visita 2</option>
<option value="Visita 3">Visita 3</option>
```

**DESPUÉS**:
```javascript
<option value={VisitNumber.VISIT_1}>Visita 1</option>
<option value={VisitNumber.VISIT_2}>Visita 2</option>
<option value={VisitNumber.VISIT_3}>Visita 3</option>
```

**Cambios**:
1. Se utilizan los valores del enum `VisitNumber`
2. Los valores ahora son `visita_1`, `visita_2`, `visita_3` (compatibles con backend)
3. Ya incluye 3 campos `PhotoField` para subir fotos de la clausura

#### 4.4 Estado de Fotos

```javascript
const [photos, setPhotos] = useState({
  antiguedad1: null, antiguedad2: null, antiguedad3: null,
  pc1: null, ig1: null, ro1: null,
  mo1: null, mo2: null, mo3: null,
  zmt1: null, zmt2: null, zmt3: null,
  wc1: null, wc2: null, wc3: null,      // ✅ Fotos de Clausura
  col_signature: null,                    // ✅ Firma de Cobros
});
```

#### 4.5 Subida de Firma a Cloudinary (onFinalSubmit)

Se agregó lógica para subir la firma del notificador ANTES de crear la inspección:

```javascript
// Subir firma del notificador a Cloudinary si existe
let signatureUrl = null;
if (values.dependency === Dependency.Collections && photos.col_signature) {
  console.log('📤 Uploading collection signature to Cloudinary...');
  try {
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
    console.log('✅ Signature uploaded:', signatureUrl);
  } catch (error) {
    console.error('❌ Error uploading signature:', error);
    throw new Error('Error al subir la firma del notificador');
  }
}

// Cobros (Collections)
const collection = values.dependency === Dependency.Collections ? {
  notifierSignatureUrl: signatureUrl || null,  // ✅ URL de Cloudinary
  nobodyPresent: values.col_nobodyPresent ? 'X' : null,
  wrongAddress: values.col_wrongAddress ? 'X' : null,
  movedAddress: values.col_movedAddress ? 'X' : null,
  refusedToSign: values.col_refusedToSign ? 'X' : null,
  notLocated: values.col_notLocated ? 'X' : null,
  other: values.col_other || null,
} : undefined;
```

**Flujo**:
1. Si el usuario seleccionó **Cobros** como dependencia Y subió una firma
2. Se sube la firma a Cloudinary usando el endpoint `/cloudinary/upload`
3. Se obtiene la URL segura (`secure_url`)
4. Se incluye la URL en el payload de `collection.notifierSignatureUrl`
5. El backend recibe la URL y la guarda en la base de datos

#### 4.6 photosBySection

```javascript
const photosBySection = {
  antiguedadPhotos: [photos.antiguedad1, photos.antiguedad2, photos.antiguedad3].filter(Boolean),
  pcCancellationPhotos: [photos.pc1].filter(Boolean),
  generalInspectionPhotos: [photos.ig1].filter(Boolean),
  workReceiptPhotos: [photos.ro1].filter(Boolean),
  mayorOfficePhotos: [photos.mo1, photos.mo2, photos.mo3].filter(Boolean),
  zmtConcessionPhotos: [photos.zmt1, photos.zmt2, photos.zmt3].filter(Boolean),
  workClosurePhotos: [photos.wc1, photos.wc2, photos.wc3].filter(Boolean),  // ✅
};
```

**Nota**: `collectionSignature` NO se incluye aquí porque ya se subió a Cloudinary y la URL se envía en el payload inicial.

---

## 📤 Payload Final

### Ejemplo de Inspección con Cobros

```json
{
  "inspectionDate": "2025-11-04",
  "procedureNumber": "INSP-2025-001",
  "inspectorIds": [1, 2],
  "applicantType": "individual",
  
  "individualRequest": {
    "firstName": "Juan",
    "lastName1": "Pérez",
    "lastName2": "López",
    "physicalId": "1-1234-5678"
  },
  
  "location": {
    "district": "SantaCruz",
    "exactAddress": "100m norte de la iglesia"
  },
  
  "dependency": "Collections",
  
  "collection": {
    "notifierSignatureUrl": "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/signatures/firma123.jpg",
    "nobodyPresent": "X",
    "wrongAddress": null,
    "movedAddress": null,
    "refusedToSign": null,
    "notLocated": null,
    "other": "Casa cerrada con candado"
  }
}
```

### Ejemplo de Inspección con Clausura de Obra

```json
{
  "inspectionDate": "2025-11-04",
  "procedureNumber": "INSP-2025-002",
  "inspectorIds": [1],
  "applicantType": "ANONIMO",
  
  "location": {
    "district": "SantaCruz",
    "exactAddress": "200m sur del parque"
  },
  
  "dependency": "WorkClosure",
  
  "workClosure": {
    "propertyNumber": "12345-000",
    "cadastralNumber": "5-987654",
    "contractNumber": "CONT-2025-001",
    "permitNumber": "PERM-123",
    "assessedArea": "150 m²",
    "builtArea": "120 m²",
    "visitNumber": "visita_1",
    "workReceipt": true,
    "actions": "Se procedió a clausurar el inmueble por construcción sin permiso",
    "observations": "El propietario no se encontraba presente",
    "photoUrls": []
  }
}
```

**Nota**: Las fotos se suben DESPUÉS de crear la inspección mediante el endpoint `/inspections/:id/photos?section=workClosurePhotos`.

### Ejemplo de Inspección con Plataforma de Servicios

```json
{
  "inspectionDate": "2025-11-04",
  "procedureNumber": "INSP-2025-003",
  "inspectorIds": [2],
  "applicantType": "JURIDICA",
  
  "legalEntityRequest": {
    "legalName": "Constructora ABC S.A.",
    "legalId": "3-101-123456"
  },
  
  "location": {
    "district": "Tamarindo",
    "exactAddress": "Frente al hotel"
  },
  
  "dependency": "ServicePlatform",
  
  "platformAndService": {
    "procedureNumber": "PS-2025-001",
    "observation": "Plataforma instalada correctamente, cumple con todas las normativas vigentes."
  }
}
```

---

## ✅ Validaciones Importantes

### Cobros (Collections)
- **Firma del notificador** O **Motivo de no firma**: Al menos uno es requerido
- Si hay firma: se sube a Cloudinary primero
- Checkboxes: Se envían como `'X'` si están marcados, `null` si no

### Clausura de Obra (Work Closure)
- **Número de finca** O **Número de catastro**: Al menos uno requerido
- **Número de visita**: Requerido (valores: `visita_1`, `visita_2`, `visita_3`)
- **Acciones**: Requerido (500 chars máximo)
- **Fotos**: Se suben después de crear la inspección

### Plataforma de Servicios (Platform and Services)
- **Número de trámite**: Requerido (100 chars máximo)
- **Observación**: Opcional (sin límite en frontend, pero backend puede tener límite)

---

## 🚨 Errores Comunes y Soluciones

### Error: "Debe ingresar la firma del notificador o seleccionar un motivo de no firma"
**Causa**: No se subió firma ni se seleccionó ningún checkbox de motivo
**Solución**: Subir una firma O seleccionar al menos un motivo

### Error: "Debe ingresar número de finca o número de catastro"
**Causa**: Ambos campos están vacíos en Clausura de Obra
**Solución**: Llenar al menos uno de los dos campos

### Error: "Número de visita requerido"
**Causa**: No se seleccionó el número de visita en Clausura de Obra
**Solución**: Seleccionar Visita 1, 2 o 3

### Error: "Acciones requeridas"
**Causa**: Campo "Acciones" está vacío en Clausura de Obra
**Solución**: Escribir las acciones tomadas durante la visita

### Error: "Failed to upload signature"
**Causa**: Error al subir la firma a Cloudinary (red, formato, tamaño, etc.)
**Solución**: 
- Verificar conexión a internet
- Verificar que el archivo sea una imagen válida (JPG, PNG, WEBP)
- Verificar que el tamaño sea menor a 10MB
- Verificar que el token JWT sea válido

---

## 📊 Iconos Asignados

| Dependencia | Ícono | Color |
|------------|-------|-------|
| Cobros (Collections) | `DollarSign` | Verde |
| Clausura de Obra (Work Closure) | `Ban` | Rojo (#DC2626) |
| Plataforma de Servicios (Service Platform) | `Monitor` | Azul |

---

## 🔄 Flujo Completo de Creación

### Para Cobros:
1. Usuario llena el formulario Step1 (solicitante) ✅
2. Usuario llena el formulario Step2 (ubicación) ✅
3. Usuario selecciona "Cobros" en Step3 ✅
4. Usuario llena formulario de Cobros en Step4:
   - Sube firma del notificador (opcional si hay motivo)
   - Selecciona motivos de no firma (opcional si hay firma)
   - Escribe otro motivo (opcional)
5. Usuario hace clic en "Finalizar Inspección"
6. **Sistema sube firma a Cloudinary primero** 📤
7. Sistema obtiene URL de Cloudinary ✅
8. Sistema crea inspección con URL de firma incluida en payload ✅
9. Sistema muestra mensaje de éxito ✅

### Para Clausura de Obra:
1. Usuario llena el formulario Step1 (solicitante) ✅
2. Usuario llena el formulario Step2 (ubicación) ✅
3. Usuario selecciona "Clausura de Obra" en Step3 ✅
4. Usuario llena formulario de Clausura en Step4:
   - Ingresa número de finca O número de catastro (requerido)
   - Llena campos opcionales (contrato, permiso, áreas)
   - Selecciona número de visita (requerido)
   - Marca checkbox de recibo de obra (opcional)
   - Escribe acciones (requerido)
   - Escribe observaciones (opcional)
   - Sube fotos (opcional pero recomendado)
5. Usuario hace clic en "Finalizar Inspección"
6. Sistema crea inspección ✅
7. **Sistema sube fotos DESPUÉS de crear inspección** 📤
8. Sistema muestra mensaje de éxito ✅

### Para Plataforma de Servicios:
1. Usuario llena el formulario Step1 (solicitante) ✅
2. Usuario llena el formulario Step2 (ubicación) ✅
3. Usuario selecciona "Plataformas de servicios" en Step3 ✅
4. Usuario llena formulario de Plataforma en Step4:
   - Ingresa número de trámite (requerido)
   - Escribe observación (opcional)
5. Usuario hace clic en "Finalizar Inspección"
6. Sistema crea inspección ✅
7. Sistema muestra mensaje de éxito ✅

---

## 📝 Notas Adicionales

1. **Nombre del campo en backend**: `platformAndService` (no `servicePlatform`)
2. **Checkboxes de Cobros**: Se convierten a `'X'` o `null` (no `true/false`)
3. **Número de visita**: Usa valores del enum (`visita_1`, `visita_2`, `visita_3`)
4. **Firma del notificador**: Se sube a Cloudinary ANTES de crear inspección
5. **Fotos de clausura**: Se suben DESPUÉS de crear inspección (igual que otras fotos)

---

## 🎯 Testing Recomendado

### Cobros:
- [ ] Crear inspección con firma del notificador (sin motivos)
- [ ] Crear inspección con motivos de no firma (sin firma)
- [ ] Crear inspección con firma Y motivos
- [ ] Validar que al menos uno (firma o motivo) sea requerido
- [ ] Verificar que la firma se suba correctamente a Cloudinary
- [ ] Verificar que la URL se guarde en la base de datos

### Clausura de Obra:
- [ ] Crear inspección con solo número de finca
- [ ] Crear inspección con solo número de catastro
- [ ] Crear inspección con ambos números
- [ ] Probar cada número de visita (1, 2, 3)
- [ ] Validar que "Acciones" sea requerido
- [ ] Subir fotos y verificar que se guarden
- [ ] Marcar checkbox de "Recibo de obra"

### Plataforma de Servicios:
- [ ] Crear inspección con número de trámite
- [ ] Crear inspección con observación
- [ ] Validar que número de trámite sea requerido
- [ ] Verificar que se guarde correctamente en backend

---

**Fecha de implementación**: 4 de noviembre, 2025  
**Versión**: 1.0.0  
**Backend URL**: https://inspecciones-muni-santa-cruz-production.up.railway.app
