import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { ExitForm } from '@/features/exits/components/exit-form'
import { useCreateExit } from '@/features/exits/hooks'
import { toCreateExitDTO, type ExitFormValues } from '@/features/exits/schemas'

export function CreateExitPage() {
  const navigate = useNavigate()
  const { createExit, submitting } = useCreateExit()

  async function handleSubmit(values: ExitFormValues) {
    const exit = await createExit(toCreateExitDTO(values))
    if (exit) {
      toast.success('Salida registrada exitosamente')
      navigate('/exits')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nueva salida" showBack />
      <ExitForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Registrar salida"
      />
    </div>
  )
}
