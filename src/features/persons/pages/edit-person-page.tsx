import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { PersonForm } from '@/features/persons/components/person-form'
import { usePerson, useUpdatePerson } from '@/features/persons/hooks'
import { personToFormValues, toCreatePersonDTO, type PersonFormValues } from '@/features/persons/schemas'

export function EditPersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: person, loading, notFound } = usePerson(id)
  const { updatePerson, submitting } = useUpdatePerson()

  async function handleSubmit(values: PersonFormValues) {
    if (!id) return
    const updated = await updatePerson(id, toCreatePersonDTO(values))
    if (updated) {
      toast.success('Persona actualizada exitosamente')
      navigate('/persons')
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Editar persona" showBack />
        <p className="text-sm text-muted-foreground">Persona no encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Editar persona" showBack />
      {loading || !person ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <PersonForm
          defaultValues={personToFormValues(person)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Actualizar persona"
        />
      )}
    </div>
  )
}
