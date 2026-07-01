interface PlaceholderPageProps {
  title: string
}

/**
 * Temporary placeholder rendered for feature pages not yet implemented.
 * Replaced with real feature UI in Phases 5-9.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-1 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">Próximamente</p>
    </div>
  )
}
