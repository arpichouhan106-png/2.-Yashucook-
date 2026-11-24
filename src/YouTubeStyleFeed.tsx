import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { onShortVideoChanged, onLongVideoOpened, unlockPopularVideoWithAd, isValidUniqueView } from './admobService';

const SAMPLE_RECIPES = [
  { id: 101, title: 'इंदौरी चटपटा पोहा 5 मिनट में', category: 'नाश्ता', video_type: 'short', views: 1240, thumbnail_url: 'https://unsplash.com', description: 'पोहा, हल्दी, राई, करी पत्ता, जीरावन मसाला और सेव के साथ झटपट नाश्ता।' },
  { id: 102, title: 'ढाबा स्टाइल शाही पनीर मसाला', category: 'सब्जी', video_type: 'long', views: 890, thumbnail_url: 'https://unsplash.com', description: 'ताज़ा पनीर, काजू पेस्ट, टमाटर और घर के शुद्ध मसालों से बनी शाही रेसिपी।' },
  { id: 103, title: 'क्रिस्पी आलू टिक्की चाट Reel', category: 'स्ट्रीट फूड', video_type: 'short', views: 2150, thumbnail_url: 'https://unsplash.com', description: 'उबले आलू, हरी चटनी, मीठी इमली चटनी और दही वाली स्वादिष्ट चाट।' },
  { id: 104, title: 'हलवाई जैसे नरम गुलाब जामुन', category: 'मिठाई', video_type: 'long', views: 430, thumbnail_url: 'https://unsplash.com', description: 'मावा, इलायची और केसर की चाशनी में डूबे हुए रसीले गुलाब जामुन।' }
];

const LANGUAGES = ['हिंदी (Hindi)', 'English', 'मराठी (Marathi)', 'ગુજરાતી (Gujarati)', 'ਪੰਜਾਬੀ (Punjabi)', 'বাংলা (Bengali)', 'தமிழ் (Tamil)'];

export default function YouTubeStyleFeed({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [videos, setVideos] = useState<any[]>(SAMPLE_RECIPES);
  const [selectedCat, setSelectedCat] = useState('सभी');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('yashucook_lang') || 'हिंदी (Hindi)');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  useEffect(() => {
    supabase.from('videos').select('*').order('id', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) setVideos([...data, ...SAMPLE_RECIPES]);
    });
  }, []);

  const changeLanguage = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('yashucook_lang', newLang);
    alert(`ऐप की भाषा "${newLang}" चुन ली गई है!`);
  };

  const lockLimit = Number(localStorage.getItem('yashucook_lock_limit') || 500);

  const openRecipe = async (v: any) => {
    const isLocked = (v.views || 0) >= lockLimit && !unlockedIds.includes(v.id);
    if (isLocked) {
      await unlockPopularVideoWithAd(() => {
        setUnlockedIds([...unlockedIds, v.id]);
        playNow(v);
      });
    } else {
      playNow(v);
    }
  };

  const playNow = async (v: any) => {
    if (v.video_type === 'short') await onShortVideoChanged();
    else await onLongVideoOpened();
    if (isValidUniqueView(v.id) && v.id < 100) {
      await supabase.from('videos').update({ views: (v.views || 0) + 1 }).eq('id', v.id);
    }
    setActiveVideo(v);
  };

  const filtered = videos.filter((v) => {
    const matchCat = selectedCat === 'सभी' || (v.category || '').includes(selectedCat);
    const matchSearch = !searchText || v.title.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  const shorts = filtered.filter((v) => v.video_type === 'short');
  const longs = filtered.filter((v) => v.video_type !== 'short');
  const isEn = lang === 'English';

  return (
    <div className="bg-[#0A192F] text-white pb-24">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-extrabold">🍴</div>
          <span className="font-bold text-base text-amber-400">Yashucook</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm">🔍</button>
          <button onClick={() => alert('🔔 Yashucook में आपका स्वागत है! कुकिंग वीडियो बनाएं और व्यूज़ से पैसे कमाएं।')} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm">🔔</button>
          <button onClick={() => setShowSettings(true)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm">⚙️</button>
          <button onClick={onOpenAdmin} className="w-8 h-8 rounded-full bg-zinc-900/60 flex items-center justify-center text-xs opacity-60">👑</button>
        </div>
      </div>

      {showSearch && (
        <div className="px-3.5 pt-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={isEn ? 'Search recipes...' : 'रेसिपी खोजें (जैसे: पोहा, पनीर, मिठाई)...'}
            className="w-full p-2.5 rounded-xl bg-zinc-900 border border-amber-500/40 text-sm"
          />
        </div>
      )}

      <div onClick={() => setShowRules(true)} className="mx-3.5 mt-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer">
        <span className="text-xs font-semibold text-amber-300">{isEn ? '🍳 Cook, Create & Earn from Views' : '🍳 कुकिंग वीडियो बनाएं और व्यूज़ से पैसे कमाएं'}</span>
        <span className="text-[11px] text-amber-400 font-bold underline">{isEn ? 'Rules →' : 'नियम →'}</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-3.5 py-3">
        {['सभी', 'नाश्ता', 'सब्जी', 'मिठाई', 'स्ट्रीट फूड'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${selectedCat === cat ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-3.5 space-y-5">
        {shorts.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-amber-400 mb-2">🔥 Yashucook Shorts (Reels)</h3>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {shorts.map((s) => {
                const locked = (s.views || 0) >= lockLimit && !unlockedIds.includes(s.id);
                return (
                  <div key={s.id} onClick={() => openRecipe(s)} className="min-w-[135px] h-52 rounded-2xl overflow-hidden relative bg-zinc-900 border border-zinc-800 shrink-0 cursor-pointer">
                    <img src={s.thumbnail_url || 'https://unsplash.com'} alt={s.title} className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    {locked && <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">🔒 Ad</span>}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-bold line-clamp-2">{s.title}</p>
                      <p className="text-[10px] text-zinc-300 mt-0.5">👁️ {s.views || 0}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-amber-400">🍲 {isEn ? 'Special Recipe Videos' : 'स्पेशल रेसिपी वीडियो'}</h3>
          {longs.map((l) => {
            const locked = (l.views || 0) >= lockLimit && !unlockedIds.includes(l.id);
            return (
              <div key={l.id} onClick={() => openRecipe(l)} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer">
                <div className="relative h-48 bg-black">
                  <img src={l.thumbnail_url || 'https://unsplash.com'} alt={l.title} className="w-full h-full object-cover" />
                  {locked && <span className="absolute top-3 right-3 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">🔒 Ad देखकर खोलें</span>}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm">{l.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{l.category} • 👁️ {l.views || 0} views</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* सेटिंग पैनल: भाषा चुनें + नियम व शर्तें */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-amber-400">⚙️ सेटिंग (Settings)</h3>
              <button onClick={() => setShowSettings(false)} className="text-xs bg-zinc-800 px-2.5 py-1 rounded">बंद करें</button>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-300 mb-2">🌐 भाषा चुनें (App Language):</p>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
        
