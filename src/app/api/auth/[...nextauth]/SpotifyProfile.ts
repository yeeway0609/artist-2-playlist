import { JWT } from 'next-auth/jwt'
import SpotifyProvider from 'next-auth/providers/spotify'

if (!process.env.SPOTIFY_CLIENT_ID) {
  throw new Error('Missing SPOTIFY_CLIENT_ID')
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing SPOTIFY_CLIENT_SECRET')
}

const spotifyProfile = SpotifyProvider({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

const authURL = new URL('https://accounts.spotify.com/authorize')

const scopes = [
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
]

authURL.searchParams.append('scope', scopes.join(' '))

spotifyProfile.authorization = authURL.toString()

export default spotifyProfile

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

export async function refreshAccessToken(token: JWT) {
  try {
    // Authorization Code flow requires Basic auth with the client credentials.
    const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token as string,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    // Spotify returns expires_in (seconds); derive the absolute Unix-seconds expiry.
    const expiresIn: number = refreshedTokens.expires_in
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      token_type: refreshedTokens.token_type,
      expires_at: expiresAt,
      expires_in: expiresIn,
      // Spotify may issue a new refresh token; fall back to the current one if not.
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
      scope: refreshedTokens.scope ?? token.scope,
      error: undefined,
    }
  } catch (error: any) {
    console.error('Failed to refresh Spotify access token', error)

    // Since 2026-07-20 Spotify expires refresh tokens after 6 months and returns
    // 400 invalid_grant. Such a token is dead: discard it (do not retry) so the
    // frontend forces re-authorization via signIn(). Transient errors keep the
    // refresh token so a later attempt can still succeed.
    const isInvalidGrant = error?.error === 'invalid_grant'

    return {
      ...token,
      refresh_token: isInvalidGrant ? undefined : token.refresh_token,
      error: 'RefreshAccessTokenError',
    }
  }
}
