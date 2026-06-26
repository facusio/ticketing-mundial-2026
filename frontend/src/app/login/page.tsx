'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeftRight, Eye, EyeOff, Lock, Mail, Smartphone, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingBall } from '@/components/loading-ball'

const FEATURES = [
  { icon: Ticket, text: 'Comprá entradas al instante' },
  { icon: Smartphone, text: 'QR dinámico de acceso' },
  { icon: ArrowLeftRight, text: 'Transferencias entre usuarios' },
]

export default function LoginPage() {
  const router = useRouter()
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Credenciales incorrectas')
        return
      }
      const data = (await res.json()) as { rol: string }
      if (data.rol === 'ADMIN_PAIS') router.push('/admin')
      else if (data.rol === 'FUNCIONARIO') router.push('/validar')
      else router.push('/dashboard')
    } catch {
      setError('Error de conexión. Verificá que el servidor esté activo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo — Branding ── */}
      <div
        className="hidden md:flex flex-col w-[45%] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #052e16 0%, #064e3b 40%, #0a0f1a 100%)' }}
      >
        {/* Glow decorativo */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col h-full px-12 py-16">
          {/* Badge superior */}
          <div className="flex items-center gap-2.5">
            <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-8 w-auto" />
            <span className="text-slate-400 text-xs font-medium tracking-[0.2em] uppercase">
              Ticketing Oficial
            </span>
          </div>

          {/* Tipografía principal */}
          <div className="flex-1 flex flex-col justify-center">
            <p
              className="font-display text-white leading-none select-none"
              style={{ fontSize: '6.5rem' }}
            >
              MUNDIAL
            </p>
            <p
              className="font-display leading-none select-none"
              style={{ fontSize: '6.5rem', color: '#f59e0b' }}
            >
              2026
            </p>
            <p className="mt-6 text-slate-400 text-base max-w-xs leading-relaxed">
              La plataforma oficial para gestionar tus entradas al evento más
              grande del fútbol mundial.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-700 text-xs">© UCU · Bases de Datos II · 2026</p>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-16 md:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Logo mobile */}
          <div className="md:hidden flex items-center gap-2 mb-10">
            <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-8 w-auto" />
            <span className="text-slate-800 font-bold text-lg">Mundial 2026</span>
          </div>

          {/* Encabezado */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Bienvenido de vuelta</h2>
            <p className="mt-2 text-slate-600 text-sm">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="mail" className="text-slate-700">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="mail"
                  type="email"
                  placeholder="tu@email.com"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {!loading && 'Ingresar'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link
              href="/register"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Registrate acá
            </Link>
          </p>
        </div>
      </div>
      {loading && <LoadingBall />}
    </div>
  )
}
