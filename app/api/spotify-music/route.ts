import { type NextRequest, NextResponse } from "next/server"

const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

export async function POST(request: NextRequest) {
  try {
    const { action, query, accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "No access token provided" }, { status: 401 })
    }

    let endpoint = ""
    let method = "GET"
    let body = null

    switch (action) {
      case "search":
        endpoint = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query || "lofi study")}&type=playlist&limit=10`
        break
      case "get-devices":
        endpoint = `${SPOTIFY_API_BASE}/me/player/devices`
        break
      case "play":
        endpoint = `${SPOTIFY_API_BASE}/me/player/play`
        method = "PUT"
        body = { context_uri: query }
        break
      case "pause":
        endpoint = `${SPOTIFY_API_BASE}/me/player/pause`
        method = "PUT"
        break
      case "get-current":
        endpoint = `${SPOTIFY_API_BASE}/me/player/currently-playing`
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(endpoint, options)
    const data = await response.json()

    if (!response.ok) {
      console.error("[Planthesia] Spotify API error:", data)
      return NextResponse.json({ error: data.error?.message || "Spotify API error" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Planthesia] Spotify error:", error)
    return NextResponse.json({ error: "Failed to communicate with Spotify" }, { status: 500 })
  }
}
