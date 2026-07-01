'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import type { EstadioAdmin, SectorAdmin, FuncionarioAdmin } from '@/lib/types'
import { ChevronLeft, Plus, Layers, X } from 'lucide-react'

export default function EstadioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [estadios, setEstadios] = useState<EstadioAdmin[]>([])
  const [sectores, setSectores] = useState<SectorAdmin[]>([])
  const [funcionarios, setFuncionarios] = useState<FuncionarioAdmin[]>([])
  const [asignaciones, setAsignaciones] = useState<Record<number, FuncionarioAdmin[]>>({})
  const [seleccionado, setSeleccionado] = useState<Record<number, string>>({})
  const [asignarError, setAsignarError] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ codigo: '', capacidadMaxima: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const estadio = estadios.find((e) => e.id === Number(id))

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [ests, secs, funcs] = await Promise.all([
        api.get<EstadioAdmin[]>('/api/admin/estadios'),
        api.get<SectorAdmin[]>(`/api/admin/estadios/${id}/sectores`).catch(() => []),
        api.get<FuncionarioAdmin[]>('/api/admin/funcionarios').catch(() => []),
      ])
      setEstadios(ests)
      setSectores(secs)
      setFuncionarios(funcs)

      const asignadosPorSector = await Promise.all(
        secs.map((s) =>
          api.get<FuncionarioAdmin[]>(`/api/admin/sectores/${s.id}/funcionarios`).catch(() => []),
        ),
      )
      setAsignaciones(
        Object.fromEntries(secs.map((s, i) => [s.id, asignadosPorSector[i]])),
      )
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { reload() }, [reload])

  function funcionariosDisponibles(sectorId: number) {
    const asignadosIds = new Set((asignaciones[sectorId] ?? []).map((f) => f.id))
    return funcionarios.filter((f) => !asignadosIds.has(f.id))
  }

  async function handleAssign(sectorId: number) {
    const funcionarioId = seleccionado[sectorId]
    if (!funcionarioId) return
    setAsignarError((e) => ({ ...e, [sectorId]: '' }))
    try {
      await api.post(`/api/admin/sectores/${sectorId}/funcionarios/${funcionarioId}`)
      setSeleccionado((sel) => ({ ...sel, [sectorId]: '' }))
      reload()
    } catch (err) {
      setAsignarError((e) => ({
        ...e,
        [sectorId]: err instanceof Error ? err.message : 'Error al asignar funcionario',
      }))
    }
  }

  async function handleUnassign(sectorId: number, funcionarioId: number) {
    setAsignarError((e) => ({ ...e, [sectorId]: '' }))
    try {
      await api.delete(`/api/admin/sectores/${sectorId}/funcionarios/${funcionarioId}`)
      reload()
    } catch (err) {
      setAsignarError((e) => ({
        ...e,
        [sectorId]: err instanceof Error ? err.message : 'Error al quitar funcionario',
      }))
    }
  }

  async function handleCreate() {
    if (!form.codigo || !form.capacidadMaxima) {
      setError('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post(`/api/admin/estadios/${id}/sectores`, {
        codigo: form.codigo,
        capacidadMaxima: Number(form.capacidadMaxima),
      })
      setOpen(false)
      setForm({ codigo: '', capacidadMaxima: '' })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear sector')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/estadios" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Estadios
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{estadio?.nombre ?? 'Estadio'}</h1>
          {estadio && (
            <p className="text-slate-600 mt-1">{estadio.ciudad}, {estadio.pais}</p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Nuevo sector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear sector</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="codigo">Código de sector</Label>
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                  placeholder="PLT-A"
                />
              </div>
              <div>
                <Label htmlFor="cap">Capacidad máxima</Label>
                <Input
                  id="cap"
                  type="number"
                  value={form.capacidadMaxima}
                  onChange={(e) => setForm((f) => ({ ...f, capacidadMaxima: e.target.value }))}
                  placeholder="5000"
                  min={1}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleCreate} loading={saving}>
                Crear sector
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-slate-400" /> Sectores
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#0066b2] border-t-transparent" />
            </div>
          ) : sectores.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No hay sectores registrados en este estadio.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Capacidad máxima</TableHead>
                  <TableHead>Funcionarios asignados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-[#0066b2]">{s.codigo}</TableCell>
                    <TableCell>{s.capacidadMaxima.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {(asignaciones[s.id] ?? []).length === 0 ? (
                            <span className="text-xs text-slate-400">Sin funcionarios asignados</span>
                          ) : (
                            (asignaciones[s.id] ?? []).map((f) => (
                              <Badge key={f.id} variant="blue" className="gap-1">
                                {f.mail}
                                <button
                                  type="button"
                                  onClick={() => handleUnassign(s.id, f.id)}
                                  aria-label={`Quitar ${f.mail}`}
                                  className="hover:text-red-400"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={seleccionado[s.id] ?? ''}
                            onValueChange={(v) => setSeleccionado((sel) => ({ ...sel, [s.id]: v }))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Agregar funcionario" />
                            </SelectTrigger>
                            <SelectContent>
                              {funcionariosDisponibles(s.id).map((f) => (
                                <SelectItem key={f.id} value={String(f.id)}>{f.mail}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!seleccionado[s.id]}
                            onClick={() => handleAssign(s.id)}
                          >
                            Asignar
                          </Button>
                        </div>
                        {asignarError[s.id] && (
                          <p className="text-xs text-red-400">{asignarError[s.id]}</p>
                        )}
                      </div>
                    </TableCell>
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
