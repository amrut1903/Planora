import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/app';
import { generateTimetable } from '../lib/gemini';
import { getAccessToken } from '../lib/auth';
import { createCalendarEvent, timetableBlockToCalendarEvent, getThisWeekMonday } from '../lib/googleCalendar';
import { TimetableBlock } from '../lib/types';
import {
  Sparkles, Download, Plus, Trash2, Edit3,
  Loader2, Calendar, LayoutGrid, List, Columns, AlignLeft, CalendarCheck
} from 'lucide-react';
import { TopMenu } from '../components/TopMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { POINTS } from '../lib/points';
import { useAdaptiveColors } from '../lib/useBackgroundTheme';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_LONG  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8am–10pm

type LayoutMode = 'grid' | 'agenda' | 'kanban' | 'list';
type StyleMode  = 'minimal' | 'colorful' | 'soft';

const COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditBlockModal({
  block, onSave, onClose,
}: {
  block: TimetableBlock;
  onSave: (updates: Partial<TimetableBlock>) => void;
  onClose: () => void;
}) {
  const [title, setTitle]       = useState(block.title);
  const [emoji, setEmoji]       = useState(block.emoji || '📌');
  const [day, setDay]           = useState(block.day);
  const [start, setStart]       = useState(block.start);
  const [end, setEnd]           = useState(block.end);
  const [priority, setPriority] = useState(block.priority);

  const save = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (toMin(end) <= toMin(start)) { toast.error('End must be after start'); return; }
    onSave({ title, emoji, day, start, end, priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-t-[28px] shadow-2xl p-6 pb-28 max-h-[85vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-black mb-5">Edit Block</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-black mb-1.5">Emoji</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-center text-xl text-black outline-none focus:ring-2 focus:ring-brand-primary" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-black mb-1.5">Title</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-black mb-1.5">Day</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_SHORT.map((d, i) => (
                <button key={d} onClick={() => setDay(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${day === i ? 'bg-brand-primary text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Start</label>
              <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-brand-primary [&::-webkit-datetime-edit]:text-black" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">End</label>
              <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-brand-primary [&::-webkit-datetime-edit]:text-black" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-colors border ${priority === p ? 'bg-opacity-10 border-current' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  style={priority === p ? { color: COLOR[p], borderColor: COLOR[p], background: COLOR[p] + '1A' } : {}}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-black">Cancel</button>
          <button onClick={save} className="flex-1 py-4 rounded-2xl bg-brand-primary text-white text-sm font-bold shadow-sm">Save Changes</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddBlockModal({
  tasks, onAdd, onClose,
}: {
  tasks: { id: string; title: string; emoji?: string; priority: string }[];
  onAdd: (block: TimetableBlock) => void;
  onClose: () => void;
}) {
  const [title, setTitle]           = useState('');
  const [emoji, setEmoji]           = useState('📌');
  const [day, setDay]               = useState(0);
  const [start, setStart]           = useState('09:00');
  const [end, setEnd]               = useState('10:00');
  const [priority, setPriority]     = useState<'high' | 'medium' | 'low'>('medium');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [syncToCalendar, setSyncToCalendar] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const onTaskSelect = (id: string) => {
    setLinkedTaskId(id);
    const t = tasks.find(x => x.id === id);
    if (t) { setTitle(t.title); setEmoji(t.emoji || '📌'); setPriority(t.priority as any); }
  };

  const add = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (toMin(end) <= toMin(start)) { toast.error('End must be after start'); return; }
    
    setIsSyncing(true);
    
    if (syncToCalendar) {
      try {
        const { getAccessToken } = await import('../lib/auth');
        const token = await getAccessToken();
        if (!token) {
          toast.error('Sign in via Settings to sync with Google Calendar', { duration: 4000 });
          setIsSyncing(false);
          return;
        }

        const { addDays, startOfWeek } = await import('date-fns');
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const startDate = addDays(weekStart, day);
        const [sh, sm] = start.split(':').map(Number);
        startDate.setHours(sh, sm, 0, 0);

        const endDate = addDays(weekStart, day);
        const [eh, em] = end.split(':').map(Number);
        endDate.setHours(eh, em, 0, 0);

        const event = {
          summary: `${emoji} ${title}`.trim(),
          start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        };

        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });

        if (!res.ok) {
          throw new Error('Calendar API failed');
        }
        toast.success('Saved to Google Calendar!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to sync to Calendar');
      }
    }
    
    onAdd({ id: crypto.randomUUID(), taskId: linkedTaskId || crypto.randomUUID(), title: title.trim(), emoji, day, start, end, priority });
    setIsSyncing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-t-[28px] shadow-2xl p-6 pb-28 max-h-[85vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-black mb-5">Add Block</h2>
        <div className="space-y-4">
          {tasks.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Link to task (optional)</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-brand-primary" value={linkedTaskId} onChange={e => onTaskSelect(e.target.value)}>
                <option value="">— no task link —</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Emoji</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-center text-xl text-gray-900 outline-none" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Title</label>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/50 outline-none focus:ring-2 focus:ring-brand-primary" placeholder="e.g. Study session" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Day</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_SHORT.map((d, i) => (
                <button key={d} onClick={() => setDay(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${day === i ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Start</label>
              <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-brand-primary [&::-webkit-datetime-edit]:text-black" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">End</label>
              <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-black font-semibold outline-none focus:ring-2 focus:ring-brand-primary [&::-webkit-datetime-edit]:text-black" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-colors border ${priority === p ? '' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                  style={priority === p ? { color: COLOR[p], borderColor: COLOR[p], background: COLOR[p] + '1A' } : {}}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="syncCal" className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary" checked={syncToCalendar} onChange={e => setSyncToCalendar(e.target.checked)} />
            <label htmlFor="syncCal" className="text-sm font-semibold text-black">Save to Google Calendar</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={isSyncing} className="flex-1 py-4 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-50">Cancel</button>
          <button onClick={add} disabled={isSyncing} className="flex-1 py-4 rounded-2xl bg-brand-primary text-white text-sm font-bold shadow-sm flex items-center justify-center gap-2">
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add Block
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Layout: Weekly Grid ──────────────────────────────────────────────────────
function WeeklyGrid({ blocks, timetableStyle, onEdit, onDelete }: { blocks: TimetableBlock[]; timetableStyle: StyleMode; onEdit: (b: TimetableBlock) => void; onDelete: (id: string) => void; }) {
  const colorful = timetableStyle === 'colorful';
  const { muted: adaptiveMuted, timeLabel } = useAdaptiveColors();
  const ROW_H = 44;
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 600 }}>
        {/* Header row */}
        <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, minmax(0,1fr))' }}>
          <div />
          {DAYS_SHORT.map(d => (
            <div key={d} className={`px-1 pb-2 text-center text-[10px] font-bold uppercase tracking-wider ${adaptiveMuted}`}>{d}</div>
          ))}
        </div>
        {/* Time grid */}
        <div className="relative">
          <div className="grid" style={{ gridTemplateColumns: '52px repeat(7, minmax(0,1fr))' }}>
            {HOURS.map(h => (
              <React.Fragment key={h}>
                <div className={`border-t border-white/5 py-2.5 pr-2 text-right text-[9px] ${timeLabel}`}>{h}:00</div>
                {DAYS_SHORT.map((_, di) => (
                  <div key={di} className="relative border-t border-l border-white/5 first:border-l-0" style={{ minHeight: ROW_H }} />
                ))}
              </React.Fragment>
            ))}
          </div>
          {/* Blocks overlay */}
          <div className="absolute top-0 left-[52px] right-0 grid" style={{ gridTemplateColumns: 'repeat(7, minmax(0,1fr))', height: HOURS.length * ROW_H }}>
            {DAYS_SHORT.map((_, di) => (
              <div key={di} className="relative">
                {blocks.filter(b => b.day === di).map(b => {
                  const top = ((toMin(b.start) - 8 * 60) / 60) * ROW_H;
                  const height = Math.max(24, ((toMin(b.end) - toMin(b.start)) / 60) * ROW_H - 2);
                  const c = COLOR[b.priority] || '#2563EB';
                  return (
                    <div
                      key={b.id}
                      className="absolute left-0.5 right-0.5 overflow-hidden rounded-lg px-1.5 py-1 text-[10px] font-semibold cursor-pointer group"
                      style={{
                        top, height,
                        background: colorful ? c : `${c}22`,
                        color: colorful ? '#fff' : c,
                        borderLeft: `3px solid ${c}`,
                      }}
                      title={b.title}
                      onClick={() => onEdit(b)}
                    >
                      <div className="truncate leading-tight">{b.emoji ? `${b.emoji} ` : ''}{b.title}</div>
                      {height > 26 && <div className="text-[9px] opacity-70">{b.start}–{b.end}</div>}
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(b.id); }}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-current hover:text-red-500"
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout: Agenda ───────────────────────────────────────────────────────────
function AgendaView({ blocks, onEdit, onDelete }: { blocks: TimetableBlock[]; onEdit: (b: TimetableBlock) => void; onDelete: (id: string) => void; }) {
  const { card: adaptiveCard, muted: adaptiveMuted } = useAdaptiveColors();
  return (
    <div className="space-y-4">
      {DAYS_LONG.map((dayName, di) => {
        const dayBlocks = blocks.filter(b => b.day === di).sort((a, b) => toMin(a.start) - toMin(b.start));
        return (
          <div key={di} className={`rounded-2xl ${adaptiveCard} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-brand-text-primary text-sm">{dayName}</span>
              <span className="text-xs text-brand-text-secondary">{dayBlocks.length} item{dayBlocks.length !== 1 ? 's' : ''}</span>
            </div>
            {dayBlocks.length === 0 ? (
              <p className={`text-xs italic ${adaptiveMuted}`}>Free day 🌿</p>
            ) : (
              <div className="space-y-2">
                {dayBlocks.map(b => {
                  const c = COLOR[b.priority] || '#2563EB';
                  return (
                    <div key={b.id} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/5 px-3 py-2.5">
                      <div className="w-16 text-right text-[10px] font-medium tabular-nums text-brand-text-secondary">{b.start}<br />{b.end}</div>
                      <div className="h-8 w-1 rounded-full" style={{ background: c }} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-semibold text-brand-text-primary">{b.emoji && <span className="mr-1">{b.emoji}</span>}{b.title}</div>
                        <span className="text-[10px] font-bold uppercase" style={{ color: c }}>{b.priority}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => onEdit(b)} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-brand-text-secondary"><Edit3 size={12} /></button>
                        <button onClick={() => onDelete(b.id)} className="w-7 h-7 rounded-full hover:bg-red-100 flex items-center justify-center text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Layout: Kanban ───────────────────────────────────────────────────────────
function KanbanView({ blocks, timetableStyle, onEdit, onDelete }: { blocks: TimetableBlock[]; timetableStyle: StyleMode; onEdit: (b: TimetableBlock) => void; onDelete: (id: string) => void; }) {
  const colorful = timetableStyle === 'colorful';
  const { card: adaptiveCard, muted: adaptiveMuted } = useAdaptiveColors();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {DAYS_SHORT.map((d, di) => {
        const dayBlocks = blocks.filter(b => b.day === di).sort((a, b) => toMin(a.start) - toMin(b.start));
        return (
          <div key={di} className={`rounded-2xl ${adaptiveCard} p-2 min-w-[130px] flex-shrink-0`}>
            <div className={`text-center text-[10px] font-bold uppercase tracking-wider border-b border-white/10 pb-2 mb-2 ${adaptiveMuted}`}>{d}</div>
            <div className="space-y-1.5">
              {dayBlocks.length === 0 && <div className={`text-center text-[10px] py-2 italic ${adaptiveMuted}`}>—</div>}
              {dayBlocks.map(b => {
                const c = COLOR[b.priority] || '#2563EB';
                return (
                  <div key={b.id} className="rounded-xl px-2 py-1.5 text-[10px] font-semibold cursor-pointer relative group"
                    style={{ background: colorful ? c : `${c}1A`, color: colorful ? '#fff' : c, borderLeft: `3px solid ${c}` }}
                    onClick={() => onEdit(b)}>
                    <div className="opacity-70 text-[9px]">{b.start}–{b.end}</div>
                    <div className="mt-0.5 leading-tight truncate">{b.emoji && <span className="mr-0.5">{b.emoji}</span>}{b.title}</div>
                    <button onClick={e => { e.stopPropagation(); onDelete(b.id); }}
                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-[10px]">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Layout: List ─────────────────────────────────────────────────────────────
function ListView({ blocks, onEdit, onDelete }: { blocks: TimetableBlock[]; onEdit: (b: TimetableBlock) => void; onDelete: (id: string) => void; }) {
  const { muted: adaptiveMuted } = useAdaptiveColors();
  return (
    <div className="rounded-2xl overflow-hidden border border-black/5">
      {DAYS_LONG.map((d, di) => {
        const dayBlocks = blocks.filter(b => b.day === di).sort((a, b) => toMin(a.start) - toMin(b.start));
        return (
          <div key={di}>
            <div className={`flex justify-between bg-brand-card/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${adaptiveMuted}`}>
              <span>{d}</span><span>{dayBlocks.length}</span>
            </div>
            {dayBlocks.length === 0 ? (
              <div className={`px-4 py-1.5 text-[11px] italic ${adaptiveMuted}`}>No items</div>
            ) : dayBlocks.map(b => {
              const c = COLOR[b.priority] || '#2563EB';
              return (
                <div key={b.id} className="flex items-center gap-3 border-t border-white/5 px-4 py-2 text-sm hover:bg-white/5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c }} />
                  <span className="w-24 tabular-nums text-[10px] text-brand-text-secondary shrink-0">{b.start}–{b.end}</span>
                  <span className="flex-1 truncate text-xs text-brand-text-primary">{b.emoji && <span className="mr-1">{b.emoji}</span>}{b.title}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(b)} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-brand-text-secondary"><Edit3 size={11} /></button>
                    <button onClick={() => onDelete(b.id)} className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-red-400"><Trash2 size={11} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Timetable() {
  const { timetable, tasks, userProfile, settings, setTimetable, addTimetableBlock, updateTimetableBlock, deleteTimetableBlock, addPoints, updateSettings } = useAppStore();
  const [generating, setGenerating] = useState(false);
  const [editingBlock, setEditingBlock]   = useState<TimetableBlock | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [downloading, setDownloading]     = useState(false);
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, header, iconBtn } = useAdaptiveColors();

  const layout        = (settings.timetable.layout as LayoutMode) || 'grid';
  const timetableStyle = (settings.timetable.style as StyleMode) || 'soft';
  const incompleteTasks = tasks.filter(t => !t.completed);

  const setLayout = (l: LayoutMode) => updateSettings({ timetable: { ...settings.timetable, layout: l } });
  const setStyle  = (s: StyleMode)  => updateSettings({ timetable: { ...settings.timetable, style: s } });

  const syncBlockToCalendar = async (block: TimetableBlock) => {
    const token = await getAccessToken();
    if (!token) {
      toast.info("Connect Google in Settings to sync to your calendar");
      return;
    }
    const weekStart = getThisWeekMonday();
    const event = timetableBlockToCalendarEvent(block, weekStart);
    const success = await createCalendarEvent(token, {
      title: block.title,
      description: '',
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime
    });
    if (success) {
      toast.success("Added to Google Calendar 📅");
    } else {
      toast.error("Could not sync to Google Calendar");
    }
  };

  const handleGenerate = async () => {
    if (incompleteTasks.length === 0) { toast.error('Add some tasks first!'); return; }
    setGenerating(true);
    try {
      const blocks = await generateTimetable(incompleteTasks, userProfile, { style: timetableStyle, layout });
      setTimetable(blocks);
      addPoints(POINTS.timetable);
      toast.success(`✨ ${blocks.length} blocks scheduled!`);
      
      const today = new Date();
      // Calculate day of week index (0=Mon...6=Sun)
      const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const tomorrowIndex = (dayIndex + 1) % 7;
      
      for (const block of blocks) {
        if (block.day === dayIndex || block.day === tomorrowIndex) {
          await syncBlockToCalendar(block);
        }
      }
    } catch { toast.error('Failed to generate. Try again.'); }
    setGenerating(false);
  };

  const handleSaveEdit = (updates: Partial<TimetableBlock>) => {
    if (editingBlock) { updateTimetableBlock(editingBlock.id, updates); toast.success('Block updated!'); }
    setEditingBlock(null);
  };

  const handleDelete = (id: string) => { deleteTimetableBlock(id); toast.success('Block removed'); };

  const handleSyncAll = async () => {
    toast.success("Syncing timetable to Google Calendar...");
    for (const block of timetable) {
      await syncBlockToCalendar(block);
    }
  };

  // PNG Export using Canvas API
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const scale = 2;
      const W = 840, H = 1120;
      const canvas = document.createElement('canvas');
      canvas.width = W * scale; canvas.height = H * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);

      ctx.fillStyle = '#071128';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText('My Weekly Timetable', 40, 52);
      ctx.fillStyle = '#879B6A';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText(`${userProfile?.name || 'My'} schedule · Planora`, 40, 74);

      const colW = (W - 80) / 7;
      const ROW_H_C = (H - 140) / 15;
      const startX = 40, startY = 100;

      // Day headers
      DAYS_SHORT.forEach((day, i) => {
        const x = startX + i * colW;
        ctx.fillStyle = '#1A2B4A';
        ctx.fillRect(x, startY, colW - 3, 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(day, x + (colW - 3) / 2, startY + 18);
      });

      // Hour labels + grid
      HOURS.forEach((hour, i) => {
        const y = startY + 34 + i * ROW_H_C;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(W - 40, y); ctx.stroke();
        ctx.fillStyle = '#667085';
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${hour}:00`, startX - 3, y + 3);
      });

      // Blocks
      const fills: Record<string, string> = { high: '#FEE2E2', medium: '#FEF3C7', low: '#D1FAE5' };
      const strokes: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

      timetable.forEach(block => {
        const x = startX + block.day * colW;
        const sm = toMin(block.start) - 8 * 60;
        const em = toMin(block.end)   - 8 * 60;
        const y = startY + 34 + (sm / 60) * ROW_H_C;
        const bh = ((em - sm) / 60) * ROW_H_C - 2;
        if (bh < 4) return;
        const bx = x + 1, bw = colW - 5, r = 5;
        ctx.fillStyle = fills[block.priority] || '#E0E7FF';
        ctx.beginPath();
        ctx.moveTo(bx + r, y); ctx.lineTo(bx + bw - r, y);
        ctx.quadraticCurveTo(bx + bw, y, bx + bw, y + r);
        ctx.lineTo(bx + bw, y + bh - r);
        ctx.quadraticCurveTo(bx + bw, y + bh, bx + bw - r, y + bh);
        ctx.lineTo(bx + r, y + bh);
        ctx.quadraticCurveTo(bx, y + bh, bx, y + bh - r);
        ctx.lineTo(bx, y + r);
        ctx.quadraticCurveTo(bx, y, bx + r, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = strokes[block.priority] || '#6366F1';
        ctx.fillRect(bx, y, 3, bh);
        ctx.fillStyle = '#101828';
        ctx.font = `bold ${bh > 22 ? 8 : 7}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(((block.emoji || '') + ' ' + block.title).slice(0, 14).trim(), bx + 6, y + 11);
        if (bh > 20) {
          ctx.fillStyle = '#667085'; ctx.font = '7px Inter, sans-serif';
          ctx.fillText(`${block.start}–${block.end}`, bx + 6, y + 20);
        }
      });

      ctx.textAlign = 'center'; ctx.fillStyle = '#667085'; ctx.font = '10px Inter, sans-serif';
      ctx.fillText('Generated by Planora · Plan better. Live clearer.', W / 2, H - 18);

      const link = document.createElement('a');
      link.download = `planora-timetable-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Timetable downloaded!');
    } catch { toast.error('Download failed.'); }
    setDownloading(false);
  };

  const layoutIcons: { key: LayoutMode; icon: React.ReactNode; label: string }[] = [
    { key: 'grid',   icon: <LayoutGrid size={13} />,  label: 'Grid'   },
    { key: 'agenda', icon: <AlignLeft size={13} />,   label: 'Agenda' },
    { key: 'kanban', icon: <Columns size={13} />,     label: 'Kanban' },
    { key: 'list',   icon: <List size={13} />,        label: 'List'   },
  ];

  const styleOptions: { key: StyleMode; label: string }[] = [
    { key: 'soft',     label: 'Soft'     },
    { key: 'colorful', label: 'Colorful' },
    { key: 'minimal',  label: 'Minimal'  },
  ];

  return (
    <div className="pb-28 relative z-10">
      {/* Sticky header */}
      <div className={`sticky top-0 z-20 ${header} px-5 pt-5 pb-3`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className={`text-xl font-bold ${adaptiveText}`}>Timetable</h1>
            <p className={`text-xs font-medium mt-0.5 ${adaptiveMuted}`}>
              {timetable.length > 0 ? `${timetable.length} blocks scheduled` : 'Generate with AI or add manually'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {timetable.length > 0 && (
              <button onClick={handleSyncAll} className="flex items-center gap-1.5 border border-brand-secondary text-brand-secondary px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-secondary/10 transition-colors">
                <CalendarCheck size={14} /> Sync to GCal
              </button>
            )}
            {timetable.length > 0 && (
              <button onClick={handleDownload} disabled={downloading}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm backdrop-blur disabled:opacity-50 ${iconBtn}`}>
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              </button>
            )}
            <button onClick={() => setShowAddModal(true)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm backdrop-blur ${iconBtn}`}>
              <Plus size={14} />
            </button>
            <TopMenu />
          </div>
        </div>

        {/* Layout switcher */}
        <div className="flex gap-1 mb-2">
          {layoutIcons.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setLayout(key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${layout === key ? 'bg-brand-primary text-white' : `${adaptiveCard} ${adaptiveMuted}`}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Style switcher */}
        <div className="flex gap-1">
          {styleOptions.map(({ key, label }) => (
            <button key={key} onClick={() => setStyle(key)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${timetableStyle === key ? 'bg-white/15 text-white' : `${adaptiveMuted} hover:opacity-80`}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* AI Generate CTA */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate} disabled={generating}
          className="w-full mb-4 bg-brand-primary text-white rounded-[20px] py-3.5 px-5 flex items-center justify-between shadow-sm disabled:opacity-70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-[12px] flex items-center justify-center">
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">{generating ? 'Generating…' : timetable.length > 0 ? 'Regenerate with AI' : 'Generate AI Timetable'}</div>
              <div className="text-white/70 text-xs">{generating ? 'Suri is planning your week' : `${incompleteTasks.length} tasks to schedule`}</div>
            </div>
          </div>
          {!generating && <div className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">+{POINTS.timetable} pts</div>}
        </motion.button>

        {/* Timetable view */}
        {timetable.length === 0 ? (
          <div className={`text-center py-14 ${adaptiveCard} rounded-[20px] border`}>
            <Calendar size={32} className={`${adaptiveMuted} opacity-30 mx-auto mb-3`} />
            <p className={`font-semibold text-sm ${adaptiveMuted}`}>No schedule yet</p>
            <p className={`text-xs mt-1 ${adaptiveMuted} opacity-60`}>Generate with AI or tap + to add manually</p>
          </div>
        ) : (
          <div>
            {layout === 'grid'   && <WeeklyGrid   blocks={timetable} timetableStyle={timetableStyle} onEdit={setEditingBlock} onDelete={handleDelete} />}
            {layout === 'agenda' && <AgendaView   blocks={timetable} onEdit={setEditingBlock} onDelete={handleDelete} />}
            {layout === 'kanban' && <KanbanView   blocks={timetable} timetableStyle={timetableStyle} onEdit={setEditingBlock} onDelete={handleDelete} />}
            {layout === 'list'   && <ListView     blocks={timetable} onEdit={setEditingBlock} onDelete={handleDelete} />}
          </div>
        )}

        {/* Week summary strip */}
        {timetable.length > 0 && (
          <div className="mt-5">
            <h3 className={`text-xs font-bold mb-2 ${adaptiveText}`}>Week overview</h3>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_SHORT.map((day, i) => {
                const count   = timetable.filter(b => b.day === i).length;
                const hasHigh = timetable.some(b => b.day === i && b.priority === 'high');
                return (
                  <div key={day} className={`flex flex-col items-center py-2.5 rounded-2xl ${adaptiveCard} border`}>
                    <span className={`text-[9px] font-bold ${adaptiveMuted}`}>{day}</span>
                    <span className={`text-sm font-bold mt-1 ${count > 0 ? adaptiveText : `${adaptiveMuted} opacity-30`}`}>{count}</span>
                    {hasHigh && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingBlock && <EditBlockModal block={editingBlock} onSave={handleSaveEdit} onClose={() => setEditingBlock(null)} />}
        {showAddModal  && <AddBlockModal tasks={incompleteTasks} onAdd={async (b) => { 
          addTimetableBlock(b); 
          toast.success('Block added!'); 
          await syncBlockToCalendar(b);
        }} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
