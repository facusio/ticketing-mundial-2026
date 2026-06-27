'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { EstadioAdmin } from '@/lib/types'
import { Plus, Building2, MapPin, ChevronRight } from 'lucide-react'

export default function AdminEstadiosPage() {
  const [estadios, setEstadios] = useState<EstadioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', pais: '', ciudad: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<EstadioAdmin[]>('/api/admin/estadios')
      setEstadios(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { reload() }, [reload])

  async function handleCreate() {
    if (!form.nombre || !form.pais || !form.ciudad) {
      setError('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/api/admin/estadios', form)
      setOpen(false)
      setForm({ nombre: '', pais: '', ciudad: '' })
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear estadio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Estadios</h1>
          <p className="text-slate-600 mt-1">Gestionar estadios y sus sectores</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Nuevo estadio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear estadio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Estadio Monumental"
                />
              </div>
              <div>
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={form.pais}
                  onChange={(e) => setForm((f) => ({ ...f, pais: e.target.value }))}
                  placeholder="Argentina"
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={form.ciudad}
                  onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                  placeholder="Buenos Aires"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleCreate} loading={saving}>
                Crear estadio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0066b2] border-t-transparent" />
        </div>
      ) : estadios.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tenés estadios registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {estadios.map((est) => (
            <Link key={est.id} href={`/admin/estadios/${est.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
              <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                <Building2 className="h-5 w-5 text-[#0066b2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 group-hover:text-[#0066b2] transition-colors truncate">
                  {est.nombre}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {est.ciudad}, {est.pais}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0066b2] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
