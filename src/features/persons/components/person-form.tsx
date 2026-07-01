import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormField } from '@/shared/components/form-field'
import { Button } from '@/shared/components/ui/button'
import { FieldGroup } from '@/shared/components/ui/field'
import { personSchema, type PersonFormValues } from '@/features/persons/schemas'

const EMPTY_VALUES: PersonFormValues = {
  names: '',
  surnames: '',
  dni: '',
  phone: '',
  address: '',
  notes: '',
}

interface PersonFormProps {
  /** Pre-populated values for edit mode. Loaded asynchronously — the form resets when this changes. */
  defaultValues?: PersonFormValues
  onSubmit: (values: PersonFormValues) => Promise<void> | void
  submitting?: boolean
  submitLabel?: string
}

/** Reusable create/edit form for Persons. Field-level Spanish validation via `personSchema`. */
export function PersonForm({
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel = 'Guardar',
}: PersonFormProps) {
  const { control, handleSubmit } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: EMPTY_VALUES,
    // Reactive default values: resets the form whenever `defaultValues` changes
    // (e.g. once the edit page's async `usePerson` fetch resolves).
    values: defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <FormField control={control} name="names" label="Nombres" placeholder="Nombres" />
        <FormField control={control} name="surnames" label="Apellidos" placeholder="Apellidos" />
        <FormField control={control} name="dni" label="DNI" placeholder="V12345678" />
        <FormField control={control} name="phone" label="Teléfono" placeholder="4141234567" />
        <FormField
          control={control}
          name="address"
          label="Dirección"
          variant="textarea"
          placeholder="Dirección"
        />
        <FormField
          control={control}
          name="notes"
          label="Notas"
          variant="textarea"
          placeholder="Notas adicionales"
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Guardando…' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
