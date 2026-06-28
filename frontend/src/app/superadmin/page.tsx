'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { ShieldCheck, UserPlus, Briefcase } from 'lucide-react'

interface UsuarioCreadoResponse {
  id: number
  mail: string
  rol: string
}

const emptyBase = {
  mail: '',
  password: '',
  paisDoc: '',
  tipoDoc: 'CI',
  numeroDoc: '',
  paisDir: '',
  localidad: '',
  calle: '',
  numeroDir: '',
  codigoPostal: '',
  telefono: '',
}

export default function SuperAdminPage() {
  const [adminForm, setAdminForm] = useState({ ...emptyBase, paisJurisdiccion: '' })
  const [funcForm, setFuncForm] = useState({ ...emptyBase, numeroLegajo: '' })
  const [adminMsg, setAdminMsg] = useState('')
  const [funcMsg, setFuncMsg] = useState('')
  const [adminError, setAdminError] = useState('')
  const [funcError, setFuncError] = useState('')
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [savingFunc, setSavingFunc] = useState(false)

  function updateAdmin(key: string, value: string) {
    setAdminForm((f) => ({ ...f, [key]: value }))
  }

  function updateFunc(key: string, value: string) {
    setFuncForm((f) => ({ ...f, [key]: value }))
  }

  async function handleCrearAdmin() {
    const { telefono, ...rest } = adminForm
    if (Object.values(rest).some((v) => !v.trim()) || !telefono.trim()) {
      setAdminError('Completá todos los campos')
      return
    }
    setSavingAdmin(true)
    setAdminError('')
    setAdminMsg('')
    try {
      const res = await api.post<UsuarioCreadoResponse>('/api/superadmin/admins-pais', {
        ...rest,
        telefonos: [{ numero: telefono }],
      })
      setAdminMsg(`Admin creado: ${res.mail} (ID ${res.id})`)
      setAdminForm({ ...emptyBase, paisJurisdiccion: '' })
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Error al crear admin')
    } finally {
      setSavingAdmin(false)
    }
  }

  async function handleCrearFuncionario() {
    const { telefono, ...rest } = funcForm
    if (Object.values(rest).some((v) => !v.trim()) || !telefono.trim()) {
      setFuncError('Completá todos los campos')
      return
    }
    setSavingFunc(true)
    setFuncError('')
    setFuncMsg('')
    try {
      const res = await api.post<UsuarioCreadoResponse>('/api/superadmin/funcionarios', {
        ...rest,
        telefonos: [{ numero: telefono }],
      })
      setFuncMsg(`Funcionario creado: ${res.mail} (ID ${res.id})`)
      setFuncForm({ ...emptyBase, numeroLegajo: '' })
    } catch (err) {
      setFuncError(err instanceof Error ? err.message : 'Error al crear funcionario')
    } finally {
      setSavingFunc(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl font-bold text-white">Panel SuperAdmin</h1>
      </div>
      <p className="text-slate-400 mb-10">Gestión global del sistema — Mundial 2026</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crear Admin País */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              Crear Admin País
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {[
              { key: 'mail', label: 'Mail', type: 'email', placeholder: 'admin@pais.com' },
              { key: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres' },
              { key: 'paisDoc', label: 'País del documento', placeholder: 'Argentina' },
              { key: 'tipoDoc', label: 'Tipo de documento', placeholder: 'CI / DNI / Pasaporte' },
              { key: 'numeroDoc', label: 'Número de documento', placeholder: '12345678' },
              { key: 'paisDir', label: 'País de residencia', placeholder: 'Argentina' },
              { key: 'localidad', label: 'Localidad', placeholder: 'Buenos Aires' },
              { key: 'calle', label: 'Calle', placeholder: 'Av. Corrientes' },
              { key: 'numeroDir', label: 'Número', placeholder: '1234' },
              { key: 'codigoPostal', label: 'Código postal', placeholder: 'C1043' },
              { key: 'paisJurisdiccion', label: 'País de jurisdicción', placeholder: 'Argentina' },
              { key: 'telefono', label: 'Teléfono', placeholder: '+54 11 1234 5678' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <Label htmlFor={`admin-${key}`}>{label}</Label>
                <Input
                  id={`admin-${key}`}
                  type={type ?? 'text'}
                  value={(adminForm as Record<string, string>)[key] ?? ''}
                  onChange={(e) => updateAdmin(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
            {adminError && <p className="text-sm text-red-400">{adminError}</p>}
            {adminMsg && <p className="text-sm text-green-400">{adminMsg}</p>}
            <Button className="w-full" onClick={handleCrearAdmin} loading={savingAdmin}>
              Crear Admin País
            </Button>
          </CardContent>
        </Card>

        {/* Crear Funcionario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-400" />
              Crear Funcionario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {[
              { key: 'mail', label: 'Mail', type: 'email', placeholder: 'func@mundial.com' },
              { key: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 8 caracteres' },
              { key: 'paisDoc', label: 'País del documento', placeholder: 'Uruguay' },
              { key: 'tipoDoc', label: 'Tipo de documento', placeholder: 'CI / DNI / Pasaporte' },
              { key: 'numeroDoc', label: 'Número de documento', placeholder: '99999999' },
              { key: 'paisDir', label: 'País de residencia', placeholder: 'Uruguay' },
              { key: 'localidad', label: 'Localidad', placeholder: 'Montevideo' },
              { key: 'calle', label: 'Calle', placeholder: '18 de Julio' },
              { key: 'numeroDir', label: 'Número', placeholder: '1000' },
              { key: 'codigoPostal', label: 'Código postal', placeholder: '11200' },
              { key: 'numeroLegajo', label: 'Número de legajo', placeholder: 'LEG-002' },
              { key: 'telefono', label: 'Teléfono', placeholder: '+598 99 999 999' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <Label htmlFor={`func-${key}`}>{label}</Label>
                <Input
                  id={`func-${key}`}
                  type={type ?? 'text'}
                  value={(funcForm as Record<string, string>)[key] ?? ''}
                  onChange={(e) => updateFunc(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
            {funcError && <p className="text-sm text-red-400">{funcError}</p>}
            {funcMsg && <p className="text-sm text-green-400">{funcMsg}</p>}
            <Button className="w-full" onClick={handleCrearFuncionario} loading={savingFunc}>
              Crear Funcionario
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
