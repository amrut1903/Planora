import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { Settings as SettingsIcon, Key, Bell, Shield, LogOut, Cloud, Check, Download, ShieldAlert, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { LanguageRegionSettings } from '../components/LanguageRegionSettings';
import { GoogleAuthSettings } from '../components/GoogleAuthSettings';
import { useTranslation } from '../lib/i18n';
import { syncToFirestore, buildSyncPayload } from '../lib/firestoreSync';
import { runChiefOfStaff } from '../lib/chiefOfStaff';
import { triggerAgentEscalation } from '../lib/agentLoop';

export default function Settings() {
  const { settings, updateSettings, setUserProfile, setAuthReady, user } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [syncing, setSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('Planora installed! 🎉');
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  const [isSimulating, setIsSimulating] = useState(false);

  const simulateCrisis = async () => {
    setIsSimulating(true);
    try {
      const store = useAppStore.getState();
      const highPriorityTasks = store.tasks.filter(t => !t.completed && t.priority === 'high');
      const tasksToOverdue = highPriorityTasks.slice(0, 2).length > 0 ? highPriorityTasks.slice(0, 2) : store.tasks.filter(t => !t.completed).slice(0, 2);
      
      const overdueTime = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      for (const task of tasksToOverdue) {
        store.updateTask(task.id, { deadline: overdueTime });
      }

      await new Promise(r => setTimeout(r, 500));

      const updatedTasks = useAppStore.getState().tasks;
      const moodTrend = store.diaryEntries.slice(0, 3).map(e => e.mood).join(', ');
      
      let plan = await runChiefOfStaff(
        updatedTasks,
        store.userProfile!,
        store.points,
        moodTrend,
        store.deadlineDNA
      );
      
      if (plan.crisisLevel !== 'critical' && plan.crisisLevel !== 'urgent') {
        plan = {
          ...plan,
          crisisLevel: 'critical',
          escalatedTaskIds: tasksToOverdue.map(t => t.id),
          interventionMessage: "I noticed you have overdue high-priority tasks. I've escalated them and blocked your calendar so you can focus immediately."
        };
      }
      
      store.setChiefOfStaffPlan(plan);
      await triggerAgentEscalation(plan);
      
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      if (Notification.permission === 'granted') {
        new Notification('🚨 Suri Alert — Crisis Detected!', { body: plan.interventionMessage });
      }
      
      toast.error('Crisis mode activated! Suri is taking action... 🚨', { duration: 4000 });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.error('Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDemoData = () => {
    useAppStore.setState({ 
      tasks: [], 
      habitLogs: [], 
      diaryEntries: [], 
      points: 0, 
      streak: 0, 
      badges: [], 
      chiefOfStaffPlan: null, 
      deadlineDNA: null 
    });
    toast.success("Demo data reset. Re-onboard to seed fresh data.");
    navigate('/onboarding');
  };

  const handleSignOut = () => {
    // Basic sign out for demo
    setUserProfile(null as any);
    navigate('/onboarding');
  };

  const handleManualSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const state = useAppStore.getState();
      await syncToFirestore(user, buildSyncPayload(state));
      toast.success("Manual sync completed ☁️");
    } catch (err) {
      toast.error("Failed to sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Install App */}
        {canInstall && (
          <section>
            <div className="flex items-center gap-2 text-white font-semibold mb-3">
              <Download size={18} className="text-brand-primary" /> Install App
            </div>
            <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-brand-text-primary">Install Planora App</div>
                  <div className="text-xs text-brand-text-secondary font-medium mt-0.5">Add to your home screen for the best experience</div>
                </div>
              </div>
              <button 
                onClick={handleInstallClick}
                className="w-full py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
              >
                Install
              </button>
            </div>
          </section>
        )}
        
        {/* Language, Region & Time */}
        <LanguageRegionSettings />

        {/* Google Workspace Integration */}
        <GoogleAuthSettings />

        {/* Cloud Sync */}
        <section>
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Cloud size={18} className="text-brand-primary" /> Cloud Sync
          </div>
          <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-brand-text-primary">Data Persistence</div>
                <div className="text-xs text-brand-text-secondary font-medium mt-0.5">Keep your data safe in the cloud</div>
              </div>
              {user ? (
                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Check size={12} /> Synced to cloud
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Local only
                </div>
              )}
            </div>
            {user && (
              <button 
                onClick={handleManualSync}
                disabled={syncing}
                className="w-full py-2 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
        </section>

        {/* AI Intelligence */}
        <section>
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <SettingsIcon size={18} className="text-brand-primary" /> {t('settings.aiIntelligence')}
          </div>
          <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-brand-text-primary">{t('settings.proactiveSuggestions')}</div>
                <div className="text-xs text-brand-text-secondary font-medium mt-0.5">{t('settings.aiCanStart')}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.ai.proactive} onChange={e => updateSettings({ ai: { ...settings.ai, proactive: e.target.checked }})} />
                <div className="w-11 h-6 bg-brand-secondary/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Bell size={18} className="text-brand-primary" /> {t('settings.notifications')}
          </div>
          <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm">
             <div className="p-5 flex justify-between items-center">
              <div className="text-sm font-semibold text-brand-text-primary">{t('settings.quietHours')}</div>
              <div className="flex items-center gap-2">
                <input type="time" className="text-sm border border-black/5 rounded-md px-2 py-1 bg-white text-brand-text-primary outline-none focus:ring-1 focus:ring-brand-primary font-medium" value={settings.notifications.quietFrom} onChange={e => updateSettings({ notifications: { ...settings.notifications, quietFrom: e.target.value }})} />
                <span className="text-xs text-brand-text-secondary font-medium">{t('settings.to')}</span>
                <input type="time" className="text-sm border border-black/5 rounded-md px-2 py-1 bg-white text-brand-text-primary outline-none focus:ring-1 focus:ring-brand-primary font-medium" value={settings.notifications.quietTo} onChange={e => updateSettings({ notifications: { ...settings.notifications, quietTo: e.target.value }})} />
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Shield size={18} className="text-brand-primary" /> {t('settings.account')}
          </div>
          <button onClick={handleSignOut} className="w-full bg-brand-card rounded-[20px] border border-red-100 p-5 flex items-center justify-between text-red-600 shadow-sm hover:bg-red-50 transition-colors">
            <span className="font-semibold text-sm">{t('settings.signOut')}</span>
            <LogOut size={18} />
          </button>
        </section>

        {/* Demo & Testing */}
        <section className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white font-semibold mb-3">
            <Zap size={18} className="text-yellow-400" /> Demo & Testing
          </div>
          <div className="space-y-3">
            <button 
              onClick={simulateCrisis} 
              disabled={isSimulating}
              className="w-full bg-red-500 text-white font-bold rounded-[20px] p-5 flex items-center justify-between active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
            >
              <span>{isSimulating ? 'Simulating...' : '🚨 Simulate Crisis Mode'}</span>
              {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
            </button>
            <button 
              onClick={handleResetDemoData} 
              className="w-full bg-brand-card text-brand-text-primary rounded-[20px] border border-black/5 p-5 flex items-center justify-center font-semibold text-sm hover:bg-black/5 transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
