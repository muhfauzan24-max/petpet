import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-['Plus_Jakarta_Sans'] text-slate-800 pb-10">
      <div className="max-w-[600px] mx-auto bg-white min-h-screen shadow-xl flex flex-col relative">
        {/* TOP BAR */}
        <header className="flex justify-between items-center px-6 py-6 border-b border-slate-50">
          <div className="flex items-center gap-2 text-[#bd0a36] font-black tracking-tighter">
            <span className="material-symbols-outlined text-[20px]">pets</span>
            <span className="notranslate" translate="no">PetPlace</span>
          </div>
          <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </header>

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center py-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#bd0a36] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Pembeli</h1>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#e0d7f7] text-[#6d28d9] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium Member</span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">since 2023</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            New York, NY
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 px-6 mb-10">
          <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-black text-slate-900 leading-none mb-1">12</p>
            <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest">Orders</p>
          </div>
          <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-black text-slate-900 leading-none mb-1">4</p>
            <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest">Pets</p>
          </div>
          <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-black text-slate-900 leading-none mb-1">250</p>
            <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest">Points</p>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="px-6 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-black text-slate-900">Recent Orders</h2>
            <button className="text-[11px] font-bold text-[#bd0a36] uppercase tracking-widest hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
              <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200" alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-slate-800 leading-none mb-1">Royal Canine – Adult Mix</h3>
                <p className="text-[10px] text-slate-400 font-medium">Order #88219 • Delivered June 12</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#bd0a36] mb-1">Rp 985.000</p>
                <button className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-[#bd0a36]">Reorder</button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
              <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                <img src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=200" alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-slate-800 leading-none mb-1">Elite Comfort Harness</h3>
                <p className="text-[10px] text-slate-400 font-medium">Order #87904 • Delivered May 28</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#bd0a36] mb-1">Rp 450.000</p>
                <button className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-[#bd0a36]">Reorder</button>
              </div>
            </div>
          </div>
        </div>

        {/* ACCOUNT & SECURITY */}
        <div className="px-6 mb-10">
          <h2 className="text-base font-black text-slate-900 mb-4">Account & Security</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            <button className="w-full px-5 py-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Personal Information</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full px-5 py-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Payment Methods</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full px-5 py-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Saved Addresses</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full px-5 py-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Notification Preferences</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </div>

        {/* PARTNER BANNER */}
        <div className="px-6 mb-10">
          <div className="bg-[#fceef2] p-6 rounded-[32px] border border-rose-100 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-[60%]">
              <h3 className="text-xl font-black text-[#bd0a36] leading-tight mb-2 notranslate" translate="no">Grow with PetPlace</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">Join our exclusive community as a service provider or pet shop owner. Reach thousands of local pet parents.</p>
              <div className="flex gap-4">
                <span className="text-[8px] font-black text-[#bd0a36] uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Low Commission
                </span>
                <span className="text-[8px] font-black text-[#bd0a36] uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Fast Payouts
                </span>
              </div>
            </div>
            <button className="relative z-10 bg-[#bd0a36] text-white px-6 py-3 rounded-2xl font-black text-[11px] shadow-lg shadow-rose-200 active:scale-95 transition-transform">
              Become a Partner
            </button>
            {/* Paw icon background */}
            <span className="absolute -bottom-6 -right-6 material-symbols-outlined text-[120px] text-rose-200/30 rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-auto bg-white border-t border-slate-50 px-6 py-4 flex flex-col gap-6">
          <nav className="flex flex-col gap-1">
            <button onClick={() => navigate('/home')} className="w-full py-3.5 flex items-center gap-4 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">home</span>
              <span className="text-sm font-bold">Home</span>
            </button>
            <button onClick={() => navigate('/dogs')} className="w-full py-3.5 flex items-center gap-4 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">store</span>
              <span className="text-sm font-bold">Shop</span>
            </button>
            <button onClick={() => navigate('/healthcare')} className="w-full py-3.5 flex items-center gap-4 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">medical_services</span>
              <span className="text-sm font-bold">Services</span>
            </button>
            <button className="w-full py-3.5 px-4 bg-rose-50 rounded-2xl flex items-center gap-4 text-[#bd0a36]">
              <span className="material-symbols-outlined">person</span>
              <span className="text-sm font-bold">Profile</span>
            </button>
          </nav>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-rose-500 hover:text-rose-700 transition-colors px-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-[11px] font-black uppercase tracking-[2px]">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
