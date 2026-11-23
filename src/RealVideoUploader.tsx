import React, { useState, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function RealVideoUploader({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [videoType, setVideoType] = useState<'short' | 'long'>('short');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [filter, setFilter] = useState('none');
  const [startTime, setStartTime] = useState(0);
  const [uploading, setUploading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      alert('कृपया रेसिपी का नाम लिखें और वीडियो चुनें!');
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

      await supabase.from('videos').insert([{
        title: title.trim(),
        video_type: videoType,
        video_url: urlData.publicUrl,
        views: 0
      }]);

      alert('बधाई हो! आपका रेसिपी वीडियो सफलतापूर्वक अपलोड हो गया है!');
      window.location.reload();
    } catch (err: any) {
      alert('अपलोड में समस्या आई: ' + (err.message || 'दोबारा प्रयास करें'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto p-4 text-white">
      <div className="max-w-md mx-auto pb-20 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-amber-400">📹 नई रेसिपी वीडियो डालें</h2>
          <button onClick={onClose} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs">बंद करें</button>
        </div>

        {/* छिपे हुए कैमरा और गैलरी इनपुट */}
        <input ref={cameraInputRef} type="file" accept="video/*" capture="environment" onChange={handleFileSelect} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

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
              className="w-full max-h-64 rounded-xl bg-black border border-zinc-800"
            />

            {/* हल्की एडिटिंग: कुकिंग फ़िल्टर */}
            <div className="bg-zinc-900 p-3 rounded-xl space-y-2">
              <p className="text-xs font-bold text-amber-400">✨ वीडियो फ़िल्टर (रंग-रूप सुधारें)</p>
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

            {/* हल्की एडिटिंग: शुरुआत का हिस्सा काटें (Trim) */}
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
          <input
            type="text"
            placeholder="रेसिपी का नाम लिखें (जैसे: इंदौरी पोहा रेसिपी)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm"
          />

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
            {uploading ? 'वीडियो अपलोड हो रहा है... कृपया प्रतीक्षा करें' : '🚀 अभी अपलोड करें'}
          </button>
        </div>
      </div>
    </div>
  );
              }
