'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Evento, PrecioSector } from '@/lib/types'
import { MapPin, Calendar, ShoppingCart, ChevronLeft, Plus, Minus } from 'lucide-react'

export default function EventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [precios, setPrecios] = useState<PrecioSector[]>([])
  const [cantidades, setCantidades] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [comprandoEvento, setComprandoEvento] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [ev, pr] = await Promise.all([
          api.get<Evento[]>('/api/usuario/eventos'),
          api.get<PrecioSector[]>(`/api/usuario/eventos/${id}/precios`),
        ])
        const found = (ev as Evento[]).find((e) => e.id === Number(id))
        setEvento(found ?? null)
        setPrecios(pr)
      } catch {
        setError('Error cargando el evento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const totalEntradas = Object.values(cantidades).reduce((a, b) => a + b, 0)
  const totalPrice = precios.reduce((acc, p) => acc + p.precio * (cantidades[p.sectorId] ?? 0), 0)

  function increment(sectorId: number) {
    if (totalEntradas >= 5) return
    setCantidades((prev) => ({ ...prev, [sectorId]: (prev[sectorId] ?? 0) + 1 }))
  }

  function decrement(sectorId: number) {
    setCantidades((prev) => {
      const curr = prev[sectorId] ?? 0
      if (curr <= 0) return prev
      return { ...prev, [sectorId]: curr - 1 }
    })
  }

  async function handleComprar() {
    const items = precios
      .filter((p) => (cantidades[p.sectorId] ?? 0) > 0)
      .map((p) => ({ sectorId: p.sectorId, cantidad: cantidades[p.sectorId] }))

    if (items.length === 0) {
      setError('Seleccioná al menos una entrada')
      return
    }

    setError('')
    setComprandoEvento(true)
    try {
      await api.post('/api/usuario/ventas', { eventoId: Number(id), items })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la compra')
    } finally {
      setComprandoEvento(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0066b2] border-t-transparent" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-[#4da3e8] mb-2">¡Compra exitosa!</h1>
        <p className="text-slate-400 mb-6">
          Tus entradas fueron procesadas. Podés verlas en &quot;Mis Entradas&quot;.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/mis-entradas">
            <Button variant="gold" size="lg">Ver mis entradas</Button>
          </Link>
          <Link href="/eventos">
            <Button variant="outline" size="lg">Ver más eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-400">Evento no encontrado.</p>
        <Link href="/eventos"><Button variant="outline" className="mt-4"><ChevronLeft className="h-4 w-4" /> Volver</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/eventos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Volver a eventos
      </Link>

      {/* Event header */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="blue">{evento.fase.nombre}</Badge>
          </div>
          <div className="flex items-center justify-center gap-6 my-4">
            <span className="text-2xl md:text-3xl font-bold text-white">{evento.equipoLocal}</span>
            <span className="text-3xl font-bold text-[#4da3e8]">VS</span>
            <span className="text-2xl md:text-3xl font-bold text-white">{evento.equipoVisitante}</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#4da3e8]" />
              {evento.estadio.nombre} — {evento.estadio.ciudad}, {evento.estadio.pais}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#4da3e8]" />
              {formatDate(evento.fechaHora)}
            </div>
          </div>
        </div>
      </Card>

      {/* Sector prices */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccioná tus entradas</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            Podés comprar hasta 5 entradas en total.{' '}
            {totalEntradas > 0 && (
              <span className="text-[#4da3e8] font-medium">{totalEntradas}/5 seleccionadas</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {precios.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay precios disponibles para este evento.</p>
          ) : (
            precios.map((precio, i) => {
              const cant = cantidades[precio.sectorId] ?? 0
              const hoverColors = ['hbc-green', 'hbc-blue', 'hbc-red']
              return (
                <div
                  key={precio.sectorId}
                  className={`flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 transition-colors ${hoverColors[i % 3]}`}
                >
                  <div>
                    <p className="font-semibold text-slate-800">Sector {precio.codigoSector}</p>
                    <p className="text-sm text-slate-500">
                      Capacidad: {precio.capacidadMaxima.toLocaleString()} · {formatCurrency(precio.precio)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decrement(precio.sectorId)}
                      disabled={cant === 0}
                      className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-800">{cant}</span>
                    <button
                      onClick={() => increment(precio.sectorId)}
                      disabled={totalEntradas >= 5}
                      className="p-1 rounded-full text-slate-500 hover:text-[#0066b2] hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
        {totalEntradas > 0 && (
          <CardFooter className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(totalPrice * 1.05)}{' '}
                <span className="text-xs text-slate-500 font-normal">(+5% comisión)</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button onClick={handleComprar} loading={comprandoEvento} size="lg" variant="gold" className="w-full sm:w-auto">
                <ShoppingCart className="h-4 w-4" />
                Comprar {totalEntradas} entrada{totalEntradas > 1 ? 's' : ''}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
