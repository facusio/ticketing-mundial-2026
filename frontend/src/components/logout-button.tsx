'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Salir</span>
    </Button>
  )
}
