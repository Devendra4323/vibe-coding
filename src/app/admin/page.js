'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, MousePointerClick, Lock, PlusCircle, UploadCloud, Film, Tag } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ visitors: 0, botClicks: 0, channelClicks: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category_name: '',
    video_quantity: '',
    original_rate: '',
    discount_percentage: '0'
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formSuccess, setFormSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'ADmin@4321') { 
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Unauthorized Key Pattern!');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnalytics = async () => {
      const { data } = await supabase.from('analytics').select('event_type, timestamp');
      const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = data ? data.filter(item => new Date(item.timestamp) >= past24Hours) : [];
      
      setStats({
        visitors: filtered.filter(i => i.event_type === 'visitor').length,
        botClicks: filtered.filter(i => i.event_type === 'click_bot' || i.event_type === 'click_main_bot' || i.event_type === 'click_card_bot').length,
        channelClicks: filtered.filter(i => i.event_type === 'click_channel' || i.event_type === 'click_main_demo' || i.event_type === 'click_main_admin_chan' || i.event_type === 'click_card_demo').length,
      });
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');

    if (!selectedFile) {
      alert("Please choose a screenshot image file to upload first!");
      return;
    }

    setUploadingFile(true);

    try {
      // 1. Upload the image file to Supabase Storage bucket
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `vault-${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('screenshots')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Generate Public URL for the uploaded image file assets 
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      const computedScreenshotUrl = urlData.publicUrl;

      // 3. Write subscription data records inside database table configuration mappings
      const { error: dbError } = await supabase.from('subscriptions').insert([
        {
          title: formData.title,
          category_name: formData.category_name,
          screenshot_url: computedScreenshotUrl,
          video_quantity: parseInt(formData.video_quantity) || 0,
          original_rate: parseFloat(formData.original_rate) || 0,
          discount_percentage: parseInt(formData.discount_percentage) || 0
        }
      ]);

      if (dbError) throw dbError;

      setFormSuccess('New channel option and device media uploaded successfully!');
      setFormData({ title: '', category_name: '', video_quantity: '', original_rate: '', discount_percentage: '0' });
      setSelectedFile(null);
      // Reset the file input element visually
      document.getElementById('file-picker').value = '';

    } catch (err) {
      alert("System Action Interrupted: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 shadow-2xl border border-purple-950">
          <h2 className="text-xl font-serif text-center text-gray-200 mb-6 tracking-wide">Enter Vault Access Key</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="System Credentials"
              className="w-full px-4 py-3 bg-slate-950 text-white rounded-xl border border-purple-900/50 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {errorMsg && <p className="text-rose-400 text-xs text-center font-medium">{errorMsg}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
              Verify Operations Node
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Dashboard panel */}
        <header className="flex justify-between items-center border-b border-purple-900/40 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-purple-300">Operations Control Deck</h1>
            <p className="text-xs text-purple-400 mt-1">Realtime metric streams and product curation utilities.</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="bg-slate-900 hover:bg-slate-800 text-xs text-gray-400 py-2 px-4 rounded-xl border border-purple-950">
            Secure Out
          </button>
        </header>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">24H Active Views</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.visitors}</h3>
            </div>
          </div>
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Bot Sales Gateway Hits</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.botClicks}</h3>
            </div>
            <MousePointerClick className="text-pink-500/80" size={24} />
          </div>
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Total Conversion Actions</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.channelClicks}</h3>
            </div>
          </div>
        </div>

        {/* Deploy Item Creation Form Interface Layout */}
        <div className="bg-slate-900 border border-purple-900/20 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl">
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
            <PlusCircle className="text-rose-400" size={20} /> Deploy New Channel Vault
          </h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Channel Display Title</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., VIP Platinum Lounge"
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category Group</label>
                <input
                  type="text" required value={formData.category_name}
                  onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                  placeholder="e.g., Premium Amour"
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* NATIVE DEVICE MEDIA FILE PICKER FORM COMPONENT COMPOSITIONS */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                <UploadCloud size={14} className="text-rose-400" /> Upload Channel Proof Screenshot (From Device Media)
              </label>
              <div className="w-full bg-slate-950 border border-dashed border-purple-900/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500/50 transition relative">
                <input 
                  id="file-picker"
                  type="file" 
                  accept="image/*"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <UploadCloud size={32} className="text-neutral-500 mb-2" />
                <span className="text-xs text-neutral-400 text-center">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Click or drag your device media file to attach here"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Film size={12}/> Videos Stored</label>
                <input
                  type="number" required value={formData.video_quantity}
                  onChange={(e) => setFormData({...formData, video_quantity: e.target.value})}
                  placeholder="140"
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1"><Tag size={12}/> Standard Rate ($)</label>
                <input
                  type="number" step="0.01" required value={formData.original_rate}
                  onChange={(e) => setFormData({...formData, original_rate: e.target.value})}
                  placeholder="49.99"
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Promo Discount (%)</label>
                <input
                  type="number" min="0" max="100" value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  placeholder="20"
                  className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {formSuccess && <p className="text-emerald-400 text-xs font-medium text-center">{formSuccess}</p>}

            <button 
              type="submit" 
              disabled={uploadingFile}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
            >
              {uploadingFile ? "Uploading File Data & Broadcasting..." : "Broadcast to Storefront Display Node"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}