import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

import { Drawer } from '@/shared/components/drawer'

type ErrorKind = 'permission' | 'no-camera' | 'generic' | 'insecure'

interface BarcodeScannerProps {
  open: boolean
  onScan: (code: string) => void
  onClose: () => void
}

/**
 * Camera-based barcode scanner using html5-qrcode for reliable 1D/2D
 * detection. Renders inside our Drawer at zLayer=70 (above everything).
 */
export function BarcodeScanner({ open, onScan, onClose }: BarcodeScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setReady(false)
      return
    }

    setErrorKind(null)

    if (!window.isSecureContext) {
      setErrorKind('insecure')
      return
    }

    // Wait for drawer animation so the container is in the DOM and visible
    const delay = setTimeout(() => setReady(true), 450)
    return () => clearTimeout(delay)
  }, [open])

  // Start scanner once ready
  useEffect(() => {
    if (!ready || !open) return

    const el = containerRef.current
    if (!el) return

    // html5-qrcode needs a unique ID on the container
    const id = el.id || 'barcode-reader'
    el.id = id

    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.7778,
          disableFlip: false,
        },
        (decodedText) => {
          console.log('[BarcodeScanner] ✅ detected:', decodedText)
          scanner.stop().catch(() => {})
          scannerRef.current = null
          onScan(decodedText)
        },
        // Ignore errors — fires every frame without a barcode
        () => {}
      )
      .catch((err: unknown) => {
        console.error('[BarcodeScanner] start error:', err)
        const msg = String(err)
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setErrorKind('permission')
        } else if (msg.includes('NotFoundError') || msg.includes('Devices')) {
          setErrorKind('no-camera')
        } else {
          setErrorKind('generic')
        }
      })

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, open])

  // Clean up on close
  function handleClose() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    onClose()
  }

  return (
    <Drawer open={open} onClose={handleClose} zLayer={70} skipBodyLock>
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
          minHeight: 260,
          borderRadius: 22,
          background: '#12212e',
          overflow: 'hidden',
        }}>
          {errorKind ? (
            <ErrorState kind={errorKind} />
          ) : (
            <>
              <div
                ref={containerRef}
                id="barcode-reader"
                style={{ width: '100%', minHeight: 260 }}
              />

              {/* Scan line overlay (on top of the video) */}
              {ready && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
                  <div style={{
                    position: 'absolute',
                    left: '8%',
                    right: '8%',
                    height: 2.5,
                    background: 'linear-gradient(90deg, transparent, #4fd39a, transparent)',
                    boxShadow: '0 0 14px #4fd39a',
                    animation: 'scanline 1.7s ease-in-out infinite',
                  }} />

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
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
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
      height: 260,
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
