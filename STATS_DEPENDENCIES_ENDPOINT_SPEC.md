# 🎯 Especificación del Endpoint /stats/dependencies

## 📋 Resumen Rápido

**Endpoint:** `GET /stats/dependencies`

**Propósito:** Obtener estadísticas de inspecciones agrupadas por dependencia con filtros de tiempo.

**Autenticación:** Bearer Token requerido

---

## 📥 Request

### URL
```
GET http://localhost:3000/stats/dependencies
```

### Query Parameters

| Parámetro | Tipo | Valores Permitidos | Requerido | Descripción |
|-----------|------|-------------------|-----------|-------------|
| `period` | string | `'7days'` \| `'1week'` \| `'15days'` \| `'1month'` \| `'custom'` | **Sí** | Período de tiempo para el análisis |
| `startDate` | string | `'YYYY-MM-DD'` | Solo si `period='custom'` | Fecha de inicio del período |
| `endDate` | string | `'YYYY-MM-DD'` | Solo si `period='custom'` | Fecha final del período |

### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Ejemplos de Request

**1. Últimos 7 días:**
```http
GET /stats/dependencies?period=7days
```

**2. Última semana:**
```http
GET /stats/dependencies?period=1week
```

**3. Último mes:**
```http
GET /stats/dependencies?period=1month
```

**4. Período personalizado:**
```http
GET /stats/dependencies?period=custom&startDate=2025-09-01&endDate=2025-09-30
```

---

## 📤 Response

### ✅ Success (200 OK)

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
    },
    {
      "dependency": "Construcciones",
      "total": 32,
      "byStatus": {
        "nuevo": 8,
        "enProceso": 12,
        "revisado": 10,
        "archivado": 2
      },
      "percentage": 22.07
    },
    {
      "dependency": "Bienes Inmuebles",
      "total": 28,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 10,
        "revisado": 10,
        "archivado": 3
      },
      "percentage": 19.31
    },
    {
      "dependency": "Cobros",
      "total": 20,
      "byStatus": {
        "nuevo": 4,
        "enProceso": 8,
        "revisado": 6,
        "archivado": 2
      },
      "percentage": 13.79
    },
    {
      "dependency": "Rentas y Patentes",
      "total": 12,
      "byStatus": {
        "nuevo": 2,
        "enProceso": 5,
        "revisado": 4,
        "archivado": 1
      },
      "percentage": 8.28
    },
    {
      "dependency": "Plataformas de servicios",
      "total": 5,
      "byStatus": {
        "nuevo": 1,
        "enProceso": 2,
        "revisado": 2,
        "archivado": 0
      },
      "percentage": 3.45
    },
    {
      "dependency": "ZMT",
      "total": 3,
      "byStatus": {
        "nuevo": 1,
        "enProceso": 1,
        "revisado": 1,
        "archivado": 0
      },
      "percentage": 2.07
    }
  ]
}
```

### Schema

```typescript
interface DependenciesResponse {
  period: string;           // Descripción del período ("Últimos 7 días", etc.)
  startDate: string;        // Formato: YYYY-MM-DD
  endDate: string;          // Formato: YYYY-MM-DD
  total: number;            // Total de inspecciones en el período
  byDependency: Dependency[];
}

interface Dependency {
  dependency: string;       // Nombre de la dependencia
  total: number;            // Total de inspecciones en esta dependencia
  byStatus: StatusCounts;
  percentage: number;       // Porcentaje del total (ej: 31.03)
}

interface StatusCounts {
  nuevo: number;            // ⚠️ IMPORTANTE: minúscula, camelCase
  enProceso: number;        // ⚠️ IMPORTANTE: camelCase
  revisado: number;         // ⚠️ IMPORTANTE: minúscula
  archivado: number;        // ⚠️ IMPORTANTE: minúscula
}
```

---

## ❌ Error Responses

### 400 Bad Request - Período inválido

```json
{
  "error": "Invalid period parameter",
  "message": "Period must be one of: 7days, 1week, 15days, 1month, custom"
}
```

**Cuándo ocurre:** Cuando `period` no es uno de los valores permitidos.

---

### 400 Bad Request - Fechas faltantes

```json
{
  "error": "Missing date parameters",
  "message": "startDate and endDate are required when period is 'custom'"
}
```

**Cuándo ocurre:** Cuando `period='custom'` pero falta `startDate` o `endDate`.

---

### 400 Bad Request - Rango de fechas inválido

```json
{
  "error": "Invalid date range",
  "message": "startDate must be before or equal to endDate"
}
```

**Cuándo ocurre:** Cuando `startDate > endDate`.

---

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication token is required"
}
```

