'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { QrResponse } from '@/lib/types'
import { ChevronLeft, RefreshCw, Clock } from 'lucide-react'

const QR_TTL = 30

export default function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [qr, setQr] = useState<QrResponse | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(QR_TTL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchQr = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get<QrResponse>(`/api/usuario/entradas/${id}/qr`)
      setQr(data)
      setSecondsLeft(QR_TTL)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el QR')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Initial fetch
  useEffect(() => {
    fetchQr()
  }, [fetchQr])

  // Countdown + auto-refresh
  useEffect(() => {
    if (!qr) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          fetchQr()
          return QR_TTL
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [qr, fetchQr])

  const progress = (secondsLeft / QR_TTL) * 100

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center">
      <Link
        href="/mis-entradas"
        className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Mis entradas
      </Link>

      <div className="w-full max-w-sm px-6 text-center">
        <h1 className="text-xl font-bold text-white mb-1">QR de entrada</h1>
        <p className="text-slate-400 text-sm mb-8">Mostrá este código al funcionario en la puerta</p>

        {error ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-6 py-8">
              <p className="text-red-400 mb-4">{error}</p>
            </div>
            <Button onClick={fetchQr} variant="outline">
              <RefreshCw className="h-4 w-4" /> Reintentar
            </Button>
          </div>
        ) : loading && !qr ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent" />
          </div>
        ) : qr ? (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="inline-block p-5 bg-white rounded-2xl shadow-2xl shadow-green-500/20">
              <QRCodeSVG
                value={qr.codigo}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Countdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-400" />
                <span className={`font-mono font-bold text-lg ${secondsLeft <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                  {secondsLeft}s
                </span>
                <span className="text-slate-400">hasta regenerar</span>
              </div>
              <Progress
                value={progress}
                indicatorClassName={secondsLeft <= 5 ? 'bg-red-500' : 'bg-green-500'}
              />
              <p className="text-xs text-slate-500">El código se regenera automáticamente cada 30 segundos</p>
            </div>

            <Button onClick={fetchQr} variant="ghost" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar ahora
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
