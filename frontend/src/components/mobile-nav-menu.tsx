'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function MobileNavMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)

  if (links.length === 0) return null

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-50 py-1 overflow-hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}
