# Módulo de Estadísticas - Sistema de Inspecciones

## 📊 Descripción General

El módulo de estadísticas proporciona un sistema completo de análisis y reportes para el sistema de inspecciones municipales. Incluye dashboards interactivos, métricas en tiempo real y capacidades de exportación.

## 🚀 Características Principales

### 📈 **Endpoints de API Disponibles**
- `/stats/summary` - Resumen básico para dashboard principal
- `/stats/status-counts` - Conteos por estado para gráficos
- `/stats/inspections` - Estadísticas completas con datos temporales
- `/stats/special-inspections` - Análisis de inspecciones especiales
- `/stats/inspectors` - Rendimiento y ranking de inspectores
- `/stats/departments` - Comparación entre departamentos
- `/stats/detailed` - Vista analítica completa
- `/stats/dashboard` - Dashboard estándar con tendencias
- `/stats/complete-overview` - Vista ejecutiva 360°

### 🎯 **Componentes Disponibles**

#### 1. **SummaryCards**
- Tarjetas de resumen con métricas principales
- Tendencias y comparaciones mes anterior
- Indicadores de eficiencia del equipo

#### 2. **StatusChart**
- Gráficos circulares y de barras
- Distribución por estados de inspección
- Vista interactiva con filtros

#### 3. **InspectionTrends**
- Análisis temporal de inspecciones
- Tendencias mensuales y estacionales
- Comparación de completadas vs iniciadas

#### 4. **InspectorRanking**
- Ranking de productividad por inspector
- Métricas de eficiencia individual
- Sistema de reconocimientos

#### 5. **DepartmentComparison**
- Comparación entre departamentos
- Análisis de inspecciones regulares vs especiales
- Métricas de rendimiento departamental

#### 6. **DetailedAnalytics**
- KPIs avanzados y métricas de calidad
- Análisis de eficiencia operacional
- Objetivos vs resultados reales

## 🛠️ Uso del Sistema

### **Hook Principal - useStats**
```javascript
import { useStats, useSummaryStats } from '@/hooks/useStats';

// Uso básico
const { data, loading, error, refresh } = useSummaryStats({
  autoFetch: true,
  refreshInterval: 30000 // 30 segundos
});

// Uso avanzado
const { data, changeEndpoint } = useStats('summary', {
  autoFetch: false
});
```

### **Hooks Especializados**
- `useSummaryStats()` - Resumen general
- `useStatusCounts()` - Conteos por estado
- `useInspectionStats()` - Datos de inspecciones
- `useInspectorStats()` - Datos de inspectores
- `useDepartmentStats()` - Datos departamentales
- `useDetailedStats()` - Análisis detallado

### **Servicio de API**
```javascript
import statsService from '@/services/statsService';

// Llamadas directas
const summary = await statsService.getSummary();
const statusCounts = await statsService.getStatusCounts();
const inspectors = await statsService.getInspectors();

// Con filtros de fecha
const data = await statsService.getSummaryByDateRange('2024-01-01', '2024-12-31');
```

## 📋 Estructura de Archivos

```
src/
├── services/
│   └── statsService.js           # Servicio de API
├── hooks/
│   └── useStats.js              # Hooks personalizados
├── pages/
│   └── StatsPage.jsx            # Página principal
└── components/stats/
    ├── index.js                 # Exportaciones
    ├── SummaryCards.jsx         # Tarjetas de resumen
    ├── StatusChart.jsx          # Gráficos de estado
    ├── InspectionTrends.jsx     # Tendencias temporales
    ├── InspectorRanking.jsx     # Ranking de inspectores
    ├── DepartmentComparison.jsx # Comparación departamental
    ├── DetailedAnalytics.jsx    # Análisis detallado
    └── StatsConfig.jsx          # Configuración avanzada
```

## 🔧 Configuración

### **Variables de Entorno**
```env
VITE_API_BASE_URL=http://localhost:3000
```

### **Permisos de Acceso**
- **Admin**: Acceso completo a todas las estadísticas
- **Inspector**: Acceso limitado a métricas básicas

### **Rutas Configuradas**
- `/admin/stats` - Página principal de estadísticas (Solo Admin)

## 📊 Tipos de Datos

### **Resumen (Summary)**
```javascript
{
  totalInspections: number,
  completedInspections: number,
  pendingInspections: number,
  inProgressInspections: number,
  totalInspectors: number,
  activeDepartments: number,
  avgCompletionTime: number,
  satisfactionRate: number,
  trends: {
    totalInspections: number,    // % cambio
    completedInspections: number,
    pendingInspections: number,
    inProgressInspections: number
  }
}
```

### **Conteos por Estado (Status Counts)**
```javascript
{
  nuevo: number,
  en_proceso: number,
  revisado: number,
  completado: number,
  cancelado: number,
  rechazado: number
}
```

### **Datos de Inspector**
```javascript
[
  {
    id: number,
    name: string,
    completed: number,
    pending: number,
    efficiency: number
  }
]
```

## 🎨 Personalización

### **Temas y Colores**
Los componentes utilizan Tailwind CSS con colores configurables:
- Azul (`blue-500`) - Métricas principales
- Verde (`green-500`) - Completadas/Éxito
- Amarillo (`yellow-500`) - En proceso/Advertencia
- Rojo (`red-500`) - Pendientes/Error

### **Intervalos de Actualización**
- **Rápido**: 10-30 segundos (métricas en tiempo real)
- **Normal**: 1-5 minutos (datos estándar)
- **Lento**: 15-30 minutos (análisis profundos)

## 🔄 Actualización Automática

```javascript
// Configurar refresh automático
const { data } = useSummaryStats({
  refreshInterval: 30000 // 30 segundos
});

// Refresh manual
const { refresh } = useStats('summary');
refresh(); // Actualizar cuando sea necesario
```

## 📈 Métricas Clave

1. **Eficiencia General**: % de inspecciones completadas
2. **Tiempo Promedio**: Días promedio para completar
3. **Productividad**: Inspecciones por inspector
4. **Satisfacción**: Calificación promedio de calidad
5. **Carga de Trabajo**: Inspecciones pendientes + en proceso

## 🚀 Recomendaciones de Uso

### **Para Dashboard Principal**
```javascript
// Usar summary para métricas rápidas
const { data } = useSummaryStats({ refreshInterval: 30000 });
```

### **Para Análisis Detallado**
```javascript
// Usar detailed para análisis profundo
const { data } = useDetailedStats({ autoFetch: true });
```

### **Para Reportes Ejecutivos**
```javascript
// Usar complete-overview para vista ejecutiva
const { data } = useCompleteOverviewStats();
```

## 🛡️ Manejo de Errores

El sistema incluye manejo robusto de errores:
- Fallbacks con datos de ejemplo
- Estados de carga con skeletons
- Mensajes de error informativos
- Reintentos automáticos

## 📱 Responsividad

Todos los componentes están optimizados para:
- **Desktop**: Layouts de múltiples columnas
- **Tablet**: Grids adaptativos
- **Mobile**: Vistas apiladas verticalmente

---

**Desarrollado para el Departamento de Inspecciones - Municipalidad de Santa Cruz**