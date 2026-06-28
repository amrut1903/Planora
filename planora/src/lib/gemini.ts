import { Task, TimetableBlock, AppSettings, UserProfile, ChiefOfStaffPlan } from './types';

export const parseBrainDump = async (text: string, profile: UserProfile | null): Promise<Partial<Task>[]> => {
  const response = await fetch('/api/gemini/parseBrainDump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, profile })
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to parse brain dump (${response.status})`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response format (HTML instead of JSON)');
  }
  return response.json();
};

export const chat = async (messages: any[], context: string) => {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context })
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Chat failed (${response.status})`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response format (HTML instead of JSON)');
  }
  const data = await response.json();
  if (!data.text) throw new Error(data.error || 'No response from Suri');
  return data.text;
};

export const getDiaryReflection = async (entries: any[]) => {
  const response = await fetch('/api/gemini/diaryReflection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries })
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Reflection failed (${response.status})`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response format (HTML instead of JSON)');
  }
  const data = await response.json();
  return data.text;
};

export const generateTimetable = async (
  tasks: Task[],
  profile: UserProfile | null,
  preferences: { style: string; layout: string }
): Promise<TimetableBlock[]> => {
  const response = await fetch('/api/gemini/generateTimetable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks: tasks.filter(t => !t.completed),
      profile,
      preferences
    })
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to generate timetable (${response.status})`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned an invalid response format (HTML instead of JSON)');
  }
  return response.json();
};
