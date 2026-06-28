import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '../store/app';
import { Home, CheckSquare, Sparkles, Settings as SettingsIcon, CalendarDays, BookHeart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useTranslation } from '../lib/i18n';
import { useAdaptiveColors } from '../lib/useBackgroundTheme';
import { useBadgeEngine } from '../lib/badgeEngine';
import React, { useEffect } from 'react';
import { runChiefOfStaff } from '../lib/chiefOfStaff';
import { triggerAgentEscalation } from '../lib/agentLoop';
import { toast } from 'sonner';

// Pages
import Dashboard from './Dashboard';
import Tasks from './Tasks';
import Agent from './Agent';
import Progress from './Progress';
import Settings from './Settings';
import Onboarding from './Onboarding';
import Timetable from './Timetable';
import Leaderboard from './Leaderboard';
import Diary from './Diary';
import Profile from './Profile';
import Habits from './Habits';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { nav, icon, muted } = useAdaptiveColors();
  
  const navItems = [
    { path: '/dashboard',  icon: Home,         label: t('nav.home')     },
    { path: '/tasks',      icon: CheckSquare,  label: t('nav.tasks')    },
    { path: '/agent',      icon: Sparkles,     label: t('nav.ai'),      isFab: true },
    { path: '/timetable',  icon: CalendarDays, label: 'Schedule'        },
    { path: '/diary',      icon: BookHeart,    label: 'Diary'           },
  ];

  return (
    <div className={`${nav} px-6 py-4 pb-8 flex justify-between items-center shrink-0`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        if (item.isFab) {
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm ${isActive ? 'bg-brand-primary' : 'bg-brand-primary/90 hover:bg-brand-primary'}`}>
                <item.icon className="w-5 h-5 text-brand-bg" strokeWidth={2.5} />
              </div>
            </Link>
          );
        }

        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center w-14 group">
            <div className={`mb-1 transition-colors ${isActive ? 'text-brand-primary' : `${muted} group-hover:text-brand-primary`}`}>
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-brand-primary' : muted}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

const Layout = () => {
  const { userProfile, points, streak, analytics, chiefOfStaffPlan } = useAppStore();
  const { checkBadges } = useBadgeEngine();
  
  useEffect(() => {
    checkBadges();
  }, [points, streak, analytics.totalCompleted]);

  useEffect(() => {
    if (!userProfile) return;

    const doAgentLoop = async () => {
      const state = useAppStore.getState();
      if (!state.userProfile) return;
      
      const moodTrend = state.diaryEntries.slice(0, 3).map(e => e.mood).join(', ');
      
      try {
        const habits = state.tasks.filter(t => 
          t.recurring !== null && t.recurring !== undefined
        );
        const newPlan = await runChiefOfStaff(
          state.tasks,
          state.userProfile,
          state.points,
          moodTrend,
          state.deadlineDNA,
          habits
        );
        
        state.setChiefOfStaffPlan(newPlan);
        
        if (newPlan.crisisLevel === 'urgent' || newPlan.crisisLevel === 'critical') {
          if ('Notification' in window) {
            if (Notification.permission !== 'granted') {
              await Notification.requestPermission();
            }
            if (Notification.permission === 'granted') {
              new Notification('Suri Alert 🚨', {
                body: newPlan.interventionMessage
              });
            }
          }
          triggerAgentEscalation(newPlan);
        }

        if (new Date().getHours() === 21) {
          const hasIncompleteHighPriority = state.tasks.some(t => !t.completed && t.priority === 'high');
          if (newPlan.crisisLevel === 'clear' && !hasIncompleteHighPriority) {
            const today = new Date().toISOString().split('T')[0];
            const completedTodayCount = state.tasks.filter(t => t.completed && t.completedAt?.startsWith(today)).length;
            const message = `🌙 Suri's daily wrap: You completed ${completedTodayCount} tasks today. Your streak is ${state.streak} days.`;
            
            toast.info(message);
            
            if ('Notification' in window) {
              if (Notification.permission !== 'granted') {
                await Notification.requestPermission();
              }
              if (Notification.permission === 'granted') {
                new Notification("Suri's Daily Wrap 🌙", {
                  body: message
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Agent Loop Error:", err);
      }
    };
    
    const planIsStale = !chiefOfStaffPlan || 
      (Date.now() - new Date(chiefOfStaffPlan.generatedAt).getTime()) > 60 * 60 * 1000;
      
    if (planIsStale) {
      doAgentLoop();
    }
    
    const interval = setInterval(doAgentLoop, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (!userProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="mobile-container">
      <AnimatedBackground />
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar z-10 relative">
        <div className="pb-28 min-h-full">
          <Outlet />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <BottomNav />
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <div className="mobile-container"><Onboarding /></div>
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'agent', element: <Agent /> },
      { path: 'timetable', element: <Timetable /> },
      { path: 'diary', element: <Diary /> },
      { path: 'progress', element: <Progress /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'habits', element: <Habits /> }
    ]
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
