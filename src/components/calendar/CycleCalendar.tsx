import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toLocalYYYYMMDD, formatDisplayDate } from '../../lib/dateUtils';
import { calculateCyclePhase } from '../../lib/cycleCalculator';
import { FlowLevel } from '../../types';

export const CycleCalendar: React.FC = () => {
  const { profile, logs, saveLog, isPartnerMode } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(toLocalYYYYMMDD());
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 當前月曆的年、月
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // 計算該月第一天是星期幾，以及該月總天數
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0(日) ~ 6(六)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // 上個月切換
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 下個月切換
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 取得選取日期的 Log
  const selectedLog = logs.find((l) => l.log_date === selectedDateStr);
  const selectedPhase = calculateCyclePhase(
    profile.last_period_start,
    profile.average_cycle_length,
    profile.average_period_length,
    selectedDateStr
  );

  // 編輯表單狀態
  const [editIsPeriod, setEditIsPeriod] = useState<boolean>(false);
  const [editFlow, setEditFlow] = useState<FlowLevel | undefined>(undefined);
  const [editPain, setEditPain] = useState<number>(0);
  const [editEnergy, setEditEnergy] = useState<number>(3);
  const [editMoods, setEditMoods] = useState<string[]>([]);
  const [editSymptoms, setEditSymptoms] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');

  const openEditorForDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const existing = logs.find((l) => l.log_date === dateStr);
    if (existing) {
      setEditIsPeriod(existing.is_period_day);
      setEditFlow(existing.flow_level);
      setEditPain(existing.pain_level);
      setEditEnergy(existing.energy_level);
      setEditMoods(existing.moods || []);
      setEditSymptoms(existing.symptoms || []);
      setEditNotes(existing.private_notes || '');
    } else {
      setEditIsPeriod(false);
      setEditFlow(undefined);
      setEditPain(0);
      setEditEnergy(3);
      setEditMoods([]);
      setEditSymptoms([]);
      setEditNotes('');
    }
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    await saveLog({
      log_date: selectedDateStr,
      is_period_day: editIsPeriod,
      flow_level: editFlow,
      pain_level: editPain,
      energy_level: editEnergy,
      moods: editMoods,
      symptoms: editSymptoms,
      private_notes: editNotes,
    });
    setIsEditing(false);
  };

  const moodsList = ['平靜', '敏感情緒化', '疲憊', '焦躁', '甜蜜想撒嬌', '元氣滿滿'];
  const symptomsList = ['下腹悶痛', '胸部脹痛', '腰痠', '水腫', '頭痛', '想吃甜食'];

  return (
    <div className="space-y-6">
      
      {/* Calendar Bento Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {year} 年 {month + 1} 月
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                點擊任何日期檢視身心節奏或新增打卡
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors"
            >
              返回今天
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
            <div
              key={day}
              className={`text-xs font-bold py-1 ${
                i === 0 || i === 6 ? 'text-pink-500' : 'text-zinc-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for preceding month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-20 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/20 opacity-30" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === toLocalYYYYMMDD();
            const isSelected = dateStr === selectedDateStr;
            const dayLog = logs.find((l) => l.log_date === dateStr);
            const dayPhase = calculateCyclePhase(
              profile.last_period_start,
              profile.average_cycle_length,
              profile.average_period_length,
              dateStr
            );

            // 階段背景光暈標記
            let phaseBg = '';
            if (dayLog?.is_period_day || dayPhase.phase === 'recharge') {
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
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  if (!isPartnerMode) openEditorForDate(dateStr);
                }}
                className={`h-14 sm:h-20 p-1.5 sm:p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${phaseBg} ${
                  isSelected ? 'ring-2 ring-pink-500 shadow-md' : ''
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayLog?.is_period_day && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="經期打卡" />
                  )}
                </div>

                {/* Day Phase Mini Tag */}
                <div className="hidden sm:flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="truncate">
                    {dayLog?.is_period_day ? '🔴 經期' : dayPhase.phaseName.split(' ')[1]}
                  </span>
                  {dayLog && dayLog.energy_level && (
                    <span className="text-pink-500 font-bold">⚡{dayLog.energy_level}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500" />
            <span>Recharge 舒緩期</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-400/30 border border-pink-400" />
            <span>Peak 活力濾泡期</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-600/30 border border-pink-600" />
            <span>Golden Window 排卵期</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <span>Vulnerable 經前期</span>
          </div>
        </div>

      </div>

      {/* Selected Date Detail Drawer */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {formatDisplayDate(selectedDateStr)} 狀態總覽
            </h3>
            <p className="text-xs text-pink-500 font-medium">
              {selectedPhase.phaseName} · {selectedPhase.batteryLabel}
            </p>
          </div>

          {!isPartnerMode && (
            <button
              onClick={() => openEditorForDate(selectedDateStr)}
              className="px-4 py-2 rounded-xl bg-pink-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm hover:bg-pink-600"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{selectedLog ? '修改當日打卡' : '新增當日打卡'}</span>
            </button>
          )}
        </div>

        {selectedLog ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-1">經期與活力</span>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {selectedLog.is_period_day ? `🔴 經期進行中 (${selectedLog.flow_level || '標準'})` : '⚪ 非經期'}
              </p>
              <p className="text-xs text-pink-500 mt-1">體能電量：{selectedLog.energy_level || 3} / 5</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-1">心情與身體感受</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(selectedLog.moods || []).map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded-lg text-xs bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300">
                    {m}
                  </span>
                ))}
                {(selectedLog.symptoms || []).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-lg text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                    {s}
                  </span>
                ))}
                {(!selectedLog.moods?.length && !selectedLog.symptoms?.length) && (
                  <span className="text-xs text-zinc-400">無特殊症狀</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-400 block mb-1">備註筆記</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                {selectedLog.private_notes || '無筆記記錄'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            當天尚未有打卡記錄，可點擊上方按鈕記錄。
          </div>
        )}
      </div>

      {/* Interactive Date Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  記錄 {formatDisplayDate(selectedDateStr)}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Is Period Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">當天是否在生理期內？</span>
                <button
                  type="button"
                  onClick={() => setEditIsPeriod(!editIsPeriod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    editIsPeriod ? 'bg-rose-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {editIsPeriod ? '🔴 經期中' : '⚪ 否'}
                </button>
              </div>

              {/* Flow Level */}
              {editIsPeriod && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    經血量
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['spotting', 'light', 'medium', 'heavy'] as FlowLevel[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setEditFlow(f)}
                        className={`py-1.5 rounded-lg text-xs font-medium ${
                          editFlow === f ? 'bg-rose-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {f === 'spotting' ? '點狀' : f === 'light' ? '少量' : f === 'medium' ? '標準' : '量多'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Energy Level */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>體能元氣</span>
                  <span className="text-pink-500">{editEnergy} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editEnergy}
                  onChange={(e) => setEditEnergy(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              {/* Moods */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  心情
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {moodsList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                      className={`px-2.5 py-1 rounded-xl text-xs ${
                        editMoods.includes(m) ? 'bg-pink-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  身體感受
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {symptomsList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className={`px-2.5 py-1 rounded-xl text-xs ${
                        editSymptoms.includes(s) ? 'bg-rose-400 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  私密筆記
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="隨心記錄..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold text-xs shadow-md shadow-pink-500/25 hover:bg-pink-600"
                >
                  確認儲存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
