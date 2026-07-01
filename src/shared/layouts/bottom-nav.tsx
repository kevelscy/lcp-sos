import { NavLink } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Box,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface BottomNavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: BottomNavItem[] = [
  { to: '/inventory', label: 'Inventario', icon: BarChart3 },
  { to: '/entries', label: 'Entradas', icon: ArrowDownToLine },
  { to: '/exits', label: 'Salidas', icon: ArrowUpFromLine },
  { to: '/persons', label: 'Personas', icon: Users },
  { to: '/items', label: 'Artículos', icon: Box },
]

/** Fixed 5-tab bottom navigation bar. Mobile-first; always visible. */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-1px_3px_rgb(0_0_0/0.06)] backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-full px-3 py-1 transition-all duration-200',
                      isActive && 'bg-primary/10'
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      className="absolute top-1 size-1 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
