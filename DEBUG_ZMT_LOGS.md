# 🐛 DEBUG: Guía de Logs para ZMT en Formulario de Inspecciones

## 📍 Ubicación de los Logs

Los logs de debugging están implementados en: `src/components/inspections/InspectionForm.jsx`

---

## 🔍 Logs Implementados

### 1. **Monitoreo Automático de Estado de Parcels**

**Ubicación:** Lines ~605-625  
**Trigger:** Cada vez que cambia el estado de `parcels`

```javascript
useEffect(() => {
  if (parcels.length > 0) {
    console.group('🗺️ DEBUG: Parcels State Changed');
    console.log(`Total parcels: ${parcels.length}`);
    console.log('Parcels JSON:', JSON.stringify(parcels, null, 2));
    // ... detalles de cada parcel
    console.groupEnd();
  }
}, [parcels]);
```

**Qué muestra:**
- Total de parcels
- JSON completo del array de parcels
- Detalle de cada parcel con validación de campos requeridos

---

### 2. **Estado Antes de Crear zmtConcession**

**Ubicación:** Lines ~1736-1742  
**Trigger:** Al enviar el formulario (onSubmit)

```javascript
console.group('🔍 DEBUG: Parcels ANTES de crear zmtConcession');
console.log('📊 Parcels JSON:', JSON.stringify(parcels, null, 2));
console.log('📋 Parcels length:', parcels.length);
console.log('📋 Dependency value:', values.dependency);
console.log('📋 Is MaritimeZone?:', values.dependency === Dependency.MaritimeZone);
console.groupEnd();
```

**Qué muestra:**
- Estado de parcels antes de procesamiento
- Valor de dependency
- Si está seleccionada la opción MaritimeZone

---

### 3. **ZMT Concession Creado**

**Ubicación:** Lines ~1773-1803  
**Trigger:** Al enviar el formulario (si dependency === MaritimeZone)

```javascript
console.group('🏝️ DEBUG: ZMT Concession CREADO');
console.log('📊 ZMT Concession JSON (COMPLETO):', JSON.stringify(zmtConcession, null, 2));
console.log('📋 Concession Info:', {
  fileNumber: zmtConcession.fileNumber,
  concessionType: zmtConcession.concessionType,
  grantedAt: zmtConcession.grantedAt,
  expiresAt: zmtConcession.expiresAt,
  observations: zmtConcession.observations,
  totalParcels: zmtConcession.parcels.length
});

console.log('\n📦 Parcels Array (Formato que se enviará al backend):');
console.log(JSON.stringify(zmtConcession.parcels, null, 2));

// Detalle de cada parcel
zmtConcession.parcels.forEach((p, i) => {
  console.group(`\n📍 Parcel ${i + 1} Detalle:`);
  console.log('JSON:', JSON.stringify(p, null, 2));
  console.log('Validación:', {
    planType: p.planType ? '✅' : '❌ FALTA',
    planNumber: p.planNumber ? '✅' : '❌ FALTA',
    area: p.area ? '✅' : '❌ FALTA',
    mojonType: p.mojonType ? '✅' : '❌ FALTA',
    topography: p.topography ? '✅' : '❌ FALTA',
    hasAllRequired: !!(p.planType && p.planNumber && p.area && p.mojonType && p.topography)
  });
  console.groupEnd();
});
console.groupEnd();
```

**Qué muestra:**
- JSON completo de zmtConcession
- Info de la concesión (fileNumber, type, dates, etc.)
- Array de parcels en formato backend
- Validación campo por campo de cada parcel

---

### 4. **Payload Final Antes de Enviar**

**Ubicación:** Lines ~1839-1862  
**Trigger:** Justo antes de llamar a `createInspectionFromForm()`

```javascript
console.group('========== DEBUG: PAYLOAD FINAL COMPLETO ==========');
console.log('PAYLOAD JSON:');
console.log(JSON.stringify(payload, null, 2));

if (payload.zmtConcession) {
  console.group('ZMT CONCESSION EN PAYLOAD:');
  console.log('ZMT JSON:', JSON.stringify(payload.zmtConcession, null, 2));
  console.log('Parcels count:', payload.zmtConcession.parcels?.length || 0);
  
  if (payload.zmtConcession.parcels && payload.zmtConcession.parcels.length > 0) {
    console.log('PARCELS ARRAY (Formato Backend):');
    console.log(JSON.stringify(payload.zmtConcession.parcels, null, 2));
  }
  console.groupEnd();
} else {
  console.warn('zmtConcession NO esta en payload');
}
console.groupEnd();
```

**Qué muestra:**
- Payload completo que se enviará al backend
- ZMT Concession dentro del payload
- Array de parcels en el formato final

---

## 📋 Formato JSON Esperado

### Estructura de `parcels` (Estado):

```json
[
  {
    "id": "parcel-1234567890-abc123",
    "planType": "Catastrado",
    "planNumber": "SC-123456",
    "area": "500",
    "mojonType": "Físico",
    "planComplies": "si",
    "respectsBoundary": "si",
    "anchorageMojones": "Norte: Mojón A, Sur: Mojón B",
    "topography": "Plana",
    "topographyOther": null,
    "fenceTypes": "Malla,Concreto",
    "fencesInvadePublic": "no",
    "roadHasPublicAccess": "si",
    "roadDescription": "Camino público de 6m",
    "roadLimitations": null,
    "roadMatchesPlan": "si",
    "rightOfWayWidth": "6"
  }
]
```

