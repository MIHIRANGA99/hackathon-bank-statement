import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Analyse a bank statement to see insights here.</p>
      <Button render={<Link to="/analyser" />} nativeButton={false}>
        <FileText className="size-4" />
        Go to Account Statement Analyser
      </Button>
    </div>
  )
}
