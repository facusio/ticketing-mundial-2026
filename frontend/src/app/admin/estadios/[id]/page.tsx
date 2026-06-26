'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import type { EstadioAdmin, SectorAdmin } from '@/lib/types'
import { ChevronLeft, Plus, Layers } from 'lucide-react'

export default function EstadioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [estadios, setEstadios] = useState<EstadioAdmin[]>([])
  const [sectores, setSectores] = useState<SectorAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ codigo: '', capacidadMaxima: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const estadio = estadios.find((e) => e.id === Number(id))

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [ests, secs] = await Promise.all([
        api.get<EstadioAdmin[]>('/api/admin/estadios'),
        api.get<SectorAdmin[]>(`/api/admin/estadios/${id}/sectores`).catch(() => []),
      ])
      setEstadios(ests)
      setSectores(secs)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { reload() }, [reload])

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

      <div className="flex items-center justify-between mb-8">
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
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
            </div>
          ) : sectores.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">No hay sectores registrados en este estadio.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Capacidad máxima</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-green-400">{s.codigo}</TableCell>
                    <TableCell>{s.capacidadMaxima.toLocaleString()}</TableCell>
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
