'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <h1 className="text-3xl font-bold text-white">Estadios</h1>
          <p className="text-slate-400 mt-1">Gestionar estadios y sus sectores</p>
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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
        </div>
      ) : estadios.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tenés estadios registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {estadios.map((est) => (
            <Link key={est.id} href={`/admin/estadios/${est.id}`}>
              <Card className="hover:border-green-500/40 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                        {est.nombre}
                      </h3>
                      <div className="flex items-center gap-1 mt-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4" />
                        {est.ciudad}, {est.pais}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-green-400 transition-colors mt-1" />
                  </div>
                  <p className="text-xs text-slate-500 mt-3">Ver sectores →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
