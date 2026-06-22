import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Evento } from '@/lib/types'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'

export default async function EventosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value ?? ''

  let eventos: Evento[] = []
  try {
    const res = await fetch('http://localhost:8080/api/usuario/eventos', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) eventos = await res.json()
  } catch { /* ignore */ }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Eventos disponibles</h1>
      <p className="text-slate-400 mb-8">Seleccioná un partido para ver precios y comprar entradas</p>

      {eventos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">⚽</div>
            <p className="text-slate-400">No hay eventos disponibles en este momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((ev) => (
            <Link key={ev.id} href={`/eventos/${ev.id}`}>
              <Card className="hover:border-green-500/50 hover:shadow-green-500/5 hover:shadow-xl transition-all cursor-pointer group h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="blue">{ev.fase.nombre}</Badge>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-3 my-4">
                      <span className="text-lg font-bold text-white">{ev.equipoLocal}</span>
                      <span className="text-slate-500 font-bold">vs</span>
                      <span className="text-lg font-bold text-white">{ev.equipoVisitante}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>{ev.estadio.nombre} — {ev.estadio.ciudad}, {ev.estadio.pais}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>{formatDate(ev.fechaHora)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
