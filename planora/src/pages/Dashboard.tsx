import React, { useState } from 'react';
import { useAppStore } from '../store/app';
import { isToday, isTomorrow } from 'date-fns';
import { Sparkles, TrendingUp, Calendar as CalendarIcon, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { TopMenu } from '../components/TopMenu';
import { useTranslation } from '../lib/i18n';
import { useDateFormatter } from '../lib/formatters';
import { POINTS } from '../lib/points';
import { toast } from 'sonner';
import { Task } from '../lib/types';
import { TaskCompletionModal } from '../components/TaskCompletionModal';
import { GmailSuggestions } from '../components/GmailSuggestions';

import { useAdaptiveColors } from '../lib/useBackgroundTheme';

export default function Dashboard() {
  const { userProfile, tasks, chiefOfStaffPlan, settings, points, deadlineDNA, updateTask, addPoints, recordCompletionAnalytics } = useAppStore();
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, pts: adaptivePts } = useAdaptiveColors();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const todayTasks = incompleteTasks.filter(t => t.deadline && isToday(new Date(t.deadline)));
  const topPriority = incompleteTasks.sort((a, b) => {
    const pMap = { high: 3, medium: 2, low: 1 };
    return pMap[b.priority] - pMap[a.priority];
  }).slice(0, 3);

  const getCrisisColor = (level?: string) => {
    if (level === 'critical') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'urgent') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (level === 'watch') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="p-6 relative z-10">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-serif ${adaptiveText}`}>
              {getGreeting()}, {userProfile?.name?.split(' ')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <p className={`text-sm font-medium ${adaptiveMuted}`}>{formatDate(new Date(), 'EEEE, MMMM do')}</p>
            <div className={`${adaptivePts} text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider`}>
              <TrendingUp size={10} /> {points} PTS
            </div>
          </div>
        </div>
        <TopMenu />
      </header>

      {/* Suri's Intervention Banner */}
      {chiefOfStaffPlan && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[20px] mb-8 flex items-start gap-3 shadow-sm bg-white border border-brand-primary/20 text-brand-text-primary"
        >
          <Sparkles className="shrink-0 mt-0.5 text-brand-primary" size={20} />
          <div>
            <h3 className="font-semibold text-sm text-brand-primary mb-1">Suri Check-in</h3>
            <p className="text-sm mt-0.5 leading-relaxed text-brand-text-secondary">{chiefOfStaffPlan.interventionMessage}</p>
          </div>
        </motion.div>
      )}

      {deadlineDNA && deadlineDNA.procrastinationScore > 60 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-[16px] px-4 py-3 mb-6">
          <span className="text-lg">🧬</span>
          <p className="text-xs font-semibold text-amber-800 leading-snug">
            Suri noticed you often finish tasks last-minute — she's escalating your deadlines earlier than usual.
          </p>
        </div>
      )}

      {deadlineDNA && deadlineDNA.procrastinationScore <= 40 && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-[16px] px-4 py-3 mb-6">
          <span className="text-lg">🧬</span>
          <p className="text-xs font-semibold text-green-800 leading-snug">
            Suri sees you consistently finish tasks early — she'll remind you further in advance to keep your streak.
          </p>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`${adaptiveCard} p-5 rounded-[24px] shadow-sm flex flex-col items-start border`}>
          <div className="flex items-center gap-2 text-brand-text-secondary text-sm font-semibold mb-2">
            <CalendarIcon size={16} /> {t('dashboard.dueToday')}
          </div>
          <div className="text-3xl font-bold text-brand-text-primary">{todayTasks.length}</div>
        </div>
        <div className={`${adaptiveCard} p-5 rounded-[24px] shadow-sm flex flex-col items-start border`}>
          <div className="flex items-center gap-2 text-brand-text-secondary text-sm font-semibold mb-2">
            <CheckCircle2 size={16} /> {t('dashboard.totalActive')}
          </div>
          <div className="text-3xl font-bold text-brand-text-primary">{incompleteTasks.length}</div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex gap-4 mb-10">
        <button onClick={() => navigate('/agent')} className="flex-[2] bg-brand-primary text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-2 font-semibold shadow-sm active:scale-95 transition-transform">
          <Sparkles size={18} /> {t('dashboard.askAi')}
        </button>
        <button onClick={() => navigate('/tasks')} className={`flex-1 bg-transparent border-2 border-current ${adaptiveText} rounded-full py-3.5 px-4 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform hover:bg-white/20 hover:text-white`}>
          <Plus size={18} /> {t('dashboard.add')}
        </button>
      </div>

      <GmailSuggestions />

      {/* Priority Right Now */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold ${adaptiveText}`}>{t('dashboard.priorityTasks')}</h2>
        <Link to="/tasks" className={`${adaptiveText} text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-colors`}>
          {t('dashboard.seeAll')} <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {topPriority.length > 0 ? topPriority.map(task => (
          <div 
            key={task.id} 
            onClick={() => setConfirmTask(task)}
            className={`${adaptiveCard} p-4 rounded-[20px] border shadow-sm flex items-center gap-4 cursor-pointer hover:border-brand-primary/30 transition-colors active:scale-[0.98]`}
          >
            <button 
              className="w-6 h-6 rounded-full border-2 border-brand-secondary flex items-center justify-center shrink-0 bg-white hover:border-brand-primary hover:bg-brand-primary/10 transition-colors"
            >
              {/* Checkbox circle */}
            </button>
            <div className="flex-1 min-w-0 pointer-events-none">
              <h3 className="font-semibold text-brand-text-primary truncate flex items-center gap-2 text-base">
                {task.emoji} {task.title}
              </h3>
              <div className="text-sm text-brand-text-secondary mt-1 flex items-center gap-2">
                {task.priority === 'high' && <span className="text-red-500 font-medium">{t('dashboard.high')}</span>}
                {task.deadline && <span>{isToday(new Date(task.deadline)) ? t('dashboard.dueTodayLabel') : isTomorrow(new Date(task.deadline)) ? t('dashboard.dueTomorrow') : formatDate(new Date(task.deadline), 'MMM d')}</span>}
              </div>
            </div>
          </div>
        )) : (
          <div className={`text-center py-10 ${adaptiveCard} rounded-[24px] border shadow-sm`}>
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-semibold text-brand-text-primary mb-1">{t('dashboard.caughtUp')}</h3>
            <p className="text-brand-text-secondary text-sm">{t('dashboard.noActiveTasks')}</p>
          </div>
        )}
      </div>

      {confirmTask && (
        <TaskCompletionModal task={confirmTask} onClose={() => setConfirmTask(null)} />
      )}
    </div>
  );
}
