import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './supabaseBridge.ts';
import App from './App.tsx';
import AdminPanel from './AdminPanel.tsx';
import RealVideoUploader from './RealVideoUploader.tsx';
import YouTubeStyleFeed from './YouTubeStyleFeed.tsx';
import { showBottomBanner } from './admobService.ts';
import './index.css';

function RootApp() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    showBottomBanner();
  }, []);

  return (
    <div className="bg-[#0A192F] min-h-screen">
      {!showTools ? (
        <YouTubeStyleFeed onOpenAdmin={() => setShowAdmin(true)} />
      ) : (
        <App />
      )}

      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#071120] border-t border-zinc-800 px-3 py-1.5 flex items-center justify-around text-white">
        <button onClick={() => setShowTools(false)} className="flex flex-col items-center text-[10px] text-amber-400 font-bold">
          <span className="text-base">🏠</span><span>Home</span>
        </button>
        <button onClick={() => setShowTools(true)} className="flex flex-col items-center text-[10px] text-zinc-400">
          <span className="text-base">🧊</span><span>Fridge AI</span>
        </button>
        <button onClick={() => setShowUploader(true)} className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-black font-bold flex items-center justify-center shadow-lg border-2 border-[#0A192F]">
          <span className="text-lg">📷</span>
        </button>
        <button onClick={() => setShowTools(true)} className="flex flex-col items-center text-[10px] text-zinc-400">
          <span className="text-base">👤</span><span>प्रोफ़ाइल</span>
        </button>
      </div>

      {showUploader && <RealVideoUploader onClose={() => setShowUploader(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<RootApp />);
