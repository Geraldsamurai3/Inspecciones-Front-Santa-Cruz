// src/pages/ReportsPage.jsx
import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, BarChart3, Search, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReportFilters from '@/components/reports/ReportFilters';
import PreviewTable from '@/components/reports/PreviewTable';
import IndividualSearch from '@/components/reports/IndividualSearch';
import { useReports } from '@/hooks/useReports';
import Swal from 'sweetalert2';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' o 'mass'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    inspectorId: '',
  });

  const { 
    loading, 
    preview, 
    inspection,
    inspections, // Array de múltiples inspecciones
    searchByProcedureNumber,
    downloadIndividualCSV,
    downloadIndividualPDF,
    downloadCSVById,
    downloadPDFById,
    getPreview, 
    downloadCSV, 
    downloadPDF 
  } = useReports();

  // === BÚSQUEDA INDIVIDUAL ===
  const handleIndividualSearch = async (procedureNumber) => {
    try {
      await searchByProcedureNumber(procedureNumber);
      Swal.fire({
        icon: 'success',
        title: 'Inspección encontrada',
        text: `Trámite ${procedureNumber}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No encontrada',
        text: error.response?.status === 404 
          ? 'No se encontró inspección con ese número de trámite'
          : 'Error al buscar inspección',
      });
    }
  };

  const handleIndividualExportCSV = async (procedureNumber) => {
    try {
      await downloadIndividualCSV(procedureNumber);
      Swal.fire({
        icon: 'success',
        title: 'CSV Descargado',
        text: 'El archivo se descargó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error completo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar CSV',
        text: error.message || error.response?.data?.message || 'No se pudo descargar el CSV',
        footer: error.response?.status ? `Código de error: ${error.response.status}` : undefined,
      });
    }
  };

  const handleIndividualExportPDF = async (procedureNumber) => {
    try {
      await downloadIndividualPDF(procedureNumber);
      Swal.fire({
        icon: 'success',
        title: 'PDF Descargado',
        text: 'El archivo se descargó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error completo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar PDF',
        text: error.message || error.response?.data?.message || 'No se pudo descargar el PDF',
        footer: error.response?.status ? `Código de error: ${error.response.status}` : undefined,
      });
    }
  };

  // === REPORTES MASIVOS ===
  const handlePreview = async () => {
    try {
      const data = await getPreview(filters);
      
      if (data.total === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron inspecciones con los filtros seleccionados',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Vista previa generada',
          text: `Se encontraron ${data.total} inspecciones`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la vista previa',
      });
    }
  };

  const handleExportCSV = async () => {
    if (!preview || preview.total === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Primero debes generar una vista previa',
      });
      return;
    }

    try {
      await downloadCSV(filters);
      Swal.fire({
        icon: 'success',
        title: 'CSV Descargado',
        text: 'El archivo se descargó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.status === 404 
          ? 'No se encontraron inspecciones' 
          : 'No se pudo descargar el CSV',
      });
    }
  };

  const handleExportPDF = async () => {
    if (!preview || preview.total === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'Primero debes generar una vista previa',
      });
      return;
    }

    try {
      await downloadPDF(filters);
      Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: 'El archivo se descargó correctamente',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.status === 404 
          ? 'No se encontraron inspecciones' 
          : 'No se pudo generar el PDF',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes de Inspecciones</h1>
            <p className="text-sm text-gray-500">
              Busca inspecciones individuales o genera reportes masivos en CSV/PDF
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'individual'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="h-4 w-4" />
            Búsqueda Individual
          </button>
          <button
            onClick={() => setActiveTab('mass')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'mass'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="h-4 w-4" />
            Reportes Masivos
          </button>
        </div>
      </div>

      {/* Contenido según tab */}
      {activeTab === 'individual' ? (
        <IndividualSearch
          onSearch={handleIndividualSearch}
          onExportCSV={handleIndividualExportCSV}
          onExportPDF={handleIndividualExportPDF}
          onExportCSVById={downloadCSVById}
          onExportPDFById={downloadPDFById}
          loading={loading}
          inspection={inspection}
          inspections={inspections}
        />
      ) : (
        <>
          {/* Filtros */}
          <div className="mb-6">
            <ReportFilters
              filters={filters}
              onChange={setFilters}
              onPreview={handlePreview}
              loading={loading}
            />
          </div>

          {/* Vista Previa */}
          {preview && (
            <div className="mb-6">
              <PreviewTable preview={preview} />
            </div>
          )}

          {/* Botones de Exportación */}
          {preview && preview.total > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Exportar Reporte</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleExportCSV}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base"
                  >
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Exportar CSV
                  </Button>

                  <Button
                    onClick={handleExportPDF}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Exportar PDF
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Los archivos incluirán todas las {preview.total} inspecciones encontradas
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ayuda */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Consejos de uso</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Usa los filtros para refinar tu búsqueda</li>
                    <li>• Genera una vista previa antes de exportar</li>
                    <li>• Los archivos CSV pueden abrirse en Excel</li>
                    <li>• Los PDFs incluyen formato profesional</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
