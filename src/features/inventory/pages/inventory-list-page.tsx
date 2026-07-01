import { useState } from 'react'
import { Package } from 'lucide-react'

import { EmptyState } from '@/shared/components/empty-state'
import { PageHeader } from '@/shared/components/page-header'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { SearchBar } from '@/shared/components/search-bar'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/constants'
import type { PaginationInfo } from '@/shared/lib/types'
import { useInventory } from '@/features/inventory/hooks'

export function InventoryListPage() {
  const [nameSearch, setNameSearch] = useState('')
  const [barcodeFilter, setBarcodeFilter] = useState('')
  const { data, totalCount, loading, error, page, setPage } = useInventory({
    name: nameSearch || undefined,
    barcode: barcodeFilter || undefined,
  })

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

  const zeroOrNegativeCount = data.filter((e) => e.available <= 0).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventario" />

      {/* Summary bar — only when data is loaded and not empty */}
      {!loading && data.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="text-foreground">
            <span className="font-semibold">{totalCount}</span>{' '}
            <span className="text-muted-foreground">
              {totalCount === 1 ? 'artículo' : 'artículos'}
            </span>
          </span>
          {zeroOrNegativeCount > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-amber-600 dark:text-amber-400">
                <span className="font-semibold">{zeroOrNegativeCount}</span> sin stock o negativo
              </span>
            </>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            value={nameSearch}
            onChange={setNameSearch}
            placeholder="Buscar por nombre de artículo..."
          />
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
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Package}
          description="Intentá con otro nombre o código de barras."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((entry) => {
            const isNegative = entry.available < 0
            const isOutOfStock = !isNegative && entry.available === 0

            return (
              <Card key={entry.item.id}>
                <CardContent className="flex flex-col gap-3 py-3">
                  {/* Header row: item name + stock status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-tight text-foreground">
                        {entry.item.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {entry.item.barcode && (
                          <Badge
                            variant="outline"
                            className="rounded-md px-1.5 py-0 font-mono text-xs"
                          >
                            {entry.item.barcode}
                          </Badge>
                        )}
                        {entry.item.unit && (
                          <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-xs">
                            {entry.item.unit}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isNegative && (
                      <Badge variant="destructive" className="shrink-0">
                        Stock negativo
                      </Badge>
                    )}
                    {isOutOfStock && (
                      <Badge className="shrink-0 bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Sin stock
                      </Badge>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between gap-2 border-t pt-2.5">
                    {/* Entries / Exits: secondary */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Entradas:{' '}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {entry.totalEntries}
                        </span>
                      </span>
                      <span>
                        Salidas:{' '}
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {entry.totalExits}
                        </span>
                      </span>
                    </div>

                    {/* Available: primary — large and bold */}
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Disponible</span>
                      <p
                        className={cn(
                          'text-xl font-bold leading-tight tabular-nums',
                          isNegative && 'text-destructive',
                          isOutOfStock && 'text-amber-600 dark:text-amber-400',
                          !isNegative && !isOutOfStock && 'text-foreground'
                        )}
                      >
                        {entry.available}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
