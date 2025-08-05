// src/AdministrativePage/components/AdminLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar a la izquierda */}
      <Sidebar />

      {/* Contenido que ocupa todo el espacio restante */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Aquí React Router inyecta la página activa */}
        <Outlet />
      </main>
    </div>
  )
}
