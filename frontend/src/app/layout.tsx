import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Bebas_Neue } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: 'Ticketing Mundial 2026',
  description: 'Sistema oficial de entradas para el Mundial de Fútbol 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} ${bebas.variable} h-full`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
