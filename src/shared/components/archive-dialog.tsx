import { AlertTriangle } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface ArchiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
  title?: string
  description?: string
}

/** Reusable confirmation dialog for archiving (soft-deleting) a CRUD record. */
export function ArchiveDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  title = 'Archivar registro',
  description = '¿Estás seguro de que deseas archivar este registro? Dejará de aparecer en los listados activos.',
}: ArchiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-start gap-3">
            <div
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10"
              aria-hidden="true"
            >
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30"
          >
            {loading ? 'Archivando…' : 'Archivar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
