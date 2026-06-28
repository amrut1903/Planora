import { useAppStore } from '../store/app';
import { toast } from 'sonner';
import { BADGES } from './points';

export function useBadgeEngine() {
  const store = useAppStore();

  const checkBadges = () => {
    if (!store.userProfile) return;

    const newlyUnlocked: string[] = [];

    // Helper
    const award = (id: string) => {
      if (!store.badges.includes(id) && !newlyUnlocked.includes(id)) {
        newlyUnlocked.push(id);
      }
    };

    // LEADERBOARD
    if (store.points >= 100) award('rising_starter'); // Top 100 approx
    if (store.points >= 500) award('steady_achiever');
    if (store.points >= 1000) award('top_performer');
    if (store.points >= 5000) award('daily_champion');
    if (store.points >= 10000) award('weekly_champion');
    if (store.points >= 20000) award('monthly_legend');
    if (store.points >= 50000) award('planora_legend');

    // ACHIEVEMENT
    if (store.analytics.totalCompleted >= 1) award('first_step');
    if (store.analytics.totalCompleted >= 10) award('focused');
    if (store.analytics.totalCompleted >= 50) award('on_a_roll');
    if (store.analytics.totalCompleted >= 100) award('goal_getter');
    
    if (store.streak >= 7) award('consistent');
    if (store.streak >= 30) award('self_master');

    // STREAK BADGES
    if (store.streak >= 3) award('streak_3');
    if (store.streak >= 7) award('streak_7');
    if (store.streak >= 14) award('streak_14');
    if (store.streak >= 30) award('streak_30');
    if (store.streak >= 60) award('streak_60');
    if (store.streak >= 100) award('streak_100');

    // Award all newly unlocked
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(id => {
        store.awardBadge(id);
        const b = BADGES.find((x) => x.id === id);
        if (b) {
          toast.success(`🎉 Achievement Unlocked: ${b.name}!`, {
            description: b.description,
            icon: b.emoji,
            duration: 5000
          });
        }
      });
    }
  };

  return { checkBadges };
}
