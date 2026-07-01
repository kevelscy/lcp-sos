import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ScanBarcode } from 'lucide-react'

import { BarcodeScanner } from '@/shared/components/barcode-scanner'
import { FormField } from '@/shared/components/form-field'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { itemSchema, type ItemFormValues } from '@/features/items/schemas'

/** Suggested common units — the input also accepts free text. */
const UNIT_SUGGESTIONS = ['Kilogramos (kg)', 'Unidades', 'Litros (L)', 'Cajas']

const EMPTY_VALUES: ItemFormValues = { name: '', barcode: '', unit: '' }

interface ItemFormProps {
  /** Pre-populated values for edit mode. Loaded asynchronously — the form resets when this changes. */
  defaultValues?: ItemFormValues
  onSubmit: (values: ItemFormValues) => Promise<void> | void
  submitting?: boolean
  submitLabel?: string
}

/**
 * Reusable create/edit form for Items. The barcode field has a companion
 * "Escanear" button that opens `BarcodeScanner` and fills the field with the
 * decoded value. Field-level Spanish validation via `itemSchema`.
 */
export function ItemForm({
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel = 'Guardar',
}: ItemFormProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const { control, handleSubmit, setValue } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: EMPTY_VALUES,
    // Reactive default values: resets the form whenever `defaultValues` changes
    // (e.g. once the edit page's async `useItem` fetch resolves).
    values: defaultValues,
  })

  function handleScan(code: string) {
    setValue('barcode', code, { shouldValidate: true, shouldDirty: true })
    setScannerOpen(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FieldGroup>
          <FormField
            control={control}
            name="name"
            label="Nombre del artículo"
            placeholder="Nombre del artículo"
          />

          <Controller
            control={control}
            name="barcode"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="barcode">Código de barras</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    placeholder="Código de barras"
                    aria-invalid={!!fieldState.error}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
                    <ScanBarcode />
                    Escanear
                  </Button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="unit"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="unit">Unidad de medida</FieldLabel>
                <Input
                  id="unit"
                  list="unit-suggestions"
                  placeholder="Kilogramos (kg), Unidades, Litros (L)..."
                  aria-invalid={!!fieldState.error}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
                <datalist id="unit-suggestions">
                  {UNIT_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Guardando…' : submitLabel}
          </Button>
        </FieldGroup>
      </form>

      <BarcodeScanner
        open={scannerOpen}
        onScan={handleScan}
        onClose={() => setScannerOpen(false)}
      />
    </>
  )
}
