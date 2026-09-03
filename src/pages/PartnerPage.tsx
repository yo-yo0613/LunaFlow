import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Users, 
  Shield, 
  QrCode, 
  Copy, 
  Check, 
  Heart, 
  ExternalLink,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PartnerPage: React.FC = () => {
  const { profile, updateProfile, isPartnerMode, setIsPartnerMode } = useAuth();
  
  const [pairCodeInput, setPairCodeInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [bindStatus, setBindStatus] = useState<string | null>(null);

  const appBaseUrl = window.location.origin;
  const shareToken = profile.public_share_token || 'luna_demo_777888';
  const publicShareUrl = `${appBaseUrl}/#/radar/${shareToken}`;

  // 6 位數配對碼 (由 Token 衍生或固定)
  const myPairCode = shareToken.slice(0, 6).toUpperCase();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myPairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBindPartner = () => {
    if (!pairCodeInput || pairCodeInput.length < 4) {
      alert('請輸入有效的 6 位數邀請碼');
      return;
    }
    setBindStatus('正在連動中...');
    setTimeout(() => {
      setBindStatus('✅ 已成功與伴侶綁定守護關係！');
    }, 1000);
  };

  const handleRegenerateToken = async () => {
    const newToken = 'luna_' + Math.random().toString(36).substring(2, 10);
    await updateProfile({ public_share_token: newToken });
    alert('已成功重新生成專屬 Token！舊連結已全數失效。');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-pink-500" />
            <span>月見伴侶守護與連動</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            雙軌連動模式：正式帳號 6 位碼配對 ＋ 免登入專屬 Token 唯讀雷達
          </p>
        </div>

        <button
          onClick={() => setIsPartnerMode(!isPartnerMode)}
          className="px-4 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60 text-xs font-semibold hover:bg-pink-100 flex items-center space-x-2 transition-colors self-start"
        >
          <Heart className="w-4 h-4 fill-current text-pink-500" />
          <span>目前視角：{isPartnerMode ? '🛡️ 守護者 (男生)' : '🌸 女孩個人'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: 免登入快顯模式 (方案 B) */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    免登入唯讀專屬雷達 (方案 B)
                  </h3>
                  <p className="text-[11px] text-pink-500 font-medium">
                    男友打開相機掃描，免註冊直接加入主畫面
                  </p>
                </div>
              </div>

              <button
                onClick={handleRegenerateToken}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="重新生成 Token (撤銷舊連結)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-5">
              <div className="p-3 bg-white rounded-2xl shadow-md">
                <QRCodeSVG
                  value={publicShareUrl}
                  size={160}
                  level="M"
                  includeMargin={false}
                  imageSettings={{
                    src: '/logo.svg',
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-3">
                掃描打開 {profile.display_name} 的專屬守護雷達
              </p>
            </div>

            {/* Public Link Box */}
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4">
              <input
                type="text"
                readOnly
                value={publicShareUrl}
                className="flex-1 bg-transparent text-xs text-zinc-600 dark:text-zinc-300 px-2 focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-semibold flex items-center space-x-1 hover:bg-pink-600 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '已複製' : '複製'}</span>
              </button>
            </div>
          </div>

          <a
            href={publicShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
            <span>以訪客身份直接預覽唯讀雷達網頁</span>
          </a>
        </div>

        {/* Module 2: 女生自主隱私防護罩 (問題四方案 B) + 正式帳號綁定 */}
        <div className="space-y-6">
          
          {/* Privacy Controls Dashboard */}
          <div className="glass-card rounded-3xl p-6 sm:p-7">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  雙層隱私授權儀表板
                </h3>
                <p className="text-[11px] text-zinc-400">
                  女生自主決定哪些資訊可被伴侶端雷達看見
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Toggle Mood */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    同步心情傾向
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    允許伴侶看見「甜蜜、疲憊、焦躁」等大方向心情
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateProfile({ share_mood: !profile.share_mood })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    profile.share_mood ? 'bg-pink-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      profile.share_mood ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle Symptoms */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    同步身體感受訊號
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    例如「下腹悶痛、腰痠」等（經血流量與細節一律強制遮蔽）
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateProfile({ share_symptoms: !profile.share_symptoms })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    profile.share_symptoms ? 'bg-pink-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      profile.share_symptoms ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle Public Share Enable */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    開啟守護雷達總開關
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    關閉後，所有伴侶 Token 連結將立即失效
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateProfile({ share_enabled: !profile.share_enabled })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                    profile.share_enabled ? 'bg-pink-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      profile.share_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Module 3: 正式帳號 6 位配對碼 (方案 A) */}
          <div className="glass-card rounded-3xl p-6 sm:p-7">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  6 位數邀請碼雙向綁定 (方案 A)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  適合雙方皆有登入帳號，走 PostgreSQL RLS 嚴密權限
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">我的專屬邀請碼</span>
                <p className="text-xl font-extrabold tracking-widest text-pink-500">
                  {myPairCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-pink-300"
              >
                {copiedCode ? '已複製' : '複製配對碼'}
              </button>
            </div>

            {/* Input Partner's Code */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                輸入伴侶提供的 6 位數邀請碼：
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={8}
                  value={pairCodeInput}
                  onChange={(e) => setPairCodeInput(e.target.value.toUpperCase())}
                  placeholder="例如：7A9F32"
                  className="flex-1 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs tracking-wider uppercase focus:outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={handleBindPartner}
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-semibold text-xs shadow-sm hover:bg-pink-600 transition-colors"
                >
                  確認配對
                </button>
              </div>
              {bindStatus && (
                <p className="text-xs text-emerald-500 font-medium pt-1">{bindStatus}</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
