# Implementación de Endpoints de Reportes - Backend

Este documento contiene la implementación completa de los endpoints de reportes que el backend debe implementar.

## Endpoints Requeridos

### 1. Buscar Inspección Individual
**GET** `/reports/search?procedureNumber={number}`

```javascript
// routes/reports.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Inspection = require('../models/Inspection');

/**
 * Buscar inspección por número de trámite
 * GET /reports/search?procedureNumber=3333333
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { procedureNumber } = req.query;

    if (!procedureNumber) {
      return res.status(400).json({ 
        message: 'El número de trámite es requerido' 
      });
    }

    // Buscar la inspección por número de trámite
    const inspection = await Inspection.findOne({
      where: { procedureNumber },
      include: [
        { association: 'location' },
        { association: 'inspectors' },
        { association: 'individualRequest' },
        { association: 'legalEntityRequest' },
        { association: 'mayorOffice' },
        { association: 'construction' },
        { association: 'landUse' },
        { association: 'antiquity' },
        { association: 'pcCancellation' },
        { association: 'generalInspection' },
        { association: 'workReceipt' },
        { association: 'concession' }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ 
        message: `Inspección con número de trámite ${procedureNumber} no encontrada` 
      });
    }

    res.json(inspection);
  } catch (error) {
    console.error('Error buscando inspección:', error);
    res.status(500).json({ 
      message: 'Error al buscar la inspección',
      error: error.message 
    });
  }
});

module.exports = router;
```

---

### 2. Descargar CSV Individual
**GET** `/reports/csv?procedureNumber={number}`

```javascript
/**
 * Descargar CSV de inspección individual
 * GET /reports/csv?procedureNumber=3333333
 */
router.get('/csv', authenticateToken, async (req, res) => {
  try {
    const { procedureNumber } = req.query;

    if (!procedureNumber) {
      return res.status(400).json({ 
        message: 'El número de trámite es requerido' 
      });
    }

    const inspection = await Inspection.findOne({
      where: { procedureNumber },
      include: [
        { association: 'location' },
        { association: 'inspectors' },
        { association: 'individualRequest' },
        { association: 'legalEntityRequest' },
        { association: 'mayorOffice' },
        { association: 'construction' }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ 
        message: `Inspección con número de trámite ${procedureNumber} no encontrada` 
      });
    }

    // Generar CSV
    const csvHeaders = [
      'ID',
      'Número de Trámite',
      'Fecha de Inspección',
      'Estado',
      'Dependencia',
      'Distrito',
      'Dirección',
      'Tipo de Solicitante',
      'Inspector(es)'
    ];

    const inspectorNames = inspection.inspectors
      ? inspection.inspectors.map(i => `${i.firstName} ${i.lastName}`).join('; ')
      : '';

    const csvRow = [
      inspection.id,
      inspection.procedureNumber,
      inspection.inspectionDate,
      inspection.status,
      inspection.dependency,
      inspection.location?.district || '',
      inspection.location?.exactAddress || '',
      inspection.applicantType || '',
      inspectorNames
    ];

    // Escapar valores CSV
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      csvHeaders.map(escapeCSV).join(','),
      csvRow.map(escapeCSV).join(',')
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inspeccion_${procedureNumber}.csv"`);
    res.send('\uFEFF' + csvContent); // BOM para Excel
  } catch (error) {
    console.error('Error generando CSV:', error);
    res.status(500).json({ 
      message: 'Error al generar el CSV',
      error: error.message 
    });
  }
});
```

---

### 3. Descargar PDF Individual
**GET** `/reports/pdf?procedureNumber={number}`

```javascript
const PDFDocument = require('pdfkit');

/**
 * Descargar PDF de inspección individual
 * GET /reports/pdf?procedureNumber=3333333
 */
