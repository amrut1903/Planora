import React, { useState } from 'react';
import { Task } from '../lib/types';
import { POINTS } from '../lib/points';
import { useAppStore } from '../store/app';
import { toast } from 'sonner';

interface TaskCompletionModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskCompletionModal({ task, onClose }: TaskCompletionModalProps) {
  const { updateTask, addPoints, recordCompletionAnalytics } = useAppStore();
  const [confirmNote, setConfirmNote] = useState('');

  const confirmComplete = () => {
    const pts = task.priority === 'high' ? POINTS.highPriority : POINTS.taskComplete;
    updateTask(task.id, {
      completed: true,
      completedAt: new Date().toISOString(),
      completionNote: confirmNote
    });
    addPoints(pts);
    recordCompletionAnalytics(new Date());
    toast.success(`Task completed! +${pts} pts 🎉`);
    const { deadlineDNA } = useAppStore.getState();
    if (deadlineDNA) {
      setTimeout(() => {
        toast.info('🧬 Suri updated your Deadline DNA based on this completion');
      }, 1200);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl p-6 pb-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Handle for mobile */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
        {/* Task preview */}
        <div className="flex items-start gap-3 mb-5 p-4 bg-gray-50 rounded-2xl">
          <span className="text-3xl">{task.emoji || '📝'}</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-black text-sm leading-snug">
              {task.title}
            </div>
            <div className="text-xs text-black mt-1 capitalize">
              {task.priority} priority · {task.category}
            </div>
          </div>
          <div
            className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
              task.priority === 'high'
                ? 'bg-red-100 text-red-600'
                : task.priority === 'medium'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            +
            {task.priority === 'high'
              ? POINTS.highPriority
              : POINTS.taskComplete}{' '}
            pts
          </div>
        </div>

        {/* Header */}
        <h2 className="text-lg font-bold text-black mb-1">
          Mark as completed? ✅
        </h2>
        <p className="text-sm text-black mb-5">
          Confirm you genuinely completed this task. Points are awarded to
          keep rankings fair.
        </p>

        {/* Optional note */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            How did it go?{' '}
            <span className="font-normal normal-case">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Finished the report, submitted on time..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/50 outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                confirmComplete();
              }
            }}
            maxLength={200}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col mt-2">
          <button
            onClick={confirmComplete}
            className="w-full py-3.5 rounded-full bg-brand-primary text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Mark as Completed ✅
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 rounded-full bg-transparent border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
