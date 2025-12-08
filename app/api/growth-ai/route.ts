import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { message, context, intent } = await request.json()

    // Check for API key first
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.trim() === "") {
      console.error("[Growth AI] GEMINI_API_KEY environment variable is not set or empty")
      return Response.json(
        {
          error: "Gemini API key not configured",
          details: "Please set the GEMINI_API_KEY environment variable in your .env.local file"
        },
        { status: 500 }
      )
    }

    // Initialize client with API key
    let client: any
    let initAttempts = 0
    const maxAttempts = 3

    while (initAttempts < maxAttempts) {
      try {
        client = new GoogleGenerativeAI(apiKey)
        break
      } catch (initErr) {
        initAttempts++
        console.error(`[Growth AI] Failed to initialize client (attempt ${initAttempts}/${maxAttempts}):`, initErr)
        if (initAttempts === maxAttempts) {
          throw new Error("Failed to initialize Gemini AI client after multiple attempts")
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * initAttempts))
      }
    }

    // Initialize with gemini-2.0-flash model
    const model = client.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    let systemPrompt = "";
    let userPrompt = "";

    if (intent === "schedule") {
      systemPrompt = `You are an expert productivity planner and scheduler (AI Flow Architect).
        
USER CONTEXT:
- Pending Tasks: ${JSON.stringify(context.pendingTasks)}
- Current Time: ${new Date().toLocaleTimeString()}
- Date: ${context.today}
- Task Completion Rate: ${context.completionRate || 0}%
- Streak: ${context.streak}

YOUR GOAL:
1. Analyze the pending tasks.
2. Create a realistic, flow-inducing schedule for the rest of today.
3. Prioritize tasks effectively.
4. Insert short breaks.
5. If there are too many tasks, suggest deferring low-priority ones.

RESPONSE FORMAT:
Strictly return a valid JSON object. Do not include markdown code blocks.
Structure:
{
  "analysis": "A brief summary (max 2 sentences).",
  "taskSuggestions": [
    {
      "title": "Task title",
      "duration": number (minutes),
      "time": "HH:MM",
      "priority": "high" | "medium" | "low",
      "category": "work" | "personal" | "learning" | "health"
    }
  ]
}`
      userPrompt = `Please reschedule my day. ${message || ""}`;

    } else {
      systemPrompt = `You are Growth AI, a compassionate productivity assistant.

CURRENT USER CONTEXT:
- Today's Tasks: ${context.todayTasks}
- Focus Sessions: ${context.todayPomodoros}
- Pending Tasks: ${context.pendingTasks}
- Streak: ${context.streak} days

GUIDELINES:
1. Be encouraging, warm, and supportive
2. Provide specific, actionable advice
3. Reference their data points
4. Keep responses clear to read

SPECIAL INSTRUCTIONS FOR TASK CREATION:
- When user asks to add tasks, structure response with:
"TASK_SUGGESTION: [title] | [duration]min | [time] | [priority] | [category]"

RESPONSE FORMAT:
- Use markdown with bold headers
- Include emojis
- End with encouragement`
      userPrompt = message;
    }

    // Generate Content
    let result;
    try {
      result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: `${systemPrompt}\n\nUSER MESSAGE: ${userPrompt}`
          }]
        }]
      })
    } catch (genErr: any) {
      console.error("[Growth AI] Generation failed:", genErr)
      return Response.json({ error: "AI Generation Failed", details: genErr.message }, { status: 503 })
    }

    const response = await result.response
    const responseText = response.text()

    if (!responseText) {
      throw new Error("Empty response from Gemini")
    }

    const taskSuggestions: Array<{
      title: string
      duration: number
      time: string
      priority: "low" | "medium" | "high"
      category: "work" | "personal" | "learning" | "health"
    }> = []

    // Parse Response
    if (intent === "schedule") {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText
        const scheduleData = JSON.parse(cleanJson)

        return Response.json({
          response: scheduleData.analysis,
          taskSuggestions: scheduleData.taskSuggestions
        })
      } catch (e) {
        console.error("[Growth AI] Failed to parse schedule JSON:", e)
        return Response.json({
          response: "I created a schedule, but couldn't format it perfectly. Here is the plan:\n" + responseText
        })
      }
    } else {
      // Parse task suggestions
      const lines = responseText.split("\n")

      for (const line of lines) {
        if (line.includes("TASK_SUGGESTION:")) {
          try {
            const parts = line.split("|").map((p: string) => p.trim())
            const titlePart = parts[0].replace(/TASK_SUGGESTION:|[*`-]/g, "").trim()
            const durationPart = parts[1] ? parseInt(parts[1].replace(/[^0-9]/g, "")) : 30
            const timePart = parts[2] || "09:00"
            const priorityPart = (parts[3]?.toLowerCase() || "medium") as "low" | "medium" | "high"
            const categoryPart = (parts[4]?.toLowerCase() || "work") as "work" | "personal" | "learning" | "health"

            if (titlePart) {
              taskSuggestions.push({
                title: titlePart,
                duration: durationPart,
                time: timePart,
                priority: ["low", "medium", "high"].includes(priorityPart) ? priorityPart : "medium",
                category: ["work", "personal", "learning", "health"].includes(categoryPart) ? categoryPart : "work"
              })
            }
          } catch (err) {
            console.log("Failed to parse task suggestion line:", line)
          }
        }
      }

      return Response.json({
        response: responseText,
        taskSuggestions
      })
    }

  } catch (error) {
    console.error("[Growth AI] Error processing request:", error)
    return Response.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}
