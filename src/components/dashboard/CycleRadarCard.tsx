import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Moon, Sparkles, HeartHandshake, Flame, Calendar } from 'lucide-react';
import { CyclePhaseInfo } from '../../types';
import { getPredictedNextPeriodDate, getPhaseLabel } from '../../lib/cycleCalculator';
import { useAuth } from '../../context/AuthContext';
import { formatDisplayDate } from '../../lib/dateUtils';

interface CycleRadarCardProps {
  cycleInfo: CyclePhaseInfo;
}

export const CycleRadarCard: React.FC<CycleRadarCardProps> = ({ cycleInfo }) => {
  const { profile } = useAuth();
  const nextPeriodDate = getPredictedNextPeriodDate(profile.last_period_start, profile.average_cycle_length);

  // SVG 圓環參數
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, Math.max(0, cycleInfo.cycleDay / profile.average_cycle_length));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const phaseIcons: Record<string, any> = {
    recharge: HeartHandshake,
    peak_energy: Sparkles,
    golden_window: Flame,
    vulnerable: Moon,
  };

  const Icon = phaseIcons[cycleInfo.phase] || Sparkles;

  return (
    <div className="glass-card bento-hover rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between relative overflow-hidden group">
      
      {/* Background Breathing Ambient Glow */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.35, 0.18],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: cycleInfo.themeColor }}
      />

      {/* Top Header Capsule */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span 
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: cycleInfo.themeColor }}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            月見身心雷達
          </span>
        </div>

        {/* Battery Indicator Capsule */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
          <Battery className="w-3.5 h-3.5 text-pink-500" />
          <span>{cycleInfo.batteryLabel}</span>
        </div>
      </div>

      {/* Central Interactive Circular Radar */}
      <div className="relative my-6 flex items-center justify-center">
        
        <svg className="w-56 h-56 transform -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-zinc-100 dark:text-zinc-800/60"
          />
          {/* Progress Glowing Indicator Ring */}
          <motion.circle
            cx="112"
            cy="112"
            r={radius}
            stroke={cycleInfo.themeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 12px ${cycleInfo.themeColor})`
            }}
          />
        </svg>

        {/* Center Content Inside Ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.08, 1],
              opacity: 1
            }}
            transition={{ 
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.3 }
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1 shadow-inner"
            style={{ backgroundColor: `${cycleInfo.themeColor}22`, color: cycleInfo.themeColor }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>

          <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Day {cycleInfo.cycleDay}
          </span>
          <span className="text-xs font-bold text-pink-500 mt-0.5">
            {getPhaseLabel(cycleInfo.phase)}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            週期進度 {Math.round(progressRatio * 100)}%
          </span>
        </div>

      </div>

      {/* Bottom Summary Bar */}
      <div className="w-full pt-2 z-10">
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            <div className="text-left">
              <p className="text-[11px] text-zinc-400">預計下次經期</p>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {formatDisplayDate(nextPeriodDate)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-pink-500">
              倒數 {cycleInfo.daysUntilNextPeriod} 天
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
