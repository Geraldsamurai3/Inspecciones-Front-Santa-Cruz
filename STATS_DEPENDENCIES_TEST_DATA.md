# 🧪 Datos de Prueba - Endpoint /stats/dependencies

Este archivo contiene ejemplos de respuestas para probar el frontend sin necesidad del backend.

---

## 📋 Response 1: Últimos 7 días (Normal)

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
      "dependency": "Cobros/Procedimientos Tributarios",
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
      "dependency": "Bienes Inmuebles/Antigüedad",
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
      "dependency": "Construcción",
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
      "dependency": "Recepción de Obras",
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
      "dependency": "Uso de Suelo",
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
      "dependency": "Concesión ZMT",
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

## 📋 Response 2: Último mes (Mayor volumen)

```json
{
  "period": "Último mes",
  "startDate": "2025-08-30",
  "endDate": "2025-09-30",
  "total": 487,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 152,
      "byStatus": {
        "nuevo": 35,
        "enProceso": 48,
        "revisado": 52,
        "archivado": 17
      },
      "percentage": 31.21
    },
    {
      "dependency": "Cobros/Procedimientos Tributarios",
      "total": 98,
      "byStatus": {
        "nuevo": 22,
        "enProceso": 35,
        "revisado": 31,
        "archivado": 10
      },
      "percentage": 20.12
    },
    {
      "dependency": "Bienes Inmuebles/Antigüedad",
      "total": 87,
      "byStatus": {
        "nuevo": 18,
        "enProceso": 30,
        "revisado": 29,
        "archivado": 10
      },
      "percentage": 17.86
    },
    {
      "dependency": "Construcción",
      "total": 65,
      "byStatus": {
        "nuevo": 12,
        "enProceso": 25,
        "revisado": 21,
        "archivado": 7
      },
      "percentage": 13.35
    },
    {
      "dependency": "Recepción de Obras",
      "total": 42,
      "byStatus": {
        "nuevo": 8,
        "enProceso": 16,
        "revisado": 14,
        "archivado": 4
      },
      "percentage": 8.62
    },
    {
      "dependency": "Uso de Suelo",
      "total": 28,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 10,
        "revisado": 10,
        "archivado": 3
      },
      "percentage": 5.75
    },
    {
      "dependency": "Concesión ZMT",
      "total": 15,
      "byStatus": {
        "nuevo": 3,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 2
      },
      "percentage": 3.08
    }
  ]
}
```

---

## 📋 Response 3: Período Custom (1 semana específica)

```json
{
  "period": "Período personalizado",
  "startDate": "2025-09-15",
  "endDate": "2025-09-22",
  "total": 128,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 38,
      "byStatus": {
        "nuevo": 9,
        "enProceso": 12,
        "revisado": 13,
        "archivado": 4
      },
      "percentage": 29.69
    },
    {
      "dependency": "Cobros/Procedimientos Tributarios",
      "total": 27,
      "byStatus": {
        "nuevo": 7,
        "enProceso": 10,
        "revisado": 8,
        "archivado": 2
      },
      "percentage": 21.09
    },
    {
      "dependency": "Bienes Inmuebles/Antigüedad",
      "total": 24,
      "byStatus": {
        "nuevo": 4,
        "enProceso": 9,
        "revisado": 9,
        "archivado": 2
      },
      "percentage": 18.75
    },
    {
      "dependency": "Construcción",
      "total": 18,
      "byStatus": {
        "nuevo": 3,
        "enProceso": 7,
        "revisado": 6,
        "archivado": 2
      },
      "percentage": 14.06
    },
    {
      "dependency": "Recepción de Obras",
      "total": 11,
      "byStatus": {
        "nuevo": 2,
        "enProceso": 4,
        "revisado": 4,
        "archivado": 1
      },
      "percentage": 8.59
    },
    {
      "dependency": "Uso de Suelo",
      "total": 7,
      "byStatus": {
        "nuevo": 1,
        "enProceso": 3,
        "revisado": 2,
        "archivado": 1
      },
      "percentage": 5.47
    },
    {
      "dependency": "Concesión ZMT",
      "total": 3,
      "byStatus": {
        "nuevo": 1,
        "enProceso": 1,
        "revisado": 1,
        "archivado": 0
      },
      "percentage": 2.34
    }
  ]
}
```

