'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ReporteEvento, ReporteComprador, ReporteFuncionario } from '@/lib/types'
import { BarChart3, Users, Shield } from 'lucide-react'

export default function ReportesPage() {
  const [eventos, setEventos] = useState<ReporteEvento[]>([])
  const [compradores, setCompradores] = useState<ReporteComprador[]>([])
  const [funcionarios, setFuncionarios] = useState<ReporteFuncionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [ev, comp, func] = await Promise.all([
          api.get<ReporteEvento[]>('/api/admin/reportes/ranking-eventos').catch(() => []),
          api.get<ReporteComprador[]>('/api/admin/reportes/ranking-compradores').catch(() => []),
          api.get<ReporteFuncionario[]>('/api/admin/reportes/auditoria-funcionarios').catch(() => []),
        ])
        setEventos(ev)
        setCompradores(comp)
        setFuncionarios(func)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Reportes</h1>
      <p className="text-slate-600 mb-8">Análisis y métricas del torneo</p>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos">
            <BarChart3 className="h-4 w-4 mr-2" /> Eventos
          </TabsTrigger>
          <TabsTrigger value="compradores">
            <Users className="h-4 w-4 mr-2" /> Compradores
          </TabsTrigger>
          <TabsTrigger value="funcionarios">
            <Shield className="h-4 w-4 mr-2" /> Funcionarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <div className="space-y-6">
            {eventos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Entradas vendidas por evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={eventos.slice(0, 10)}>
                      <XAxis
                        dataKey={(e: ReporteEvento) => `${e.equipoLocal} vs ${e.equipoVisitante}`}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        itemStyle={{ color: '#22c55e' }}
                      />
                      <Bar dataKey="totalEntradas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Ranking completo</CardTitle></CardHeader>
              <CardContent className="pt-0">
                {eventos.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No hay datos disponibles.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Partido</TableHead>
                        <TableHead>Estadio</TableHead>
                        <TableHead>Entradas</TableHead>
                        <TableHead>Recaudación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventos.map((ev, i) => (
                        <TableRow key={ev.eventoId}>
                          <TableCell className="text-amber-400 font-bold">{i + 1}</TableCell>
                          <TableCell className="font-medium">{ev.equipoLocal} vs {ev.equipoVisitante}</TableCell>
                          <TableCell className="text-slate-400">{ev.estadioNombre}</TableCell>
                          <TableCell className="text-green-400 font-semibold">{ev.totalEntradas}</TableCell>
                          <TableCell>{formatCurrency(ev.montoTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compradores">
          <Card>
            <CardHeader><CardTitle>Top compradores</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {compradores.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No hay datos disponibles.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Entradas</TableHead>
                      <TableHead>Total gastado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compradores.map((c, i) => (
                      <TableRow key={c.usuarioId}>
                        <TableCell className="text-amber-400 font-bold">{i + 1}</TableCell>
                        <TableCell>{c.mail}</TableCell>
                        <TableCell className="text-green-400 font-semibold">{c.totalEntradas}</TableCell>
                        <TableCell>{formatCurrency(c.montoTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios">
          <Card>
            <CardHeader><CardTitle>Auditoría de funcionarios</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {funcionarios.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No hay datos disponibles.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionario</TableHead>
                      <TableHead>Sectores asignados</TableHead>
                      <TableHead>Validaciones realizadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funcionarios.map((f) => (
                      <TableRow key={f.funcionarioId}>
                        <TableCell>{f.mail}</TableCell>
                        <TableCell className="text-blue-400">{f.sectoresAsignados}</TableCell>
                        <TableCell className="text-green-400 font-semibold">{f.validacionesRealizadas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
