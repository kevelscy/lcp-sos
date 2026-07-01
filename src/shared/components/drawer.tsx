import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Optional extra max-height (default 90vh). */
  maxHeight?: string
}

/**
 * Bottom-sheet drawer that matches the Acopio design:
 * - Backdrop: rgba(12,26,40,.42), fades in/out
 * - Content: white, top-rounded 26px, slides up from bottom
 * - Drag handle: 40x5px grey pill
 * - Scrollable content area inside
 */
export function Drawer({ open, onClose, children, maxHeight = '90%' }: DrawerProps) {
  const prevOpen = useRef(open)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else if (prevOpen.current) {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    prevOpen.current = open
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,26,40,.42)',
          zIndex: 50,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .3s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 51,
          background: '#fff',
          borderRadius: '26px 26px 0 0',
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .34s cubic-bezier(.32,.72,0,1)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: '11px 0 4px',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              background: '#dbe2e9',
            }}
          />
        </div>

        {/* Content */}
        {children}
      </div>
    </>,
    document.body
  )
}