router.get('/pdf', authenticateToken, async (req, res) => {
  try {
    const { procedureNumber } = req.query;

    if (!procedureNumber) {
      return res.status(400).json({ 
        message: 'El número de trámite es requerido' 
      });
    }

    const inspection = await Inspection.findOne({
      where: { procedureNumber },
      include: [
        { association: 'location' },
        { association: 'inspectors' },
        { association: 'individualRequest' },
        { association: 'legalEntityRequest' },
        { association: 'mayorOffice' },
        { association: 'construction' },
        { association: 'landUse' }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ 
        message: `Inspección con número de trámite ${procedureNumber} no encontrada` 
      });
    }

    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspeccion_${procedureNumber}.pdf"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text('Reporte de Inspección', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número de Trámite: ${inspection.procedureNumber}`, { align: 'center' });
    doc.moveDown();

    // Información básica
    doc.fontSize(14).text('Información General', { underline: true });
    doc.fontSize(11);
    doc.text(`ID: ${inspection.id}`);
    doc.text(`Estado: ${inspection.status}`);
    doc.text(`Dependencia: ${inspection.dependency}`);
    doc.text(`Fecha de Inspección: ${new Date(inspection.inspectionDate).toLocaleDateString('es-CR')}`);
    doc.moveDown();

    // Ubicación
    if (inspection.location) {
      doc.fontSize(14).text('Ubicación', { underline: true });
      doc.fontSize(11);
      doc.text(`Distrito: ${inspection.location.district}`);
      doc.text(`Dirección: ${inspection.location.exactAddress}`);
      doc.moveDown();
    }

    // Inspectores
    if (inspection.inspectors && inspection.inspectors.length > 0) {
      doc.fontSize(14).text('Inspector(es)', { underline: true });
      doc.fontSize(11);
      inspection.inspectors.forEach(inspector => {
        doc.text(`- ${inspector.firstName} ${inspector.lastName} (${inspector.email})`);
      });
      doc.moveDown();
    }

    // Solicitante
    if (inspection.individualRequest) {
      doc.fontSize(14).text('Solicitante (Persona Física)', { underline: true });
      doc.fontSize(11);
      doc.text(`Nombre: ${inspection.individualRequest.firstName} ${inspection.individualRequest.lastName1} ${inspection.individualRequest.lastName2 || ''}`);
      doc.text(`Cédula: ${inspection.individualRequest.physicalId}`);
      doc.moveDown();
    }

    if (inspection.legalEntityRequest) {
      doc.fontSize(14).text('Solicitante (Persona Jurídica)', { underline: true });
      doc.fontSize(11);
      doc.text(`Razón Social: ${inspection.legalEntityRequest.legalName}`);
      doc.text(`Cédula Jurídica: ${inspection.legalEntityRequest.legalId}`);
      doc.moveDown();
    }

    // Pie de página
    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleDateString('es-CR')} a las ${new Date().toLocaleTimeString('es-CR')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error generando PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error al generar el PDF',
        error: error.message 
      });
    }
  }
});
```

---

### 4. Vista Previa de Inspecciones Masivas
**GET** `/reports/inspections/preview`

```javascript
const { Op } = require('sequelize');

/**
 * Obtener vista previa de inspecciones con filtros
 * GET /reports/inspections/preview?startDate=2024-01-01&endDate=2024-12-31&status=Nuevo&inspectorId=1
 */
router.get('/inspections/preview', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, inspectorId } = req.query;

    // Construir filtros
    const where = {};
    
    if (startDate && endDate) {
      where.inspectionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.inspectionDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.inspectionDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    if (status) {
      where.status = status;
    }

    // Incluir inspectores
    const include = [
      { association: 'location' },
      { association: 'inspectors' }
    ];

    // Filtrar por inspector si se proporciona
    if (inspectorId) {
      include[1].where = { id: inspectorId };
      include[1].required = true;
    }

    // Contar total
    const total = await Inspection.count({ where, include });

    // Obtener muestra (primeros 10)
    const sample = await Inspection.findAll({
      where,
      include,
      limit: 10,
      order: [['inspectionDate', 'DESC']]
    });

    res.json({
      total,
      sample,
      filters: { startDate, endDate, status, inspectorId }
    });
  } catch (error) {
    console.error('Error en preview:', error);
    res.status(500).json({ 
      message: 'Error al obtener vista previa',
      error: error.message 
    });
  }
});
```

---

### 5. Descargar CSV Masivo
**GET** `/reports/inspections/csv`

```javascript
/**
 * Descargar CSV de inspecciones masivas
 * GET /reports/inspections/csv?startDate=2024-01-01&endDate=2024-12-31
 */
router.get('/inspections/csv', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, inspectorId } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.inspectionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status) {
      where.status = status;
    }

    const include = [
      { association: 'location' },
      { association: 'inspectors' }
    ];

    if (inspectorId) {
      include[1].where = { id: inspectorId };
      include[1].required = true;
    }

    const inspections = await Inspection.findAll({
      where,
      include,
      order: [['inspectionDate', 'DESC']]
    });

    if (inspections.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron inspecciones con los filtros aplicados' 
      });
    }

    // Generar CSV
    const csvHeaders = [
      'ID',
      'Número de Trámite',
      'Fecha de Inspección',
      'Estado',
      'Dependencia',
      'Distrito',
      'Dirección',
      'Inspector(es)'
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = inspections.map(inspection => {
      const inspectorNames = inspection.inspectors
        ? inspection.inspectors.map(i => `${i.firstName} ${i.lastName}`).join('; ')
        : '';

      return [
        inspection.id,
        inspection.procedureNumber,
        inspection.inspectionDate,
        inspection.status,
        inspection.dependency,
        inspection.location?.district || '',
        inspection.location?.exactAddress || '',
        inspectorNames
      ].map(escapeCSV).join(',');
    });

    const csvContent = [
      csvHeaders.map(escapeCSV).join(','),
      ...csvRows
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inspecciones_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    console.error('Error generando CSV masivo:', error);
    res.status(500).json({ 
      message: 'Error al generar el CSV',
      error: error.message 
    });
  }
});
```

---

### 6. Descargar PDF Masivo
**GET** `/reports/inspections/pdf`

```javascript
/**
 * Descargar PDF de inspecciones masivas
 * GET /reports/inspections/pdf?startDate=2024-01-01&endDate=2024-12-31
 */
