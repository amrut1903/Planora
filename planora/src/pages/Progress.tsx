import React, { useState } from "react";
import { useAppStore } from "../store/app";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Brain, Lock, Target, Zap, Trophy, ChevronRight } from "lucide-react";
import { TopMenu } from "../components/TopMenu";
import { BADGES } from "../lib/points";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useAdaptiveColors } from "../lib/useBackgroundTheme";

export default function Progress() {
  const { points, streak, analytics, badges, userProfile, deadlineDNA } =
    useAppStore();
  const { t } = useTranslation();
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, header, iconBtn } = useAdaptiveColors();

  const data = [
    {
      name: "Mon",
      val: analytics.completionWeekdays.filter((d) => d === 1).length,
    },
    {
      name: "Tue",
      val: analytics.completionWeekdays.filter((d) => d === 2).length,
    },
    {
      name: "Wed",
      val: analytics.completionWeekdays.filter((d) => d === 3).length,
    },
    {
      name: "Thu",
      val: analytics.completionWeekdays.filter((d) => d === 4).length,
    },
    {
      name: "Fri",
      val: analytics.completionWeekdays.filter((d) => d === 5).length,
    },
    {
      name: "Sat",
      val: analytics.completionWeekdays.filter((d) => d === 6).length,
    },
    {
      name: "Sun",
      val: analytics.completionWeekdays.filter((d) => d === 0).length,
    },
  ];

  const computedPeakHour = (() => {
    const hours = analytics.completionHours;
    if (!hours || hours.length === 0) return "10:00 AM";
    const freq: Record<number, number> = {};
    hours.forEach(h => { freq[h] = (freq[h] || 0) + 1; });
    const peak = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    const h = parseInt(peak[0]);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${suffix}`;
  })();

  return (
    <div className="pb-24 relative z-10 min-h-full">
      {/* Sticky header + tabs */}
      <div className={`sticky top-0 z-20 ${header} px-6 pt-6 pb-3`}>
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${adaptiveText}`}>
              {t("progress.title")}
            </h1>
            <p className={`text-sm ${adaptiveMuted}`}>
              {t("progress.subtitle")}
            </p>
          </div>
          <TopMenu />
        </header>
      </div>

      <div className="px-6 pt-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-primary p-5 rounded-[20px] text-white shadow-sm flex flex-col justify-between min-h-28 relative overflow-hidden">
            <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
              <Zap size={16} /> {t("progress.totalPoints")}
            </div>
            <div className="text-4xl font-bold z-10">{points}</div>
            <div className="absolute -bottom-4 -right-4 text-white/10">
              <Zap size={80} />
            </div>
          </div>
          <div className="bg-brand-card p-5 rounded-[20px] text-brand-text-primary border border-black/5 shadow-sm flex flex-col justify-between min-h-28">
            <div className="flex items-center gap-2 text-brand-text-secondary text-sm font-semibold">
              <Target size={16} /> {t("progress.dayStreak")}
            </div>
            <div className="text-4xl font-bold">{streak}</div>
          </div>
          <div className="col-span-2 bg-brand-card p-5 rounded-[20px] text-brand-text-primary border border-black/5 shadow-sm flex flex-col justify-between min-h-28">
            <div className="flex items-center gap-2 text-brand-text-secondary text-sm font-semibold">
              <Zap size={16} /> Peak Productivity Hour
            </div>
            <div className="text-4xl font-bold">{computedPeakHour}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-brand-card p-6 rounded-[20px] border border-black/5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-brand-text-primary">
                {t("progress.weeklyOverview")}
              </h2>
              <p className="text-xs text-brand-text-secondary font-medium mt-0.5">
                Tasks completed by day
              </p>
            </div>
            <div className="text-2xl font-bold text-brand-primary">
              {analytics.completionWeekdays.length}
              <span className="text-xs font-semibold text-brand-text-secondary ml-1">
                total
              </span>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
                  dy={8}
                />
                <Tooltip
                  cursor={{ fill: "rgba(135,155,106,0.08)", radius: 8 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={{
                            background: "#fff",
                            border: "1px solid rgba(0,0,0,0.08)",
                            borderRadius: 12,
                            padding: "8px 14px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#101828",
                          }}
                        >
                          <div
                            style={{
                              color: "#667085",
                              fontWeight: 600,
                              fontSize: 11,
                              marginBottom: 2,
                            }}
                          >
                            {label}
                          </div>
                          <div>
                            {payload[0].value}{" "}
                            {payload[0].value === 1 ? "task" : "tasks"}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="val" radius={[8, 8, 4, 4]} maxBarSize={36}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.val > 0 ? "#879B6A" : "#E5E7EB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-brand-card border border-black/5 p-5 rounded-[20px] mb-6 shadow-sm flex gap-4 items-start relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <Brain size={20} className="text-brand-primary" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text-primary text-sm mb-1">
              {t("progress.aiInsights")}
            </h3>
            <p className="text-sm text-brand-text-secondary leading-relaxed font-medium">
              {userProfile?.patterns?.behaviorInsights?.[0] ||
                t("progress.unlockInsights")}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${adaptiveText}`}>
            {t("progress.achievements")}
          </h2>
        </div>

        {["Leaderboard", "Achievement", "Streak"].map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-bold text-brand-secondary mb-3 uppercase tracking-wider">
              {category} Badges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {BADGES.filter((b) => b.category === category).map((badge) => {
                const unlocked = badges.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-[20px] flex flex-col items-center justify-center text-center border relative overflow-hidden transition-all duration-300 min-h-[110px] ${
                      unlocked
                        ? "bg-brand-card border-black/5 shadow-sm"
                        : "bg-brand-secondary/10 border-transparent opacity-60 backdrop-blur-sm"
                    }`}
                  >
                    {!unlocked && (
                      <div className="absolute top-2 right-2 text-white/50">
                        <Lock size={12} />
                      </div>
                    )}
                    <div className="text-3xl mb-1 filter drop-shadow-sm">
                      {badge.emoji}
                    </div>
                    <div className="text-[11px] font-bold text-brand-text-primary leading-tight mt-1">
                      {badge.name}
                    </div>
                    <div className="text-[9px] font-medium text-brand-text-secondary leading-tight mt-1">
                      {badge.description}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Deadline DNA Section */}
      <div className="mb-6 mt-8 px-6">
        <h2 className={`text-lg font-bold mb-4 ${adaptiveText}`}>Deadline DNA</h2>
        <div className={`${adaptiveCard} p-6 rounded-[20px] border shadow-sm`}>
          <div className="mb-5">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-brand-text-primary text-sm">
                Procrastination Score
              </span>
              <span className="font-bold text-brand-primary text-lg">
                {deadlineDNA?.procrastinationScore ?? 50}
                <span className="text-sm text-brand-text-secondary">/100</span>
              </span>
            </div>
            <div className="h-3 w-full bg-brand-secondary/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${deadlineDNA?.procrastinationScore ?? 50}%`,
                }}
                className={`h-full rounded-full ${(deadlineDNA?.procrastinationScore ?? 50) > 70 ? "bg-red-500" : "bg-brand-primary"}`}
              />
            </div>
          </div>

          {deadlineDNA?.categoryPatterns &&
            Object.keys(deadlineDNA.categoryPatterns).length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">
                  Category Patterns
                </h3>
                {Object.entries(deadlineDNA.categoryPatterns).map(
                  ([cat, data]) => (
                    <div
                      key={cat}
                      className="flex justify-between items-center bg-brand-secondary/5 p-3 rounded-xl border border-black/5"
                    >
                      <span className="font-semibold text-brand-text-primary text-sm capitalize">
                        {cat}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-black/5 text-brand-text-secondary shadow-sm">
                        {data.avgLeadHours >= 0
                          ? `Usually ${Math.round(data.avgLeadHours)}h early`
                          : `Usually ${Math.abs(Math.round(data.avgLeadHours))}h late`}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}

          <div className="mt-6 pt-5 border-t border-black/5">
            <p className="text-sm font-medium text-brand-text-secondary italic">
              {(deadlineDNA?.procrastinationScore ?? 50) > 70
                ? "Suri noticed you tend to cut it close. Expect earlier warnings for urgent tasks."
                : "You generally manage your deadlines well. Suri will keep a steady watch."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
