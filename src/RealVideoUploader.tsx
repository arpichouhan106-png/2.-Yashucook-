import React, { useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function RealVideoUploader({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('नाश्ता');
  const [foodType, setFoodType] = useState('Veg');
  const [vType, setVType] = useState('short');
  const [desc, setDesc] = useState('');
  const [filter, setFilter] = useState('none');
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const vRef = useRef<HTMLVideoElement | null>(null);
  const mRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (vRef.current) { vRef.current.srcObject = stream; vRef.current.play(); }
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        setFile(new File([blob], `yashucook_${Date.now()}.webm`, { type: 'video/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(); mRef.current = mr; setRec(true);
    } catch { alert('कृपया कैमरा और माइक (आवाज़) की अनुमति दें!'); }
  };

  const stopCam = () => { mRef.current?.stop(); setRec(false); };

  const upload = async () => {
    if (!file || !title.trim()) return alert('वीडियो और रेसिपी का नाम ज़रूरी है!');
    setBusy(true);
    try {
      const fName = `v_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error: upErr } = await supabase.storage.from('videos').upload(fName, file);
      const vUrl = upErr ? URL.createObjectURL(file) : supabase.storage.from('videos').getPublicUrl(fName).data.publicUrl;
      await supabase.from('videos').insert([{ title, category: cat, food_type: foodType, video_type: vType, video_url: vUrl, description: desc, views: 0 }]);
      alert('🎉 आपका वीडियो (आवाज़ सहित) सफलतापूर्वक अपलोड हो गया!');
      onClose();
    } catch (e: any) { alert('एरर: ' + e.message); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-md mx-auto bg-zinc-900 p-4 rounded-2xl border border-amber-500/40 space-y-3">
        <div className="flex justify-between"><h2 className="font-bold text-amber-400">🎬 वीडियो बनाएं / अपलोड करें</h2><button onClick={onClose} className="bg-red-600 px-2.5 py-1 rounded text-xs">बंद</button></div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {!rec ? <button onClick={startCam} className="p-2.5 bg-red-600 rounded-xl font-bold">📹 कैमरा + आवाज़ रिकॉर्ड</button> : <button onClick={stopCam} className="p-2.5 bg-amber-500 text-black rounded-xl font-bold">⏹️ रिकॉर्डिंग रोकें</button>}
          <label className="p-2.5 bg-zinc-800 rounded-xl font-bold text-center cursor-pointer">📁 गैलरी से चुनें<input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" /></label>
        </div>

        <video ref={vRef} muted className={`w-full h-40 bg-black rounded-xl ${rec ? 'block' : 'hidden'}`} style={{ filter }} />
        {file && <p className="text-xs text-emerald-400">✅ वीडियो तैयार है: {file.name}</p>}

        <div className="flex gap-2 text-xs">
          <button onClick={() => setVType('short')} className={`flex-1 py-2 rounded-lg font-bold ${vType === 'short' ? 'bg-amber-500 text-black' : 'bg-zinc-800'}`}>📱 Short (Reel)</button>
          <button onClick={() => setVType('long')} className={`flex-1 py-2 rounded-lg font-bold ${vType === 'long' ? 'bg-amber-500 text-black' : 'bg-zinc-800'}`}>🎬 Long Video</button>
        </div>

        <div className="flex gap-2 text-xs">
          <button onClick={() => setFoodType('Veg')} className={`flex-1 py-2 rounded-lg font-bold ${foodType === 'Veg' ? 'bg-emerald-500 text-black' : 'bg-zinc-800'}`}>🟢 Veg</button>
          <button onClick={() => setFoodType('Non-Veg')} className={`flex-1 py-2 rounded-lg font-bold ${foodType === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-zinc-800'}`}>🔴 Non-Veg</button>
        </div>

        <div className="flex gap-1.5 text-[10px]">
          {[['none', 'सामान्य'], ['contrast(1.2) saturate(1.3)', 'चमकदार'], ['sepia(0.3)', 'गोल्डन']].map(([f, nm]) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded ${filter === f ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800'}`}>✨ {nm}</button>
          ))}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="रेसिपी का नाम लिखें..." className="w-full p-2.5 rounded-xl bg-zinc-800 text-sm" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full p-2.5 rounded-xl bg-zinc-800 text-sm">
          <option value="नाश्ता">नाश्ता</option><option value="सब्जी">सब्जी</option><option value="मिठाई">मिठाई</option><option value="स्ट्रीट फूड">स्ट्रीट फूड</option><option value="जंक फूड">जंक फूड</option>
          
        </select>
        <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="सामग्री और बनाने की विधि लिखें..." className="w-full p-2.5 rounded-xl bg-zinc-800 text-sm" />
        <button onClick={upload} disabled={busy} className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm">{busy ? 'अपलोड हो रहा है...' : '🚀 वीडियो अपलोड करें'}</button>
      </div>
    </div>
  );
                                             }
        
