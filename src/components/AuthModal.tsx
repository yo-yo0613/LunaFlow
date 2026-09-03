import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, LogIn, UserPlus, LogOut, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, signIn, signUp, signOut } = useAuth();
  
  const [tab, setTab] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (tab === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMessage(res.error || '帳號或密碼錯誤');
      } else {
        setSuccessMessage('登入成功！已連線至 Supabase 資料庫');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else if (tab === 'signup') {
      if (password.length < 6) {
        setErrorMessage('密碼長度至少需要 6 個字元');
        setLoading(false);
        return;
      }
      const res = await signUp(email, password, displayName);
      if (!res.success) {
        setErrorMessage(res.error || '註冊失敗');
      } else {
        setSuccessMessage('註冊成功！已建立專屬個人檔案');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else if (tab === 'magic') {
      const res = await signIn(email);
      if (!res.success) {
        setErrorMessage(res.error || '發送驗證信失敗');
      } else {
        setSuccessMessage('已發送登入連結至您的信箱，請至信箱點擊連結登入！');
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logged in state */}
        {user ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 border border-pink-500/30 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
              {profile.display_name?.charAt(0) || '月'}
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {profile.display_name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
              <div className="inline-flex items-center space-x-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Supabase 雲端即時同步中</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>登出目前帳號</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {tab === 'signin' ? '登入月見帳號' : tab === 'signup' ? '註冊新帳號' : '免密碼快速登入'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  同步雲端資料庫，跨裝置保存經期與守護連動
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'signin'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                密碼登入
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'signup'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                免費註冊
              </button>
              <button
                type="button"
                onClick={() => { setTab('magic'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  tab === 'magic'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                信箱免密
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    暱稱 / 稱呼
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="例如：小美 / 寶貝"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  電子信箱 (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {tab !== 'magic' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    密碼
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 6 位密碼"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    >
                      {showPassword ? '隱藏' : '顯示'}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white font-semibold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {tab === 'signin' ? <LogIn className="w-4 h-4" /> : tab === 'signup' ? <UserPlus className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    <span>{tab === 'signin' ? '立即登入' : tab === 'signup' ? '建立帳號' : '發送登入連結'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Guest note */}
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                暫時不登入，以訪客/本地快取模式體驗
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
