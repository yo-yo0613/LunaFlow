import { createClient } from '@supabase/supabase-js';
import { UserProfile, PeriodLog, GuestRadarData } from '../types';
import { toLocalYYYYMMDD, addDaysLocal } from './dateUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwblrxiainfkvftzwcvg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmxyeGlhaW5ma3ZmdHp3Y3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Nzk3MTQsImV4cCI6MjA5NTQ1NTcxNH0._v1yKCprS-Gd7Pr3SFJPoIul7rEuhLVcO_VIyhZ-I60';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==============================================================================
// 本機備用快取與離線資料同步模組 (Local Storage Fallback & Mock Store)
// 確保即時響應、離線可用，並平滑整合 Supabase 雲端
// ==============================================================================

const STORAGE_KEYS = {
  PROFILE: 'lunaflow_profile_v2',
  LOGS: 'lunaflow_logs_v2',
  THEME: 'lunaflow_theme',
};

// 預設 Demo 資料 (剛進入即有完美數據，杜絕冷啟動空白)
export const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user-001',
  display_name: '我的女孩',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  average_cycle_length: 28,
  average_period_length: 5,
  last_period_start: addDaysLocal(toLocalYYYYMMDD(), -7), // 預設 7 天前開始經期 (目前處於活力濾泡期)
  share_symptoms: true,
  share_mood: true,
  share_notes: false,
  public_share_token: 'luna_demo_777888',
  share_enabled: true,
};

export const DEFAULT_LOGS: PeriodLog[] = [
  {
    user_id: 'demo-user-001',
    log_date: addDaysLocal(toLocalYYYYMMDD(), -7),
    is_period_day: true,
    flow_level: 'medium',
    pain_level: 3,
    energy_level: 2,
    symptoms: ['下腹悶痛', '腰痠'],
    moods: ['疲憊', '敏感情緒化'],
    private_notes: '今天第一天，肚子有點脹，喝了熱黑糖水'
  },
  {
    user_id: 'demo-user-001',
    log_date: addDaysLocal(toLocalYYYYMMDD(), -6),
    is_period_day: true,
    flow_level: 'heavy',
    pain_level: 4,
    energy_level: 1,
    symptoms: ['下腹悶痛', '頭痛'],
    moods: ['疲憊'],
    private_notes: '痛感比較明顯，放了暖暖包'
  },
  {
    user_id: 'demo-user-001',
    log_date: addDaysLocal(toLocalYYYYMMDD(), -5),
    is_period_day: true,
    flow_level: 'medium',
    pain_level: 2,
    energy_level: 2,
    symptoms: ['腰痠'],
    moods: ['平靜'],
  },
  {
    user_id: 'demo-user-001',
    log_date: addDaysLocal(toLocalYYYYMMDD(), -4),
    is_period_day: true,
    flow_level: 'light',
    pain_level: 1,
    energy_level: 3,
    symptoms: [],
    moods: ['平靜'],
  },
  {
    user_id: 'demo-user-001',
    log_date: addDaysLocal(toLocalYYYYMMDD(), -3),
    is_period_day: true,
    flow_level: 'spotting',
    pain_level: 0,
    energy_level: 4,
    symptoms: [],
    moods: ['平靜', '甜蜜想撒嬌'],
  },
  {
    user_id: 'demo-user-001',
    log_date: toLocalYYYYMMDD(),
    is_period_day: false,
    pain_level: 0,
    energy_level: 5,
    symptoms: [],
    moods: ['平靜', '甜蜜想撒嬌'],
    private_notes: '今天精神非常好！'
  }
];

// 本地存取輔助
export function getLocalProfile(): UserProfile {
  const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // parse error
    }
  }
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  return DEFAULT_PROFILE;
}

export function saveLocalProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getLocalLogs(): PeriodLog[] {
  const cached = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // parse error
    }
  }
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
  return DEFAULT_LOGS;
}

export function saveLocalLogs(logs: PeriodLog[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

// ==============================================================================
// 訪客免登入雷達查詢服務 (支援 Supabase RPC 與 本地快顯雙軌)
// ==============================================================================

export async function fetchGuestRadar(token: string): Promise<GuestRadarData> {
  // 1. 嘗試從 Supabase RPC 調用
  try {
    const { data, error } = await supabase.rpc('get_radar_by_token', {
      share_token: token,
    });

    if (!error && data && data.success) {
      return data as GuestRadarData;
    }
  } catch (err) {
    console.warn('RPC 調用未配置或失敗，切換至安全快照模式:', err);
  }

  // 2. 本地/Demo Token 模擬解析 (讓體驗即開即用)
  const profile = getLocalProfile();
  if (profile.public_share_token === token || token === 'demo' || token === 'luna_demo_777888') {
    const logs = getLocalLogs();
    const today = toLocalYYYYMMDD();
    const latestLog = logs.find(l => l.log_date === today) || logs[logs.length - 1];

    return {
      success: true,
      partner_name: profile.display_name,
      average_cycle_length: profile.average_cycle_length,
      average_period_length: profile.average_period_length,
      last_period_start: profile.last_period_start,
      latest_status: latestLog ? {
        log_date: latestLog.log_date,
        is_period_day: latestLog.is_period_day,
        pain_level: latestLog.pain_level,
        energy_level: latestLog.energy_level,
        safe_moods: profile.share_mood ? latestLog.moods : [],
        safe_symptoms: profile.share_symptoms ? latestLog.symptoms : [],
      } : undefined
    };
  }

  return {
    success: false,
    message: '找不到此雷達暗號或分享已停用',
    partner_name: '未知用戶',
    average_cycle_length: 28,
    average_period_length: 5,
    last_period_start: toLocalYYYYMMDD(),
  };
}
