import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './supabaseBridge';
import AdminPanel from './AdminPanel';
import RealVideoUploader from './RealVideoUploader';
import YouTubeStyleFeed from './YouTubeStyleFeed';
import { showBottomBanner, onLongVideoOpened } from './admobService';
import { supabase } from './supabaseClient';
import './index.css';

function RootApp() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [items, setItems] = useState('');
  const [aiRecipe, setAiRecipe] = useState('');
  const [upi, setUpi] = useState('');
  const [msg, setMsg] = useState('');
  const [name, setName] = useState(localStorage.getItem('yc_name') || 'Yashucook शेफ');
  const [phone, setPhone] = useState(localStorage.getItem('yc_phone') || '');
  const [bio, setBio] = useState(localStorage.getItem('yc_bio') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('yc_avatar') || '');
  const [myVideos, setMyVideos] = useState<any[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1400);
    showBottomBanner();
    supabase.from('videos').select('*').then(({ data }) => data && setMyVideos(data));
    window.history.pushState(null, '', window.location.href);
    const onBack = () => {
      window.history.pushState(null, '', window.location.href);
      setTab('home');
      setShowUploader(false);
      setShowAdmin(false);
    };
    window.addEventListener('popstate', onBack);
    return () => { clearTimeout(t); window.removeEventListener('popstate', onBack); };
  }, []);

  if (splash) {
    return (
      <div className="bg-[#0A192F] min-h-screen flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-4xl shadow-2xl">🍴</div>
        <h1 className="mt-3 text-2xl font-extrabold text-amber-400">Yashucook</h1>
      </div>
    );
  }

  const makeRecipe = () => {
    if (!items.trim()) return alert('कृपया फ्रिज में रखी सामग्री लिखें!');
    setAiRecipe(`🍲 रेसिपी: स्पेशल (${items}) मसाला\n\n📝 बनाने की पूरी विधि:\n1. सबसे पहले (${items}) को अच्छे से धोकर छोटे टुकड़ों में काट लें।\n2. कढ़ाई में 2 चम्मच तेल गरम करें, उसमें जीरा, राई और हल्दी डालें।\n3. अब कटी हुई सामग्री डालें, स्वादानुसार नमक व मसाले मिलाकर 8-10 मिनट धीमी आंच पर ढककर पकाएं।\n4. ऊपर से हरा धनिया डालकर गरमा-गरम परोसें!`);
  };

  const onPhoto = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setAvatar(String(r.result)); localStorage.setItem('yc_avatar', String(r.result)); };
    r.readAsDataURL(f);
  };

  const userVids = myVideos.filter((v) => !(v.description || '').includes('Yashucook Official'));
  const views = userVids.reduce((s, v) => s + (v.views || 0), 0);
  const earn = Number(((views / 1000) * 7.5).toFixed(2));

  const sendReq = async () => {
    if (earn < 299) return alert(`न्यूनतम ₹299 पूरे होने पर ही रिक्वेस्ट भेज सकते हैं! अभी बैलेंस ₹${earn} है।`);
    if (!upi.trim()) return alert('अपनी UPI ID लिखें!');
    await supabase.from('withdrawals').insert([{ amount: earn, upi_id: `${upi} (${name} | ${phone}: ${msg})`, status: 'pending' }]);
    setUpi(''); setMsg('');
    alert('पेमेंट रिक्वेस्ट व मैसेज मालिक को भेज दिया गया है!');
  };

  const bg = darkMode ? 'bg-[#0A192F] text-white' : 'bg-zinc-100 text-zinc-900';
  const card = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';

  return (
    <div className={`${bg} min-h-screen`}>
      {tab === 'home' && <YouTubeStyleFeed onOpenAdmin={() => setShowAdmin(true)} darkMode={darkMode} setDarkMode={setDarkMode} />}

      {tab === 'fridge' && (
        <div className="p-4 pb-24 space-y-3 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-amber-500">🧊 Fridge AI — पूरी विधि सहित</h2>
          <textarea rows={3} value={items} onChange={(e) => setItems(e.target.value)} placeholder="घर में रखी चीज़ें लिखें (जैसे: आलू, प्याज, टमाटर)..." className={`w-full p-3 rounded-xl border ${card} text-sm`} />
          <button onClick={makeRecipe} className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-sm">✨ पूरी रेसिपी व विधि जानें</button>
          {aiRecipe && <pre className={`p-4 rounded-xl border border-amber-500/40 text-xs whitespace-pre-wrap leading-relaxed ${card}`}>{aiRecipe}</pre>}
        </div>
      )}

      {tab === 'profile' && (
        <div className="p-4 pb-24 space-y-3 max-w-md mx-auto">
          <div className={`p-4 rounded-2xl border ${card} space-y-2.5`}>
            <div className="flex items-center gap-3">
              <label className="w-16 h-16 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-2xl overflow-hidden cursor-pointer shrink-0">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : '📷'}
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              </label>
              <div className="flex-1 space-y-1">
                <input value={name} onChange={(e) => { setName(e.target.value); localStorage.setItem('yc_name', e.target.value); }} placeholder="आपका नाम" className="w-full bg-transparent font-bold text-amber-500 outline-none border-b border-zinc-700 pb-0.5" />
                <input value={phone} onChange={(e) => { setPhone(e.target.value); localStorage.setItem('yc_phone', e.target.value); }} placeholder="मोबाइल नंबर डालें" className="w-full bg-transparent text-xs outline-none border-b border-zinc-700 pb-0.5" />
              </div>
            </div>
            <input value={bio} onChange={(e) => { setBio(e.target.value); localStorage.setItem('yc_bio', e.target.value); }} placeholder="अपने बारे में लिखें (जैसे: घर के स्वादिष्ट खाने की शौकीन)..." className="w-full bg-transparent text-xs outline-none border-b border-zinc-700 pb-1" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-3 rounded-xl border ${card}`}><p className="text-xs opacity-70">वीडियो</p><p className="text-lg font-bold text-amber-500">{userVids.length}</p></div>
            <div className={`p-3 rounded-xl border ${card}`}><p className="text-xs opacity-70">व्यूज़</p><p className="text-lg font-bold">{views}</p></div>
            <div className={`p-3 rounded-xl border ${card}`}><p className="text-xs opacity-70">वॉलेट</p><p className="text-lg font-bold text-emerald-500">₹{earn}</p></div>
          </div>

          <div className={`p-4 rounded-2xl space-y-2.5 border ${card}`}>
            <h3 className="font-bold text-sm text-emerald-500">💸 पेमेंट रिक्वेस्ट व मैसेज (न्यूनतम ₹299)</h3>
            <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="अपनी UPI ID डालें..." className="w-full p-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700 text-sm" />
            <textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="मालिक को मैसेज लिखें..." className="w-full p-2.5 rounded-xl bg-zinc-800/30 border border-zinc-700 text-sm" />
            <button onClick={sendReq} className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs">{earn >= 299 ? '🚀 पेमेंट रिक्वेस्ट भेजें' : `🔒 ₹299 पूरे होने पर खुलेगा (₹${earn})`}</button>
          </div>
        </div>
      )}

      <div className={`fixed bottom-0 inset-x-0 z-30 ${darkMode ? 'bg-[#071120] text-white' : 'bg-white text-zinc-800'} border-t border-zinc-700/30 px-3 py-1.5 flex items-center justify-around`}>
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'flex flex-col items-center text-[10px] text-amber-500 font-bold' : 'flex flex-col items-center text-[10px] opacity-70'}><span className="text-base">🏠</span><span>Home</span></button>
        <button onClick={() => setTab('fridge')} className={tab === 'fridge' ? 'flex flex-col items-center text-[10px] text-amber-500 font-bold' : 'flex flex-col items-center text-[10px] opacity-70'}><span className="text-base">🧊</span><span>Fridge AI</span></button>
        <button onClick={() => setShowUploader(true)} className="w-11 h-11 -mt-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-black font-bold text-2xl flex items-center justify-center shadow-lg">+</button>
        <button onClick={async () => { await onLongVideoOpened(); setTab('profile'); }} className={tab === 'profile' ? 'flex flex-col items-center text-[10px] text-amber-500 font-bold' : 'flex flex-col items-center text-[10px] opacity-70'}><span className="text-base">👤</span><span>प्रोफ़ाइल</span></button>
      </div>

      {showUploader && <RealVideoUploader onClose={() => setShowUploader(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<RootApp />);
