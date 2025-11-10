# 🔗 Guía de Conexión Frontend-Backend y Despliegue Completo

## 📋 Índice
- [Arquitectura de Conexión](#arquitectura-de-conexión)
- [Preparación del Backend](#preparación-del-backend)
- [Configuración de CORS](#configuración-de-cors)
- [Escenarios de Despliegue](#escenarios-de-despliegue)
- [Caso 1: Desarrollo Local](#caso-1-desarrollo-local)
- [Caso 2: Backend y Frontend en Mismo VPS](#caso-2-backend-y-frontend-en-mismo-vps)
- [Caso 3: Backend y Frontend en Servidores Separados](#caso-3-backend-y-frontend-en-servidores-separados)
- [Caso 4: Frontend en Vercel + Backend en Railway/Render](#caso-4-frontend-en-vercel--backend-en-railwayrender)
- [Caso 5: Ambos en Datacenter Corporativo](#caso-5-ambos-en-datacenter-corporativo)
- [Testing de Conexión](#testing-de-conexión)
- [Troubleshooting de Conexión](#troubleshooting-de-conexión)

---

## 🏗️ Arquitectura de Conexión

### Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         ↓
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                     │
│  • Servido por Nginx / Vercel / CDN                     │
│  • Variables: VITE_API_URL                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ API Requests
                         │ (axios con JWT)
                         ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                 │
│  • Puerto: 4000 (configurable)                          │
│  • CORS configurado                                     │
│  • JWT verification                                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Database queries
                         ↓
┌─────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL/MySQL)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Preparación del Backend

### Repositorio del Backend

**Asumo que el backend está en**: `https://github.com/Geraldsamurai3/Inspecciones-Back-Santa-Cruz`

### Estructura Esperada del Backend

```
backend/
├── src/
│   ├── app.js              ← Configuración Express
│   ├── server.js           ← Punto de entrada
│   ├── config/
│   │   └── database.js     ← Conexión DB
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── inspections.routes.js
│   │   ├── users.routes.js
│   │   └── ...
│   ├── controllers/
│   ├── models/
│   └── middleware/
│       └── auth.middleware.js
├── .env                    ← Variables de entorno
├── package.json
└── README.md
```

---

## 🌐 Configuración de CORS

### Backend - Archivo `src/app.js`

**⚠️ CRÍTICO**: El backend DEBE tener CORS configurado correctamente.

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

// ========================================
// CONFIGURACIÓN DE CORS
// ========================================

const allowedOrigins = [
  'http://localhost:5173',                          // Desarrollo local (Vite)
  'http://localhost:3000',                          // Desarrollo local (alternativo)
  'https://inspecciones.municipalidad.cr',          // Producción
  'https://www.inspecciones.municipalidad.cr',      // Producción con www
  'https://inspecciones-staging.vercel.app',        // Staging en Vercel
];

// Opción 1: CORS simple (menos restrictivo)
app.use(cors({
  origin: '*',  // Permite todos los orígenes (solo para desarrollo)
  credentials: true
}));

// Opción 2: CORS restrictivo (RECOMENDADO para producción)
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy: Origin not allowed';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/inspections', require('./routes/inspections.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
// ... más rutas

module.exports = app;
```

### Variables de Entorno del Backend

**Archivo `.env` del backend:**

```env
# ========================================
# BACKEND - Variables de Entorno
# ========================================

# Puerto
PORT=4000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inspecciones_db
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Frontend URLs (para CORS)
FRONTEND_URL=https://inspecciones.municipalidad.cr

# Cloudinary (para fotos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (si usas nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_app

# Entorno
NODE_ENV=production
```

---

## 📍 Escenarios de Despliegue

---

## 🖥️ Caso 1: Desarrollo Local

### Configuración

**Backend (puerto 4000):**
```bash
cd backend
npm install
```

**`.env` del backend:**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inspecciones_dev
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev_secret_change_in_production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (puerto 5173):**
```bash
cd frontend
npm install
```

**`.env` del frontend:**
```env
VITE_API_URL=http://localhost:4000/api
NODE_ENV=development
```

### Iniciar Servicios

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Backend corriendo en http://localhost:4000

# Terminal 2: Frontend
cd frontend
npm run dev
# Frontend corriendo en http://localhost:5173
```

### Verificar Conexión

```bash
# Test del backend
curl http://localhost:4000/api/health
# Debe responder: {"status":"ok"}

# Abrir frontend en navegador
http://localhost:5173
# Login debe funcionar
```

---

## 🌐 Caso 2: Backend y Frontend en Mismo VPS

### Arquitectura

```
VPS (Ubuntu) - IP: 123.45.67.89
├── Frontend (Nginx en puerto 80/443)
│   └── Dominio: inspecciones.municipalidad.cr
└── Backend (Node.js en puerto 4000)
    └── Acceso: http://localhost:4000
```

### Paso 1: Desplegar Backend

```bash
# Conectarse al VPS
ssh deployer@123.45.67.89

# Clonar backend
cd ~
git clone https://github.com/TU_USUARIO/Inspecciones-Back-Santa-Cruz.git backend
cd backend

# Instalar dependencias
npm ci --only=production

# Configurar .env
nano .env
```

**`.env` del backend (VPS):**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inspecciones_prod
DB_USER=postgres
DB_PASSWORD=CAMBIAR_PASSWORD_SEGURO
JWT_SECRET=CAMBIAR_SECRET_MUY_SEGURO
FRONTEND_URL=https://inspecciones.municipalidad.cr
NODE_ENV=production
```

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar backend con PM2
pm2 start src/server.js --name backend-inspecciones

# Guardar configuración PM2
pm2 save

# Configurar PM2 para iniciar al arranque
pm2 startup
# Ejecutar el comando que PM2 muestre

# Verificar
pm2 list
pm2 logs backend-inspecciones
```

### Paso 2: Desplegar Frontend

```bash
# Clonar frontend
cd ~
git clone https://github.com/Geraldsamurai3/Inspecciones-Front-Santa-Cruz.git frontend
cd frontend

# Configurar .env
nano .env
```

**`.env` del frontend (VPS - mismo servidor):**
```env
# Backend en mismo servidor (localhost desde servidor, pero proxy desde Nginx)
VITE_API_URL=https://inspecciones.municipalidad.cr/api
NODE_ENV=production
```

```bash
# Instalar y compilar
npm ci --only=production
npm run build

# Verificar build
ls -la dist/
```

### Paso 3: Configurar Nginx (Proxy para Backend)

```bash
sudo nano /etc/nginx/sites-available/inspecciones
```

**Configuración Nginx (con proxy al backend):**

```nginx
# Backend upstream
upstream backend_api {
    server localhost:4000;
    keepalive 64;
}

server {
    listen 80;
    server_name inspecciones.municipalidad.cr www.inspecciones.municipalidad.cr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name inspecciones.municipalidad.cr www.inspecciones.municipalidad.cr;
    
    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/inspecciones.municipalidad.cr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inspecciones.municipalidad.cr/privkey.pem;
    
    # Frontend (archivos estáticos)
    root /home/deployer/frontend/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/inspecciones_access.log;
    error_log /var/log/nginx/inspecciones_error.log;
    
    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API (proxy)
    location /api/ {
        proxy_pass http://backend_api/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/inspecciones /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Obtener certificado SSL
sudo certbot --nginx -d inspecciones.municipalidad.cr -d www.inspecciones.municipalidad.cr

# Recargar Nginx
sudo systemctl reload nginx
```

### Verificar

```bash
# Backend
curl http://localhost:4000/api/health

# Frontend + Backend (desde internet)
curl https://inspecciones.municipalidad.cr
curl https://inspecciones.municipalidad.cr/api/health
```

---

## 🌍 Caso 3: Backend y Frontend en Servidores Separados

### Arquitectura

```
VPS 1 (Backend) - IP: 10.0.1.100
└── api.municipalidad.cr → Node.js puerto 4000

VPS 2 (Frontend) - IP: 10.0.1.200
└── inspecciones.municipalidad.cr → Nginx
```

### Paso 1: Desplegar Backend (VPS 1)

```bash
# Conectarse a VPS Backend
ssh deployer@10.0.1.100

# Clonar y configurar backend
git clone https://github.com/TU_USUARIO/Inspecciones-Back-Santa-Cruz.git backend
cd backend
npm ci --only=production

# Configurar .env
nano .env
```

**`.env` del backend (VPS separado):**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inspecciones_prod
DB_USER=postgres
DB_PASSWORD=PASSWORD_SEGURO
JWT_SECRET=SECRET_MUY_SEGURO
FRONTEND_URL=https://inspecciones.municipalidad.cr
NODE_ENV=production
```

```bash
# Iniciar con PM2
pm2 start src/server.js --name backend-inspecciones
pm2 save
pm2 startup
```

**Nginx para Backend (exponer API):**

```bash
sudo nano /etc/nginx/sites-available/api
```

```nginx
server {
    listen 80;
    server_name api.municipalidad.cr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.municipalidad.cr;
    
    ssl_certificate /etc/letsencrypt/live/api.municipalidad.cr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.municipalidad.cr/privkey.pem;
    
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.municipalidad.cr
sudo systemctl reload nginx
```

### Paso 2: Desplegar Frontend (VPS 2)

```bash
# Conectarse a VPS Frontend
ssh deployer@10.0.1.200

# Clonar frontend
git clone https://github.com/Geraldsamurai3/Inspecciones-Front-Santa-Cruz.git frontend
cd frontend

# Configurar .env (apuntando a backend remoto)
nano .env
```

**`.env` del frontend (VPS separado):**
```env
# Backend en servidor diferente
VITE_API_URL=https://api.municipalidad.cr/api
NODE_ENV=production
```

```bash
npm ci --only=production
npm run build
```

**Nginx para Frontend:**

```nginx
server {
    listen 443 ssl http2;
    server_name inspecciones.municipalidad.cr;
    
    ssl_certificate /etc/letsencrypt/live/inspecciones.municipalidad.cr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inspecciones.municipalidad.cr/privkey.pem;
    
    root /home/deployer/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### DNS Configuración

```
# Registros DNS necesarios:
inspecciones.municipalidad.cr    A    10.0.1.200  (Frontend)
api.municipalidad.cr              A    10.0.1.100  (Backend)
```

---

## ☁️ Caso 4: Frontend en Vercel + Backend en Railway/Render

### Paso 1: Desplegar Backend en Railway

**Railway Dashboard:**

1. Ir a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Seleccionar repositorio del backend
4. Configurar variables de entorno:

```env
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db  # Railway provee esto
JWT_SECRET=tu_secret_seguro
FRONTEND_URL=https://inspecciones-municipales.vercel.app
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```

5. Deploy automático
6. Railway genera URL: `https://tu-backend.up.railway.app`

**Verificar:**
```bash
curl https://tu-backend.up.railway.app/api/health
```

### Paso 2: Desplegar Frontend en Vercel

**Vercel Dashboard:**

1. Ir a [vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. Seleccionar repositorio del frontend
4. Framework Preset: Vite
5. Configurar variables de entorno:

```
VITE_API_URL=https://tu-backend.up.railway.app/api
NODE_ENV=production
```

6. Deploy

**Dominio personalizado en Vercel:**
- Settings → Domains → Add Domain
- Agregar: `inspecciones.municipalidad.cr`
- Configurar DNS (Vercel te da los registros)

### CORS en Backend (Railway)

Actualizar `allowedOrigins` en backend:

```javascript
const allowedOrigins = [
  'https://inspecciones-municipales.vercel.app',       // Vercel subdomain
  'https://inspecciones.municipalidad.cr',             // Dominio custom
  'https://www.inspecciones.municipalidad.cr',
  'http://localhost:5173',                             // Desarrollo
];
```

**Redeploy backend en Railway** después de cambio.

---

## 🏢 Caso 5: Ambos en Datacenter Corporativo

### Arquitectura

```
Red Corporativa (10.0.0.0/16)
├── Load Balancer (10.0.1.5)
├── Frontend Servers
│   ├── Web-01 (10.0.1.10)
│   └── Web-02 (10.0.1.11)
├── Backend Servers
│   ├── API-01 (10.0.2.10)
│   └── API-02 (10.0.2.11)
└── Database Cluster
    ├── DB-Primary (10.0.3.10)
    └── DB-Replica (10.0.3.11)
```

### Paso 1: Desplegar Backend (Servidores API)

**En API-01 (10.0.2.10):**

```bash
ssh appuser@10.0.2.10
cd /opt/apps
git clone https://gitlab.municipalidad.cr/sistemas/inspecciones-backend.git backend
cd backend
npm ci --only=production

# .env
nano .env
```

**`.env` backend (datacenter):**
```env
PORT=4000
DB_HOST=10.0.3.10
DB_PORT=5432
DB_NAME=inspecciones_prod
DB_USER=app_user
DB_PASSWORD=PASSWORD_DB_SEGURO
JWT_SECRET=SECRET_CORPORATIVO_SEGURO
FRONTEND_URL=https://inspecciones.municipalidad.cr
NODE_ENV=production
```

```bash
pm2 start src/server.js --name backend-inspecciones
pm2 save
```

**Repetir en API-02 (10.0.2.11)** con misma configuración.

### Paso 2: Load Balancer para Backend

**HAProxy en servidor LB (10.0.1.5):**

```haproxy
backend api_servers
    balance roundrobin
    option httpchk GET /api/health
    http-check expect status 200
    
    server api01 10.0.2.10:4000 check
    server api02 10.0.2.11:4000 check
```

### Paso 3: Desplegar Frontend

**En Web-01 (10.0.1.10):**

```bash
cd /opt/apps
git clone https://gitlab.municipalidad.cr/sistemas/inspecciones-frontend.git frontend
cd frontend

# .env (apuntando a backend interno)
nano .env
```

**`.env` frontend (datacenter):**
```env
# Backend interno (via load balancer o directo)
VITE_API_URL=https://api-inspecciones.municipalidad.local/api
NODE_ENV=production
```

```bash
npm ci --only=production
npm run build
```

**Nginx en Web-01:**

```nginx
upstream backend_cluster {
    server 10.0.2.10:4000;
    server 10.0.2.11:4000;
}

server {
    listen 443 ssl http2;
    server_name inspecciones.municipalidad.cr;
    
    root /opt/apps/frontend/dist;
    
    location / {
        try_files $uri /index.html;
    }
    
    # Proxy interno a backend
    location /api/ {
        proxy_pass http://backend_cluster/api/;
        # ... headers proxy
    }
}
```

**Sincronizar a Web-02:**

```bash
rsync -avz /opt/apps/frontend/dist/ appuser@10.0.1.11:/opt/apps/frontend/dist/
```

---

## 🧪 Testing de Conexión

### Test Manual

```bash
# 1. Verificar backend
curl -X GET https://api.municipalidad.cr/api/health
# Esperado: {"status":"ok"}

# 2. Test de login
curl -X POST https://api.municipalidad.cr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
# Esperado: {"token":"jwt_token_aqui","user":{...}}

# 3. Verificar CORS
curl -X OPTIONS https://api.municipalidad.cr/api/health \
  -H "Origin: https://inspecciones.municipalidad.cr" \
  -H "Access-Control-Request-Method: GET" \
  -v
# Debe incluir header: Access-Control-Allow-Origin
```

### Test desde Frontend

Abrir DevTools en navegador:

```javascript
// En consola del navegador
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test manual de fetch
fetch(import.meta.env.VITE_API_URL + '/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend Error:', e));
```

---

## 🚨 Troubleshooting de Conexión

### Error: "Network Error" o "Failed to fetch"

**Diagnóstico:**
```bash
# Desde servidor frontend, verificar alcance al backend
curl http://localhost:4000/api/health  # Si están en mismo servidor
curl https://api.municipalidad.cr/api/health  # Si están separados

# Ver logs del backend
pm2 logs backend-inspecciones

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

**Causas comunes:**
1. Backend no está corriendo: `pm2 restart backend-inspecciones`
2. Firewall bloqueando puerto 4000: `sudo ufw allow 4000/tcp`
3. `VITE_API_URL` incorrecta: Verificar `.env` y **rebuild**

---

### Error: CORS "Access-Control-Allow-Origin"

**Síntoma**: Error en consola del navegador

```
Access to fetch at 'https://api.com/api/login' from origin 'https://frontend.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solución en Backend:**

```javascript
// Verificar que el origen del frontend esté en allowedOrigins
const allowedOrigins = [
  'https://inspecciones.municipalidad.cr',  // ← Agregar tu dominio
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

**Redeploy backend** después del cambio.

---

### Error: 502 Bad Gateway (Nginx)

**Causa**: Nginx no puede conectarse al backend.

**Diagnóstico:**
```bash
# Verificar que backend esté corriendo
pm2 list
pm2 logs backend-inspecciones

# Verificar puerto
sudo netstat -tlnp | grep 4000

# Test directo
curl http://localhost:4000/api/health
```

**Solución:**
```bash
# Reiniciar backend
pm2 restart backend-inspecciones

# Verificar configuración de Nginx (upstream)
sudo nginx -t
sudo systemctl reload nginx
```

---

### Error: JWT no se envía en requests

**Causa**: Axios no está configurado para enviar token.

**Verificar en Frontend** (`src/config/axiosConfig.js`):

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

---

## ✅ Checklist de Conexión Frontend-Backend

### Backend
- [ ] Backend clonado y dependencias instaladas
- [ ] Base de datos configurada y conectada
- [ ] Variables de entorno configuradas (`.env`)
- [ ] `FRONTEND_URL` en `.env` tiene URL correcta del frontend
- [ ] CORS configurado con dominio del frontend
- [ ] Backend corriendo (PM2 o similar)
- [ ] Puerto 4000 accesible (firewall)
- [ ] Endpoint `/api/health` responde 200 OK
- [ ] SSL/HTTPS configurado (producción)

### Frontend
- [ ] Frontend clonado y dependencias instaladas
- [ ] `VITE_API_URL` en `.env` apunta al backend correcto
- [ ] `VITE_API_URL` termina en `/api`
- [ ] Rebuild ejecutado después de cambiar `.env`
- [ ] Nginx/servidor web configurado
- [ ] SSL/HTTPS configurado
- [ ] Axios configurado con interceptors (JWT)

### Testing
- [ ] `curl` al backend exitoso desde servidor frontend
- [ ] Login funciona desde interfaz web
- [ ] DevTools no muestra errores CORS
- [ ] Requests en Network tab muestran token JWT
- [ ] Todas las funcionalidades operativas

---

**Última actualización**: Noviembre 2025  
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
