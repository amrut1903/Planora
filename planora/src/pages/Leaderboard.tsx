import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/app';
import { motion } from 'framer-motion';
import { Trophy, Globe, MapPin, Zap, TrendingUp, ChevronUp } from 'lucide-react';
import { computeRanks, getOrdinal, getRankMotivation, LEADERBOARD_POOL, type LeaderboardEntry } from '../lib/points';
import { regions } from '../lib/formatters';
import { TopMenu } from '../components/TopMenu';
import { getAccessToken } from '../lib/auth';
import { useAdaptiveColors } from '../lib/useBackgroundTheme';

function deterministicPoints(name: string, basePoints: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const factor = 0.6 + (Math.abs(hash) % 100) / 250;
  return Math.max(10, Math.round(basePoints * factor));
}

export default function Leaderboard() {
  const { points, userProfile, settings, streak } = useAppStore();
  const [tab, setTab] = useState<'country' | 'world'>('country');
  const [friends, setFriends] = useState<LeaderboardEntry[]>([]);
  const { text: adaptiveText, muted: adaptiveMuted, card: adaptiveCard, header, iconBtn } = useAdaptiveColors();

  const userCountry = settings.privacy.country || userProfile?.role && 'IN' || 'IN';
  const userName = userProfile?.name || settings.privacy.displayName || 'You';
  const userFlag = LEADERBOARD_POOL.find(u => u.country === userCountry)?.flag
    ?? regions.find(r => r.code === userCountry)?.code
    ?? '🌍';

  const ranks = useMemo(() => computeRanks(points, userCountry), [points, userCountry]);

  useEffect(() => {
    async function fetchFriends() {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const connections = data.connections || [];
        const friendEntries: LeaderboardEntry[] = connections
          .filter((c: any) => c.names && c.names.length > 0)
          .slice(0, 5) // Add up to 5 friends who "use the app"
          .map((c: any, index: number) => ({
            id: `friend_${index}`,
            name: c.names[0].displayName,
            country: userCountry,
            countryName: regions.find(r => r.code === userCountry)?.name || userCountry,
            flag: userFlag,
            points: deterministicPoints(c.names[0].displayName, points),
            role: 'friend',
            streak: Math.abs(deterministicPoints(c.names[0].displayName, 7) % 8),
            avatarSeed: c.names[0].displayName,
          }));
        setFriends(friendEntries);
      } catch (err) {
        console.error('Error fetching contacts', err);
      }
    }
    fetchFriends();
  }, [points, userCountry, userFlag]);

  // Build display list with the real user injected
  const me: LeaderboardEntry = {
    id: 'me',
    name: userName,
    country: userCountry,
    countryName: regions.find(r => r.code === userCountry)?.name || userCountry,
    flag: userFlag,
    points,
    role: userProfile?.role || 'other',
    streak,
    avatarSeed: 'me',
  };

  const worldList = useMemo(() => {
    const list = [...LEADERBOARD_POOL, ...friends].sort((a, b) => b.points - a.points);
    const isInTop20 = list.length < 20 || me.points >= list[19].points;
    if (isInTop20) {
      const listWithMe = [...list, me].sort((a, b) => b.points - a.points);
      return listWithMe.slice(0, 20);
    } else {
      const top19 = list.slice(0, 19);
      top19.push(me);
      return top19.sort((a, b) => b.points - a.points);
    }
  }, [points, friends, me]);

  const countryList = useMemo(() => {
    const list = [...LEADERBOARD_POOL.filter(u => u.country === userCountry), ...friends]
      .sort((a, b) => b.points - a.points);
    list.push(me);
    return list.sort((a, b) => b.points - a.points);
  }, [points, userCountry, friends, me]);

  const displayList = tab === 'world' ? worldList : countryList;
  const currentRank = tab === 'world' ? ranks.worldRank : ranks.countryRank;
  const currentTotal = tab === 'world' ? ranks.worldTotal : ranks.countryTotal;
  const ptsToCatch = tab === 'world' ? ranks.pointsToNextWorldRank : ranks.pointsToNextCountryRank;

  const motivation = getRankMotivation(ranks.worldRank, ranks.worldTotal, userName.split(' ')[0]);

  // Is the user in the visible list?
  const userInList = displayList.some(u => u.id === 'me');

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-brand-text-secondary';
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="pb-28 relative z-10 min-h-full">
      {/* Sticky header */}
      <div className={`sticky top-0 z-20 ${header} px-6 pt-6 pb-4`}>
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
              <Trophy size={20} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <p className="text-xs text-brand-secondary font-medium">Compete. Climb. Conquer.</p>
            </div>
          </div>
          <TopMenu />
        </header>
      </div>

      <div className="px-6 pt-6">
        {/* Motivation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-primary/15 border border-brand-primary/30 rounded-[20px] p-4 mb-5"
      >
        <p className="text-sm font-semibold text-white leading-relaxed">{motivation}</p>
        {ptsToCatch > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-secondary font-medium">
            <TrendingUp size={12} />
            <span>
              Complete <span className="text-white font-bold">{Math.ceil(ptsToCatch / 10)} more tasks</span> to climb one rank {tab === 'world' ? 'globally' : 'in your country'}
            </span>
          </div>
        )}
      </motion.div>

      {/* Rank Cards Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Country Rank */}
        <div
          onClick={() => setTab('country')}
          className={`cursor-pointer p-4 rounded-[20px] border transition-all ${
            tab === 'country'
              ? 'bg-brand-primary border-brand-primary shadow-sm'
              : 'bg-brand-card border-black/5'
          }`}
        >
          <div className={`flex items-center gap-1.5 text-xs font-bold mb-2 ${tab === 'country' ? 'text-white/80' : 'text-brand-text-secondary'}`}>
            <MapPin size={12} /> Country
          </div>
          <div className={`text-3xl font-bold ${tab === 'country' ? 'text-white' : 'text-brand-text-primary'}`}>
            {getOrdinal(ranks.countryRank)}
          </div>
          <div className={`text-xs mt-1 font-medium ${tab === 'country' ? 'text-white/70' : 'text-brand-text-secondary'}`}>
            of {ranks.countryTotal} {userFlag}
          </div>
        </div>

        {/* World Rank */}
        <div
          onClick={() => setTab('world')}
          className={`cursor-pointer p-4 rounded-[20px] border transition-all ${
            tab === 'world'
              ? 'bg-brand-primary border-brand-primary shadow-sm'
              : 'bg-brand-card border-black/5'
          }`}
        >
          <div className={`flex items-center gap-1.5 text-xs font-bold mb-2 ${tab === 'world' ? 'text-white/80' : 'text-brand-text-secondary'}`}>
            <Globe size={12} /> World
          </div>
          <div className={`text-3xl font-bold ${tab === 'world' ? 'text-white' : 'text-brand-text-primary'}`}>
            {getOrdinal(ranks.worldRank)}
          </div>
          <div className={`text-xs mt-1 font-medium ${tab === 'world' ? 'text-white/70' : 'text-brand-text-secondary'}`}>
            of {ranks.worldTotal} 🌍
          </div>
        </div>
      </div>

      {/* Tab Label */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">
          {tab === 'world' ? '🌍 Global Rankings' : `${userFlag} ${me.countryName} Rankings`}
        </h3>
        <span className="text-xs text-brand-secondary font-medium">Top {displayList.length}</span>
      </div>

      {/* Leaderboard List */}
      <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm divide-y divide-black/5 relative">
        {displayList.map((entry, idx) => {
          const isMe = entry.id === 'me';
          if (isMe && currentRank > 20) return null;

          const rank = isMe ? currentRank : idx + 1;
          const medal = getMedalEmoji(rank);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
                isMe ? 'bg-brand-primary/8 border-l-4 border-l-brand-primary' : ''
              }`}
            >
              {/* Rank number */}
              <div className={`w-7 text-center shrink-0 ${getRankStyle(rank)}`}>
                {medal ? (
                  <span className="text-lg">{medal}</span>
                ) : (
                  <span className="text-sm font-bold">{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                isMe ? 'bg-brand-primary text-white' : 'bg-brand-secondary/20 text-brand-text-secondary'
              }`}>
                {isMe ? (
                  <span>You</span>
                ) : (
                  <span>{entry.name.charAt(0)}</span>
                )}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold truncate ${isMe ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
                  {isMe ? `${entry.name} (You)` : entry.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs">{entry.flag}</span>
                  {entry.role === 'friend' ? (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Friend</span>
                  ) : (
                    <span className="text-xs text-brand-text-secondary font-medium capitalize">{entry.role}</span>
                  )}
                  {entry.streak > 0 && (
                    <>
                      <span className="text-brand-text-secondary/40 text-xs">·</span>
                      <span className="text-xs text-orange-500 font-semibold">🔥 {entry.streak}d</span>
                    </>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold ${isMe ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
                  {entry.points.toLocaleString()}
                </div>
                <div className="text-[10px] text-brand-text-secondary font-medium flex items-center justify-end gap-0.5">
                  <Zap size={9} /> pts
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* If user is not in top 20, show them at the bottom as a sticky pinned row */}
        {currentRank > 20 && (
          <>
            <div className="flex items-center justify-center py-2 bg-brand-card/50">
              <span className="text-brand-text-secondary/40 text-lg">•••</span>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sticky bottom-0 z-10 flex items-center gap-3 px-4 py-3.5 bg-[#071128]/95 backdrop-blur-md border-l-4 border-l-brand-primary border-t border-white/5 shadow-lg"
            >
              <div className="w-7 text-center shrink-0 text-brand-text-secondary">
                <span className="text-sm font-bold">{currentRank}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
                You
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-brand-primary truncate">{userName} (You)</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs">{userFlag}</span>
                  <span className="text-xs text-brand-text-secondary font-medium capitalize">{userProfile?.role || 'other'}</span>
                  {streak > 0 && (
                    <><span className="text-brand-text-secondary/40 text-xs">·</span>
                    <span className="text-xs text-orange-500 font-semibold">🔥 {streak}d</span></>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-brand-primary">{points.toLocaleString()}</div>
                <div className="text-[10px] text-brand-text-secondary font-medium flex items-center justify-end gap-0.5">
                  <Zap size={9} /> pts
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Climb hint */}
      {ptsToCatch > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-secondary font-medium">
          <ChevronUp size={14} className="text-brand-primary" />
          <span>
            <span className="text-white font-bold">{ptsToCatch} pts</span> to climb to {getOrdinal(currentRank - 1)} {tab === 'world' ? 'worldwide' : 'in your country'}
          </span>
        </div>
      )}
    </div>
    </div>
  );
}
