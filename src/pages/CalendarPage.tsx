import React from 'react';
import { CycleCalendar } from '../components/calendar/CycleCalendar';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
            週期身心日曆
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            精準鎖定本地日期，完整標記經期、排卵、濾泡與經前波動
          </p>
        </div>
      </div>

      <CycleCalendar />
    </div>
  );
};
