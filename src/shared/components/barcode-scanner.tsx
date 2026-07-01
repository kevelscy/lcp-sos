import { useEffect, useRef, useState } from 'react'
import { BarcodeFormat, BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setErrorMessage(null)

    if (!window.isSecureContext) {
      setErrorMessage(
        'Se requiere una conexión segura (HTTPS) para acceder a la cámara.'
      )
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
          setErrorMessage('Se requiere acceso a la cámara para escanear.')
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setErrorMessage('No se encontró cámara disponible.')
        } else {
          setErrorMessage('No se pudo iniciar la cámara. Intentá nuevamente.')
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
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>Escanear código de barras</SheetTitle>
          <SheetDescription>
            Apuntá la cámara al código de barras del artículo.
          </SheetDescription>
        </SheetHeader>

        <div className="relative flex-1 overflow-hidden bg-black">
          {errorMessage ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white">
              {errorMessage}
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-1/3 w-4/5 rounded-lg border-2 border-white/80" />
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
