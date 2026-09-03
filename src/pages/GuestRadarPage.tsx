import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Battery, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Smartphone, 
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchGuestRadar } from '../lib/supabase';
import { calculateCyclePhase, getPhaseLabel } from '../lib/cycleCalculator';
import { GuestRadarData, CyclePhaseInfo } from '../types';
import { toLocalYYYYMMDD, formatDisplayDate } from '../lib/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { PwaInstallModal } from '../components/PwaInstallModal';

export const GuestRadarPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { theme, toggleTheme } = useTheme();
  
  const [radarData, setRadarData] = useState<GuestRadarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInstall, setShowInstall] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'calendar'>('radar');

  // 男生專屬行事曆狀態
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(toLocalYYYYMMDD());

  useEffect(() => {
    async function loadRadar() {
      if (!token) return;
      setLoading(true);
      const data = await fetchGuestRadar(token);
      setRadarData(data);
      setLoading(false);
    }
    loadRadar();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">正在連線至月見守護雷達...</p>
        </div>
      </div>
    );
  }

  if (!radarData || !radarData.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#09090b]">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            連結已失效或分享已停用
          </h2>
          <p className="text-xs text-zinc-500">
            請向伴侶確認是否已更新專屬 Token 或開啟了守護分享開關。
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-pink-500 text-white text-xs font-semibold"
          >
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  // 今日週期階段
  const todayCycleInfo: CyclePhaseInfo = calculateCyclePhase(
    radarData.last_period_start,
    radarData.average_cycle_length,
    radarData.average_period_length,
    toLocalYYYYMMDD()
  );

  const guide = todayCycleInfo.careGuide;
  const latest = radarData.latest_status;

  // 行事曆月份計算
  const calYear = currentCalendarDate.getFullYear();
  const calMonth = currentCalendarDate.getMonth();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // 選中日期的身心階段
  const selectedDatePhase: CyclePhaseInfo = calculateCyclePhase(
    radarData.last_period_start,
    radarData.average_cycle_length,
    radarData.average_period_length,
    selectedDateStr
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 pb-20">
      
      {/* Top Navbar */}
      <div className="max-w-xl mx-auto flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-pink-500/30">
            🌙
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white">
              {radarData.partner_name} 的專屬守護雷達
            </h1>
            <span className="text-[10px] text-pink-500 font-semibold tracking-wider uppercase">
              守護者專屬視角 (唯讀同步)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInstall(true)}
            className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 text-xs font-medium border border-pink-200 dark:border-pink-900/60 flex items-center space-x-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">加到主畫面</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs (今日雷達 vs 完整行事曆) */}
      <div className="max-w-xl mx-auto flex p-1.5 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-2xl mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'radar'
              ? 'bg-white dark:bg-zinc-900 text-pink-500 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>⚡ 今日守護雷達</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'calendar'
              ? 'bg-white dark:bg-zinc-900 text-pink-500 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>📅 週期守護行事曆</span>
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        
        {/* ==================================================================== */}
        {/* TAB 1: 今日守護雷達 */}
        {/* ==================================================================== */}
        {activeTab === 'radar' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Main Status Glowing Card */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden border border-pink-200/80 dark:border-pink-900/40">
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: todayCycleInfo.themeColor }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40">
                  <Battery className="w-3.5 h-3.5" />
                  <span>{todayCycleInfo.batteryLabel}</span>
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  週期第 {todayCycleInfo.cycleDay} 天
                </span>
              </div>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                {todayCycleInfo.phaseSubtitle}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                {guide.summary}
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                <span className="text-zinc-500">下次預估經期倒數</span>
                <span className="font-bold text-pink-500">還有 {todayCycleInfo.daysUntilNextPeriod} 天</span>
              </div>
            </div>

            {/* Action Tips */}
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-pink-500 mb-3.5">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  今日暖男不著痕跡指南
                </h3>
              </div>

              <div className="space-y-2.5 mb-5">
                {guide.actionTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="text-pink-500 font-bold shrink-0 mt-0.5">●</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-rose-700 dark:text-rose-300">
                <span className="font-bold block mb-1">⚠️ 千萬別說的直男雷區：</span>
                <span>{guide.pitfallTips[0]}</span>
              </div>
            </div>

            {/* Latest Signals (Safe Desensitized) */}
            {latest && (
              <div className="glass-card rounded-3xl p-6 space-y-3">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-pink-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    女孩已授權同步之身心信號
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">今日活力</span>
                    <span className="text-sm font-extrabold text-pink-500">
                      {latest.energy_level} / 5
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">心情傾向</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {latest.safe_moods?.length ? latest.safe_moods.join(' · ') : '平和'}
                    </span>
                  </div>
                </div>

                {latest.safe_symptoms && latest.safe_symptoms.length > 0 && (
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block mb-1">身體訊號</span>
                    <div className="flex flex-wrap gap-1">
                      {latest.safe_symptoms.map(s => (
                        <span key={s} className="px-2 py-0.5 text-xs rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: 完整身心守護行事曆 (男生專屬月曆視圖) */}
        {/* ==================================================================== */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="glass-card rounded-3xl p-6">
              
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {calYear} 年 {calMonth + 1} 月
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    點擊任何日期，預先查看當天約會建議與身心狀態
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCurrentCalendarDate(new Date(calYear, calMonth - 1, 1))}
                    className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentCalendarDate(new Date())}
                    className="px-2.5 py-1 text-xs font-semibold text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg"
                  >
                    本月
                  </button>
                  <button
                    onClick={() => setCurrentCalendarDate(new Date(calYear, calMonth + 1, 1))}
                    className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                  <div
                    key={day}
                    className={`text-[11px] font-bold py-1 ${
                      i === 0 || i === 6 ? 'text-pink-500' : 'text-zinc-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Matrix */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty prefix cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-14 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/20 opacity-30" />
                ))}

                {/* Days */}
                {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = dateStr === toLocalYYYYMMDD();
                  const isSelected = dateStr === selectedDateStr;

                  const dayPhase = calculateCyclePhase(
                    radarData.last_period_start,
                    radarData.average_cycle_length,
                    radarData.average_period_length,
                    dateStr
                  );

                  let phaseBg = '';
                  if (dayPhase.phase === 'recharge') {
                    phaseBg = 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-300 dark:border-rose-900/40';
                  } else if (dayPhase.phase === 'golden_window') {
                    phaseBg = 'bg-pink-500/10 dark:bg-pink-500/20 border-pink-300 dark:border-pink-900/40';
                  } else if (dayPhase.phase === 'peak_energy') {
                    phaseBg = 'bg-pink-100/40 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/30';
                  } else {
                    phaseBg = 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800';
                  }

                  return (
                    <motion.button
                      key={dateStr}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-14 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${phaseBg} ${
                        isSelected ? 'ring-2 ring-pink-500 shadow-md' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>

                      <span className="text-[9px] font-semibold truncate text-zinc-500 dark:text-zinc-400">
                        {getPhaseLabel(dayPhase.phase).split(' ')[1] || ''}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                  <span>🌸 舒緩修復</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400/50" />
                  <span>⚡ 活力濾泡</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-600/50" />
                  <span>🌕 排卵黃金</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span>🌙 經前敏感</span>
                </div>
              </div>

            </div>

            {/* Selected Date Caring & Date Planning Card */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {formatDisplayDate(selectedDateStr)} 守護預測
                  </h3>
                  <p className="text-xs text-pink-500 font-semibold mt-0.5">
                    {selectedDatePhase.phaseName} · {selectedDatePhase.batteryLabel}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="font-bold block mb-1 text-pink-500">💡 當天約會與相處指南：</span>
                  <span>{selectedDatePhase.careGuide.actionTips[0]}</span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-rose-700 dark:text-rose-300">
                  <span className="font-bold block mb-1 text-rose-500">⚠️ 當天避坑提醒：</span>
                  <span>{selectedDatePhase.careGuide.pitfallTips[0]}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add to Home Screen Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-200 dark:border-pink-900/40 text-center space-y-2">
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            想天天第一時間掌握守護指南？
          </p>
          <button
            onClick={() => setShowInstall(true)}
            className="px-5 py-2.5 rounded-xl bg-pink-500 text-white font-semibold text-xs shadow-md shadow-pink-500/25 hover:bg-pink-600 transition-colors inline-flex items-center space-x-1.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>將此雷達加到手機主畫面</span>
          </button>
        </div>

      </div>

      {/* PWA Install Modal */}
      <PwaInstallModal isOpen={showInstall} onClose={() => setShowInstall(false)} />

    </div>
  );
};
