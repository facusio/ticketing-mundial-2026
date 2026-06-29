'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Fase, EstadioAdmin, SectorAdmin } from '@/lib/types'
import { Plus, Trophy, DollarSign } from 'lucide-react'

interface FaseSectorPrecio {
  sectorId: number
  codigoSector: string
  precio: number
}

export default function FasesPage() {
  const [fases, setFases] = useState<Fase[]>([])
  const [estadios, setEstadios] = useState<EstadioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [openFase, setOpenFase] = useState(false)
  const [openPrecio, setOpenPrecio] = useState(false)
  const [faseForm, setFaseForm] = useState({ nombre: '', orden: '' })
  const [precioForm, setPrecioForm] = useState({ faseId: '', estadioId: '', sectorId: '', precio: '' })
  const [sectoresDisp, setSectoresDisp] = useState<SectorAdmin[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [fas, ests] = await Promise.all([
        api.get<Fase[]>('/api/admin/fases'),
        api.get<EstadioAdmin[]>('/api/admin/estadios'),
      ])
      setFases(fas)
      setEstadios(ests)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function loadSectores(estadioId: string) {
    try {
      const secs = await api.get<SectorAdmin[]>(`/api/admin/estadios/${estadioId}/sectores`)
      setSectoresDisp(secs)
    } catch {
      setSectoresDisp([])
    }
  }

  async function handleCrearFase() {
    if (!faseForm.nombre || !faseForm.orden) { setError('Completá todos los campos'); return }
    setSaving(true); setError('')
    try {
      await api.post('/api/admin/fases', { nombre: faseForm.nombre, orden: Number(faseForm.orden) })
      setOpenFase(false)
      setFaseForm({ nombre: '', orden: '' })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setSaving(false) }
  }

  async function handleCrearPrecio() {
    if (!precioForm.faseId || !precioForm.sectorId || !precioForm.precio) {
      setError('Completá todos los campos'); return
    }
    setSaving(true); setError('')
    try {
      await api.post(`/api/admin/fases/${precioForm.faseId}/precios`, {
        sectorId: Number(precioForm.sectorId),
        precio: Number(precioForm.precio),
      })
      setOpenPrecio(false)
      setPrecioForm({ faseId: '', estadioId: '', sectorId: '', precio: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Fases y Precios</h1>
          <p className="text-slate-600 mt-1">Gestión de fases del torneo y precios por sector</p>
        </div>
      </div>

      {/* Fases */}
      <Card>
        <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Fases del torneo
          </CardTitle>
          <Dialog open={openFase} onOpenChange={setOpenFase}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" /> Nueva fase</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Crear fase</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="nombreFase">Nombre</Label>
                  <Input id="nombreFase" value={faseForm.nombre} onChange={(e) => setFaseForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Grupos" />
                </div>
                <div>
                  <Label htmlFor="ordenFase">Orden</Label>
                  <Input id="ordenFase" type="number" value={faseForm.orden} onChange={(e) => setFaseForm((f) => ({ ...f, orden: e.target.value }))} placeholder="1" min={1} />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button className="w-full" onClick={handleCrearFase} loading={saving}>Crear fase</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-6 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#0066b2] border-t-transparent" />
            </div>
          ) : fases.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No hay fases registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fases.sort((a, b) => a.orden - b.orden).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-amber-400 font-bold">{f.orden}</TableCell>
                    <TableCell className="font-medium">{f.nombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Precios */}
      <Card>
        <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#0066b2]" /> Definir precio por sector-fase
          </CardTitle>
          <Dialog open={openPrecio} onOpenChange={(o) => { setOpenPrecio(o); setError('') }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4" /> Nuevo precio</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Definir precio</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Fase</Label>
                  <select
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0066b2]"
                    value={precioForm.faseId}
                    onChange={(e) => setPrecioForm((f) => ({ ...f, faseId: e.target.value }))}
                  >
                    <option value="">Seleccioná una fase</option>
                    {fases.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Estadio</Label>
                  <select
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0066b2]"
                    value={precioForm.estadioId}
                    onChange={(e) => {
                      setPrecioForm((f) => ({ ...f, estadioId: e.target.value, sectorId: '' }))
                      if (e.target.value) loadSectores(e.target.value)
                    }}
                  >
                    <option value="">Seleccioná un estadio</option>
                    {estadios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
                {sectoresDisp.length > 0 && (
                  <div>
                    <Label>Sector</Label>
                    <select
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0066b2]"
                      value={precioForm.sectorId}
                      onChange={(e) => setPrecioForm((f) => ({ ...f, sectorId: e.target.value }))}
                    >
                      <option value="">Seleccioná un sector</option>
                      {sectoresDisp.map((s) => <option key={s.id} value={s.id}>{s.codigo}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <Label htmlFor="precio">Precio (USD)</Label>
                  <Input id="precio" type="number" value={precioForm.precio} onChange={(e) => setPrecioForm((f) => ({ ...f, precio: e.target.value }))} placeholder="250.00" min={0} step="0.01" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button className="w-full" onClick={handleCrearPrecio} loading={saving}>Guardar precio</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-slate-400">
            Los precios definen cuánto cuesta cada sector durante una fase específica del torneo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
