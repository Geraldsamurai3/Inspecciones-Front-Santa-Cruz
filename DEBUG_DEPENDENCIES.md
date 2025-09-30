# 🐛 Debugging - Componente de Dependencias

## 🔍 Cómo Verificar Qué Está Pasando

### 1. Abrir la Consola del Navegador

**Pasos:**
1. Abre tu aplicación en el navegador
2. Presiona `F12` o `Ctrl + Shift + I`
3. Ve a la pestaña **Console**

### 2. Ir a la Sección de Dependencias

1. Inicia sesión como admin
2. Ve a **Estadísticas** en el sidebar
3. Selecciona la pestaña **"Departamentos"** (que ahora muestra Dependencias)

### 3. Logs Que Debes Ver

Cuando cargue la página, deberías ver estos logs en la consola:

```
🔍 Cargando dependencias con período: 7days
📡 Stats Service - Solicitando: /stats/dependencies?period=7days
📋 Parámetros: {period: "7days", startDate: undefined, endDate: undefined}
```

Luego, dependiendo de si el backend responde o no:

#### ✅ Si el Backend Responde Correctamente:
```
✅ Stats Service - Respuesta recibida: {period: "...", startDate: "...", ...}
✅ Datos recibidos: {period: "...", total: 145, byDependency: [...]}
📊 Datos para renderizar: {period: "...", ...}
🔄 Transformando: Alcaldía → {name: "Alcaldía", total: 45, ...}
🔄 Transformando: Cobros/Procedimientos Tributarios → {...}
```

#### ❌ Si el Backend NO Responde o Tiene Errores:
```
❌ Error cargando dependencias: Error...
```

### 4. Ver el Panel de Debug en la Interfaz

En la página, ahora verás un panel azul con información de debug:

```
🔍 Debug Info:
Período actual: 7days
Total inspecciones: 145
Dependencias encontradas: 7

[Ver datos procesados] ← Click aquí
```

Haz click en **"Ver datos procesados"** para ver exactamente qué datos está recibiendo el gráfico.

---

## 🎯 Problemas Comunes y Soluciones

### Problema 1: "No se pudieron cargar los datos de dependencias"

**Causa:** El backend no está respondiendo o la URL es incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica la variable `VITE_API_URL` en tu `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. Verifica que el endpoint exista: `GET http://localhost:3000/stats/dependencies`

**Prueba manual con cURL:**
```bash
curl -X GET "http://localhost:3000/stats/dependencies?period=7days" \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### Problema 2: "Formato de datos inválido"

**Causa:** El backend no está devolviendo la estructura correcta.

**Lo que el frontend espera:**
```json
{
  "period": "Últimos 7 días",
  "startDate": "2025-09-23",
  "endDate": "2025-09-30",
  "total": 145,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 45,
      "byStatus": {
        "nuevo": 10,
        "enProceso": 15,
        "revisado": 15,
        "archivado": 5
      },
      "percentage": 31.03
    }
  ]
}
```

**Verifica:**
- ✅ `byDependency` es un **array**
- ✅ Cada objeto tiene la propiedad `dependency` (nombre de la dependencia)
- ✅ Cada objeto tiene `byStatus` con las keys: `nuevo`, `enProceso`, `revisado`, `archivado`
- ✅ Los valores son **números**, no strings

---

### Problema 3: No se muestran los nombres de las dependencias en el gráfico

**Causa:** El campo `dependency` está vacío, es null, o tiene un nombre diferente.

**Solución en el backend:**

Asegúrate de que cada objeto en `byDependency` tenga el campo `dependency`:

```javascript
// ✅ CORRECTO
{
  "dependency": "Alcaldía",  // ← Nombre de la dependencia
  "total": 45,
  "byStatus": {...}
}

// ❌ INCORRECTO
{
  "name": "Alcaldía",  // ← Debería ser "dependency"
  "total": 45
}

