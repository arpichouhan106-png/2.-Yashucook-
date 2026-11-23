import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [lockLimit, setLockLimit] = useState('500');

  const verifyPin = async () => {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', '00000000-0000-0000-0000-000000000001').single();
    if (pin === (data?.full_name || '782941')) setIsUnlocked(true);
    else alert('गलत PIN!');
  };

  useEffect(() => {
    if (isUnlocked) {
      supabase.from('videos').select('*').order('id', { ascending: false }).then(({ data }) => data && setVideos(data));
      supabase.from('withdrawals').select('*').order('id', { ascending: false }).then(({ data }) => data && setWithdrawals(data));
    }
  }, [isUnlocked]);

  const changePin = async () => {
    if (newPin.length < 4) return alert('कम से कम 4 अंक लिखें');
    await supabase.from('profiles').upsert({ id: '00000000-0000-0000-0000-000000000001', full_name: newPin });
    setNewPin('');
    alert('नया स्थायी PIN सेव हो गया!');
  };

  const deleteVideo = async (v: any) => {
    await supabase.from('videos').delete().eq('id', v.id);
    const key = v.user_id || v.title || 'user';
    const strikes = JSON.parse(localStorage.getItem('yashucook_strikes') || '{}');
    strikes[key] = (strikes[key] || 0) + 1;
    localStorage.setItem('yashucook_strikes', JSON.stringify(strikes));
    alert(strikes[key] >= 3 ? '3 चेतावनी पूरी! यूज़र ब्लॉक कर दिया गया।' : `वीडियो हटाया गया (चेतावनी ${strikes[key]}/3)`);
    setVideos(videos.filter((item) => item.id !== v.id));
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 text-white">
        <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm text-center border border-amber-500/40">
          <h2 className="text-lg font-bold text-amber-400 mb-3">🔐 मालिक कंट्रोल रूम</h2>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN डालें" className="w-full p-3 rounded-xl bg-zinc-800 text-center mb-3" />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 bg-zinc-800 rounded-xl">बंद करें</button>
            <button onClick={verifyPin} className="flex-1 py-2 bg-amber-500 text-black font-bold rounded-xl">खोलें</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-lg mx-auto space-y-4 pb-16">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h1 className="font-bold text-amber-400">👑 Yashucook कंट्रोल रूम</h1>
          <button onClick={onClose} className="px-3 py-1 bg-red-600 rounded-lg text-xs">बंद करें</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-xs text-zinc-400">वीडियो</p><p className="text-xl font-bold text-amber-400">{videos.length}</p></div>
          <div className="bg-zinc-900 p-3 rounded-xl"><p className="text-xs text-zinc-400">पेमेंट रिक्वेस्ट</p><p className="text-xl font-bold text-emerald-400">{withdrawals.length}</p></div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
          <p className="text-sm font-bold text-amber-400">🔒 वायरल वीडियो लॉक सीमा (व्यूज़)</p>
          <div className="flex gap-2">
            <input type="number" value={lockLimit} onChange={(e) => setLockLimit(e.target.value)} className="flex-1 p-2 rounded bg-zinc-800" />
            <button onClick={() => { localStorage.setItem('yashucook_lock_limit', lockLimit); alert('सेव हो गया!'); }} className="px-3 bg-amber-500 text-black font-bold rounded">सेव</button>
          </div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
          <p className="text-sm font-bold text-amber-400">📢 खुद का स्पॉन्सर विज्ञापन</p>
          <input type="text" placeholder="विज्ञापन का नाम" value={sponsorTitle} onChange={(e) => setSponsorTitle(e.target.value)} className="w-full p-2 rounded bg-zinc-800 text-sm" />
          <input type="text" placeholder="लिंक (WhatsApp/Site)" value={sponsorLink} onChange={(e) => setSponsorLink(e.target.value)} className="w-full p-2 rounded bg-zinc-800 text-sm" />
          <button onClick={() => { localStorage.setItem('yashucook_sponsor_ad', JSON.stringify({ title: sponsorTitle, link: sponsorLink })); alert('विज्ञापन चालू!'); }} className="w-full py-2 bg-emerald-500 text-black font-bold rounded text-sm">विज्ञापन सेव करें</button>
        </div>

        <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
          <p className="text-sm font-bold text-amber-400">🔑 स्थायी PIN बदलें</p>
          <div className="flex gap-2">
            <input type="password" placeholder="नया PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="flex-1 p-2 rounded bg-zinc-800" />
            <button onClick={changePin} className="px-3 bg-zinc-700 rounded font-bold">लॉक करें</button>
          </div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
          <p className="text-sm font-bold text-amber-400">🎬 सभी वीडियो (3 बार हटाने पर ब्लॉक)</p>
          {videos.map((v) => (
            <div key={v.id} className="flex justify-between items-center bg-zinc-800 p-2 rounded">
              <span className="text-sm">{v.title} ({v.views || 0} views)</span>
              <button onClick={() => deleteVideo(v)} className="px-2 py-1 bg-red-600 rounded text-xs">हटाएं</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
          }
