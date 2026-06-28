import { Task, UserProfile, ChiefOfStaffPlan, DeadlineDNA } from './types';

export const runChiefOfStaff = async (
  tasks: Task[],
  profile: UserProfile | null,
  score: number,
  moodTrend: string,
  deadlineDNA?: DeadlineDNA | null,
  habits?: Task[]
): Promise<ChiefOfStaffPlan> => {
  const now = new Date().toISOString();
  
  try {
    const habitsToSend = habits || tasks.filter(t => t.recurring !== null && t.recurring !== undefined);
    
    const response = await fetch('/api/gemini/chiefOfStaff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tasks: tasks.filter(t => !t.completed && (t.recurring === null || t.recurring === undefined)).map(t => ({ id: t.id, title: t.title, deadline: t.deadline, priority: t.priority })), 
        profile, 
        score, 
        moodTrend, 
        now, 
        deadlineDNA,
        habits: habitsToSend.map(h => ({ id: h.id, title: h.title, habitStreak: h.habitStreak })) 
      })
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        console.warn("[ChiefOfStaff] Server returned non-JSON response:", response.status, contentType);
      }
    } else {
      console.warn("[ChiefOfStaff] Server returned error response:", response.status);
    }
  } catch (err) {
    console.error("Chief of Staff error:", err);
  }
  
  return {
    crisisLevel: "clear",
    interventionMessage: "The day is looking bright! You're doing wonderful. Let's make today count—add some tasks whenever you're ready.",
    restructuredTaskIds: [],
    escalatedTaskIds: [],
    battlePlanSteps: [],
    generatedAt: now
  };
};
