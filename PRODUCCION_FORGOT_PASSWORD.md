# 📧 Guía de Configuración: Recuperación de Contraseña en Producción

## 🔍 Resumen del Problema

El sistema de recuperación de contraseña requiere configuración adicional en producción para que los emails se envíen correctamente desde Railway.

---

## 🎯 Configuración del Frontend (Vercel)

### Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `Inspecciones-Front-Santa-Cruz`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

```bash
# API Backend (Railway)
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app

# Cloudinary URL (si aplica)
VITE_ILLUSTRATION_URL=https://res.cloudinary.com/da84etlav/image/upload/v1753804998/ChatGPT_Image_28_jul_2025_10_16_35_a.m._vhpfcs.png
```

5. **Environment**: Selecciona `Production` y `Preview`
6. Click en **Save**
7. **Redeploy** tu aplicación para que tome los nuevos valores

### Comandos para Desplegar

```bash
# Hacer commit de los cambios
git add .
git commit -m "chore: configuración de producción para forgot-password"
git push origin Ge

# Vercel detectará el push y redesplegará automáticamente
```

---

## ⚙️ Configuración del Backend (Railway)

### 1. Variables de Entorno SMTP en Railway

Ve a tu proyecto en Railway y configura estas variables:

#### Opción A: Gmail (Recomendado para desarrollo)

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=andreylanza3@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # ⚠️ Contraseña de aplicación, NO tu contraseña normal

# Email Configuration
EMAIL_FROM="Inspecciones Santa Cruz <andreylanza3@gmail.com>"

# Frontend URL (SIN / al final)
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

**Cómo obtener la Contraseña de Aplicación de Gmail:**

1. Ve a https://myaccount.google.com/security
2. Activa **Verificación en 2 pasos** (si no está activada)
3. Ve a **Contraseñas de aplicaciones**: https://myaccount.google.com/apppasswords
4. Genera una nueva contraseña con el nombre "Inspecciones Railway"
5. Copia la contraseña de 16 caracteres (formato: `xxxx xxxx xxxx xxxx`)
6. Úsala en `SMTP_PASS`

#### Opción B: SendGrid (Recomendado para producción)

```bash
# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Tu API Key de SendGrid

# Email Configuration
EMAIL_FROM="Inspecciones Santa Cruz <noreply@inspecciones-santacruz.com>"

# Frontend URL
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

**Cómo obtener API Key de SendGrid:**

1. Crea cuenta en https://sendgrid.com/ (100 emails/día gratis)
2. Verifica tu email
3. Ve a **Settings** → **API Keys**
4. Crea una nueva API Key con permisos "Mail Send"
5. Copia la API Key (comienza con `SG.`)
6. Úsala en `SMTP_PASS`

### 2. Variables de Entorno Completas para Railway

```bash
# === Database (Railway MariaDB) ===
DB_HOST=monorail.proxy.rlwy.net
DB_PORT=30738
DB_USERNAME=root
DB_PASSWORD=tu_password_de_railway
DB_DATABASE=railway

# === JWT ===
JWT_SECRET=tu_secret_super_secreto_y_largo_minimo_32_caracteres
JWT_EXPIRATION=1d

# === SMTP (Gmail) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=andreylanza3@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# === Email ===
EMAIL_FROM="Inspecciones Santa Cruz <andreylanza3@gmail.com>"

# === Frontend ===
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app

# === Cloudinary ===
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# === Port (Railway lo asigna automáticamente) ===
PORT=3000

# === Node Environment ===
NODE_ENV=production
```

### 3. Verificar Configuración

Después de agregar las variables en Railway:

1. **Railway reiniciará automáticamente** el servicio (espera 1-2 minutos)
2. Verifica los logs en Railway para asegurarte de que no hay errores SMTP
3. Prueba el endpoint manualmente:

```bash
curl -X POST https://inspecciones-muni-santa-cruz-production.up.railway.app/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "andreylanza3@gmail.com"}'
```

Respuesta esperada:
```json
{
  "message": "Email de restablecimiento enviado"
}
```

---

## ✅ Checklist de Verificación

### Frontend (Vercel)
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Archivo `.env.production` creado y subido a Git
- [ ] Cambios del frontend (usersService.js y axiosConfig.js) deployados
- [ ] Redeploy realizado en Vercel

### Backend (Railway)
- [ ] Variables SMTP configuradas (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- [ ] `SMTP_PASS` es una contraseña de aplicación (NO contraseña normal)
- [ ] `FRONTEND_URL` configurado sin "/" al final
- [ ] `EMAIL_FROM` con formato correcto: "Nombre <email@dominio.com>"
- [ ] Railway reiniciado después de agregar variables
- [ ] Logs de Railway sin errores SMTP

### Testing
- [ ] Endpoint `/users/forgot-password` responde con 200
- [ ] Email llega correctamente al buzón
- [ ] Link en el email funciona y redirige a la página de reset
- [ ] Reseteo de contraseña funciona correctamente

---

## 🐛 Troubleshooting

### Error: "Invalid login: 535 5.7.8 Username and Password not accepted"

**Solución:**
- Verifica que `SMTP_PASS` sea una **Contraseña de Aplicación** de Google
- NO uses tu contraseña normal de Gmail
- Asegúrate de que la verificación en 2 pasos esté activada

### Error: "Connection timeout"

**Solución:**
- Railway podría estar bloqueando el puerto 587
- Prueba con `SMTP_PORT=465` y cambia a SSL
- O usa SendGrid en lugar de Gmail

### Error: "FRONTEND_URL is not defined"

**Solución:**
- Verifica que la variable `FRONTEND_URL` esté en Railway
- Asegúrate de que NO tenga "/" al final
- Reinicia el servicio en Railway

### Email no llega

**Solución:**
1. Verifica la carpeta de SPAM
2. Revisa los logs de Railway para errores
3. Prueba con un email diferente
4. Verifica que el usuario exista en la base de datos
5. Asegúrate de que el usuario no esté bloqueado (`isBlocked = false`)

---

## 📞 Soporte

Si el problema persiste después de seguir esta guía:

1. **Revisa los logs de Railway**:
   - Ve a tu proyecto en Railway
   - Click en "Deployments"
   - Click en el último deployment
   - Revisa los logs en tiempo real

2. **Verifica las variables de entorno**:
   - Railway Dashboard → Tu Proyecto → Variables
   - Asegúrate de que todas las variables SMTP estén configuradas

3. **Prueba con Ethereal Email** (solo para testing):
   ```bash
   # Crea una cuenta en https://ethereal.email/
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=usuario@ethereal.email
   SMTP_PASS=password_ethereal
   ```
   Los emails se verán en https://ethereal.email/messages

---

## 📚 Referencias

- [Contraseñas de Aplicación de Google](https://myaccount.google.com/apppasswords)
- [SendGrid Quick Start](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/deploy/variables)

---

**Última actualización:** 4 de Noviembre, 2025
