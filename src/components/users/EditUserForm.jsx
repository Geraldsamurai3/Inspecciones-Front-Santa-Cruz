// src/components/users/EditUserForm.jsx
import React, { useState } from 'react'
import { User, Save, X } from 'lucide-react'

export default function EditUserForm({ user, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    id:             user.id,
    firstName:      user.firstName || '',
    lastName:       user.lastName || '',
    secondLastName: user.secondLastName || '',
    cedula:         user.cedula || '',
    email:          user.email || '',
    phone:          user.phone || '',
    // Normalizamos a minúsculas para que coincida con los <option value="...">
    role:           (user.role || 'inspector').toLowerCase(),
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim())    errs.firstName      = 'El nombre es obligatorio'
    if (!form.lastName.trim())     errs.lastName       = 'El apellido es obligatorio'
    if (!form.cedula.trim())       errs.cedula         = 'La cédula es obligatoria'
    if (!form.email.trim())        errs.email          = 'El email es obligatorio'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
                                   errs.email          = 'Email inválido'
    if (form.secondLastName.length > 100)
                                   errs.secondLastName = 'Máximo 100 caracteres'
    if (form.phone && !/^\+?\d{7,20}$/.test(form.phone))
                                   errs.phone          = 'Teléfono inválido'
    if (!form.role)                errs.role           = 'Selecciona un rol'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(errs => ({ ...errs, [name]: undefined }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    // Aquí pasamos el form completo (incluye form.id)
    onSubmit(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl mx-auto w-full"
    >
      <div className="flex items-center space-x-2 mb-6">
        <User className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.firstName
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.lastName
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>

        {/* Segundo Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Apellido</label>
          <input
            name="secondLastName"
            value={form.secondLastName}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.secondLastName
                ? 'border-red-500 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.secondLastName && (
            <p className="mt-1 text-xs text-red-600">{errors.secondLastName}</p>
          )}
        </div>

        {/* Cédula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
          <input
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.cedula ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.cedula && <p className="mt-1 text-xs text-red-600">{errors.cedula}</p>}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.phone ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.role ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-300'
            }`}
          >
            <option value="inspector">Inspector</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5 mr-2" /> Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-5 w-5 mr-2" /> Guardar
        </button>
      </div>
    </form>
  )
}
