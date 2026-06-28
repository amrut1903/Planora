export type BgTheme = 'light' | 'dark';

export function useBackgroundTheme(): BgTheme {
  const hour = new Date().getHours();
  // Morning (6-11) and Afternoon (12-16) are bright backgrounds → need dark text
  // Evening (17-19), Night (20-5) are dark backgrounds → need light text
  if (hour >= 6 && hour < 17) return 'light';
  return 'dark';
}

export function useAdaptiveColors() {
  const theme = useBackgroundTheme();
  const isLight = theme === 'light';
  return {
    text: isLight ? 'text-gray-800' : 'text-white',
    muted: isLight ? 'text-gray-500' : 'text-brand-secondary',
    card: isLight ? 'bg-white/80 border-black/10' : 'bg-brand-card border-white/5',
    pts: isLight ? 'bg-black/10 text-gray-800' : 'bg-white/10 text-white',
    timeLabel: isLight ? 'text-gray-500' : 'text-brand-secondary/60',
    icon: isLight ? 'text-gray-700' : 'text-white',
    // NEW: for sticky headers and nav bars
    header: isLight 
      ? 'bg-white/85 backdrop-blur-xl border-b border-black/8' 
      : 'bg-brand-bg/85 backdrop-blur-xl border-b border-white/5',
    nav: isLight 
      ? 'bg-white/90 backdrop-blur-xl border-t border-black/8' 
      : 'bg-[#071128]/95 backdrop-blur-xl border-t border-white/5',
    iconBtn: isLight 
      ? 'bg-black/8 border border-black/10 text-gray-700 hover:bg-black/15' 
      : 'bg-brand-bg/50 border border-white/10 text-white hover:bg-brand-bg/80',
    theme,
  };
}
