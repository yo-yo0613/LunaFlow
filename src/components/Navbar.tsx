import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Sparkles, Calendar, Users, Share2, Download, User as UserIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenShare: () => void;
  onOpenInstall: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShare, onOpenInstall, onOpenAuth }) => {
  const { theme, toggleTheme } = useTheme();
  const { cycleInfo, profile, user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: '月見雷達', icon: Sparkles },
    { path: '/calendar', label: '身心日曆', icon: Calendar },
    { path: '/partner', label: '守護與分享', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#09090b] rounded-[10px] flex items-center justify-center">
                <Moon className="w-5 h-5 text-pink-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                LunaFlow
              </span>
              <span className="text-[10px] text-pink-500 font-medium tracking-wider -mt-1">
                月見雷達
              </span>
            </div>
          </Link>

          {/* Real-time Status Capsule */}
          <div className="hidden md:flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-900/60 animate-pulse-slow">
            <span className="w-2 h-2 rounded-full bg-pink-500 mr-2 animate-ping" />
            {profile.display_name} · {cycleInfo.batteryLabel}
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-200/60 dark:bg-zinc-800/70 text-pink-600 dark:text-pink-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : ''}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">

          {/* Social Share & QR Button */}
          <button
            onClick={onOpenShare}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1 text-xs font-semibold"
            title="分享雷達 / 社群預覽卡片"
          >
            <Share2 className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">傳給伴侶</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenInstall}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:flex items-center space-x-1"
            title="安裝至主畫面"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={theme === 'dark' ? '切換為白晝明亮模式' : '切換為極簡暗夜模式'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Login / Avatar Capsule */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold transition-all border ${
              user
                ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800/80 hover:bg-pink-100'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-pink-300'
            }`}
            title={user ? '管理個人帳號 / 雲端連線' : '登入或註冊月見帳號'}
          >
            <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center font-bold text-xs">
              {user ? (profile.display_name?.charAt(0) || '月') : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline">
              {user ? profile.display_name : '登入 / 註冊'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
