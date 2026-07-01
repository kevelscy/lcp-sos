import { useEffect, useRef, useState } from 'react'
import { BarcodeFormat, BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

import { Drawer } from '@/shared/components/drawer'

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
 * Camera-based barcode scanner using our Drawer system (z-index 70)
 * so it renders above any stacked drawers.
 *
 * Uses `@zxing/browser` BrowserMultiFormatReader to continuously decode
 * frames from the device camera until a barcode is found.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Drawer open={open} onClose={onClose} zLayer={70} skipBodyLock>
      <div style={{ padding: '6px 22px 34px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f2a40', textAlign: 'center', margin: '2px 0 4px' }}>
          Escaneando…
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#8a99a8', textAlign: 'center', marginBottom: 22 }}>
          Apuntá la cámara al código de barras
        </div>

        {/* Camera viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 260,
          borderRadius: 22,
          background: '#12212e',
          overflow: 'hidden',
        }}>
          {errorKind ? (
            <ErrorState kind={errorKind} />
          ) : (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
              />

              {/* Viewfinder overlay */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
                {/* Border frame */}
                <div style={{
                  position: 'absolute',
                  left: '8%',
                  right: '8%',
                  top: '10%',
                  bottom: '10%',
                  border: '2px solid rgba(255,255,255,.25)',
                  borderRadius: 16,
                }} />

                {/* Scan line */}
                <div style={{
                  position: 'absolute',
                  left: '8%',
                  right: '8%',
                  height: 2.5,
                  background: 'linear-gradient(90deg, transparent, #4fd39a, transparent)',
                  boxShadow: '0 0 14px #4fd39a',
                  animation: 'scanline 1.7s ease-in-out infinite',
                }} />

                {/* Pulsing dots */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 16,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 6,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fd39a', animation: 'pulseDot 1s infinite' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fd39a', animation: 'pulseDot 1s infinite .2s' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fd39a', animation: 'pulseDot 1s infinite .4s' }} />
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 20,
            width: '100%',
            background: '#eef2f6',
            color: '#3a4d5e',
            border: 'none',
            borderRadius: 14,
            padding: 15,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancelar
        </button>
      </div>
    </Drawer>
  )
}

/** Inline error state rendered inside the camera viewport. */
function ErrorState({ kind }: { kind: ErrorKind }) {
  const config: Record<ErrorKind, { icon: string; title: string; description: string }> = {
    permission: {
      icon: '🔒',
      title: 'Permiso de cámara requerido',
      description: 'Permití el acceso a la cámara en la configuración del navegador.',
    },
    'no-camera': {
      icon: '📷',
      title: 'No se encontró cámara',
      description: 'Asegurate de que tu dispositivo tenga una cámara disponible.',
    },
    generic: {
      icon: '⚠️',
      title: 'Error al iniciar la cámara',
      description: 'No se pudo acceder a la cámara. Cerrá e intentá nuevamente.',
    },
    insecure: {
      icon: '🔓',
      title: 'Conexión no segura',
      description: 'Se requiere HTTPS para acceder a la cámara.',
    },
  }

  const { icon, title, description } = config[kind]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      padding: 24,
      textAlign: 'center',
      color: '#fff',
    }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{description}</div>
    </div>
  )
}
