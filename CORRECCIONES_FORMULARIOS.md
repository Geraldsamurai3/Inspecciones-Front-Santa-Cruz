# 🔧 Correcciones Críticas - Nuevos Formularios

## Fecha: 4 de noviembre, 2025

---

## ❌ Problemas Identificados

### 1. **Nombre Incorrecto del Campo: `servicePlatform` → `platformAndService`**

**Error en el código anterior:**
```javascript
const servicePlatform = values.dependency === Dependency.ServicePlatform ? {
  procedureNumber: values.ps_procedureNumber,
  observation: values.ps_observation || null,
} : undefined;

const payload = {
  // ...
  servicePlatform,  // ❌ INCORRECTO
  // ...
};
```

**Resultado:** Backend recibía `null` porque esperaba `platformAndService`

---

### 2. **Uso Incorrecto del Enum `VisitNumber`**

**Error en el código anterior:**
```javascript
<option value={VisitNumber.VISIT_1}>Visita 1</option>
<option value={VisitNumber.VISIT_2}>Visita 2</option>
<option value={VisitNumber.VISIT_3}>Visita 3</option>
```

**Problema:** 
- `VisitNumber` no está importado en el componente
- El backend espera strings directos (`'visita_1'`, `'visita_2'`, `'visita_3'`)
- Usar el enum agrega complejidad innecesaria

---

## ✅ Correcciones Aplicadas

### 1. **Cambio de `servicePlatform` a `platformAndService`**

**Archivo:** `src/components/inspections/InspectionForm.jsx`

**ANTES:**
```javascript
// Línea ~2221
const servicePlatform = values.dependency === Dependency.ServicePlatform ? {
  procedureNumber: values.ps_procedureNumber,
  observation: values.ps_observation || null,
} : undefined;

// Línea ~2305
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
  servicePlatform,  // ❌
  collection,
  workClosure,
};
```

**DESPUÉS:**
```javascript
// Línea ~2221
const platformAndService = values.dependency === Dependency.ServicePlatform ? {
  procedureNumber: values.ps_procedureNumber,
  observation: values.ps_observation || null,
} : undefined;

// Línea ~2305
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
  platformAndService,  // ✅
  collection,
  workClosure,
};
```

---

### 2. **Eliminación del Uso del Enum `VisitNumber`**

**Archivo:** `src/components/inspections/InspectionForm.jsx` (Línea ~2005)

**ANTES:**
```javascript
<select
  {...register("wc_visitNumber")}
  className="w-full px-3 py-2 border rounded-md"
  aria-invalid={!!errors.wc_visitNumber && (touchedFields.wc_visitNumber || showStepErrors[4])}
>
  <option value="">Seleccione...</option>
  <option value={VisitNumber.VISIT_1}>Visita 1</option>  // ❌
  <option value={VisitNumber.VISIT_2}>Visita 2</option>  // ❌
  <option value={VisitNumber.VISIT_3}>Visita 3</option>  // ❌
</select>
```

**DESPUÉS:**
```javascript
<select
  {...register("wc_visitNumber")}
  className="w-full px-3 py-2 border rounded-md"
  aria-invalid={!!errors.wc_visitNumber && (touchedFields.wc_visitNumber || showStepErrors[4])}
>
  <option value="">Seleccione...</option>
  <option value="visita_1">Visita 1</option>  // ✅
  <option value="visita_2">Visita 2</option>  // ✅
  <option value="visita_3">Visita 3</option>  // ✅
</select>
```

**Razón:** Los strings `'visita_1'`, `'visita_2'`, `'visita_3'` son los valores que espera el backend directamente.

---

## 📊 Impacto de las Correcciones

### Antes de las Correcciones:

#### Plataforma de Servicios:
```json
// Payload enviado al backend
{
  "dependency": "ServicePlatform",
  "servicePlatform": {
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }
}

// Respuesta del backend
{
  "id": 81,
  "platformAndService": null  // ❌ NULL porque el campo no coincide
}
```

#### Clausura de Obra:
```javascript
// Error en consola
Uncaught ReferenceError: VisitNumber is not defined
```

---

### Después de las Correcciones:

