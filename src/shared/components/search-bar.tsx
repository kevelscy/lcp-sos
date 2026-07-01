import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

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
 * Debounced search input with a leading icon and optional filter pills.
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

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-8"
        />
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
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                filter.active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
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
