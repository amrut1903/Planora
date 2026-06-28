import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "firebase/auth";
import {
  Task,
  TimetableBlock,
  Sticker,
  Goal,
  DiaryEntry,
  NotificationItem,
  AppSettings,
  ChiefOfStaffPlan,
  UserProfile,
  DeadlineDNA,
  HabitLog,
} from "../lib/types";
import { computeDeadlineDNA } from "../lib/deadlineDNA";

interface AppState {
  user: User | null;
  userProfile: UserProfile | null;
  authReady: boolean;
  tasks: Task[];
  timetable: TimetableBlock[];
  habitLogs: HabitLog[];
  stickers: Sticker[];
  goals: Goal[];
  notifications: NotificationItem[];
  streak: number;
  lastActiveDate: string | null;
  badges: string[];
  pendingBadge: string | null;
  points: number;
  analytics: {
    completionHours: number[];
    completionWeekdays: number[];
    agentUsed: number;
    voiceUsed: number;
    timetableGenerated: number;
    languageChanged: number;
    totalCompleted: number;
    totalCreated: number;
  };
  settings: AppSettings;
  chiefOfStaffPlan: ChiefOfStaffPlan | null;
  diaryEntries: DiaryEntry[];
  actionLog: { action: string; timestamp: string }[];
  deadlineDNA: DeadlineDNA | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile) => void;
  setAuthReady: (ready: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addPoints: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setChiefOfStaffPlan: (plan: ChiefOfStaffPlan) => void;
  setDeadlineDNA: (dna: DeadlineDNA) => void;
  addDiaryEntry: (entry: DiaryEntry) => void;
  deleteDiaryEntry: (id: string) => void;
  recordCompletionAnalytics: (date: Date) => void;
  setTimetable: (blocks: TimetableBlock[]) => void;
  addTimetableBlock: (block: TimetableBlock) => void;
  updateTimetableBlock: (id: string, updates: Partial<TimetableBlock>) => void;
  deleteTimetableBlock: (id: string) => void;
  clearTimetable: () => void;
  trackAction: (action: string) => void;
  logHabitCompletion: (
    habitId: string,
    date: string,
    completed: boolean,
  ) => void;
}

