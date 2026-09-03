import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// 自動註冊 PWA Service Worker
registerSW({
  onNeedRefresh() {
    console.log('LunaFlow PWA 有新版本可更新');
  },
  onOfflineReady() {
    console.log('LunaFlow PWA 已完成離線快取準備');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
