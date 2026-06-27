'use client'

import { usePathname } from 'next/navigation'

const AUTH_PATHS = ['/login', '/register']

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PATHS.includes(pathname)) return null
  return <>{children}</>
}