---

## 📋 Response 4: Sin datos (array vacío)

```json
{
  "period": "Últimos 7 días",
  "startDate": "2025-09-23",
  "endDate": "2025-09-30",
  "total": 0,
  "byDependency": []
}
```

---

## 📋 Response 5: Solo una dependencia

```json
{
  "period": "Últimos 7 días",
  "startDate": "2025-09-23",
  "endDate": "2025-09-30",
  "total": 25,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 25,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 8,
        "revisado": 10,
        "archivado": 2
      },
      "percentage": 100.0
    }
  ]
}
```

---

## 📋 Response 6: Muchas dependencias (Testing scroll)

```json
{
  "period": "Último mes",
  "startDate": "2025-08-30",
  "endDate": "2025-09-30",
  "total": 842,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 152,
      "byStatus": {
        "nuevo": 35,
        "enProceso": 48,
        "revisado": 52,
        "archivado": 17
      },
      "percentage": 18.05
    },
    {
      "dependency": "Cobros/Procedimientos Tributarios",
      "total": 128,
      "byStatus": {
        "nuevo": 30,
        "enProceso": 42,
        "revisado": 43,
        "archivado": 13
      },
      "percentage": 15.20
    },
    {
      "dependency": "Bienes Inmuebles/Antigüedad",
      "total": 115,
      "byStatus": {
        "nuevo": 28,
        "enProceso": 38,
        "revisado": 37,
        "archivado": 12
      },
      "percentage": 13.66
    },
    {
      "dependency": "Construcción",
      "total": 98,
      "byStatus": {
        "nuevo": 22,
        "enProceso": 35,
        "revisado": 31,
        "archivado": 10
      },
      "percentage": 11.64
    },
    {
      "dependency": "Recepción de Obras",
      "total": 87,
      "byStatus": {
        "nuevo": 18,
        "enProceso": 30,
        "revisado": 29,
        "archivado": 10
      },
      "percentage": 10.33
    },
    {
      "dependency": "Uso de Suelo",
      "total": 72,
      "byStatus": {
        "nuevo": 15,
        "enProceso": 25,
        "revisado": 24,
        "archivado": 8
      },
      "percentage": 8.55
    },
    {
      "dependency": "Concesión ZMT",
      "total": 65,
      "byStatus": {
        "nuevo": 12,
        "enProceso": 25,
        "revisado": 21,
        "archivado": 7
      },
      "percentage": 7.72
    },
    {
      "dependency": "Catastro",
      "total": 48,
      "byStatus": {
        "nuevo": 10,
        "enProceso": 18,
        "revisado": 15,
        "archivado": 5
      },
      "percentage": 5.70
    },
    {
      "dependency": "Obras Públicas",
      "total": 42,
      "byStatus": {
        "nuevo": 8,
        "enProceso": 16,
        "revisado": 14,
        "archivado": 4
      },
      "percentage": 4.99
    },
    {
      "dependency": "Medio Ambiente",
      "total": 35,
      "byStatus": {
        "nuevo": 7,
        "enProceso": 13,
        "revisado": 12,
        "archivado": 3
      },
      "percentage": 4.16
    }
  ]
}
```

---

## 📋 Response 7: Alta concentración en una dependencia

