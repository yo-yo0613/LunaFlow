import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Battery, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Smartphone, 
  AlertCircle
} from 'lucide-react';
import { fetchGuestRadar } from '../lib/supabase';
import { calculateCyclePhase } from '../lib/cycleCalculator';
import { GuestRadarData, CyclePhaseInfo } from '../types';
import { toLocalYYYYMMDD } from '../lib/dateUtils';
import { useTheme } from '../context/ThemeContext';
import { PwaInstallModal } from '../components/PwaInstallModal';

export const GuestRadarPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { theme, toggleTheme } = useTheme();
  
  const [radarData, setRadarData] = useState<GuestRadarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInstall, setShowInstall] = useState<boolean>(false);

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

  // 計算週期階段
  const cycleInfo: CyclePhaseInfo = calculateCyclePhase(
    radarData.last_period_start,
    radarData.average_cycle_length,
    radarData.average_period_length,
    toLocalYYYYMMDD()
  );

  const guide = cycleInfo.careGuide;
  const latest = radarData.latest_status;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 pb-20">
      
      {/* Top Navbar */}
      <div className="max-w-lg mx-auto flex items-center justify-between mb-6 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-pink-500/30">
            🌙
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white">
              {radarData.partner_name} 的專屬雷達
            </h1>
            <span className="text-[10px] text-pink-500 font-semibold tracking-wider uppercase">
              守護者唯讀專線
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

      <div className="max-w-lg mx-auto space-y-5">
        
        {/* Main Status Glowing Card */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden border border-pink-200/80 dark:border-pink-900/40">
          <div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: cycleInfo.themeColor }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40">
              <Battery className="w-3.5 h-3.5" />
              <span>{cycleInfo.batteryLabel}</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Day {cycleInfo.cycleDay}
            </span>
          </div>

          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
            {cycleInfo.phaseSubtitle}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
            {guide.summary}
          </p>

          <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <span className="text-zinc-500">下次預估經期倒數</span>
            <span className="font-bold text-pink-500">還有 {cycleInfo.daysUntilNextPeriod} 天</span>
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
