# 🏢 Dependencias del Sistema

## Lista de Dependencias Oficiales

El sistema de inspecciones tiene **7 dependencias**:

1. **Alcaldía** 🏛️
2. **Bienes Inmuebles** 🏠
3. **Cobros** 💵
4. **Construcciones** 🏗️
5. **Rentas y Patentes** 📋
6. **Plataformas de servicios** 💻
7. **ZMT** (Zona Marítimo Terrestre) 🌊

---

## Ejemplo de Response del Endpoint `/stats/dependencies`

Con estas dependencias, el backend debe devolver:

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

---

## Campo de Dependencia en la Base de Datos

### Valores Válidos

El campo `dependencia` en la tabla/colección de inspecciones debe tener uno de estos valores:

```javascript
const DEPENDENCIAS_VALIDAS = [
  'Alcaldía',
  'Bienes Inmuebles',
  'Cobros',
  'Construcciones',
  'Rentas y Patentes',
  'Plataformas de servicios',
  'ZMT'
];
```

### ⚠️ Importante: Consistencia de Nombres

El backend debe asegurarse de que los nombres sean **exactamente iguales**:

✅ **CORRECTO:**
- `"Alcaldía"` (con tilde)
- `"Bienes Inmuebles"` (con espacio)
- `"Rentas y Patentes"` (con "y" minúscula)

❌ **INCORRECTO:**
- `"Alcaldia"` (sin tilde)
- `"Bienes_Inmuebles"` (con guion bajo)
- `"ALCALDÍA"` (en mayúsculas)
- `"alcaldía"` (en minúsculas)

---

## Implementación en el Backend

### Ejemplo con MongoDB:

```javascript
// Agrupar inspecciones por dependencia
const dependenciesStats = await Inspection.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate }
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

// Calcular total general
const totalInspections = dependenciesStats.reduce((sum, dep) => sum + dep.total, 0);

// Formatear respuesta
const byDependency = dependenciesStats.map(dep => ({
  dependency: dep._id,  // Nombre de la dependencia
  total: dep.total,
  byStatus: {
    nuevo: dep.nuevo,
    enProceso: dep.enProceso,
    revisado: dep.revisado,
    archivado: dep.archivado
  },
  percentage: parseFloat(((dep.total / totalInspections) * 100).toFixed(2))
}));
```

### Ejemplo con SQL:

```sql
SELECT 
  dependencia AS dependency,
  COUNT(*) AS total,
  SUM(CASE WHEN estado = 'nuevo' THEN 1 ELSE 0 END) AS nuevo,
  SUM(CASE WHEN estado = 'enProceso' OR estado = 'en proceso' THEN 1 ELSE 0 END) AS enProceso,
  SUM(CASE WHEN estado = 'revisado' THEN 1 ELSE 0 END) AS revisado,
  SUM(CASE WHEN estado = 'archivado' THEN 1 ELSE 0 END) AS archivado,
  ROUND(
    (COUNT(*) * 100.0 / (
      SELECT COUNT(*) 
      FROM inspecciones 
      WHERE fecha BETWEEN ? AND ?
    )), 
    2
  ) AS percentage
FROM inspecciones
WHERE fecha BETWEEN ? AND ?
  AND dependencia IN (
    'Alcaldía',
    'Bienes Inmuebles',
    'Cobros',
    'Construcciones',
    'Rentas y Patentes',
    'Plataformas de servicios',
    'ZMT'
  )
GROUP BY dependencia
ORDER BY total DESC;
```

---

## Validación en el Backend

### Middleware de Validación:

```javascript
// Validar que la dependencia sea válida al crear/actualizar inspección
const DEPENDENCIAS_VALIDAS = [
  'Alcaldía',
  'Bienes Inmuebles',
  'Cobros',
  'Construcciones',
  'Rentas y Patentes',
  'Plataformas de servicios',
  'ZMT'
];

const validateInspection = (req, res, next) => {
  const { dependencia } = req.body;
  
  if (!DEPENDENCIAS_VALIDAS.includes(dependencia)) {
    return res.status(400).json({
      error: 'Dependencia inválida',
      message: `La dependencia debe ser una de: ${DEPENDENCIAS_VALIDAS.join(', ')}`,
      received: dependencia
    });
  }
  
  next();
};
```

---

## Enum para TypeScript