```json
{
  "period": "Últimos 15 días",
  "startDate": "2025-09-15",
  "endDate": "2025-09-30",
  "total": 200,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 120,
      "byStatus": {
        "nuevo": 25,
        "enProceso": 40,
        "revisado": 45,
        "archivado": 10
      },
      "percentage": 60.0
    },
    {
      "dependency": "Cobros/Procedimientos Tributarios",
      "total": 35,
      "byStatus": {
        "nuevo": 8,
        "enProceso": 12,
        "revisado": 12,
        "archivado": 3
      },
      "percentage": 17.5
    },
    {
      "dependency": "Construcción",
      "total": 25,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 9,
        "revisado": 9,
        "archivado": 2
      },
      "percentage": 12.5
    },
    {
      "dependency": "Recepción de Obras",
      "total": 15,
      "byStatus": {
        "nuevo": 3,
        "enProceso": 5,
        "revisado": 6,
        "archivado": 1
      },
      "percentage": 7.5
    },
    {
      "dependency": "Uso de Suelo",
      "total": 5,
      "byStatus": {
        "nuevo": 1,
        "enProceso": 2,
        "revisado": 2,
        "archivado": 0
      },
      "percentage": 2.5
    }
  ]
}
```

---

## 📋 Response 8: Distribución uniforme

```json
{
  "period": "Última semana",
  "startDate": "2025-09-23",
  "endDate": "2025-09-30",
  "total": 120,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    },
    {
      "dependency": "Cobros/Procedimientos Tributarios",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    },
    {
      "dependency": "Bienes Inmuebles/Antigüedad",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    },
    {
      "dependency": "Construcción",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    },
    {
      "dependency": "Recepción de Obras",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    },
    {
      "dependency": "Uso de Suelo",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 5,
        "revisado": 5,
        "archivado": 5
      },
      "percentage": 16.67
    }
  ]
}
```

---

## 🧪 Cómo Usar para Testing

### Opción 1: Mock Service Worker (MSW)

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/stats/dependencies', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || '7days';
    
    // Devolver diferentes respuestas según el período
    const responses = {
      '7days': /* Response 1 */,
      '1month': /* Response 2 */,
      'custom': /* Response 3 */
    };

    return res(
      ctx.status(200),
      ctx.json(responses[period] || responses['7days'])
    );
  })
];
```

### Opción 2: Hardcodear temporalmente en el servicio

```javascript
// src/services/statsService.js
async getDependencies(params = {}) {
  // TEMPORAL: Para testing sin backend
  if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    return Promise.resolve(/* Response 1 */);
  }
  
  // Código normal...
  const { period = '7days', startDate, endDate } = params;
  // ...
}
```

### Opción 3: Servidor Mock con JSON Server

```bash
npm install -D json-server
```

```json
// db.json
{
  "dependencies": {
    "7days": {
      "period": "Últimos 7 días",
      "startDate": "2025-09-23",
      "endDate": "2025-09-30",
      "total": 145,
      "byDependency": [...]
    }
  }
}
```

```bash
json-server --watch db.json --port 3000
```

---

## ✅ Validaciones a Verificar

Al probar con estos datos, verificar que:

1. **Gráfico de barras apiladas:**
   - [ ] Se renderiza correctamente
   - [ ] Colores corresponden a los estados
   - [ ] Barras en orden descendente por total
   - [ ] Tooltip muestra información correcta

2. **Tabla:**
   - [ ] Todas las dependencias listadas
   - [ ] Totales suman correctamente
   - [ ] Porcentajes tienen 1 decimal
   - [ ] Colores por columna correctos
   - [ ] Hover effect funciona

3. **Tarjetas de resumen:**
   - [ ] Totales calculados correctamente
   - [ ] Porcentajes suman ~100%
   - [ ] Gradientes visibles
   - [ ] Números formateados

4. **Header:**
   - [ ] Período mostrado correctamente
   - [ ] Fechas formateadas en español
   - [ ] Total general visible
   - [ ] Botones de filtro funcionan

5. **Responsividad:**
   - [ ] Mobile: 1 columna
   - [ ] Tablet: 2 columnas
   - [ ] Desktop: 4 columnas
   - [ ] Gráfico ajusta al contenedor
   - [ ] Tabla tiene scroll horizontal en mobile

---

**Última actualización:** 30 de Septiembre, 2025
