import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './supabaseBridge.ts';
import AdminPanel from './AdminPanel.tsx';
import RealVideoUploader from './RealVideoUploader.tsx';
import YouTubeStyleFeed from './YouTubeStyleFeed.tsx';
import { showBottomBanner, onLongVideoOpened } from './admobService.ts';
import { supabase } from './supabaseClient.ts';
import './index.css';

function RootApp() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState<'home' | 'fridge' | 'profile'>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [items, setItems] = useState('');
  const [aiRecipe, setAiRecipe] = useState('');
  const [upi, setUpi] = useState('');
  const [msg, setMsg] = useState('');
  const [name, setName] = useState(localStorage.getItem('yashucook_creator') || 'Yashucook शेफ');
  const [myVideos, setMyVideos] = useState<any[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1500);
    showBottomBanner();
    supabase.from('videos').select('*').then(({ data }) => data && setMyVideos(data));
    return () => clearTimeout(t);
  }, []);

  if (splash) {
    return (
      <div className="bg-[#0A192F] min-h-screen flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-5xl shadow-2xl animate-pulse">🍴</div>
        <h1 className="mt-4 text-2xl font-extrabold text-amber-400 tracking-wider">Yashucook</h1>
      </div>
    );
  }

  const openProfile = async () => {
    await onLongVideoOpened();
    setTab('profile');
  };

  const userVids = myVideos.filter((v) => !(v.description || '').includes('Yashucook Official'));
  const views = userVids.reduce((s, v) => s + (v.views || 0), 0);
  const earn = Number(((views / 1000) * 7.5).toFixed(2));

  const sendReq = async () => {
    if (earn < 299) return alert(`न्यूनतम ₹299 पूरे होने पर ही रिक्वेस्ट भेज सकते हैं! अभी बैलेंस ₹${earn} है।`);
    if (!upi.trim()) return alert('अपनी UPI ID लिखें!');
    await supabase.from('withdrawals').insert([{ amount: earn, upi_id: `${upi} (${name}: ${msg})`, status: 'pending' }]);
    setUpi(''); setMsg('');
    alert('पेमेंट रिक्वेस्ट व मैसेज मालिक को भेज दिया गया है!');
  };

  return (
    <div className="bg-[#0A192F] min-h-screen text-white">
      {tab === 'home' && <YouTubeStyleFeed onOpenAdmin={() => setShowAdmin(true)} />}

      {tab === 'fridge' && (
        <div className="p-4 pb-24 space-y-3 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-amber-400">🧊 Fridge AI रेसिपी सहायक</h2>
          <textarea rows={3} value={items} onChange={(e) => setItems(e.target.value)} placeholder="घर में रखी सामग्री लिखें (जैसे: आलू, प्याज, बेसन)..." className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm" />
          <button onClick={() => items.trim() && setAiRecipe(`🍲 (${items}) से आप 10 मिनट में स्वादिष्ट मसाला तड़का रेसिपी बना सकते हैं!`)} className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-sm">✨ रेसिपी बताएं</button>
          {aiRecipe && <div className="p-3.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-sm">{aiRecipe}</div>}
        </div>
      )}

      {tab === 'profile' && (
        <div className="p-4 pb-24 space-y-4 max-w-md mx-auto">
          <div className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl border border-amber-500/30">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xl">👨‍🍳</div>
            <div><input value={name} onChange={(e) => { setName(e.target.value); localStorage.setItem('yashucook_creator', e.target.value); }} className="bg-transparent font-bold text-amber-400 outline-none" /><p className="text-xs text-zinc-400">क्रिएटर प्रोफ़ाइल व वॉलेट</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-xs text-zinc-400">वीडियो</p><p className="text-lg font-bold text-amber-400">{userVids.length}</p></div>
            <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-xs text-zinc-400">व्यूज़</p><p className="text-lg font-bold">{views}</p></div>
            <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-xs text-zinc-400">वॉलेट</p><p className="text-lg font-bold text-emerald-400">₹{earn}</p></div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl space-y-2.5 border border-zinc-800">
            <h3 className="font-bold text-sm text-emerald-400">💸 पेमेंट रिक्वेस्ट व मैसेज (न्यूनतम ₹299)</h3>
            <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="अपनी UPI ID डालें..." className="w-full p-2.5 rounded-xl bg-zinc-800 text-sm" />
            <textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="मालिक को मैसेज लिखें..." className="w-full p-2.5 rounded-xl bg-zinc-800 text-sm" />
            <button onClick={sendReq} className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs">
              {earn >= 299 ? '🚀 पेमेंट रिक्वेस्ट व मैसेज भेजें' : `🔒 ₹299 पूरे होने पर खुलेगा (अभी ₹${earn})`}
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#071120] border-t border-zinc-800 px-3 py-1.5 flex items-center justify-around">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'flex flex-col items-center text-[10px] text-amber-400 font-bold' : 'flex flex-col items-center text-[10px] text-zinc-400'}><span className="text-base">🏠</span><span>Home</span></button>
        <button onClick={() => setTab('fridge')} className={tab === 'fridge' ? 'flex flex-col items-center text-[10px] text-amber-400 font-bold' : 'flex flex-col items-center text-[10px] text-zinc-400'}><span className="text-base">🧊</span><span>Fridge AI</span></button>
        <button onClick={() => setShowUploader(true)} className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-black font-extrabold text-3xl flex items-center justify-center shadow-xl border-4 border-[#0A192F]">+</button>
        <button onClick={openProfile} className={tab === 'profile' ? 'flex flex-col items-center text-[10px] text-amber-400 font-bold' : 'flex flex-col items-center text-[10px] text-zinc-400'}><span className="text-base">👤</span><span>प्रोफ़ाइल</span></button>
      </div>

      {showUploader && <RealVideoUploader onClose={() => setShowUploader(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<RootApp />);
