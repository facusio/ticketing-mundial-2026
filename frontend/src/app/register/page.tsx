'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface FormData {
  mail: string
  password: string
  confirmPassword: string
  paisDoc: string
  tipoDoc: string
  numeroDoc: string
  paisDir: string
  localidad: string
  calle: string
  numeroDir: string
  codigoPostal: string
  telefonos: string[]
}

const INITIAL: FormData = {
  mail: '',
  password: '',
  confirmPassword: '',
  paisDoc: '',
  tipoDoc: '',
  numeroDoc: '',
  paisDir: '',
  localidad: '',
  calle: '',
  numeroDir: '',
  codigoPostal: '',
  telefonos: [''],
}

const STEPS = ['Cuenta', 'Documento y Dirección', 'Confirmación']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addTelefono() {
    setForm((f) => ({ ...f, telefonos: [...f.telefonos, ''] }))
  }

  function removeTelefono(i: number) {
    setForm((f) => ({ ...f, telefonos: f.telefonos.filter((_, idx) => idx !== i) }))
  }

  function setTelefono(i: number, v: string) {
    setForm((f) => {
      const t = [...f.telefonos]
      t[i] = v
      return { ...f, telefonos: t }
    })
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.mail) return 'El mail es requerido'
      if (!form.password || form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
      if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden'
    }
    if (step === 1) {
      if (!form.paisDoc || !form.tipoDoc || !form.numeroDoc) return 'Completá los datos del documento'
      if (!form.paisDir || !form.localidad || !form.calle || !form.numeroDir || !form.codigoPostal)
        return 'Completá todos los campos de dirección'
      if (form.telefonos.some((t) => !t)) return 'Ingresá todos los teléfonos o eliminá los vacíos'
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
  }

  async function submit() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mail: form.mail,
          password: form.password,
          paisDoc: form.paisDoc,
          tipoDoc: form.tipoDoc,
          numeroDoc: form.numeroDoc,
          paisDir: form.paisDir,
          localidad: form.localidad,
          calle: form.calle,
          numeroDir: form.numeroDir,
          codigoPostal: form.codigoPostal,
          telefonos: form.telefonos.map((n) => ({ numero: n })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Error en el registro')
        return
      }
      router.push('/login?registered=1')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="text-slate-600 mt-1">Mundial 2026 · Ticketing</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div>
                  <Label htmlFor="mail">Correo electrónico</Label>
                  <Input id="mail" type="email" value={form.mail} onChange={(e) => set('mail', e.target.value)} placeholder="tu@email.com" />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input id="confirm" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repetí la contraseña" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paisDoc">País del documento</Label>
                    <Input id="paisDoc" value={form.paisDoc} onChange={(e) => set('paisDoc', e.target.value)} placeholder="Argentina" />
                  </div>
                  <div>
                    <Label htmlFor="tipoDoc">Tipo de documento</Label>
                    <Input id="tipoDoc" value={form.tipoDoc} onChange={(e) => set('tipoDoc', e.target.value)} placeholder="DNI" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="numeroDoc">Número de documento</Label>
                  <Input id="numeroDoc" value={form.numeroDoc} onChange={(e) => set('numeroDoc', e.target.value)} placeholder="12345678" />
                </div>
                <hr className="border-slate-200" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paisDir">País de residencia</Label>
                    <Input id="paisDir" value={form.paisDir} onChange={(e) => set('paisDir', e.target.value)} placeholder="Argentina" />
                  </div>
                  <div>
                    <Label htmlFor="localidad">Localidad</Label>
                    <Input id="localidad" value={form.localidad} onChange={(e) => set('localidad', e.target.value)} placeholder="Buenos Aires" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calle">Calle</Label>
                    <Input id="calle" value={form.calle} onChange={(e) => set('calle', e.target.value)} placeholder="Av. Corrientes" />
                  </div>
                  <div>
                    <Label htmlFor="numeroDir">Número</Label>
                    <Input id="numeroDir" value={form.numeroDir} onChange={(e) => set('numeroDir', e.target.value)} placeholder="1234" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cp">Código postal</Label>
                  <Input id="cp" value={form.codigoPostal} onChange={(e) => set('codigoPostal', e.target.value)} placeholder="1043" />
                </div>
                <hr className="border-slate-200" />
                <div>
                  <Label>Teléfonos</Label>
                  {form.telefonos.map((tel, i) => (
                    <div key={i} className="flex gap-2 mt-2">
                      <Input
                        value={tel}
                        onChange={(e) => setTelefono(i, e.target.value)}
                        placeholder="+54 11 1234-5678"
                      />
                      {form.telefonos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTelefono(i)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" className="mt-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800" onClick={addTelefono}>
                    <Plus className="h-4 w-4" /> Agregar teléfono
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 mb-4">Revisá tus datos antes de confirmar:</p>
                {[
                  ['Mail', form.mail],
                  ['Documento', `${form.tipoDoc} ${form.numeroDoc} (${form.paisDoc})`],
                  ['Dirección', `${form.calle} ${form.numeroDir}, ${form.localidad}, ${form.paisDir}`],
                  ['Código postal', form.codigoPostal],
                  ['Teléfonos', form.telefonos.join(', ')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => { setError(''); setStep((s) => s - 1) }}>
                  <ChevronLeft className="h-4 w-4" /> Atrás
                </Button>
              )}
              {step < 2 ? (
                <Button className="flex-1" onClick={next}>
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="flex-1" variant="gold" loading={loading} onClick={submit}>
                  Crear cuenta
                </Button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-sm text-slate-400">
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                  Iniciá sesión
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
