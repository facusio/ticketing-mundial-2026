'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
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
      const data = await res.json() as { rol: string }
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-3xl font-bold text-white">Mundial 2026</h1>
          <p className="text-slate-400 mt-1">Sistema de Ticketing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mail">Correo electrónico</Label>
                <Input
                  id="mail"
                  type="email"
                  placeholder="tu@email.com"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Ingresar
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-400">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-green-400 hover:text-green-300 font-medium">
                Registrate acá
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
