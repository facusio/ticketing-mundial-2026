import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, CheckCircle } from 'lucide-react'

interface ValidacionResponse {
  entradaId: number
  fechaValidacion: string
  propietario?: { id: number; mail: string; numeroDoc: string }
  evento?: { id: number; equipoLocal: string; equipoVisitante: string; fechaHora: string }
  sector?: { id: number; codigo: string; estadioNombre: string }
}

export default async function HistorialPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value ?? ''

  let validaciones: ValidacionResponse[] = []
  try {
    const res = await fetch('http://localhost:8080/api/funcionario/validaciones', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) validaciones = await res.json()
  } catch { /* ignore */ }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/validar" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Volver a escanear
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Historial de validaciones</h1>
          <p className="text-slate-400 mt-1">
            {validaciones.length} validacion{validaciones.length !== 1 ? 'es' : ''} realizadas
          </p>
        </div>
      </div>

      {validaciones.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-slate-400">No hay validaciones registradas.</p>
            <Link href="/validar">
              <Button variant="gold" className="mt-4">Ir a escanear</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registro de validaciones</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Partido</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validaciones.map((v, i) => (
                  <TableRow key={v.entradaId ?? i}>
                    <TableCell className="text-sm">{formatDate(v.fechaValidacion)}</TableCell>
                    <TableCell className="text-sm font-medium text-white">
                      {v.evento
                        ? `${v.evento.equipoLocal} vs ${v.evento.equipoVisitante}`
                        : `Entrada #${v.entradaId}`}
                    </TableCell>
                    <TableCell className="text-sm text-green-400">
                      {v.sector ? `${v.sector.codigo} — ${v.sector.estadioNombre}` : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {v.propietario?.mail ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <Badge variant="green">VÁLIDA</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
