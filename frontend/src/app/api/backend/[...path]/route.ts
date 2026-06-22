import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND = 'http://localhost:8080'

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const backendPath = '/' + path.join('/')
  const search = request.nextUrl.search
  const backendUrl = `${BACKEND}${backendPath}${search}`

  const isBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  const body = isBodyMethod ? await request.text() : undefined

  const backendRes = await fetch(backendUrl, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  const data = await backendRes.text()
  const contentType = backendRes.headers.get('content-type') ?? 'application/json'

  return new NextResponse(data, {
    status: backendRes.status,
    headers: { 'Content-Type': contentType },
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
