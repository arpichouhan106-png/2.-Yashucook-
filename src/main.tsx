import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './supabaseBridge.ts';
import App from './App.tsx';
import AdminPanel from './AdminPanel.tsx';
import { showBottomBanner } from './admobService.ts';
import './index.css';

function RootApp() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    showBottomBanner();
  }, []);

  return (
    <>
      <App />
      <button
        onClick={() => setShowAdmin(true)}
        title="Admin Control"
        className="fixed top-3 right-3 z-40 w-8 h-8 rounded-full bg-black/40 border border-amber-500/30 text-xs flex items-center justify-center opacity-60 hover:opacity-100"
      >
        👑
      </button>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(<RootApp />);

