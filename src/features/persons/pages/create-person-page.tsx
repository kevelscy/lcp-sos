import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { PersonForm } from '@/features/persons/components/person-form'
import { useCreatePerson } from '@/features/persons/hooks'
import { toCreatePersonDTO, type PersonFormValues } from '@/features/persons/schemas'

export function CreatePersonPage() {
  const navigate = useNavigate()
  const { createPerson, submitting } = useCreatePerson()

  async function handleSubmit(values: PersonFormValues) {
    const person = await createPerson(toCreatePersonDTO(values))
    if (person) {
      toast.success('Persona creada exitosamente')
      navigate('/persons')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nueva persona" showBack />
      <PersonForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Crear persona" />
    </div>
  )
}
