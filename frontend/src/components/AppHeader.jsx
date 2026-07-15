import { NavLink } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analyser', label: 'Analyser' },
]

export function AppHeader() {
  return (
    <header className="glass-panel sticky top-4 z-40 mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="brand-gradient-bg flex size-8 items-center justify-center rounded-xl text-white">
          <Wallet className="size-4" />
        </div>
        <span className="font-heading text-sm font-semibold">Statement Analyser</span>
      </div>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  )
}
