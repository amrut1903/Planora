<div align="center">

#  Planora
### *Plan better. Live clearer.*

**An AI-powered productivity companion with Suri — your autonomous personal agent**

<img width="560" height="871" alt="Screenshot 2026-06-28 141635" src="https://github.com/user-attachments/assets/9522096a-8de4-46ed-8ea5-4598996d9dac" />
<img width="560" height="867" alt="Screenshot 2026-06-28 141651" src="https://github.com/user-attachments/assets/242d277f-8eca-4ce7-8fb8-21ab4f44ddb2" />
<img width="560" height="867" alt="Screenshot 2026-06-28 141701" src="https://github.com/user-attachments/assets/af32cf60-51dd-4c23-9895-108d1b8f85f9" />
<img width="560" height="872" alt="Screenshot 2026-06-28 141734" src="https://github.com/user-attachments/assets/4470670c-5d88-416f-b714-3c68dd70ed86" />


</div>

---

## What is Planora?

Planora is not just another to-do app. It's a living, breathing productivity companion that actually *does things* on your behalf.

At the heart of Planora is **Suri** — an autonomous AI agent powered by Gemini 2.5 Flash. She doesn't wait for you to ask. Every 30 minutes, she scans your tasks, checks your mood from your diary, analyses upcoming deadlines, and decides whether you need a gentle nudge or a full crisis intervention. If things look critical, she'll escalate your tasks, block time in your Google Calendar, and send a browser notification — all without you lifting a finger.

Think of Suri as the chief of staff you never had.

---

##  Screenshots

<div align="center">

<table>
  <tr>
    <td align="center"><b> Dashboard</b></td>
    <td align="center"><b> Tasks</b></td>
    <td align="center"><b> Suri — AI Agent</b></td>
    <td align="center"><b> Leaderboard</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/dashboard.png" width="180" alt="Dashboard"/></td>
    <td><img src="screenshots/tasks.png" width="180" alt="Tasks"/></td>
    <td><img src="screenshots/suri.png" width="180" alt="Suri AI Agent"/></td>
    <td><img src="screenshots/leaderboard.png" width="180" alt="Leaderboard"/></td>
  </tr>
  <tr>
    <td align="center"><i>Smart greeting, stats & priority tasks</i></td>
    <td align="center"><i>AI brain dump with voice input</i></td>
    <td align="center"><i>Chat with your personal agent</i></td>
    <td align="center"><i>Global & country rankings</i></td>
  </tr>
</table>

</div>

---

##  Try It Live

**Deployed on Google Cloud Run:**
```
https://planora-138232049527.us-west1.run.app
```

Just open the link, sign in with your Google account, and you're in. No setup, no installation.

---

##  Features

###  Suri — Your Autonomous Agent

Suri is not a chatbot. She's a proactive agent running in the background whether you're using the app or not. Every 30 minutes she assesses your situation and acts:

| Crisis Level | What Suri Does |
|---|---|
| 🟢 **Clear** | Sends a warm, encouraging message |
| 🟡 **Watch** | Keeps an eye on upcoming medium-priority tasks |
| 🟠 **Urgent** | Pushes a battle plan with time blocks |
| 🔴 **Critical** | Blocks your calendar, escalates priorities, sends a browser alert |

You can also just chat with her. Ask what to work on, tell her you're overwhelmed, or say *"I have a project due Friday 9pm"* and she'll create the task for you.

###  Deadline DNA

One of Planora's most unique features. Over time, Suri studies *how you actually work* — when you complete tasks relative to their deadlines, which categories you procrastinate on, whether you tend to finish early or at the last second.

This personal procrastination profile changes how Suri treats your future deadlines. Consistent procrastinator? She starts escalating earlier. Consistently ahead? She gives you more breathing room.

###  AI Timetable Generator

Tell Suri your wake time, sleep time, and productive hours. She generates a full weekly schedule that respects your preferences — high-priority tasks go during peak hours, with proper breaks between sessions and no overlaps. One tap syncs it all to Google Calendar.

###  Voice-Enabled Task Creation

Tap the mic and say *"I need to submit my assignment by tomorrow 6pm"*. Suri extracts the task, infers the deadline, assigns a priority, and adds it to your list — all from natural speech. Works for chatting with Suri too.

###  Gmail Smart Scanner

Connect your Gmail and Suri scans your inbox for deadlines, meetings, bill payments, and commitments. She surfaces tasks you might have missed — *"Pay electricity bill"* from a utility email, *"Attend interview"* from a recruiter message.

###  Mood-Aware Diary

Write a daily reflection and pick your mood. Suri reads your last few entries before every Chief of Staff assessment — if you've been writing about stress or burnout, she factors that in and adjusts her tone and suggestions accordingly.

