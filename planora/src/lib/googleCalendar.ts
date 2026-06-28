import { TimetableBlock } from './types';

export const getThisWeekMonday = (): Date => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const timetableBlockToCalendarEvent = (block: TimetableBlock, weekStartDate: Date) => {
  const targetDate = new Date(weekStartDate);
  targetDate.setDate(targetDate.getDate() + block.day);
  
  const startSplit = block.start.split(':');
  const endSplit = block.end.split(':');
  
  const startDate = new Date(targetDate);
  startDate.setHours(parseInt(startSplit[0], 10), parseInt(startSplit[1], 10), 0, 0);
  
  const endDate = new Date(targetDate);
  endDate.setHours(parseInt(endSplit[0], 10), parseInt(endSplit[1], 10), 0, 0);
  
  return {
    title: block.title,
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString()
  };
};

export const createCalendarEvent = async (token: string, event: { title: string; description?: string; startDateTime: string; endDateTime: string; }): Promise<boolean> => {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description || '',
        start: { dateTime: event.startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: event.endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      })
    });
    return res.ok;
  } catch (e) {
    console.error('Error creating calendar event:', e);
    return false;
  }
};
