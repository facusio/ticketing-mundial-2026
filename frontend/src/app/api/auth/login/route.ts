import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const body = await request.text()

  const backendRes = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({ message: 'Error de autenticación' }))
    return NextResponse.json(err, { status: backendRes.status })
  }

  const data = await backendRes.json() as { token: string; rol: string; usuarioId: number }

  const res = NextResponse.json({ rol: data.rol, usuarioId: data.usuarioId })
  const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https')
  res.cookies.set('token', data.token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  })

  return res
}
