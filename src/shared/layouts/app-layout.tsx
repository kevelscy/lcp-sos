import { useEffect, useRef, useState } from 'react'
import { LogOut, User as UserIcon } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'

import { BottomNav } from '@/shared/layouts/bottom-nav'
import { buttonVariants } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/stores/auth-store'

/** App shell: top bar (title + user menu), scrollable content, fixed bottom nav. */
export function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [scrolled, setScrolled] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function handleScroll() {
      setScrolled(el!.scrollTop > 4)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header
        className={cn(
          'sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm transition-shadow duration-200',
          scrolled && 'shadow-sm'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Brand accent dot */}
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">LCP Inventario</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
            aria-label="Cuenta de usuario"
          >
            <UserIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">Sesión iniciada como</span>
              <span className="block truncate font-medium">{user?.name ?? user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto px-4 pt-5 pb-24">
        <div className="mx-auto w-full max-w-2xl">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
