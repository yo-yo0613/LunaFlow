import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose }) => {
  const { profile, cycleInfo } = useAuth();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // 分享網址 (唯讀 Token 網址或主站)
  const appBaseUrl = window.location.origin;
  const shareUrl = `${appBaseUrl}/#/radar/${profile.public_share_token || 'luna_demo_777888'}`;

  // 社群分享文案
  const shareText = `【LunaFlow 月見雷達】\n狀態：${cycleInfo.batteryLabel}\n階段：${cycleInfo.phaseName}\n今日守護指南：${cycleInfo.careGuide.actionTips[0] || '給她極致溫柔'}\n點擊即時查看守護雷達 👉`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLine = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleCopyDiscordCard = () => {
    const discordMarkdown = `**🌙 LunaFlow 月見雷達 — 今日守護暗號**\n> 👤 **守護對象**：${profile.display_name}\n> ⚡ **當前電量**：${cycleInfo.batteryLabel}\n> 🌸 **週期階段**：${cycleInfo.phaseName}\n> 🍵 **暖男行動**：${cycleInfo.careGuide.actionTips[0]}\n🔗 [點擊開啟月見雷達網頁](${shareUrl})`;
    navigator.clipboard.writeText(discordMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              分享月見雷達
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              支援 QR Code 掃描與 LINE、Discord、Twitter 豐富預覽卡片
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 mb-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="p-3 bg-white rounded-2xl shadow-md">
            <QRCodeSVG
              value={shareUrl}
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
          <p className="text-[11px] text-zinc-400 mt-2.5">
            伴侶手機打開相機掃描，免註冊即可一鍵加到主畫面
          </p>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {/* LINE Button */}
          <button
            onClick={handleShareLine}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#06c755]/10 hover:bg-[#06c755]/20 text-[#06c755] border border-[#06c755]/30 transition-colors"
          >
            <span className="font-extrabold text-sm mb-0.5">LINE</span>
            <span className="text-[10px]">一鍵發送</span>
          </button>

          {/* Discord Card Copy */}
          <button
            onClick={handleCopyDiscordCard}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 transition-colors"
          >
            <span className="font-extrabold text-sm mb-0.5">Discord</span>
            <span className="text-[10px]">複製嵌入卡片</span>
          </button>

          {/* Twitter / X Button */}
          <button
            onClick={handleShareTwitter}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 transition-colors"
          >
            <span className="font-extrabold text-sm mb-0.5">𝕏 (Twitter)</span>
            <span className="text-[10px]">發布推文</span>
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="flex items-center space-x-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-zinc-600 dark:text-zinc-300 px-2 focus:outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-semibold flex items-center space-x-1 hover:bg-pink-600 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已複製' : '複製網址'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
