import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorImage, setSponsorImage] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');
  const [lockViewsLimit, setLockViewsLimit] = useState('500');

  const getCurrentPin = () => localStorage.getItem('yashucook_admin_pin') || '782941';

  useEffect(() => {
    if (isUnlocked) {
      loadAdminData();
      const savedSponsor = localStorage.getItem('yashucook_sponsor_ad');
      if (savedSponsor) {
        const parsed = JSON.parse(savedSponsor);
        setSponsorTitle(parsed.title || '');
        setSponsorImage(parsed.image || '');
        setSponsorLink(parsed.link || '');
      }
      const savedLimit = localStorage.getItem('yashucook_lock_limit');
      if (savedLimit) setLockViewsLimit(savedLimit);
    }
  }, [isUnlocked]);

  const loadAdminData = async () => {
    const { data: vData } = await supabase.from('videos').select('*').order('id', { ascending: false });
    if (vData) setVideos(vData);
    const { data: wData } = await supabase.from('withdrawals').select('*').order('id', { ascending: false });
    if (wData) setWithdrawals(wData);
  };

  const handleChangePin = () => {
    if (newPin.length < 4) {
      alert('कृपया कम से कम 4 से 6 अंकों का नया PIN लिखें।');
      return;
    }
    localStorage.setItem('yashucook_admin_pin', newPin);
    setNewPin('');
    alert('आपका नया गुप्त PIN सफलतापूर्वक बदल दिया गया है!');
  };

  const handleSaveSponsorAd = () => {
    if (!sponsorTitle) {
      localStorage.removeItem('yashucook_sponsor_ad');
      alert('स्पॉन्सर विज्ञापन हटा दिया गया है। अब Google AdMob विज्ञापन चलेंगे।');
      return;
    }
    localStorage.setItem('yashucook_sponsor_ad', JSON.stringify({
      title: sponsorTitle,
      image: sponsorImage,
      link: sponsorLink
    }));
    alert('आपका खुद का स्पॉन्सर विज्ञापन ऐप में चालू हो गया है!');
  };

  const handleSaveLockLimit = () => {
    localStorage.setItem('yashucook_lock_limit', lockViewsLimit);
    alert(`अब ${lockViewsLimit} से ज़्यादा व्यूज़ वाले वीडियो पर अपने आप ताला (Lock) लग जाएगा!`);
  };

  const handleDeleteVideo = async (id: number) => {
    await supabase.from('videos').delete().eq('id', id);
    loadAdminData();
  };

  const handleMarkPaid = async (id: number) => {
    await supabase.from('withdrawals').update({ status: 'paid' }).eq('id', id);
    loadAdminData();
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 text-white">
        <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-sm text-center">
          <h2 className="text-xl font-bold text-amber-400 mb-2">🔐 मालिक का कंट्रोल रूम</h2>
          <p className="text-xs text-zinc-400 mb-4">अंदर जाने के लिए अपना गुप्त PIN डालें</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="गुप्त PIN डालें"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-center text-lg tracking-widest mb-4"
          />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300">बंद करें</button>
            <button
              onClick={() => pin === getCurrentPin() ? setIsUnlocked(true) : alert('गलत PIN!')}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold"
            >
              खोलें
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-lg mx-auto pb-20">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <h1 className="text-lg font-bold text-amber-400">👑 Yashucook मालिक कंट्रोल रूम</h1>
          <button onClick={onClose} className="px-3 py-1 bg-red-600 rounded-lg text-sm font-semibold">बाहर निकलें</button>
        </div>

        {/* 1. कुल हिसाब */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <p className="text-xs text-zinc-400">कुल अपलोड वीडियो</p>
            <p className="text-2xl font-bold text-amber-400">{videos.length}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <p className="text-xs text-zinc-400">पेमेंट रिक्वेस्ट</p>
            <p className="text-2xl font-bold text-emerald-400">{withdrawals.length}</p>
          </div>
        </div>

        {/* 2. वायरल वीडियो लॉक सीमा */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-5">
          <h3 className="font-bold text-amber-400 mb-2">🔒 वायरल वीडियो पर ताला (Lock) नियम</h3>
          <p className="text-xs text-zinc-400 mb-2">कितने व्यूज़ के बाद वीडियो पर अपने आप ताला लगे (जिसे विज्ञापन देखकर खोला जा सके):</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={lockViewsLimit}
              onChange={(e) => setLockViewsLimit(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-zinc-800 border border-zinc-700"
            />
            <button onClick={handleSaveLockLimit} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg">सेव करें</button>
          </div>
        </div>

        {/* 3. खुद का स्पॉन्सर विज्ञापन */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-5">
          <h3 className="font-bold text-amber-400 mb-2">📢 अपना खुद का स्पॉन्सर विज्ञापन लगाएं</h3>
          <input
            type="text"
            placeholder="विज्ञापन का शीर्षक (जैसे: शुद्ध घर के मसाले)"
            value={sponsorTitle}
            onChange={(e) => setSponsorTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 mb-2 text-sm"
          />
          <input
            type="text"
            placeholder="बैनर फोटो का लिंक (Image URL)"
            value={sponsorImage}
            onChange={(e) => setSponsorImage(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 mb-2 text-sm"
          />
          <input
            type="text"
            placeholder="क्लिक करने पर खुलने वाला लिंक (WhatsApp / Website)"
            value={sponsorLink}
            onChange={(e) => setSponsorLink(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 mb-3 text-sm"
          />
          <button onClick={handleSaveSponsorAd} className="w-full py-2.5 bg-emerald-500 text-black font-bold rounded-lg">
            स्पॉन्सर विज्ञापन चालू / अपडेट करें
          </button>
        </div>

        {/* 4. अपना गुप्त PIN बदलें */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-5">
          <h3 className="font-bold text-amber-400 mb-2">🔑 अपना गुप्त PIN बदलें</h3>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="नया PIN लिखें"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-zinc-800 border border-zinc-700"
            />
            <button onClick={handleChangePin} className="px-4 py-2 bg-zinc-700 text-white font-bold rounded-lg">बदलें</button>
          </div>
        </div>

        {/* 5. पेमेंट रिक्वेस्ट (Withdrawals) */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-5">
          <h3 className="font-bold text-amber-400 mb-3">💸 क्रिएटर्स की पेमेंट रिक्वेस्ट</h3>
          {withdrawals.length === 0 ? (
            <p className="text-xs text-zinc-500">अभी कोई पेमेंट रिक्वेस्ट नहीं आई है।</p>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg mb-2">
                <div>
                  <p className="font-bold text-sm">₹{w.amount} — {w.upi_id}</p>
                  <p className="text-xs text-zinc-400">स्थिति: {w.status}</p>
                </div>
                {w.status !== 'paid' && (
                  <button onClick={() => handleMarkPaid(w.id)} className="px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-lg">
                    Paid करें
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* 6. सभी वीडियो कंट्रोल */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <h3 className="font-bold text-amber-400 mb-3">🎬 अपलोड किए गए सभी वीडियो</h3>
          {videos.length === 0 ? (
            <p className="text-xs text-zinc-500">अभी डेटाबेस में कोई वीडियो नहीं है।</p>
          ) : (
            videos.map((v) => (
              <div key={v.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg mb-2">
                <div>
                  <p className="font-semibold text-sm">{v.title}</p>
                  <p className="text-xs text-zinc-400">व्यूज़: {v.views || 0} | प्रकार: {v.video_type}</p>
                </div>
                <button onClick={() => handleDeleteVideo(v.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg">
                  हटाएं
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
            }
