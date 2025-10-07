// src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/hooks/useAuth'
import { inspectionsService } from '@/services/inspectionsService'

// UI
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Icons
import { UserCircle2, Clock4, ClipboardList, CheckCircle2 } from 'lucide-react'

// Recharts
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'

// Util: nombre visible
function getDisplayUsername(u) {
  const username =
    (u?.username ?? u?.nombre_Usuario ?? u?.name ?? u?.nombre ?? u?.fullName) ??
    ((u?.email_Usuario ?? u?.email)?.split('@')[0] || undefined)
  const s = (username ?? '').toString().trim()
  return s.length ? s : 'Admin'
}

// ---------- Helpers de fallback (cliente) ----------
const matchers = {
  NEW: (s='') => /^(new|nuevo|nueva)$/i.test(s.trim()),
  IN_PROGRESS: (s='') => /^(in[_\s-]?progress|en\s*proceso)$/i.test(s.trim()),
  REVIEWED: (s='') => /^(reviewed|revisad[oa])$/i.test(s.trim()),
  ARCHIVED: (s='') => /^(archived|archivad[oa])$/i.test(s.trim()),
}
function statusKey(s='') {
  if (matchers.NEW(s)) return 'nueva'
  if (matchers.IN_PROGRESS(s)) return 'enProgreso'
  if (matchers.REVIEWED(s)) return 'revisada'
  if (matchers.ARCHIVED(s)) return 'archivada'
  return 'otro'
}
function monthKey(d) {
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
}
function isAllZero(obj = {}) {
  return Object.values(obj).every(v => !v || Number(v) === 0)
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const displayUsername = getDisplayUsername(user)

  // 1) Datos del backend (tu hook)
  const { data, loading, error } = useDashboard({ mode: 'admin', autoFetch: true })

  // 2) Estados para fallback (solo si el backend trae ceros)
  const [fallbackReady, setFallbackReady] = useState(false)
  const [fb, setFb] = useState({
    eg: { nueva:0, enProgreso:0, revisada:0, archivada:0, totalInspecciones:0, totalInspectores:0 },
    tipos: { anonimo:0, personaFisica:0, personaJuridica:0 },
    team: [],
    recientes: [],
    mineEstados: { nueva:0, enProgreso:0, revisada:0, archivada:0 },
    mineResumen: { inspeccionesEsteMes:0, inspeccionesEstaSemana:0, totalInspecciones:0 },
  })

  // 3) Si lo del backend viene vacío, calculamos en cliente con tu inspectionsService
  useEffect(() => {
    (async () => {
      if (loading || error) return
      const admin = data?.vistaAdministrativa ?? {}
      const eg = admin?.estadisticasGenerales ?? {}
      const vacio = isAllZero({
        nueva: eg.nueva, enProgreso: eg.enProgreso, revisada: eg.revisada, archivada: eg.archivada,
        total: eg.totalInspecciones
      })

      // Solo si backend está vacío sacamos fallback
      if (!vacio) { setFallbackReady(false); return }

      try {
        const list = await inspectionsService.getInspections()
        const items = Array.isArray(list?.items) ? list.items : (Array.isArray(list) ? list : [])

        // Globales
        const g = { nueva:0, enProgreso:0, revisada:0, archivada:0, totalInspecciones: items.length, totalInspectores: 0 }
        const typeAgg = { anonimo:0, personaFisica:0, personaJuridica:0 }

        // Por inspector (nombre -> métricas)
        const perInspector = new Map()

        // Personales (admin)
        const mine = { nueva:0, enProgreso:0, revisada:0, archivada:0 }
        const mineRes = { inspeccionesEsteMes:0, inspeccionesEstaSemana:0, totalInspecciones:0 }

        const now = new Date()
        const thisMonth = monthKey(now)
        const startWeek = new Date(now); startWeek.setDate(now.getDate() - now.getDay()); startWeek.setHours(0,0,0,0)

        // --- NUEVO: contador derivado de "en proceso" ---
        let derivedInProgress = 0

        for (const it of items) {
          const stKey = statusKey(it.status ?? '')
          if (g[stKey] !== undefined) g[stKey]++

          // tipos
          const t = (it.applicantType || '').toLowerCase()
          if (t.includes('anón')) typeAgg.anonimo++
          else if (t.includes('física')) typeAgg.personaFisica++
          else if (t.includes('jurídica')) typeAgg.personaJuridica++

          // Por inspector
          const inspectors = Array.isArray(it.inspectors) ? it.inspectors : []

          // --- NUEVO: derivar "en proceso" si está NUEVA pero ya tiene inspectores asignados ---
          if (stKey === 'nueva' && inspectors.length > 0) {
            derivedInProgress++
          }

          for (const insp of inspectors) {
            const name = `${insp.firstName ?? ''} ${insp.lastName ?? ''}`.trim() || insp.email || `#${insp.id}`
            if (!perInspector.has(name)) perInspector.set(name, { pendientes:0, completadas:0, esteMes:0, totalInspecciones:0 })
            const row = perInspector.get(name)
            row.totalInspecciones++
            if (stKey === 'nueva' || stKey === 'enProgreso') row.pendientes++
            if (stKey === 'revisada') row.completadas++
            const mk = monthKey(it.createdAt ?? it.inspectionDate)
            if (mk && mk === thisMonth) row.esteMes++
          }

          // Personales (si el admin aparece como inspector)
          const iAmIn = inspectors.some(i => i?.id === user?.id)
          if (iAmIn) {
            mineRes.totalInspecciones++
            if (stKey in mine) mine[stKey]++
            const mk = monthKey(it.createdAt ?? it.inspectionDate)
            if (mk && mk === thisMonth) mineRes.inspeccionesEsteMes++
            const created = new Date(it.createdAt ?? it.inspectionDate)
            if (!isNaN(created) && created >= startWeek) mineRes.inspeccionesEstaSemana++
          }
        }

        // --- NUEVO: si enProgreso vino 0, usar el derivado ---
        if ((g.enProgreso | 0) === 0 && derivedInProgress > 0) {
          g.enProgreso = derivedInProgress
        }

        g.totalInspectores = perInspector.size

        const teamArr = Array.from(perInspector.entries()).map(([name, v]) => ({
          inspector: { nombre: name },
          pendientes: v.pendientes,
          completadas: v.completadas,
          esteMes: v.esteMes,
          totalInspecciones: v.totalInspecciones,
        }))

        // Recientes
        const recientes = [...items]
          .sort((a,b)=> new Date(b.createdAt ?? b.inspectionDate) - new Date(a.createdAt ?? a.inspectionDate))
          .slice(0,10)
          .map(r => ({
            id: r.id,
            inspectionDate: r.inspectionDate,
            status: r.status,
            applicantType: r.applicantType,
            inspectores: (Array.isArray(r.inspectors)? r.inspectors: []).map(i => `${i.firstName ?? ''} ${i.lastName ?? ''}`.trim()).filter(Boolean),
            procedureNumber: r.procedureNumber,
            createdAt: r.createdAt,
          }))

        setFb({
          eg: g,
          tipos: typeAgg,
          team: teamArr,
          recientes,
          mineEstados: mine,
          mineResumen: mineRes,
        })
        setFallbackReady(true)
      } catch (_) {
        setFallbackReady(false)
      }
    })()
  }, [data, loading, error, user?.id])

  // ----- Elegimos fuente (backend si trae datos, si no el fallback) -----
  const mine = data?.miDashboard ?? {}
  const mineResumen = (!fallbackReady ? (mine?.resumen ?? {}) : fb.mineResumen)
  const mineEstados = (!fallbackReady ? (mine?.estadisticasPorEstado ?? {}) : fb.mineEstados)

  const admin = data?.vistaAdministrativa ?? {}
  const egServer = admin?.estadisticasGenerales ?? {}
  const tiposServer = admin?.estadisticasPorTipo ?? {}
  const teamServer = Array.isArray(admin?.rendimientoPorInspector) ? admin.rendimientoPorInspector : []
  const recServer = Array.isArray(admin?.inspeccionesRecientes) ? admin.inspeccionesRecientes : []

  const eg = (!fallbackReady || !isAllZero({
    nueva: egServer.nueva, enProgreso: egServer.enProgreso, revisada: egServer.revisada, archivada: egServer.archivada, total: egServer.totalInspecciones
  })) ? egServer : fb.eg

  const tipos = (!fallbackReady || (tiposServer.anonimo ?? tiposServer.personaFisica ?? tiposServer.personaJuridica))
    ? tiposServer : fb.tipos

  const team = (!fallbackReady || teamServer.length) ? teamServer : fb.team
  const recientes = (!fallbackReady || recServer.length) ? recServer : fb.recientes

  // ====== KPI personales, con respaldo global si están en 0 ======
  const personalKPIs = useMemo(() => ({
    pendientes: (mineEstados.nueva ?? 0) + (mineEstados.enProgreso ?? 0),
    enProceso:  (mineEstados.enProgreso ?? 0),
    revisadas:  (mineEstados.revisada ?? 0),
    esteMes:    (mineResumen.inspeccionesEsteMes ?? 0),
    estaSemana: (mineResumen.inspeccionesEstaSemana ?? 0),
    total:      (mineResumen.totalInspecciones ?? 0),
  }), [mineEstados, mineResumen])

  const personalesEnCero =
    (personalKPIs.pendientes|0) === 0 &&
    (personalKPIs.enProceso|0)  === 0 &&
    (personalKPIs.revisadas|0)  === 0 &&
    (personalKPIs.esteMes|0)    === 0 &&
    (personalKPIs.estaSemana|0) === 0 &&
    (personalKPIs.total|0)      === 0

  // backup global para KPIs cuando personales están en 0
  const kpiGlobalBackup = useMemo(() => {
    const sumEsteMes = (team ?? []).reduce((acc, t) => acc + (t?.esteMes ?? 0), 0)

    const now = new Date()
    const startWeek = new Date(now); startWeek.setDate(now.getDate() - now.getDay()); startWeek.setHours(0,0,0,0)
    const weekCount = (recientes ?? []).reduce((acc, r) => {
      const d = new Date(r.createdAt ?? r.inspectionDate)
      return acc + (isNaN(d) ? 0 : (d >= startWeek ? 1 : 0))
    }, 0)

    const totalCalc = (eg.totalInspecciones ??
      ((eg.nueva ?? 0) + (eg.enProgreso ?? 0) + (eg.revisada ?? 0) + (eg.archivada ?? 0)))

    return {
      pendientes: (eg.nueva ?? 0) + (eg.enProgreso ?? 0),
      enProceso:  (eg.enProgreso ?? 0),
      revisadas:  (eg.revisada ?? 0),
      esteMes:    sumEsteMes,
      estaSemana: weekCount,
      total:      totalCalc,
    }
  }, [eg, team, recientes])

  const kpiPersonales = personalesEnCero ? kpiGlobalBackup : personalKPIs

  // Gráficos
  const estadosData = [
    { name: 'Nueva', value: eg.nueva ?? 0 },
    { name: 'En Proceso', value: eg.enProgreso ?? 0 },
    { name: 'Revisada', value: eg.revisada ?? 0 },
    { name: 'Archivada', value: eg.archivada ?? 0 },
  ]
  const tiposData = [
    { name: 'Anónimo', value: tipos.anonimo ?? 0 },
    { name: 'Persona Física', value: tipos.personaFisica ?? 0 },
    { name: 'Persona Jurídica', value: tipos.personaJuridica ?? 0 },
  ]
  const teamBars = (team ?? []).map(t => ({
    name: t?.inspector?.nombre ?? '—',
    Pendientes:  t?.pendientes ?? 0,
    Completadas: t?.completadas ?? 0,
    'Este mes':  t?.esteMes ?? 0,
    Total:       t?.totalInspecciones ?? 0,
  }))

  const ESTADO_COLS = ['#60a5fa','#f59e0b','#22c55e','#94a3b8']

  if (loading) return <div className="p-6">Cargando…</div>
  if (error)   return <div className="p-6 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle2 className="w-8 h-8" />
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Dashboard de Administración</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hola, <span className="font-medium">{displayUsername}</span>. Control personal y del equipo.
            </p>
          </div>
        </div>
        <Badge variant="secondary">{fallbackReady ? 'Mostrando datos locales' : 'Global'}</Badge>
      </div>

      {/* KPIs personales */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm"><Clock4 className="w-4 h-4" /> Pendientes</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.pendientes}</CardTitle></CardHeader></Card>
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm"><ClipboardList className="w-4 h-4" /> En Proceso</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.enProceso}</CardTitle></CardHeader></Card>
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm"><CheckCircle2 className="w-4 h-4" /> Revisadas</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.revisadas}</CardTitle></CardHeader></Card>
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="text-xs sm:text-sm">Este mes</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.esteMes}</CardTitle></CardHeader></Card>
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="text-xs sm:text-sm">Esta semana</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.estaSemana}</CardTitle></CardHeader></Card>
        <Card className="p-0"><CardHeader className="pb-2 p-4">
          <CardDescription className="text-xs sm:text-sm">Total personales</CardDescription>
          <CardTitle className="text-xl sm:text-2xl">{kpiPersonales.total}</CardTitle></CardHeader></Card>
      </div>

      {/* Estados y Tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Estados globales</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Nueva / En Proceso / Revisada / Archivada</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {estadosData.map((_, i) => <Cell key={i} fill={ESTADO_COLS[i % ESTADO_COLS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Tipos de aplicante</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribución por origen del trámite</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={tiposData} dataKey="value" nameKey="name" outerRadius="75%" label>
                    {tiposData.map((_, i) => <Cell key={i} fill={['#6366f1','#10b981','#f97316'][i % 3]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento equipo */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Rendimiento del equipo</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Pendientes vs Completadas vs Este mes</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {/* barras lado a lado (no apiladas) */}
              <BarChart data={teamBars} margin={{ right: 16 }} barCategoryGap="25%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pendientes"  fill="#f59e0b" />
                <Bar dataKey="Completadas" fill="#22c55e" />
                <Bar dataKey="Este mes"    fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inspecciones recientes */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Inspecciones recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Inspectores</th>
                  <th className="text-left p-3">Trámite</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{r.id ?? '—'}</td>
                    <td className="p-3">
                      {r.inspectionDate
                        ? new Date(r.inspectionDate).toLocaleDateString()
                        : r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">{r.status ?? '—'}</td>
                    <td className="p-3">{r.applicantType ?? '—'}</td>
                    <td className="p-3">{Array.isArray(r.inspectores) ? r.inspectores.join(', ') : '—'}</td>
                    <td className="p-3">{r.procedureNumber ?? '—'}</td>
                  </tr>
                ))}
                {recientes.length === 0 && (
                  <tr><td className="p-3" colSpan={6}>Sin registros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
