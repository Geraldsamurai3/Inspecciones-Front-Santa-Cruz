# 🧪 Datos Mock - Dependencias Reales del Sistema

## Para Testing Temporal del Frontend

Usa estos datos para probar el componente mientras implementas el backend.

---

## Datos Mock con las 7 Dependencias Reales

```javascript
const mockDependenciesData = {
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
};
```

---

## Cómo Usar los Datos Mock

### Opción 1: Modificar Temporalmente el Componente

**Archivo:** `src/components/stats/DepartmentComparison.jsx`

Busca la función `loadData` y reemplázala temporalmente:

```javascript
// TEMPORAL: Comentar la función original
const loadData = async (selectedPeriod) => {
  setLoading(true);
  setError(null);
  
  // 🧪 USAR DATOS MOCK TEMPORAL
  setTimeout(() => {
    const mockData = {
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
    };
    
    console.log('✅ Usando datos MOCK con 7 dependencias:', mockData);
    setData(mockData);
    setLoading(false);
  }, 500);
  
  return; // ← Esto evita que llame al backend
  
  // FIN DATOS MOCK - CÓDIGO ORIGINAL COMENTADO ABAJO
  /*
  try {
    console.log('🔍 Cargando dependencias con período:', selectedPeriod);
    const result = await statsService.getDependencies({ period: selectedPeriod });
    console.log('✅ Datos recibidos:', result);
    setData(result);
  } catch (err) {
    console.error('❌ Error cargando dependencias:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
  */
};
```

**Con esto deberías ver:**
- ✅ 7 barras en el gráfico
- ✅ Nombres: Alcaldía, Construcciones, Bienes Inmuebles, Cobros, Rentas y Patentes, Plataformas de servicios, ZMT
- ✅ Tabla con las 7 dependencias
- ✅ Filtros funcionando (aunque devuelven los mismos datos)

---

### Opción 2: Mock Service Worker (MSW)

Si quieres una solución más profesional:

**1. Instalar MSW:**
```bash
npm install -D msw
```

**2. Crear archivo de mocks:**

**Archivo:** `src/mocks/handlers.js`

```javascript
import { rest } from 'msw';

const mockDependenciesData = {
  "period": "Últimos 7 días",
  "startDate": "2025-09-23",
  "endDate": "2025-09-30",
  "total": 145,
  "byDependency": [
    {
      "dependency": "Alcaldía",
      "total": 45,
      "byStatus": { "nuevo": 10, "enProceso": 15, "revisado": 15, "archivado": 5 },
      "percentage": 31.03
    },
    {
      "dependency": "Construcciones",
      "total": 32,
      "byStatus": { "nuevo": 8, "enProceso": 12, "revisado": 10, "archivado": 2 },
      "percentage": 22.07
    },
    {
      "dependency": "Bienes Inmuebles",
      "total": 28,
      "byStatus": { "nuevo": 5, "enProceso": 10, "revisado": 10, "archivado": 3 },
      "percentage": 19.31
    },
    {
      "dependency": "Cobros",
      "total": 20,
      "byStatus": { "nuevo": 4, "enProceso": 8, "revisado": 6, "archivado": 2 },
      "percentage": 13.79
    },
    {
      "dependency": "Rentas y Patentes",
      "total": 12,
      "byStatus": { "nuevo": 2, "enProceso": 5, "revisado": 4, "archivado": 1 },
      "percentage": 8.28
    },
    {
      "dependency": "Plataformas de servicios",
      "total": 5,
      "byStatus": { "nuevo": 1, "enProceso": 2, "revisado": 2, "archivado": 0 },
      "percentage": 3.45
    },
    {
      "dependency": "ZMT",
      "total": 3,
      "byStatus": { "nuevo": 1, "enProceso": 1, "revisado": 1, "archivado": 0 },
      "percentage": 2.07
    }
  ]
};

export const handlers = [
  rest.get('*/stats/dependencies', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || '7days';
    
    console.log('🎭 MSW: Interceptando /stats/dependencies con period:', period);
    
    return res(
      ctx.status(200),
      ctx.json(mockDependenciesData)
    );
  })
];
```

**3. Inicializar MSW:**

**Archivo:** `src/mocks/browser.js`

```javascript
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

**4. Activar en desarrollo:**

**Archivo:** `src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Activar MSW solo en desarrollo
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass'
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### Opción 3: Variable de Entorno

**1. En tu `.env.local`:**

```env
VITE_USE_MOCK_DEPENDENCIES=true
```

**2. En `DepartmentComparison.jsx`:**

```javascript
const loadData = async (selectedPeriod) => {
  setLoading(true);
  setError(null);
  
  // Usar mock si está habilitado
  if (import.meta.env.VITE_USE_MOCK_DEPENDENCIES === 'true') {
    setTimeout(() => {
      setData(mockDependenciesData);
      setLoading(false);
    }, 500);
    return;
  }
  
  // Código normal del backend...
  try {
    const result = await statsService.getDependencies({ period: selectedPeriod });
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Para desactivar los mocks:**
```env
VITE_USE_MOCK_DEPENDENCIES=false
```

---

## Resultado Esperado

Con los datos mock deberías ver:

### Gráfico:
```
  Alcaldía              ████████████████████████████ 45
  Construcciones        ████████████████████ 32
  Bienes Inmuebles      ██████████████████ 28
  Cobros                ████████████ 20
  Rentas y Patentes     ████████ 12
  Plataformas de...     ████ 5
  ZMT                   ██ 3
```

### Tabla:
| Dependencia              | Total | %     | Archiv. | Revis. | Proceso | Nuevas |
|--------------------------|-------|-------|---------|--------|---------|--------|
| Alcaldía                 | 45    | 31.0% | 5       | 15     | 15      | 10     |
| Construcciones           | 32    | 22.1% | 2       | 10     | 12      | 8      |
| Bienes Inmuebles         | 28    | 19.3% | 3       | 10     | 10      | 5      |
| Cobros                   | 20    | 13.8% | 2       | 6      | 8       | 4      |
| Rentas y Patentes        | 12    | 8.3%  | 1       | 4      | 5       | 2      |
| Plataformas de servicios | 5     | 3.4%  | 0       | 2      | 2       | 1      |
| ZMT                      | 3     | 2.1%  | 0       | 1      | 1       | 1      |

### Tarjetas:
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Archivadas  │  │ Revisadas   │  │ En Proceso  │  │ Nuevas      │
│    13       │  │    48       │  │    53       │  │    31       │
│   9.0%      │  │   33.1%     │  │   36.6%     │  │   21.4%     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Una Vez que el Backend Esté Listo

1. **Elimina o comenta** los datos mock
2. **Descomenta** el código original que llama al backend
3. **Verifica** que el backend devuelve la estructura exacta
4. **Prueba** que los filtros funcionan cambiando el período

---

**¡Con estos datos mock puedes verificar que el frontend funciona perfectamente mientras implementas el backend!** 🚀
