export const POINTS = {
  taskComplete: 10,
  highPriority: 15,
  badge: 50,
  agentUse: 2,
  voiceUse: 3,
  timetable: 10,
  streakDay: 5,
};

export const BADGES = [
  // Leaderboard Badges
  { id: 'rising_starter', emoji: '🥉', name: 'Rising Starter', description: 'Top 100', category: 'Leaderboard' },
  { id: 'steady_achiever', emoji: '🥈', name: 'Steady Achiever', description: 'Top 50', category: 'Leaderboard' },
  { id: 'top_performer', emoji: '🥇', name: 'Top Performer', description: 'Top 10', category: 'Leaderboard' },
  { id: 'daily_champion', emoji: '💎', name: 'Daily Champion', description: 'Rank #1 (Day)', category: 'Leaderboard' },
  { id: 'weekly_champion', emoji: '👑', name: 'Weekly Champion', description: 'Rank #1 (Week)', category: 'Leaderboard' },
  { id: 'monthly_legend', emoji: '🛡️', name: 'Monthly Legend', description: 'Rank #1 (Month)', category: 'Leaderboard' },
  { id: 'planora_legend', emoji: '⭐', name: 'Planora Legend', description: 'All Time Top', category: 'Leaderboard' },

  // Achievement Badges
  { id: 'first_step', emoji: '📝', name: 'First Step', description: 'Complete your first task', category: 'Achievement' },
  { id: 'focused', emoji: '🎯', name: 'Focused', description: 'Complete 10 tasks', category: 'Achievement' },
  { id: 'on_a_roll', emoji: '🚀', name: 'On a Roll', description: 'Complete 50 tasks', category: 'Achievement' },
  { id: 'goal_getter', emoji: '🌟', name: 'Goal Getter', description: 'Complete 100 tasks', category: 'Achievement' },
  { id: 'consistent', emoji: '🔥', name: 'Consistent', description: '7 days in a row', category: 'Achievement' },
  { id: 'life_saver', emoji: '💖', name: 'Life Saver', description: 'Follow all reminders for a day', category: 'Achievement' },
  { id: 'self_master', emoji: '🧠', name: 'Self Master', description: '30 days consistent', category: 'Achievement' },
  { id: 'planora_pro', emoji: '🏆', name: 'Planora Pro', description: 'Unlock all achievements', category: 'Achievement' },

  // Streak Badges
  { id: 'streak_3', emoji: '🌊', name: 'Building Habit', description: '3 Days Streak', category: 'Streak' },
  { id: 'streak_7', emoji: '🌀', name: 'Week Warrior', description: '7 Days Streak', category: 'Streak' },
  { id: 'streak_14', emoji: '🔮', name: 'Fortnight Focus', description: '14 Days Streak', category: 'Streak' },
  { id: 'streak_30', emoji: '🧡', name: 'Month Master', description: '30 Days Streak', category: 'Streak' },
  { id: 'streak_60', emoji: '❤️', name: 'Dedication Level', description: '60 Days Streak', category: 'Streak' },
  { id: 'streak_100', emoji: '💛', name: 'Unstoppable', description: '100 Days Streak', category: 'Streak' },
];

export interface LeaderboardEntry {
  id: string;
  name: string;
  country: string;      // e.g. "IN"
  countryName: string;  // e.g. "India"
  flag: string;         // emoji flag
  points: number;
  role: string;         // "student" | "professional" etc
  streak: number;
  avatarSeed: string;
}

