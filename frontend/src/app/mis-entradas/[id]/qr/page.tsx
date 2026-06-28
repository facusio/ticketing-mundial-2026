import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, PartyPopper } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import QrCountdown from './countdown'
import type { QrResponse } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('token')?.value ?? ''

  let qr: QrResponse | null = null
  let error = ''
  let consumed = false

  try {
    const res = await fetch(`http://localhost:8080/api/usuario/entradas/${id}/qr`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (res.ok) {
      qr = await res.json()
    } else {
      const body = await res.json().catch(() => null)
      const msg: string = body?.message ?? ''
      if (res.status === 409 && msg.toLowerCase().includes('consumida')) {
        consumed = true
      } else {
        error = msg || `Error ${res.status}`
      }
    }
  } catch {
    error = 'No se pudo conectar con el servidor'
  }

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center">
      <Link
        href="/mis-entradas"
        className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="h-4 w-4" /> Mis entradas
      </Link>

      <div className="w-full max-w-sm px-6 text-center">
        {consumed ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl scale-150" />
                <div className="relative rounded-full bg-green-500/15 border-2 border-green-500/40 p-6">
                  <CheckCircle2 className="h-16 w-16 text-green-400" />
                </div>
              </div>
              <PartyPopper className="h-8 w-8 text-yellow-400 absolute" style={{ marginTop: '-2rem', marginLeft: '3rem' }} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">¡Entrada validada!</h1>
              <p className="text-green-400 text-lg font-semibold">Tu acceso fue confirmado</p>
              <p className="text-slate-300 mt-4 text-base leading-relaxed">
                Un funcionario escaneó tu QR correctamente.
              </p>
              <p className="text-2xl font-bold text-white mt-2">¡Disfrutá el partido!</p>
            </div>

            <div className="rounded-2xl bg-green-500/10 border border-green-500/30 px-6 py-4">
              <p className="text-green-300 text-sm">
                Esta entrada ya no puede ser reutilizada
              </p>
            </div>

            <Link href="/mis-entradas">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
                Ver mis entradas
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-1">QR de entrada</h1>
            <p className="text-slate-400 text-sm mb-8">Mostrá este código al funcionario en la puerta</p>

            {error ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-6 py-8">
                  <p className="text-red-400 mb-4">{error}</p>
                </div>
                <Link href={`/mis-entradas/${id}/qr`}>
                  <Button variant="outline">Reintentar</Button>
                </Link>
              </div>
            ) : qr ? (
              <div className="space-y-6">
                <div className="inline-block p-5 bg-white rounded-2xl shadow-2xl shadow-[#0066b2]/20">
                  <QRCodeSVG value={qr.codigo} size={220} level="H" includeMargin={false} />
                </div>
                <QrCountdown expiraEn={qr.expiraEn} entradaId={id} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