const defaultSettings: AppSettings = {
  notifications: {
    sound: "bell",
    interval: "15",
    quietFrom: "22:00",
    quietTo: "07:00",
    style: "default",
  },
  appearance: {
    theme: "auto",
    accent: "#2563EB",
    fontSize: "medium",
    density: "normal",
  },
  region: {
    language: "en",
    timeFormat: "12",
    dateFormat: "dd/MM/yyyy",
    firstDay: "0",
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    regionCode: "IN",
  },
  timetable: { style: "default", layout: "grid", exportFormat: "pdf" },
  ai: { tone: "friendly", autoSchedule: true, proactive: true },
  privacy: {
    showOnLeaderboard: false,
    showFlag: true,
    displayName: "",
    country: "US",
  },
};

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    const state = useAppStore.getState();
    if (state.user) {
      import("../lib/firestoreSync").then(
        ({ syncToFirestore, buildSyncPayload }) => {
          syncToFirestore(state.user!, buildSyncPayload(state));
        },
      );
    }
  }, 3000); // sync 3 seconds after last change
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      userProfile: null,
      authReady: false,
      tasks: [],
      timetable: [],
      habitLogs: [],
      stickers: [],
      goals: [],
      notifications: [],
      streak: 0,
      lastActiveDate: null,
      badges: [],
      pendingBadge: null,
      points: 0,
      analytics: {
        completionHours: [],
        completionWeekdays: [],
        agentUsed: 0,
        voiceUsed: 0,
        timetableGenerated: 0,
        languageChanged: 0,
        totalCompleted: 0,
        totalCreated: 0,
      },
      settings: defaultSettings,
      chiefOfStaffPlan: null,
      diaryEntries: [],
      actionLog: [],
      deadlineDNA: null,

      setUser: (user) => set({ user }),
      setUserProfile: (userProfile) => {
        set({ userProfile });
        debouncedSync();
      },
      setAuthReady: (authReady) => set({ authReady }),
      addTask: (task) =>
        set((state) => {
          const newAction = {
            action: `Created task: ${task.title}`,
            timestamp: new Date().toISOString(),
          };
          debouncedSync();
          return {
            tasks: [...state.tasks, task],
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
            analytics: {
              ...state.analytics,
              totalCreated: state.analytics.totalCreated + 1,
            },
          };
        }),
      updateTask: (id, updates) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);

          let finalUpdates = { ...updates };
          if (
            updates.completed === true &&
            task &&
            task.deadline &&
            !task.completedAt
          ) {
            const deadlineTime = new Date(task.deadline).getTime();
            const now = Date.now();
            const leadHours = (deadlineTime - now) / 3600000;
            if (leadHours > 2) finalUpdates.completedEarlyOrLate = "early";
            else if (leadHours < 0) finalUpdates.completedEarlyOrLate = "late";
            else finalUpdates.completedEarlyOrLate = "ontime";
          }

          const actionStr = finalUpdates.completed
            ? `Completed task: ${task?.title}`
            : `Updated task: ${task?.title}`;
          const newAction = {
            action: actionStr,
            timestamp: new Date().toISOString(),
          };

          const newTasks = state.tasks.map((t) =>
            t.id === id ? { ...t, ...finalUpdates } : t,
          );

          let newDNA = state.deadlineDNA;
          if (finalUpdates.completed === true) {
            newDNA = computeDeadlineDNA(newTasks);
          }

          debouncedSync();
          return {
            tasks: newTasks,
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
            ...(finalUpdates.completed === true ? { deadlineDNA: newDNA } : {}),
          };
        }),
      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          const newAction = {
            action: `Deleted task: ${task?.title}`,
            timestamp: new Date().toISOString(),
          };
          debouncedSync();
          return {
            tasks: state.tasks.filter((t) => t.id !== id),
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      addPoints: (amount) =>
        set((state) => ({ points: state.points + amount })),
      awardBadge: (badgeId) =>
        set((state) => ({
          badges: [...new Set([...state.badges, badgeId])],
          pendingBadge: badgeId,
        })),
      updateSettings: (updates) =>
        set((state) => {
          const newAction = {
            action: `Updated settings`,
            timestamp: new Date().toISOString(),
          };
          const merged = { ...state.settings };
          for (const key of Object.keys(updates) as (keyof AppSettings)[]) {
            merged[key] = {
              ...state.settings[key],
              ...(updates[key] as any),
            } as any;
          }
          debouncedSync();
          return {
            settings: merged,
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      setChiefOfStaffPlan: (plan) => set({ chiefOfStaffPlan: plan }),
      setDeadlineDNA: (dna) => set({ deadlineDNA: dna }),
      addDiaryEntry: (entry) =>
        set((state) => {
          const newAction = {
            action: `Added diary entry with mood ${entry.mood}`,
            timestamp: new Date().toISOString(),
          };
          debouncedSync();
          return {
            diaryEntries: [...state.diaryEntries, entry],
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      deleteDiaryEntry: (id) =>
        set((state) => {
          const entry = state.diaryEntries.find((e) => e.id === id);
          const newAction = {
            action: `Deleted diary entry from ${entry?.date}`,
            timestamp: new Date().toISOString(),
          };
          return {
            diaryEntries: state.diaryEntries.filter((e) => e.id !== id),
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      recordCompletionAnalytics: (date) =>
        set((state) => {
          const hour = date.getHours();
          const day = date.getDay();
          const todayStr = date.toISOString().split('T')[0];
          const lastActive = state.lastActiveDate;
          
          // Calculate streak
          let newStreak = state.streak;
          if (lastActive !== todayStr) {
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (lastActive === yesterdayStr) {
              newStreak = state.streak + 1; // consecutive day
            } else if (!lastActive) {
              newStreak = 1; // first ever completion
            } else {
              newStreak = 1; // streak broken, reset to 1
            }
          }
          
          return {
            streak: newStreak,
            lastActiveDate: todayStr,
            analytics: {
              ...state.analytics,
              totalCompleted: state.analytics.totalCompleted + 1,
              completionHours: [...state.analytics.completionHours, hour],
              completionWeekdays: [...state.analytics.completionWeekdays, day],
            },
          };
        }),
      setTimetable: (blocks) =>
        set((state) => {
          const newAction = {
            action: `Generated timetable`,
            timestamp: new Date().toISOString(),
          };
          return {
            timetable: blocks,
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      addTimetableBlock: (block) =>
        set((state) => {
          const newAction = {
            action: `Added timetable block: ${block.title}`,
            timestamp: new Date().toISOString(),
          };
          return {
            timetable: [...state.timetable, block],
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      updateTimetableBlock: (id, updates) =>
        set((state) => {
          const block = state.timetable.find((b) => b.id === id);
          const newAction = {
            action: `Updated timetable block: ${block?.title}`,
            timestamp: new Date().toISOString(),
          };
          return {
            timetable: state.timetable.map((b) =>
              b.id === id ? { ...b, ...updates } : b,
            ),
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      deleteTimetableBlock: (id) =>
        set((state) => {
          const block = state.timetable.find((b) => b.id === id);
          const newAction = {
            action: `Deleted timetable block: ${block?.title}`,
            timestamp: new Date().toISOString(),
          };
          return {
            timetable: state.timetable.filter((b) => b.id !== id),
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      clearTimetable: () =>
        set((state) => {
          const newAction = {
            action: `Cleared timetable`,
            timestamp: new Date().toISOString(),
          };
          return {
            timetable: [],
            actionLog: [newAction, ...state.actionLog].slice(0, 100),
          };
        }),
      trackAction: (action) =>
        set((state) => {
          const newAction = { action, timestamp: new Date().toISOString() };
          return { actionLog: [newAction, ...state.actionLog].slice(0, 100) };
        }),
      logHabitCompletion: (habitId, date, completed) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === habitId);
          if (!task) return state;

          let newHabitLogs = [...state.habitLogs];
          const existingIndex = newHabitLogs.findIndex(
            (l) => l.habitId === habitId && l.date === date,
          );

          if (existingIndex >= 0) {
            newHabitLogs[existingIndex] = { habitId, date, completed };
          } else {
            newHabitLogs.push({ habitId, date, completed });
          }

          let newTasks = [...state.tasks];

          if (completed) {
            let newStreak = task.habitStreak || 0;
            if (task.lastCompletedDate) {
              const lastDate = new Date(task.lastCompletedDate);
              const currentDate = new Date(date);
              const diffDays = Math.floor(
                (currentDate.getTime() - lastDate.getTime()) /
                  (1000 * 3600 * 24),
              );

              if (
                (task.recurring === "daily" && diffDays === 1) ||
                (task.recurring === "weekly" && diffDays <= 7 && diffDays > 0)
              ) {
                newStreak += 1;
              } else if (diffDays > 0) {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }

            newTasks = newTasks.map((t) =>
              t.id === habitId
                ? { ...t, habitStreak: newStreak, lastCompletedDate: date }
                : t,
            );
          }

          debouncedSync();

          // Award points for habit completion
          const currentPoints = state.points;
          return {
            habitLogs: newHabitLogs,
            tasks: newTasks,
            points: completed ? currentPoints + 10 : currentPoints,
            actionLog: [
              {
                action: `Logged habit ${habitId} as ${completed}`,
                timestamp: new Date().toISOString(),
              },
              ...state.actionLog,
            ].slice(0, 100),
          };
        }),
    }),
    {
      name: "lifesync-storage",
      // user is non-serializable so we omit it from persist
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["user", "authReady"].includes(key),
          ),
        ) as any,
    },
  ),
);
