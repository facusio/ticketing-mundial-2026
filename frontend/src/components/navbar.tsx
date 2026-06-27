import { cookies } from 'next/headers'
import Link from 'next/link'
import { decodeJwt } from '@/lib/utils'
import { LogoutButton } from './logout-button'
import type { Rol } from '@/lib/types'

const NAV_LINKS: Record<Rol, { href: string; label: string }[]> = {
  USUARIO_GENERAL: [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/mis-entradas', label: 'Mis Entradas' },
    { href: '/transferir', label: 'Transferir' },
  ],
  ADMIN_PAIS: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/estadios', label: 'Estadios' },
    { href: '/admin/eventos', label: 'Eventos' },
    { href: '/admin/fases', label: 'Fases' },
    { href: '/admin/reportes', label: 'Reportes' },
  ],
  FUNCIONARIO: [
    { href: '/validar', label: 'Escanear QR' },
    { href: '/validar/historial', label: 'Historial' },
  ],
}

export async function Navbar() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = decodeJwt(token)
  if (!payload) return null

  const rol = payload.rol
  const links = NAV_LINKS[rol] ?? []

  const rolLabel: Record<Rol, string> = {
    USUARIO_GENERAL: 'Hincha',
    ADMIN_PAIS: 'Admin País',
    FUNCIONARIO: 'Funcionario',
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-mundial.png" alt="FIFA World Cup 2026" className="h-8 w-auto" />
              <span className="font-bold text-slate-800 text-lg">
                Mundial <span className="text-[#0066b2]">2026</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center rounded-full bg-[#0066b2]/10 border border-[#0066b2]/30 px-3 py-1 text-xs font-semibold text-[#0066b2]">
              {rolLabel[rol]}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
