import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { onShortVideoChanged, onLongVideoOpened } from './admobService';

export default function YouTubeStyleFeed({ onOpenAdmin }: any) {
  const [videos, setVideos] = useState<any[]>([]);
  const [status, setStatus] = useState('वीडियो लोड हो रहे हैं...');
  const [food, setFood] = useState('सभी');
  const [cat, setCat] = useState('सभी');
  const [active, setActive] = useState<any | null>(null);

  const load = async () => {
    setStatus('वीडियो लोड हो रहे हैं...');
    const { data, error } = await supabase.from('videos').select('*').limit(100);
    if (error) setStatus('एरर: ' + error.message);
    else if (!data || data.length === 0) setStatus('डेटाबेस में 0 वीडियो हैं।');
    else { setVideos(data); setStatus(''); }
  };

  useEffect(() => { load(); }, []);

  const list = videos.filter((v) => (food === 'सभी' || (v.food_type || 'Veg') === food) && (cat === 'सभी' || (v.category || '').includes(cat)));

  return (
    <div className="bg-[#0A192F] text-white pb-24 min-h-screen p-3 space-y-3">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <span className="font-bold text-amber-400">🍴 Yashucook</span>
        <button onClick={onOpenAdmin} className="px-2 py-1 bg-zinc-900 rounded text-xs">👑</button>
      </div>

      <div className="flex gap-2">
        {['सभी', 'Veg', 'Non-Veg'].map((f) => (
          <button key={f} onClick={() => setFood(f)} className={food === f ? 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-black' : 'px-3 py-1 rounded-full text-xs bg-zinc-900'}>{f}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['सभी', 'नाश्ता', 'सब्जी', 'मिठाई', 'स्ट्रीट फूड', 'जंक फूड'].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black' : 'px-3 py-1 rounded-full text-xs bg-zinc-900'}>{c}</button>
        ))}
      </div>

      {status && <div className="p-3 bg-zinc-900 rounded-xl text-xs text-amber-300">{status} <button onClick={load} className="ml-2 px-2 py-1 bg-amber-500 text-black rounded font-bold">🔄 रिफ्रेश</button></div>}

      <div className="space-y-3">
        {list.slice(0, 30).map((v) => (
          <div key={v.id} onClick={async () => { await onLongVideoOpened(); setActive(v); }} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <video src={v.video_url} muted playsInline preload="metadata" className="w-full h-44 object-cover bg-black" />
            <div className="p-3"><p className="font-bold text-sm">{v.title}</p><p className="text-xs text-zinc-400">{v.food_type} • {v.category} • 👁️ {v.views || 0}</p></div>
          </div>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 bg-black z-50 p-4 space-y-3">
          <button onClick={() => setActive(null)} className="px-3 py-1 bg-zinc-800 rounded text-xs">← वापस</button>
          <video src={active.video_url} controls autoPlay className="w-full max-h-72 rounded-xl" />
          <h2 className="font-bold text-amber-400">{active.title}</h2>
        </div>
      )}
    </div>
  );
}
