export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { message, context, intent } = await request.json()

    await new Promise(resolve => setTimeout(resolve, 800))

    if (intent === "schedule") {
      const pendingTasks = context.pendingTasks || []
      const taskSuggestions = pendingTasks.map((t: any, index: number) => ({
        title: t.title || "Focus Task",
        duration: t.duration || 30,
        time: `${9 + index}:00`,
        priority: t.priority || "medium",
        category: t.category || "work"
      }))

      // Add a break if tasks exist
      if (taskSuggestions.length > 0) {
        taskSuggestions.splice(Math.min(2, taskSuggestions.length), 0, {
          title: "Recharge Break",
          duration: 15,
          time: "11:00",
          priority: "medium",
          category: "health"
        })
      }

      return Response.json({
        response: "I've organized your pending tasks into a focus schedule. I've also added a break to keep you fresh. You can drag and drop to adjust.",
        taskSuggestions
      })
    }

    let responseText = "I'm here to help you grow. How can I support your productivity today?"
    const lowerMsg = (message || "").toLowerCase()
    const taskSuggestions: any[] = []

    if (lowerMsg.includes("tired") || lowerMsg.includes("stress") || lowerMsg.includes("break")) {
      responseText = "It sounds like you need a moment. 🌿 Try the '4-7-8' breathing technique: Inhale for 4s, hold for 7s, exhale for 8s. Shall I schedule a 15-minute break for you?"
      taskSuggestions.push({
        title: "Breathing Exercise",
        duration: 15,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: "high",
        category: "health"
      })
    } else if (lowerMsg.includes("plan") || lowerMsg.includes("schedule")) {
      responseText = "I can help with that! Click the 'Plan Day' button to automatically organize your pending tasks, or tell me specific tasks to add."
    } else if (lowerMsg.includes("motivation") || lowerMsg.includes("stuck")) {
      responseText = "Remember: 'The best way to get something done is to begin.' You've got this! Start with just 5 minutes of focus."
    } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      responseText = "Hello! I'm ready to help you reach your goals today. What's on your mind?"
    }

    return Response.json({
      response: responseText,
      taskSuggestions
    })

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
