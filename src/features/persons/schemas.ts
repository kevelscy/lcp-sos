import { z } from 'zod'

import type { CreatePersonDTO, Person } from '@/features/persons/types'

/** Uppercase letter followed by digits, e.g. `V12345678`. */
const DNI_REGEX = /^[A-Z]\d+$/
/** 10 digits starting with a valid Venezuelan mobile/landline prefix. */
const PHONE_REGEX = /^(412|422|414|424|416|426)\d{7}$/

export const personSchema = z.object({
  names: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios')
    .max(100, 'Máximo 100 caracteres'),
  surnames: z
    .string()
    .trim()
    .min(1, 'Los apellidos son obligatorios')
    .max(100, 'Máximo 100 caracteres'),
  dni: z
    .string()
    .trim()
    .refine((value) => value === '' || DNI_REGEX.test(value), {
      message: 'DNI inválido (ej: V12345678)',
    }),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_REGEX.test(value), {
      message: 'Teléfono inválido: 10 dígitos con prefijo válido (412, 414, 416, 422, 424, 426)',
    }),
  address: z.string(),
  notes: z.string(),
})

/**
 * Form values are all plain strings (RHF-friendly). Optional backend fields
 * use `''` for "empty", converted to `null` at the DTO boundary — see
 * `toCreatePersonDTO`/`personToFormValues` below. This sidesteps Zod
 * input/output transform typing entirely.
 */
export type PersonFormValues = z.infer<typeof personSchema>

/** Maps validated form values to the API create/update payload shape. */
export function toCreatePersonDTO(values: PersonFormValues): CreatePersonDTO {
  return {
    names: values.names,
    surnames: values.surnames,
    dni: values.dni ? values.dni : null,
    phone: values.phone ? values.phone : null,
    address: values.address ? values.address : null,
    notes: values.notes ? values.notes : null,
  }
}

/** Maps a fetched `Person` to editable form values (`null` → `''`). */
export function personToFormValues(person: Person): PersonFormValues {
  return {
    names: person.names,
    surnames: person.surnames,
    dni: person.dni ?? '',
    phone: person.phone ?? '',
    address: person.address ?? '',
    notes: person.notes ?? '',
  }
}
