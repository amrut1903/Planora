import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

type TimeState = 'morning' | 'afternoon' | 'evening' | 'night';

const getLandscapeState = (): TimeState => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

export const AnimatedBackground: React.FC = () => {
  const [timeState, setTimeState] = useState<TimeState>('morning');

  useEffect(() => {
    setTimeState(getLandscapeState());
    const interval = setInterval(() => {
      setTimeState(getLandscapeState());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    sky: {
      morning: { background: 'linear-gradient(to bottom, #7CD2EF, #C2ECDE)' },
      afternoon: { background: 'linear-gradient(to bottom, #5B8BEB, #8AC4F6)' },
      evening: { background: 'linear-gradient(to bottom, #6B5B95, #FF9B71)' },
      night: { background: 'linear-gradient(to bottom, #11143A, #283063)' },
    },
    sunMoon: {
      morning: { left: '22%', top: '12%', backgroundColor: '#FFFDF0', scale: 1 },
      afternoon: { left: '48%', top: '8%', backgroundColor: '#FFFFFF', scale: 1.1 },
      evening: { left: '72%', top: '28%', backgroundColor: '#FFD1A9', scale: 1.3 },
      night: { left: '68%', top: '14%', backgroundColor: '#F4F6FF', scale: 0.9 },
    },
    mountainsBack: {
      morning: { fill: '#74C597' },
      afternoon: { fill: '#4876B5' },
      evening: { fill: '#55416B' },
      night: { fill: '#0F1535' },
    },
    mountainsMid: {
      morning: { fill: '#4EAC74' },
      afternoon: { fill: '#33588D' },
      evening: { fill: '#392B4F' },
      night: { fill: '#0A0E24' },
    },
    lake: {
      morning: { fill: '#AEE1D8' },
      afternoon: { fill: '#70B0E8' },
      evening: { fill: '#C87873' },
      night: { fill: '#1B234F' },
    },
    foreground: {
      morning: { fill: '#348B57' },
      afternoon: { fill: '#244569' },
      evening: { fill: '#251A36' },
      night: { fill: '#060917' },
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* Sky */}
      <motion.div
        className="absolute inset-0"
        variants={variants.sky}
        initial={timeState}
        animate={timeState}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Stars for night */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: timeState === 'night' ? 0.7 : 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZyBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjgiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSI4MCIgcj0iMS41Ii8+PGNpcmNsZSBjeD0iMzIwIiBjeT0iMTAiIHI9IjEiLz48Y2lyY2xlIGN4PSIyMjAiIGN5PSIxMjAiIHI9IjIiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjE4MCIgcj0iMSIvPjwvZz48L3N2Zz4=')] opacity-50"
      />

      {/* Sun/Moon */}
      <motion.div
        className="absolute w-16 h-16 rounded-full opacity-90"
        style={{ position: 'absolute' }}
        variants={variants.sunMoon}
        initial={timeState}
        animate={timeState}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <svg
        className="absolute bottom-0 w-full h-[65%] preserve-3d"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Lake */}
        <motion.rect
          x="0"
          y="50"
          width="100"
          height="50"
          variants={variants.lake}
          initial={timeState}
          animate={timeState}
          transition={{ duration: 2 }}
        />

        {/* Back Mountains */}
        <motion.path
          d="M-10 60 L15 35 L40 60 L65 25 L110 65 L110 100 L-10 100 Z"
          variants={variants.mountainsBack}
          initial={timeState}
          animate={timeState}
          transition={{ duration: 2 }}
        />

        {/* Mid Mountains */}
        <motion.path
          d="M-10 70 L25 45 L50 65 L70 50 L110 75 L110 100 L-10 100 Z"
          variants={variants.mountainsMid}
          initial={timeState}
          animate={timeState}
          transition={{ duration: 2 }}
        />

        {/* Foreground terrain */}
        <motion.path
          d="M0 80 Q30 75 50 85 T100 80 L100 100 L0 100 Z"
          variants={variants.foreground}
          initial={timeState}
          animate={timeState}
          transition={{ duration: 2 }}
        />

        {/* Dynamic Vibe Elements removed for a cleaner look */}
      </svg>
    </div>
  );
};
