import { useState, useEffect } from "react"

interface WeatherData {
    temperature: number
    condition: "clear" | "rain" | "snow" | "cloudy"
    isDay: boolean
}

export interface SeasonData {
    season: "spring" | "summer" | "autumn" | "winter"
    weather: WeatherData
    loading: boolean
    error: string | null
}

export function useWeather() {
    const [data, setData] = useState<SeasonData>({
        season: "spring", // Default
        weather: { temperature: 20, condition: "clear", isDay: true },
        loading: true,
        error: null
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setData(prev => ({ ...prev, loading: false, error: "Geolocation not supported" }))
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords

                    // 1. Determine Season based on Month & Latitude
                    const month = new Date().getMonth() // 0-11
                    const isNorthern = latitude > 0
                    let season: "spring" | "summer" | "autumn" | "winter" = "spring"

                    if (isNorthern) {
                        if (month >= 2 && month <= 4) season = "spring"
                        else if (month >= 5 && month <= 7) season = "summer"
                        else if (month >= 8 && month <= 10) season = "autumn"
                        else season = "winter"
                    } else {
                        // Southern Hemisphere
                        if (month >= 2 && month <= 4) season = "autumn"
                        else if (month >= 5 && month <= 7) season = "winter"
                        else if (month >= 8 && month <= 10) season = "spring"
                        else season = "summer"
                    }

                    // 2. Fetch Weather from Open-Meteo
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`
                    )
                    const json = await response.json()
                    const current = json.current

                    // Map WMO Weather Codes to Simplified Conditions
                    // 0: Clear, 1-3: Cloudy, 51-67: Rain, 71-77: Snow
                    let condition: "clear" | "rain" | "snow" | "cloudy" = "clear"
                    const code = current.weather_code

                    if (code >= 1 && code <= 3) condition = "cloudy"
                    else if (code >= 51 && code <= 67) condition = "rain"
                    else if (code >= 80 && code <= 82) condition = "rain" // Showers
                    else if (code >= 71 && code <= 77) condition = "snow"
                    else if (code >= 85 && code <= 86) condition = "snow"
                    else if (code >= 95) condition = "rain" // Thunderstorm

                    setData({
                        season,
                        weather: {
                            temperature: current.temperature_2m,
                            condition: condition,
                            isDay: !!current.is_day
                        },
                        loading: false,
                        error: null
                    })

                } catch (err: any) {
                    console.error("Weather fetch error:", err)
                    setData(prev => ({ ...prev, loading: false, error: "Failed to fetch weather" }))
                }
            },
            (error) => {
                console.warn("Geolocation access denied/failed, using defaults:", error)
                // Fallback to seasonal default based on date only (assuming Northern Hemisphere default)
                const month = new Date().getMonth()
                let season: "spring" | "summer" | "autumn" | "winter" = "spring"
                if (month >= 2 && month <= 4) season = "spring"
                else if (month >= 5 && month <= 7) season = "summer"
                else if (month >= 8 && month <= 10) season = "autumn"
                else season = "winter"

                setData(prev => ({
                    ...prev,
                    season,
                    loading: false,
                    error: null // Clear error to show default UI
                }))
            }
        )
    }, [])

    return data
}
