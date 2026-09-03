# 🌙 LunaFlow (月見雷達) — 懂她的身心節奏，做最溫暖的守護者

> **定位**：頂級工程師 ✕ 暖男思維的極致結合。極簡黑白粉美學、醫學級黃體期逆推演算法、雙向隱私防護、免登入專屬雷達、時區防偏移。

---

## ✨ 核心特色

1. **醫學黃體期逆推演算法 (Medical Backward Calculation)**
   * 錨定排卵日（下次經期前 14 天），精準切分四大週期：
     * 🌸 **Recharge (舒緩修復期)**：電量 15% · 深度修復模式（溫熱去冰、暖宮陪伴）
     * ⚡ **Peak Energy (活力濾泡期)**：電量 90% · 活力滿格模式（思緒清晰、最佳約會）
     * 🌕 **Golden Window (排卵黃金期)**：電量 100% · 心動浪漫高頻期（體溫微升、安全防護提醒）
     * 🌙 **Vulnerable / PMS (經前敏感期)**：電量 40% · 高敏易碎模式（甜食投餵、情緒包容、切忌講理）

2. **雙軌伴侶守護模式**
   * **方案 A (正式帳號綁定)**：6 位數邀請碼配對，基於 PostgreSQL RLS 嚴密權限隔離。
   * **方案 B (免登入唯讀快顯)**：生成專屬 Token 網址與動態 QR Code，男生直接掃描即可加入手機桌面。
   * **PostgreSQL RPC 安全脫敏 (`get_radar_by_token`)**：以 `SECURITY DEFINER` 權限運行，自動過濾女生私密日記與血量細節，智慧轉譯為「暖男行動暗號」。

3. **🌓 Light Mode & Dark Mode 極簡黑白粉美學**
   * 支援深邃黑粉（Dark）與純淨白粉（Light）即時流暢切換。
   * 桌機專屬毛玻璃 **Navbar** ＋ **Bento-Grid (便當盒排版)**。
   * 手機端原生 **Apple iOS Tab Bar** ＋ 靈動島狀態提示。

4. **⏰ 時區安全設計 (`toLocalYYYYMMDD`)**
   * 徹底杜絕 UTC 轉換導致亞洲/台灣時區 (+08:00) 晚間打卡往前跳一天的痛點。

5. **📱 PWA 漸進式網頁應用 ＋ 社交豐富預覽 (OpenGraph)**
   * 支援 iOS (Safari) 與 Android (Chrome) 加入主畫面圖文引導教學。
   * 支援 Discord、LINE、Twitter (𝕏) 豐富預覽卡片與「💌 敲一下守護者」一鍵 LINE 暗號發送。

---

## 🚀 快速啟動 (Local Development)

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 建置生產環境代碼
npm run build
```

---

## 🗄️ Supabase 資料庫配置

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 前往 **SQL Editor** ➔ 建立新查詢。
3. 複製並貼上專案中的 `supabase/schema.sql` 內容並點擊 **Run**。
4. 一鍵完成：
   * `profiles` 表（使用者偏好與隱私授權設定）
   * `partner_pairs` 表（情侶配對關聯）
   * `period_logs` 表（每日打卡日誌）
   * `get_radar_by_token` RPC 脫敏函式
   * Row Level Security (RLS) 策略與 Realtime 即時連線發布。

---

## 🌐 部署至 GitHub 與 Vercel

1. **推送到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "feat: initial LunaFlow v2.2 commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lunaflow.git
   git push -u origin main
   ```

2. **在 Vercel 建立專案**：
   * 在 [Vercel](https://vercel.com) 匯入該 GitHub Repo。
   * Framework Preset 選擇 **Vite**。
   * 在 **Environment Variables** 新增：
     * `VITE_SUPABASE_URL` = 你的 Supabase URL
     * `VITE_SUPABASE_ANON_KEY` = 你的 Supabase Anon Key
   * 點擊 **Deploy** 即刻上線！
