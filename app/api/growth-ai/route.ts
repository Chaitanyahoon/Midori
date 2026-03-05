import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";

function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if the model wrapped the JSON in them
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const { message, context, intent } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    console.log("[Growth AI] Initializing with key prefix:", apiKey.substring(0, 8) + "...");
    const ai = new GoogleGenAI({ apiKey });

    if (intent === "schedule") {
      const pendingTasks = context.pendingTasks || [];
      const tasksStr = pendingTasks.map((t: any) => `- ${t.title} (Priority: ${t.priority}, Category: ${t.category})`).join('\n');

      const userName = context.userName || "the user";
      const userTone = context.userTone || "balanced";

      const prompt = `You are an expert productivity assistant for an app called Planthesia.
The user's name is ${userName}. Speak to them directly using a ${userTone} tone.

The user has the following pending tasks:
${tasksStr}

Create a schedule for them starting at 09:00 AM. 
For each task, assign a realistic duration in minutes (like 30, 45, 60), a start time (like "09:00", "09:45"), and keep the original priority and category.
CRITICAL: You MUST include the exact "id" of the original task in the "originalId" field of the response so we can update it.
If there are multiple tasks, be sure to inject a 15-minute "Recharge Break" (Category: health, Priority: medium, no originalId) somewhere in the middle of the schedule to prevent burnout.

Respond ONLY with a JSON object in the exact following structure:
{
  "response": "A short, encouraging message about the schedule.",
  "taskSuggestions": [
    {
      "title": "Task Name",
      "duration": 30,
      "time": "09:00",
      "priority": "high",
      "category": "work",
      "originalId": "example-id-from-prompt"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const responseText = response.text || "{}";
      const cleanedText = cleanJsonResponse(responseText);
      const parsed = JSON.parse(cleanedText);

      return Response.json(parsed);
    }

    // Default chat intent
    const userName = context.userName || "User";
    const userTone = context.userTone || "balanced";

    const systemPrompt = `You are a helpful and empathetic productivity botanist assistant for an app called Planthesia. 
The user's name is ${userName}. Please use a ${userTone} tone of voice when speaking with them.
They have completed ${context.todayTasks || 0} tasks and ${context.todayPomodoros || 0} focus sessions today (Completion rate: ${context.completionRate || 0}%).
They have ${context.pendingTasks || 0} pending tasks.

Keep your responses concise, encouraging, and occasionally use nature/plant emojis.
Provide actionable advice. If the user seems stressed or tired, suggest a break.
You MUST suggest at least one actionable task based on their query if it implies they need to get work done. Return your response as a JSON object with this structure:
{
  "response": "Your message here",
  "taskSuggestions": [
    // If the user needs to do something actionable, ALWAYS generate one or more objects here:
    // { "title": "10-Min Stretch", "duration": 10, "time": "any", "priority": "medium", "category": "health" }
    // Leave array empty ONLY if no specific task makes sense. Max 3 suggestions.
  ]
}`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will respond in JSON format as requested.' }] },
        { role: 'user', parts: [{ text: message || "Hello" }] }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description: "Your message here"
            },
            taskSuggestions: {
              type: Type.ARRAY,
              description: "Optional array of actionable tasks. Leave empty if no specific task makes sense. Max 3 suggestions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  duration: { type: Type.INTEGER, description: "Duration in minutes" },
                  time: { type: Type.STRING, description: "Time of day (e.g. '09:00', '14:30', or 'any')" },
                  priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  category: { type: Type.STRING, enum: ["work", "personal", "learning", "health"] },
                  originalId: { type: Type.STRING, description: "The ID of the existing task being rescheduled, if applicable. Must match exactly." }
                },
                required: ["title", "duration", "time", "priority", "category"]
              }
            }
          },
          required: ["response", "taskSuggestions"]
        }
      }
    });

    const responseText = response.text || "{}";
    const cleanedText = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleanedText);

    return Response.json({
      response: parsed.response || "I'm here to help you grow. How can I support your productivity today?",
      taskSuggestions: parsed.taskSuggestions || []
    });

  } catch (error) {
    console.error("[Growth AI] Error processing request:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}
