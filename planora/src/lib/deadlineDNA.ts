import { Task, DeadlineDNA } from './types';

export const computeDeadlineDNA = (tasks: Task[]): DeadlineDNA => {
  const categoryPatterns: Record<string, { avgLeadHours: number; count: number }> = {};
  const priorityPatterns: Record<string, { avgLeadHours: number; count: number }> = {};
  let validTaskCount = 0;
  let procrastinatedTaskCount = 0;

  tasks.forEach(task => {
    if (task.completed && task.completedAt && task.deadline) {
      const deadlineTime = new Date(task.deadline).getTime();
      const completedTime = new Date(task.completedAt).getTime();
      const leadHours = (deadlineTime - completedTime) / 3600000;

      // Update category patterns
      if (!categoryPatterns[task.category]) {
        categoryPatterns[task.category] = { avgLeadHours: 0, count: 0 };
      }
      const cat = categoryPatterns[task.category];
      cat.avgLeadHours = ((cat.avgLeadHours * cat.count) + leadHours) / (cat.count + 1);
      cat.count++;

      // Update priority patterns
      if (!priorityPatterns[task.priority]) {
        priorityPatterns[task.priority] = { avgLeadHours: 0, count: 0 };
      }
      const pri = priorityPatterns[task.priority];
      pri.avgLeadHours = ((pri.avgLeadHours * pri.count) + leadHours) / (pri.count + 1);
      pri.count++;

      validTaskCount++;
      if (leadHours < 2) {
        procrastinatedTaskCount++;
      }
    }
  });

  const procrastinationScore = validTaskCount > 0 ? Math.round((procrastinatedTaskCount / validTaskCount) * 100) : 50;

  return {
    categoryPatterns,
    priorityPatterns,
    procrastinationScore,
    lastUpdated: new Date().toISOString()
  };
};

export const getEscalationLeadHours = (task: Task, dna: DeadlineDNA | null): number => {
  let base = 24;
  if (!dna) return base;

  const catPattern = dna.categoryPatterns[task.category];
  if (catPattern) {
    if (catPattern.avgLeadHours < 3) {
      base = 6;
    } else if (catPattern.avgLeadHours > 24) {
      base = 48;
    }
  }

  if (dna.procrastinationScore > 70) {
    base = base * 0.7; // reduce by 30%
  }

  return Math.max(2, base);
};