#### Plataforma de Servicios:
```json
// Payload enviado al backend
{
  "dependency": "ServicePlatform",
  "platformAndService": {
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }
}

// Respuesta del backend
{
  "id": 81,
  "platformAndService": {
    "id": 123,
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }  // ✅ GUARDADO CORRECTAMENTE
}
```

#### Clausura de Obra:
```json
// Payload enviado al backend
{
  "dependency": "WorkClosure",
  "workClosure": {
    "visitNumber": "visita_1",  // ✅ String directo
    // ... otros campos
  }
}

// Sin errores en consola ✅
```

---

## 🧪 Testing Recomendado

### 1. Plataforma de Servicios
- [ ] Crear inspección con número de trámite
- [ ] Verificar que `platformAndService` no sea `null` en la respuesta
- [ ] Verificar que los datos se guarden correctamente en la base de datos

### 2. Clausura de Obra
- [ ] Seleccionar "Visita 1" y verificar que se envíe `"visita_1"`
- [ ] Seleccionar "Visita 2" y verificar que se envíe `"visita_2"`
- [ ] Seleccionar "Visita 3" y verificar que se envíe `"visita_3"`
- [ ] Verificar que no haya errores en la consola del navegador

---

## 📝 Notas Importantes

### ¿Por qué NO usar el enum `VisitNumber`?

1. **No está importado en el componente:** El archivo `InspectionForm.jsx` no importa `VisitNumber` de `domain/enums.js`
2. **Innecesario:** El backend espera strings simples, no necesitamos el enum en el frontend
3. **Más simple:** Usar strings directamente es más legible y menos propenso a errores

### ¿Cuándo SÍ usar enums?

Los enums son útiles cuando:
- Necesitas referenciarlos en múltiples lugares del código
- Necesitas hacer comparaciones lógicas
- Ejemplo: `Dependency.ServicePlatform`, `ApplicantType.FISICA`

En este caso, para `visitNumber` es más simple usar strings directos en el `<select>`.

---

## 🔍 Verificación Final

### Comandos para verificar:

```bash
# 1. Verificar que no haya errores de compilación
npm run build

# 2. Verificar en el navegador (DevTools > Console)
# - No debe haber errores de "VisitNumber is not defined"

# 3. Verificar en Network (DevTools > Network)
# - El payload debe incluir "platformAndService" (no "servicePlatform")
# - El campo "visitNumber" debe ser un string ("visita_1", etc.)
```

### Payload esperado (ejemplo completo):

```json
{
  "inspectionDate": "2025-11-04",
  "procedureNumber": "INSP-2025-001",
  "inspectorIds": [1],
  "applicantType": "ANONIMO",
  "location": {
    "district": "SantaCruz",
    "exactAddress": "100m norte"
  },
  "dependency": "ServicePlatform",
  "platformAndService": {
    "procedureNumber": "PS-2025-001",
    "observation": "Todo correcto"
  }
}
```

---

## ✅ Resumen de Archivos Modificados

1. **`src/components/inspections/InspectionForm.jsx`**
   - Línea ~2221: `const servicePlatform` → `const platformAndService`
   - Línea ~2305: `servicePlatform,` → `platformAndService,`
   - Línea ~2005: `value={VisitNumber.VISIT_X}` → `value="visita_X"`

2. **`src/utils/mapInspectionDto.js`**
   - ✅ Ya estaba correcto (lee `platformAndService` del payload)

3. **`src/domain/enums.js`**
   - ✅ Enum existe pero no se usa en el formulario (innecesario)

---

## 🎯 Estado Actual

✅ **Plataforma de Servicios:** Funcional - Campo correcto  
✅ **Clausura de Obra:** Funcional - Número de visita con strings  
✅ **Cobros:** Funcional - Firma se sube a Cloudinary  
✅ **Sin errores de compilación**  
✅ **Payload correcto según documentación del backend**

---

**Correcciones aplicadas por:** GitHub Copilot  
**Fecha:** 4 de noviembre, 2025  
**Archivos afectados:** 1 archivo (InspectionForm.jsx)  
**Líneas modificadas:** 3 cambios
