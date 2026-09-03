import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, BatteryCharging, Lock, PenLine, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toLocalYYYYMMDD, formatDisplayDate } from '../../lib/dateUtils';
import { FlowLevel } from '../../types';

export const QuickLogCard: React.FC = () => {
  const { todayLog, saveLog, isPartnerMode } = useAuth();
  const todayStr = toLocalYYYYMMDD();

  const [isPeriodDay, setIsPeriodDay] = useState<boolean>(todayLog?.is_period_day || false);
  const [flowLevel, setFlowLevel] = useState<FlowLevel | undefined>(todayLog?.flow_level);
  const [painLevel, setPainLevel] = useState<number>(todayLog?.pain_level || 0);
  const [energyLevel, setEnergyLevel] = useState<number>(todayLog?.energy_level || 3);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(todayLog?.moods || []);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(todayLog?.symptoms || []);
  const [privateNotes, setPrivateNotes] = useState<string>(todayLog?.private_notes || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (todayLog) {
      setIsPeriodDay(todayLog.is_period_day);
      setFlowLevel(todayLog.flow_level);
      setPainLevel(todayLog.pain_level);
      setEnergyLevel(todayLog.energy_level);
      setSelectedMoods(todayLog.moods || []);
      setSelectedSymptoms(todayLog.symptoms || []);
      setPrivateNotes(todayLog.private_notes || '');
    }
  }, [todayLog]);

  const moodsList = ['平靜', '敏感情緒化', '疲憊', '焦躁', '甜蜜想撒嬌', '元氣滿滿'];
  const symptomsList = ['下腹悶痛', '胸部脹痛', '腰痠', '水腫', '頭痛', '想吃甜食', '手腳冰冷'];

  const toggleMood = (m: string) => {
    setSelectedMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    await saveLog({
      log_date: todayStr,
      is_period_day: isPeriodDay,
      flow_level: flowLevel,
      pain_level: painLevel,
      energy_level: energyLevel,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      private_notes: privateNotes,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // 守護者視角下顯示精簡唯讀面板
  if (isPartnerMode) {
    return (
      <div className="glass-card bento-hover rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>今日狀態快顯 (去敏轉譯)</span>
            </h3>
            <span className="text-[11px] text-zinc-400">{formatDisplayDate(todayStr)}</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-400 mb-1">今日體能活力</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                    style={{ width: `${(energyLevel / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-pink-500">{energyLevel} / 5</span>
              </div>
            </div>

            {selectedMoods.length > 0 && (
              <div>
                <p className="text-[11px] text-zinc-400 mb-1.5">心情傾向</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMoods.map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-lg text-xs bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedSymptoms.length > 0 && (
              <div>
                <p className="text-[11px] text-zinc-400 mb-1.5">身體感受訊號</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 text-[11px] text-pink-500 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>私密日記與血量細節已由雙層隱私防護罩自動遮蔽保護</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card bento-hover rounded-3xl p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                今日身心打卡
              </h3>
              <p className="text-[11px] text-zinc-400">
                {formatDisplayDate(todayStr)}
              </p>
            </div>
          </div>

          {/* Period Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPeriodDay(!isPeriodDay)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isPeriodDay
                ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-pink-300'
            }`}
          >
            {isPeriodDay ? '🔴 經期進行中' : '⚪ 非經期'}
          </button>
        </div>

        {/* Flow & Pain Level if Period */}
        {isPeriodDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-2.5"
          >
            <div>
              <label className="block text-[11px] font-semibold text-rose-500 mb-1">
                經血量流量
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'spotting', label: '點狀' },
                  { id: 'light', label: '少量' },
                  { id: 'medium', label: '標準' },
                  { id: 'heavy', label: '量多' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFlowLevel(f.id as FlowLevel)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                      flowLevel === f.id
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-semibold text-rose-500 mb-1">
                <span>腹部悶痛度</span>
                <span>{painLevel} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </motion.div>
        )}

        {/* Energy Level Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            <span className="flex items-center space-x-1">
              <BatteryCharging className="w-3.5 h-3.5 text-pink-500" />
              <span>今日體力與元氣</span>
            </span>
            <span className="text-pink-500 font-bold">{energyLevel} / 5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        {/* Mood Chips */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            心情狀態
          </label>
          <div className="flex flex-wrap gap-1.5">
            {moodsList.map((m) => {
              const active = selectedMoods.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMood(m)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms Chips */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            身體感受
          </label>
          <div className="flex flex-wrap gap-1.5">
            {symptomsList.map((s) => {
              const active = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-rose-400 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Private Notes */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-pink-500" />
            <span>私密日記 (男生端完全遮蔽)</span>
          </label>
          <textarea
            rows={2}
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            placeholder="記錄今天的心情、飲食或小秘密..."
            className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all duration-300 ${
          savedSuccess
            ? 'bg-emerald-500 text-white'
            : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/25 hover:opacity-95'
        }`}
      >
        {savedSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>已精準記錄到身心日曆！</span>
          </>
        ) : (
          <span>儲存今日打卡</span>
        )}
      </button>

    </div>
  );
};
