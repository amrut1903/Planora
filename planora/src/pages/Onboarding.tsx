import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app';
import { UserProfile } from '../lib/types';
import { ArrowRight, Brain, Clock, Target, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const setUserProfile = useAppStore(state => state.setUserProfile);
  const updateSettings = useAppStore(state => state.updateSettings);
  const tasks = useAppStore(state => state.tasks);
  const addTask = useAppStore(state => state.addTask);
  const addDiaryEntry = useAppStore(state => state.addDiaryEntry);
  const addPoints = useAppStore(state => state.addPoints);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    role: 'student',
    wakeTime: '07:00',
    sleepTime: '23:00',
    productiveHours: ['morning'],
    examSeason: false,
    aiTone: 'friendly',
    goals: []
  });
  
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const complete = () => {
    const profile: UserProfile = {
      ...(formData as UserProfile),
      workHours: formData.workHours ?? { start: '09:00', end: '18:00' },
    };
    setUserProfile(profile);
    updateSettings({
      ai: { tone: profile.aiTone as any, autoSchedule: true, proactive: true },
      privacy: {
        displayName: profile.name,
        country: 'IN',
        showOnLeaderboard: true,
        showFlag: true,
      }
    });

    if (tasks.length === 0) {
      seedDemoData();
    }

    navigate('/dashboard');
  };

  const seedDemoData = () => {
    addTask({
      id: crypto.randomUUID(),
      title: "Submit project proposal",
      emoji: "📋",
      priority: "high",
      category: "assignment",
      completed: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      estimatedMinutes: 90,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Review meeting notes and send summary",
      emoji: "📝",
      priority: "high",
      category: "meeting",
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
      estimatedMinutes: 30,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Pay electricity bill",
      emoji: "💡",
      priority: "medium",
      category: "personal",
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: new Date(new Date().setHours(23, 59, 0, 0)).toISOString(),
      estimatedMinutes: 10,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Prepare slides for presentation",
      emoji: "🎯",
      priority: "high",
      category: "study",
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedMinutes: 120,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Read Chapter 5 of textbook",
      emoji: "📖",
      priority: "low",
      category: "study",
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedMinutes: 60,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Completed: Math homework",
      emoji: "✅",
      priority: "medium",
      category: "assignment",
      completed: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
      completedEarlyOrLate: 'ontime',
      estimatedMinutes: 45,
      recurring: null
    } as any);

    addTask({
      id: crypto.randomUUID(),
      title: "Morning revision",
      emoji: "🌅",
      priority: "medium",
      category: "study",
      completed: false,
      createdAt: new Date().toISOString(),
      recurring: "daily",
      habitStreak: 3,
      lastCompletedDate: new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0],
      deadline: undefined,
      estimatedMinutes: 20
    } as any);

    addDiaryEntry({
      id: crypto.randomUUID(),
      date: new Date(Date.now() - 24*60*60*1000).toISOString(),
      mood: '😐',
      text: 'Had a productive morning but felt overwhelmed by pending assignments in the evening. Need to plan better tomorrow.',
      createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
      updatedAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
    });

    addPoints(120);
    useAppStore.setState({ streak: 5, lastActiveDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] });
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="flex flex-col h-full bg-natural-bg p-8 pt-16">
      <div className="w-full bg-natural-border h-1 rounded-full mb-12 overflow-hidden">
        <div className="bg-natural-accent h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {step === 1 && (
            <div className="flex-1">
              <div className="w-14 h-14 bg-natural-card border border-natural-border rounded-full flex items-center justify-center mb-8 text-natural-accent">
                <User size={24} />
              </div>
              <h1 className="text-4xl font-serif italic text-natural-text mb-3">Welcome to Planora</h1>
              <p className="text-natural-muted mb-10 text-sm tracking-wide">Let's set up your personal intelligent agent, Suri.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-natural-text mb-2">What's your name?</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/50 border border-natural-border rounded-full px-5 py-4 outline-none focus:ring-1 focus:ring-natural-accent text-black placeholder:text-black/50"
                    placeholder="e.g. Alex"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-natural-text mb-3">Primary Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['student', 'professional', 'freelancer', 'other'].map(role => (
                      <button 
                        key={role}
                        onClick={() => setFormData({ ...formData, role: role as any })}
                        className={`py-4 px-4 rounded-[24px] border capitalize text-sm font-bold transition-all ${formData.role === role ? 'border-natural-accent bg-natural-accent text-natural-bg' : 'border-natural-border text-natural-muted hover:bg-natural-card bg-white/50'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1">
              <div className="w-14 h-14 bg-natural-card border border-natural-border rounded-full flex items-center justify-center mb-8 text-natural-accent">
                <Clock size={24} />
              </div>
              <h1 className="text-4xl font-serif italic text-natural-text mb-3">Your Daily Rhythm</h1>
              <p className="text-natural-muted mb-10 text-sm tracking-wide">AI will schedule tasks around your energy levels.</p>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-natural-text mb-2">Wake Time</label>
                    <input type="time" value={formData.wakeTime} onChange={e => setFormData({...formData, wakeTime: e.target.value})} className="w-full bg-white/50 border border-natural-border rounded-full px-5 py-4 outline-none text-black placeholder:text-black/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-natural-text mb-2">Sleep Time</label>
                    <input type="time" value={formData.sleepTime} onChange={e => setFormData({...formData, sleepTime: e.target.value})} className="w-full bg-white/50 border border-natural-border rounded-full px-5 py-4 outline-none text-black placeholder:text-black/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-natural-text mb-3">Peak Productivity</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['morning', 'afternoon', 'evening', 'night'].map(time => (
                      <button 
                        key={time}
                        onClick={() => {
                          const current = formData.productiveHours || [];
                          const next = current.includes(time) ? current.filter(t => t !== time) : [...current, time];
                          setFormData({ ...formData, productiveHours: next });
                        }}
                        className={`py-4 px-4 rounded-[24px] border capitalize text-sm font-bold transition-all ${formData.productiveHours?.includes(time) ? 'border-natural-accent bg-natural-accent text-natural-bg' : 'border-natural-border text-natural-muted bg-white/50'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional steps 3, 4, 5, 6 skipped for brevity in mockup, mapping to step 3 here */}
          {step === 3 && (
            <div className="flex-1">
              <div className="w-14 h-14 bg-natural-card border border-natural-border rounded-full flex items-center justify-center mb-8 text-natural-accent">
                <Target size={24} />
              </div>
              <h1 className="text-4xl font-serif italic text-natural-text mb-3">Goal Setting</h1>
              <p className="text-natural-muted mb-10 text-sm tracking-wide">What are you working towards?</p>

              <div className="space-y-3">
                {['Launch a startup', 'Ace final exams', 'Get a promotion', 'Stay healthy'].map(goal => (
                  <button 
                    key={goal}
                    onClick={() => {
                      const current = formData.goals || [];
                      const next = current.includes(goal) ? current.filter(g => g !== goal) : [...current, goal];
                      setFormData({ ...formData, goals: next });
                    }}
                    className={`w-full text-left py-5 px-6 rounded-[32px] border text-sm font-bold transition-all ${formData.goals?.includes(goal) ? 'border-natural-accent bg-natural-accent text-natural-bg' : 'border-natural-border text-natural-muted bg-white/50'}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1">
              <div className="w-14 h-14 bg-natural-card border border-natural-border rounded-full flex items-center justify-center mb-8 text-natural-accent">
                <Brain size={24} />
              </div>
              <h1 className="text-4xl font-serif italic text-natural-text mb-3">AI Personality</h1>
              <p className="text-natural-muted mb-10 text-sm tracking-wide">How should your assistant speak to you?</p>

              <div className="space-y-4">
                {[
                  { id: 'friendly', title: '🤝 Friendly & Encouraging', desc: 'Warm, supportive, and uses emojis' },
                  { id: 'professional', title: '💼 Professional', desc: 'Clear, concise, and to the point' },
                  { id: 'strict', title: '🎯 Strict Coach', desc: 'Pushes you to meet your goals' }
                ].map(tone => (
                  <button 
                    key={tone.id}
                    onClick={() => setFormData({ ...formData, aiTone: tone.id as any })}
                    className={`w-full text-left p-6 rounded-[32px] border transition-all ${formData.aiTone === tone.id ? 'border-natural-accent bg-natural-accent/5 ring-1 ring-natural-accent' : 'border-natural-border hover:bg-natural-card bg-white/50'}`}
                  >
                    <div className="font-bold text-natural-text mb-1">{tone.title}</div>
                    <div className="text-xs text-natural-muted italic">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-auto pt-8 border-t border-natural-border">
        {step > 1 ? (
          <button onClick={back} className="px-6 py-4 rounded-full text-natural-muted font-bold uppercase tracking-widest text-xs hover:bg-natural-card">Back</button>
        ) : <div />}
        
        <button 
          onClick={step === 4 ? complete : next} 
          disabled={step === 1 && !formData.name}
          className="flex items-center gap-2 bg-natural-accent text-natural-bg px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-natural-accent/10 hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {step === 4 ? 'Start Syncing' : 'Continue'}
          {step !== 4 && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
