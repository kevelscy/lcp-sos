import { useState } from 'react'
import { Archive, MoreVertical, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ArchiveDialog } from '@/shared/components/archive-dialog'
import { EmptyState } from '@/shared/components/empty-state'
import { PageHeader } from '@/shared/components/page-header'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { SearchBar } from '@/shared/components/search-bar'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { buttonVariants } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/constants'
import type { PaginationInfo } from '@/shared/lib/types'
import { useArchiveItem, useItems } from '@/features/items/hooks'
import type { Item } from '@/features/items/types'

export function ItemsListPage() {
  const navigate = useNavigate()
  const [barcodeFilter, setBarcodeFilter] = useState('')
  const { data, totalCount, loading, error, page, setPage, search, setSearch, refetch } =
    useItems(barcodeFilter ? { barcode: barcodeFilter } : undefined)
  const { archiveItem, submitting } = useArchiveItem()
  const [itemToArchive, setItemToArchive] = useState<Item | null>(null)

  const pageSize = DEFAULT_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pagination: PaginationInfo = {
    totalItems: totalCount,
    totalPages,
    currentPage: page,
    pageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }

  async function handleConfirmArchive() {
    if (!itemToArchive) return
    const success = await archiveItem(itemToArchive.id)
    if (success) {
      toast.success('Artículo archivado')
      setItemToArchive(null)
      refetch()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Artículos"
        actionLabel="Nuevo artículo"
        onAction={() => navigate('/items/new')}
      />

      <div className="flex flex-col gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        <Input
          value={barcodeFilter}
          onChange={(event) => setBarcodeFilter(event.target.value)}
          placeholder="Filtrar por código de barras"
          aria-label="Filtrar por código de barras"
          className="max-w-56"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Package}
          description="Intentá con otro nombre o código de barras, o creá un nuevo artículo."
          actionLabel="Nuevo artículo"
          onAction={() => navigate('/items/new')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/items/${item.id}/edit`)}
            >
              <CardContent className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {item.barcode && <Badge variant="outline">{item.barcode}</Badge>}
                    {item.unit && <span>{item.unit}</span>}
                  </div>
                </div>

                <div onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
                      aria-label="Más acciones"
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setItemToArchive(item)}
                      >
                        <Archive />
                        Archivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls pagination={pagination} onPageChange={setPage} />

      <ArchiveDialog
        open={!!itemToArchive}
        onOpenChange={(open) => !open && setItemToArchive(null)}
        onConfirm={handleConfirmArchive}
        loading={submitting}
        description={
          itemToArchive
            ? `¿Estás seguro de que deseas archivar "${itemToArchive.name}"?`
            : undefined
        }
      />
    </div>
  )
}
