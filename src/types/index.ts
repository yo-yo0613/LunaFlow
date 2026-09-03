export type PhaseType = 'recharge' | 'peak_energy' | 'golden_window' | 'vulnerable';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  average_cycle_length: number;  // 通常 24 ~ 35 天
  average_period_length: number; // 通常 3 ~ 7 天
  last_period_start: string;     // YYYY-MM-DD
  share_symptoms: boolean;
  share_mood: boolean;
  share_notes: boolean;
  public_share_token: string;
  share_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy';

export interface PeriodLog {
  id?: string;
  user_id: string;
  log_date: string;              // YYYY-MM-DD (本地日期)
  is_period_day: boolean;
  flow_level?: FlowLevel;
  pain_level: number;            // 0 ~ 5
  energy_level: number;          // 1 ~ 5 (電量/活力)
  symptoms: string[];
  moods: string[];
  private_notes?: string;
  created_at?: string;
}

export interface PartnerPair {
  id: string;
  user_id: string;
  partner_id: string;
  pair_code?: string;
  status: 'pending' | 'active' | 'paused';
  created_at?: string;
}

export interface CyclePhaseInfo {
  phase: PhaseType;
  phaseName: string;
  phaseSubtitle: string;
  cycleDay: number;              // 週期第幾天 (Day X)
  daysUntilNextPeriod: number;   // 距離下次經期還有幾天
  batteryPercent: number;        // 電量百分比 (15% ~ 100%)
  batteryLabel: string;          // 例如 "電量 15% · 深度修復模式"
  themeColor: string;            // 色碼
  iconName: string;
  // 暖男行動暗號與避坑指南
  careGuide: {
    badge: string;
    summary: string;
    actionTips: string[];        // 推薦做的事 (去冰、暖暖包、溫柔抱抱)
    pitfallTips: string[];       // 絕對避坑指南 (切勿講理、不要惹她)
    foodRecommendations: string[]; // 推薦飲食 (黑糖薑茶、熱紅豆湯、高蛋白)
  };
}

export interface GuestRadarData {
  success: boolean;
  message?: string;
  partner_name: string;
  average_cycle_length: number;
  average_period_length: number;
  last_period_start: string;
  latest_status?: {
    log_date: string;
    is_period_day: boolean;
    pain_level: number;
    energy_level: number;
    safe_moods: string[];
    safe_symptoms: string[];
  };
}

export type ThemeMode = 'light' | 'dark';
