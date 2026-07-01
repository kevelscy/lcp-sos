import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { PaginationInfo } from '@/shared/lib/types'

interface PaginationControlsProps {
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  className?: string
}

/** Compact previous/next pagination bar. Renders nothing for single-page lists. */
export function PaginationControls({
  pagination,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (!pagination || pagination.totalPages <= 1) {
    return null
  }

  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination

  return (
    <nav aria-label="Paginación" className={cn('flex items-center justify-between gap-2', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
        className="min-h-[44px] px-3"
      >
        <ChevronLeft aria-hidden="true" />
        Anterior
      </Button>

      <span
        className="text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        Página {currentPage} de {totalPages}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Página siguiente"
        className="min-h-[44px] px-3"
      >
        Siguiente
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
