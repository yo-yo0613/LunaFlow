import React from 'react';
import { CycleRadarCard } from '../components/dashboard/CycleRadarCard';
import { CareGuideCard } from '../components/dashboard/CareGuideCard';
import { QuickLogCard } from '../components/dashboard/QuickLogCard';
import { PhaseTimelineCard } from '../components/dashboard/PhaseTimelineCard';
import { PartnerPokeCard } from '../components/dashboard/PartnerPokeCard';
import { useAuth } from '../context/AuthContext';
import { Sparkles, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onOpenShare: () => void;
  onOpenOnboarding: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenShare, onOpenOnboarding }) => {
  const { cycleInfo, profile, isPartnerMode } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Mobile Dynamic Island / Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-transparent border border-pink-200/60 dark:border-pink-900/40">
        <div>
          <div className="flex items-center space-x-2 text-pink-500 mb-0.5">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isPartnerMode ? '🛡️ 暖男守護者雷達模式' : `✨ ${profile.display_name} 的身心節奏`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            {cycleInfo.phaseSubtitle}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenOnboarding}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
            <span>重新校準週期</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Bento Column 1: Circular Radar Card */}
        <div className="lg:col-span-1">
          <CycleRadarCard cycleInfo={cycleInfo} />
        </div>

        {/* Bento Column 2: Caring Action Guide Card */}
        <div className="lg:col-span-1">
          <CareGuideCard cycleInfo={cycleInfo} />
        </div>

        {/* Bento Column 3: Daily Quick Log / Status Card */}
        <div className="lg:col-span-1 md:col-span-2">
          <QuickLogCard />
        </div>

      </div>

      {/* Bento Row 2: 4-Phase Rhythm Timeline + Partner Poke & Share Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PhaseTimelineCard cycleInfo={cycleInfo} />
        </div>
        <div className="lg:col-span-1">
          <PartnerPokeCard cycleInfo={cycleInfo} onOpenShare={onOpenShare} />
        </div>
      </div>

    </div>
  );
};
