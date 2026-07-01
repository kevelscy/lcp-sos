import { z } from 'zod'

import type { CreateExitDTO, Exit, UpdateExitDTO } from '@/features/exits/types'

/**
 * Number input handling matches `FormField`'s `variant="number"` behavior:
 * `''` while empty, a `number` once the user types a value. Validated to be
 * `> 0` regardless of which state it's in.
 */
const quantitySchema = z
  .union([z.number(), z.literal('')])
  .refine((val) => typeof val === 'number' && val > 0, {
    message: 'La cantidad debe ser mayor a cero',
  })

const recipientIdSchema = z.number().nullable()
const notesSchema = z.string()

/**
 * A single field shape shared by create/edit modes. `itemId` is only
 * required in create mode — edit mode never renders or submits it (the
 * backend does not allow changing an exit's item after creation), so it's
 * left unvalidated there rather than maintaining two separate schemas.
 */
export function buildExitSchema(mode: 'create' | 'edit') {
  return z.object({
    itemId:
      mode === 'create'
        ? z.number().nullable().refine((val) => val !== null, {
            message: 'Seleccioná un artículo',
          })
        : z.number().nullable(),
    quantity: quantitySchema,
    recipientId: recipientIdSchema,
    notes: notesSchema,
  })
}

export type ExitFormValues = z.infer<ReturnType<typeof buildExitSchema>>

/** Maps validated create-mode form values to the API create payload shape. */
export function toCreateExitDTO(values: ExitFormValues): CreateExitDTO {
  return {
    // Guaranteed non-null by `buildExitSchema('create')`'s refine before submit.
    itemId: values.itemId as number,
    quantity: Number(values.quantity),
    recipientId: values.recipientId ?? null,
    notes: values.notes ? values.notes : null,
  }
}

/** Maps validated edit-mode form values to the API update payload shape (no `itemId`). */
export function toUpdateExitDTO(values: ExitFormValues): UpdateExitDTO {
  return {
    quantity: Number(values.quantity),
    recipientId: values.recipientId ?? null,
    notes: values.notes ? values.notes : null,
  }
}

/** Maps a fetched `Exit` to editable form values (`null` → `''` for notes). */
export function exitToFormValues(exit: Exit): ExitFormValues {
  return {
    itemId: exit.itemId,
    quantity: exit.quantity,
    recipientId: exit.recipientId,
    notes: exit.notes ?? '',
  }
}
