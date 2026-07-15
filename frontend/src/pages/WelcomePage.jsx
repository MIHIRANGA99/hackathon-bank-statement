import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/AuthContext'
import { BadgeCheck } from 'lucide-react'

const REDIRECT_DELAY_MS = 1200

export function WelcomePage() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        setIsRedirecting(true)
        navigate('/analyser')
      }, REDIRECT_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [loading, navigate, user])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="max-w-md rounded-2xl border border-border bg-background/70 p-8 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Bank Statement Analyser</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Welcome</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in with your Google account to access your personalised dashboard and insights.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={signInWithGoogle} className="justify-center" disabled={loading || isRedirecting}>
            <BadgeCheck className="size-4" />
            {loading ? 'Checking session…' : 'Continue with Google'}
          </Button>
          {user ? (
            <Button variant="outline" onClick={signOut} disabled={isRedirecting}>
              Sign out
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
