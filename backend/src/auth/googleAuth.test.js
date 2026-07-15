import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGoogleAuthUrl, buildSessionCookieHeader } from './googleAuth.js'

test('buildGoogleAuthUrl includes the expected OAuth parameters', () => {
  const url = buildGoogleAuthUrl({
    clientId: 'client-id',
    redirectUri: 'http://localhost:4000/api/auth/google/callback',
    state: 'abc123',
  })

  assert.match(url, /^https:\/\/accounts.google.com\/o\/oauth2\/v2\/auth\?/) 
  assert.match(url, /client_id=client-id/) 
  assert.match(url, /redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Fgoogle%2Fcallback/) 
  assert.match(url, /response_type=code/) 
  assert.match(url, /state=abc123/) 
})

test('buildSessionCookieHeader sets a secure, HttpOnly session cookie', () => {
  const header = buildSessionCookieHeader('session-123')

  assert.match(header, /connect\.sid=session-123/) 
  assert.match(header, /HttpOnly/) 
  assert.match(header, /Path=\//) 
  assert.match(header, /SameSite=Lax/) 
})
