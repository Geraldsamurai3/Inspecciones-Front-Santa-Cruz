# 🚀 Guía de Configuración y Despliegue

## 📋 Índice
- [Requisitos](#requisitos)
- [Instalación Local](#instalación-local)
- [Configuración de Entorno](#configuración-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Build para Producción](#build-para-producción)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Integración con Backend](#integración-con-backend)
- [Solución de Problemas](#solución-de-problemas)

---

## 💻 Requisitos

### Software Necesario

| Software | Versión Mínima | Recomendada | Propósito |
|----------|----------------|-------------|-----------|
| **Node.js** | 18.0.0 | 20.x LTS | Runtime JavaScript |
| **npm** | 9.0.0 | 10.x | Gestor de paquetes |
| **Git** | 2.30.0 | Latest | Control de versiones |
| **VS Code** | 1.70.0 | Latest | Editor (recomendado) |

### Extensiones de VS Code Recomendadas

\`\`\`json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "ms-playwright.playwright"
  ]
}
\`\`\`

---

## 📦 Instalación Local

### 1. Clonar el Repositorio

\`\`\`bash
# HTTPS
git clone https://github.com/municipalidad-santa-cruz/inspecciones-muni.git

# SSH (recomendado)
git clone git@github.com:municipalidad-santa-cruz/inspecciones-muni.git

# Entrar al directorio
cd inspecciones-muni
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
# Instalar todas las dependencias
npm install

# O usando pnpm (más rápido)
pnpm install

# Verificar instalación
npm list --depth=0
\`\`\`

**Tiempo estimado**: 2-3 minutos (depende de conexión a internet)

### 3. Crear Archivo de Entorno

\`\`\`bash
# Copiar template
cp .env.example .env

# O crear manualmente
touch .env
\`\`\`

**Contenido de `.env`:**

\`\`\`bash
# Backend API (Railway)
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app

# Cloudinary (Opcional - backend maneja upload)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# URL de ilustración de login (Opcional)
VITE_ILLUSTRATION_URL=https://your-illustration-url.com/image.png
\`\`\`

### 4. Verificar Configuración

\`\`\`bash
# Ver variables de entorno cargadas
npm run env:check

# O manualmente
echo $VITE_API_URL
\`\`\`

### 5. Iniciar Servidor de Desarrollo

\`\`\`bash
npm run dev
\`\`\`

**Salida esperada:**

\`\`\`
  VITE v7.0.4  ready in 1234 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
\`\`\`

### 6. Abrir en Navegador

Navega a: **http://localhost:5174**

Deberías ver la página de login del sistema.

---

## ⚙️ Configuración de Entorno

### Variables de Entorno Detalladas

#### VITE_API_URL (REQUERIDA)

**Descripción**: URL base del backend API

**Valores posibles:**

\`\`\`bash
# Producción
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app

# Desarrollo local (si tienes backend corriendo localmente)
VITE_API_URL=http://localhost:3000

# Staging (si existe)
VITE_API_URL=https://staging-inspecciones-muni.up.railway.app
\`\`\`

**Uso en código:**

\`\`\`javascript
const API_URL = import.meta.env.VITE_API_URL;
\`\`\`

#### VITE_CLOUDINARY_CLOUD_NAME (OPCIONAL)

**Descripción**: Nombre de tu cuenta de Cloudinary (generalmente manejado por backend)

\`\`\`bash
VITE_CLOUDINARY_CLOUD_NAME=municipalidad-santa-cruz
\`\`\`

#### VITE_CLOUDINARY_UPLOAD_PRESET (OPCIONAL)

**Descripción**: Preset de upload de Cloudinary (generalmente manejado por backend)

\`\`\`bash
VITE_CLOUDINARY_UPLOAD_PRESET=inspecciones_preset
\`\`\`

#### VITE_ILLUSTRATION_URL (OPCIONAL)

**Descripción**: URL de la ilustración mostrada en la página de login

\`\`\`bash
VITE_ILLUSTRATION_URL=https://res.cloudinary.com/.../login-illustration.png
\`\`\`

### Archivo vercel.json

\`\`\`json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
\`\`\`

**Propósito**: Permite que React Router maneje todas las rutas (SPA routing)

---

## 📜 Scripts Disponibles

### Desarrollo

\`\`\`bash
# Iniciar servidor de desarrollo (puerto 5174)
npm run dev

# Iniciar con host expuesto (para testing en red local)
npm run dev -- --host

# Iniciar con puerto específico
npm run dev -- --port 3000
\`\`\`

### Build

\`\`\`bash
# Build para producción
npm run build

# Build con análisis de bundle
npm run build -- --mode analyze
\`\`\`

**Salida**: Carpeta `dist/` con archivos optimizados

### Preview

\`\`\`bash
# Preview de build de producción localmente
npm run preview
\`\`\`

Abre: **http://localhost:4173**

### Linting

\`\`\`bash
# Revisar errores de ESLint
npm run lint

# Auto-fix de errores
npm run lint:fix
\`\`\`

### Testing

\`\`\`bash
# Ejecutar tests E2E con Playwright
npm run test

# Tests con UI interactiva
npm run test:ui

# Tests de seguridad
npm run test:security
\`\`\`

### Utilidades

\`\`\`bash
# Limpiar cache y node_modules
npm run clean

# Reinstalar dependencias
npm run clean && npm install

# Ver árbol de dependencias
npm list --depth=1
\`\`\`

---

## 🏗️ Build para Producción

### 1. Preparar para Build

\`\`\`bash
# Limpiar builds anteriores
rm -rf dist

# Actualizar dependencias (opcional)
npm update

# Verificar que no haya errores
npm run lint
\`\`\`

### 2. Ejecutar Build

\`\`\`bash
npm run build
\`\`\`

**Proceso:**
1. Vite compila el código
2. Optimiza assets (minificación, tree-shaking)
3. Genera bundle con hash en nombres
4. Crea source maps (opcional)

**Salida esperada:**

\`\`\`
vite v7.0.4 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.css   123.45 kB │ gzip: 23.45 kB
dist/assets/index-e5f6g7h8.js    456.78 kB │ gzip: 89.01 kB
✓ built in 12.34s
\`\`\`

### 3. Verificar Build

\`\`\`bash
# Preview del build
npm run preview

# Abrir en navegador
open http://localhost:4173
\`\`\`

### 4. Analizar Bundle (Opcional)

\`\`\`bash
# Ver tamaño de chunks
npm run build -- --mode analyze

# O con herramienta externa
npx vite-bundle-visualizer
\`\`\`

---

## ☁️ Despliegue en Vercel

### Opción 1: Despliegue Automático desde GitHub

#### 1. Conectar Repositorio

1. Ir a [vercel.com](https://vercel.com)
2. Hacer clic en "New Project"
3. Importar repositorio de GitHub
4. Seleccionar `Inpecciones-Muni`

#### 2. Configurar Variables de Entorno

En Vercel Dashboard:

\`\`\`
Settings → Environment Variables
\`\`\`

Agregar:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://inspecciones-muni-santa-cruz-production.up.railway.app` | Production |
| `VITE_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Production |
| `VITE_ILLUSTRATION_URL` | `https://...` | Production (opcional) |

#### 3. Configurar Build Settings

\`\`\`yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 20.x
\`\`\`

#### 4. Desplegar

Hacer clic en **"Deploy"**

**Tiempo estimado**: 2-3 minutos

#### 5. Verificar Despliegue

Vercel te dará una URL: `https://tu-proyecto.vercel.app`

---

### Opción 2: Despliegue Manual con CLI

#### 1. Instalar Vercel CLI

\`\`\`bash
npm install -g vercel
\`\`\`

#### 2. Login

\`\`\`bash
vercel login
\`\`\`

#### 3. Configurar Proyecto

\`\`\`bash
vercel
\`\`\`

Responder las preguntas:

\`\`\`
? Set up and deploy? Yes
? Which scope? Your Account
? Link to existing project? No
? Project name? inspecciones-muni
? In which directory is your code? ./
? Want to override settings? No
\`\`\`

#### 4. Configurar Variables

\`\`\`bash
# Agregar variables una por una
vercel env add VITE_API_URL production
# Pegar valor cuando se solicite

vercel env add VITE_CLOUDINARY_CLOUD_NAME production
# ...
\`\`\`

#### 5. Desplegar a Producción

\`\`\`bash
vercel --prod
\`\`\`

---

### Despliegues Subsecuentes

\`\`\`bash
# Desde main branch (automático)
git push origin main

# O manual
vercel --prod
\`\`\`

---

## 🔗 Integración con Backend

### Verificar Conectividad

\`\`\`bash
# Verificar que el backend responde
curl https://inspecciones-muni-santa-cruz-production.up.railway.app/health

# Respuesta esperada
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
\`\`\`

### Endpoints Críticos

| Endpoint | Método | Propósito | Auth |
|----------|--------|-----------|------|
| `/auth/login` | POST | Login | No |
| `/inspections` | GET | Listar inspecciones | Sí |
| `/cloudinary/upload` | POST | Subir foto | Sí |
| `/stats/summary` | GET | Estadísticas | Sí |

### CORS Configuration

El backend debe permitir requests desde:

\`\`\`javascript
// Backend (NestJS)
const allowedOrigins = [
  'https://tu-proyecto.vercel.app',
  'http://localhost:5174', // Desarrollo
];
\`\`\`

---

## 🐛 Solución de Problemas

### Problema: npm install falla

**Error común**: `npm ERR! code ERESOLVE`

**Solución 1**: Usar `--legacy-peer-deps`

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

**Solución 2**: Limpiar cache

\`\`\`bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
\`\`\`

---

### Problema: Build falla en Vercel

**Error**: `Module not found`

**Causa**: Import paths incorrectos o dependencias faltantes

**Solución**:

1. Verificar imports con @:

\`\`\`javascript
// ✅ Correcto
import { Button } from '@/components/ui/button';

// ❌ Incorrecto
import { Button } from '../../components/ui/button';
\`\`\`

2. Verificar vite.config.js:

\`\`\`javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
\`\`\`

---

### Problema: Variables de entorno no se cargan

**Error**: `import.meta.env.VITE_API_URL is undefined`

**Solución**:

1. Asegurarse de que el nombre empiece con `VITE_`
2. Reiniciar el servidor de desarrollo
3. Verificar en Vercel que las variables estén en "Production"

\`\`\`bash
# Reiniciar servidor
npm run dev
\`\`\`

---

### Problema: Rutas no funcionan después de refresh

**Error**: 404 en rutas como `/admin/users`

**Causa**: Vercel no está reenviando rutas a index.html

**Solución**: Verificar `vercel.json`

\`\`\`json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
\`\`\`

---

### Problema: CORS error al conectar con backend

**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Causa**: Backend no permite el origin del frontend

**Solución**: Contactar al equipo de backend para agregar tu dominio Vercel a la lista de CORS allowed origins

\`\`\`javascript
// Backend debe permitir
allowedOrigins: ['https://tu-proyecto.vercel.app']
\`\`\`

---

## 🔍 Checklist de Despliegue

### Pre-Despliegue

- [ ] Todas las pruebas pasan (`npm run test`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] Build local funciona (`npm run build && npm run preview`)
- [ ] Variables de entorno configuradas
- [ ] Backend está corriendo y accesible
- [ ] Cloudinary configurado (si aplica)

### Post-Despliegue

- [ ] URL de Vercel funciona
- [ ] Login funciona correctamente
- [ ] Fotos se suben sin error
- [ ] Reportes se generan
- [ ] Estadísticas cargan
- [ ] Todas las rutas accesibles
- [ ] No hay errores en consola del navegador

---

## 📊 Monitoreo

### Vercel Analytics

Activar en Vercel Dashboard:

\`\`\`
Settings → Analytics → Enable
\`\`\`

### Logs en Tiempo Real

\`\`\`bash
# Ver logs en vivo
vercel logs --follow
\`\`\`

### Performance

Medir con Lighthouse:

\`\`\`bash
npx lighthouse https://tu-proyecto.vercel.app
\`\`\`

**Métricas objetivo:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

---

## 🚀 Optimizaciones

### Lazy Loading de Rutas

\`\`\`jsx
// App.jsx
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

<Suspense fallback={<Loading />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</Suspense>
\`\`\`

### Image Optimization

Usar Cloudinary transformations:

\`\`\`javascript
const optimizedUrl = url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
\`\`\`

### Code Splitting

Vite hace esto automáticamente, pero puedes verificar:

\`\`\`bash
npm run build -- --mode analyze
\`\`\`

---

**Última actualización**: ${new Date().toLocaleDateString('es-CR')}
**Mantenido por**: Equipo de Desarrollo - Municipalidad de Santa Cruz
