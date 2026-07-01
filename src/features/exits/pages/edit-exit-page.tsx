import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ExitForm } from '@/features/exits/components/exit-form'
import { useExit, useUpdateExit } from '@/features/exits/hooks'
import { exitToFormValues, toUpdateExitDTO, type ExitFormValues } from '@/features/exits/schemas'

export function EditExitPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: exit, loading, notFound } = useExit(id)
  const { updateExit, submitting } = useUpdateExit()

  async function handleSubmit(values: ExitFormValues) {
    if (!id) return
    const updated = await updateExit(id, toUpdateExitDTO(values))
    if (updated) {
      toast.success('Salida actualizada exitosamente')
      navigate('/exits')
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Editar salida" showBack />
        <p className="text-sm text-muted-foreground">Salida no encontrada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Editar salida" showBack />
      {loading || !exit ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <ExitForm
          mode="edit"
          item={exit.item}
          initialRecipient={exit.recipient}
          defaultValues={exitToFormValues(exit)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Actualizar salida"
        />
      )}
    </div>
  )
}
