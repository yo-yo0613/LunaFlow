import React from 'react';
import { Heart, MessageSquare, QrCode, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CyclePhaseInfo } from '../../types';

interface PartnerPokeCardProps {
  cycleInfo: CyclePhaseInfo;
  onOpenShare: () => void;
}

export const PartnerPokeCard: React.FC<PartnerPokeCardProps> = ({ cycleInfo, onOpenShare }) => {
  const { profile } = useAuth();

  const handlePokePartner = () => {
    const appBaseUrl = window.location.origin;
    const shareUrl = `${appBaseUrl}/#/radar/${profile.public_share_token || 'luna_demo_777888'}`;
    const message = `🌙 月見雷達悄悄話：你的女孩今日電量已更新（${cycleInfo.batteryLabel}）！快打開月見雷達查看今日暖男守護指南吧 👉 ${shareUrl}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
  };

  return (
    <div className="glass-card bento-hover rounded-3xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                月見伴侶守護連動
              </h3>
              <p className="text-[11px] text-zinc-400">
                心照不宣・免開口的默契
              </p>
            </div>
          </div>

          <button
            onClick={onOpenShare}
            className="p-2 rounded-xl text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="查看專屬 QR Code 與分享設定"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
          打卡後點擊下方按鈕，系統會自動發送轉譯後的「暖心行動暗號」給男友或伴侶，不尷尬、不直白，只有滿滿的偏愛。
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handlePokePartner}
          className="w-full py-2.5 px-4 rounded-xl bg-[#06c755] hover:bg-[#05b34c] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-[#06c755]/20 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>💌 敲一下守護者 (LINE 悄悄話)</span>
        </button>

        <button
          type="button"
          onClick={onOpenShare}
          className="w-full py-2 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center space-x-1.5"
        >
          <Shield className="w-3.5 h-3.5 text-pink-500" />
          <span>管理隱私授權與專屬 Token 網址</span>
        </button>
      </div>
    </div>
  );
};
