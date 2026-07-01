import { z } from 'zod'

import type { CreateItemDTO, Item } from '@/features/items/types'

export const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(150, 'Máximo 150 caracteres'),
  /** No format restriction from the backend — free text scanned or typed. */
  barcode: z.string().trim(),
  /** Free text, e.g. "Kilogramos (kg)", "Unidades", "Litros (L)". */
  unit: z.string().trim(),
})

/**
 * Form values are all plain strings (RHF-friendly). Optional backend fields
 * use `''` for "empty", converted to `null` at the DTO boundary — see
 * `toCreateItemDTO`/`itemToFormValues` below (mirrors the Persons pattern).
 */
export type ItemFormValues = z.infer<typeof itemSchema>

/** Maps validated form values to the API create/update payload shape. */
export function toCreateItemDTO(values: ItemFormValues): CreateItemDTO {
  return {
    name: values.name,
    barcode: values.barcode ? values.barcode : null,
    unit: values.unit ? values.unit : null,
  }
}

/** Maps a fetched `Item` to editable form values (`null` → `''`). */
export function itemToFormValues(item: Item): ItemFormValues {
  return {
    name: item.name,
    barcode: item.barcode ?? '',
    unit: item.unit ?? '',
  }
}
