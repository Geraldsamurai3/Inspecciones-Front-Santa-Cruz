# 🔄 Manual de CI/CD con GitHub Actions

## 📋 Índice
- [Introducción a CI/CD](#introducción-a-cicd)
- [Configuración de GitHub Actions](#configuración-de-github-actions)
- [Pipeline para Vercel](#pipeline-para-vercel)
- [Pipeline para VPS con SSH](#pipeline-para-vps-con-ssh)
- [Pipeline para AWS S3 + CloudFront](#pipeline-para-aws-s3--cloudfront)
- [Pipeline para DigitalOcean App Platform](#pipeline-para-digitalocean-app-platform)
- [Testing Automático](#testing-automático)
- [Gestión de Secrets](#gestión-de-secrets)
- [Estrategias de Branching](#estrategias-de-branching)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción a CI/CD

### ¿Qué es CI/CD?

**CI (Continuous Integration)**: Integración continua de código
- Tests automáticos en cada commit
- Validación de builds
- Detección temprana de errores

**CD (Continuous Deployment)**: Despliegue continuo
- Despliegue automático a producción
- Sin intervención manual
- Rollback rápido si hay problemas

### Beneficios para este Proyecto

✅ **Despliegue automático** cada vez que haces `git push`  
✅ **Tests automáticos** (Playwright + Vitest) antes de desplegar  
✅ **Prevención de errores** en producción  
✅ **Historial de despliegues** con rollback fácil  
✅ **Notificaciones** de éxito/fallo  

---

## ⚙️ Configuración de GitHub Actions

### Estructura de Archivos

GitHub Actions usa archivos YAML en `.github/workflows/`:

```
.github/
└── workflows/
    ├── deploy-production.yml      # Despliegue a producción
    ├── deploy-staging.yml         # Despliegue a staging
    ├── run-tests.yml              # Tests en cada PR
    └── lint-code.yml              # Linting en cada push
```

### Crear Directorio de Workflows

```bash
# En tu repositorio local
mkdir -p .github/workflows
cd .github/workflows
```

---

## 🚀 Pipeline para Vercel

### Archivo: `.github/workflows/deploy-vercel.yml`

```yaml
name: Deploy to Vercel Production

on:
  push:
    branches:
      - main  # Se ejecuta cuando haces push a main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      # 1. Checkout del código
      - name: Checkout code
        uses: actions/checkout@v4
      
      # 2. Setup de Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # 3. Instalar dependencias
      - name: Install dependencies
        run: npm ci
      
      # 4. Ejecutar tests (opcional)
      - name: Run tests
        run: npm run test
        continue-on-error: false  # Falla el pipeline si fallan los tests
      
      # 5. Build del proyecto
      - name: Build project
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      # 6. Deploy a Vercel
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
      
      # 7. Notificación de éxito
      - name: Success notification
        if: success()
        run: |
          echo "✅ Deployment exitoso a Vercel"
          echo "URL: https://tu-proyecto.vercel.app"
```

### Configuración de Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions → New repository secret

**Secrets necesarios para Vercel:**

```bash
# VERCEL_TOKEN
# Obtener en: https://vercel.com/account/tokens
# Crear nuevo token y copiar

# VERCEL_ORG_ID y VERCEL_PROJECT_ID
# Ejecutar en local:
vercel link
# Leer de .vercel/project.json
```

**Archivo `.vercel/project.json`:**
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_xxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
VITE_API_URL=https://api.tudominio.com/api
```

---

## 🖥️ Pipeline para VPS con SSH

### Archivo: `.github/workflows/deploy-vps.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      # Deploy vía SSH
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            # Navegar al directorio del proyecto
            cd ~/Inspecciones-Front-Santa-Cruz
            
            # Pull de cambios
            git pull origin main
            
            # Instalar dependencias
            npm ci
            
            # Build
            npm run build
            
            # Reiniciar Nginx (si es necesario)
            sudo systemctl reload nginx
            
            # O reiniciar PM2 (si usas PM2)
            # pm2 restart inspecciones-app
            
            echo "✅ Deployment completado"
```

### Configuración de Secrets para VPS

```bash
# En GitHub Secrets:

VPS_HOST=123.45.67.89  # IP de tu VPS
VPS_USERNAME=deployer   # Usuario SSH
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...tu clave privada SSH...
-----END OPENSSH PRIVATE KEY-----
```

### Generar SSH Key para GitHub Actions

```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copiar clave pública al VPS
ssh-copy-id -i ~/.ssh/github_actions.pub deployer@TU_VPS_IP

# Copiar clave privada (agregar a GitHub Secrets)
cat ~/.ssh/github_actions
```

---

## ☁️ Pipeline para AWS S3 + CloudFront

### Archivo: `.github/workflows/deploy-aws.yml`

```yaml
name: Deploy to AWS S3

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      # Configurar credenciales AWS
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      # Subir a S3
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} --delete
      
      # Invalidar cache de CloudFront
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Configuración de Secrets para AWS

```bash
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET_NAME=inspecciones-municipalidad
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
VITE_API_URL=https://api.tudominio.com/api
```

### Configuración de S3 Bucket

```bash
# Crear bucket
aws s3 mb s3://inspecciones-municipalidad

# Habilitar hosting estático
aws s3 website s3://inspecciones-municipalidad \
  --index-document index.html \
  --error-document index.html

# Configurar política pública
aws s3api put-bucket-policy \
  --bucket inspecciones-municipalidad \
  --policy file://bucket-policy.json
```

**Archivo `bucket-policy.json`:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::inspecciones-municipalidad/*"
    }
  ]
}
```

---

## 🌊 Pipeline para DigitalOcean App Platform

### Archivo: `.github/workflows/deploy-digitalocean.yml`

```yaml
name: Deploy to DigitalOcean App Platform

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      
      - name: Trigger deployment
        run: |
          doctl apps create-deployment ${{ secrets.DIGITALOCEAN_APP_ID }} --wait
```

### Configuración con `app.yaml`

Crear archivo `app.yaml` en la raíz del proyecto:

```yaml
name: inspecciones-municipales
region: nyc

static_sites:
  - name: frontend
    github:
      repo: Geraldsamurai3/Inspecciones-Front-Santa-Cruz
      branch: main
      deploy_on_push: true
    
    build_command: npm run build
    output_dir: dist
    
    envs:
      - key: VITE_API_URL
        value: ${VITE_API_URL}
    
    routes:
      - path: /
    
    catchall_document: index.html
```

---

## 🧪 Testing Automático

### Archivo: `.github/workflows/run-tests.yml`

```yaml
name: Run Tests

on:
  pull_request:
    branches:
      - main
      - develop
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      # Tests unitarios
      - name: Run unit tests
        run: npm run test
      
      # Tests E2E con Playwright
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      # Subir reporte si fallan tests
      - name: Upload test report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## 🔐 Gestión de Secrets

### Variables de Entorno por Ambiente

**Staging:**
```bash
VITE_API_URL=https://api-staging.tudominio.com/api
```

**Production:**
```bash
VITE_API_URL=https://api.tudominio.com/api
```

### Crear Secrets en GitHub

```bash
# Via GitHub CLI (gh)
gh secret set VITE_API_URL -b "https://api.tudominio.com/api"
gh secret set VERCEL_TOKEN -b "your_token_here"

# O manualmente en GitHub:
# Settings → Secrets and variables → Actions → New repository secret
```

### Secrets por Ambiente

GitHub permite secrets por ambiente (Production, Staging):

1. Settings → Environments → New environment
2. Crear "production" y "staging"
3. Agregar secrets específicos a cada uno

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Usa secrets de "production"
    steps:
      - name: Deploy
        env:
          API_URL: ${{ secrets.VITE_API_URL }}  # De ambiente "production"
```

---

## 🌿 Estrategias de Branching

### Git Flow Recomendado

```
main (production)
  ↑
  merge cuando está listo
  ↑
develop (staging)
  ↑
  merge features
  ↑
feature/nueva-funcionalidad
feature/fix-bug
```

### Workflows por Branch

```yaml
on:
  push:
    branches:
      - main        # Deploy a producción
      - develop     # Deploy a staging
  pull_request:
    branches:
      - main
      - develop     # Run tests en PRs
```

### Ejemplo Completo Multi-Ambiente

```yaml
name: CI/CD Multi-Environment

on:
  push:
    branches:
      - main
      - develop

jobs:
  # Job 1: Tests (siempre)
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
  
  # Job 2: Deploy a Staging (solo branch develop)
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - name: Deploy to Vercel Staging
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  
  # Job 3: Deploy a Production (solo branch main)
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - name: Deploy to Vercel Production
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🔔 Notificaciones

### Slack Notifications

```yaml
- name: Notify Slack on success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "✅ Deployment exitoso a producción",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Exitoso*\n\nCommit: ${{ github.sha }}\nBranch: ${{ github.ref }}"
            }
          }
        ]
      }

- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "❌ Deployment falló",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Deployment Fallido*\n\nRevisar logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
          }
        ]
      }
```

---

## 🚨 Troubleshooting

### Error: "npm ci" falla

**Causa**: `package-lock.json` desactualizado

**Solución**:
```bash
# Local
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Error: Build falla por variables de entorno

**Causa**: `VITE_API_URL` no definida

**Solución**:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}  # Asegurar que esté aquí
```

### Error: SSH key no funciona

**Causa**: Formato incorrecto de la clave privada

**Solución**:
```bash
# La clave debe incluir:
-----BEGIN OPENSSH PRIVATE KEY-----
...contenido...
-----END OPENSSH PRIVATE KEY-----

# Con saltos de línea correctos
```

### Error: Tests fallan en CI pero pasan local

**Causa**: Diferencias de entorno

**Solución**:
```yaml
- name: Run tests with display
  run: xvfb-run npm run test:e2e  # Para Playwright
```

---

## ✅ Checklist de CI/CD

- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados en GitHub
- [ ] Tests automáticos implementados
- [ ] Branch strategy definida (main = prod, develop = staging)
- [ ] Variables de entorno por ambiente
- [ ] Notificaciones configuradas (Slack/email)
- [ ] Rollback strategy definida
- [ ] Logs de deployment accesibles
- [ ] Ambientes protegidos (require approvals)

---

**Última actualización**: Noviembre 2025  
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