router.get('/inspections/pdf', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, inspectorId } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.inspectionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status) {
      where.status = status;
    }

    const include = [
      { association: 'location' },
      { association: 'inspectors' }
    ];

    if (inspectorId) {
      include[1].where = { id: inspectorId };
      include[1].required = true;
    }

    const inspections = await Inspection.findAll({
      where,
      include,
      order: [['inspectionDate', 'DESC']]
    });

    if (inspections.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron inspecciones' 
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_inspecciones.pdf"`);
    
    doc.pipe(res);

    // Título
    doc.fontSize(20).text('Reporte de Inspecciones', { align: 'center' });
    doc.moveDown();
    
    // Filtros aplicados
    doc.fontSize(10);
    doc.text(`Período: ${startDate || 'Inicio'} - ${endDate || 'Fin'}`, { align: 'center' });
    if (status) doc.text(`Estado: ${status}`, { align: 'center' });
    doc.text(`Total de inspecciones: ${inspections.length}`, { align: 'center' });
    doc.moveDown(2);

    // Tabla de inspecciones
    inspections.forEach((inspection, index) => {
      if (index > 0) doc.moveDown();
      
      doc.fontSize(12).text(`${index + 1}. Trámite ${inspection.procedureNumber}`, { underline: true });
      doc.fontSize(10);
      doc.text(`   Estado: ${inspection.status}`);
      doc.text(`   Fecha: ${new Date(inspection.inspectionDate).toLocaleDateString('es-CR')}`);
      doc.text(`   Dependencia: ${inspection.dependency}`);
      
      if (inspection.location) {
        doc.text(`   Ubicación: ${inspection.location.district}, ${inspection.location.exactAddress}`);
      }
      
      if (inspection.inspectors && inspection.inspectors.length > 0) {
        const inspectorNames = inspection.inspectors.map(i => `${i.firstName} ${i.lastName}`).join(', ');
        doc.text(`   Inspector(es): ${inspectorNames}`);
      }

      // Nueva página cada 10 inspecciones
      if ((index + 1) % 10 === 0 && index < inspections.length - 1) {
        doc.addPage();
      }
    });

    // Pie de página
    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleDateString('es-CR')} a las ${new Date().toLocaleTimeString('es-CR')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error generando PDF masivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error al generar el PDF',
        error: error.message 
      });
    }
  }
});
```

---

### 7. Descargar PDF Detallado de Inspección
**GET** `/reports/inspections/:id/pdf`

```javascript
/**
 * Descargar PDF detallado de una inspección específica
 * GET /reports/inspections/123/pdf
 */
