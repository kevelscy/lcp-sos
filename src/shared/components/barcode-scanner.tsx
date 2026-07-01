import { useEffect, useRef, useState } from 'react'
import { BarcodeFormat, BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { Camera, CameraOff, ShieldAlert, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'

/** Common 1D barcode formats used on donated-goods packaging. */
const SCAN_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
]

type ErrorKind = 'permission' | 'no-camera' | 'generic' | 'insecure'

interface BarcodeScannerProps {
  open: boolean
  onScan: (code: string) => void
  onClose: () => void
}

/**
 * Camera-based barcode scanner, opened as a bottom sheet (feels native on
 * mobile). Uses `@zxing/browser`'s `BrowserMultiFormatReader` to continuously
 * decode frames from the device camera until a barcode is found.
 *
 * IMPORTANT: `controls.stop()` (called on unmount, on close, and after a
 * successful scan) triggers zxing's internal `finalizeCallback`, which stops
 * every `MediaStreamTrack` and detaches the video source — this is the
 * library's documented way to release the camera, no manual track handling
 * needed on top of it.
 */
export function BarcodeScanner({ open, onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null)

  useEffect(() => {
    if (!open) return

    setErrorKind(null)

    if (!window.isSecureContext) {
      setErrorKind('insecure')
      return
    }

    const reader = new BrowserMultiFormatReader()
    reader.possibleFormats = SCAN_FORMATS

    let cancelled = false

    async function start() {
      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current ?? undefined,
          (result, _error, activeControls) => {
            if (cancelled || !result) return
            activeControls.stop()
            onScan(result.getText())
          }
        )

        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
      } catch (err) {
        if (cancelled) return
        const name = (err as { name?: string } | undefined)?.name
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setErrorKind('permission')
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setErrorKind('no-camera')
        } else {
          setErrorKind('generic')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
    // Only `open` should restart the scan loop — `onScan` is read fresh from
    // the closure on each call, restarting the camera on every parent
    // re-render would be a poor UX (and unnecessary permission re-prompts).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="flex h-[75vh] flex-col gap-0 p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle>Escanear código de barras</SheetTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Cerrar escáner"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <SheetDescription>
            Apuntá la cámara al código de barras del artículo.
          </SheetDescription>
        </SheetHeader>

        {/* Camera viewport */}
        <div className="relative flex-1 overflow-hidden bg-black">
          {errorKind ? (
            <ErrorState kind={errorKind} onClose={onClose} />
          ) : (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />

              {/* Viewfinder overlay */}
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                {/* Corner-bordered frame */}
                <div className="relative h-2/5 w-4/5 max-w-xs">
                  {/* Corner marks */}
                  <span className="absolute top-0 left-0 h-6 w-6 rounded-tl-sm border-t-2 border-l-2 border-white" />
                  <span className="absolute top-0 right-0 h-6 w-6 rounded-tr-sm border-t-2 border-r-2 border-white" />
                  <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-sm border-b-2 border-l-2 border-white" />
                  <span className="absolute right-0 bottom-0 h-6 w-6 rounded-br-sm border-b-2 border-r-2 border-white" />

                  {/* Scanning line — gated behind motion-safe */}
                  <span className="motion-safe:animate-scan absolute inset-x-0 top-0 h-0.5 rounded-full bg-primary/80 shadow-[0_0_6px_2px_rgba(var(--primary),0.5)]" />
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** Inline error state rendered inside the camera viewport. */
function ErrorState({ kind, onClose }: { kind: ErrorKind; onClose: () => void }) {
  const config = {
    permission: {
      icon: ShieldAlert,
      title: 'Permiso de cámara requerido',
      description:
        'Esta función necesita acceso a tu cámara. Permitilo en la configuración del navegador y volvé a intentarlo.',
    },
    'no-camera': {
      icon: CameraOff,
      title: 'No se encontró cámara',
      description: 'Asegurate de que tu dispositivo tenga una cámara disponible.',
    },
    generic: {
      icon: Camera,
      title: 'Error al iniciar la cámara',
      description: 'No se pudo acceder a la cámara. Cerrá este panel e intentá nuevamente.',
    },
    insecure: {
      icon: ShieldAlert,
      title: 'Conexión no segura',
      description:
        'Se requiere una conexión HTTPS para acceder a la cámara. Contactá al administrador.',
    },
  } satisfies Record<ErrorKind, { icon: React.ElementType; title: string; description: string }>

  const { icon: Icon, title, description } = config[kind]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
      <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
        <Icon className="size-7 text-white/80" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/70">{description}</p>
      </div>
      {kind === 'permission' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          Entendido
        </Button>
      )}
    </div>
  )
}