// A global pool of realistic users across many countries.
// The app injects the real user into this pool and computes their rank.
export const LEADERBOARD_POOL: LeaderboardEntry[] = [
  // India
  { id: 'u1',  name: 'Aarav Shah',        country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 810, role: 'student',      streak: 21, avatarSeed: 'aarav' },
  { id: 'u2',  name: 'Priya Patel',        country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 640, role: 'professional', streak: 18, avatarSeed: 'priya' },
  { id: 'u3',  name: 'Rohan Mehta',        country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 520, role: 'student',      streak: 14, avatarSeed: 'rohan' },
  { id: 'u4',  name: 'Sneha Iyer',         country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 410, role: 'freelancer',   streak: 11, avatarSeed: 'sneha' },
  { id: 'u5',  name: 'Arjun Nair',         country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 290, role: 'student',      streak:  9, avatarSeed: 'arjun' },
  { id: 'u6',  name: 'Kavita Sharma',      country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 180, role: 'professional', streak:  6, avatarSeed: 'kavita' },
  { id: 'u7',  name: 'Dev Kapoor',         country: 'IN', countryName: 'India',          flag: '🇮🇳', points: 80,  role: 'student',      streak:  4, avatarSeed: 'dev' },
  // USA
  { id: 'u8',  name: 'Ethan Brown',        country: 'US', countryName: 'United States',  flag: '🇺🇸', points: 790, role: 'professional', streak: 19, avatarSeed: 'ethan' },
  { id: 'u9',  name: 'Olivia Smith',       country: 'US', countryName: 'United States',  flag: '🇺🇸', points: 610, role: 'student',      streak: 16, avatarSeed: 'olivia' },
  { id: 'u10', name: 'Liam Johnson',       country: 'US', countryName: 'United States',  flag: '🇺🇸', points: 480, role: 'freelancer',   streak: 12, avatarSeed: 'liam' },
  { id: 'u11', name: 'Emma Davis',         country: 'US', countryName: 'United States',  flag: '🇺🇸', points: 340, role: 'student',      streak:  8, avatarSeed: 'emma' },
  { id: 'u12', name: 'Noah Wilson',        country: 'US', countryName: 'United States',  flag: '🇺🇸', points: 120, role: 'professional', streak:  5, avatarSeed: 'noah' },
  // UK
  { id: 'u13', name: 'James Taylor',       country: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', points: 710, role: 'professional', streak: 15, avatarSeed: 'james' },
  { id: 'u14', name: 'Charlotte Moore',    country: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', points: 550, role: 'student',      streak: 13, avatarSeed: 'charlotte' },
  { id: 'u15', name: 'Harry Anderson',     country: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', points: 310, role: 'freelancer',   streak:  7, avatarSeed: 'harry' },
  // Japan
  { id: 'u16', name: 'Yuki Tanaka',        country: 'JP', countryName: 'Japan',          flag: '🇯🇵', points: 830, role: 'professional', streak: 22, avatarSeed: 'yuki' },
  { id: 'u17', name: 'Hana Sato',          country: 'JP', countryName: 'Japan',          flag: '🇯🇵', points: 590, role: 'student',      streak: 17, avatarSeed: 'hana' },
  { id: 'u18', name: 'Kenji Nakamura',     country: 'JP', countryName: 'Japan',          flag: '🇯🇵', points: 390, role: 'professional', streak: 10, avatarSeed: 'kenji' },
  // Germany
  { id: 'u19', name: 'Lucas Müller',       country: 'DE', countryName: 'Germany',        flag: '🇩🇪', points: 750, role: 'student',      streak: 16, avatarSeed: 'lucas' },
  { id: 'u20', name: 'Sophie Schmidt',     country: 'DE', countryName: 'Germany',        flag: '🇩🇪', points: 520, role: 'professional', streak: 11, avatarSeed: 'sophie' },
  { id: 'u21', name: 'Felix Wagner',       country: 'DE', countryName: 'Germany',        flag: '🇩🇪', points: 280, role: 'freelancer',   streak:  8, avatarSeed: 'felix' },
  // Brazil
  { id: 'u22', name: 'Mateus Costa',       country: 'BR', countryName: 'Brazil',         flag: '🇧🇷', points: 680, role: 'student',      streak: 14, avatarSeed: 'mateus' },
  { id: 'u23', name: 'Ana Oliveira',       country: 'BR', countryName: 'Brazil',         flag: '🇧🇷', points: 430, role: 'professional', streak: 10, avatarSeed: 'ana' },
  // China
  { id: 'u24', name: 'Wei Chen',           country: 'CN', countryName: 'China',          flag: '🇨🇳', points: 820, role: 'professional', streak: 20, avatarSeed: 'wei' },
  { id: 'u25', name: 'Li Mei',             country: 'CN', countryName: 'China',          flag: '🇨🇳', points: 580, role: 'student',      streak: 15, avatarSeed: 'limei' },
  // France
  { id: 'u26', name: 'Chloé Dubois',       country: 'FR', countryName: 'France',         flag: '🇫🇷', points: 640, role: 'professional', streak: 13, avatarSeed: 'chloe' },
  { id: 'u27', name: 'Hugo Martin',        country: 'FR', countryName: 'France',         flag: '🇫🇷', points: 390, role: 'student',      streak:  9, avatarSeed: 'hugo' },
  // South Korea
  { id: 'u28', name: 'Min-jun Lee',        country: 'KR', countryName: 'South Korea',    flag: '🇰🇷', points: 840, role: 'student',      streak: 19, avatarSeed: 'minjun' },
  { id: 'u29', name: 'Ji-yeon Park',       country: 'KR', countryName: 'South Korea',    flag: '🇰🇷', points: 530, role: 'professional', streak: 14, avatarSeed: 'jiyeon' },
  // Nigeria
  { id: 'u30', name: 'Chukwuemeka Eze',   country: 'NG', countryName: 'Nigeria',        flag: '🇳🇬', points: 510, role: 'student',      streak: 12, avatarSeed: 'chukwu' },
  { id: 'u31', name: 'Amaka Obi',          country: 'NG', countryName: 'Nigeria',        flag: '🇳🇬', points: 260, role: 'professional', streak:  8, avatarSeed: 'amaka' },
  // Indonesia
  { id: 'u32', name: 'Budi Santoso',       country: 'ID', countryName: 'Indonesia',      flag: '🇮🇩', points: 470, role: 'freelancer',   streak: 11, avatarSeed: 'budi' },
  { id: 'u33', name: 'Siti Rahayu',        country: 'ID', countryName: 'Indonesia',      flag: '🇮🇩', points: 210, role: 'student',      streak:  7, avatarSeed: 'siti' },
  // Pakistan
  { id: 'u34', name: 'Bilal Ahmed',        country: 'PK', countryName: 'Pakistan',       flag: '🇵🇰', points: 560, role: 'student',      streak: 13, avatarSeed: 'bilal' },
  { id: 'u35', name: 'Ayesha Khan',        country: 'PK', countryName: 'Pakistan',       flag: '🇵🇰', points: 340, role: 'professional', streak:  9, avatarSeed: 'ayesha' },
  // Canada
  { id: 'u36', name: 'Sophia Tremblay',    country: 'CA', countryName: 'Canada',         flag: '🇨🇦', points: 650, role: 'professional', streak: 15, avatarSeed: 'sophia' },
  { id: 'u37', name: 'Luca Rossi',         country: 'IT', countryName: 'Italy',          flag: '🇮🇹', points: 460, role: 'student',      streak: 11, avatarSeed: 'luca' },
  { id: 'u38', name: 'Maria García',       country: 'ES', countryName: 'Spain',          flag: '🇪🇸', points: 420, role: 'professional', streak:  9, avatarSeed: 'maria' },
  { id: 'u39', name: 'Mohammed Al-Rashid', country: 'AE', countryName: 'UAE',            flag: '🇦🇪', points: 760, role: 'professional', streak: 18, avatarSeed: 'mohammed' },
  { id: 'u40', name: 'Fatima Hassan',      country: 'EG', countryName: 'Egypt',          flag: '🇪🇬', points: 490, role: 'student',      streak: 12, avatarSeed: 'fatima' },
  { id: 'u41', name: 'Diego Fernández',    country: 'MX', countryName: 'Mexico',         flag: '🇲🇽', points: 550, role: 'professional', streak: 14, avatarSeed: 'diego' },
  { id: 'u42', name: 'Nguyen Thi Lan',     country: 'VN', countryName: 'Vietnam',        flag: '🇻🇳', points: 310, role: 'student',      streak:  8, avatarSeed: 'nguyen' },
  { id: 'u43', name: 'Aisha Diallo',       country: 'SN', countryName: 'Senegal',        flag: '🇸🇳', points: 230, role: 'student',      streak:  7, avatarSeed: 'aisha' },
  { id: 'u44', name: 'Tariq Al-Sayed',     country: 'SA', countryName: 'Saudi Arabia',   flag: '🇸🇦', points: 670, role: 'professional', streak: 16, avatarSeed: 'tariq' },
  { id: 'u45', name: 'Elena Popescu',      country: 'RO', countryName: 'Romania',        flag: '🇷🇴', points: 290, role: 'freelancer',   streak:  8, avatarSeed: 'elena' },
  { id: 'u46', name: 'Olga Kovalenko',     country: 'UA', countryName: 'Ukraine',        flag: '🇺🇦', points: 440, role: 'professional', streak: 10, avatarSeed: 'olga' },
  { id: 'u47', name: 'Kwame Asante',       country: 'GH', countryName: 'Ghana',          flag: '🇬🇭', points: 400, role: 'student',      streak:  9, avatarSeed: 'kwame' },
  { id: 'u48', name: 'Isabelle Lefebvre',  country: 'BE', countryName: 'Belgium',        flag: '🇧🇪', points: 510, role: 'professional', streak: 11, avatarSeed: 'isabelle' },
  { id: 'u49', name: 'Anders Larsen',      country: 'DK', countryName: 'Denmark',        flag: '🇩🇰', points: 540, role: 'professional', streak: 13, avatarSeed: 'anders' },
  { id: 'u50', name: 'Nadia Kowalski',     country: 'PL', countryName: 'Poland',         flag: '🇵🇱', points: 450, role: 'student',      streak: 10, avatarSeed: 'nadia' },
];

// Compute user's world rank and country rank from the pool
export function computeRanks(userPoints: number, userCountry: string): {
  worldRank: number;
  worldTotal: number;
  countryRank: number;
  countryTotal: number;
  pointsToNextWorldRank: number;
  pointsToNextCountryRank: number;
  worldLeaders: LeaderboardEntry[];       // top 10 world
  countryLeaders: LeaderboardEntry[];     // top 10 in country
} {
  const allSorted = [...LEADERBOARD_POOL].sort((a, b) => b.points - a.points);
  const worldRank = allSorted.filter(u => u.points > userPoints).length + 1;
  
  const countryPeers = LEADERBOARD_POOL.filter(u => u.country === userCountry);
  const countrySorted = [...countryPeers].sort((a, b) => b.points - a.points);
  const countryRank = countrySorted.filter(u => u.points > userPoints).length + 1;
  
  const nextWorldEntry = allSorted[worldRank - 2]; // person just ahead
  const nextCountryEntry = countrySorted[countryRank - 2];
  
  return {
    worldRank,
    worldTotal: LEADERBOARD_POOL.length + 1,
    countryRank,
    countryTotal: countryPeers.length + 1,
    pointsToNextWorldRank: nextWorldEntry ? nextWorldEntry.points - userPoints + 1 : 0,
    pointsToNextCountryRank: nextCountryEntry ? nextCountryEntry.points - userPoints + 1 : 0,
    worldLeaders: allSorted.slice(0, 10),
    countryLeaders: countrySorted.slice(0, 10),
  };
}

export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function getRankMotivation(worldRank: number, worldTotal: number, name: string): string {
  const pct = Math.round((1 - (worldRank - 1) / worldTotal) * 100);
  if (worldRank === 1) return `🏆 You're #1 in the world, ${name}! Legendary.`;
  if (worldRank <= 3) return `🥇 Top 3 globally, ${name}! You're elite.`;
  if (worldRank <= 10) return `🔥 Top 10 worldwide! You're in the upper echelon, ${name}.`;
  if (pct >= 80) return `⚡ You're in the top ${100 - pct}% worldwide, ${name}. Keep pushing!`;
  if (pct >= 50) return `💪 You're ahead of ${pct}% of the world, ${name}. Climb higher!`;
  return `🌱 Every task brings you closer to the top, ${name}. Let's go!`;
}
