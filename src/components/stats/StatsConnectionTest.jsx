// src/components/stats/StatsConnectionTest.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Wifi } from 'lucide-react';
import statsService from '../../services/statsService';

const StatsConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const endpoints = [
    { name: 'Summary', method: 'getSummary', endpoint: '/stats/summary' },
    { name: 'Status Counts', method: 'getStatusCounts', endpoint: '/stats/status-counts' },
    { name: 'Inspections', method: 'getInspections', endpoint: '/stats/inspections' },
    { name: 'Special Inspections', method: 'getSpecialInspections', endpoint: '/stats/special-inspections' },
    { name: 'Inspectors', method: 'getInspectors', endpoint: '/stats/inspectors' },
    { name: 'Departments', method: 'getDepartments', endpoint: '/stats/departments' },
    { name: 'Detailed', method: 'getDetailed', endpoint: '/stats/detailed' },
    { name: 'Dashboard', method: 'getDashboard', endpoint: '/stats/dashboard' },
    { name: 'Complete Overview', method: 'getCompleteOverview', endpoint: '/stats/complete-overview' }
  ];

  const testEndpoint = async (endpoint) => {
    setTestResults(prev => ({
      ...prev,
      [endpoint.method]: { status: 'loading' }
    }));

    try {
      const data = await statsService[endpoint.method]();
      setTestResults(prev => ({
        ...prev,
        [endpoint.method]: { 
          status: 'success', 
          data,
          message: 'Endpoint disponible y funcionando'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint.method]: { 
          status: 'error', 
          error: error.message,
          message: `Error: ${error.message}`
        }
      }));
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    setTestResults({});

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestingAll(false);
  };

  const testConnection = async () => {
    const result = await statsService.testConnection();
    setTestResults(prev => ({
      ...prev,
      connection: result
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Prueba de Conectividad - Endpoints de Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <Button onClick={testConnection} variant="outline">
            Probar Conexión General
          </Button>
          <Button 
            onClick={testAllEndpoints}
            disabled={isTestingAll}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTestingAll ? 'Probando...' : 'Probar Todos los Endpoints'}
          </Button>
        </div>

        {/* Resultado de conexión general */}
        {testResults.connection && (
          <div className="p-3 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-2">
              {testResults.connection.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium">Conexión General:</span>
              <span>{testResults.connection.message}</span>
            </div>
          </div>
        )}

        {/* Resultados de endpoints */}
        <div className="grid gap-3">
          {endpoints.map((endpoint) => {
            const result = testResults[endpoint.method];
            return (
              <div key={endpoint.method} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result?.status)}
                  <div>
                    <div className="font-medium">{endpoint.name}</div>
                    <div className="text-sm text-gray-500">{endpoint.endpoint}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result?.message && (
                    <span className={`text-sm ${
                      result.status === 'success' ? 'text-green-600' : 
                      result.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {result.message}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testEndpoint(endpoint)}
                    disabled={result?.status === 'loading'}
                  >
                    Probar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mostrar datos de prueba exitosa */}
        {Object.values(testResults).some(r => r.status === 'success' && r.data) && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Datos de Ejemplo Recibidos:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(
                Object.entries(testResults)
                  .filter(([_, result]) => result.status === 'success' && result.data)
                  .reduce((acc, [key, result]) => {
                    acc[key] = result.data;
                    return acc;
                  }, {}),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsConnectionTest;