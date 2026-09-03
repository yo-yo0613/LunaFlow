import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { toLocalYYYYMMDD, addDaysLocal } from '../lib/dateUtils';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, setIsOnboarded } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [lastPeriodStart, setLastPeriodStart] = useState<string>(profile.last_period_start || toLocalYYYYMMDD());
  const [cycleLength, setCycleLength] = useState<number>(profile.average_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState<number>(profile.average_period_length || 5);
  const [displayName, setDisplayName] = useState<string>(profile.display_name || '我的女孩');

  if (!isOpen) return null;

  const handleFinish = async () => {
    // 觸發彩帶特效
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#ec4899', '#ffffff']
    });

    await updateProfile({
      display_name: displayName,
      last_period_start: lastPeriodStart,
      average_cycle_length: cycleLength,
      average_period_length: periodLength,
    });

    setIsOnboarded(true);
    localStorage.setItem('lunaflow_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glowing Background Accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-pink-500">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">個人化專屬雷達配置</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  step === i
                    ? 'w-6 bg-pink-500'
                    : step > i
                    ? 'bg-pink-300 dark:bg-pink-800'
                    : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  最近一次經期什麼時候開始？
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  我們將使用此基準錨定醫學黃體期逆推演算法。
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  暱稱 / 守護對象稱呼
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例如：我的女孩 / 寶貝"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-pink-500"
                />

                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 pt-2">
                  經期開始日期
                </label>
                <input
                  type="date"
                  value={lastPeriodStart}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-pink-500"
                />

                {/* Quick Date Selectors */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: '今天', date: toLocalYYYYMMDD() },
                    { label: '3 天前', date: addDaysLocal(toLocalYYYYMMDD(), -3) },
                    { label: '7 天前 (預設)', date: addDaysLocal(toLocalYYYYMMDD(), -7) },
                    { label: '14 天前', date: addDaysLocal(toLocalYYYYMMDD(), -14) },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setLastPeriodStart(item.date)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        lastPeriodStart === item.date
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-md shadow-pink-500/25 hover:opacity-95 transition-opacity"
                >
                  <span>下一步</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  平常生理週期大約幾天？
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  從這一次經期第一天，到下一次來的第一天（正常為 24 ~ 35 天）。
                </p>
              </div>

              <div className="text-center py-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-2xl border border-pink-100 dark:border-pink-900/40">
                <span className="text-4xl font-extrabold text-pink-500">{cycleLength}</span>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 ml-1">天</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="21"
                max="40"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[26, 28, 30, 32].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCycleLength(num)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      cycleLength === num
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {num} 天 {num === 28 ? '(常見)' : ''}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-zinc-500 text-sm font-medium hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-md shadow-pink-500/25 hover:opacity-95 transition-opacity"
                >
                  <span>下一步</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  每次月經大約持續幾天？
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  通常為 4 ~ 7 天，用於切分第一階段 Recharge 舒緩修復期。
                </p>
              </div>

              <div className="text-center py-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-2xl border border-pink-100 dark:border-pink-900/40">
                <span className="text-4xl font-extrabold text-pink-500">{periodLength}</span>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 ml-1">天</span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeriodLength(num)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      periodLength === num
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {num} 天 {num === 5 ? '(標準)' : ''}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-start space-x-2">
                <Heart className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <span>
                  設定完成後，系統將自動啟動動態滑動平均與暖男守護指南！
                </span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-zinc-500 text-sm font-medium hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 text-white font-semibold text-sm shadow-lg shadow-pink-500/30 hover:scale-[1.02] transition-transform"
                >
                  <Check className="w-4 h-4" />
                  <span>生成我的月見雷達</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
