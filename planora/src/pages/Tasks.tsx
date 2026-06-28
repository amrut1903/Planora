import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/app";
import {
  Check,
  Clock,
  Mic,
  MicOff,
  Plus,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import { TopMenu } from "../components/TopMenu";
import { format } from "date-fns";
import { parseBrainDump } from "../lib/gemini";
import { Task } from "../lib/types";
import { toast } from "sonner";
import { useTranslation } from "../lib/i18n";
import { POINTS } from "../lib/points";
import { TaskCompletionModal } from "../components/TaskCompletionModal";
import { useAdaptiveColors } from "../lib/useBackgroundTheme";

export default function Tasks() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    userProfile,
    settings,
    addPoints,
    recordCompletionAnalytics,
  } = useAppStore();
  const [draft, setDraft] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "high">("all");
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const { t } = useTranslation();
  const { text: adaptiveText, muted: adaptiveMuted, header, iconBtn } = useAdaptiveColors();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMicClick = () => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(
        "Voice input not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Start listening
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    const language = useAppStore.getState().settings.region.language;
    let targetLang = "en-US";
    if (language === "hi") targetLang = "hi-IN";
    if (language === "or") targetLang = "or-IN";
    recognition.lang = targetLang;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening… speak now", { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      setDraft((prev) => {
        // Find if we were already appending to a sentence
        const newContent =
          prev +
          (prev.endsWith(" ") || prev === "" ? "" : " ") +
          finalTranscript +
          interimTranscript;
        return newContent.trim();
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error(
          "Microphone permission denied. Please allow mic access in your browser settings.",
        );
      } else if (event.error === "no-speech") {
        toast.error("No speech detected. Try again.");
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleBrainDump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setIsProcessing(true);
    try {
      const extracted = await parseBrainDump(draft, userProfile);

      if (extracted.length > 0) {
        extracted.forEach((t) => {
          addTask({
            id: crypto.randomUUID(),
            title: t.title || "New Task",
            emoji: t.emoji || "📝",
            category: t.category || "other",
            priority: t.priority || "medium",
            estimatedMinutes: t.estimatedMinutes || undefined,
            deadline: t.deadline || undefined,
            completed: false,
            createdAt: new Date().toISOString(),
          });
        });
        toast.success(`Added ${extracted.length} tasks!`);
        setDraft("");
        addPoints(5); // Brain dump reward
      } else {
        toast.error("Couldn't find any tasks in that text.");
      }
    } catch (err) {
      toast.error("Error connecting to AI.");
      console.error(err);
    }
    setIsProcessing(false);
  };

  const getMotivationalPrompt = (name: string) => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12)
      return `One step closer, ${name}! The view from the morning hill is looking even brighter! Keep going.`;
    if (hour >= 12 && hour < 17)
      return `Great work, ${name}! The city is bustling and you're crushing it!`;
    if (hour >= 17 && hour < 20)
      return `Nice job, ${name}! I've lit a virtual lantern for this completed task.`;
    return `Excellent, ${name}. Your productivity is glowing like the moon tonight.`;
  };

  const requestComplete = (task: Task) => {
    if (task.completed) {
      // Uncomplete is instant — no points involved
      updateTask(task.id, { completed: false, completedAt: undefined });
      return;
    }
    // For completing: open confirmation sheet
    setConfirmTask(task);
  };

  const filteredTasks = tasks.filter((task) => {
    if (task.completed) return false;
    if (filter === "high") return task.priority === "high";
    if (filter === "today") {
      if (!task.deadline) return false;
      const d = new Date(task.deadline);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full relative z-10">
      <div className={`sticky top-0 z-10 shrink-0 ${header} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${adaptiveText}`}>{t("tasks.title")}</h1>
          <TopMenu />
        </div>

        {/* Quick Capture */}
        <form onSubmit={handleBrainDump} className="relative">
          <input
            type="text"
            className="w-full bg-brand-card border border-black/5 rounded-[20px] pl-5 pr-24 py-4 text-sm outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all text-brand-text-primary shadow-sm placeholder:text-brand-text-secondary/60 font-medium"
            placeholder={t("tasks.placeholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isProcessing}
          />
          <div className="absolute right-2 top-2 bottom-2 flex gap-1">
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-10 flex items-center justify-center rounded-[14px] transition-colors ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-brand-secondary/20 text-brand-text-secondary hover:bg-brand-secondary/30"
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              type="submit"
              disabled={isProcessing || !draft.trim()}
              className="w-10 flex items-center justify-center bg-brand-primary text-white rounded-[14px] disabled:opacity-50 shadow-sm"
            >
              {isProcessing ? (
                <Clock size={16} className="animate-spin" />
              ) : (
                <Plus size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>

        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
          {["all", "today", "high"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors capitalize shadow-sm ${filter === f ? "bg-brand-primary text-white" : "bg-brand-card border border-black/5 text-brand-text-secondary hover:bg-brand-secondary/20"}`}
            >
              {f === "all"
                ? t("tasks.filter.all")
                : f === "today"
                  ? t("tasks.filter.today")
                  : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-brand-card rounded-[20px] border border-black/5 shadow-sm">
            <div className="text-4xl mb-3">🍃</div>
            <p className={`font-semibold ${adaptiveMuted}`}>
              {t("tasks.mindClear")}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => requestComplete(task)}
              className="bg-brand-card p-4 rounded-[20px] border border-black/5 flex items-start gap-4 shadow-sm group cursor-pointer hover:border-brand-primary/30 transition-colors active:scale-[0.98]"
            >
              <button
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? "bg-brand-primary border-brand-primary" : "border-brand-secondary bg-white hover:border-brand-primary"}`}
              >
                {task.completed && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
              </button>
              <div className="flex-1 min-w-0 pointer-events-none">
                <h3
                  className={`font-semibold text-brand-text-primary text-base truncate ${task.completed && "line-through opacity-50"}`}
                >
                  {task.emoji} {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-medium">
                  <span
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${task.priority === "high" ? "bg-red-50 text-red-600 border border-red-100" : task.priority === "medium" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-brand-secondary/20 text-brand-text-secondary border border-transparent"}`}
                  >
                    {task.priority === "high"
                      ? t("dashboard.high")
                      : task.priority}
                  </span>
                  {task.estimatedMinutes && (
                    <span className="text-brand-text-secondary flex items-center gap-1">
                      <Clock size={12} /> {task.estimatedMinutes}m
                    </span>
                  )}
                  {task.deadline &&
                    !isNaN(new Date(task.deadline).getTime()) && (
                      <span className="text-brand-text-secondary flex items-center gap-1">
                        <CalendarIcon size={12} />{" "}
                        {format(new Date(task.deadline), "MMM d, h:mm a")}
                      </span>
                    )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="p-2 text-brand-secondary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Task Completion Confirmation Sheet */}
      {confirmTask && (
        <TaskCompletionModal task={confirmTask} onClose={() => setConfirmTask(null)} />
      )}
    </div>
  );
}
