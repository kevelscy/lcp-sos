import { z } from 'zod'

import type { CreateEntryDTO, Entry, UpdateEntryDTO } from '@/features/entries/types'

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

const donorIdSchema = z.number().nullable()
const notesSchema = z.string()

/**
 * A single field shape shared by create/edit modes. `itemId` is only
 * required in create mode — edit mode never renders or submits it (the
 * backend does not allow changing an entry's item after creation), so it's
 * left unvalidated there rather than maintaining two separate schemas.
 */
export function buildEntrySchema(mode: 'create' | 'edit') {
  return z.object({
    itemId:
      mode === 'create'
        ? z.number().nullable().refine((val) => val !== null, {
            message: 'Seleccioná un artículo',
          })
        : z.number().nullable(),
    quantity: quantitySchema,
    donorId: donorIdSchema,
    notes: notesSchema,
  })
}

export type EntryFormValues = z.infer<ReturnType<typeof buildEntrySchema>>

/** Maps validated create-mode form values to the API create payload shape. */
export function toCreateEntryDTO(values: EntryFormValues): CreateEntryDTO {
  return {
    // Guaranteed non-null by `buildEntrySchema('create')`'s refine before submit.
    itemId: values.itemId as number,
    quantity: Number(values.quantity),
    donorId: values.donorId ?? null,
    notes: values.notes ? values.notes : null,
  }
}

/** Maps validated edit-mode form values to the API update payload shape (no `itemId`). */
export function toUpdateEntryDTO(values: EntryFormValues): UpdateEntryDTO {
  return {
    quantity: Number(values.quantity),
    donorId: values.donorId ?? null,
    notes: values.notes ? values.notes : null,
  }
}

/** Maps a fetched `Entry` to editable form values (`null` → `''` for notes). */
export function entryToFormValues(entry: Entry): EntryFormValues {
  return {
    itemId: entry.itemId,
    quantity: entry.quantity,
    donorId: entry.donorId,
    notes: entry.notes ?? '',
  }
}
