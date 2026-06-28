import { toast } from 'sonner';
import { useAppStore } from '../store/app';
import { ChiefOfStaffPlan } from './types';
import { getAccessToken } from './auth';
import { createCalendarEvent } from './googleCalendar';

export const triggerAgentEscalation = async (plan: ChiefOfStaffPlan) => {
  const store = useAppStore.getState();

  // Escalate tasks
  if (plan.escalatedTaskIds && plan.escalatedTaskIds.length > 0) {
    plan.escalatedTaskIds.forEach(id => {
      const task = store.tasks.find(t => t.id === id);
      if (task) {
        store.updateTask(id, { priority: 'high' });
        toast.error(`⚠️ Suri escalated "${task.title}" to HIGH priority`);
      }
    });
  }

  if (plan.crisisLevel === 'critical' && plan.escalatedTaskIds && plan.escalatedTaskIds.length > 0) {
    const token = await getAccessToken();
    if (token) {
      let calendarSuccess = false;
      
      const now = new Date();
      let startHour = now.getHours() + 1;
      let startDay = now.getDate();
      
      for (const id of plan.escalatedTaskIds) {
        const task = store.tasks.find(t => t.id === id);
        if (task) {
          const startDate = new Date(now);
          startDate.setDate(startDay);
          startDate.setHours(startHour, 0, 0, 0);
          
          const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
          
          const event = {
            title: `🚨 URGENT: ${task.title}`,
            description: "Auto-blocked by Suri because this task is critical priority",
            startDateTime: startDate.toISOString(),
            endDateTime: endDate.toISOString()
          };
          
          const success = await createCalendarEvent(token, event);
          if (success) {
            calendarSuccess = true;
          }
          
          startHour += 2;
          if (startHour > 23) {
            startHour = 8;
            startDay += 1;
          }
        }
      }
      
      if (calendarSuccess) {
        toast.success("Suri blocked time in your Google Calendar for urgent tasks");
      }
    }
  }

  // Notify battle plan
  if (plan.battlePlanSteps && plan.battlePlanSteps.length > 0) {
    toast.info("Suri's battle plan is ready — check your dashboard");
  }
};
