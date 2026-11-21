import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Film, Utensils, Wallet, MessageSquare, HelpCircle, Upload, 
  User, Search, CheckCircle, AlertTriangle, ShieldCheck, Award, 
  DollarSign, Share2, Download, RefreshCw, X, ChevronRight, 
  Send, Sparkles, Lock, LogOut, Heart, Flame, Clock, CheckSquare, Square, Settings
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  tier: string;
  followers_count: number;
  is_creator: number;
}

interface WalletData {
  user_id: string;
  balance: number;
  total_earned: number;
  upi_id: string;
  bank_account: string;
}

interface Video {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail: string;
  type: 'short' | 'long';
  duration: number;
  ingredients: string;
  steps: string;
  views: number;
  genuine_views: number;
  watch_hours: number;
  likes: number;
  reports_count: number;
  creator_name: string;
  creator_avatar: string;
  creator_tier: string;
  followers_count: number;
}

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState<'input' | 'otp'>('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'fridge' | 'upload' | 'dashboard' | 'wallet' | 'chat' | 'help' | 'converter'>('home');
  const [videoFilter, setVideoFilter] = useState<'all' | 'short' | 'long'>('all');

  // Video Player & Ads state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [freeLifeCount, setFreeLifeCount] = useState(3);
  const [adFreeUntil, setAdFreeUntil] = useState<number>(0);
  const [walletAdShown, setWalletAdShown] = useState(false);

  // Shopping list state
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);

  // Offline step-by-step mode state
  const [offlineMode, setOfflineMode] = useState(false);

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Stolen or plagiarized video');

  // Creator dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  // Fridge AI Cook state
  const [fridgeIngredients, setFridgeIngredients] = useState('');
  const [aiRecipe, setAiRecipe] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState<'short' | 'long'>('short');
  const [uploadDuration, setUploadDuration] = useState('45');
  const [uploadVideoUrl, setUploadVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-in-a-kitchen-43187-large.mp4');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [uploadIngredients, setUploadIngredients] = useState('');
  const [uploadSteps, setUploadSteps] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [kycName, setKycName] = useState('');
  const [kycPan, setKycPan] = useState('');

  // Unit Converter state
  const [convVal, setConvVal] = useState('1');
  const [convType, setConvType] = useState<'g_to_cup' | 'ml_to_oz' | 'c_to_f'>('g_to_cup');

  // Videos list
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Device & IP fingerprinting
  const [deviceId] = useState(() => 'dev_' + Math.random().toString(36).substring(2, 9));
  const [ipAddress] = useState('192.168.1.55');

  // Initial login with demo user u1
  useEffect(() => {
    fetchUser('u1');
    fetchVideos();
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setWallet(data.wallet);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setAuthError('Please enter Mobile Number or Gmail');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep('otp');
        setAuthError('');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Network error during login');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, device_id: deviceId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        fetchUser(data.user.id);
        setAuthModalOpen(false);
        setAuthStep('input');
        setOtp('');
        setIdentifier('');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Verification failed');
    }
  };

  // Trigger video playback with ad frequency check
  const openVideoPlayer = (vid: Video) => {
    setSelectedVideo(vid);
    // Check if ad-free viewing is active (30 mins)
    const now = Date.now();
    if (now > adFreeUntil) {
      if (freeLifeCount > 0) {
        setFreeLifeCount(prev => prev - 1);
      } else {
        triggerAdModal();
      }
    }
  };

  const triggerAdModal = () => {
    setAdModalOpen(true);
    setAdCountdown(5);
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishAd = () => {
    setAdModalOpen(false);
    setAdFreeUntil(Date.now() + 15 * 60 * 1000); // 15 mins ad-free
    setFreeLifeCount(3); // reset free life
  };

  // Log watch view & anti-fraud check
  const recordWatch = async (vidId: string, durationWatched: number) => {
    if (!currentUser) return;
    try {
      await fetch(`/api/videos/${vidId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          device_id: deviceId,
          ip_address: ipAddress,
          watch_duration: durationWatched
        })
      });
      fetchVideos();
    } catch (e) {
      console.error(e);
    }
  };

  // Wallet tab click handler for Ad frequency capping (2 hours)
  const handleWalletTabClick = () => {
    setActiveTab('wallet');
    fetchUser(currentUser?.id || 'u1');
    fetchTransactions();
    
    // Check 2-hour wallet ad frequency capping
    const lastWalletAd = Number(localStorage.getItem('last_wallet_ad_time') || 0);
    const now = Date.now();
    if (now - lastWalletAd > 2 * 60 * 60 * 1000) {
      setWalletAdShown(true);
      localStorage.setItem('last_wallet_ad_time', now.toString());
      setAdCountdown(5);
      const timer = setInterval(() => {
        setAdCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const [transactions, setTransactions] = useState<any[]>([]);
  const fetchTransactions = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/wallet/${currentUser.id}/transactions`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdraw = async (amount: number, upi: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, amount, upi_id: upi })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchUser(currentUser.id);
        fetchTransactions();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Withdrawal request failed');
    }
  };

  const fetchCreatorDashboard = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/creators/${currentUser.id}/dashboard`);
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setChatMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_avatar: currentUser.avatar,
          message: newMessage
        })
      });
      setNewMessage('');
      fetchChat();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTickets = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tickets/${currentUser.id}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ticketSubject || !ticketMessage) return;
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, subject: ticketSubject, message: ticketMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert('Ticket submitted successfully! Our support team will respond within 24-48 hours.');
        setTicketSubject('');
        setTicketMessage('');
        fetchTickets();
      }
    } catch (e) {
      alert('Failed to submit ticket');
    }
  };

  const runAiFridgeCook = async () => {
    if (!fridgeIngredients.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/fridge-cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: fridgeIngredients })
      });
      const data = await res.json();
      setAiRecipe(data.recipe);
    } catch (e) {
      alert('AI Fridge Cook failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setUploadError('');
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_id: currentUser.id,
          title: uploadTitle,
          description: uploadDesc,
          video_url: uploadVideoUrl,
          thumbnail: uploadThumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
          type: uploadType,
          duration: Number(uploadDuration),
          ingredients: uploadIngredients,
          steps: uploadSteps
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Video uploaded successfully and verified by AI Content Filter!');
        setActiveTab('home');
        fetchVideos();
        setUploadTitle('');
        setUploadDesc('');
        setUploadIngredients('');
        setUploadSteps('');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (e) {
      setUploadError('AI Content Filter rejected upload or network error');
    }
  };

  const reportVideoSubmit = async () => {
    if (!selectedVideo || !currentUser) return;
    try {
      const res = await fetch(`/api/videos/${selectedVideo.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, reason: reportReason })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setReportModalOpen(false);
      }
    } catch (e) {
      alert('Report failed');
    }
  };

  const addToShoppingList = (ingredientsStr: string) => {
    const items = ingredientsStr.split(',').map(i => i.trim()).filter(Boolean);
    setShoppingList(prev => Array.from(new Set([...prev, ...items])));
    setShowShoppingModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-xl text-white shadow-lg shadow-orange-500/30">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Yashucook
            </h1>
            <p className="text-xs text-slate-400 font-medium">Culinary Ecosystem & Creator Hub</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition border border-slate-700 flex items-center space-x-1.5 px-3"
            title="Settings & Dashboard"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Settings</span>
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full py-1 px-3">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-amber-400 font-semibold">{currentUser.tier}</p>
              </div>
              <button 
                onClick={() => { setCurrentUser(null); setAuthModalOpen(true); }}
                className="text-slate-400 hover:text-red-400 ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-90 transition"
            >
              Secure Login / OTP
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4">
        {/* HOME / FEED */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Banner & Quick Switch */}
            <div className="bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <span className="inline-flex items-center space-x-1 bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Anti-Fraud & Monetization Live
                </span>
                <h2 className="text-2xl font-black text-white">Cook, Create & Earn up to ₹10 per 1,000 Views</h2>
                <p className="text-sm text-slate-300 mt-1 max-w-lg">
                  Short Videos (Reels): ₹5 per 1,000 views • Long Videos: ₹10 per 1,000 views. Watch genuine culinary recipes and grow your Chef Tier!
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button 
                    onClick={() => setActiveTab('fridge')}
                    className="bg-amber-500 text-slate-950 font-bold text-sm px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg hover:bg-amber-400 transition"
                  >
                    <Sparkles className="w-4 h-4" /> AI Fridge Cook Search
                  </button>
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-slate-800 text-white border border-slate-700 font-bold text-sm px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-slate-700 transition"
                  >
                    <Upload className="w-4 h-4 text-orange-400" /> Upload Recipe
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => setVideoFilter('all')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${videoFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  All Recipes
                </button>
                <button
                  onClick={() => setVideoFilter('short')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${videoFilter === 'short' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  Shorts (Reels)
                </button>
                <button
                  onClick={() => setVideoFilter('long')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${videoFilter === 'long' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  Long Recipes
                </button>
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Max 1m Shorts / 15m Long</span>
            </div>

            {/* Video Cards Grid */}
            {loadingVideos ? (
              <div className="text-center py-12 text-slate-400">Loading delicious recipes...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {videos
                  .filter(v => videoFilter === 'all' || v.type === videoFilter)
                  .map(vid => (
                    <div 
                      key={vid.id}
                      onClick={() => openVideoPlayer(vid)}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition cursor-pointer group flex flex-col"
                    >
                      <div className="relative aspect-video bg-slate-950">
                        <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${vid.type === 'short' ? 'bg-pink-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                          {vid.type === 'short' ? '⚡ Short Reel' : '📖 Long Video'}
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                          <span className="flex items-center bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> {Math.floor(vid.duration / 60)}m {vid.duration % 60}s
                          </span>
                          <span className="flex items-center bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <Flame className="w-3.5 h-3.5 mr-1 text-orange-400" /> {vid.views} views
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition line-clamp-2">{vid.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{vid.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={vid.creator_avatar} alt={vid.creator_name} className="w-7 h-7 rounded-full object-cover border border-amber-500/40" />
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{vid.creator_name}</p>
                              <p className="text-[10px] text-amber-400 font-medium">{vid.creator_tier}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl font-bold">
                            Watch & Cook
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* AI FRIDGE COOK SEARCH */}
        {activeTab === 'fridge' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                AI Powered Kitchen Assistant
              </span>
              <h2 className="text-2xl font-black mt-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                AI Fridge Cook Search
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Type what ingredients you have left in your fridge or pantry, and our AI will immediately generate a delicious custom recipe!
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Available Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={fridgeIngredients}
                  onChange={e => setFridgeIngredients(e.target.value)}
                  placeholder="e.g. Paneer, tomatoes, garlic, butter, leftover rice"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={runAiFridgeCook}
                disabled={aiLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center space-x-2"
              >
                {aiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{aiLoading ? 'Crafting Recipe...' : 'Generate Fridge Recipe'}</span>
              </button>
            </div>

            {aiRecipe && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 mt-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xl font-bold text-amber-400">{aiRecipe.title}</h3>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-semibold">
                    ⏱️ {aiRecipe.cookingTime}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{aiRecipe.description}</p>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Ingredients Needed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiRecipe.ingredients?.map((ing: string, i: number) => (
                      <span key={i} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-1 rounded-lg">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Step-by-Step Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    {aiRecipe.steps?.map((step: string, i: number) => (
                      <li key={i} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">{step}</li>
                    ))}
                  </ol>
                </div>
                <button
                  onClick={() => addToShoppingList(aiRecipe.ingredients.join(', '))}
                  className="w-full bg-slate-900 border border-amber-500/40 text-amber-400 font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
                >
                  🛒 Add Ingredients to Smart Shopping List
                </button>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD RECIPE */}
        {activeTab === 'upload' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
            <div>
              <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
                Creator Ecosystem
              </span>
              <h2 className="text-2xl font-black mt-2 text-white">Upload New Recipe Video</h2>
              <p className="text-xs text-slate-400 mt-1">
                Short videos (max 1 min) & Long videos (max 15 mins). AI Content Filter ensures strict food relevance.
              </p>
            </div>

            {uploadError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Recipe Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Crispy Honey Chilli Potato in 5 Mins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Format</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="short">Short Reel (Max 60s)</option>
                    <option value="long">Long Video (Max 900s)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    required
                    value={uploadDuration}
                    onChange={e => setUploadDuration(e.target.value)}
                    max={uploadType === 'short' ? 60 : 900}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={uploadDesc}
                  onChange={e => setUploadDesc(e.target.value)}
                  placeholder="Write a brief intro about your recipe..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Ingredients (comma separated)</label>
                <input
                  type="text"
                  required
                  value={uploadIngredients}
                  onChange={e => setUploadIngredients(e.target.value)}
                  placeholder="Potato, Honey, Chilli sauce, Garlic, Sesame seeds"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Step-by-Step Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={uploadSteps}
                  onChange={e => setUploadSteps(e.target.value)}
                  placeholder="1. Chop potatoes. 2. Fry till golden..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Stream URL (MP4)</label>
                <input
                  type="text"
                  required
                  value={uploadVideoUrl}
                  onChange={e => setUploadVideoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Publish Recipe with AI Content Verification</span>
              </button>
            </form>
          </div>
        )}

        {/* CREATOR DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img src={currentUser?.avatar} alt={currentUser?.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500" />
                <div>
                  <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
                  <p className="text-xs text-amber-400 font-semibold">{currentUser?.tier} Tier Creator</p>
                  <p className="text-xs text-slate-400 mt-1">Followers: {currentUser?.followers_count || 1420}</p>
                </div>
              </div>
              <button
                onClick={fetchCreatorDashboard}
                className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Refresh Live Metrics</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-slate-400 font-medium">Short Video Views</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{dashboardData?.stats?.short_genuine_views || 2400}</p>
                <span className="text-[10px] text-amber-400/80">Rate: ₹5 / 1k views</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-slate-400 font-medium">Long Video Views</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{dashboardData?.stats?.long_genuine_views || 3500}</p>
                <span className="text-[10px] text-emerald-400/80">Rate: ₹10 / 1k views</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-slate-400 font-medium">Watch Hours</p>
                <p className="text-2xl font-black text-orange-400 mt-1">{Math.round((dashboardData?.stats?.total_watch_hours || 203.8) * 10) / 10}h</p>
                <span className="text-[10px] text-slate-500">Milestone: 2h req.</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-slate-400 font-medium">Earnings Status</p>
                <p className={`text-sm font-extrabold mt-2 px-2.5 py-1 rounded-lg inline-block ${dashboardData?.isMonetized !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'}`}>
                  {dashboardData?.isMonetized !== false ? '✅ Monetization Active' : '⏳ Building Criteria'}
                </p>
              </div>
            </div>

            {/* Earnings rule card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>Tiered Monetization & Payout Rules</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li>Short Videos (Reels / under 1 min): <strong className="text-amber-400">₹5 per 1,000 genuine views</strong>.</li>
                <li>Long Videos (1 to 15 mins): <strong className="text-amber-400">₹10 per 1,000 genuine views</strong>.</li>
                <li>Monetization activates strictly after reaching <strong className="text-amber-400">500 genuine views</strong> and <strong className="text-amber-400">2 hours of total watch time</strong>.</li>
                <li>Views are counted only if watch duration exceeds <strong className="text-amber-400">75% of video length</strong>.</li>
                <li>Creator's own views are capped at 1. Repetitive bot refreshes are automatically blocked by the Anti-Fraud Engine.</li>
                <li>Minimum withdrawal threshold is strictly <strong className="text-amber-400">₹159</strong>.</li>
              </ul>
            </div>
          </div>
        )}

        {/* WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Available Wallet Balance</p>
                  <p className="text-3xl font-black text-amber-400 mt-1">₹{wallet?.balance?.toFixed(2) || '450.50'}</p>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
                  <Wallet className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Total Lifetime Earned: ₹{wallet?.total_earned?.toFixed(2) || '1200.00'}</span>
                <span className="text-amber-400 font-bold">Min Payout: ₹159</span>
              </div>
            </div>

            {/* Withdrawal form with Co-located KYC */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Secure Payout via UPI / Bank Account</h3>
              <p className="text-xs text-slate-400">Basic KYC (Full Legal Name & PAN) required upon first ₹159 withdrawal.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Legal Name (KYC)</label>
                  <input
                    type="text"
                    value={kycName}
                    onChange={e => setKycName(e.target.value)}
                    placeholder="e.g. Yashu Chauhan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">PAN Card Number (KYC)</label>
                  <input
                    type="text"
                    value={kycPan}
                    onChange={e => setKycPan(e.target.value)}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-xs uppercase focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Linked UPI ID</label>
                  <input
                    type="text"
                    defaultValue={wallet?.upi_id || 'yashu@okhdfcbank'}
                    id="upi_input"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    defaultValue="159"
                    id="withdraw_amount"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={async () => {
                    const amt = Number((document.getElementById('withdraw_amount') as HTMLInputElement).value);
                    const upi = (document.getElementById('upi_input') as HTMLInputElement).value;
                    if (currentUser && kycName && kycPan) {
                      try {
                        await fetch(`/api/users/${currentUser.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ kyc_name: kycName, kyc_pan: kycPan })
                        });
                        await fetchUser(currentUser.id);
                      } catch (e) {}
                    }
                    handleWithdraw(amt, upi);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                  Withdraw to UPI (Min ₹159)
                </button>
              </div>
            </div>

            {/* Phase 2 Ad-Free Subscription Scalability */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Ad-Free Subscription (Phase 2)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Enjoy zero video ads and premium master chef badges.</p>
                </div>
                <button 
                  onClick={() => alert('Phase 2 Ad-Free Subscription model is ready for activation once popular!')}
                  className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-500/30 transition"
                >
                  Subscribe ₹99/mo
                </button>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400">No recent payout transactions.</p>
                ) : (
                  transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{tx.description}</p>
                        <p className="text-[10px] text-slate-500">{tx.created_at}</p>
                      </div>
                      <span className="font-bold text-red-400">-₹{tx.amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* COMMUNITY CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto flex flex-col h-[600px]">
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>Foodie Community Chat</span>
              </h2>
              <p className="text-xs text-slate-400">Share culinary tips, recipe feedback, and connect with chefs.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {chatMessages.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm">No chat messages yet. Say hello to the community!</div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="flex items-start space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <img src={msg.user_avatar} alt={msg.user_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-400">{msg.user_name}</span>
                        <span className="text-[10px] text-slate-500">{msg.created_at}</span>
                      </div>
                      <p className="text-sm text-slate-200 mt-1">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChatMessage} className="mt-4 flex space-x-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message to foodies..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-500 text-slate-950 font-bold px-5 py-3 rounded-xl hover:bg-amber-400 transition flex items-center justify-center shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* HELP CENTER & TICKETS */}
        {activeTab === 'help' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                  Native In-App Support
                </span>
                <h2 className="text-2xl font-black mt-2 text-white">Help Center & Support Tickets</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Send your queries directly to our admin panel. Guaranteed response time within 24-48 hours.
                </p>
              </div>

              <form onSubmit={createTicket} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="e.g. Wallet payout inquiry or video moderation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Message / Issue Details</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                  Submit Support Ticket (24-48h Response)
                </button>
              </form>
            </div>

            {/* Existing Tickets */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white">Your Support Tickets</h3>
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400">No support tickets submitted yet.</p>
                ) : (
                  tickets.map(tkt => (
                    <div key={tkt.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-400">{tkt.subject}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full uppercase font-bold">{tkt.status}</span>
                      </div>
                      <p className="text-xs text-slate-300">{tkt.message}</p>
                      <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 bg-slate-900/50 p-2.5 rounded-lg">
                        <strong className="text-amber-400">Admin Response:</strong> {tkt.admin_response}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* COOKING UNIT CONVERTER */}
        {activeTab === 'converter' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-md mx-auto space-y-6">
            <div className="text-center">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                Kitchen Tool
              </span>
              <h2 className="text-2xl font-black mt-2 text-white">Cooking Unit Converter</h2>
              <p className="text-xs text-slate-400 mt-1">Convert grams, cups, ml, and temperature effortlessly.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Conversion Type</label>
                <select
                  value={convType}
                  onChange={e => setConvType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="g_to_cup">Grams to Cups (Flour/Sugar)</option>
                  <option value="ml_to_oz">Milliliters to Fluid Ounces</option>
                  <option value="c_to_f">Celsius to Fahrenheit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Enter Value</label>
                <input
                  type="number"
                  value={convVal}
                  onChange={e => setConvVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">Converted Result</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {convType === 'g_to_cup' && `${(Number(convVal) / 125).toFixed(2)} Cups`}
                  {convType === 'ml_to_oz' && `${(Number(convVal) * 0.033814).toFixed(2)} fl oz`}
                  {convType === 'c_to_f' && `${(Number(convVal) * 9/5 + 32).toFixed(1)} °F`}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-base text-white truncate">{selectedVideo.title}</h3>
              <button
                onClick={() => {
                  recordWatch(selectedVideo.id, 40); // record watch duration
                  setSelectedVideo(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player & Offline Mode Toggle */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onEnded={() => recordWatch(selectedVideo.id, selectedVideo.duration)}
              ></video>
              
              {offlineMode && (
                <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  📶 Offline Step-by-Step Mode Active
                </div>
              )}
            </div>

            {/* Details & Actions */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={selectedVideo.creator_avatar} alt={selectedVideo.creator_name} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{selectedVideo.creator_name}</h4>
                    <p className="text-xs text-amber-400 font-medium">{selectedVideo.creator_tier} • {selectedVideo.followers_count} Followers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addToShoppingList(selectedVideo.ingredients)}
                    className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg hover:bg-amber-400 transition"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Smart Shopping List</span>
                  </button>
                  <button
                    onClick={() => setOfflineMode(!offlineMode)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-700 transition flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>{offlineMode ? 'Exit Offline' : 'Offline Mode'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300">{selectedVideo.description}</p>

              {/* Ingredients & Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <h5 className="text-xs font-bold text-amber-400 uppercase mb-1.5">Ingredients</h5>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-line">{selectedVideo.ingredients}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-amber-400 uppercase mb-1.5">Recipe Steps</h5>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-line">{selectedVideo.steps}</p>
                </div>
              </div>

              {/* Report Video Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 font-semibold"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Video (Plagiarism / Stolen Content)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REWARDED AD / WALLET AD MODAL */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-5 shadow-2xl animate-fade-in">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              {walletAdShown ? 'Wallet Ad Frequency Capping' : 'Rewarded Interstitial Ad'}
            </span>
            <h3 className="text-2xl font-black text-white">Yashucook Sponsor Reel</h3>
            <p className="text-xs text-slate-300">
              {walletAdShown 
                ? 'Displaying wallet balance ad (Frequency Capping: Once every 2 hours).' 
                : 'Complete this ad to unlock 15 minutes of ad-free viewing and support creators!'}
            </p>
            <div className="bg-slate-950 aspect-video rounded-xl flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-orange-600/20"></div>
              <Utensils className="w-12 h-12 text-amber-400 animate-bounce relative z-10" />
              <p className="text-sm font-bold text-white mt-2 relative z-10">Premium Organic Spice Masala</p>
            </div>
            <div>
              {adCountdown > 0 ? (
                <p className="text-xs text-slate-400">Ad playing... Skip available in <strong className="text-amber-400">{adCountdown}s</strong></p>
              ) : (
                <button
                  onClick={() => { setAdModalOpen(false); setWalletAdShown(false); finishAd(); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                  Close Ad & Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIDEO MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Report Plagiarized or Stolen Video</h3>
            <p className="text-xs text-slate-400">Please select the reason for reporting this video content:</p>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            >
              <option value="Stolen or plagiarized video content">Stolen or plagiarized video content</option>
              <option value="Inappropriate or unsafe cooking practice">Inappropriate or unsafe cooking practice</option>
              <option value="Misleading recipe ingredients">Misleading recipe ingredients</option>
              <option value="Spam or repetitive content">Spam or repetitive content</option>
            </select>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={reportVideoSubmit}
                className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-red-500 transition shadow-lg"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMART SHOPPING LIST MODAL */}
      {showShoppingModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <span>Smart Shopping List</span>
              </h3>
              <button onClick={() => setShowShoppingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Your offline digital grocery checklist compiled from recipe ingredients:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {shoppingList.length === 0 ? (
                <p className="text-xs text-slate-500">Your shopping list is empty.</p>
              ) : (
                shoppingList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-200 font-medium">{item}</span>
                    <button
                      onClick={() => setShoppingList(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  const text = shoppingList.join('\n');
                  navigator.clipboard.writeText(text);
                  alert('Shopping list copied to clipboard!');
                }}
                className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:bg-amber-400 transition flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy & Share List</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Yashucook Secure Login</h3>
              <button onClick={() => setAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs font-semibold">
                {authError}
              </div>
            )}

            {authStep === 'input' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Number or Gmail</label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                  Send OTP Verification
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456 (Demo OTP hint)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center tracking-widest text-lg font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hint: Enter <strong className="text-amber-400">123456</strong> for instant verification.</p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                >
                  Verify & Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${activeTab === 'home' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Play className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('fridge')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${activeTab === 'fridge' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Fridge AI</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${activeTab === 'upload' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Upload className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Upload</span>
        </button>

        <button
          onClick={() => { setActiveTab('chat'); fetchChat(); }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${activeTab === 'chat' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Chat</span>
        </button>

        <button
          onClick={() => setSettingsModalOpen(true)}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${settingsModalOpen ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Settings</span>
        </button>
      </nav>

      {/* SETTINGS MODAL (Dashboard, Wallet, Support, Converter & Account) */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Yashucook Settings Hub</h3>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentUser && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
                <div>
                  <p className="font-bold text-sm text-white">{currentUser.name}</p>
                  <p className="text-xs text-amber-400 font-semibold">{currentUser.tier} • {currentUser.email || currentUser.phone}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => { setActiveTab('dashboard'); fetchCreatorDashboard(); setSettingsModalOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 group-hover:scale-110 transition">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">Creator Dashboard</p>
                    <p className="text-[10px] text-slate-400">Live views, watch hours & monetization status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => { handleWalletTabClick(); setSettingsModalOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 group-hover:scale-110 transition">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">In-App Wallet & Payouts</p>
                    <p className="text-[10px] text-slate-400">UPI withdrawal (Min ₹159 threshold)</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => { setActiveTab('help'); fetchTickets(); setSettingsModalOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:scale-110 transition">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">Help Center & Support Tickets</p>
                    <p className="text-[10px] text-slate-400">24-48 hour admin response time</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => { setActiveTab('converter'); setSettingsModalOpen(false); }}
                className="w-full flex items-center justify-between bg-slate-950 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 group-hover:scale-110 transition">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-200">Cooking Unit Converter</p>
                    <p className="text-[10px] text-slate-400">Grams to cups, ml to oz, temperature</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Play Store Legal & Account Compliance Section */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Legal & Compliance</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert('Yashucook Privacy Policy: We collect device IDs and IP addresses solely for anti-fraud detection, view counting verification, and secure creator payouts.')}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold p-2.5 rounded-xl text-xs border border-slate-800 text-left transition"
                >
                  📄 Privacy Policy
                </button>
                <button
                  onClick={() => alert('Yashucook Terms & Conditions: \n1. Payout Schedule: Monthly on the 25th for creator balances exceeding ₹159.\n2. Anti-Fraud Rules: Bot refreshes, self-views, and multi-device manipulation will forfeit earnings and result in account suspension.')}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold p-2.5 rounded-xl text-xs border border-slate-800 text-left transition"
                >
                  ⚖️ Terms & Conditions
                </button>
              </div>

              {currentUser && (
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your Yashucook account? This action is permanent and cannot be undone.')) {
                      try {
                        await fetch(`/api/users/${currentUser.id}`, { method: 'DELETE' });
                        setCurrentUser(null);
                        setWallet(null);
                        setSettingsModalOpen(false);
                        setAuthModalOpen(true);
                        alert('Account deleted successfully.');
                      } catch (e) {
                        alert('Failed to delete account');
                      }
                    }
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-xs transition border border-red-500/30 flex items-center justify-center space-x-2 mt-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Delete My Account</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
