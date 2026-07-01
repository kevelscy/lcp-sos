import { useState } from 'react'
import { Archive, ClipboardList, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ArchiveDialog } from '@/shared/components/archive-dialog'
import { EmptyState } from '@/shared/components/empty-state'
import { PageHeader } from '@/shared/components/page-header'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { SearchBar } from '@/shared/components/search-bar'
import { SearchableSelect, type SearchableSelectOption } from '@/shared/components/searchable-select'
import { Badge } from '@/shared/components/ui/badge'
import { buttonVariants } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/constants'
import type { PaginationInfo } from '@/shared/lib/types'
import { cn } from '@/shared/lib/utils'
import { useArchiveEntry, useEntries } from '@/features/entries/hooks'
import type { Entry } from '@/features/entries/types'
import { itemsApi } from '@/features/items/api'
import { personsApi } from '@/features/persons/api'

async function fetchItemOptions(query: string) {
  const response = await itemsApi.getAll({ search: query, limit: 10 })
  return response.data.map((item) => ({
    id: item.id,
    label: item.name,
    description: item.barcode ?? undefined,
  }))
}

async function fetchDonorOptions(query: string) {
  const response = await personsApi.getAll({ search: query, limit: 10 })
  return response.data.map((person) => ({
    id: person.id,
    label: `${person.names} ${person.surnames}`,
    description: person.dni ?? undefined,
  }))
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function EntriesListPage() {
  const navigate = useNavigate()
  const [itemFilter, setItemFilter] = useState<SearchableSelectOption | null>(null)
  const [donorFilter, setDonorFilter] = useState<SearchableSelectOption | null>(null)
  const { data, totalCount, loading, error, page, setPage, search, setSearch, refetch } =
    useEntries({ itemId: itemFilter?.id, donorId: donorFilter?.id })
  const { archiveEntry, submitting } = useArchiveEntry()
  const [entryToArchive, setEntryToArchive] = useState<Entry | null>(null)

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
    if (!entryToArchive) return
    const success = await archiveEntry(entryToArchive.id)
    if (success) {
      toast.success('Entrada archivada')
      setEntryToArchive(null)
      refetch()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Entradas"
        actionLabel="Nueva entrada"
        onAction={() => navigate('/entries/new')}
      />

      <div className="flex flex-col gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar entradas..." />
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchableSelect
            value={itemFilter?.id ?? null}
            defaultLabel={itemFilter?.label}
            onChange={setItemFilter}
            fetchOptions={fetchItemOptions}
            placeholder="Filtrar por artículo"
          />
          <SearchableSelect
            value={donorFilter?.id ?? null}
            defaultLabel={donorFilter?.label}
            onChange={setDonorFilter}
            fetchOptions={fetchDonorOptions}
            placeholder="Filtrar por donante"
          />
        </div>
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
          icon={ClipboardList}
          description="Intentá con otro artículo o donante, o registrá una nueva entrada."
          actionLabel="Nueva entrada"
          onAction={() => navigate('/entries/new')}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/entries/${entry.id}/edit`)}
            >
              <CardContent className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.quantity} {entry.item.unit ?? ''}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline">
                      {entry.donor ? `${entry.donor.names} ${entry.donor.surnames}` : 'Sin donante'}
                    </Badge>
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                  {entry.notes && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{entry.notes}</p>
                  )}
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
                        onClick={() => setEntryToArchive(entry)}
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
        open={!!entryToArchive}
        onOpenChange={(open) => !open && setEntryToArchive(null)}
        onConfirm={handleConfirmArchive}
        loading={submitting}
        description={
          entryToArchive
            ? `¿Estás seguro de que deseas archivar la entrada de "${entryToArchive.item.name}"?`
            : undefined
        }
      />
    </div>
  )
}
