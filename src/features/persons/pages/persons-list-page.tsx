import { useState } from 'react'
import { Archive, ChevronRight, MoreVertical, Phone, Users } from 'lucide-react'
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
import { useArchivePerson, usePersons } from '@/features/persons/hooks'
import type { Person } from '@/features/persons/types'

export function PersonsListPage() {
  const navigate = useNavigate()
  const [dniFilter, setDniFilter] = useState('')
  const { data, totalCount, loading, error, page, setPage, search, setSearch, refetch } =
    usePersons(dniFilter ? { dni: dniFilter } : undefined)
  const { archivePerson, submitting } = useArchivePerson()
  const [personToArchive, setPersonToArchive] = useState<Person | null>(null)

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
    if (!personToArchive) return
    const success = await archivePerson(personToArchive.id)
    if (success) {
      toast.success('Persona archivada')
      setPersonToArchive(null)
      refetch()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={totalCount > 0 && !loading ? `Personas (${totalCount})` : 'Personas'}
        actionLabel="Nueva persona"
        onAction={() => navigate('/persons/new')}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre..." />
        </div>
        <Input
          value={dniFilter}
          onChange={(event) => setDniFilter(event.target.value)}
          placeholder="Filtrar por DNI"
          aria-label="Filtrar por DNI"
          className="h-11 sm:max-w-44"
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
          icon={Users}
          description="Intenta con otro nombre o DNI, o creá una nueva persona."
          actionLabel="Nueva persona"
          onAction={() => navigate('/persons/new')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((person) => (
            <Card
              key={person.id}
              className="cursor-pointer motion-safe:transition-shadow motion-safe:hover:shadow-md"
              onClick={() => navigate(`/persons/${person.id}/edit`)}
            >
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  {/* Primary: full name */}
                  <p className="truncate text-base font-semibold leading-tight text-foreground">
                    {person.names} {person.surnames}
                  </p>

                  {/* Secondary: DNI + phone */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {person.dni && (
                      <Badge
                        variant="secondary"
                        className="rounded-md px-1.5 py-0 font-mono text-xs"
                      >
                        {person.dni}
                      </Badge>
                    )}
                    {person.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="size-3 shrink-0" aria-hidden="true" />
                        {person.phone}
                      </span>
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
                          onClick={() => setPersonToArchive(person)}
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
        open={!!personToArchive}
        onOpenChange={(open) => !open && setPersonToArchive(null)}
        onConfirm={handleConfirmArchive}
        loading={submitting}
        description={
          personToArchive
            ? `¿Estás seguro de que deseas archivar a ${personToArchive.names} ${personToArchive.surnames}?`
            : undefined
        }
      />
    </div>
  )
}
