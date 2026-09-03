-- ==============================================================================
-- LunaFlow (月見雷達) PostgreSQL 資料庫綱要與安全策略
-- 複製此 SQL 至 Supabase Dashboard -> SQL Editor 執行即可一鍵完成建置
-- ==============================================================================

-- 1. 使用者基本資料與偏好設定表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT DEFAULT '女孩',
  avatar_url TEXT,
  average_cycle_length INT DEFAULT 28,  -- 平均週期天數 (動態滑動計算)
  average_period_length INT DEFAULT 5,  -- 平均經期天數
  last_period_start DATE DEFAULT CURRENT_DATE,
  
  -- 女生自主隱私開關
  share_symptoms BOOLEAN DEFAULT FALSE, -- 是否允許伴侶看具體症狀
  share_mood BOOLEAN DEFAULT TRUE,      -- 是否允許伴侶看情緒傾向
  share_notes BOOLEAN DEFAULT FALSE,    -- 是否允許伴侶看備忘筆記
  
  -- 唯讀分享加密 Token (免登入快顯模式)
  public_share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  share_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 情侶雙向綁定關聯表 (正式帳號模式)
CREATE TABLE IF NOT EXISTS public.partner_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,     -- 女生 (資料主體)
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 男生 (守護者)
  pair_code VARCHAR(6),                                         -- 6 位數邀請配對碼
  status TEXT DEFAULT 'active',                                 -- 'pending', 'active', 'paused'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

-- 3. 經期與每日身心狀態紀錄 (時區安全 YYYY-MM-DD)
CREATE TABLE IF NOT EXISTS public.period_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,              -- 紀錄日期 (本地日期 YYYY-MM-DD)
  is_period_day BOOLEAN DEFAULT FALSE, -- 當天是否在經期內
  flow_level TEXT,                     -- 'spotting', 'light', 'medium', 'heavy'
  pain_level INT DEFAULT 0,            -- 0 到 5
  energy_level INT DEFAULT 3,          -- 體能與活力 (1 到 5)
  symptoms TEXT[] DEFAULT '{}',        -- ['胸部脹痛', '下腹悶痛', '腰痠', '水腫', '頭痛']
  moods TEXT[] DEFAULT '{}',           -- ['平靜', '敏感情緒化', '疲憊', '焦躁', '甜蜜想撒嬌']
  private_notes TEXT,                  -- 女生專屬私密筆記 (男生端自動過濾隱藏)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS 安全策略
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Partner Pairs
DROP POLICY IF EXISTS "Users can view their pair" ON public.partner_pairs;
CREATE POLICY "Users can view their pair" ON public.partner_pairs FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Users can create pair code" ON public.partner_pairs;
CREATE POLICY "Users can create pair code" ON public.partner_pairs FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() = partner_id);

-- Period Logs
DROP POLICY IF EXISTS "Users can manage own logs" ON public.period_logs;
CREATE POLICY "Users can manage own logs" ON public.period_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners can read logs if paired" ON public.period_logs;
CREATE POLICY "Partners can read logs if paired" ON public.period_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.partner_pairs
    WHERE partner_pairs.partner_id = auth.uid()
      AND partner_pairs.user_id = period_logs.user_id
      AND partner_pairs.status = 'active'
  )
);

-- 6. 建立以 SECURITY DEFINER 權限運行的訪客雷達 RPC 脫敏函式
CREATE OR REPLACE FUNCTION public.get_radar_by_token(share_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_rec RECORD;
  latest_log RECORD;
  result JSONB;
BEGIN
  -- 驗證 Token 是否有效且啟用了分享
  SELECT id, display_name, average_cycle_length, average_period_length, 
         last_period_start, share_mood, share_symptoms
  INTO profile_rec
  FROM public.profiles
  WHERE public_share_token = share_token AND share_enabled = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', '連結無效或分享已關閉');
  END IF;

  -- 獲取最新一筆紀錄（依據女生隱私授權開關過濾脫敏）
  SELECT log_date, is_period_day, pain_level, energy_level,
         CASE WHEN profile_rec.share_mood THEN moods ELSE ARRAY[]::TEXT[] END as safe_moods,
         CASE WHEN profile_rec.share_symptoms THEN symptoms ELSE ARRAY[]::TEXT[] END as safe_symptoms
  INTO latest_log
  FROM public.period_logs
  WHERE user_id = profile_rec.id
  ORDER BY log_date DESC
  LIMIT 1;

  -- 打包脫敏後的純淨雷達資料（不洩漏私密筆記與敏感血量數據）
  result := jsonb_build_object(
    'success', true,
    'partner_name', COALESCE(profile_rec.display_name, '你的女孩'),
    'average_cycle_length', profile_rec.average_cycle_length,
    'average_period_length', profile_rec.average_period_length,
    'last_period_start', profile_rec.last_period_start,
    'latest_status', to_jsonb(latest_log)
  );

  RETURN result;
END;
$$;

-- 授權匿名 (anon) 與已認證使用者執行 RPC
GRANT EXECUTE ON FUNCTION public.get_radar_by_token(TEXT) TO anon, authenticated;

-- 開啟 Supabase Realtime 監聽
ALTER PUBLICATION supabase_realtime ADD TABLE public.period_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
