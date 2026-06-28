import React, { useState } from "react";
import { useAppStore } from "../store/app";
import {
  User,
  ArrowLeft,
  Lightbulb,
  Bell,
  Clock,
  Briefcase,
  Plus,
  X,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { userProfile, settings, updateSettings, setUserProfile } =
    useAppStore();

  const [newGoal, setNewGoal] = useState("");
  const [newProductiveHour, setNewProductiveHour] = useState("");

  if (!userProfile) {
    return (
      <div className="text-white/60 text-center py-10">No profile found.</div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      privacy: { ...settings.privacy, displayName: e.target.value },
    });
    setUserProfile({ ...userProfile, name: e.target.value });
  };

  const handleNameBlur = () => {
    toast.success("Profile updated!");
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setUserProfile({
      ...userProfile,
      goals: [...(userProfile.goals || []), newGoal.trim()],
    });
    setNewGoal("");
    toast.success("Goal added!");
  };

  const removeGoal = (idx: number) => {
    const next = [...(userProfile.goals || [])];
    next.splice(idx, 1);
    setUserProfile({ ...userProfile, goals: next });
    toast.success("Goal removed!");
  };

  const handleAddProductiveHour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductiveHour.trim()) return;
    setUserProfile({
      ...userProfile,
      productiveHours: [
        ...(userProfile.productiveHours || []),
        newProductiveHour.trim(),
      ],
    });
    setNewProductiveHour("");
    toast.success("Productive hour added!");
  };

  const removeProductiveHour = (idx: number) => {
    const next = [...(userProfile.productiveHours || [])];
    next.splice(idx, 1);
    setUserProfile({ ...userProfile, productiveHours: next });
    toast.success("Productive hour removed!");
  };

  const handleResetOnboarding = () => {
    if (
      window.confirm(
        "Are you sure you want to reset onboarding? This will clear your profile.",
      )
    ) {
      setUserProfile(null as any);
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-[#071128] pb-24">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      <div className="px-6 space-y-6 max-w-xl mx-auto">
        {/* Section 1 - Identity */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/50 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {getInitials(userProfile.name)}
            </div>
            <div className="flex-1">
              <label className="text-xs text-black font-semibold uppercase tracking-wider mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={settings.privacy?.displayName || userProfile.name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                className="w-full text-lg font-bold text-black border-none p-0 focus:ring-0"
              />
            </div>
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-black capitalize">
              {userProfile.role}
            </span>
          </div>
        </div>

        {/* Section 2 - Suri Preferences */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-5">
          <h2 className="font-bold text-black flex items-center gap-2">
            <User size={18} className="text-brand-primary" />
            Suri Preferences
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">AI Tone</label>
            <div className="flex gap-2">
              {(["friendly", "professional", "strict"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    updateSettings({ ai: { ...settings.ai, tone: t } });
                    setUserProfile({ ...userProfile, aiTone: t });
                    toast.success("Tone updated!");
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${settings.ai?.tone === t ? "bg-brand-primary text-white shadow-md" : "bg-gray-100 text-black hover:bg-gray-200"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-black">
              Let Suri auto-schedule tasks
            </label>
            <input
              type="checkbox"
              checked={settings.ai?.autoSchedule ?? false}
              onChange={() => {
                updateSettings({
                  ai: {
                    ...settings.ai,
                    autoSchedule: !settings.ai.autoSchedule,
                  },
                });
                toast.success("Auto-schedule updated!");
              }}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Suri gives proactive suggestions
            </label>
            <input
              type="checkbox"
              checked={settings.ai?.proactive ?? false}
              onChange={() => {
                updateSettings({
                  ai: { ...settings.ai, proactive: !settings.ai.proactive },
                });
                toast.success("Proactive suggestions updated!");
              }}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Exam Season Mode
              </label>
              <p className="text-xs text-black mt-0.5">
                When on, Suri treats all study tasks as high priority
              </p>
            </div>
            <input
              type="checkbox"
              checked={userProfile.examSeason || false}
              onChange={() => {
                setUserProfile({
                  ...userProfile,
                  examSeason: !userProfile.examSeason,
                });
                toast.success("Exam Season Mode updated!");
              }}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Wake Time
              </label>
              <input
                type="time"
                value={userProfile.wakeTime || ""}
                onChange={(e) => {
                  setUserProfile({ ...userProfile, wakeTime: e.target.value });
                  toast.success("Wake time updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Sleep Time
              </label>
              <input
                type="time"
                value={userProfile.sleepTime || ""}
                onChange={(e) => {
                  setUserProfile({ ...userProfile, sleepTime: e.target.value });
                  toast.success("Sleep time updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Productive Hours
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(userProfile.productiveHours || []).map((hour, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  <Clock size={12} className="text-black" />
                  {hour}
                  <button
                    onClick={() => removeProductiveHour(idx)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddProductiveHour} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 9am - 12pm"
                value={newProductiveHour}
                onChange={(e) => setNewProductiveHour(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-black placeholder:text-black/50 focus:ring-2 focus:ring-brand-primary outline-none"
              />
              <button
                type="submit"
                className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Section: Work Hours */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={18} className="text-brand-primary" />
            Work Hours
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={userProfile.workHours?.start || ""}
                onChange={(e) => {
                  setUserProfile({
                    ...userProfile,
                    workHours: {
                      ...(userProfile.workHours || { start: "", end: "" }),
                      start: e.target.value,
                    },
                  });
                  toast.success("Work start updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={userProfile.workHours?.end || ""}
                onChange={(e) => {
                  setUserProfile({
                    ...userProfile,
                    workHours: {
                      ...(userProfile.workHours || { start: "", end: "" }),
                      end: e.target.value,
                    },
                  });
                  toast.success("Work end updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3 - Goals */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-brand-primary" />
            Goals
          </h2>
          <div className="flex flex-wrap gap-2">
            {(userProfile.goals || []).map((goal, idx) => (
              <span
                key={idx}
                className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {goal}
                <button
                  onClick={() => removeGoal(idx)}
                  className="text-brand-primary/60 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-black placeholder:text-black/50 focus:ring-2 focus:ring-brand-primary outline-none"
            />
            <button
              type="submit"
              className="bg-brand-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Section: Notification Preferences */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-brand-primary" />
            Notification Preferences
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Quiet From
              </label>
              <input
                type="time"
                value={settings.notifications?.quietFrom || ""}
                onChange={(e) => {
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      quietFrom: e.target.value,
                    },
                  });
                  toast.success("Quiet hours updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Quiet To
              </label>
              <input
                type="time"
                value={settings.notifications?.quietTo || ""}
                onChange={(e) => {
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      quietTo: e.target.value,
                    },
                  });
                  toast.success("Quiet hours updated!");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Reminder Sound
            </label>
            <select
              value={settings.notifications?.sound || "bell"}
              onChange={(e) => {
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    sound: e.target.value,
                  },
                });
                toast.success("Reminder sound updated!");
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
            >
              <option value="bell">Bell</option>
              <option value="chime">Chime</option>
              <option value="silent">Silent</option>
            </select>
          </div>
        </div>

        {/* Section 4 - Privacy & Leaderboard */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-brand-primary" />
            Privacy & Leaderboard
          </h2>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Show me on leaderboard
            </label>
            <input
              type="checkbox"
              checked={settings.privacy?.showOnLeaderboard || false}
              onChange={() => {
                updateSettings({
                  privacy: {
                    ...settings.privacy,
                    showOnLeaderboard: !settings.privacy.showOnLeaderboard,
                  },
                });
                toast.success("Privacy settings updated!");
              }}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Show country flag
            </label>
            <input
              type="checkbox"
              checked={settings.privacy?.showFlag || false}
              onChange={() => {
                updateSettings({
                  privacy: {
                    ...settings.privacy,
                    showFlag: !settings.privacy.showFlag,
                  },
                });
                toast.success("Privacy settings updated!");
              }}
              className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Leaderboard Display Name
            </label>
            <input
              type="text"
              value={settings.privacy?.displayName || ""}
              onChange={(e) =>
                updateSettings({
                  privacy: { ...settings.privacy, displayName: e.target.value },
                })
              }
              onBlur={() => toast.success("Leaderboard name updated!")}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
        </div>

        {/* Section 5 - Precautions / Suri Tips */}
        <details className="bg-white rounded-[20px] border border-black/5 shadow-sm group">
          <summary className="p-5 font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lightbulb size={18} className="text-brand-primary" />
              💡 Tips for getting the most out of Suri
            </span>
            <span className="transition group-open:rotate-180">
              <svg
                fill="none"
                height="24"
                shapeRendering="geometricPrecision"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </span>
          </summary>
          <div className="p-5 pt-0 space-y-3">
            {[
              "Set your wake and sleep time accurately — Suri won't schedule tasks outside those hours.",
              "Add your real goals above so Suri can align daily tasks to what matters to you.",
              "Turn on Exam Season Mode during high-pressure periods — Suri will re-prioritize automatically.",
              "When chatting with Suri, mention the day or time for deadlines, e.g. 'by Friday 5pm' or 'tomorrow morning' — she now knows today's date.",
              "Use the AI Tone setting to match how you want Suri to talk to you — Strict mode is great for focus periods.",
              "Your productive hours directly affect when Suri schedules your high-priority tasks in the timetable.",
            ].map((tip, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900 leading-relaxed"
              >
                {tip}
              </div>
            ))}
          </div>
        </details>

        {/* Section 6 - Danger Zone */}
        <div className="bg-white rounded-[20px] border border-black/5 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-red-600 flex items-center gap-2">
            <Trash2 size={18} />
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600">
            Resetting onboarding will clear your profile configuration. You will
            need to set up your preferences again.
          </p>
          <button
            onClick={handleResetOnboarding}
            className="w-full py-3 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            Reset Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
