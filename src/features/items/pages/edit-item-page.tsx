import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ItemForm } from '@/features/items/components/item-form'
import { useItem, useUpdateItem } from '@/features/items/hooks'
import { itemToFormValues, toCreateItemDTO, type ItemFormValues } from '@/features/items/schemas'

export function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, loading, notFound } = useItem(id)
  const { updateItem, submitting } = useUpdateItem()

  async function handleSubmit(values: ItemFormValues) {
    if (!id) return
    const updated = await updateItem(id, toCreateItemDTO(values))
    if (updated) {
      toast.success('Artículo actualizado exitosamente')
      navigate('/items')
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Editar artículo" showBack />
        <p className="text-sm text-muted-foreground">Artículo no encontrado</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Editar artículo" showBack />
      {loading || !item ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <ItemForm
          defaultValues={itemToFormValues(item)}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Actualizar artículo"
        />
      )}
    </div>
  )
}
