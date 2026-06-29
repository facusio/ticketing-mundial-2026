import { cookies } from 'next/headers'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Evento } from '@/lib/types'
import { MapPin, Calendar, ChevronRight, ChevronLeft } from 'lucide-react'

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
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Inicio
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 mb-2">Eventos disponibles</h1>
      <p className="text-slate-600 mb-8">Seleccioná un partido para ver precios y comprar entradas</p>

      {eventos.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-20 w-auto mx-auto mb-4" />
          <p className="text-slate-400">No hay eventos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {eventos.map((ev) => (
            <Link key={ev.id} href={`/eventos/${ev.id}`} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
              <Badge variant="blue" className="shrink-0 whitespace-nowrap w-fit">{ev.fase.nombre}</Badge>
              <span className="font-semibold text-slate-800 min-w-0 sm:flex-1">
                {ev.equipoLocal} <span className="text-slate-400 font-normal">vs</span> {ev.equipoVisitante}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#0066b2]" />
                  {ev.estadio.nombre} — {ev.estadio.ciudad}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#0066b2]" />
                  {formatDate(ev.fechaHora)}
                </span>
              </div>
              <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300 group-hover:text-[#0066b2] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