### Estructura de `zmtConcession` (Enviado al Backend):

```json
{
  "fileNumber": "126260",
  "concessionType": "Nueva Concesión",
  "grantedAt": "2025-10-08",
  "expiresAt": "2026-01-09",
  "observations": "Observaciones generales",
  "photos": [],
  "parcels": [
    {
      "planType": "Catastrado",
      "planNumber": "SC-123456",
      "area": "500",
      "mojonType": "Físico",
      "planComplies": true,
      "respectsBoundary": true,
      "anchorageMojones": "Norte: Mojón A, Sur: Mojón B",
      "topography": "Plana",
      "topographyOther": null,
      "fenceTypes": ["Malla", "Concreto"],
      "fencesInvadePublic": false,
      "roadHasPublicAccess": true,
      "roadDescription": "Camino público de 6m",
      "roadLimitations": null,
      "roadMatchesPlan": true,
      "rightOfWayWidth": "6"
    }
  ]
}
```

---

## 🎯 Cómo Usar los Logs

### 1. Abrir la Consola del Navegador
- Chrome/Edge: `F12` o `Ctrl+Shift+I`
- Firefox: `F12` o `Ctrl+Shift+K`

### 2. Filtrar Logs de ZMT
En la consola, busca estos prefijos:
- `🗺️ DEBUG: Parcels State Changed` - Cuando agregas/editas parcels
- `🔍 DEBUG: Parcels ANTES` - Antes de crear zmtConcession
- `🏝️ DEBUG: ZMT Concession CREADO` - Concession creada
- `========== DEBUG: PAYLOAD FINAL` - Antes de enviar al backend

### 3. Copiar JSON para Testing
```javascript
// En la consola, puedes copiar el JSON directamente:
copy(JSON.stringify(parcels, null, 2))
```

---

## 🔎 Casos de Uso Comunes

### Verificar que se están llenando los parcels:
1. Abre la consola
2. Selecciona "ZMT (Zona Marítima)" en el formulario
3. Llena los datos de la concesión
4. Agrega datos en el primer parcel
5. Observa el log `🗺️ DEBUG: Parcels State Changed`

### Ver formato final antes de enviar:
1. Llena todo el formulario de ZMT
2. Click en "Crear Inspección"
3. Observa el log `========== DEBUG: PAYLOAD FINAL`
4. Copia el JSON de `zmtConcession`

### Debugging de parcels vacíos:
1. Si el array de parcels viene vacío, busca:
   - `📋 Parcels length: 0` en los logs
   - `hasAllRequired: false` en la validación
   - Campos marcados con `❌ FALTA`

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "parcels: []" vacío
**Buscar en logs:**
- `Total parcels: 0`
- `Parcels length: 0`

**Solución:**
- Verificar que se agregó al menos un parcel
- Verificar que los campos requeridos están llenos
- Click en "Agregar Parcela" si no hay ninguna

### Problema: "zmtConcession NO está en el payload"
**Buscar en logs:**
- `⚠️ DEBUG: ZMT Concession NO CREADO`
- `Is MaritimeZone?: false`

**Solución:**
- Verificar que dependency === "MaritimeZone"
- Seleccionar correctamente la dependencia en el formulario

### Problema: Campos con valores incorrectos
**Buscar en logs:**
- Cada parcel muestra validación con ✅ o ❌
- Ver valores en el JSON para identificar el problema

---

## 📊 Ejemplo de Salida en Consola

```
🗺️ DEBUG: Parcels State Changed
  Total parcels: 1
  Parcels JSON: [
    {
      "id": "parcel-1697123456-xyz789",
      "planType": "Catastrado",
      "planNumber": "SC-123456",
      "area": "500",
      ...
    }
  ]

  📍 Parcel 1:
    id: parcel-1697123456-xyz789
    planType: Catastrado ✅
    planNumber: SC-123456 ✅
    area: 500 ✅
    mojonType: Físico ✅

========== DEBUG: PAYLOAD FINAL COMPLETO ==========
  PAYLOAD JSON:
  {
    "inspectionDate": "2025-10-13",
    "procedureNumber": "12345",
    ...
    "zmtConcession": {
      "fileNumber": "126260",
      "concessionType": "Nueva Concesión",
      "parcels": [...]
    }
  }

  ZMT CONCESSION EN PAYLOAD:
    ZMT JSON: {...}
    Parcels count: 1
    PARCELS ARRAY (Formato Backend): [...]
```

---

## 🚀 Funciones Helper Disponibles

### `debugZMT(label, data)`
Función helper para logging estructurado de ZMT:

```javascript
debugZMT('Mi Debug', { parcels, zmtConcession });
```

Muestra:
- Grupo colapsable con el label
- JSON formateado
- Objeto raw

---

**Documento creado:** 13 de Octubre 2025  
**Última actualización:** 13 de Octubre 2025