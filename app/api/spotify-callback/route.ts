import { type NextRequest, NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ""
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/spotify-callback`

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`/dashboard/pomodoro?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect("/dashboard/pomodoro?error=no_code")
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
    })

    const tokenData = await tokenResponse.json()


    if (tokenData.access_token) {
      const response = NextResponse.redirect("/dashboard/pomodoro?spotify_connected=true")
      response.cookies.set("spotify_access_token", tokenData.access_token, {
        maxAge: tokenData.expires_in,
        secure: true,
        sameSite: "lax",
      })
      response.cookies.set("spotify_refresh_token", tokenData.refresh_token || "", {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        secure: true,
        sameSite: "lax",
      })
      return response
    }

    console.error("[Planthesia] No access token in response:", tokenData)
    return NextResponse.redirect("/dashboard/pomodoro?error=token_failed")
  } catch (error) {
    console.error("[Planthesia] Spotify callback error:", error)
    return NextResponse.redirect("/dashboard/pomodoro?error=callback_error")
  }
}
