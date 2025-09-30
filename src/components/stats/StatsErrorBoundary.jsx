// src/components/stats/StatsErrorBoundary.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class StatsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en componente de estadísticas:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error al cargar las estadísticas
            </h3>
            <p className="text-red-600 mb-4">
              Ocurrió un problema al procesar los datos. Esto puede deberse a:
            </p>
            <ul className="text-sm text-red-600 text-left mb-4 max-w-md mx-auto">
              <li>• El servidor no está respondiendo</li>
              <li>• Los datos tienen un formato inesperado</li>
              <li>• Problema de conectividad</li>
            </ul>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                size="sm"
              >
                Recargar Página
              </Button>
            </div>
            {this.props.showDetails && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default StatsErrorBoundary;