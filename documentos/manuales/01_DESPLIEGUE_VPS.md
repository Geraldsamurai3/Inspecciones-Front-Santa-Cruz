# 🖥️ Manual de Despliegue en VPS (Virtual Private Server)

## 📋 Índice
- [Requisitos Previos](#requisitos-previos)
- [Preparación del Servidor](#preparación-del-servidor)
- [Instalación de Dependencias](#instalación-de-dependencias)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Configuración de Nginx](#configuración-de-nginx)
- [Certificado SSL con Let's Encrypt](#certificado-ssl-con-lets-encrypt)
- [PM2 para Gestión de Procesos](#pm2-para-gestión-de-procesos)
- [Configuración de Firewall](#configuración-de-firewall)
- [Mantenimiento y Actualizaciones](#mantenimiento-y-actualizaciones)

---

## 🎯 Requisitos Previos

### Servidor VPS
- **SO**: Ubuntu 22.04 LTS (recomendado) o Ubuntu 20.04
- **RAM**: Mínimo 2GB (recomendado 4GB)
- **CPU**: 2 vCPUs mínimo
- **Almacenamiento**: 20GB mínimo
- **Proveedor**: DigitalOcean, Linode, AWS EC2, Vultr, etc.

### Dominio
- Dominio registrado (ej: `inspecciones.municipalidad.cr`)
- DNS apuntando a la IP del VPS:
  - Registro A: `@` → IP del VPS
  - Registro A: `www` → IP del VPS

### Acceso
- SSH habilitado
- Usuario con privilegios sudo
- IP pública del servidor

---

## 🔧 Preparación del Servidor

### 1. Conectarse al Servidor

```bash
# Conexión SSH
ssh root@TU_IP_DEL_VPS

# O con usuario específico
ssh usuario@TU_IP_DEL_VPS
```

### 2. Actualizar Sistema

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar paquetes instalados
sudo apt upgrade -y

# Instalar utilidades básicas
sudo apt install -y curl wget git build-essential
```

### 3. Crear Usuario para la Aplicación

```bash
# Crear usuario (opcional si ya tienes uno)
sudo adduser deployer

# Agregar a grupo sudo
sudo usermod -aG sudo deployer

# Cambiar a nuevo usuario
su - deployer
```

---

## 📦 Instalación de Dependencias

### 1. Instalar Node.js (v20.x o superior)

```bash
# Descargar script de instalación de NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 2. Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

### 3. Instalar PM2 (Gestor de Procesos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar al arranque
pm2 startup systemd
# Ejecutar el comando que PM2 te indique

# Verificar instalación
pm2 --version
```

---

## 🚀 Configuración del Proyecto

### 1. Clonar Repositorio

```bash
# Navegar a directorio home
cd ~

# Clonar repositorio
git clone https://github.com/Geraldsamurai3/Inspecciones-Front-Santa-Cruz.git

# Entrar al directorio
cd Inspecciones-Front-Santa-Cruz
```

### 2. Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

**Contenido del archivo `.env`:**

```env
# ========================================
# CONFIGURACIÓN DE PRODUCCIÓN - VPS
# ========================================

# URL del Backend (API)
# ⚠️ CAMBIAR por la URL de tu API en producción
VITE_API_URL=https://api.municipalidad.cr/api

# Entorno
NODE_ENV=production

# Puerto (si usas servidor de desarrollo, generalmente no necesario)
# PORT=3000

# ========================================
# CONFIGURACIÓN OPCIONAL
# ========================================

# Analytics (si usas Google Analytics)
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry (si usas monitoreo de errores)
# VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Puntos críticos a cambiar:**

1. **`VITE_API_URL`**: URL completa de tu backend en producción
   - Si backend está en mismo servidor: `http://localhost:4000/api`
   - Si backend está en otro servidor: `https://api.tudominio.com/api`
   - **IMPORTANTE**: Debe terminar en `/api`

2. Verificar que el backend esté configurado con CORS para aceptar tu dominio:
   ```javascript
   // En el backend (Node.js/Express)
   const cors = require('cors');
   app.use(cors({
     origin: ['https://inspecciones.municipalidad.cr', 'https://www.inspecciones.municipalidad.cr'],
     credentials: true
   }));
   ```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Verificar que no haya errores
```

### 4. Compilar para Producción

```bash
# Compilar aplicación
npm run build

# Esto crea la carpeta 'dist' con los archivos optimizados
```

**Verificar build:**
```bash
ls -la dist/
# Deberías ver: index.html, assets/, etc.
```

---

## 🌐 Configuración de Nginx

### 1. Crear Configuración del Sitio

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/inspecciones
```

**Contenido del archivo:**

```nginx
# Configuración para Sistema de Inspecciones Municipales
server {
    listen 80;
    listen [::]:80;
    
    server_name inspecciones.municipalidad.cr www.inspecciones.municipalidad.cr;
    
    # Directorio raíz del proyecto
    root /home/deployer/Inspecciones-Front-Santa-Cruz/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/inspecciones_access.log;
    error_log /var/log/nginx/inspecciones_error.log;
    
    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    
    # Configuración de archivos estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Manejo de React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Seguridad adicional
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Ocultar versión de Nginx
    server_tokens off;
}
```

**⚠️ Cambiar:**
- `server_name`: Tu dominio real
- `root`: Ruta completa a tu carpeta `dist`

### 2. Habilitar Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/inspecciones /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Si todo está OK, recargar Nginx
sudo systemctl reload nginx
```

### 3. Verificar Sitio

```bash
# Acceder desde navegador
http://inspecciones.municipalidad.cr
# O
http://TU_IP_DEL_VPS
```

---

## 🔒 Certificado SSL con Let's Encrypt

### 1. Instalar Certbot

```bash
# Instalar Certbot y plugin de Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado

```bash
# Ejecutar Certbot (modo interactivo)
sudo certbot --nginx -d inspecciones.municipalidad.cr -d www.inspecciones.municipalidad.cr

# Seguir instrucciones:
# 1. Ingresar email para notificaciones
# 2. Aceptar términos de servicio
# 3. Elegir opción 2: Redirect (redirigir HTTP a HTTPS)
```

### 3. Renovación Automática

```bash
# Certbot configura renovación automática
# Verificar timer de renovación
sudo systemctl status certbot.timer

# Probar renovación (dry-run)
sudo certbot renew --dry-run
```

### 4. Verificar HTTPS

```bash
# Acceder desde navegador
https://inspecciones.municipalidad.cr
# Debe mostrar candado verde
```

**Configuración final de Nginx (después de SSL):**

Certbot habrá modificado automáticamente tu archivo de configuración. Verificar:

```bash
sudo nano /etc/nginx/sites-available/inspecciones
```

Debería verse así:

```nginx
server {
    server_name inspecciones.municipalidad.cr www.inspecciones.municipalidad.cr;
    
    root /home/deployer/Inspecciones-Front-Santa-Cruz/dist;
    index index.html;
    
    # ... resto de configuración ...
    
    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/inspecciones.municipalidad.cr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inspecciones.municipalidad.cr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.inspecciones.municipalidad.cr) {
        return 301 https://$host$request_uri;
    }
    
    if ($host = inspecciones.municipalidad.cr) {
        return 301 https://$host$request_uri;
    }
    
    listen 80;
    listen [::]:80;
    server_name inspecciones.municipalidad.cr www.inspecciones.municipalidad.cr;
    return 404;
}
```

---

## 🔧 PM2 para Gestión de Procesos

**Nota**: Si solo sirves archivos estáticos con Nginx, PM2 no es estrictamente necesario. Sin embargo, si decides usar un servidor Node.js para servir la aplicación:

### 1. Crear Script de Servidor (Opcional)

```bash
nano server.js
```

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar rutas de SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### 2. Iniciar con PM2

```bash
# Iniciar aplicación
pm2 start server.js --name inspecciones-app

# Ver aplicaciones
pm2 list

# Ver logs
pm2 logs inspecciones-app

# Guardar configuración
pm2 save
```

### 3. Configurar Nginx para PM2

Si usas PM2, modifica Nginx para hacer proxy:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 🛡️ Configuración de Firewall

### 1. Configurar UFW (Uncomplicated Firewall)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (IMPORTANTE: hacer ANTES de habilitar)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver reglas
sudo ufw status verbose
```

**Output esperado:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

## 🔄 Mantenimiento y Actualizaciones

### Actualizar Aplicación

```bash
# 1. Conectarse al servidor
ssh deployer@TU_IP_DEL_VPS

# 2. Navegar al proyecto
cd ~/Inspecciones-Front-Santa-Cruz

# 3. Hacer backup (opcional)
cp -r dist dist.backup.$(date +%Y%m%d)

# 4. Pull de cambios
git pull origin main  # o la rama correspondiente

# 5. Actualizar dependencias (si cambiaron)
npm install

# 6. Reconstruir
npm run build

# 7. Si usas PM2, reiniciar
pm2 restart inspecciones-app

# 8. Recargar Nginx (si cambiaste configuración)
sudo systemctl reload nginx
```

### Ver Logs

```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/inspecciones_access.log
sudo tail -f /var/log/nginx/inspecciones_error.log

# Logs de PM2 (si aplica)
pm2 logs inspecciones-app

# Logs del sistema
sudo journalctl -u nginx -f
```

### Monitoreo

```bash
# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver uso de memoria
free -h

# Ver procesos de Node
ps aux | grep node
```

### Backup Automático

Crear script de backup:

```bash
nano ~/backup.sh
```

```bash
#!/bin/bash

# Variables
APP_DIR="$HOME/Inspecciones-Front-Santa-Cruz"
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Hacer backup
tar -czf $BACKUP_DIR/inspecciones_$DATE.tar.gz -C $APP_DIR dist

# Mantener solo últimos 7 backups
cd $BACKUP_DIR
ls -t inspecciones_*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completado: $BACKUP_DIR/inspecciones_$DATE.tar.gz"
```

```bash
# Dar permisos
chmod +x ~/backup.sh

# Agregar a cron (diario a las 2 AM)
crontab -e
# Agregar:
0 2 * * * /home/deployer/backup.sh
```

---

## ✅ Checklist de Despliegue

- [ ] Servidor VPS configurado (Ubuntu 22.04)
- [ ] Dominio apuntando a IP del VPS
- [ ] Node.js 20+ instalado
- [ ] Nginx instalado y configurado
- [ ] Proyecto clonado en el servidor
- [ ] Variables de entorno configuradas (`.env`)
- [ ] `VITE_API_URL` apuntando al backend correcto
- [ ] Backend configurado con CORS para tu dominio
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run build` ejecutado exitosamente
- [ ] Nginx configurado con archivo en sites-available
- [ ] Enlace simbólico creado en sites-enabled
- [ ] `nginx -t` sin errores
- [ ] Certificado SSL instalado con Let's Encrypt
- [ ] Sitio accesible vía HTTPS
- [ ] Firewall configurado (UFW)
- [ ] Redirección HTTP → HTTPS funcionando
- [ ] React Router funcionando (no hay 404 en rutas)
- [ ] PM2 configurado (si aplica)
- [ ] Backup automatizado configurado

---

## 🚨 Troubleshooting

### Error: "Failed to fetch" o "Network Error"

**Causa**: `VITE_API_URL` incorrecta o backend no accesible

**Solución**:
1. Verificar `.env`: `VITE_API_URL=https://api.tudominio.com/api`
2. Reconstruir: `npm run build`
3. Verificar CORS en backend
4. Verificar que backend esté corriendo

### Error: 404 en rutas de React Router

**Causa**: Nginx no está redirigiendo a `index.html`

**Solución**:
Verificar en `/etc/nginx/sites-available/inspecciones`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Error: "Permission denied"

**Causa**: Permisos incorrectos en carpeta `dist`

**Solución**:
```bash
sudo chown -R deployer:deployer ~/Inspecciones-Front-Santa-Cruz
chmod -R 755 ~/Inspecciones-Front-Santa-Cruz/dist
```

### Certificado SSL no funciona

**Causa**: DNS no propagado o puertos 80/443 bloqueados

**Solución**:
```bash
# Verificar DNS
nslookup inspecciones.municipalidad.cr

# Verificar puertos
sudo netstat -tlnp | grep ':80\|:443'

# Verificar firewall
sudo ufw status
```

---

**Última actualización**: Noviembre 2025  
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
