import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { onShortVideoChanged, onLongVideoOpened } from './admobService';

const SAMPLE = [
  { id: 101, title: 'इंदौरी पोहा 5 मिनट में', category: 'नाश्ता', video_type: 'short', views: 1240, thumbnail_url: 'https://unsplash.com', description: 'पोहा, हल्दी, राई, करी पत्ता और सेव।' },
  { id: 102, title: 'शाही पनीर मसाला', category: 'सब्जी', video_type: 'long', views: 890, thumbnail_url: 'https://unsplash.com', description: 'ताज़ा पनीर, काजू पेस्ट और मसाले।' },
  { id: 103, title: 'आलू टिक्की चाट Reel', category: 'स्ट्रीट फूड', video_type: 'short', views: 2150, thumbnail_url: 'https://unsplash.com', description: 'आलू टिक्की, हरी चटनी और दही।' },
  { id: 104, title: 'नरम गुलाब जामुन', category: 'मिठाई', video_type: 'long', views: 430, thumbnail_url: 'https://unsplash.com', description: 'मावा और केसर की चाशनी।' }
];

export default function YouTubeStyleFeed({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [videos, setVideos] = useState<any[]>(SAMPLE);
  const [cat, setCat] = useState('सभी');
  const [q, setQ] = useState('');
  const [searchOn, setSearchOn] = useState(false);
  const [modal, setModal] = useState<'none' | 'settings' | 'rules'>('none');
  const [active, setActive] = useState<any | null>(null);
  const [cmt, setCmt] = useState('');
  const [cmts, setCmts] = useState<{ [k: number]: string[] }>({ 101: ['बहुत स्वादिष्ट रेसिपी है 👌'] });

  useEffect(() => {
    supabase.from('videos').select('*').order('id', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) setVideos([...data, ...SAMPLE]);
    });
  }, []);

  const play = async (v: any) => {
    v.video_type === 'short' ? await onShortVideoChanged() : await onLongVideoOpened();
    setActive(v);
  };

  const list = videos.filter((v) => (cat === 'सभी' || (v.category || '').includes(cat)) && (!q || v.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="bg-[#0A192F] text-white pb-24">
      <div className="sticky top-0 z-30 bg-[#0A192F] border-b border-zinc-800 px-3 py-2.5 flex justify-between items-center">
        <span className="font-bold text-amber-400">🍴 Yashucook</span>
        <div className="flex gap-2">
          <button onClick={() => setSearchOn(!searchOn)} className="w-8 h-8 rounded-full bg-zinc-900">🔍</button>
          <button onClick={() => alert('🔔 स्वागत है! कुकिंग वीडियो बनाएं और पैसे कमाएं।')} className="w-8 h-8 rounded-full bg-zinc-900">🔔</button>
          <button onClick={() => setModal('settings')} className="w-8 h-8 rounded-full bg-zinc-900">⚙️</button>
          <button onClick={onOpenAdmin} className="w-8 h-8 rounded-full bg-zinc-900 text-xs opacity-60">👑</button>
        </div>
      </div>

      {searchOn && <div className="p-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="रेसिपी खोजें..." className="w-full p-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-sm" /></div>}

      <div onClick={() => setModal('rules')} className="mx-3 mt-2 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex justify-between text-xs cursor-pointer">
        <span className="text-amber-300 font-semibold">🍳 कुकिंग वीडियो बनाएं और व्यूज़ से पैसे कमाएं</span>
        <span className="text-amber-400 underline font-bold">नियम →</span>
      </div>

      <div className="flex gap-2 overflow-x-auto p-3">
        {['सभी', 'नाश्ता', 'सब्जी', 'मिठाई', 'स्ट्रीट फूड'].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black' : 'px-3 py-1 rounded-full text-xs bg-zinc-900 text-zinc-300'}>{c}</button>
        ))}
      </div>

      <div className="px-3 space-y-4">
        <h3 className="text-xs font-bold text-amber-400">🔥 Shorts (Reels)</h3>
        <div className="flex gap-2.5 overflow-x-auto">
          {list.filter((v) => v.video_type === 'short').map((s) => (
            <div key={s.id} onClick={() => play(s)} className="min-w-[130px] h-48 rounded-2xl overflow-hidden relative bg-zinc-900 shrink-0">
              <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover opacity-85" />
              <div className="absolute bottom-2 left-2 right-2"><p className="text-xs font-bold">{s.title}</p><p className="text-[10px]">👁️ {s.views}</p></div>
            </div>
          ))}
        </div>

        <h3 className="text-xs font-bold text-amber-400">🍲 स्पेशल रेसिपी वीडियो</h3>
        {list.filter((v) => v.video_type !== 'short').map((l) => (
          <div key={l.id} onClick={() => play(l)} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img src={l.thumbnail_url} alt={l.title} className="w-full h-44 object-cover" />
            <div className="p-3"><p className="font-bold text-sm">{l.title}</p><p className="text-xs text-zinc-400">{l.category} • 👁️ {l.views}</p></div>
          </div>
        ))}
      </div>

      {modal === 'settings' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-4 rounded-2xl w-full max-w-sm space-y-3">
            <div className="flex justify-between"><h3 className="font-bold text-amber-400">⚙️ सेटिंग व भाषा</h3><button onClick={() => setModal('none')} className="text-xs bg-zinc-800 px-2 py-1 rounded">बंद</button></div>
            <div className="grid grid-cols-2 gap-1.5">
              {['हिंदी', 'English', 'मराठी', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'বাংলা', 'தமிழ்'].map((lg) => (
                <button key={lg} onClick={() => { localStorage.setItem('yashucook_lang', lg); alert('भाषा चुनी गई: ' + lg); }} className="p-2 bg-zinc-800 rounded text-xs text-left">{lg}</button>
              ))}
            </div>
            <button onClick={() => setModal('rules')} className="w-full p-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs">📜 कमाई के नियम व शर्तें देखें</button>
          </div>
        </div>
      )}

      {modal === 'rules' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-4 rounded-2xl w-full max-w-sm space-y-2 text-xs">
            <h3 className="font-bold text-amber-400 text-sm">💰 कमाई के नियम</h3>
            <p>• Shorts: 1,000 व्यूज़ पर ₹5 | लंबी वीडियो: 1,000 व्यूज़ पर ₹10</p>
            <p>• 24 घंटे में एक फोन से 1 व्यू गिना जाएगा। 3 गलत वीडियो पर खाता ब्लॉक।</p>
            <button onClick={() => setModal('none')} className="w-full py-2 bg-amber-500 text-black font-bold rounded-xl mt-2">ठीक है</button>
          </div>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4 space-y-3">
          <button onClick={() => setActive(null)} className="px-3 py-1 bg-zinc-800 rounded text-xs">← वापस</button>
          {active.video_url ? <video src={active.video_url} controls autoPlay className="w-full max-h-64 rounded-xl" /> : <img src={active.thumbnail_url} alt={active.title} className="w-full h-48 object-cover rounded-xl" />}
          <h2 className="font-bold text-amber-400">{active.title}</h2>
          <p className="text-xs text-zinc-300">{active.description}</p>
          <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
            <p className="text-xs font-bold text-amber-400">💬 कमेंट बॉक्स</p>
            <div className="flex gap-2">
              <input value={cmt} onChange={(e) => setCmt(e.target.value)} placeholder="कमेंट लिखें..." className="flex-1 p-2 bg-zinc-800 rounded text-xs" />
              <button onClick={() => { if (cmt.trim()) { setCmts({ ...cmts, [active.id]: [cmt, ...(cmts[active.id] || [])] }); setCmt(''); } }} className="px-3 bg-amber-500 text-black font-bold rounded text-xs">भेजें</button>
            </div>
            {(cmts[active.id] || []).map((c, i) => <div key={i} className="text-xs bg-zinc-800 p-2 rounded">👤 {c}</div>)}
          </div>
        </div>
      )}
    </div>
  );
          }
