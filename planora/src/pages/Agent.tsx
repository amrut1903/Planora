import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { chat } from '../lib/gemini';
import { POINTS } from '../lib/points';
import { Sparkles, Send, Mic, MicOff, Target } from 'lucide-react';
import { TopMenu } from '../components/TopMenu';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { toast } from 'sonner';
import { useAdaptiveColors } from '../lib/useBackgroundTheme';

// Declare Speech Recognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Agent() {
  const { userProfile, tasks, settings, chiefOfStaffPlan, diaryEntries, addPoints } = useAppStore();
  const { t } = useTranslation();
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, header, iconBtn } = useAdaptiveColors();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([{
    role: 'model', 
    content: "Hi! I'm Suri, your personal agent. I've analyzed your patterns. What should we tackle today?"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [focusGoal, setFocusGoal] = useState(() => sessionStorage.getItem('focusGoal') || '');
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    sessionStorage.setItem('focusGoal', focusGoal);
  }, [focusGoal]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in this browser. Please use Chrome or Edge.');
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
    let targetLang = 'en-US';
    if (language === 'hi') targetLang = 'hi-IN';
    if (language === 'or') targetLang = 'or-IN';
    recognition.lang = targetLang;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening… speak now', { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      // Show interim in the input field for real-time feedback
      setInput((finalTranscript + interimTranscript).trim());
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-send if we got a final transcript
      if (finalTranscript.trim()) {
        addPoints(POINTS.voiceUse);
        handleSend(finalTranscript.trim());
        setInput('');
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied. Please allow mic access in your browser settings.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected. Try again.');
      } else {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    try {
      const recentDiary = diaryEntries.slice(-3).map(e => `[${e.date.split('T')[0]}]: ${e.text} (Mood: ${e.mood})`).join(' | ');
      const recentActions = (useAppStore.getState().actionLog || []).slice(0, 10)
        .map(a => `[${a.timestamp?.split('T')[1]?.slice(0,5) || '??:??'}] ${a.action}`).join(' | ');
      const context = `
        User: ${userProfile?.name}, Role: ${userProfile?.role}
        Crisis Level: ${chiefOfStaffPlan?.crisisLevel || 'clear'}
        Incomplete Tasks: ${tasks.filter(t=>!t.completed).length}
        Active Goals: ${userProfile?.goals.join(', ')}
        Recent Diary Entries: ${recentDiary || 'None'}
        Recent User Actions: ${recentActions || 'None'}
        Tone: ${settings.ai.tone}
        Daily Focus Goal: ${focusGoal || 'None'}
      `;
      
      const rawResponse = await chat(newMsgs, context);
      
      let displayText = rawResponse;
      
      const timetableMatches = [...rawResponse.matchAll(/TIMETABLE_ACTION:\s*({[^}]+})/g)];
      for (const match of timetableMatches) {
        const jsonStr = match[1];
        displayText = displayText.replace(match[0], '').trim();
        try {
          const action = JSON.parse(jsonStr);
          const matchedTask = tasks.find(t =>
            t.title.toLowerCase().includes(action.taskTitle?.toLowerCase() || '')
          );
          const newBlock = {
            id: crypto.randomUUID(),
            taskId: matchedTask?.id || crypto.randomUUID(),
            title: action.taskTitle || matchedTask?.title || 'Scheduled block',
            emoji: matchedTask?.emoji || '📌',
            day: action.day ?? 0,
            start: action.start || '09:00',
            end: action.end || '10:00',
            priority: action.priority || matchedTask?.priority || 'medium',
          };
          useAppStore.getState().addTimetableBlock(newBlock);
          toast.success(`✅ Added to your timetable!`);
        } catch (e) {
          console.warn('Failed to parse timetable action', e);
        }
      }

      const taskMatches = [...rawResponse.matchAll(/TASK_ACTION:\s*({[^}]+})/g)];
      for (const match of taskMatches) {
        const jsonStr = match[1];
        displayText = displayText.replace(match[0], '').trim();
        try {
          const action = JSON.parse(jsonStr);
          const newTask = {
            id: crypto.randomUUID(),
            title: action.title || 'New Task',
            deadline: action.deadline || null,
            priority: action.priority || 'medium',
            category: action.category || 'other',
            estimatedMinutes: action.estimatedMinutes || null,
            emoji: action.emoji || '📌',
            completed: false,
            createdAt: new Date().toISOString(),
            recurring: null
          };
          useAppStore.getState().addTask(newTask);
          toast.success(`✅ Suri added "${newTask.title}" to your tasks!`);
        } catch (e) {
          console.warn('Failed to parse task action', e);
        }
      }

      setMessages([...newMsgs, { role: 'model', content: displayText }]);
      addPoints(POINTS.agentUse);
      
      // Speech Synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(displayText.replace(/✅.*/, '')); // remove emojis/system text
        const language = useAppStore.getState().settings.region.language;
        
        let targetLang = 'en-US';
        if (language === 'hi') targetLang = 'hi-IN';
        if (language === 'or') targetLang = 'or-IN';
        
        utterance.lang = targetLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.2; // Slightly higher pitch for a "sweet female voice" feel if no explicit female voice is found

        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(v => v.lang.startsWith(targetLang.split('-')[0]));
        
        let femaleVoice = langVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('tessa') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('zira'));
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else if (langVoices.length > 0) {
          utterance.voice = langVoices[0];
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech
        window.speechSynthesis.speak(utterance);
      }

    } catch (err: any) {
      const errMsg = err?.message || 'Unknown error';
      console.error('Suri chat error:', errMsg);
      const isQuotaError = errMsg.includes('quota') || 
        errMsg.includes('429') || 
        errMsg.includes('high demand') || 
        errMsg.includes('503') || 
        errMsg.includes('RESOURCE_EXHAUSTED') || 
        errMsg.includes('overloaded') ||
        errMsg.includes('limit');

      setMessages([...newMsgs, { 
        role: 'model', 
        content: isQuotaError
          ? "I've hit my thinking limit for now 🌸 — Gemini quota reached. Wait 60 seconds and try again. Your tasks are safe!"
          : "I hit a small snag. Could you try again?"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "What should I work on now?",
    "Plan my day",
    "I'm feeling overwhelmed",
    "Show me what's overdue",
    "🎤 I have a project due Friday 9pm"
  ];

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex flex-col gap-4 z-10 sticky top-0 ${header} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary rounded-[14px] flex items-center justify-center shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold mb-0.5 ${adaptiveText}`}>Suri</h1>
              <p className={`text-[11px] font-semibold ${adaptiveMuted}`}>{t('agent.subtitle')}</p>
            </div>
          </div>
          <TopMenu />
        </div>
        <div className={`${adaptiveCard} opacity-90 border rounded-[16px] flex items-center px-4 py-3 shadow-sm`}>
          <Target size={16} className={`${adaptiveMuted} mr-3`} />
          <input 
            type="text" 
            placeholder="Set your daily focus goal..." 
            value={focusGoal}
            onChange={e => setFocusGoal(e.target.value)}
            className={`bg-transparent text-sm outline-none w-full font-medium ${adaptiveText} placeholder:${adaptiveMuted}`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-[20px] px-5 py-4 text-sm font-medium shadow-sm ${
              msg.role === 'user' 
                ? 'bg-brand-primary text-white rounded-br-sm' 
                : `${adaptiveCard} text-brand-text-primary border rounded-bl-sm leading-relaxed`
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`${adaptiveCard} border rounded-[20px] rounded-bl-sm px-5 py-4 text-sm flex gap-1 shadow-sm ${adaptiveMuted}`}>
              <span className="animate-bounce">●</span><span className="animate-bounce delay-75">●</span><span className="animate-bounce delay-150">●</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="absolute bottom-0 left-0 w-full pt-10 pb-6 px-6 bg-gradient-to-t from-brand-bg via-brand-bg/90 to-transparent">
        {messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className={`${adaptiveCard} border px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shadow-sm ${adaptiveMuted} hover:opacity-80`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className={`${adaptiveCard} border rounded-[20px] flex items-center p-2 pl-5 shadow-sm`}>
          <input
            type="text"
            className={`flex-1 text-sm outline-none bg-transparent font-medium ${isListening ? 'placeholder:text-red-400' : `placeholder:${adaptiveMuted}`} ${adaptiveText}`}
            placeholder={isListening ? '🎤 Listening…' : t('agent.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }}}
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-brand-secondary hover:text-brand-primary'}`}
            title="Tap to speak — try saying a task with a deadline"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button 
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-brand-primary text-white rounded-[14px] flex items-center justify-center disabled:opacity-50 ml-1 shadow-sm"
          >
            <Send size={16} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
