import React, { useState } from 'react';
import { Menu, Settings, Trophy, BarChart2, BookHeart, User, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../store/app';
import { useBackgroundTheme } from '../lib/useBackgroundTheme';

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const chiefOfStaffPlan = useAppStore(state => state.chiefOfStaffPlan);
  const isUrgent = chiefOfStaffPlan?.crisisLevel === 'urgent' || chiefOfStaffPlan?.crisisLevel === 'critical';
  const bgTheme = useBackgroundTheme();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm backdrop-blur ${
          bgTheme === 'light' 
            ? 'bg-black/10 border border-black/10 text-gray-700 hover:bg-black/20' 
            : 'bg-brand-bg/50 border border-white/10 text-white hover:bg-brand-bg/80'
        }`}
      >
        <Menu size={20} />
        {isUrgent && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-xl overflow-hidden z-50 border border-black/5"
            >
              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
                >
                  <User size={18} className="text-brand-primary" />
                  My Profile
                </Link>
                <Link
                  to="/progress"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <BarChart2 size={18} className="text-brand-primary" />
                  Progress
                </Link>
                <Link
                  to="/habits"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Repeat size={18} className="text-brand-primary" />
                  Habits
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Trophy size={18} className="text-amber-500" />
                  Leaderboard
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={18} className="text-gray-400" />
                  Settings
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
