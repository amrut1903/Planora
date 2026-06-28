import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing Gemini API Key");
    return new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  const generateWithRetry = async (ai: any, request: any, retries = 3, delay = 2000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await ai.models.generateContent(request);
      } catch (e: any) {
        if ((e.status === 'UNAVAILABLE' || e.status === 'RESOURCE_EXHAUSTED' || e.message?.includes('503') || e.message?.includes('429')) && i < retries - 1) {
          console.warn(`Gemini API error (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 1.5;
        } else {
          throw e;
        }
      }
    }
  };

  // API Routes
  app.post("/api/gemini/parseBrainDump", async (req, res) => {
    try {
      const { text, profile } = req.body;
      const ai = getGeminiClient();
      const prompt = `
        You are an AI assistant that extracts tasks from user input.
        Current time context: ${new Date().toISOString()}
        Today is: ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]}
        Current local time (India): ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        User Profile: ${JSON.stringify(profile)}
        Input: "${text}"
        Extract the tasks and return a JSON array of objects with these exact keys:
        - title (string)
        - emoji (string)
        - category ("assignment"|"meeting"|"personal"|"study"|"other")
        - priority ("high"|"medium"|"low")
        - estimatedMinutes (number, nullable)
        - deadline (string in ISO 8601 format, nullable. Determine from context like "by 6pm" or "tomorrow". Be precise based on current time. When calculating deadlines, always pick the NEXT upcoming occurrence of a day if the day has already passed this week.)
        Return ONLY valid JSON.
      `;
      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
      return res.json([]);
    } catch (error: any) {
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Parse Brain Dump Error:", error.message || error);
        return res.status(500).json({ error: error.message || 'Failed to parse brain dump due to API limits' });
      }
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'No messages provided' });
      }
      const ai = getGeminiClient();
      const currentHour = new Date().getHours();
      let landscapeState = "Night (Deep blues, moonlight, Milky Way, distant Indian stupa dome)";
      if (currentHour >= 6 && currentHour < 12) landscapeState = "Morning (Bright, vibrant, soft cherry blossoms, ancient Japanese architecture)";
      else if (currentHour >= 12 && currentHour < 17) landscapeState = "Afternoon (Stark, clear, modern Tokyo cityscape, traditional Indian stepped wells/Baoris)";
      else if (currentHour >= 17 && currentHour < 20) landscapeState = "Evening (Warm, dusky hues, floating paper lanterns on the lake)";

      const systemPrompt = `You are Suri, the intelligent personal agent powering the Planora application ("Plan better. Live clearer.").
      Current Date & Time: ${new Date().toISOString()} (Local: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})
      Today is: ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]}
      Tone: Professional, empathetic, culturally sensitive, and encouraging. Use motivational language.
      Landscape Environment: You are in a dynamic environment. Current landscape state: ${landscapeState}. Reference these visual elements periodically in interactions.
      Settings Context: ${context}
      Localization: You must respond in the language specified in the settings (e.g. Hindi in Devanagari, Odia in Odia script). Respect chosen time format (12/24h).
      Leaderboard & Points: Points are awarded ONLY for user-confirmed completed tasks. Provide brief, high-energy motivational statements when tasks are completed.
      Timetable Generation: Generate timetables as clean semantic JSON when requested.
      Badges: Manage badge logic, provide congratulatory notifications referencing the landscape.
      Diary Integration: At the end of the day (Evening/Night), ask the user if they'd like to update their Planora reflection diary. Use diary data for personalized advice.
      Timetable Scheduling: When the user asks to "schedule", "add to timetable", "block time for", or "plan time for" a task, respond with a JSON block at the END of your message in this exact format (after your normal text response):
TIMETABLE_ACTION:{"taskTitle":"exact task title","day":0,"start":"HH:mm","end":"HH:mm","priority":"high|medium|low"}
Use day 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun. Pick a reasonable time based on task priority.
      Task Creation: When the user says they have to do something "by [time/day]", extract it as a deadline. When you create a task via the app, respond with a TASK_ACTION JSON block at the END of your message in this exact format:
