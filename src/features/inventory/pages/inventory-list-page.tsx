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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventario" />

      <div className="flex flex-col gap-2">
        <SearchBar
          value={nameSearch}
          onChange={setNameSearch}
          placeholder="Buscar por nombre de artículo..."
        />
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
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Package}
          description="Intentá con otro nombre o código de barras."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((entry) => {
            const isNegative = entry.available < 0
            const isOutOfStock = !isNegative && entry.available === 0

            return (
              <Card key={entry.item.id}>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{entry.item.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {entry.item.barcode && (
                          <Badge variant="outline">{entry.item.barcode}</Badge>
                        )}
                        {entry.item.unit && <span>{entry.item.unit}</span>}
                      </div>
                    </div>

                    {isNegative && <Badge variant="destructive">Stock negativo</Badge>}
                    {isOutOfStock && (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Sin stock
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t pt-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">
                      Entradas: {entry.totalEntries}
                    </span>
                    <span className="text-orange-600 dark:text-orange-400">
                      Salidas: {entry.totalExits}
                    </span>
                    <span
                      className={cn(
                        'text-base font-semibold',
                        isNegative && 'text-destructive',
                        isOutOfStock && 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      Disponible: {entry.available}
                    </span>
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
