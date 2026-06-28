import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../lib/auth';
import { scanGmailForDeadlines, SuggestedTask } from '../lib/gmailScanner';
import { useAppStore } from '../store/app';
import { toast } from 'sonner';
import { Mail, X, Plus, Loader2 } from 'lucide-react';

export function GmailSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const scan = async () => {
      try {
        const token = await getAccessToken();
        if (token && !sessionStorage.getItem('gmailScanned')) {
          setLoading(true);
          const result = await scanGmailForDeadlines(token);
          setSuggestions(result);
          sessionStorage.setItem('gmailScanned', 'true');
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        sessionStorage.setItem('gmailScanned', 'true');
      }
    };
    scan();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-[16px] border border-black/5 shadow-sm p-4 flex items-center gap-3 w-fit">
          <Loader2 className="w-5 h-5 animate-spin text-brand-text-secondary" />
          <span className="text-sm text-brand-text-secondary font-medium">Suri is scanning your inbox...</span>
        </div>
      </div>
    );
  }

  const visibleSuggestions = suggestions.filter((s, idx) => !dismissed.includes(idx.toString()));

  if (visibleSuggestions.length === 0) {
    return null;
  }

  const handleDismiss = (idx: string) => {
    setDismissed(prev => [...prev, idx]);
  };

  const handleAdd = (suggestion: SuggestedTask, idx: string) => {
    useAppStore.getState().addTask({
      id: crypto.randomUUID(),
      title: suggestion.title,
      emoji: suggestion.emoji,
      priority: suggestion.priority,
      category: suggestion.category,
      deadline: suggestion.suggestedDeadline || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      estimatedMinutes: undefined,
      recurring: null
    } as any);
    toast.success('Task added from inbox!');
    handleDismiss(idx);
  };

  return (
    <div className="mb-8 relative z-10">
      <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
        <Mail className="w-4 h-4" /> Found in your inbox
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {suggestions.map((suggestion, idx) => {
          const idStr = idx.toString();
          if (dismissed.includes(idStr)) return null;

          return (
            <div key={idStr} className="bg-white rounded-[16px] border border-black/5 shadow-sm p-4 min-w-[220px] max-w-[220px] flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-start">
                <span className="text-2xl">{suggestion.emoji}</span>
                <button 
                  onClick={() => handleDismiss(idStr)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-sm text-brand-text-primary leading-snug line-clamp-2">
                {suggestion.title}
              </h3>
              
              <p className="text-xs text-brand-text-secondary truncate">
                {suggestion.sourceSender}
              </p>
              
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {suggestion.priority}
              </div>
              
              {suggestion.suggestedDeadline && (
                <p className="text-xs text-brand-text-secondary">
                  Due: {new Date(suggestion.suggestedDeadline).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}
              
              <button 
                onClick={() => handleAdd(suggestion, idStr)}
                className="w-full mt-1 bg-brand-primary text-white text-xs font-semibold py-2 rounded-full flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
