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
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )
              }
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
