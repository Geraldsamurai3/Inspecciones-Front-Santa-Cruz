// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import AdminLayout from './components/admin/AdminLayout'
import UsersPage from './pages/UsersPage.jsx'
import LoginPage from './components/auth/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import InspectionsPage from './pages/InspectionsPage.jsx'
import InspectionManagementPage from './pages/InspectionManagementPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import InspectionForm from './components/inspections/InspectionForm'


export default function App() {
  return (
    <Routes>
      {/* 1) Ruta pública de login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/admin/reset-password" element={<ResetPasswordPage/>}/>



      {/* 2) Rutas protegidas: TODO lo que empiece con /admin */}
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* /admin → /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* Rutas accesibles para Inspectores (y Admin por herencia) */}
          <Route element={<RequireRole roles={["inspector"]} />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/inspectionsform" element={<InspectionForm />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Rutas exclusivas de Admin (Admin ya pasa en RequireRole, pero hacemos explícito) */}
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/inspections" element={<InspectionsPage />} />
            <Route path="/admin/inspections-management" element={<InspectionManagementPage />} />
          </Route>


          {/* … más rutas protegidas /admin/tuRuta */}



          {/* Cualquier /admin/* no definido vuelve a dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      {/* 3) Cualquier otra ruta pública redirige a login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
