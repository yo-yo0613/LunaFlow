import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Share, PlusSquare, Download } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    // 偵測 iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) setActiveTab('ios');
    else setActiveTab('android');

    // 監聽 Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setActiveTab('android');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      alert('請點擊瀏覽器右上角選單 (⋮)，選擇「安裝應用程式」或「加到主畫面」');
    }
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
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              安裝為原生手機 App
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              免下載 App Store，享受全螢幕秒開無網址列體驗
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            🍎 iPhone (Safari)
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            🤖 Android (Chrome)
          </button>
        </div>

        {/* Steps Content */}
        <div className="space-y-4">
          {activeTab === 'ios' ? (
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-500 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    使用 Safari 瀏覽器打開本網頁，點擊底部工具列的「分享」按鈕
                  </p>
                  <div className="inline-flex items-center space-x-1 mt-1 text-[11px] text-pink-500 font-semibold">
                    <Share className="w-3.5 h-3.5" />
                    <span>底部中央方形向上箭頭</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-500 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    向下滑動選單，點選「加入主畫面」
                  </p>
                  <div className="inline-flex items-center space-x-1 mt-1 text-[11px] text-pink-500 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5" />
                    <span>加入主畫面 (Add to Home Screen)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-7 h-7 rounded-xl bg-pink-500/10 text-pink-500 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    點擊右上角的「新增」，桌面上即刻生成月見雷達 App！
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4">
                  Android 裝置支援一鍵快速安裝至主畫面：
                </p>
                <button
                  type="button"
                  onClick={handleAndroidInstall}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-md shadow-pink-500/25 hover:opacity-95"
                >
                  <Download className="w-4 h-4" />
                  <span>立即加到手機桌面</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 text-center">
                若無彈窗，可點擊 Chrome 右上角選單 (⋮) ➔ 選擇「安裝應用程式」
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            知道了
          </button>
        </div>
      </motion.div>
    </div>
  );
};
