export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  emoji?: string;
  notes?: string;
  deadline?: string; // ISO string
  priority: Priority;
  estimatedMinutes?: number;
  category: "assignment" | "meeting" | "personal" | "study" | "other";
  completed: boolean;
  completedAt?: string;
  reminder?: boolean;
  notifiedPre?: boolean;
  notifiedDue?: boolean;
  completionNote?: string;
  createdAt: string;
  completedEarlyOrLate?: "early" | "ontime" | "late";
  recurring?: "daily" | "weekly" | null;
  habitStreak?: number;
  lastCompletedDate?: string;
  habitDaysOfWeek?: number[];
}

export interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface DeadlineDNA {
  categoryPatterns: Record<string, { avgLeadHours: number; count: number }>;
  priorityPatterns: Record<string, { avgLeadHours: number; count: number }>;
  procrastinationScore: number;
  lastUpdated: string;
}

export interface TimetableBlock {
  id: string;
  taskId: string;
  title: string;
  emoji?: string;
  day: number; // 0-6
  start: string; // "HH:mm"
  end: string;
  priority: Priority;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface Goal {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  subGoals: { id: string; title: string; done: boolean }[];
}

export interface DiaryEntry {
  id: string;
  date: string;
  text: string;
  mood: "😊" | "😐" | "😔" | "🔥" | "😴";
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  taskId: string;
  title: string;
  body: string;
  kind: "pre" | "due" | "info";
  createdAt: string;
  dismissed: boolean;
}

export interface AppSettings {
  notifications: {
    sound: string;
    interval: "5" | "15" | "30" | "60";
    quietFrom: string;
    quietTo: string;
    style: string;
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    accent: string;
    fontSize: string;
    density: string;
  };
  region: {
    language: string;
    timeFormat: "12" | "24";
    dateFormat: string;
    firstDay: string;
    timezone: string;
    regionCode: string;
  };
  timetable: { style: string; layout: string; exportFormat: string };
  ai: {
    tone: "friendly" | "professional" | "strict";
    autoSchedule: boolean;
    proactive: boolean;
  };
  privacy: {
    showOnLeaderboard: boolean;
    showFlag: boolean;
    displayName: string;
    country: string;
  };
}

export interface UserProfile {
  name: string;
  role: "student" | "professional" | "freelancer" | "other";
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:00"
  productiveHours: string[];
  workHours: { start: string; end: string };
  examSeason: boolean;
  aiTone: "friendly" | "professional" | "strict";
  goals: string[];
  patterns?: {
    peakProductivityHours: string[];
    peakProductivityDays: string[];
    procrastinationPatterns: string;
    optimalTaskDuration: number;
    preferredWorkStyle: "burst" | "steady";
    behaviorInsights: string[];
  };
}

export interface ChiefOfStaffPlan {
  crisisLevel: "clear" | "watch" | "urgent" | "critical";
  interventionMessage: string;
  restructuredTaskIds: string[];
  escalatedTaskIds: string[];
  battlePlanSteps: string[];
  suggestedFocusTime?: string;
  moraleMessage?: string;
  generatedAt: string;
}
