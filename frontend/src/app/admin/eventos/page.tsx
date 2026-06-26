'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Evento, EstadioAdmin, Fase } from '@/lib/types'
import { Plus, Calendar } from 'lucide-react'

export default function AdminEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [estadios, setEstadios] = useState<EstadioAdmin[]>([])
  const [fases, setFases] = useState<Fase[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    estadioId: '',
    faseId: '',
    equipoLocal: '',
    equipoVisitante: '',
    fechaHora: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [evs, ests, fas] = await Promise.all([
        api.get<Evento[]>('/api/admin/eventos'),
        api.get<EstadioAdmin[]>('/api/admin/estadios'),
        api.get<Fase[]>('/api/admin/fases'),
      ])
      setEventos(evs)
      setEstadios(ests)
      setFases(fas)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function handleCreate() {
    if (!form.estadioId || !form.faseId || !form.equipoLocal || !form.equipoVisitante || !form.fechaHora) {
      setError('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/api/admin/eventos', {
        estadioId: Number(form.estadioId),
        faseId: Number(form.faseId),
        equipoLocal: form.equipoLocal,
        equipoVisitante: form.equipoVisitante,
        fechaHora: form.fechaHora,
      })
      setOpen(false)
      setForm({ estadioId: '', faseId: '', equipoLocal: '', equipoVisitante: '', fechaHora: '' })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear evento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Eventos</h1>
          <p className="text-slate-600 mt-1">Partidos del Mundial 2026</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Nuevo evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Estadio</Label>
                <Select value={form.estadioId} onValueChange={(v) => setForm((f) => ({ ...f, estadioId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná un estadio" /></SelectTrigger>
                  <SelectContent>
                    {estadios.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nombre} — {e.ciudad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fase</Label>
                <Select value={form.faseId} onValueChange={(v) => setForm((f) => ({ ...f, faseId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná una fase" /></SelectTrigger>
                  <SelectContent>
                    {fases.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local">Equipo local</Label>
                  <Input id="local" value={form.equipoLocal} onChange={(e) => setForm((f) => ({ ...f, equipoLocal: e.target.value }))} placeholder="Argentina" />
                </div>
                <div>
                  <Label htmlFor="visit">Equipo visitante</Label>
                  <Input id="visit" value={form.equipoVisitante} onChange={(e) => setForm((f) => ({ ...f, equipoVisitante: e.target.value }))} placeholder="Brasil" />
                </div>
              </div>
              <div>
                <Label htmlFor="fecha">Fecha y hora</Label>
                <Input id="fecha" type="datetime-local" value={form.fechaHora} onChange={(e) => setForm((f) => ({ ...f, fechaHora: e.target.value }))} />
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              <Button className="w-full" onClick={handleCreate} loading={saving}>Crear evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-400" /> Lista de eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
            </div>
          ) : eventos.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No hay eventos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partido</TableHead>
                  <TableHead>Estadio</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">
                      {ev.equipoLocal} vs {ev.equipoVisitante}
                    </TableCell>
                    <TableCell className="text-slate-400">{ev.estadio.nombre}</TableCell>
                    <TableCell className="text-slate-400">{ev.fase.nombre}</TableCell>
                    <TableCell className="text-slate-400">{formatDate(ev.fechaHora)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
