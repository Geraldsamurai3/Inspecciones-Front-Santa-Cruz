// src/components/ui/security-alert.jsx
import React from "react";
import { AlertTriangle, Shield, Check } from "lucide-react";

/**
 * Componente de alerta de seguridad para informar al usuario
 * sobre las medidas de protección implementadas
 */
export const SecurityAlert = ({ type = "info", title, message, features = [] }) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "success":
        return <Shield className="w-5 h-5 text-green-600" />;
      default:
        return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStyles()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm mb-3">{message}</p>
          
          {features.length > 0 && (
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert;