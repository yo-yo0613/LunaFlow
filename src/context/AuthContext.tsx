import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, PeriodLog, CyclePhaseInfo } from '../types';
import { supabase, getLocalProfile, saveLocalProfile, getLocalLogs, saveLocalLogs, DEFAULT_PROFILE, DEFAULT_LOGS } from '../lib/supabase';
import { calculateCyclePhase } from '../lib/cycleCalculator';
import { toLocalYYYYMMDD } from '../lib/dateUtils';

interface AuthContextType {
  user: any | null;
  profile: UserProfile;
  logs: PeriodLog[];
  todayLog: PeriodLog | null;
  cycleInfo: CyclePhaseInfo;
  isPartnerMode: boolean;
  setIsPartnerMode: (val: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveLog: (log: Partial<PeriodLog> & { log_date: string }) => Promise<void>;
  loading: boolean;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  resetToDemo: () => void;
  // 完整的 Supabase 登入 / 註冊 / 登出功能
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getLocalProfile);
  const [logs, setLogs] = useState<PeriodLog[]>(getLocalLogs);
  const [isPartnerMode, setIsPartnerMode] = useState<boolean>(() => {
    return localStorage.getItem('lunaflow_view_mode') === 'partner';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('lunaflow_onboarded') === 'true';
  });

  // 計算當前生理期狀態雷達
  const cycleInfo = calculateCyclePhase(
    profile.last_period_start,
    profile.average_cycle_length,
    profile.average_period_length,
    toLocalYYYYMMDD()
  );

  // 今天打卡紀錄
  const todayStr = toLocalYYYYMMDD();
  const todayLog = logs.find((l) => l.log_date === todayStr) || null;

  // 切換模式保存
  useEffect(() => {
    localStorage.setItem('lunaflow_view_mode', isPartnerMode ? 'partner' : 'girl');
  }, [isPartnerMode]);

  // 從 Supabase 載入特定使用者的資料庫紀錄
  const loadUserDataFromSupabase = async (userId: string) => {
    try {
      const { data: remoteProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (remoteProfile) {
        setProfile(remoteProfile);
        saveLocalProfile(remoteProfile);
      } else {
        // 若 profiles 尚未有紀錄，自動為該用戶初始化一筆
        const initial = { ...getLocalProfile(), id: userId };
        await supabase.from('profiles').insert([initial]);
      }

      const { data: remoteLogs } = await supabase
        .from('period_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false });

      if (remoteLogs && remoteLogs.length > 0) {
        setLogs(remoteLogs);
        saveLocalLogs(remoteLogs);
      }
    } catch (err) {
      console.warn('載入 Supabase 使用者資料失敗，使用本機快取:', err);
    }
  };

  // 載入 Supabase 帳號或同步本地狀態
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) setUser(session.user);
          await loadUserDataFromSupabase(session.user.id);
        }
      } catch (err) {
        console.warn('Supabase 連線初始化跳轉至本機模式:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // 監聽 Supabase Auth 狀態變更
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserDataFromSupabase(session.user.id);
      } else {
        setUser(null);
      }
    });

    // 監聽 Supabase Realtime 即時通道
    const channel = supabase
      .channel('period-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'period_logs' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newLog = payload.new as PeriodLog;
            setLogs((prev) => {
              const filtered = prev.filter((l) => l.log_date !== newLog.log_date);
              const updated = [newLog, ...filtered];
              saveLocalLogs(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // 登入方法
  const signIn = async (email: string, password?: string) => {
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await loadUserDataFromSupabase(data.user.id);
        }
        return { success: true };
      } else {
        // Magic Link 免密碼登入
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || '登入失敗' };
    }
  };

  // 註冊方法
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || '我的女孩',
          }
        }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        const newProf = {
          ...profile,
          id: data.user.id,
          display_name: displayName || profile.display_name,
        };
        await supabase.from('profiles').upsert([newProf]);
        setProfile(newProf);
        saveLocalProfile(newProf);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || '註冊失敗' };
    }
  };

  // 登出方法
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    setLogs(DEFAULT_LOGS);
    saveLocalProfile(DEFAULT_PROFILE);
    saveLocalLogs(DEFAULT_LOGS);
  };

  // 更新個人資料
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveLocalProfile(newProfile);

    if (user) {
      try {
        await supabase.from('profiles').upsert({
          ...newProfile,
          id: user.id,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('更新 profiles 雲端失敗:', err);
      }
    }
  };

  // 儲存/打卡經期與狀態
  const saveLog = async (logData: Partial<PeriodLog> & { log_date: string }) => {
    const existingIndex = logs.findIndex((l) => l.log_date === logData.log_date);
    let updatedLogs: PeriodLog[];

    const baseLog: PeriodLog = {
      user_id: user?.id || profile.id,
      log_date: logData.log_date,
      is_period_day: false,
      pain_level: 0,
      energy_level: 3,
      symptoms: [],
      moods: [],
      private_notes: '',
    };

    const existingLog = existingIndex >= 0 ? logs[existingIndex] : baseLog;

    const completeLog: PeriodLog = {
      ...existingLog,
      ...logData,
      user_id: user?.id || profile.id,
      log_date: logData.log_date,
    };

    if (existingIndex >= 0) {
      updatedLogs = [...logs];
      updatedLogs[existingIndex] = completeLog;
    } else {
      updatedLogs = [completeLog, ...logs];
    }

    setLogs(updatedLogs);
    saveLocalLogs(updatedLogs);

    // 若設定當天為經期第一天且有變動，自動更新 last_period_start
    if (logData.is_period_day && logData.log_date > profile.last_period_start) {
      await updateProfile({ last_period_start: logData.log_date });
    }

    if (user) {
      try {
        await supabase.from('period_logs').upsert({
          ...completeLog,
          user_id: user.id,
        }, { onConflict: 'user_id,log_date' });
      } catch (err) {
        console.error('寫入雲端經期日誌失敗:', err);
      }
    }
  };

  const resetToDemo = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        logs,
        todayLog,
        cycleInfo,
        isPartnerMode,
        setIsPartnerMode,
        updateProfile,
        saveLog,
        loading,
        isOnboarded,
        setIsOnboarded,
        resetToDemo,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
