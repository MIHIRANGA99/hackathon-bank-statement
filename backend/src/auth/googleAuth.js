import crypto from 'node:crypto'

export function buildGoogleAuthUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function buildSessionCookieHeader(sessionId) {
  const cookieParts = [
    `connect.sid=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]

  return cookieParts.join('; ')
}

export function createSessionId() {
  return crypto.randomBytes(24).toString('hex')
}
