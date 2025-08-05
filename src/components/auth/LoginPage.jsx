// src/AdministrativePage/pages/LoginPage.jsx
"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { MapPin, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(formData.email, formData.password)
      navigate("/admin/dashboard", { replace: true })
    } catch (err) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const illustrationUrl = import.meta.env.VITE_ILLUSTRATION_URL

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-5xl w-full lg:flex rounded-lg shadow-lg overflow-hidden min-h-[600px]">
        {/* Izquierda: Formulario */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-800">
                Municipalidad de Santa Cruz
              </span>
            </div>
            <span className="inline-block text-xs font-medium uppercase bg-gray-200 text-gray-700 rounded-full px-3 py-1">
              Departamento de Inspecciones
            </span>
          </div>

          {/* Avatar / espacio para foto */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-semibold text-gray-800">
            Iniciar Sesión
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            Accede al sistema de inspecciones
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-md p-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@municipalidad.cr"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/admin/forgot-password" className="text-sm text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2 disabled:opacity-50 transition"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        {/* Derecha: Imagen / ilustración */}
        {illustrationUrl && (
          <div className="hidden lg:block lg:w-1/2">
            <img
              src={illustrationUrl}
              alt="Inspecciones"
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
