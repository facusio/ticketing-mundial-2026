import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'http://localhost:8080'

const ROLE_HOME: Record<string, string> = {
  ADMIN_PAIS: '/admin',
  FUNCIONARIO: '/validar',
  SUPERADMIN: '/superadmin',
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const mail = formData.get('mail') as string
  const password = formData.get('password') as string

  let data: { token: string; rol: string } | null = null
  try {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, password }),
    })
    if (res.ok) data = await res.json()
  } catch { /* ignore */ }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000'
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`

  if (!data) {
    return NextResponse.redirect(new URL('/login?error=1', base))
  }

  const home = ROLE_HOME[data.rol] ?? '/dashboard'
  const res = NextResponse.redirect(new URL(home, base))
  res.cookies.set('token', data.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return res
}
