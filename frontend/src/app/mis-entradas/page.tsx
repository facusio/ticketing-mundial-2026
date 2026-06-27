import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Entrada, EstadoEntrada } from '@/lib/types'
import { QrCode, ArrowRightLeft, MapPin, Calendar } from 'lucide-react'

const badgeVariant: Record<EstadoEntrada, 'blue' | 'gold' | 'gray'> = {
  ACTIVA: 'blue',
  TRANSFERIDA: 'gold',
  CONSUMIDA: 'gray',
}

const estadoLabel: Record<EstadoEntrada, string> = {
  ACTIVA: 'Activa',
  TRANSFERIDA: 'En transferencia',
  CONSUMIDA: 'Consumida',
}

const HOVER_COLORS = ['hbc-green', 'hbc-blue', 'hbc-red']

export default async function MisEntradasPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value ?? ''

  let entradas: Entrada[] = []
  try {
    const res = await fetch('http://localhost:8080/api/usuario/entradas', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) entradas = await res.json()
  } catch { /* ignore */ }

  const activas = entradas.filter((e) => e.estado === 'ACTIVA')
  const otras = entradas.filter((e) => e.estado !== 'ACTIVA')

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mis Entradas</h1>
          <p className="text-slate-600 mt-1">{entradas.length} entrada{entradas.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/transferir">
          <Button variant="outline">
            <ArrowRightLeft className="h-4 w-4" /> Transferencias
          </Button>
        </Link>
      </div>

      {entradas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No tenés entradas todavía.</p>
            <Link href="/eventos">
              <Button variant="gold">Explorar eventos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activas.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#0066b2] uppercase tracking-wider mb-3">Entradas activas</h2>
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                {activas.map((e, i) => (
                  <EntradaRow key={e.id} entrada={e} hoverColor={HOVER_COLORS[i % 3]} />
                ))}
              </div>
            </section>
          )}

          {otras.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Otras entradas</h2>
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden opacity-75">
                {otras.map((e, i) => (
                  <EntradaRow key={e.id} entrada={e} hoverColor={HOVER_COLORS[i % 3]} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function EntradaRow({ entrada, hoverColor }: { entrada: Entrada; hoverColor: string }) {
  const isActiva = entrada.estado === 'ACTIVA'

  return (
    <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${isActiva ? `hover:bg-slate-50 ${hoverColor}` : ''}`}>
      {/* Partido */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">
          {entrada.evento.equipoLocal} <span className="text-slate-400 font-normal">vs</span> {entrada.evento.equipoVisitante}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#0066b2]" />{entrada.evento.estadioNombre}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-[#0066b2]" />{formatDate(entrada.evento.fechaHora)}
          </span>
        </div>
      </div>

      {/* Sector + precio */}
      <div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
        <span className="text-slate-400">
          Sector <span className="text-[#0066b2] font-medium">{entrada.sector.codigo}</span>
        </span>
        <span className="font-semibold text-slate-700">{formatCurrency(entrada.precio)}</span>
      </div>

      {/* Transferencias realizadas */}
      {entrada.transferenciasRealizadas > 0 && (
        <span className="hidden md:inline text-xs text-amber-500 shrink-0">
          {entrada.transferenciasRealizadas}/3 transf.
        </span>
      )}

      {/* Badge o botón QR */}
      <div className="shrink-0">
        {isActiva ? (
          <Link href={`/mis-entradas/${entrada.id}/qr`}>
            <Button size="sm">
              <QrCode className="h-4 w-4" /> Ver QR
            </Button>
          </Link>
        ) : (
          <Badge variant={badgeVariant[entrada.estado]}>{estadoLabel[entrada.estado]}</Badge>
        )}
      </div>
    </div>
  )
}
