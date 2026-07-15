import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/AuthContext'
import { BadgeCheck, Wallet } from 'lucide-react'

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-10 py-12">
        <div className="brand-gradient-bg flex size-16 items-center justify-center rounded-2xl text-white shadow-lg">
          <Wallet className="size-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to <span className="brand-gradient-text">Statement Analyser</span>
          </h1>
          <p className="text-muted-foreground">
            {user
              ? 'Taking you to your dashboard…'
              : 'Sign in with your Google account to access your personalised dashboard and insights.'}
          </p>
        </div>

        {user ? (
          <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-foreground/10">
            <div className="brand-gradient-bg h-full w-1/3 animate-[loading-bar_1.4s_ease-in-out_infinite]" />
          </div>
        ) : (
          <Button onClick={signInWithGoogle} className="w-full justify-center" disabled={loading || isRedirecting}>
            <BadgeCheck className="size-4" />
            {loading ? 'Checking session…' : 'Continue with Google'}
          </Button>
        )}
      </div>
    </div>
  )
}
