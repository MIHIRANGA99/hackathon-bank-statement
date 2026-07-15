import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const REDIRECT_DELAY_MS = 2500

export function WelcomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
      <p className="text-muted-foreground">Taking you to your dashboard…</p>
    </div>
  )
}