###  Gamified Leaderboard

Complete tasks, maintain streaks, and climb the global leaderboard.

| Action | Points |
|---|---|
| Complete a regular task | +10 pts |
| Complete a high-priority task | +15 pts |
| Daily streak | +5 pts/day |
| Generate a timetable | +10 pts |
| Use voice input | +3 pts |
| Chat with Suri | +2 pts |
| Unlock a badge | +50 pts |

Badges range from 🥉 *Rising Starter* (first 100 points) all the way to 🌟 *Planora Legend* (50,000 points). Filter rankings by country or go global.

###  Adaptive Day/Night UI

Planora's background landscape shifts with the time of day — cherry blossoms and bright sky in the morning, a Tokyo cityscape in the afternoon, paper lanterns at dusk, and the Milky Way at night. The UI adapts too, switching between light and dark schemes to stay readable at any hour.

###  Multilingual Support

Planora supports English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ). Suri responds in whichever language you've set, in the correct script.

###  Installable PWA

Planora is a Progressive Web App. Add it to your home screen on Android or iOS and it runs like a native app — no app store required.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Animations | Framer Motion |
| State Management | Zustand with persistence |
| Backend | Express.js (Node.js) |
| AI | Google Gemini 2.5 Flash |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore |
| Calendar | Google Calendar API |
| Email | Gmail API |
| Contacts | Google Contacts API |
| Deployment | Google Cloud Run via AI Studio |
| Voice | Web Speech API (input + text-to-speech) |

---

##  Google Technologies Used

- **Gemini 2.5 Flash** — Powers all 6 AI endpoints: Suri chat, autonomous Chief of Staff planning, brain dump task parsing, weekly timetable generation, diary mood reflection, and Gmail email analysis
- **Firebase Authentication** — Secure Google Sign-In with OAuth 2.0 token management (with session-level token caching and 55-minute expiry refresh)
- **Cloud Firestore** — Real-time data sync across sessions with per-user security rules
- **Google Calendar API** — Autonomous calendar event blocking during crisis escalation
- **Gmail API** — Inbox scanning to surface actionable tasks from emails
- **Google Contacts API** — Profile enrichment for the global leaderboard
- **Google Cloud Run** — Production deployment with auto-scaling (min 0, max 1 instances)
- **Google AI Studio** — Development platform and one-click deployment pipeline

---

##  Running Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/planora.git
cd planora

# 2. Install dependencies
npm install

# 3. Set your Gemini API key
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key_here

# 4. Start the dev server
npm run dev
```

Open `http://localhost:3000`, sign in with Google, and you're good to go.

> **Note:** For Gmail, Google Calendar, and Contacts to work locally, configure OAuth scopes in Google Cloud Console and use the same Firebase project.

---

##  Project Structure

```
planora/
├── server.ts                   # Express backend — all 6 Gemini AI endpoints
├── src/
│   ├── pages/                  # All screens
│   │   ├── Dashboard.tsx       # Home with Chief of Staff banner
│   │   ├── Tasks.tsx           # Task list with AI brain dump
│   │   ├── Agent.tsx           # Suri chat interface
│   │   ├── Timetable.tsx       # AI weekly schedule
│   │   ├── Diary.tsx           # Mood journal
│   │   ├── Habits.tsx          # Recurring habit tracker
│   │   ├── Progress.tsx        # Analytics and charts
│   │   ├── Leaderboard.tsx     # Global rankings
│   │   └── Settings.tsx        # Preferences and integrations
│   ├── components/             # Shared UI components
│   ├── lib/                    # Core logic
│   │   ├── agentLoop.ts        # Crisis escalation + calendar blocking
│   │   ├── chiefOfStaff.ts     # Autonomous planning engine
│   │   ├── deadlineDNA.ts      # Procrastination pattern analysis
│   │   ├── auth.ts             # Firebase auth + token management
│   │   ├── gemini.ts           # Gemini API client
│   │   ├── googleCalendar.ts   # Calendar write operations
│   │   ├── gmailScanner.ts     # Inbox task extraction
│   │   └── badgeEngine.ts      # Achievement system
│   ├── store/
│   │   └── app.ts              # Zustand global state + Firestore sync
│   └── index.css               # Tailwind theme + brand colours
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
└── firestore.rules             # Per-user security rules
```

---

##  Built For

**Vibe2Ship Hackathon 2026** — Problem Statement: *AI-Powered Productivity & Task Management*

> The solution demonstrates how AI can improve productivity by helping users make better decisions and complete tasks more effectively — through autonomous planning, context-aware interventions, and deeply personalised recommendations.

---

##  Author

**Amrut Abhisek**
📧 amrutabhisek1903@gmail.com

---

<div align="center">

*Made with  and a lot of late nights*

</div>
