import React, { useState } from "react";
import { useAppStore } from "../store/app";
import { TopMenu } from "../components/TopMenu";
import { Check, Plus, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../lib/types";
import { toast } from "sonner";
import { useAdaptiveColors } from "../lib/useBackgroundTheme";
import { useBadgeEngine } from "../lib/badgeEngine";

export default function Habits() {
  const { tasks, habitLogs, logHabitCompletion, addTask } = useAppStore();
  const { checkBadges } = useBadgeEngine();
  const [showAddModal, setShowAddModal] = useState(false);
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard } = useAdaptiveColors();

  // Modals state
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [recurring, setRecurring] = useState<"daily" | "weekly">("daily");
  const [habitDaysOfWeek, setHabitDaysOfWeek] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);
  const [category, setCategory] = useState<Task["category"]>("personal");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayDay = today.getDay(); // 0 = Sunday

  const allHabits = tasks.filter(
    (t) => t.recurring !== null && t.recurring !== undefined,
  );

  const todayHabits = allHabits.filter((t) => {
    if (t.recurring === "daily") return true;
    if (t.recurring === "weekly" && t.habitDaysOfWeek?.includes(todayDay))
      return true;
    return false;
  });

  const handleToggleHabit = (habitId: string) => {
    const isCompletedToday = habitLogs.some(
      (l) => l.habitId === habitId && l.date === todayStr && l.completed,
    );
    logHabitCompletion(habitId, todayStr, !isCompletedToday);
    if (!isCompletedToday) {
      toast.success("Habit completed! 🔥 +10 pts");
      setTimeout(() => checkBadges(), 150);
    }
  };

  const handleAddHabit = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      emoji,
      priority: "medium",
      category,
      completed: false,
      createdAt: new Date().toISOString(),
      recurring,
      habitStreak: 0,
    };
    if (recurring === "weekly") newTask.habitDaysOfWeek = habitDaysOfWeek;

    addTask(newTask);
    setShowAddModal(false);
    toast.success("Habit created!");

    setTitle("");
    setEmoji("🔥");
    setRecurring("daily");
    setHabitDaysOfWeek([1, 2, 3, 4, 5]);
  };

  const daysOptions = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6 h-full flex flex-col relative z-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${adaptiveText}`}>Habits</h1>
          <p className={`text-sm ${adaptiveMuted}`}>
            Build consistency every day
          </p>
        </div>
        <TopMenu />
      </div>

      <section className="mb-8">
        <h2 className={`text-xl font-bold mb-4 ${adaptiveText}`}>Today's Habits</h2>
        {todayHabits.length === 0 ? (
          <div className={`${adaptiveCard} border rounded-[20px] p-6 text-center ${adaptiveMuted}`}>
            No habits scheduled for today.
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits.map((habit) => {
              const isCompleted = habitLogs.some(
                (l) =>
                  l.habitId === habit.id && l.date === todayStr && l.completed,
              );

              // Last 7 days completion history
              const last7Days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dStr = d.toISOString().split("T")[0];
                return habitLogs.some(
                  (l) =>
                    l.habitId === habit.id && l.date === dStr && l.completed,
                );
              });

              return (
                <div
                  key={habit.id}
                  className={`${adaptiveCard} border rounded-2xl p-4 flex items-center justify-between shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all active:scale-95 ${
                        isCompleted
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "border-brand-secondary text-transparent hover:border-brand-primary hover:text-brand-primary/20"
                      }`}
                    >
                      <Check
                        size={20}
                        className={isCompleted ? "opacity-100" : "opacity-0"}
                      />
                    </button>
                    <div>
                      <div className="font-semibold text-brand-text-primary text-base flex items-center gap-2">
                        {habit.emoji} {habit.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          🔥 {habit.habitStreak || 0}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                          {last7Days.map((completed, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${completed ? "bg-brand-primary" : "bg-brand-secondary/30"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-20">
        <h2 className={`text-lg font-bold mb-4 ${adaptiveText}`}>All Habits</h2>
        {allHabits.length === 0 ? (
          <div className={`text-sm text-center py-4 ${adaptiveMuted}`}>
            You haven't created any habits yet.
          </div>
        ) : (
          <div className="space-y-2">
            {allHabits.map((habit) => (
              <div
                key={habit.id}
                className={`${adaptiveCard} opacity-80 border rounded-xl p-3 flex justify-between items-center`}
              >
                <span className={`font-medium text-sm flex items-center gap-2 ${adaptiveText}`}>
                  {habit.emoji} {habit.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded bg-black/5 capitalize ${adaptiveMuted}`}>
                  {habit.recurring}{" "}
                  {habit.recurring === "weekly" &&
                    `(${habit.habitDaysOfWeek?.length}x/wk)`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* New Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <div
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-brand-card rounded-t-3xl z-50 p-6 flex flex-col max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-brand-secondary/30 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-brand-text-primary mb-6">
                New Habit
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-1 block">
                      Title
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Read 10 pages"
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-brand-text-primary focus:outline-none focus:border-brand-primary placeholder:text-brand-secondary/50 font-medium"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-1 block">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2 block">
                    Frequency
                  </label>
                  <div className="flex bg-black/5 p-1 rounded-xl">
                    <button
                      onClick={() => setRecurring("daily")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${recurring === "daily" ? "bg-white text-brand-primary shadow-sm" : "text-brand-secondary hover:text-brand-text-primary"}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setRecurring("weekly")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${recurring === "weekly" ? "bg-white text-brand-primary shadow-sm" : "text-brand-secondary hover:text-brand-text-primary"}`}
                    >
                      Specific Days
                    </button>
                  </div>
                </div>

                {recurring === "weekly" && (
                  <div>
                    <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2 block">
                      Days of Week
                    </label>
                    <div className="flex justify-between gap-1">
                      {daysOptions.map((day, idx) => {
                        const isSelected = habitDaysOfWeek.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (isSelected)
                                setHabitDaysOfWeek((prev) =>
                                  prev.filter((d) => d !== idx),
                                );
                              else setHabitDaysOfWeek((prev) => [...prev, idx]);
                            }}
                            className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isSelected ? "bg-brand-primary text-white" : "bg-black/5 text-brand-secondary hover:bg-black/10"}`}
                          >
                            {day.charAt(0)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-brand-text-primary font-medium focus:outline-none focus:border-brand-primary appearance-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="study">Study</option>
                    <option value="assignment">Assignment</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddHabit}
                disabled={
                  !title.trim() ||
                  (recurring === "weekly" && habitDaysOfWeek.length === 0)
                }
                className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg mt-8 active:scale-95 transition-transform disabled:opacity-50"
              >
                Save Habit
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
