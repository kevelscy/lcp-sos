import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EntryForm } from '@/features/entries/components/entry-form'
import { useEntry, useUpdateEntry } from '@/features/entries/hooks'
import { entryToFormValues, toUpdateEntryDTO, type EntryFormValues } from '@/features/entries/schemas'

export function EditEntryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: entry, loading, notFound } = useEntry(id)
  const { updateEntry, submitting } = useUpdateEntry()

  async function handleSubmit(values: EntryFormValues) {
    if (!id) return
    const updated = await updateEntry(id, toUpdateEntryDTO(values))
    if (updated) {
      toast.success('Entrada actualizada exitosamente')
      navigate('/entries')
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Editar entrada" showBack />
        <p className="text-sm text-muted-foreground">Entrada no encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Editar entrada" showBack />
      {loading || !entry ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <EntryForm
          mode="edit"
          item={entry.item}
          initialDonor={entry.donor}
          defaultValues={entryToFormValues(entry)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Actualizar entrada"
        />
      )}
    </div>
  )
}
