import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const body = await request.text()

  const backendRes = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({ message: 'Error en el registro' }))
    return NextResponse.json(err, { status: backendRes.status })
  }

  return new NextResponse(null, { status: 201 })
}
