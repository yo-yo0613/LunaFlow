import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Coffee, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { CyclePhaseInfo } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CareGuideCardProps {
  cycleInfo: CyclePhaseInfo;
}

export const CareGuideCard: React.FC<CareGuideCardProps> = ({ cycleInfo }) => {
  const { isPartnerMode } = useAuth();
  const guide = cycleInfo.careGuide;

  return (
    <div className="glass-card bento-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden h-full">
      
      {/* Background Subtle Accent */}
      <div 
        className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: cycleInfo.themeColor }}
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="p-1.5 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: cycleInfo.themeColor }}
            >
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {isPartnerMode ? '今日暖男行動指南' : '今日身心自我照護'}
              </h3>
              <p className="text-[11px] text-pink-500 font-medium">
                {guide.badge}
              </p>
            </div>
          </div>
        </div>

        {/* Phase Summary */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          {guide.summary}
        </p>

        {/* Action Tips List */}
        <div className="space-y-2.5 mb-4">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>{isPartnerMode ? '推薦貼心舉動 (降維打擊)' : '專屬身心調適建議'}</span>
          </p>
          <div className="space-y-2">
            {guide.actionTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start space-x-2.5 text-xs text-zinc-700 dark:text-zinc-200"
              >
                <div className="w-4 h-4 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span>{tip}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pitfalls to Avoid */}
        <div className="space-y-2 mb-4">
          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>{isPartnerMode ? '直男避坑雷區 (千萬別說)' : '避免的過度負擔'}</span>
          </p>
          <div className="space-y-1.5">
            {guide.pitfallTips.map((pitfall, idx) => (
              <div
                key={idx}
                className="text-xs text-rose-700 dark:text-rose-300/90 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center space-x-2"
              >
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>{pitfall}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Food / Tea */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center space-x-2">
        <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 mr-1">推薦飲品/食補:</span>
          {guide.foodRecommendations.join(' · ')}
        </div>
      </div>

    </div>
  );
};