// ❌ INCORRECTO
{
  "dependency": null,  // ← No puede ser null
  "total": 45
}
```

---

### Problema 4: Los filtros no funcionan (al hacer click no cambia)

**Causa:** Los filtros ahora sí funcionan con la nueva implementación.

**Verifica en la consola:**

Cuando haces click en un botón de filtro, deberías ver:
```
📅 Cambiando período a: 1week
🔍 Cargando dependencias con período: 1week
📡 Stats Service - Solicitando: /stats/dependencies?period=1week
```

Si NO ves estos logs, puede ser:
1. El botón no está llamando a `handlePeriodChange`
2. JavaScript tiene un error (revisa la consola)

---

### Problema 5: Solo muestra una barra (como en tu screenshot)

**Posibles causas:**

#### A) Solo hay una dependencia en los datos
**Verifica en el panel de debug:**
```
Dependencias encontradas: 1
```

**Solución:** El backend debe devolver más dependencias en el array `byDependency`.

#### B) Las demás dependencias tienen total = 0
**Verifica los datos procesados:**
```json
[
  {"name": "Ubicacion", "total": 2, ...},
  {"name": "Otra", "total": 0, ...}  ← No se mostrará en el gráfico
]
```

**Solución:** El backend debe calcular correctamente los totales.

#### C) El campo `dependency` es el mismo para todas
**Verifica los datos:**
```json
[
  {"dependency": "Ubicacion", ...},
  {"dependency": "Ubicacion", ...},  ← Duplicado
  {"dependency": "Ubicacion", ...}   ← Duplicado
]
```

**Solución:** El backend debe agrupar correctamente por dependencia única.

---

## 🧪 Test con Datos Mock (Sin Backend)

Si quieres probar el componente SIN el backend, puedes modificar temporalmente el componente:

**Archivo:** `src/components/stats/DepartmentComparison.jsx`

**Agrega al inicio de `loadData`:**

```javascript
const loadData = async (selectedPeriod) => {
  setLoading(true);
  setError(null);
  
  // 🧪 DATOS DE PRUEBA - BORRAR DESPUÉS
  setTimeout(() => {
    const mockData = {
      period: "Últimos 7 días",
      startDate: "2025-09-23",
      endDate: "2025-09-30",
      total: 145,
      byDependency: [
        {
          dependency: "Alcaldía",
          total: 45,
          byStatus: { nuevo: 10, enProceso: 15, revisado: 15, archivado: 5 },
          percentage: 31.03
        },
        {
          dependency: "Cobros/Procedimientos Tributarios",
          total: 32,
          byStatus: { nuevo: 8, enProceso: 12, revisado: 10, archivado: 2 },
          percentage: 22.07
        },
        {
          dependency: "Construcción",
          total: 28,
          byStatus: { nuevo: 5, enProceso: 10, revisado: 10, archivado: 3 },
          percentage: 19.31
        }
      ]
    };
    
    console.log('✅ Usando datos MOCK:', mockData);
    setData(mockData);
    setLoading(false);
  }, 500);
  return; // ← Evita llamar al backend
  // FIN DATOS DE PRUEBA
  
  try {
    // ... resto del código
```

Con esto deberías ver:
- 3 barras en el gráfico
- Nombres: "Alcaldía", "Cobros/Procedimientos Tributarios", "Construcción"
- Los 4 filtros funcionando (aunque con los mismos datos)

---

## 📊 Checklist de Debugging

```
□ Abrir consola del navegador (F12)
□ Ir a la sección de Dependencias
□ Ver log: "🔍 Cargando dependencias con período: 7days"
□ Ver log: "📡 Stats Service - Solicitando: /stats/dependencies?period=7days"
□ Ver log: "✅ Datos recibidos: {...}"
□ Ver panel de debug azul en la interfaz
□ Click en "Ver datos procesados"
□ Verificar que hay múltiples elementos en el array
□ Verificar que cada elemento tiene "name" con un valor
□ Verificar que "total" > 0 para cada elemento
□ Probar click en diferentes filtros (7 días, 1 semana, etc.)
□ Ver que los logs cambian al hacer click
□ Verificar que el gráfico se actualiza
```

---

## 🆘 Si Nada Funciona

### Opción 1: Revisar Respuesta del Backend

Abre las **DevTools → Network → XHR**

1. Refresca la página
2. Busca la request a `/stats/dependencies`
3. Click en ella
4. Ve a la pestaña **"Response"**
5. Copia la respuesta completa

**Compártela para verificar el formato.**

### Opción 2: Probar el Endpoint Directamente

En **Postman** o **Thunder Client** (VS Code):

```
GET http://localhost:3000/stats/dependencies?period=7days
Headers:
  Authorization: Bearer TU_TOKEN
```

Verifica que la respuesta coincida con la estructura esperada.

### Opción 3: Usar Datos Mock (Temporal)

Sigue las instrucciones de "Test con Datos Mock" arriba para descartar problemas del frontend.

---

## 📞 Información para Reportar

Si necesitas ayuda, proporciona:

1. **Los logs de la consola** (copia y pega)
2. **Captura del panel de debug** (la sección azul)
3. **Los datos en "Ver datos procesados"**
4. **La respuesta del Network tab** (pestaña Response)
5. **¿Qué pasa cuando haces click en los filtros?**

---

**Última actualización:** 30 de Septiembre, 2025
