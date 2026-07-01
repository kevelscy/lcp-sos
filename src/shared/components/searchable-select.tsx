import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { cn } from '@/shared/lib/utils'

export interface SearchableSelectOption {
  id: number
  label: string
  description?: string
}

interface SearchableSelectProps {
  /** Currently selected id, or `null` when nothing is selected. */
  value: number | null
  /**
   * Label to show for `value` before the user has interacted with the
   * dropdown (e.g. an entity fetched separately for an edit form). Only used
   * on first render / whenever it changes — once the user picks an option
   * from the dropdown, the picked option's own label takes over.
   */
  defaultLabel?: string | null
  onChange: (option: SearchableSelectOption | null) => void
  /** Debounced (300ms) on every keystroke; called once immediately on open with `''`. */
  fetchOptions: (query: string) => Promise<SearchableSelectOption[]>
  placeholder?: string
  emptyLabel?: string
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
}

/**
 * Reusable API-backed searchable select. Text input with debounced search,
 * a dropdown list of results, a "selected" chip state with a clear button,
 * and a loading indicator. Mobile-friendly: full-width, 32px+ touch targets.
 *
 * Used for item and person (donor/recipient) selection in Entries/Exits forms.
 */
export function SearchableSelect({
  value,
  defaultLabel,
  onChange,
  fetchOptions,
  placeholder = 'Buscar...',
  emptyLabel = 'Sin resultados',
  disabled,
  ariaInvalid,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState<string | null>(defaultLabel ?? null)
  const [options, setOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reflects a label computed elsewhere (e.g. once an async edit-mode fetch resolves).
  useEffect(() => {
    setLabel(defaultLabel ?? null)
  }, [defaultLabel])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)

    fetchOptions(debouncedQuery)
      .then((results) => {
        if (!cancelled) setOptions(results)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    if (disabled) return
    setQuery('')
    setOpen(true)
  }

  function handleSelect(option: SearchableSelectOption) {
    setLabel(option.label)
    onChange(option)
    setOpen(false)
    setQuery('')
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation()
    setLabel(null)
    onChange(null)
  }

  const hasSelection = value != null && label

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {hasSelection && !open ? (
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          aria-invalid={ariaInvalid}
          className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
        >
          <span className="truncate">{label}</span>
          <span
            role="button"
            aria-label="Quitar selección"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </span>
        </button>
      ) : (
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={handleOpen}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={ariaInvalid}
        />
      )}

      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Buscando…
            </div>
          ) : options.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <ul>
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
