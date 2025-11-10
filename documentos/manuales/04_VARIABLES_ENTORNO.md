# 🔧 Guía de Configuración de Variables de Entorno

## 📋 Índice
- [Variables de Entorno Explicadas](#variables-de-entorno-explicadas)
- [Configuración por Ambiente](#configuración-por-ambiente)
- [Cambio de Variables en Producción](#cambio-de-variables-en-producción)
- [Variables Sensibles y Seguridad](#variables-sensibles-y-seguridad)
- [Troubleshooting](#troubleshooting)

---

## 🔍 Variables de Entorno Explicadas

### Variables Principales

#### `VITE_API_URL` ⚠️ **CRÍTICA**

**Descripción**: URL completa del backend (API) del sistema.

**Formato**: `https://dominio.com/api` (debe terminar en `/api`)

**Ejemplos por ambiente**:
```bash
# Desarrollo local
VITE_API_URL=http://localhost:4000/api

# Staging
VITE_API_URL=https://api-staging.municipalidad.cr/api

# Producción
VITE_API_URL=https://api.municipalidad.cr/api

# VPS con IP
VITE_API_URL=http://123.45.67.89:4000/api

# Datacenter interno
VITE_API_URL=https://api-inspecciones.municipalidad.local/api
```

**⚠️ IMPORTANTE**:
- **DEBE** terminar en `/api` (el backend espera este path)
- **DEBE** incluir protocolo (`http://` o `https://`)
- **NO** debe tener slash final después de `/api`
- Si cambias esta variable, **DEBES recompilar** con `npm run build`

---

#### `NODE_ENV`

**Descripción**: Define el entorno de ejecución.

**Valores permitidos**:
- `development` - Desarrollo local
- `production` - Producción (siempre usar en deploy)
- `test` - Testing

**Efecto**:
- `development`: Habilita hot-reload, sourcemaps, warnings en consola
- `production`: Minifica código, optimiza assets, deshabilita warnings

```bash
# Desarrollo
NODE_ENV=development

# Producción
NODE_ENV=production
```

---

### Variables Opcionales

#### `VITE_APP_VERSION`

**Descripción**: Versión de la aplicación (para mostrar en UI o logging).

```bash
VITE_APP_VERSION=1.0.0
```

#### `VITE_ENABLE_LOGGING`

**Descripción**: Habilitar logs de debug en consola.

```bash
# Habilitar logs (desarrollo)
VITE_ENABLE_LOGGING=true

# Deshabilitar logs (producción)
VITE_ENABLE_LOGGING=false
```

#### `VITE_SENTRY_DSN`

**Descripción**: URL de Sentry para monitoreo de errores (si usas Sentry).

```bash
VITE_SENTRY_DSN=https://xxxxxx@o123456.ingest.sentry.io/123456
```

#### `VITE_GA_TRACKING_ID`

**Descripción**: ID de Google Analytics (si usas GA).

```bash
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🌍 Configuración por Ambiente

### Desarrollo Local

**Archivo**: `.env.development` o `.env`

```bash
# ========================================
# DESARROLLO LOCAL
# ========================================

# Backend local (puerto por defecto: 4000)
VITE_API_URL=http://localhost:4000/api

# Entorno
NODE_ENV=development

# Debug habilitado
VITE_ENABLE_LOGGING=true

# Versión
VITE_APP_VERSION=1.0.0-dev
```

**Uso**:
```bash
npm run dev
# Vite automáticamente carga .env.development
```

---

### Staging

**Archivo**: `.env.staging`

```bash
# ========================================
# STAGING / PRE-PRODUCCIÓN
# ========================================

# Backend de staging
VITE_API_URL=https://api-staging.municipalidad.cr/api

# Entorno
NODE_ENV=production

# Logs moderados
VITE_ENABLE_LOGGING=true

# Versión
VITE_APP_VERSION=1.0.0-rc1

# Sentry (si aplica)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/staging
```

**Uso**:
```bash
npm run build -- --mode staging
```

---

### Producción (Vercel)

**Configuración en Vercel Dashboard**:

1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar variables:

```
Name: VITE_API_URL
Value: https://api.municipalidad.cr/api
Environment: Production

Name: NODE_ENV
Value: production
Environment: Production
```

**⚠️ NO subir archivo `.env.production` a Git**

---

### Producción (VPS)

**Archivo en servidor**: `/home/deployer/Inspecciones-Front-Santa-Cruz/.env`

```bash
# ========================================
# PRODUCCIÓN - VPS
# ========================================

# Backend en servidor remoto
VITE_API_URL=https://api.municipalidad.cr/api

# O backend en mismo servidor
# VITE_API_URL=http://localhost:4000/api

# Entorno
NODE_ENV=production

# Sin logs en producción
VITE_ENABLE_LOGGING=false

# Versión
VITE_APP_VERSION=1.0.0

# Sentry (si aplica)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/production
```

**Aplicar cambios**:
```bash
cd ~/Inspecciones-Front-Santa-Cruz
vim .env  # Editar
npm run build  # ⚠️ RECOMPILAR
sudo systemctl reload nginx
```

---

### Producción (Datacenter)

**Archivo en servidor**: `/opt/apps/Inspecciones-Front-Santa-Cruz/.env`

```bash
# ========================================
# PRODUCCIÓN - DATACENTER CORPORATIVO
# ========================================

# Backend interno (red privada)
VITE_API_URL=https://api-inspecciones.municipalidad.local/api

# O con IP interna
# VITE_API_URL=http://10.0.2.10:4000/api

# Entorno
NODE_ENV=production

# Logs deshabilitados
VITE_ENABLE_LOGGING=false

# Versión
VITE_APP_VERSION=1.0.0

# Sentry interno (si aplica)
VITE_SENTRY_DSN=https://xxxxx@sentry.municipalidad.cr/prod
```

**Aplicar cambios**:
```bash
su - appuser
cd /opt/apps/Inspecciones-Front-Santa-Cruz
vim .env
npm run build  # ⚠️ RECOMPILAR
exit
sudo systemctl reload nginx
```

---

## 🔄 Cambio de Variables en Producción

### Proceso General

**⚠️ REGLA DE ORO**: Cualquier cambio en variables **requiere rebuild**.

```bash
# 1. Conectarse al servidor
ssh usuario@servidor

# 2. Navegar al proyecto
cd /ruta/al/proyecto

# 3. Editar .env
vim .env
# O
nano .env

# 4. ⚠️ RECOMPILAR (CRÍTICO)
npm run build

# 5. Reiniciar servidor web
sudo systemctl reload nginx
# O si usas PM2:
# pm2 restart inspecciones-app

# 6. Verificar cambios
curl -I https://tu-dominio.com
```

---

### Cambio en Vercel

**Opción 1: Desde el Dashboard**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Editar variable (ej: `VITE_API_URL`)
4. Guardar cambios
5. Trigger nuevo deployment:
   - Deployments → ... (menú) → Redeploy

**Opción 2: Desde CLI**

```bash
# Agregar/actualizar variable
vercel env add VITE_API_URL production
# Ingresar valor cuando pregunte

# Redeploy
vercel --prod
```

**Opción 3: Desde Git (push trigger)**

```bash
# Push cualquier cambio trigger auto-redeploy con nuevas variables
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

### Cambio en VPS con GitHub Actions

**Workflow automático**:

Si tienes CI/CD configurado, el workflow se encarga:

```yaml
# .github/workflows/deploy-vps.yml
- name: Deploy to VPS
  uses: appleboy/ssh-action@master
  with:
    script: |
      cd ~/Inspecciones-Front-Santa-Cruz
      
      # Actualizar variable en .env
      sed -i 's|VITE_API_URL=.*|VITE_API_URL=${{ secrets.VITE_API_URL }}|' .env
      
      # Rebuild
      npm run build
      
      # Reload Nginx
      sudo systemctl reload nginx
```

**Manual (sin CI/CD)**:

```bash
ssh deployer@tu-vps
cd ~/Inspecciones-Front-Santa-Cruz

# Editar .env
vim .env
# Cambiar VITE_API_URL=https://nueva-api.com/api

# Rebuild
npm run build

# Reload
sudo systemctl reload nginx
```

---

### Cambio en Datacenter

**Proceso con Change Management**:

```bash
# 1. Documentar cambio (Change Request)
# 2. Obtener aprobación

# 3. Hacer backup
sudo /opt/scripts/backup-app.sh

# 4. Cambiar variable
su - appuser
cd /opt/apps/Inspecciones-Front-Santa-Cruz
cp .env .env.backup  # Backup adicional
vim .env
# Modificar VITE_API_URL

# 5. Rebuild
npm run build

# 6. Verificar build
ls -lah dist/

# 7. Reload Nginx
exit
sudo systemctl reload nginx

# 8. Sincronizar a servidor 2 (si HA)
rsync -avz dist/ appuser@10.0.1.11:/opt/apps/Inspecciones-Front-Santa-Cruz/dist/

# 9. Verificar funcionamiento
curl https://inspecciones.municipalidad.cr/health

# 10. Monitorear logs
tail -f /var/log/nginx/inspecciones_error.log
```

---

## 🔐 Variables Sensibles y Seguridad

### Mejores Prácticas

#### 1. **NO** subir `.env` a Git

```bash
# Verificar .gitignore
cat .gitignore

# Debe contener:
.env
.env.local
.env.production
.env.staging
```

#### 2. Usar `.env.example` como plantilla

```bash
# .env.example (SÍ se sube a Git)
VITE_API_URL=https://api.ejemplo.com/api
NODE_ENV=production
VITE_ENABLE_LOGGING=false
```

```bash
# Al clonar proyecto, copiar y rellenar
cp .env.example .env
vim .env  # Llenar valores reales
```

#### 3. Permisos restrictivos en servidor

```bash
# Solo el usuario propietario puede leer
chmod 600 .env

# Verificar
ls -la .env
# -rw------- 1 appuser appuser 256 Nov 10 10:00 .env
```

#### 4. Rotar credenciales periódicamente

```bash
# Cada 90 días (o según política):
# 1. Generar nuevos tokens/passwords
# 2. Actualizar .env
# 3. Rebuild
# 4. Revocar tokens antiguos
```

#### 5. Usar servicios de secrets management (empresarial)

**HashiCorp Vault**:
```bash
# Obtener secretos desde Vault
export VITE_API_URL=$(vault kv get -field=api_url secret/inspecciones)
npm run build
```

**AWS Secrets Manager**:
```bash
export VITE_API_URL=$(aws secretsmanager get-secret-value \
  --secret-id inspecciones/api-url \
  --query SecretString \
  --output text)
```

---

## 🔍 Verificación de Variables

### En Desarrollo

```bash
# Imprimir variables (solo desarrollo)
npm run dev

# En consola del navegador:
console.log(import.meta.env.VITE_API_URL)
```

### En Producción

**⚠️ Nunca exponer variables en consola de producción**

**Método 1: Verificar en código buildado**

```bash
# Buscar en archivos JS compilados
grep -r "VITE_API_URL" dist/assets/*.js
# O
grep -r "api.municipalidad.cr" dist/assets/*.js
```

**Método 2: Network tab del navegador**

1. Abrir DevTools
2. Network tab
3. Filtrar por "api"
4. Ver Request URL de las peticiones

**Método 3: Test endpoint**

```bash
# Desde servidor
curl https://tu-dominio.com
# Inspeccionar HTML source para referencias a API
```

---

## 🚨 Troubleshooting

### Error: "Failed to fetch" o Network Error

**Causa**: `VITE_API_URL` incorrecta o backend no accesible.

**Diagnóstico**:
```bash
# 1. Verificar valor actual en .env
cat .env | grep VITE_API_URL

# 2. Verificar que backend esté corriendo
curl https://api.municipalidad.cr/api/health
# Debe responder 200 OK

# 3. Verificar desde servidor frontend
curl -v https://api.municipalidad.cr/api/health
```

**Solución**:
```bash
# 1. Corregir .env
vim .env
VITE_API_URL=https://api-correcta.com/api

# 2. ⚠️ REBUILD (CRÍTICO)
npm run build

# 3. Reiniciar servidor
sudo systemctl reload nginx
```

---

### Error: Variables no se actualizan

**Causa**: No se recompiló después de cambiar `.env`.

**Solución**:
```bash
# 1. Limpiar build anterior
rm -rf dist/

# 2. Rebuild completo
npm run build

# 3. Verificar que se generó dist/
ls -la dist/

# 4. Reiniciar servidor
sudo systemctl reload nginx
```

---

### Error: CORS en producción

**Causa**: Backend no tiene configurado CORS para tu dominio.

**Diagnóstico**:
```bash
# Ver error en consola del navegador:
# "Access-Control-Allow-Origin" missing
```

**Solución en Backend (Node.js/Express)**:

```javascript
// backend/src/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://inspecciones.municipalidad.cr',
    'https://www.inspecciones.municipalidad.cr'
  ],
  credentials: true
}));
```

---

### Error: ENV variables undefined

**Causa**: Variable no tiene prefijo `VITE_`.

**Vite solo expone variables con prefijo `VITE_`**:

```bash
# ❌ NO funcionará
API_URL=https://api.com/api

# ✅ SÍ funcionará
VITE_API_URL=https://api.com/api
```

**Acceso en código**:
```javascript
// ❌ Incorrecto
const apiUrl = process.env.API_URL  // undefined

// ✅ Correcto
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 📋 Checklist de Cambio de Variables

Usar este checklist cada vez que cambies variables en producción:

- [ ] Backup del `.env` actual (`cp .env .env.backup`)
- [ ] Documentar cambio (Change Request si es datacenter)
- [ ] Editar `.env` con nuevos valores
- [ ] Verificar sintaxis (sin espacios alrededor de `=`)
- [ ] **Ejecutar `npm run build`** (CRÍTICO)
- [ ] Verificar que `dist/` se regeneró (`ls -lt dist/`)
- [ ] Reiniciar servidor web (`systemctl reload nginx`)
- [ ] Sincronizar a servidor 2 (si HA)
- [ ] Verificar sitio en navegador
- [ ] Probar login y funcionalidad clave
- [ ] Monitorear logs por 10 minutos
- [ ] Notificar a equipo del cambio

---

## 📚 Referencias Rápidas

### Ubicaciones de .env por Ambiente

| Ambiente | Ruta del archivo .env |
|----------|----------------------|
| **Local** | `./Inspecciones-Front-Santa-Cruz/.env` |
| **VPS** | `/home/deployer/Inspecciones-Front-Santa-Cruz/.env` |
| **Datacenter** | `/opt/apps/Inspecciones-Front-Santa-Cruz/.env` |
| **Vercel** | Configurado en Vercel Dashboard (sin archivo) |

### Comandos Esenciales

```bash
# Ver variables actuales
cat .env

# Editar variables
vim .env  # o nano .env

# Rebuild (SIEMPRE después de cambiar .env)
npm run build

# Verificar build
ls -lah dist/

# Reiniciar Nginx
sudo systemctl reload nginx

# Reiniciar PM2
pm2 restart inspecciones-app

# Ver logs
tail -f /var/log/nginx/inspecciones_error.log
```

---

**Última actualización**: Noviembre 2025  
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
