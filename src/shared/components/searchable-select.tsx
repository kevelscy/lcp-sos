import { useEffect, useId, useRef, useState } from 'react'
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
 * Reusable API-backed searchable select with keyboard navigation, ARIA combobox
 * pattern, clear button, loading indicator, and mobile-friendly touch targets.
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
  const [activeIndex, setActiveIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  // Reflects a label computed elsewhere (e.g. once an async edit-mode fetch resolves).
  useEffect(() => {
    setLabel(defaultLabel ?? null)
  }, [defaultLabel])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setActiveIndex(-1)

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
    // Focus the input when switching from selection chip to search mode
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(option: SearchableSelectOption) {
    setLabel(option.label)
    onChange(option)
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation()
    setLabel(null)
    onChange(null)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        handleOpen()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, options.length - 1))
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      }
      case 'Enter': {
        event.preventDefault()
        if (activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex])
        }
        break
      }
      case 'Escape': {
        event.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
      }
    }
  }

  // Scroll active item into view when keyboard-navigating
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const hasSelection = value != null && label
  const activeDescendant =
    activeIndex >= 0 && options[activeIndex]
      ? `${listboxId}-option-${options[activeIndex].id}`
      : undefined

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {hasSelection && !open ? (
        // Selection chip
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={ariaInvalid}
          aria-controls={listboxId}
          className="flex h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
        >
          <span className="truncate">{label}</span>
          <button
            type="button"
            aria-label="Quitar selección"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </button>
      ) : (
        // Search input
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          className="h-11"
        />
      )}

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5">
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-label={placeholder}
            className="max-h-60 overflow-y-auto py-1"
          >
            {loading ? (
              <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Buscando…
              </li>
            ) : options.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</li>
            ) : (
              options.map((option, index) => (
                <li
                  key={option.id}
                  id={`${listboxId}-option-${option.id}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition-colors',
                      index === activeIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
