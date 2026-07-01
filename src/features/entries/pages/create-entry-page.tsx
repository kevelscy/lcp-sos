import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { EntryForm } from '@/features/entries/components/entry-form'
import { useCreateEntry } from '@/features/entries/hooks'
import { toCreateEntryDTO, type EntryFormValues } from '@/features/entries/schemas'

export function CreateEntryPage() {
  const navigate = useNavigate()
  const { createEntry, submitting } = useCreateEntry()

  async function handleSubmit(values: EntryFormValues) {
    const entry = await createEntry(toCreateEntryDTO(values))
    if (entry) {
      toast.success('Entrada registrada exitosamente')
      navigate('/entries')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nueva entrada" showBack />
      <EntryForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Registrar entrada"
      />
    </div>
  )
}
