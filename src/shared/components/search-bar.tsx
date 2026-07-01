import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { cn } from '@/shared/lib/utils'

export interface SearchBarFilterPill {
  label: string
  active: boolean
  onToggle: () => void
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Optional toggleable filter chips rendered below the input. */
  filters?: SearchBarFilterPill[]
  className?: string
}

/**
 * Debounced search input with a leading icon, clear button, and optional filter pills.
 * Full-width and mobile-first by default.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  filters,
  className,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  // Keep local state in sync if the parent resets `value` externally.
  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
    // Only re-run when the debounced value changes — `value`/`onChange` are read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  function handleClear() {
    setInputValue('')
    onChange('')
  }

  const hasValue = inputValue.length > 0

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div role="search" className="relative w-full">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Buscar"
          className={cn(
            'h-11 pl-9 transition-shadow duration-150 focus-visible:shadow-sm',
            hasValue && 'pr-9'
          )}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={filter.onToggle}
              aria-pressed={filter.active}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter.active
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
