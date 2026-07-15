import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, Menu, X, Wallet, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Statement Analyser', path: '/analyser', icon: FileText },
  { name: 'Money Movement', path: '/cashflow', icon: TrendingUp },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-svh">
      {/* Mobile Top Header */}
      <header className="glass-panel sticky top-0 z-40 flex h-16 items-center justify-between rounded-none border-x-0 border-t-0 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="brand-gradient-bg flex size-8 items-center justify-center rounded-xl text-white">
            <Wallet className="size-4" />
          </div>
          <span className="font-heading text-sm font-semibold">Statement Analyser</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5"
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'glass-panel fixed bottom-4 top-20 z-40 flex w-64 flex-col rounded-2xl transition-transform duration-300 md:top-4 md:left-4 md:translate-x-0',
          sidebarOpen ? 'left-4 translate-x-0' : '-left-full translate-x-0 md:left-4'
        )}
      >
        {/* Desktop Brand Logo */}
        <div className="hidden items-center gap-2 border-b border-foreground/10 px-5 py-4 md:flex">
          <div className="brand-gradient-bg flex size-8 items-center justify-center rounded-xl text-white">
            <Wallet className="size-4" />
          </div>
          <span className="font-heading text-sm font-semibold">Statement Analyser</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'brand-gradient-bg text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop theme toggle */}
        <div className="hidden items-center justify-between border-t border-foreground/10 px-5 py-3 md:flex">
          <span className="text-xs text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-h-svh flex-col md:pl-72">
        <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
