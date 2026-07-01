import { Inbox, type LucideIcon } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

/** Placeholder shown when a list has no data. */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No se encontraron registros',
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
        <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-[30ch] text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
