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
      <h1 className="text-3xl font-bold text-white mb-2">Mi Dashboard</h1>
      <p className="text-slate-400 mb-8">Bienvenido al Mundial 2026</p>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Ticket className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-300">Entradas activas</p>
              <p className="text-2xl font-bold text-white">{entradasActivas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-300">Transferencias pendientes</p>
              <p className="text-2xl font-bold text-white">{transferenciasPendientes.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-300">Próximos eventos</p>
              <p className="text-2xl font-bold text-white">{(eventos ?? []).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximos Eventos</CardTitle>
            <Link href="/eventos" className="text-sm text-green-400 hover:text-green-300">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {proximosEventos.length === 0 ? (
              <p className="text-slate-400 text-sm">No hay eventos próximos disponibles.</p>
            ) : (
              proximosEventos.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/eventos/${ev.id}`}
                  className="block p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      {ev.equipoLocal} vs {ev.equipoVisitante}
                    </span>
                    <Badge variant="blue">{ev.fase.nombre}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {ev.estadio.nombre} · {formatDate(ev.fechaHora)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Accesos rápidos */}
        <div className="space-y-4">
          {transferenciasPendientes.length > 0 && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowRightLeft className="h-5 w-5 text-amber-400" />
                  <p className="font-semibold text-amber-300">
                    Tenés {transferenciasPendientes.length} transferencia
                    {transferenciasPendientes.length > 1 ? 's' : ''} pendiente
                    {transferenciasPendientes.length > 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href="/transferir"
                  className="text-sm text-amber-400 hover:text-amber-300 underline"
                >
                  Revisar transferencias →
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Link href="/eventos">
              <Card className="hover:border-green-500/50 hover:bg-slate-700/50 transition-all cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
                  <ShoppingCart className="h-8 w-8 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">Comprar entradas</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/mis-entradas">
              <Card className="hover:border-green-500/50 hover:bg-slate-700/50 transition-all cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
                  <Ticket className="h-8 w-8 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">Ver mis entradas</span>
                </CardContent>
              </Card>
            </Link>
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
                    className="block p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {e.evento.equipoLocal} vs {e.evento.equipoVisitante}
                      </span>
                      <Badge variant="green">{e.sector.codigo}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
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
