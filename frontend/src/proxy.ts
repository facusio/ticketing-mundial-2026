import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt, isTokenExpired } from '@/lib/utils'
import type { Rol } from '@/lib/types'

const PUBLIC_PATHS = ['/login', '/register']
const ROLE_PATHS: Record<Rol, string[]> = {
  USUARIO_GENERAL: ['/dashboard', '/eventos', '/mis-entradas', '/transferir'],
  ADMIN_PAIS: ['/admin'],
  FUNCIONARIO: ['/validar'],
}

function getHomeForRole(rol: Rol): string {
  if (rol === 'ADMIN_PAIS') return '/admin'
  if (rol === 'FUNCIONARIO') return '/validar'
  return '/dashboard'
}

function isAllowedPath(pathname: string, rol: Rol): boolean {
  const allowed = ROLE_PATHS[rol] ?? []
  return allowed.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!token) {
    if (isPublic || pathname === '/') return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = decodeJwt(token)
  if (!payload || isTokenExpired(payload)) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete('token')
    return res
  }

  const rol = payload.rol

  if (pathname === '/') {
    return NextResponse.redirect(new URL(getHomeForRole(rol), request.url))
  }

  if (isPublic) {
    return NextResponse.redirect(new URL(getHomeForRole(rol), request.url))
  }

  if (!isAllowedPath(pathname, rol)) {
    return NextResponse.redirect(new URL(getHomeForRole(rol), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
}
