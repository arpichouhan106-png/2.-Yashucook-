import React, { useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function RealVideoUploader({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('नाश्ता (Breakfast)');
  const [videoType, setVideoType] = useState<'short' | 'long'>('short');
  const [file, setFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filter, setFilter] = useState('none');
  const [uploading, setUploading] = useState(false);

  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const thmRef = useRef<HTMLInputElement>(null);

  const onPickVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.item(0);
    if (f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
  };

  const onPickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.files?.item(0);
    if (t) setThumbFile(t);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return alert('शीर्षक और वीडियो दोनों चुनें!');
    setUploading(true);
    try {
      const vName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error } = await supabase.storage.from('videos').upload(vName, file);
      if (error) throw error;
      const vUrl = supabase.storage.from('videos').getPublicUrl(vName).data.publicUrl;

      let tUrl = '';
      if (thumbFile) {
        const tName = `thumb_${Date.now()}_${thumbFile.name.replace(/\s+/g, '_')}`;
        await supabase.storage.from('videos').upload(tName, thumbFile);
        tUrl = supabase.storage.from('videos').getPublicUrl(tName).data.publicUrl;
      }

      await supabase.from('videos').insert([{
        title: title.trim(), description: description.trim(), category,
        thumbnail_url: tUrl, video_type: videoType, video_url: vUrl, views: 0
      }]);
      alert('वीडियो विवरण व थंबनेल सहित अपलोड हो गया!');
      window.location.reload();
    } catch (e: any) {
      alert('त्रुटि: ' + e.message);
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-md mx-auto pb-20 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h2 className="font-bold text-amber-400">📹 वीडियो अपलोड करें</h2>
          <button onClick={onClose} className="px-3 py-1 bg-zinc-800 rounded text-xs">बंद करें</button>
        </div>

        <input ref={camRef} type="file" accept="video/*" capture="environment" onChange={onPickVideo} className="hidden" />
        <input ref={galRef} type="file" accept="video/*" onChange={onPickVideo} className="hidden" />
        <input ref={thmRef} type="file" accept="image/*" onChange={onPickThumb} className="hidden" />

        {!previewUrl ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => camRef.current?.click()} className="p-5 rounded-xl bg-amber-500 text-black font-bold">📷 कैमरा</button>
            <button onClick={() => galRef.current?.click()} className="p-5 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-400 font-bold">🖼️ गैलरी</button>
          </div>
        ) : (
          <div className="space-y-2">
            <video src={previewUrl} controls style={{ filter }} className="w-full max-h-52 rounded-xl bg-black" />
            <div className="flex gap-2 overflow-x-auto">
              {[{ n: 'असली', v: 'none' }, { n: 'ताज़ा', v: 'saturate(1.4)' }, { n: 'चमकदार', v: 'brightness(1.2)' }].map((f) => (
                <button key={f.n} onClick={() => setFilter(f.v)} className={`px-3 py-1 rounded text-xs ${filter === f.v ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800'}`}>{f.n}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded-xl">
          <span className="text-xs text-amber-400">🖼️ {thumbFile ? thumbFile.name : 'थंबनेल फोटो चुनें'}</span>
          <button onClick={() => thmRef.current?.click()} className="px-3 py-1 bg-zinc-800 rounded text-xs">फोटो चुनें</button>
        </div>

        <input type="text" placeholder="शीर्षक (Title) *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm" />
        <textarea rows={3} placeholder="विवरण (Description - सामग्री व विधि)..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm">
          <option>नाश्ता (Breakfast)</option><option>सब्जी व दाल (Main Course)</option><option>मिठाई (Sweets)</option><option>स्ट्रीट फूड (Street Food)</option>
        </select>

        <div className="flex gap-2">
          <button onClick={() => setVideoType('short')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${videoType === 'short' ? 'bg-amber-500 text-black' : 'bg-zinc-900'}`}>📱 Short</button>
          <button onClick={() => setVideoType('long')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${videoType === 'long' ? 'bg-amber-500 text-black' : 'bg-zinc-900'}`}>🎬 Long Video</button>
        </div>

        <button onClick={handleUpload} disabled={uploading} className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm">
          {uploading ? 'अपलोड हो रहा है...' : '🚀 पब्लिश करें'}
        </button>
      </div>
    </div>
  );
          }
