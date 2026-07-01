import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/shared/components/page-header'
import { ItemForm } from '@/features/items/components/item-form'
import { useCreateItem } from '@/features/items/hooks'
import { toCreateItemDTO, type ItemFormValues } from '@/features/items/schemas'

export function CreateItemPage() {
  const navigate = useNavigate()
  const { createItem, submitting } = useCreateItem()

  async function handleSubmit(values: ItemFormValues) {
    const item = await createItem(toCreateItemDTO(values))
    if (item) {
      toast.success('Artículo creado exitosamente')
      navigate('/items')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nuevo artículo" showBack />
      <ItemForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Crear artículo" />
    </div>
  )
}
