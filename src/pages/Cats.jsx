import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const catProducts = [
  {
    id: 1,
    name: "Wild-Caught Salmon Pate",
    price: 320000,
    store: "Feline Finest",
    weight: "24 x 85G",
    tag: "ORGANIC",
    tagColor: "bg-amber-500 text-white",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800", 
  },
  {
    id: 2,
    name: "Skandi Multi-Tier Cat Tree",
    price: 1450000,
    store: "Uptown Annex",
    weight: "12 KG",
    tag: "BEST SELLER",
    tagColor: "bg-emerald-500 text-white",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuE1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O",
  },
  {
    id: 3,
    name: "Ceramic Water Fountain",
    price: 680000,
    store: "PawLife Center",
    weight: "1.2 KG",
    tag: "",
    tagColor: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O", 
  },
  {
    id: 4,
    name: "Eco-Friendly Wand Teaser",
    price: 125000,
    store: "Downtown Boutique",
    weight: "50G",
    tag: "HANDMADE",
    tagColor: "bg-rose-600 text-white",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASjtPXsuh2jx5OOInFphdFgwoFKVot0WqxgjNg-tiwl90cSXnPekvEqxc9fVebbol0BCk14mZ9WL8kv-rIKT7FQEnvH-VRaff6f78eEMos9HavRovV-8_MxC5G679BFfBlm914_t8Q2j_uckkwbyy6rvWb_fmGP9VWNgnu6PwObBdIl62VE7-Wvfg_A0pB19BlLgwK4jftTGXCjT226_A5RVIwH13iK9rtpMsob_JAjXZ56SXJsj1clTxLb2QxehLWtOb3GaHYCv7p",
  },
  {
    id: 5,
    name: "Odor-Lock Clay Litter",
    price: 210000,
    store: "Uptown Annex",
    weight: "10 KG",
    tag: "",
    tagColor: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O",
  }
];

export default function Cats() {
  const { addToCart, cartItemCount } = useCart();
  const [selectedStore, setSelectedStore] = useState('');
  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 shadow-sm w-full z-50">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black text-rose-600 tracking-tighter hover:opacity-80 transition-opacity font-headline-xl">Paws&Purrs</Link>
            <nav className="hidden md:flex gap-6 font-['Plus_Jakarta_Sans'] font-medium text-[13px] tracking-tight">
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/home">Home</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/dogs">Dogs</Link>
              <Link className="text-rose-600 border-b-2 border-rose-600 pb-1" to="/cats">Cats</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/grooming">Grooming</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/healthcare">Healthcare</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
              <input className="bg-slate-50 border border-slate-100 rounded-md pl-9 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-rose-500 transition-all outline-none" placeholder="Search..." type="text" />
            </div>
            <button className="text-slate-600 hover:text-rose-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </button>
            <Link to="/cart" className="text-slate-600 hover:text-rose-600 transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="text-slate-600 hover:text-rose-600 transition-colors ml-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* PROMO BANNER */}
      <div className="bg-[#6338b5] text-white text-[10px] font-bold text-center py-2 uppercase tracking-widest flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        Premium Rewards: Earn 5% Back On All Cat Essentials Today
      </div>

      <main className="flex-grow px-6 md:px-12 py-8 max-w-[1440px] mx-auto w-full">
        
        {/* HERO SECTION */}
        <section className="relative rounded-xl overflow-hidden bg-slate-900 h-[320px] flex items-center shadow-md mb-8">
          <div className="absolute inset-0">
            <img className="w-full h-full object-cover opacity-90 mix-blend-overlay" src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=2000" alt="Cat Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
          </div>
          <div className="relative z-10 px-10 md:px-16 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-[9px] mb-4 uppercase tracking-widest">Exclusively For Felines</span>
            <h1 className="font-headline-xl text-4xl text-white mb-3 font-bold">Elevate Their Everyday Life</h1>
            <p className="text-sm text-white/80 mb-6 font-['Plus_Jakarta_Sans'] leading-relaxed">Discover a curated collection of artisan leather, organic nutrition, and orthopedic comfort designed specifically for the discerning pet parent.</p>
            <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded text-xs font-bold transition-all shadow-md flex items-center gap-2">
              Shop The Collection <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* SIDEBAR */}
          <aside className="w-full lg:w-56 shrink-0">
            {/* Category */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Category</h3>
              <ul className="space-y-3 text-sm text-slate-600 font-['Plus_Jakarta_Sans']">
                <li className="flex items-center gap-2 cursor-pointer hover:text-rose-600">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center"></div>
                  Food & Nutrition
                </li>
                <li className="flex items-center gap-2 cursor-pointer text-rose-600 font-medium">
                  <div className="w-4 h-4 bg-rose-600 rounded flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  </div>
                  Luxury Toys
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:text-rose-600">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center"></div>
                  Accessories
                </li>
                <li className="flex items-center gap-2 cursor-pointer hover:text-rose-600">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center"></div>
                  Bedding & Home
                </li>
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="$0" className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 outline-none" disabled />
                <span className="text-slate-300">-</span>
                <input type="text" placeholder="$500+" className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 outline-none" disabled />
              </div>
            </div>

            {/* Brand */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-4">Brand</h3>
              <div className="flex flex-wrap gap-2">
                <span className="border border-rose-600 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer bg-rose-50">Paws&Purrs</span>
                <span className="border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer hover:border-slate-300">Feline Finest</span>
                <span className="border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer hover:border-slate-300">LuxeCat</span>
                <span className="border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer hover:border-slate-300">EcoPurr</span>
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-slate-500 font-['Plus_Jakarta_Sans']">Showing <span className="font-bold text-slate-800">5</span> premium products</p>
              <div className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans'] text-slate-500 uppercase tracking-wider font-bold">
                SORT BY: <span className="text-slate-800 flex items-center cursor-pointer ml-1">Newest First <span className="material-symbols-outlined text-[16px]">expand_more</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {catProducts.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative flex flex-col group">
                  <div className="aspect-[4/5] rounded-lg overflow-hidden bg-slate-50 mb-4 relative">
                    {item.tag && (
                      <span className={`absolute top-2 left-2 ${item.tagColor} text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider z-10`}>{item.tag}</span>
                    )}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-[13px] font-medium text-slate-800 leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1 py-0.5 rounded uppercase">{item.weight}</span>
                      <span className="text-[9px] text-slate-400 truncate font-['Plus_Jakarta_Sans']">sold by: {item.store}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="font-bold text-rose-600 text-sm font-['Plus_Jakarta_Sans']">{formatIDR(item.price)}</p>
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-slate-900 text-white w-7 h-7 rounded flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* NEWSLETTER */}
      <section className="bg-rose-50/50 mt-16 py-16">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="font-headline-lg text-2xl text-slate-900 mb-3">Join the Inner Circle</h2>
          <p className="text-sm text-slate-600 mb-6 font-['Plus_Jakarta_Sans']">Subscribe to receive early access to new collections, pet wellness tips, and exclusive boutique offers.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-l-md text-sm outline-none focus:border-rose-300" />
            <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-r-md text-sm font-bold transition-all whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-8 border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-black text-slate-900 tracking-tighter">Paws&Purrs</span>
            <p className="text-[10px] text-slate-400 font-['Plus_Jakarta_Sans']">© 2024 Paws&Purrs Premium Boutique. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-[10px] font-bold text-slate-400 font-['Plus_Jakarta_Sans'] uppercase tracking-wider">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Shipping Info</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Returns</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Contact Us</a>
          </div>
          <div className="flex gap-3 text-slate-300">
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span className="material-symbols-outlined text-[16px]">share</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
