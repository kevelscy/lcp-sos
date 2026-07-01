import { useState } from 'react'
import { Archive, ChevronRight, MoreVertical, Package } from 'lucide-react'
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
        title={totalCount > 0 && !loading ? `Artículos (${totalCount})` : 'Artículos'}
        actionLabel="Nuevo artículo"
        onAction={() => navigate('/items/new')}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        </div>
        <Input
          value={barcodeFilter}
          onChange={(event) => setBarcodeFilter(event.target.value)}
          placeholder="Filtrar por código de barras"
          aria-label="Filtrar por código de barras"
          className="h-11 font-mono sm:max-w-52"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] w-full rounded-xl" />
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
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer motion-safe:transition-shadow motion-safe:hover:shadow-md"
              onClick={() => navigate(`/items/${item.id}/edit`)}
            >
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  {/* Primary: item name */}
                  <p className="truncate text-base font-semibold leading-tight text-foreground">
                    {item.name}
                  </p>

                  {/* Secondary: barcode (monospace) + unit tag */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {item.barcode && (
                      <Badge
                        variant="outline"
                        className="rounded-md px-1.5 py-0 font-mono text-xs"
                      >
                        {item.barcode}
                      </Badge>
                    )}
                    {item.unit && (
                      <Badge
                        variant="secondary"
                        className="rounded-md px-1.5 py-0 text-xs"
                      >
                        {item.unit}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <ChevronRight className="size-4 text-muted-foreground/50" aria-hidden="true" />

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
