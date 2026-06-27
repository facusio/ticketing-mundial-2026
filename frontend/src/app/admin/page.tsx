import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Calendar, Trophy, BarChart3 } from 'lucide-react'

const CARDS = [
  { href: '/admin/estadios', icon: Building2, title: 'Estadios', desc: 'Gestionar estadios y sectores', color: 'text-blue-400' },
  { href: '/admin/eventos', icon: Calendar, title: 'Eventos', desc: 'Crear y gestionar partidos', color: 'text-[#0066b2]' },
  { href: '/admin/fases', icon: Trophy, title: 'Fases y Precios', desc: 'Configurar fases y precios por sector', color: 'text-amber-400' },
  { href: '/admin/reportes', icon: BarChart3, title: 'Reportes', desc: 'Rankings, compradores y auditoría', color: 'text-purple-400' },
]

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Panel de Administración</h1>
      <p className="text-slate-600 mb-10">Mundial 2026 · Gestión de tu país</p>

      <div className="grid grid-cols-2 gap-6">
        {CARDS.map(({ href, icon: Icon, title, desc, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-[#0066b2]/50 hover:bg-blue-50 transition-all cursor-pointer group h-full">
              <CardContent className="p-10 flex flex-col gap-6">
                <div className={`p-4 rounded-xl bg-slate-100 w-fit ${color}`}>
                  <Icon className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 group-hover:text-[#0066b2] transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
