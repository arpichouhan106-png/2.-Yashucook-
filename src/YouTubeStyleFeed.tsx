import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { onShortVideoChanged, onLongVideoOpened } from './admobService';

export default function YouTubeStyleFeed({ onOpenAdmin, darkMode, setDarkMode }: any) {
  const [videos, setVideos] = useState<any[]>([]);
  const [msg, setMsg] = useState('वीडियो लोड हो रहे हैं...');
  const [food, setFood] = useState('सभी');
  const [cat, setCat] = useState('सभी');
  const [q, setQ] = useState('');
  const [searchOn, setSearchOn] = useState(false);
  const [modal, setModal] = useState('none');
  const [folder, setFolder] = useState('menu');
  const [active, setActive] = useState<any | null>(null);
  const [likes, setLikes] = useState<{ [k: number]: boolean }>({});
  const [cmt, setCmt] = useState('');
  const [cmts, setCmts] = useState<{ [k: number]: string[] }>({});

  const load = async () => {
    setMsg('लोड हो रहा है...');
    const { data, error } = await supabase.from('videos').select('*').limit(100);
    if (error) setMsg('एरर: ' + error.message);
    else if (!data || data.length === 0) setMsg('डेटाबेस में 0 वीडियो हैं।');
    else { setVideos(data); setMsg(''); }
  };

  useEffect(() => { load(); }, []);

  const play = async (v: any) => {
    v.video_type === 'short' ? await onShortVideoChanged() : await onLongVideoOpened();
    setActive(v);
  };

  const list = videos.filter((v) => (food === 'सभी' || (v.food_type || 'Veg') === food) && (cat === 'सभी' || (v.category || '').includes(cat)) && (!q || (v.title || '').includes(q)));
  const bg = darkMode ? 'bg-[#0A192F] text-white' : 'bg-zinc-100 text-zinc-900';
    return (
    <div className={`${bg} pb-24 min-h-screen`}>
      <div className="sticky top-0 z-30 bg-[#0A192F] text-white border-b border-zinc-800 px-3 py-2 flex justify-between items-center">
        <span className="font-bold text-amber-400">🍴 Yashucook</span>
        <div className="flex gap-2">
          <button onClick={() => setSearchOn(!searchOn)} className="w-8 h-8 rounded-full bg-zinc-900">🔍</button>
          <button onClick={() => setModal('notif')} className="w-8 h-8 rounded-full bg-zinc-900">🔔</button>
          <button onClick={() => { setFolder('menu'); setModal('settings'); }} className="w-8 h-8 rounded-full bg-zinc-900">⚙️</button>
          <button onClick={onOpenAdmin} className="w-8 h-8 rounded-full bg-zinc-900 text-xs opacity-60">👑</button>
        </div>
      </div>

      {searchOn && <div className="p-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="रेसिपी खोजें..." className="w-full p-2 rounded-xl bg-zinc-900 text-white border border-amber-500/40 text-sm" /></div>}

      <div onClick={() => { setFolder('earning'); setModal('settings'); }} className="mx-3 mt-2 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex justify-between text-xs cursor-pointer">
        <span className="text-amber-400 font-semibold">🍳 कुकिंग वीडियो बनाएं और व्यूज़ से पैसे कमाएं</span>
        <span className="text-amber-400 underline font-bold">नियम →</span>
      </div>

      <div className="flex gap-2 px-3 pt-2.5">
        {['सभी', 'Veg', 'Non-Veg'].map((ft) => (
          <button key={ft} onClick={() => setFood(ft)} className={food === ft ? 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-black' : 'px-3 py-1 rounded-full text-xs bg-zinc-900 text-zinc-300'}>{ft === 'Veg' ? '🟢 Veg' : ft === 'Non-Veg' ? '🔴 Non-Veg' : '🍽️ सभी'}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto p-3">
        {['सभी', 'नाश्ता', 'सब्जी', 'मिठाई', 'स्ट्रीट फूड', 'जंक फूड'].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cat === c ? 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-black' : 'px-3 py-1 rounded-full text-xs bg-zinc-900 text-zinc-300'}>{c}</button>
        ))}
      </div>

      {msg && <div className="mx-3 p-3 rounded-xl bg-zinc-900 border border-amber-500/40 text-center text-xs text-amber-300">{msg} <button onClick={load} className="ml-2 px-2 py-0.5 bg-amber-500 text-black rounded font-bold">🔄 रिफ्रेश</button></div>}

      <div className="px-3 space-y-4">
        <h3 className="text-xs font-bold text-amber-400">🔥 Shorts ({list.filter((v) => v.video_type === 'short').length})</h3>
        <div className="flex gap-2.5 overflow-x-auto">
          {list.filter((v) => v.video_type === 'short').slice(0, 30).map((s) => (
            <div key={s.id} onClick={() => play(s)} className="min-w-[130px] h-48 rounded-2xl overflow-hidden relative bg-zinc-900 shrink-0">
              <video src={s.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 p-1 rounded text-white"><p className="text-xs font-bold line-clamp-1">{s.title}</p><p className="text-[10px] text-amber-300">👁️ {s.views || 0}</p></div>
            </div>
          ))}
        </div>
                <h3 className="text-xs font-bold text-amber-400">🍲 स्पेशल रेसिपी वीडियो ({list.filter((v) => v.video_type !== 'short').length})</h3>
        {list.filter((v) => v.video_type !== 'short').slice(0, 40).map((l) => (
          <div key={l.id} onClick={() => play(l)} className="rounded-2xl overflow-hidden bg-zinc-900 text-white border border-zinc-800">
            <video src={l.video_url} muted playsInline preload="metadata" className="w-full h-44 object-cover bg-black" />
            <div className="p-3"><p className="font-bold text-sm">{l.food_type === 'Non-Veg' ? '🔴' : '🟢'} {l.title}</p><p className="text-xs text-zinc-400">{l.category} • 👁️ {l.views || 0}</p></div>
          </div>
        ))}
      </div>

      {modal === 'notif' && <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 text-white"><div className="bg-zinc-900 p-4 rounded-2xl w-full max-w-sm space-y-2 text-xs"><div className="flex justify-between"><h3 className="font-bold text-amber-400">🔔 आपकी सूचनाएं</h3><button onClick={() => setModal('none')} className="bg-zinc-800 px-2 py-1 rounded">बंद</button></div><p className="p-2 bg-zinc-800 rounded">📌 अभी कोई नया कमेंट या पेमेंट अपडेट नहीं है।</p></div></div>}

      {modal === 'settings' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 text-white">
          <div className="bg-zinc-900 p-4 rounded-2xl w-full max-w-sm space-y-2 text-xs">
            <div className="flex justify-between border-b border-zinc-800 pb-2"><h3 className="font-bold text-amber-400">{folder === 'menu' ? '⚙️ सेटिंग फ़ोल्डर्स' : '← वापस'}</h3><button onClick={() => folder === 'menu' ? setModal('none') : setFolder('menu')} className="bg-zinc-800 px-2 py-1 rounded">{folder === 'menu' ? 'बंद' : 'पीछे'}</button></div>
            {folder === 'menu' && <>
              <button onClick={() => setFolder('lang')} className="w-full p-2.5 bg-zinc-800 rounded-xl flex justify-between font-bold"><span>📁 भाषा</span><span>→</span></button>
              <button onClick={() => setFolder('earning')} className="w-full p-2.5 bg-zinc-800 rounded-xl flex justify-between font-bold text-amber-400"><span>📁 कमाई चार्ट</span><span>→</span></button>
              <button onClick={() => setFolder('rules')} className="w-full p-2.5 bg-zinc-800 rounded-xl flex justify-between font-bold"><span>📁 नियम व शर्तें</span><span>→</span></button>
              <button onClick={() => setFolder('privacy')} className="w-full p-2.5 bg-zinc-800 rounded-xl flex justify-between font-bold text-emerald-400"><span>📁 प्राइवेसी</span><span>→</span></button>
              <button onClick={() => setDarkMode(!darkMode)} className="w-full p-2.5 bg-zinc-800 rounded-xl flex justify-between font-bold"><span>🌗 Dark Mode</span><span>{darkMode ? 'ON 🌙' : 'OFF ☀️'}</span></button>
            </>}
            {folder === 'lang' && <div className="grid grid-cols-2 gap-1.5">{['हिंदी', 'English', 'मराठी', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'বাংলা', 'தமிழ்'].map((lg) => <button key={lg} onClick={() => alert('भाषा: ' + lg)} className="p-2 bg-zinc-800 rounded text-left">{lg}</button>)}</div>}
            {folder === 'earning' && <p>• Shorts: 1,000 व्यूज़ पर ₹5 | Long: ₹10 | निकासी सीमा: ₹299</p>}
            {folder === 'rules' && <p>• केवल असली कुकिंग वीडियो डालें। 3 गलत वीडियो पर खाता ब्लॉक।</p>}
            {folder === 'privacy' && <p className="text-emerald-300">🔒 आपका मोबाइल नंबर, फोटो और डेटा 100% सुरक्षित है।</p>}
          </div>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto p-4 space-y-3 text-white">
          <button onClick={() => setActive(null)} className="px-3 py-1 bg-zinc-800 rounded text-xs">← वापस</button>
          <video src={active.video_url} controls autoPlay className="w-full max-h-72 rounded-xl bg-black" />
          <div className="flex justify-between items-center">
            <div><h2 className="font-bold text-amber-400">{active.title}</h2><p className="text-xs text-zinc-400">{active.food_type} • {active.category}</p></div>
            <div className="flex gap-4 text-xs"><button onClick={() => setLikes({ ...likes, [active.id]: !likes[active.id] })}>{likes[active.id] ? '❤️' : '🤍'} Like</button><span>💬 {(cmts[active.id] || []).length}</span><button onClick={() => alert('लिंक कॉपी!')}>📤 Share</button></div>
          </div>
          <p className="text-xs text-zinc-300">{active.description}</p>
          <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
            <div className="flex gap-2"><input value={cmt} onChange={(e) => setCmt(e.target.value)} placeholder="कमेंट लिखें..." className="flex-1 p-2 bg-zinc-800 rounded text-xs" /><button onClick={() => { if (cmt.trim()) { setCmts({ ...cmts, [active.id]: [cmt, ...(cmts[active.id] || [])] }); setCmt(''); } }} className="px-3 bg-amber-500 text-black font-bold rounded text-xs">भेजें</button></div>
            {(cmts[active.id] || []).map((c, i) => <div key={i} className="text-xs bg-zinc-800 p-2 rounded">👤 {c}</div>)}
          </div>
        </div>
      )}
    </div>
  );
              }
