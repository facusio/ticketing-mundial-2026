import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Entrada, Transferencia, Evento } from '@/lib/types'
import { Ticket, Calendar, ArrowRightLeft, ShoppingCart } from 'lucide-react'

async function fetchData<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`http://localhost:8080${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value ?? ''

  const [entradas, transferencias, eventos] = await Promise.all([
    fetchData<Entrada[]>('/api/usuario/entradas', token),
    fetchData<Transferencia[]>('/api/usuario/transferencias/recibidas', token),
    fetchData<Evento[]>('/api/usuario/eventos', token),
  ])

  const entradasActivas = (entradas ?? []).filter((e) => e.estado === 'ACTIVA')
  const transferenciasPendientes = transferencias ?? []
  const proximosEventos = (eventos ?? []).slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Mi Dashboard</h1>
      <p className="text-slate-600 mb-6">Bienvenido al Mundial 2026</p>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/eventos">
          <Card className="hover:border-[#0066b2]/50 hover:bg-blue-50 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
              <ShoppingCart className="h-8 w-8 text-[#0066b2]" />
              <span className="text-sm font-medium text-slate-700">Comprar entradas</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/mis-entradas">
          <Card className="hover:border-[#0066b2]/50 hover:bg-blue-50 transition-all cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
              <Ticket className="h-8 w-8 text-[#0066b2]" />
              <span className="text-sm font-medium text-slate-700">Ver mis entradas</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {proximosEventos.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay eventos próximos disponibles.</p>
            ) : (
              proximosEventos.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/eventos/${ev.id}`}
                  className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">
                      {ev.equipoLocal} vs {ev.equipoVisitante}
                    </span>
                    <Badge variant="blue">{ev.fase.nombre}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {ev.estadio.nombre} · {formatDate(ev.fechaHora)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stats + info */}
        <div className="space-y-4">
          {transferenciasPendientes.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowRightLeft className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold text-amber-800">
                    Tenés {transferenciasPendientes.length} transferencia
                    {transferenciasPendientes.length > 1 ? 's' : ''} pendiente
                    {transferenciasPendientes.length > 1 ? 's' : ''}
                  </p>
                </div>
                <Link href="/transferir" className="text-sm text-amber-700 hover:text-amber-800 underline">
                  Revisar transferencias →
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-4 px-3 gap-1">
                <Ticket className="h-5 w-5 text-[#0066b2]" />
                <p className="text-xl font-bold text-slate-800">{entradasActivas.length}</p>
                <p className="text-xs text-[#0066b2] text-center leading-tight">Entradas activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-4 px-3 gap-1">
                <ArrowRightLeft className="h-5 w-5 text-amber-500" />
                <p className="text-xl font-bold text-slate-800">{transferenciasPendientes.length}</p>
                <p className="text-xs text-amber-500 text-center leading-tight">Transferencias</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-4 px-3 gap-1">
                <Calendar className="h-5 w-5 text-[#0066b2]" />
                <p className="text-xl font-bold text-slate-800">{(eventos ?? []).length}</p>
                <p className="text-xs text-slate-500 text-center leading-tight">Próx. eventos</p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas entradas activas */}
          {entradasActivas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mis entradas activas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {entradasActivas.slice(0, 3).map((e) => (
                  <Link
                    key={e.id}
                    href={`/mis-entradas/${e.id}/qr`}
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">
                        {e.evento.equipoLocal} vs {e.evento.equipoVisitante}
                      </span>
                      <Badge variant="blue">{e.sector.codigo}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {e.evento.estadioNombre} · {formatCurrency(e.precio)} · Ver QR →
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