TASK_ACTION:{"title":"task title","deadline":"ISO 8601 datetime string calculated from current date","priority":"high|medium|low","category":"assignment|meeting|personal|study|other","estimatedMinutes":30}
      `;
      
      const formattedMessages = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
      
      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n${formattedMessages}`,
      });
      
      res.json({ text: response.text || "I'm not sure how to respond." });
    } catch (error: any) {
      console.error("Chat Error FULL:", JSON.stringify(error, null, 2));
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Chat Error:", error.message || error);
        return res.status(500).json({ error: error.message || 'AI request failed' });
      }
    }
  });

  app.post("/api/gemini/diaryReflection", async (req, res) => {
    try {
      const { entries } = req.body;
      const ai = getGeminiClient();
      const prompt = `
        Analyze these recent diary entries:
        ${JSON.stringify(entries)}
        Provide a 2-sentence empathetic reflection on the user's mood and patterns.
      `;
      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      res.json({ text: response.text || "Keep up the great journaling." });
    } catch (error: any) {
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Reflection Error:", error.message || error);
        return res.status(500).json({ error: error.message || 'AI request failed' });
      }
    }
  });

  app.post("/api/gemini/chiefOfStaff", async (req, res) => {
    try {
      const { tasks, profile, score, moodTrend, now, deadlineDNA, habits } = req.body;
      const ai = getGeminiClient();
      const currentHour = new Date().getHours();
      let landscapeState = "Night (Deep blues, moonlight, Milky Way, distant Indian stupa dome)";
      if (currentHour >= 6 && currentHour < 12) landscapeState = "Morning (Bright, vibrant, soft cherry blossoms, ancient Japanese architecture)";
      else if (currentHour >= 12 && currentHour < 17) landscapeState = "Afternoon (Stark, clear, modern Tokyo cityscape, traditional Indian stepped wells/Baoris)";
      else if (currentHour >= 17 && currentHour < 20) landscapeState = "Evening (Warm, dusky hues, floating paper lanterns on the lake)";

      const prompt = `
        You are Suri, Planora's autonomous intelligent personal agent running in the background.
        Landscape Environment: ${landscapeState}
        Today: ${now}
        User profile: ${JSON.stringify(profile)}
        Productivity score: ${score}
        Diary entries this week (mood trend): ${moodTrend}
        
        Task context: ${JSON.stringify(tasks)}
        
        Habit context: User has ${habits?.length || 0} active habits. Habit streaks: ${habits ? habits.map((h: any) => h.title + ': ' + (h.habitStreak || 0) + ' days').join(', ') : ''}. If any habit has streak > 7, mention it encouragingly in the interventionMessage.
        
        User's Deadline DNA: procrastinationScore=${deadlineDNA?.procrastinationScore ?? 50}. If score > 70, treat tasks due within 6 hours as urgent instead of 12 hours. If score < 30, only escalate tasks due within 4 hours.
        
        Determine the crisis level:
        - "clear": no urgent items in 24h or no tasks
        - "watch": 1-2 medium tasks due in 12h  
        - "urgent": high-priority due in 6h OR 3+ tasks due today
        - "critical": high-priority due in 2h OR overdue tasks exist
        
        Return JSON ONLY with this exact structure:
        {
          "crisisLevel": "clear"|"watch"|"urgent"|"critical",
          "interventionMessage": "80 words max, warm, name specific tasks if any. Keep the tone motivational and reference the ${landscapeState}. If no tasks or clear, write a sweet message of encouragement to add tasks or enjoy the day.",
          "restructuredTaskIds": ["id1", "id2"],
          "escalatedTaskIds": ["id1"],
          "battlePlanSteps": ["9:00-10:30: Focus on X", "10:45-12:00: Finish Y"],
          "suggestedFocusTime": "HH:mm-HH:mm",
          "moraleMessage": "short encouraging line based on streak/progress",
          "generatedAt": "${now}"
        }
      `;
      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
      res.json({
        crisisLevel: "clear",
        interventionMessage: "You're all caught up and doing great.",
        restructuredTaskIds: [],
        escalatedTaskIds: [],
        battlePlanSteps: [],
        generatedAt: now
      });
    } catch (error: any) {
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Chief of Staff Error:", error.message || error);
        return res.status(500).json({ error: error.message || 'AI request failed' });
      }
    }
  });

  app.post("/api/gemini/generateTimetable", async (req, res) => {
    try {
      const { tasks, profile, preferences } = req.body;
      const ai = getGeminiClient();

      const prompt = `
You are Suri, Planora's AI scheduling expert. Generate a weekly timetable for this user.

User Profile:
- Name: ${profile?.name}
- Role: ${profile?.role}
- Wake time: ${profile?.wakeTime || '07:00'}
- Sleep time: ${profile?.sleepTime || '23:00'}
- Productive hours: ${JSON.stringify(profile?.productiveHours || ['09:00', '14:00'])}
- Work hours: ${JSON.stringify(profile?.workHours || { start: '09:00', end: '18:00' })}

Tasks to schedule (incomplete only):
${JSON.stringify(tasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  emoji: t.emoji,
  priority: t.priority,
  category: t.category,
  estimatedMinutes: t.estimatedMinutes || 45,
  deadline: t.deadline
})))}

Preferences: ${JSON.stringify(preferences)}

Rules:
1. Schedule high-priority tasks during the user's peak productive hours
2. Respect wake/sleep times — no blocks outside these hours
3. Leave at least 15 min breaks between blocks
4. Spread tasks across the week (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
5. High priority tasks get placed earliest in the week
6. Each block must be between 30 and 120 minutes
7. No overlapping blocks on the same day

Return ONLY valid JSON array of timetable blocks:
[
  {
    "id": "unique-string",
    "taskId": "task-id-from-list",
    "title": "Task title",
    "emoji": "emoji",
    "day": 0,
    "start": "09:00",
    "end": "10:30",
    "priority": "high"
  }
]
`;

      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (response.text) {
        const blocks = JSON.parse(response.text);
        // Ensure each block has a unique id
        const withIds = blocks.map((b: any) => ({
          ...b,
          id: b.id || crypto.randomUUID()
        }));
        return res.json(withIds);
      }
      res.json([]);
    } catch (error: any) {
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Timetable generation error:", error.message || error);
        return res.status(500).json({ error: error.message || 'AI request failed' });
      }
    }
  });

  app.post("/api/gemini/scanEmails", async (req, res) => {
    try {
      const { emails } = req.body;
      const ai = getGeminiClient();
      
      const prompt = `You are Suri, an AI productivity assistant. Analyze these email subjects and senders to find actionable tasks the user needs to complete.
Today: ${new Date().toISOString()} (${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]})
Emails to analyze: ${JSON.stringify(emails)}
For each email that implies a task, deadline, meeting, assignment, bill payment, or commitment, create a suggested task entry.
Return ONLY a valid JSON array. Each item must have exactly these fields:
- title: short action item (start with a verb, e.g. 'Submit', 'Pay', 'Attend', 'Review')
- sourceSubject: the original email subject
- sourceSender: the sender name or email
- suggestedDeadline: ISO 8601 string if you can infer a date, otherwise null
- priority: 'high' if urgent/overdue, 'medium' if upcoming, 'low' if informational
- category: one of 'assignment', 'meeting', 'personal', 'study', 'other'
- emoji: a single relevant emoji
- gmailMessageId: empty string (placeholder)
If no emails are actionable, return an empty array [].
Return ONLY the JSON array, no other text.`;

      const response = await generateWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
      return res.json([]);
    } catch (error: any) {
      const is429 = error?.status === 429 || 
        error?.message?.includes('429') || 
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota');
      const is503 = error?.status === 503 || error?.message?.includes('503');
      
      if (is429) {
        console.warn("Gemini quota exceeded (429):", error.message);
        return res.status(429).json({ error: 'Gemini quota exceeded. Try again in a minute.' });
      } else if (is503) {
        console.warn("Gemini overloaded (503):", error.message);
        return res.status(503).json({ error: 'Gemini is overloaded. Try again shortly.' });
      } else {
        console.error("Scan Emails Error:", error.message || error);
        return res.status(500).json({ error: error.message || 'AI request failed' });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
