'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, ShoppingBag, Eye, Percent, ShieldCheck, Flame, UserCheck, X } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null); // Lightbox State

  const TELEGRAM_BOT_URL = "https://t.me/YourPurchaseBot"; 
  const TELEGRAM_DEMO_CHANNEL_URL = "https://t.me/YourDemoChannel"; 
  const ADMIN_TELEGRAM_URL = "https://t.me/YourAdminUsername"; 

  useEffect(() => {
    const trackVisitor = async () => {
      const hasVisited = sessionStorage.getItem('has_visited_today');
      if (!hasVisited) {
        await supabase.from('analytics').insert([{ event_type: 'visitor' }]);
        sessionStorage.setItem('has_visited_today', 'true');
      }
    };

    const fetchChannels = async () => {
      const { data, error } = await supabase.from('subscriptions').select('*');
      if (!error) setChannels(data);
      setLoading(false);
    };

    trackVisitor();
    fetchChannels();
  }, []);

  const handleButtonClick = async (type) => {
    await supabase.from('analytics').insert([{ event_type: `click_${type}` }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-950 via-purple-950 to-neutral-950">
        <p className="text-xl font-medium text-rose-300 animate-pulse tracking-widest font-serif italic">Entering vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-rose-950 via-purple-950 to-neutral-950 text-gray-100 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* FULL SCREEN LIGHTBOX MODAL */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-neutral-900/80 p-3 rounded-full border border-neutral-800 transition"
            onClick={() => setActiveLightboxImage(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={activeLightboxImage} 
            alt="Expanded preview view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-purple-900/20 animate-scaleUp"
            onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking the image itself
          />
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-16 w-full flex-grow">
        
        {/* Header Section */}
        <header className="mb-12 text-center space-y-4">
          <span className="text-xs font-semibold tracking-widest uppercase text-rose-300 bg-rose-950/60 px-4 py-1.5 rounded-full border border-rose-800/40 backdrop-blur-sm shadow-[0_0_15px_rgba(244,63,94,0.1)] inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-rose-400" /> Premium Vault Network
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-purple-200 to-pink-200 font-serif italic drop-shadow-md">
            Exclusive Channel Subscriptions
          </h1>
          
          <p className="text-base md:text-lg text-rose-300/90 font-medium tracking-wide max-w-2xl mx-auto flex items-center justify-center gap-2 bg-rose-950/30 py-2 px-4 rounded-xl border border-rose-900/20 w-fit">
            <Flame size={18} className="text-amber-400 shrink-0" />
            All types of "Telegram" group available in Less Rate
          </p>
        </header>

        {/* Global Navigation Hub */}
        <div className="max-w-3xl mx-auto bg-neutral-900/50 backdrop-blur-md p-6 rounded-3xl border border-purple-900/30 shadow-xl mb-16 space-y-6">
          <div className="flex items-center justify-center gap-3 text-center bg-emerald-950/30 border border-emerald-900/40 py-3 px-4 rounded-xl">
            <ShieldCheck size={22} className="text-emerald-400 shrink-0" />
            <span className="text-sm md:text-base font-semibold text-emerald-300 tracking-wide">
              100% secured and automatic bot for group purchase
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={"https://t.me/TotalSeller_bot"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleButtonClick('main_bot')}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg text-sm text-center"
            >
              <ShoppingBag size={16} /> Buy From bot
            </a>

            <a
              href={"https://t.me/+M-tTjseAd8cyNjE1"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleButtonClick('main_demo')}
              className="bg-purple-900/50 hover:bg-purple-900/70 border border-purple-700/40 text-purple-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 text-sm text-center"
            >
              <Eye size={16} /> Join Demo Channel
            </a>

            <a
              href={"https://t.me/Golden01234"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleButtonClick('main_admin_chan')}
              className="bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700/60 text-rose-200 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 text-sm text-center"
            >
              <UserCheck size={16} className="text-rose-400" /> DM me
            </a>
          </div>
        </div>

        {/* Subscriptions Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {channels.map((chan) => {
            const hasDiscount = chan.discount_percentage > 0;
            const finalPrice = hasDiscount 
              ? (chan.original_rate * (1 - chan.discount_percentage / 100)).toFixed(2)
              : chan.original_rate;

            return (
              <div key={chan.id} className="group bg-neutral-900/40 backdrop-blur-md rounded-3xl border border-purple-950 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-rose-500/30 hover:shadow-[0_0_25px_rgba(244,63,94,0.08)]">
                
                {/* Trigger Full Screen Mode on Click */}
                <div 
                  className="relative h-64 w-full bg-neutral-950 overflow-hidden cursor-zoom-in group/img"
                  onClick={() => setActiveLightboxImage(chan.screenshot_url)}
                >
                  <img 
                    src={chan.screenshot_url} 
                    alt={chan.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
                  />
                  
                  {/* Hover indicator instructions text */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition duration-200 text-xs font-medium text-rose-200 gap-1.5 tracking-wider uppercase">
                    <Eye size={14} /> Tap to expand screenshot
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
                  
                  <span className="absolute top-4 left-4 bg-purple-950/90 text-rose-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-800/40 backdrop-blur-sm">
                    {chan.category_name}
                  </span>

                  {hasDiscount && (
                    <span className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 shadow-lg shadow-rose-950/50">
                      <Percent size={11} /> {chan.discount_percentage}% OFF
                    </span>
                  )}

                  <div className="absolute bottom-3 left-4 bg-black/50 text-neutral-300 text-xs px-2.5 py-1 rounded-md border border-neutral-800 backdrop-blur-sm">
                    {chan.video_quantity}+ Videos Inside
                  </div>
                </div>

                {/* Info & Secondary Direct Actions */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-100 group-hover:text-rose-300 transition-colors duration-200">{chan.title}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black text-rose-400">₹{finalPrice}</span>
                      {hasDiscount && (
                        <span className="text-xs text-neutral-500 line-through">₹{chan.original_rate}</span>
                      )}
                      <span className="text-xs text-purple-400 ml-1">Permanent access</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={"https://t.me/TotalSeller_bot"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleButtonClick('card_bot')}
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold py-2.5 px-3 rounded-xl border border-rose-500/40 text-center transition duration-200 text-xs flex items-center justify-center gap-1"
                    >
                      <ShoppingBag size={14} /> Buy Now
                    </a>
                    <a
                      href={"https://t.me/+M-tTjseAd8cyNjE1"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleButtonClick('card_demo')}
                      className="bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium py-2.5 px-3 rounded-xl border border-neutral-700/40 text-center transition duration-200 text-xs flex items-center justify-center gap-1"
                    >
                      <Eye size={14} /> Look Feed
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-neutral-950/90 text-neutral-600 py-8 border-t border-purple-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-wider font-light">&copy; DM me on Telegram: @Golden01234.</p>
          <Link 
            href="/admin" 
            className="text-xs bg-purple-950/20 hover:bg-purple-950/40 text-rose-400 font-medium py-2 px-4 rounded-xl border border-rose-950 transition duration-200"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}