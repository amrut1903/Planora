import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { BookHeart, Plus, Calendar as CalendarIcon, Settings as SettingsIcon, Mic, MicOff, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { format } from 'date-fns';
import { TopMenu } from '../components/TopMenu';
import { toast } from 'sonner';
import { useAdaptiveColors } from '../lib/useBackgroundTheme';

// Declare Speech Recognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Diary() {
  const { diaryEntries, addDiaryEntry, deleteDiaryEntry } = useAppStore();
  const { t } = useTranslation();
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, header, iconBtn } = useAdaptiveColors();
  
  const [text, setText] = useState('');
  const [mood, setMood] = useState<'😊' | '😐' | '😔' | '🔥' | '😴'>('😊');
  const [isAdding, setIsAdding] = useState(false);
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
      setText((prev) => {
        // Find if we were already appending to a sentence
        const newContent = prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript + interimTranscript;
        return newContent.trim();
      });
    };

    recognition.onend = () => {
      setIsListening(false);
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

  const handleSave = () => {
    if (!text.trim()) return;
    addDiaryEntry({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: text.trim(),
      mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setText('');
    setIsAdding(false);
  };

  return (
    <div className="pb-28 relative z-10 min-h-full">
      {/* Sticky header */}
      <div className={`sticky top-0 z-20 ${header} px-6 pt-6 pb-4`}>
        <header className="flex items-start justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${adaptiveText}`}>Diary</h1>
            <p className={`text-sm ${adaptiveMuted}`}>Reflect on your daily journey</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsAdding(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm backdrop-blur ${iconBtn}`}
            >
              <Plus size={20} />
            </button>
            <TopMenu />
          </div>
        </header>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`${adaptiveCard} rounded-[20px] p-5 border shadow-sm mb-6`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-brand-text-primary">How are you feeling today?</span>
            </div>
            <div className="flex gap-3 mb-4">
              {(['😊', '😐', '😔', '🔥', '😴'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`text-2xl transition-transform hover:scale-110 ${mood === m ? 'scale-125 filter drop-shadow-md' : 'opacity-50 grayscale'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your daily reflection here. This helps your AI understand you better..."
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-brand-text-primary text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all mb-4"
            />
            <div className="flex justify-between items-center gap-3">
              <div>
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`p-2.5 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-brand-secondary hover:text-brand-primary'}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-semibold text-brand-text-secondary hover:text-brand-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="px-5 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {diaryEntries.length === 0 && !isAdding ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookHeart size={28} className={adaptiveMuted} />
            </div>
            <p className={`text-sm font-medium ${adaptiveMuted}`}>No diary entries yet.<br/>Start writing to help your AI assist you better!</p>
          </div>
        ) : (
          diaryEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${adaptiveCard} rounded-[20px] p-5 border shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary">
                  <CalendarIcon size={12} />
                  {format(new Date(entry.createdAt), 'MMM do, yyyy · h:mm a')}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{entry.mood}</div>
                  <button 
                    onClick={() => deleteDiaryEntry(entry.id)}
                    className="p-2 text-brand-text-secondary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-brand-text-primary leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
