// src/pages/InspectorDashboard.jsx
import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'

// 🔧 TUS UI COMPONENTS
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// Iconos + Recharts
import { UserCircle2, CalendarDays, CheckCircle2, Clock4, TimerReset } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

// username mostrado: el mismo con el que se registró
function getDisplayUsername(u) {
  const username =
    (u?.username ?? u?.nombre_Usuario ?? u?.name ?? u?.nombre ?? u?.fullName) ??
    ((u?.email_Usuario ?? u?.email)?.split('@')[0] || undefined);

  const s = (username ?? '').toString().trim();
  return s.length ? s : 'Inspector';
}

// Helpers de fechas (YYYY-MM-DD)
const toYMD = (d) => new Date(d).toISOString().slice(0, 10)
function addDaysStr(ymd, days = 1) {
  if (!ymd) return ymd
  const d = new Date(ymd)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function InspectorDashboard() {
  const { user } = useAuth()
  const displayUsername = getDisplayUsername(user)

  const {
    data,
    loading,
    error,
    periodStats,
    periodLoading,
    periodError,
    fetchStatsByPeriod,
  } = useDashboard({ mode: 'inspector', autoFetch: true })

  // Fechas por defecto: inicio de mes → hoy
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [startDate, setStartDate] = useState(toYMD(monthStart))
  const [endDate, setEndDate] = useState(toYMD(today))

  if (loading) return <div className="p-4 sm:p-6">Cargando…</div>
  if (error) return <div className="p-4 sm:p-6 text-red-600">Error: {error.message}</div>

  // Mapeos al backend
  const totals = {
    pending:    data?.estadisticasPorEstado?.nueva ?? 0,
    inProgress: data?.estadisticasPorEstado?.enProgreso ?? 0,
    done:       data?.estadisticasPorEstado?.revisada ?? 0,
    total:      data?.resumen?.totalInspecciones ?? 0,
  }

  const myInspections = Array.isArray(data?.ultimasInspecciones)
    ? data.ultimasInspecciones
    : Array.isArray(data?.tareasPendientes)
    ? data.tareasPendientes
    : []

  const chartData = periodStats?.porEstado
    ? [
        { label: 'Nueva',       count: periodStats.porEstado.nueva ?? 0 },
        { label: 'En Proceso',  count: periodStats.porEstado.enProgreso ?? 0 },
        { label: 'Revisada',    count: periodStats.porEstado.revisada ?? 0 },
        { label: 'Archivada',   count: periodStats.porEstado.archivada ?? 0 },
      ]
    : []

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl border self-start sm:self-auto">
              <UserCircle2 size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-2xl">
                ¡Bienvenido, {displayUsername}!
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Panel de seguimiento de tus inspecciones y estadísticas.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground sm:self-auto">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-0">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock4 className="w-4 h-4" /> Pendientes
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{totals.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="p-0">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <TimerReset className="w-4 h-4" /> En Proceso
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{totals.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="p-0">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4" /> Completadas
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{totals.done}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="p-0">
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">Total</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{totals.total}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Stats periodo */}
      <Card>
        <CardHeader className="space-y-3 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <CardTitle className="text-base sm:text-lg">Estadísticas por período</CardTitle>
            <form
              className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
              onSubmit={(e) => {
                e.preventDefault()
                // Rango inclusivo: endDate + 1 día
                fetchStatsByPeriod({ startDate, endDate: addDaysStr(endDate, 1) })
              }}
            >
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 w-full sm:w-auto">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e)=>setStartDate(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e)=>setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">Consultar</Button>
            </form>
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-6">
          {periodLoading && <div>Consultando…</div>}
          {periodError && <div className="text-red-600">Error: {periodError.message}</div>}

          <Card className="border-dashed">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total en el período</CardDescription>
              <CardTitle className="text-xl sm:text-2xl">
                {periodStats?.total ?? '—'}
              </CardTitle>
            </CardHeader>
          </Card>

          {chartData.length > 0 ? (
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader className="pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Por día</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Sin datos para el rango seleccionado.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tabla de inspecciones (desktop) */}
      <Card>
        <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Mis inspecciones (recientes)</CardTitle>
          <Badge variant="secondary" className="self-start sm:self-auto">Vista personal</Badge>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop/tablet */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {myInspections.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{r.id ?? i + 1}</td>
                    <td className="p-3">
                      {r.inspectionDate
                        ? new Date(r.inspectionDate).toLocaleDateString()
                        : r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">{r.applicantType ?? '—'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full border">
                        {r.status ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
                {myInspections.length === 0 && (
                  <tr><td className="p-3" colSpan={4}>Sin registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Móvil: lista en cards */}
          <div className="sm:hidden p-4">
            {myInspections.length === 0 && (
              <div className="text-sm text-muted-foreground">Sin registros.</div>
            )}
            <div className="grid gap-3">
              {myInspections.map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">#{r.id ?? i + 1}</span>
                      <span className="text-xs">
                        {r.inspectionDate
                          ? new Date(r.inspectionDate).toLocaleDateString()
                          : r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Tipo</span>
                        <span>{r.applicantType ?? '—'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-medium">Estado</span>
                        <span className="px-2 py-0.5 rounded-full border text-xs">
                          {r.status ?? '—'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
