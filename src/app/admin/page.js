'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MousePointerClick, PlusCircle, UploadCloud, Film, Tag, IndianRupee, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ visitors: 0, botClicks: 0, channelClicks: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCards, setActiveCards] = useState([]);

  // Form Configurations state
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

  // Fetch metrics and active cards
  const fetchData = async () => {
    // Fetch Analytics
    const { data: analyticsData } = await supabase.from('analytics').select('event_type, timestamp');
    const past24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filtered = analyticsData ? analyticsData.filter(item => new Date(item.timestamp) >= past24Hours) : [];
    
    setStats({
      visitors: filtered.filter(i => i.event_type === 'visitor').length,
      botClicks: filtered.filter(i => i.event_type === 'click_bot' || i.event_type === 'click_main_bot' || i.event_type === 'click_card_bot').length,
      channelClicks: filtered.filter(i => i.event_type === 'click_channel' || i.event_type === 'click_main_demo' || i.event_type === 'click_main_admin_chan' || i.event_type === 'click_card_demo').length,
    });

    // Fetch existing cards to manage
    const { data: cardsData } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    if (cardsData) setActiveCards(cardsData);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle Card Deletion
  const handleDeleteCard = async (id, screenshotUrl) => {
    if (!confirm("Are you sure you want to delete this subscription card?")) return;

    try {
      // 1. Delete from database table
      const { error: dbError } = await supabase.from('subscriptions').delete().eq('id', id);
      if (dbError) throw dbError;

      // 2. Optional: Clean up storage file asset if path matches
      if (screenshotUrl.includes('/storage/v1/object/public/screenshots/')) {
        const fileName = screenshotUrl.split('/screenshots/').pop();
        await supabase.storage.from('screenshots').remove([fileName]);
      }

      setFormSuccess('Card removed successfully!');
      fetchData(); // Refresh list layout
    } catch (err) {
      alert("Failed to delete card: " + err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');

    if (!selectedFile) {
      alert("Please choose a screenshot image file to upload first!");
      return;
    }

    setUploadingFile(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName; 

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      const computedScreenshotUrl = urlData.publicUrl;

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

      setFormSuccess('New channel option deployed successfully!');
      setFormData({ title: '', category_name: '', video_quantity: '', original_rate: '', discount_percentage: '0' });
      setSelectedFile(null);
      document.getElementById('file-picker').value = '';
      fetchData(); // Refresh list view layout

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
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">24H Active Views</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.visitors}</h3>
          </div>
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Bot Sales Gateway Hits</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.botClicks}</h3>
            </div>
            <MousePointerClick className="text-pink-500/80" size={24} />
          </div>
          <div className="bg-slate-900 border border-purple-900/20 rounded-2xl p-6">
            <p className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Total Conversion Actions</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.channelClicks}</h3>
          </div>
        </div>

        {/* Deploy Panel Interface & Active Management Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Create Form */}
          <div className="bg-slate-900 border border-purple-900/20 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-6">
              <PlusCircle className="text-rose-400" size={20} /> Deploy New Channel Vault
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Channel Display Title</label>
                  <input
                    type="text" required value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., VIP Platinum Lounge"
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category Group</label>
                  <input
                    type="text" required value={formData.category_name}
                    onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                    placeholder="e.g., Premium Amour"
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                  <UploadCloud size={14} className="text-rose-400" /> Upload Screenshot (From Device Media)
                </label>
                <div className="w-full bg-slate-950 border border-dashed border-purple-900/60 rounded-xl p-4 flex flex-col items-center justify-center relative">
                  <input 
                    id="file-picker" type="file" accept="image/*" required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <UploadCloud size={24} className="text-neutral-500 mb-1" />
                  <span className="text-xs text-neutral-400 text-center">
                    {selectedFile ? `Selected: ${selectedFile.name}` : "Click to attach device media"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1"><Film size={10}/> Videos</label>
                  <input
                    type="number" required value={formData.video_quantity}
                    onChange={(e) => setFormData({...formData, video_quantity: e.target.value})}
                    placeholder="140"
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1"><Tag size={10}/> Rate (₹)</label>
                  <input
                    type="number" step="0.01" required value={formData.original_rate}
                    onChange={(e) => setFormData({...formData, original_rate: e.target.value})}
                    placeholder="499"
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Discount (%)</label>
                  <input
                    type="number" min="0" max="100" value={formData.discount_percentage}
                    onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                    placeholder="20"
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {formSuccess && <p className="text-emerald-400 text-xs font-medium text-center">{formSuccess}</p>}

              <button 
                type="submit" disabled={uploadingFile}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              >
                {uploadingFile ? "Uploading File Data..." : "Broadcast Card to Storefront"}
              </button>
            </form>
          </div>

          {/* Real-time Content Curation Manager List */}
          <div className="bg-slate-900 border border-purple-900/20 rounded-3xl p-6 shadow-xl space-y-4 max-h-[550px] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-100 tracking-wide">Live Cards Curation Dashboard</h2>
            {activeCards.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No live packages detected inside data table branches.</p>
            ) : (
              <div className="space-y-3">
                {activeCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-slate-950 border border-purple-950 rounded-xl gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={card.screenshot_url} className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-purple-900/20 shrink-0" alt="Thumbnail Preview" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-200 truncate">{card.title}</h4>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <span>{card.category_name}</span> • <span className="text-rose-400 font-semibold flex items-center"><IndianRupee size={10}/>{card.original_rate}</span>
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteCard(card.id, card.screenshot_url)}
                      className="text-neutral-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 p-2.5 rounded-xl border border-purple-950 hover:border-rose-900/50 transition shrink-0"
                      title="Delete card entry completely"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}