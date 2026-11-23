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
  const [thumbPreview, setThumbPreview] = useState('');
  const [filter, setFilter] = useState('none');
  const [startTime, setStartTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setThumbFile(selected);
      setThumbPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      alert('कृपया रेसिपी का शीर्षक (Title) लिखें और वीडियो चुनें!');
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { contentType: file.type || 'video/mp4' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName);

      let finalThumbUrl = '';
      if (thumbFile) {
        const tExt = thumbFile.name.split('.').pop() || 'jpg';
        const tName = `thumb_${Date.now()}.${tExt}`;
        await supabase.storage.from('videos').upload(tName, thumbFile, { contentType: thumbFile.type || 'image/jpeg' });
        const { data: tUrlData } = supabase.storage.from('videos').getPublicUrl(tName);
        finalThumbUrl = tUrlData.publicUrl;
      }

      await supabase.from('videos').insert([{
        title: title.trim(),
        description: description.trim(),
        category,
        thumbnail_url: finalThumbUrl,
        video_type: videoType,
        video_url: urlData.publicUrl,
        views: 0
      }]);

      alert('बधाई हो! आपका रेसिपी वीडियो पूरी डिटेल्स और थंबनेल के साथ अपलोड हो गया है!');
      window.location.reload();
    } catch (err: any) {
      alert('अपलोड में समस्या आई: ' + (err.message || 'दोबारा प्रयास करें'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-md mx-auto pb-24 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-amber-400">📹 वीडियो अपलोड करें (YouTube Studio जैसा)</h2>
          <button onClick={onClose} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs">बंद करें</button>
        </div>

        <input ref={cameraInputRef} type="file" accept="video/*" capture="environment" onChange={handleFileSelect} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
        <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbSelect} className="hidden" />

        {!previewUrl ? (
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-black font-bold flex flex-col items-center gap-2 shadow-lg"
            >
              <span className="text-3xl">📷</span>
              <span>कैमरे से रिकॉर्ड करें</span>
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/40 text-amber-400 font-bold flex flex-col items-center gap-2"
            >
              <span className="text-3xl">🖼️</span>
              <span>गैलरी से चुनें</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <video
              src={`${previewUrl}#t=${startTime}`}
              controls
              style={{ filter }}
              className="w-full max-h-60 rounded-xl bg-black border border-zinc-800"
            />

            <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
              <p className="text-xs font-bold text-amber-400">✨ वीडियो फ़िल्टर</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { name: 'असली', val: 'none' },
                  { name: 'ताज़ा (Fresh)', val: 'saturate(1.4) contrast(1.1)' },
                  { name: 'सुनहरा (Warm)', val: 'sepia(0.25) saturate(1.3)' },
                  { name: 'चमकदार (Bright)', val: 'brightness(1.2) contrast(1.1)' },
                ].map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setFilter(f.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === f.val ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-800'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 p-3 rounded-xl space-y-1">
              <p className="text-xs font-bold text-amber-400">✂️ शुरुआत से काटें (Start Trim: {startTime} सेकंड)</p>
              <input
                type="range"
                min={0}
                max={30}
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <button onClick={() => { setPreviewUrl(''); setFile(null); }} className="text-xs text-red-400 underline">
              दूसरा वीडियो चुनें
            </button>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400">🖼️ थंबनेल (Thumbnail / कवर फोटो)</p>
              <p className="text-[11px] text-zinc-400">{thumbFile ? thumbFile.name : 'रेसिपी की आकर्षक फोटो चुनें'}</p>
            </div>
            <button onClick={() => thumbInputRef.current?.click()} className="px-3 py-1.5 bg-zinc-800 border border-amber-500/40 rounded-lg text-xs text-amber-400 font-bold">
              फोटो चुनें
            </button>
          </div>
          {thumbPreview && <img src={thumbPreview} alt="Thumbnail" className="w-full h-36 object-cover rounded-xl border border-zinc-700" />}

          <div>
            <label className="text-xs text-zinc-400 block mb-1">शीर्षक (Title) *</label>
            <input
              type="text"
              placeholder="जैसे: 5 मिनट में बनाएं इंदौरी पोहा रेसिपी"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">विवरण (Description - सामग्री व बनाने की विधि)</label>
            <textarea
              rows={4}
              placeholder="सामग्री (Ingredients) और स्टेप-बाय-स्टेप बनाने का तरीका यहाँ लिखें..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">श्रेणी (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white"
            >
              <option>नाश्ता (Breakfast)</option>
              <option>सब्जी व दाल (Main Course)</option>
              <option>मिठाई (Sweets & Desserts)</option>
              <option>स्ट्रीट फूड (Street Food)</option>
              <option>हेल्दी व डाइट (Healthy Food)</option>
              <option>ड्रिंक्स व शरबत (Beverages)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setVideoType('short')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${videoType === 'short' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-700'}`}
            >
              📱 Short वीडियो (Reels)
            </button>
            <button
              onClick={() => setVideoType('long')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${videoType === 'long' ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-zinc-700'}`}
            >
              🎬 लंबी रेसिपी वीडियो
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-bold text-sm shadow-lg"
          >
    
