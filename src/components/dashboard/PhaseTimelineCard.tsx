import React from 'react';
import { CyclePhaseInfo } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PhaseTimelineCardProps {
  cycleInfo: CyclePhaseInfo;
}

export const PhaseTimelineCard: React.FC<PhaseTimelineCardProps> = ({ cycleInfo }) => {
  const { profile } = useAuth();
  const cycleLen = profile.average_cycle_length || 28;
  const periodLen = profile.average_period_length || 5;
  const ovulationDay = cycleLen - 14;

  const phases = [
    {
      id: 'recharge',
      name: '舒緩期',
      range: `Day 1 - ${periodLen}`,
      color: 'bg-rose-500',
      active: cycleInfo.phase === 'recharge',
    },
    {
      id: 'peak_energy',
      name: '濾泡活力期',
      range: `Day ${periodLen + 1} - ${ovulationDay - 3}`,
      color: 'bg-pink-400',
      active: cycleInfo.phase === 'peak_energy',
    },
    {
      id: 'golden_window',
      name: '排卵黃金期',
      range: `Day ${ovulationDay - 2} - ${ovulationDay + 2}`,
      color: 'bg-pink-600',
      active: cycleInfo.phase === 'golden_window',
    },
    {
      id: 'vulnerable',
      name: '經前敏感期',
      range: `Day ${ovulationDay + 3} - ${cycleLen}`,
      color: 'bg-rose-300',
      active: cycleInfo.phase === 'vulnerable',
    },
  ];

  return (
    <div className="glass-card bento-hover rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          四階段週期身心節奏
        </h3>
        <span className="text-xs text-pink-500 font-semibold">
          當前處於：{cycleInfo.phaseName}
        </span>
      </div>

      {/* Visual Timeline Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {phases.map((p) => (
          <div
            key={p.id}
            className={`p-3 rounded-2xl border transition-all duration-300 relative ${
              p.active
                ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-70'
            }`}
          >
            {p.active && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            )}
            <div className="flex items-center space-x-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${p.color}`} />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {p.name}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{p.range}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        基於醫學黃體期逆推演算法 (錨定排卵日 = 下次經期 - 14 天)
      </p>
    </div>
  );
};
