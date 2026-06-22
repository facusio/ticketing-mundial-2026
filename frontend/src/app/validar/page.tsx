'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Camera, CameraOff, History } from 'lucide-react'

type ValidationState = 'idle' | 'scanning' | 'validating' | 'success' | 'error'

interface ValidacionResult {
  valida: boolean
  mensaje: string
  entrada?: {
    id: number
    eventoNombre?: string
    sector?: string
    propietario?: string
  }
}

function getOrCreateDeviceUid(): string {
  const key = 'mundial_device_uid'
  let uid = localStorage.getItem(key)
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem(key, uid)
  }
  return uid
}

async function ensureDeviceRegistered(uid: string) {
  try {
    await api.post('/api/funcionario/dispositivos/registrar', {
      deviceUid: uid,
      descripcion: `Navegador ${navigator.userAgent.slice(0, 50)}`,
    })
  } catch { /* may already be registered */ }
}

export default function ValidarPage() {
  const [state, setState] = useState<ValidationState>('idle')
  const [result, setResult] = useState<ValidacionResult | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [scanning, setScanning] = useState(false)
  const lastScannedRef = useRef('')
  const deviceUidRef = useRef('')

  useEffect(() => {
    deviceUidRef.current = getOrCreateDeviceUid()
    ensureDeviceRegistered(deviceUidRef.current)
  }, [])

  async function handleScan(codes: { rawValue: string }[]) {
    const codigo = codes[0]?.rawValue
    if (!codigo || codigo === lastScannedRef.current || state === 'validating') return
    lastScannedRef.current = codigo
    setScanning(false)
    setState('validating')

    try {
      const res = await api.post<ValidacionResult>('/api/funcionario/validar', {
        codigoQr: codigo,
        deviceUid: deviceUidRef.current,
      })
      setResult(res)
      setState(res.valida ? 'success' : 'error')
    } catch (err) {
      setResult({
        valida: false,
        mensaje: err instanceof Error ? err.message : 'Error de conexión',
      })
      setState('error')
    }
  }

  function handleError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Permission') || message.includes('NotAllowed')) {
      setCameraError('Acceso a la cámara denegado. Habilitalo en la configuración del navegador.')
    } else {
      setCameraError(`Error de cámara: ${message}`)
    }
    setScanning(false)
    setState('idle')
  }

  function startScan() {
    lastScannedRef.current = ''
    setCameraError('')
    setResult(null)
    setState('scanning')
    setScanning(true)
  }

  function reset() {
    setState('idle')
    setResult(null)
    setScanning(false)
    setCameraError('')
    lastScannedRef.current = ''
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Validar QR</h1>
          <p className="text-slate-400 mt-1">Escaneá el QR del asistente</p>
        </div>
        <Link href="/validar/historial">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4" /> Historial
          </Button>
        </Link>
      </div>

      {/* Resultado success */}
      {state === 'success' && result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-500/10 border-2 border-green-500 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-400 mb-2">ACCESO PERMITIDO</h2>
            {result.entrada && (
              <div className="mt-4 space-y-1 text-sm text-slate-300">
                {result.entrada.eventoNombre && <p>{result.entrada.eventoNombre}</p>}
                {result.entrada.sector && (
                  <p className="font-medium text-green-300">Sector: {result.entrada.sector}</p>
                )}
                {result.entrada.propietario && <p>Propietario: {result.entrada.propietario}</p>}
              </div>
            )}
            <p className="mt-3 text-green-300">{result.mensaje}</p>
          </div>
          <Button className="w-full" size="lg" onClick={startScan}>
            <Camera className="h-5 w-5" /> Escanear siguiente
          </Button>
        </div>
      )}

      {/* Resultado error */}
      {state === 'error' && result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-500/10 border-2 border-red-500 p-8 text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-red-400 mb-2">ACCESO DENEGADO</h2>
            <p className="mt-3 text-red-300 font-medium">{result.mensaje}</p>
          </div>
          <Button className="w-full" size="lg" onClick={startScan}>
            <Camera className="h-5 w-5" /> Escanear siguiente
          </Button>
        </div>
      )}

      {/* Validando */}
      {state === 'validating' && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-green-500 border-t-transparent" />
            <p className="text-slate-300 font-medium">Validando código...</p>
          </CardContent>
        </Card>
      )}

      {/* Idle */}
      {state === 'idle' && (
        <div className="space-y-4">
          {cameraError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center">
              <CameraOff className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-400">{cameraError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => { setCameraError(''); startScan() }}
              >
                Reintentar
              </Button>
            </div>
          )}
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-6">
              <Camera className="h-16 w-16 text-slate-600" />
              <div className="text-center">
                <p className="text-slate-300 font-medium">Cámara lista para escanear</p>
                <p className="text-sm text-slate-500 mt-1">Presioná el botón para activar</p>
              </div>
              <Button size="lg" onClick={startScan} className="px-10">
                <Camera className="h-5 w-5" /> Activar cámara
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scanner activo */}
      {state === 'scanning' && scanning && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-green-500 bg-black aspect-square">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              formats={['qr_code']}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-green-400 rounded-lg opacity-70" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-3">Apuntá la cámara al código QR del asistente</p>
            <Button variant="ghost" onClick={reset}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
