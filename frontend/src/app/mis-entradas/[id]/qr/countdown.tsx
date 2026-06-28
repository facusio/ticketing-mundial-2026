'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const QR_TTL = 30

export default function QrCountdown({ expiraEn, entradaId }: { expiraEn: string; entradaId: string }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(QR_TTL)

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((new Date(expiraEn).getTime() - Date.now()) / 1000)
      return Math.max(0, Math.min(diff, QR_TTL))
    }

    setSecondsLeft(calc())

    const interval = setInterval(() => {
      const s = calc()
      setSecondsLeft(s)
      if (s === 0) {
        clearInterval(interval)
        router.refresh()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiraEn, router])

  // Poll every 5 seconds to detect validation immediately
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/backend/api/usuario/entradas/${entradaId}/qr`)
        if (res.status === 409) {
          const body = await res.json().catch(() => null)
          if (body?.message?.toLowerCase().includes('consumida')) {
            router.refresh()
          }
        }
      } catch { /* ignore network errors */ }
    }, 5000)
    return () => clearInterval(poll)
  }, [entradaId, router])

  const progress = (secondsLeft / QR_TTL) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-[#4da3e8]" />
        <span className={`font-mono font-bold text-lg ${secondsLeft <= 5 ? 'text-red-400' : 'text-[#4da3e8]'}`}>
          {secondsLeft}s
        </span>
        <span className="text-slate-400">hasta regenerar</span>
      </div>
      <Progress value={progress} indicatorClassName={secondsLeft <= 5 ? 'bg-red-500' : 'bg-[#0066b2]'} />
      <p className="text-xs text-slate-500">El código se regenera automáticamente cada 30 segundos</p>
    </div>
  )
}
