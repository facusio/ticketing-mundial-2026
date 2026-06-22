import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Entrada, EstadoEntrada } from '@/lib/types'
import { QrCode, ArrowRightLeft } from 'lucide-react'

const badgeVariant: Record<EstadoEntrada, 'green' | 'gold' | 'gray'> = {
  ACTIVA: 'green',
  TRANSFERIDA: 'gold',
  CONSUMIDA: 'gray',
}

const estadoLabel: Record<EstadoEntrada, string> = {
  ACTIVA: 'Activa',
  TRANSFERIDA: 'En transferencia',
  CONSUMIDA: 'Consumida',
}

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Entradas</h1>
          <p className="text-slate-400 mt-1">{entradas.length} entrada{entradas.length !== 1 ? 's' : ''} en total</p>
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
        <div className="space-y-8">
          {activas.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-green-400 mb-4">Entradas activas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activas.map((e) => (
                  <EntradaCard key={e.id} entrada={e} />
                ))}
              </div>
            </section>
          )}

          {otras.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-400 mb-4">Otras entradas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otras.map((e) => (
                  <EntradaCard key={e.id} entrada={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function EntradaCard({ entrada }: { entrada: Entrada }) {
  const isActiva = entrada.estado === 'ACTIVA'

  return (
    <Card className={`${isActiva ? 'hover:border-green-500/50' : 'opacity-75'} transition-all`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">
            {entrada.evento.equipoLocal} vs {entrada.evento.equipoVisitante}
          </CardTitle>
          <Badge variant={badgeVariant[entrada.estado]}>{estadoLabel[entrada.estado]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-sm text-slate-400">{entrada.evento.estadioNombre}</p>
        <p className="text-sm text-slate-400">{formatDate(entrada.evento.fechaHora)}</p>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700">
          <span className="text-slate-400">
            Sector <span className="text-green-400 font-medium">{entrada.sector.codigo}</span>
          </span>
          <span className="text-slate-300 font-medium">{formatCurrency(entrada.precio)}</span>
        </div>
        {entrada.transferenciasRealizadas > 0 && (
          <p className="text-xs text-amber-400">
            {entrada.transferenciasRealizadas}/3 transferencias realizadas
          </p>
        )}
        {isActiva && (
          <Link href={`/mis-entradas/${entrada.id}/qr`} className="block mt-3">
            <Button className="w-full" size="sm">
              <QrCode className="h-4 w-4" /> Ver QR
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
