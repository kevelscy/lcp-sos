import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

export interface FormFieldSelectOption {
  value: string
  label: string
}

type FormFieldVariant = 'text' | 'email' | 'number' | 'textarea' | 'select'

export interface FormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  variant?: FormFieldVariant
  placeholder?: string
  /** Required when `variant="select"`. */
  options?: FormFieldSelectOption[]
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  className?: string
}

/**
 * RHF-controlled field wrapper built on shadcn's presentational
 * `Field`/`FieldLabel`/`FieldError` primitives (this registry ships `Field`,
 * not the legacy `Form`/`FormField` context pattern — see Phase 4.1 note in
 * the tasks artifact). Supports text/email/number inputs, textarea, and select.
 */
export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  variant = 'text',
  placeholder,
  options = [],
  disabled,
  required,
  autoComplete,
  className,
}: FormFieldProps<TFieldValues>) {
  const errorId = `${name}-error`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error

        return (
          <Field data-invalid={hasError} className={className}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && (
                <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
              )}
            </FieldLabel>

            {variant === 'textarea' && (
              <Textarea
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={hasError}
                aria-required={required}
                aria-describedby={hasError ? errorId : undefined}
                value={(field.value as string | undefined) ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}

            {variant === 'select' && (
              <Select
                value={(field.value as string | undefined) ?? undefined}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  id={name}
                  aria-invalid={hasError}
                  aria-required={required}
                  aria-describedby={hasError ? errorId : undefined}
                  className="h-11 w-full"
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {variant !== 'textarea' && variant !== 'select' && (
              <Input
                id={name}
                type={variant === 'number' ? 'number' : variant}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={hasError}
                aria-required={required}
                aria-describedby={hasError ? errorId : undefined}
                className="h-11"
                value={(field.value as string | number | undefined) ?? ''}
                onChange={
                  variant === 'number'
                    ? (event) =>
                        field.onChange(
                          event.target.value === '' ? '' : event.target.valueAsNumber
                        )
                    : field.onChange
                }
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}

            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
