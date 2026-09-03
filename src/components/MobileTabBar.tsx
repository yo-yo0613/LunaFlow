import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, Users, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { isPartnerMode } = useAuth();

  const tabs = [
    { path: '/', label: isPartnerMode ? '守護雷達' : '月見主頁', icon: isPartnerMode ? HeartHandshake : Sparkles },
    { path: '/calendar', label: '週期日曆', icon: Calendar },
    { path: '/partner', label: '伴侶連動', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-tab pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center w-20 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-pink-500 scale-105 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />
                )}
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
