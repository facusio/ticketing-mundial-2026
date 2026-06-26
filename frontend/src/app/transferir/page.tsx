'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Entrada, Transferencia } from '@/lib/types'
import { ArrowRightLeft, Check, X, Send } from 'lucide-react'
import { LoadingBall } from '@/components/loading-ball'

export default function TransferirPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [recibidas, setRecibidas] = useState<Transferencia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntrada, setSelectedEntrada] = useState<Entrada | null>(null)
  const [destMail, setDestMail] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [ent, rec] = await Promise.all([
        api.get<Entrada[]>('/api/usuario/entradas'),
        api.get<Transferencia[]>('/api/usuario/transferencias/recibidas'),
      ])
      setEntradas(ent)
      setRecibidas(rec)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, [reload])

  const transferibles = entradas.filter(
    (e) => e.estado === 'ACTIVA' && e.transferenciasRealizadas < 3,
  )

  async function handleTransferir() {
    if (!selectedEntrada || !destMail) return
    setTransferError('')
    setTransferLoading(true)
    try {
      await api.post('/api/usuario/transferencias', {
        entradaId: selectedEntrada.id,
        destinoMail: destMail,
      })
      setDialogOpen(false)
      setDestMail('')
      setSelectedEntrada(null)
      setActionMsg('Transferencia enviada correctamente')
      reload()
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Error al transferir')
    } finally {
      setTransferLoading(false)
    }
  }

  async function handleAction(id: number, accion: 'aceptar' | 'rechazar') {
    try {
      await api.post(`/api/usuario/transferencias/${id}/${accion}`)
      setActionMsg(accion === 'aceptar' ? 'Transferencia aceptada' : 'Transferencia rechazada')
      reload()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Error al procesar')
    }
  }

  if (loading) {
    return <LoadingBall />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Transferencias</h1>
        <p className="text-slate-600">Transferí entradas a otros usuarios o gestioná las que recibiste</p>
      </div>

      {actionMsg && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400 flex items-center justify-between">
          {actionMsg}
          <button onClick={() => setActionMsg('')} className="text-green-600 hover:text-green-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Recibidas */}
      {recibidas.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-amber-400" />
              Transferencias recibidas
              <Badge variant="gold">{recibidas.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {recibidas.map((t) => (
              <div key={t.id} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {t.evento.equipoLocal} vs {t.evento.equipoVisitante}
                    </p>
                    <p className="text-sm text-slate-400">
                      De: <span className="text-amber-400">{t.origen.mail}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(t.fechaHora)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(t.id, 'aceptar')}>
                      <Check className="h-4 w-4" /> Aceptar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(t.id, 'rechazar')}>
                      <X className="h-4 w-4" /> Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mis entradas transferibles */}
      <Card>
        <CardHeader>
          <CardTitle>Mis entradas transferibles</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            Solo entradas activas con menos de 3 transferencias
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {transferibles.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No tenés entradas disponibles para transferir.</p>
          ) : (
            <div className="space-y-3">
              {transferibles.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {e.evento.equipoLocal} vs {e.evento.equipoVisitante}
                    </p>
                    <p className="text-xs text-slate-400">
                      {e.evento.estadioNombre} · {e.sector.codigo} · {formatCurrency(e.precio)}
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      {e.transferenciasRealizadas}/3 transferencias
                    </p>
                  </div>
                  <Dialog open={dialogOpen && selectedEntrada?.id === e.id} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (open) { setSelectedEntrada(e); setTransferError('') }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4" /> Transferir
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transferir entrada</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <p className="text-sm text-slate-400">
                          {e.evento.equipoLocal} vs {e.evento.equipoVisitante} — Sector {e.sector.codigo}
                        </p>
                        <div>
                          <Label htmlFor="destMail">Mail del destinatario</Label>
                          <Input
                            id="destMail"
                            type="email"
                            placeholder="destinatario@email.com"
                            value={destMail}
                            onChange={(ev) => setDestMail(ev.target.value)}
                          />
                        </div>
                        {transferError && (
                          <p className="text-sm text-red-400">{transferError}</p>
                        )}
                        <div className="flex gap-3">
                          <Button
                            className="flex-1"
                            onClick={handleTransferir}
                            loading={transferLoading}
                            disabled={!destMail}
                          >
                            <Send className="h-4 w-4" /> Enviar transferencia
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