router.get('/inspections/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const inspection = await Inspection.findByPk(id, {
      include: [
        { association: 'location' },
        { association: 'inspectors' },
        { association: 'individualRequest' },
        { association: 'legalEntityRequest' },
        { association: 'mayorOffice' },
        { association: 'construction' },
        { association: 'landUse' },
        { association: 'antiquity' },
        { association: 'pcCancellation' },
        { association: 'generalInspection' },
        { association: 'workReceipt' },
        { association: 'concession' }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ 
        message: `Inspección con ID ${id} no encontrada` 
      });
    }

    // Generar PDF detallado (similar al individual pero más completo)
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspeccion_${id}_detallado.pdf"`);
    
    doc.pipe(res);

    // Título
    doc.fontSize(20).text('Reporte Detallado de Inspección', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`ID: ${inspection.id} - Trámite: ${inspection.procedureNumber}`, { align: 'center' });
    doc.moveDown(2);

    // Información General
    doc.fontSize(14).text('Información General', { underline: true });
    doc.fontSize(11);
    doc.text(`Estado: ${inspection.status}`);
    doc.text(`Dependencia: ${inspection.dependency}`);
    doc.text(`Fecha de Inspección: ${new Date(inspection.inspectionDate).toLocaleDateString('es-CR')}`);
    doc.text(`Tipo de Solicitante: ${inspection.applicantType || 'N/A'}`);
    doc.moveDown();

    // Ubicación
    if (inspection.location) {
      doc.fontSize(14).text('Ubicación', { underline: true });
      doc.fontSize(11);
      doc.text(`Distrito: ${inspection.location.district}`);
      doc.text(`Dirección Exacta: ${inspection.location.exactAddress}`);
      if (inspection.location.coordinates) {
        doc.text(`Coordenadas: ${inspection.location.coordinates}`);
      }
      doc.moveDown();
    }

    // Inspectores
    if (inspection.inspectors && inspection.inspectors.length > 0) {
      doc.fontSize(14).text('Inspector(es) Asignado(s)', { underline: true });
      doc.fontSize(11);
      inspection.inspectors.forEach(inspector => {
        doc.text(`• ${inspector.firstName} ${inspector.lastName}`);
        doc.text(`  Email: ${inspector.email}`);
        if (inspector.phone) doc.text(`  Teléfono: ${inspector.phone}`);
      });
      doc.moveDown();
    }

    // Solicitante Individual
    if (inspection.individualRequest) {
      doc.fontSize(14).text('Datos del Solicitante (Persona Física)', { underline: true });
      doc.fontSize(11);
      doc.text(`Nombre Completo: ${inspection.individualRequest.firstName} ${inspection.individualRequest.lastName1} ${inspection.individualRequest.lastName2 || ''}`);
      doc.text(`Cédula: ${inspection.individualRequest.physicalId}`);
      doc.moveDown();
    }

    // Solicitante Jurídico
    if (inspection.legalEntityRequest) {
      doc.fontSize(14).text('Datos del Solicitante (Persona Jurídica)', { underline: true });
      doc.fontSize(11);
      doc.text(`Razón Social: ${inspection.legalEntityRequest.legalName}`);
      doc.text(`Cédula Jurídica: ${inspection.legalEntityRequest.legalId}`);
      doc.moveDown();
    }

    // Detalles de Alcaldía
    if (inspection.mayorOffice) {
      doc.fontSize(14).text('Detalles - Alcaldía', { underline: true });
      doc.fontSize(11);
      doc.text(`Tipo de Trámite: ${inspection.mayorOffice.procedureType}`);
      if (inspection.mayorOffice.observations) {
        doc.text(`Observaciones: ${inspection.mayorOffice.observations}`);
      }
      doc.moveDown();
    }

    // Uso de Suelo
    if (inspection.landUse) {
      doc.fontSize(14).text('Detalles - Uso de Suelo', { underline: true });
      doc.fontSize(11);
      doc.text(`Uso Solicitado: ${inspection.landUse.requestedUse}`);
      doc.text(`Coincide con Ubicación: ${inspection.landUse.matchesLocation ? 'Sí' : 'No'}`);
      doc.text(`Recomendado: ${inspection.landUse.isRecommended ? 'Sí' : 'No'}`);
      if (inspection.landUse.observations) {
        doc.text(`Observaciones: ${inspection.landUse.observations}`);
      }
      doc.moveDown();
    }

    // Pie de página
    doc.fontSize(8).text(
      `Generado el ${new Date().toLocaleDateString('es-CR')} a las ${new Date().toLocaleTimeString('es-CR')}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error generando PDF detallado:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error al generar el PDF',
        error: error.message 
      });
    }
  }
});

module.exports = router;
```

---

## Registro de Rutas

En el archivo principal del servidor (ej: `app.js` o `server.js`):

```javascript
// app.js
const express = require('express');
const app = express();
const reportsRouter = require('./routes/reports.routes');

// Middleware
app.use(express.json());

// Rutas
app.use('/reports', reportsRouter);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

---

## Dependencias Necesarias

Instalar en el proyecto backend:

```bash
npm install pdfkit
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints usan `authenticateToken` middleware
2. **Validación**: Se valida que los parámetros requeridos existan
3. **Errores**: Se manejan errores 400, 404 y 500 apropiadamente
4. **CSV**: Incluye BOM (\uFEFF) para compatibilidad con Excel
5. **PDF**: Usa pdfkit para generar PDFs profesionales
6. **Filtros**: Los filtros son opcionales y se combinan con AND lógico
7. **Include**: Se cargan todas las relaciones necesarias

---

## Testing

Ejemplos de peticiones:

```bash
# Buscar inspección
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/reports/search?procedureNumber=3333333"

# Descargar CSV individual
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/reports/csv?procedureNumber=3333333" \
  -o inspeccion.csv

# Vista previa masiva
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/reports/inspections/preview?startDate=2024-01-01&endDate=2024-12-31"

# Descargar PDF masivo
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/reports/inspections/pdf?status=Nuevo" \
  -o reporte.pdf
```