**Cuándo ocurre:** Cuando no se proporciona el token de autenticación.

---

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Error calculating dependencies statistics"
}
```

**Cuándo ocurre:** Error en el servidor al procesar la solicitud.

---

## 🔧 Implementación Backend (Ejemplo en Node.js/Express)

### Controlador

```javascript
// controllers/statsController.js
const getDependencies = async (req, res) => {
  try {
    const { period = '7days', startDate, endDate } = req.query;

    // Validar período
    const validPeriods = ['7days', '1week', '15days', '1month', 'custom'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: 'Invalid period parameter',
        message: 'Period must be one of: 7days, 1week, 15days, 1month, custom'
      });
    }

    // Validar fechas para período custom
    if (period === 'custom') {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing date parameters',
          message: 'startDate and endDate are required when period is custom'
        });
      }

      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          error: 'Invalid date range',
          message: 'startDate must be before or equal to endDate'
        });
      }
    }

    // Calcular fechas según el período
    let calculatedStartDate, calculatedEndDate;
    const now = new Date();

    switch (period) {
      case '7days':
        calculatedEndDate = now;
        calculatedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1week':
        calculatedEndDate = now;
        calculatedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '15days':
        calculatedEndDate = now;
        calculatedStartDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        calculatedEndDate = now;
        calculatedStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        calculatedStartDate = new Date(startDate);
        calculatedEndDate = new Date(endDate);
        break;
    }

    // Formatear fechas a YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    const formattedStartDate = formatDate(calculatedStartDate);
    const formattedEndDate = formatDate(calculatedEndDate);

    // Obtener datos de la base de datos
    const inspections = await Inspection.find({
      createdAt: {
        $gte: calculatedStartDate,
        $lte: calculatedEndDate
      }
    });

    // Agrupar por dependencia
    const dependenciesMap = {};
    let totalInspections = 0;

    inspections.forEach(inspection => {
      const dep = inspection.dependencia || 'Sin Dependencia';
      
      if (!dependenciesMap[dep]) {
        dependenciesMap[dep] = {
          dependency: dep,
          total: 0,
          byStatus: {
            nuevo: 0,
            enProceso: 0,
            revisado: 0,
            archivado: 0
          }
        };
      }

      dependenciesMap[dep].total++;
      totalInspections++;

      // Contar por estado (asegurar minúsculas y camelCase)
      const status = inspection.estado.toLowerCase();
      switch (status) {
        case 'nuevo':
          dependenciesMap[dep].byStatus.nuevo++;
          break;
        case 'en proceso':
        case 'enproceso':
          dependenciesMap[dep].byStatus.enProceso++;
          break;
        case 'revisado':
          dependenciesMap[dep].byStatus.revisado++;
          break;
        case 'archivado':
          dependenciesMap[dep].byStatus.archivado++;
          break;
      }
    });

    // Convertir a array y calcular porcentajes
    const byDependency = Object.values(dependenciesMap)
      .map(dep => ({
        ...dep,
        percentage: totalInspections > 0 
          ? parseFloat(((dep.total / totalInspections) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.total - a.total); // Ordenar por total descendente

    // Mapear label del período
    const periodLabels = {
      '7days': 'Últimos 7 días',
      '1week': 'Última semana',
      '15days': 'Últimos 15 días',
      '1month': 'Último mes',
      'custom': 'Período personalizado'
    };

    // Respuesta
    res.json({
      period: periodLabels[period],
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      total: totalInspections,
      byDependency
    });

  } catch (error) {
    console.error('Error in getDependencies:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Error calculating dependencies statistics'
    });
  }
};

module.exports = { getDependencies };
```

### Ruta

```javascript
// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { getDependencies } = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/dependencies', authenticateToken, getDependencies);

module.exports = router;
```

---

## 🧪 Testing con cURL

### Test 1: Últimos 7 días

```bash
curl -X GET "http://localhost:3000/stats/dependencies?period=7days" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 2: Período personalizado

```bash
curl -X GET "http://localhost:3000/stats/dependencies?period=custom&startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 3: Error - Período inválido

```bash
curl -X GET "http://localhost:3000/stats/dependencies?period=invalid" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Error - Sin fechas en custom

```bash
curl -X GET "http://localhost:3000/stats/dependencies?period=custom" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 SQL Query (para bases de datos relacionales)

```sql
-- PostgreSQL / MySQL
SELECT 
  i.dependencia AS dependency,
  COUNT(*) AS total,
  SUM(CASE WHEN i.estado = 'nuevo' THEN 1 ELSE 0 END) AS nuevo,
  SUM(CASE WHEN i.estado = 'enProceso' OR i.estado = 'en proceso' THEN 1 ELSE 0 END) AS enProceso,
  SUM(CASE WHEN i.estado = 'revisado' THEN 1 ELSE 0 END) AS revisado,
  SUM(CASE WHEN i.estado = 'archivado' THEN 1 ELSE 0 END) AS archivado,
  ROUND(
    (COUNT(*) * 100.0 / (
      SELECT COUNT(*) 
      FROM inspecciones 
      WHERE fecha BETWEEN ? AND ?
    )), 
    2
  ) AS percentage
FROM inspecciones i
WHERE i.fecha BETWEEN ? AND ?
GROUP BY i.dependencia
ORDER BY total DESC;
```

---

## 🔍 MongoDB Query (para bases de datos NoSQL)

```javascript
db.inspecciones.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date("2025-09-23"),
        $lte: new Date("2025-09-30")
      }
    }
  },
  {
    $group: {
      _id: "$dependencia",
      total: { $sum: 1 },
      nuevo: {
        $sum: { $cond: [{ $eq: ["$estado", "nuevo"] }, 1, 0] }
      },
      enProceso: {
        $sum: { 
          $cond: [
            { $or: [
              { $eq: ["$estado", "enProceso"] },
              { $eq: ["$estado", "en proceso"] }
            ]}, 
            1, 
            0
          ] 
        }
      },
      revisado: {
        $sum: { $cond: [{ $eq: ["$estado", "revisado"] }, 1, 0] }
      },
      archivado: {
        $sum: { $cond: [{ $eq: ["$estado", "archivado"] }, 1, 0] }
      }
    }
  },
  {
    $sort: { total: -1 }
  }
]);
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear ruta `/stats/dependencies`
- [ ] Implementar validación de parámetros
- [ ] Implementar cálculo de fechas según período
- [ ] Consultar base de datos con filtro de fechas
- [ ] Agrupar inspecciones por dependencia
- [ ] Contar por estado (nuevo, enProceso, revisado, archivado)
- [ ] Calcular porcentajes
- [ ] Ordenar por total descendente
- [ ] Formatear respuesta según schema
- [ ] Implementar manejo de errores
- [ ] Agregar autenticación con Bearer token
- [ ] Probar con diferentes períodos
- [ ] Probar casos de error

