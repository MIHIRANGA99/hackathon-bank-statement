import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, Menu, X, Landmark, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Statement Analyser',
      path: '/analyser',
      icon: FileText,
    },
    {
      name: 'Money Movement',
      path: '/cashflow',
      icon: TrendingUp,
    },
  ]

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Mobile Top Header */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Landmark className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">FinAnalytica</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1.5 hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed bottom-0 top-16 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 md:top-0 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Desktop Brand Logo */}
        <div className="hidden h-16 items-center gap-2 border-b px-6 md:flex">
          <Landmark className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">FinAnalytica</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="md:pl-64 min-h-svh flex flex-col">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
