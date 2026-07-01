import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { FormField } from '@/shared/components/form-field'
import { SearchableSelect } from '@/shared/components/searchable-select'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { itemsApi } from '@/features/items/api'
import type { Item } from '@/features/items/types'
import { personsApi } from '@/features/persons/api'
import type { Person } from '@/features/persons/types'
import { buildExitSchema, type ExitFormValues } from '@/features/exits/schemas'

const EMPTY_VALUES: ExitFormValues = { itemId: null, quantity: '', recipientId: null, notes: '' }

async function fetchItemOptions(query: string) {
  const response = await itemsApi.getAll({ search: query, limit: 10 })
  return response.data.map((item) => ({
    id: item.id,
    label: item.name,
    description: item.barcode ?? undefined,
  }))
}

async function fetchRecipientOptions(query: string) {
  const response = await personsApi.getAll({ search: query, limit: 10 })
  return response.data.map((person) => ({
    id: person.id,
    label: `${person.names} ${person.surnames}`,
    description: person.dni ?? undefined,
  }))
}

interface ExitFormProps {
  mode: 'create' | 'edit'
  /** Edit mode only: the exit's fixed item, shown as a read-only label. */
  item?: Item | null
  /** Edit mode only: pre-selected recipient, so the selector shows a label immediately. */
  initialRecipient?: Person | null
  defaultValues?: ExitFormValues
  onSubmit: (values: ExitFormValues) => Promise<void> | void
  submitting?: boolean
  submitLabel?: string
}

/**
 * Reusable create/edit form for Exits. Mirrors `EntryForm` with a
 * "Beneficiario" (recipient) selector instead of "Donante" (donor).
 */
export function ExitForm({
  mode,
  item,
  initialRecipient,
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel = 'Guardar',
}: ExitFormProps) {
  const schema = buildExitSchema(mode)
  const { control, handleSubmit } = useForm<ExitFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
    // Reactive default values: resets the form whenever `defaultValues` changes
    // (e.g. once the edit page's async `useExit` fetch resolves).
    values: defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Article section — primary action, visually prominent */}
      <section aria-labelledby="section-exit-item">
        <h2
          id="section-exit-item"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Artículo
        </h2>
        <FieldGroup>
          {mode === 'create' ? (
            <Controller
              control={control}
              name="itemId"
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="itemId">
                    Artículo
                    <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
                  </FieldLabel>
                  <SearchableSelect
                    value={field.value}
                    onChange={(option) => field.onChange(option?.id ?? null)}
                    fetchOptions={fetchItemOptions}
                    placeholder="Buscar artículo por nombre..."
                    ariaInvalid={!!fieldState.error}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          ) : (
            <Field>
              <FieldLabel>Artículo</FieldLabel>
              <p className="rounded-lg border border-input bg-muted/50 px-2.5 py-1.5 text-sm">
                {item?.name ?? '—'}
              </p>
            </Field>
          )}
        </FieldGroup>
      </section>

      {/* Detail section */}
      <section aria-labelledby="section-exit-detail">
        <h2
          id="section-exit-detail"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Detalle
        </h2>
        <FieldGroup>
          <FormField
            control={control}
            name="quantity"
            label="Cantidad"
            variant="number"
            placeholder="0"
            required
          />

          <Controller
            control={control}
            name="recipientId"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="recipientId">Beneficiario</FieldLabel>
                <SearchableSelect
                  value={field.value}
                  defaultLabel={
                    initialRecipient
                      ? `${initialRecipient.names} ${initialRecipient.surnames}`
                      : null
                  }
                  onChange={(option) => field.onChange(option?.id ?? null)}
                  fetchOptions={fetchRecipientOptions}
                  placeholder="Buscar beneficiario por nombre..."
                  ariaInvalid={!!fieldState.error}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <FormField control={control} name="notes" label="Notas" variant="textarea" />
        </FieldGroup>
      </section>

      <Button type="submit" disabled={submitting} className="w-full" size="lg">
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Guardando…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