### Testing
- [ ] Test con período '7days'
- [ ] Test con período '1week'
- [ ] Test con período '15days'
- [ ] Test con período '1month'
- [ ] Test con período 'custom' y fechas válidas
- [ ] Test error: período inválido
- [ ] Test error: custom sin fechas
- [ ] Test error: startDate > endDate
- [ ] Test error: sin token de autenticación
- [ ] Test con dependencias vacías
- [ ] Test con muchas dependencias
- [ ] Verificar suma de totales
- [ ] Verificar porcentajes suman ~100%

---

## 📝 Notas Importantes

### ⚠️ Convenciones de Nombres

**Estados en la respuesta (byStatus):**
- ✅ `nuevo` - Correcto (minúscula, camelCase)
- ✅ `enProceso` - Correcto (camelCase)
- ✅ `revisado` - Correcto (minúscula)
- ✅ `archivado` - Correcto (minúscula)

**NO usar:**
- ❌ `Nuevo` (mayúscula inicial)
- ❌ `En proceso` (espacios)
- ❌ `en_proceso` (snake_case)
- ❌ `NUEVO` (mayúsculas)

### 📐 Cálculos

**Total por dependencia:**
```
total = nuevo + enProceso + revisado + archivado
```

**Porcentaje:**
```
percentage = (dependency.total / totalGeneral) * 100
```

**Redondeo:**
```
percentage = Math.round(percentage * 100) / 100  // 2 decimales
```

### 🎨 Ordenamiento

Las dependencias deben estar ordenadas por `total` en orden **descendente** (mayor a menor).

### 📅 Formato de Fechas

Todas las fechas en formato **ISO 8601**: `YYYY-MM-DD`

Ejemplo: `"2025-09-30"`

---

**Última actualización:** 30 de Septiembre, 2025  
**Versión:** 1.0.0
