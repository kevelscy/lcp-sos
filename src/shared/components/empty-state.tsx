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
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-center">
      <Icon className="size-10 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