```typescript
export enum Dependencia {
  ALCALDIA = 'Alcaldía',
  BIENES_INMUEBLES = 'Bienes Inmuebles',
  COBROS = 'Cobros',
  CONSTRUCCIONES = 'Construcciones',
  RENTAS_Y_PATENTES = 'Rentas y Patentes',
  PLATAFORMAS_DE_SERVICIOS = 'Plataformas de servicios',
  ZMT = 'ZMT'
}

export const DEPENDENCIAS_ARRAY = Object.values(Dependencia);
```

---

## Migración de Datos (Si es necesario)

Si tienes datos antiguos con nombres inconsistentes, puedes ejecutar una migración:

### MongoDB:

```javascript
// Normalizar nombres de dependencias
db.inspecciones.updateMany(
  { dependencia: /alcald[ií]a/i },
  { $set: { dependencia: 'Alcaldía' } }
);

db.inspecciones.updateMany(
  { dependencia: /bienes.inmuebles/i },
  { $set: { dependencia: 'Bienes Inmuebles' } }
);

db.inspecciones.updateMany(
  { dependencia: /cobros/i },
  { $set: { dependencia: 'Cobros' } }
);

db.inspecciones.updateMany(
  { dependencia: /construc/i },
  { $set: { dependencia: 'Construcciones' } }
);

db.inspecciones.updateMany(
  { dependencia: /rentas/i },
  { $set: { dependencia: 'Rentas y Patentes' } }
);

db.inspecciones.updateMany(
  { dependencia: /plataforma/i },
  { $set: { dependencia: 'Plataformas de servicios' } }
);

db.inspecciones.updateMany(
  { dependencia: /zmt/i },
  { $set: { dependencia: 'ZMT' } }
);
```

### SQL:

```sql
-- Normalizar nombres
UPDATE inspecciones 
SET dependencia = 'Alcaldía' 
WHERE LOWER(dependencia) LIKE '%alcald%';

UPDATE inspecciones 
SET dependencia = 'Bienes Inmuebles' 
WHERE LOWER(dependencia) LIKE '%bienes%inmuebles%';

UPDATE inspecciones 
SET dependencia = 'Cobros' 
WHERE LOWER(dependencia) LIKE '%cobros%';

UPDATE inspecciones 
SET dependencia = 'Construcciones' 
WHERE LOWER(dependencia) LIKE '%construc%';

UPDATE inspecciones 
SET dependencia = 'Rentas y Patentes' 
WHERE LOWER(dependencia) LIKE '%rentas%';

UPDATE inspecciones 
SET dependencia = 'Plataformas de servicios' 
WHERE LOWER(dependencia) LIKE '%plataforma%';

UPDATE inspecciones 
SET dependencia = 'ZMT' 
WHERE UPPER(dependencia) LIKE '%ZMT%';
```

---

## Testing

### Verificar que todas las dependencias están en la BD:

```javascript
// MongoDB
db.inspecciones.distinct("dependencia");

// Debería devolver:
[
  "Alcaldía",
  "Bienes Inmuebles",
  "Cobros",
  "Construcciones",
  "Rentas y Patentes",
  "Plataformas de servicios",
  "ZMT"
]
```

```sql
-- SQL
SELECT DISTINCT dependencia 
FROM inspecciones 
ORDER BY dependencia;
```

### Contar inspecciones por dependencia:

```javascript
// MongoDB
db.inspecciones.aggregate([
  { $group: { _id: "$dependencia", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

```sql
-- SQL
SELECT dependencia, COUNT(*) as count
FROM inspecciones
GROUP BY dependencia
ORDER BY count DESC;
```

---

## Troubleshooting

### Problema: Aparece "Ubicacion" en lugar de las dependencias

**Causa:** El campo de dependencia podría llamarse diferente en la BD.

**Solución:** Verifica el nombre del campo:

```javascript
// MongoDB
db.inspecciones.findOne({}, { dependencia: 1, ubicacion: 1 });
```

```sql
-- SQL
SELECT dependencia, ubicacion 
FROM inspecciones 
LIMIT 1;
```

### Problema: Solo muestra una dependencia

**Causa:** Todas las inspecciones tienen la misma dependencia.

**Solución:** Verifica la distribución:

```javascript
// MongoDB
db.inspecciones.aggregate([
  { $group: { _id: "$dependencia", count: { $sum: 1 } } }
]);
```

---

**Última actualización:** 30 de Septiembre, 2025
