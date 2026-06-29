'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingBall } from '@/components/loading-ball'

const CLIP = 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)'

function LoginError() {
  const searchParams = useSearchParams()
  if (searchParams.get('error') !== '1') return null
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-red-500/15 border border-red-400/25 px-4 py-3 text-sm text-red-300">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>Credenciales incorrectas</span>
    </div>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ backgroundImage: "url('/bg-login.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Tagline izquierda — absoluta, solo desktop */}
      <div className="absolute left-0 top-0 bottom-0 hidden lg:flex flex-col justify-center px-16 w-[38%] z-10 pointer-events-none">
        {/* Bloque FIFA estilo logo */}
        <div className="inline-flex flex-col items-start">
          <div className="bg-[#0066b2] px-4 py-1 mb-1">
            <p className="font-display text-white select-none leading-none tracking-widest" style={{ fontSize: '5rem' }}>
              FIFA
            </p>
          </div>
          <p className="font-display text-white select-none leading-none tracking-widest" style={{ fontSize: '3.8rem' }}>
            WORLD CUP
          </p>
          <p className="font-display select-none leading-none tracking-widest" style={{ fontSize: '3.8rem', color: '#f59e0b' }}>
            2026™
          </p>
        </div>
        <div className="mt-3 w-16 h-1 bg-[#0066b2]" />
        <p className="mt-5 text-white/55 text-sm max-w-xs leading-relaxed">
          La plataforma oficial para gestionar tus entradas al evento más grande del fútbol.
        </p>
      </div>

      {/* Card — zona oscura derecha del balón */}
      <div className="relative z-10 py-12 px-6 lg:translate-x-[90%]">

        {/* Borde exterior (1 px degradado) */}
        <div
          style={{
            clipPath: CLIP,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.04) 100%)',
            padding: '1px',
          }}
        >
          {/* Card interior */}
          <div
            className="w-full sm:w-[480px] px-12 py-16 min-h-[720px] flex flex-col justify-between"
            style={{
              clipPath: CLIP,
              background: 'rgba(6, 10, 24, 0.52)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            {/* Logo + título centrado */}
            <div className="flex flex-col items-center">
              <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-14 w-auto mb-5" />
              <h2 className="text-3xl font-bold text-white tracking-tight">Ingresá</h2>
              <p className="text-white/40 text-sm mt-2 text-center">
                Accedé a tus entradas del Mundial
              </p>
            </div>

            {/* Separador decorativo verde */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <div className="w-8 h-0.5 bg-[#0066b2]" />
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form method="POST" action="/api/auth/login-redirect" className="space-y-5" onSubmit={() => setLoading(true)}>
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-white/50 text-xs font-semibold tracking-widest uppercase">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    id="mail"
                    name="mail"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    className="pl-10 py-3 bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:ring-0 focus:border-[#0066b2]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-white/50 text-xs font-semibold tracking-widest uppercase">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pl-10 pr-10 py-3 bg-white/5 border-white/15 text-white placeholder:text-white/20 focus:ring-0 focus:border-[#0066b2]"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white/30 hover:text-white/70 transition-colors p-2 touch-manipulation"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <Suspense>
                <LoginError />
              </Suspense>

              <Button type="submit" className="w-full py-3 bg-[#0066b2] hover:bg-[#0052a3] active:bg-[#003d7a] focus-visible:ring-[#0066b2]" size="lg" loading={loading}>
                {!loading && 'Ingresar'}
              </Button>
            </form>

            <p className="text-center text-sm text-white/35">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-[#5bb3f0] hover:text-[#82c8f8] font-medium transition-colors">
                Registrate acá
              </Link>
            </p>
          </div>
        </div>
      </div>

      {loading && <LoadingBall />}
    </div>
  )
}
