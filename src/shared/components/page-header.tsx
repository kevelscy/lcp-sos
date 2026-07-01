import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'

interface PageHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  /** Shows a back-navigation chevron before the title (detail/form pages). */
  showBack?: boolean
  onBack?: () => void
}

/** Page title bar with optional primary action button and back navigation. */
export function PageHeader({
  title,
  actionLabel,
  onAction,
  showBack = false,
  onBack,
}: PageHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) {
      onBack()
      return
    }
    navigate(-1)
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {showBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            aria-label="Volver"
          >
            <ChevronLeft />
          </Button>
        )}
        <h1 className="truncate text-lg font-semibold">{title}</h1>
      </div>

      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
