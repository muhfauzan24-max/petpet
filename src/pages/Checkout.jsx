import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, tax, total, cartItemCount } = useCart();
  const [method, setMethod] = useState('delivery'); // 'delivery' or 'pickup'

  return (
    <div className="bg-[#f8f9fa] text-slate-800 font-['Plus_Jakarta_Sans'] min-h-screen flex flex-col pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 shadow-sm w-full z-50 sticky top-0">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black text-rose-600 tracking-tighter hover:opacity-80 transition-opacity notranslate" translate="no">PetPlace</Link>
            <nav className="hidden md:flex gap-6 font-medium text-[13px] tracking-tight">
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/home">Home</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/dogs">Dogs</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/cats">Cats</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/grooming">Grooming</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/healthcare">Healthcare</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-rose-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="text-[13px] font-medium hidden lg:block">Profile</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-2 text-slate-600 hover:text-rose-600 transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span className="text-[13px] font-medium hidden lg:block">Keranjang</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-10">
        {/* STEPPER */}
        <div className="flex justify-center items-center mb-12">
          <div className="flex items-center gap-16 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#bd0a36] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cart</span>
            </div>
            
            {/* Line 1-2 */}
            <div className="absolute top-4 left-4 w-32 h-[2px] bg-[#bd0a36] -z-0"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#bd0a36] text-white flex items-center justify-center shadow-lg ring-4 ring-rose-50">
                <span className="text-[14px] font-bold">2</span>
              </div>
              <span className="text-[10px] font-bold text-[#bd0a36] uppercase tracking-widest">Delivery/Pickup</span>
            </div>

            {/* Line 2-3 */}
            <div className="absolute top-4 right-4 w-32 h-[2px] bg-slate-200 -z-0"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                <span className="text-[14px] font-bold">3</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        {/* METHOD TOGGLE */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
            <button 
              onClick={() => setMethod('delivery')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${method === 'delivery' ? 'bg-[#bd0a36] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              Delivery
            </button>
            <button 
              onClick={() => setMethod('pickup')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${method === 'pickup' ? 'bg-[#bd0a36] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">store</span>
              In-Store Pickup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {method === 'delivery' ? (
              <>
                {/* MAP SECTION */}
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
                  <div className="relative h-[300px] bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                      alt="Map View" 
                      className="w-full h-full object-cover opacity-50 grayscale"
                    />
                    {/* Mock Map UI */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-xl animate-bounce">
                          <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 whitespace-nowrap">
                          <p className="text-[11px] font-bold text-slate-900">Your Delivery Location</p>
                        </div>
                      </div>
                    </div>
                    <button className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-xl shadow-md border border-slate-100 text-[10px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                      <span className="material-symbols-outlined text-[16px]">my_location</span>
                      PIN MY LOCATION
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">SHIPPING FROM</p>
                        <p className="text-[11px] font-bold text-slate-800 leading-none">PetPlace Main Fulfillment Center - Downtown</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">Closest to your zone</span>
                  </div>
                </div>

                {/* FORM SECTION */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Full Name</label>
                      <input type="text" defaultValue="John Doe" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Street Address</label>
                      <input type="text" defaultValue="123 Pet Lane" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">City</label>
                        <input type="text" defaultValue="Puppyville" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">State/Province</label>
                        <input type="text" defaultValue="CA" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Phone Number</label>
                      <input type="text" defaultValue="+1 (555) 000-0000" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* SCHEDULE SECTION */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Delivery Schedule</h3>
                      <p className="text-[11px] text-slate-500">Choose a convenient time for your delivery.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Delivery Date</label>
                      <input type="date" defaultValue="2024-05-24" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Delivery Time</label>
                      <select className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all appearance-none">
                        <option>10:00 AM - 02:00 PM</option>
                        <option>02:00 PM - 06:00 PM</option>
                        <option>06:00 PM - 10:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                      <span className="material-symbols-outlined text-[20px]">schedule</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">ESTIMATED ARRIVAL</p>
                      <p className="text-[13px] font-bold text-slate-800">Estimated delivery: Tomorrow, 10 AM - 2 PM</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* PICKUP LOCATION SECTION */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 leading-none">Pickup Location</h2>
                    <p className="text-[11px] text-slate-500 leading-none">This is the store where you will pick up your products.</p>
                  </div>
                  <div className="relative h-[400px] bg-slate-100 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                      alt="Map View" 
                      className="w-full h-full object-cover opacity-50 grayscale"
                    />
                    {/* Mock Map UI */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-2xl relative z-10">
                          <span className="material-symbols-outlined text-[32px]">store</span>
                        </div>
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl whitespace-nowrap text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">PETPLACE - PACIFIC HEIGHTS</p>
                          <p className="text-[9px] font-medium text-slate-400 leading-none">Selected Store for Pickup</p>
                        </div>
                        {/* Smaller pins around */}
                        <div className="absolute -top-20 -left-32 w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center text-white opacity-60">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                        </div>
                        <div className="absolute top-20 -right-24 w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center text-white opacity-60">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                        </div>
                        <div className="absolute -bottom-32 -left-16 w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center text-white opacity-60">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PICKUP SCHEDULE SECTION */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 leading-none">Pickup Schedule</h2>
                    <p className="text-[11px] text-slate-500 leading-none">Select a convenient time to collect your order.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Pickup Date</label>
                      <input type="date" defaultValue="2024-05-24" className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Pickup Time Window</label>
                      <select className="w-full px-5 py-4 bg-[#f8f9fa] border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 outline-none transition-all appearance-none">
                        <option>10:00 AM - 12:00 PM</option>
                        <option>12:00 PM - 03:00 PM</option>
                        <option>03:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-8">Order Summary</h2>
              
              <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Subtotal ({cartItemCount} items)</span>
                  <span className="font-bold text-slate-900">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{method === 'delivery' ? 'Standard Shipping' : 'In-Store Pickup'}</span>
                  <span className="font-black text-rose-600 uppercase text-[10px] tracking-widest">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Estimated Tax</span>
                  <span className="font-bold text-slate-900">{formatIDR(tax)}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 mb-8">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL AMOUNT</p>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-black text-slate-900 leading-none">{formatIDR(total)}</span>
                  <div className="bg-[#e0d7f7] px-3 py-1.5 rounded-lg">
                    <p className="text-[9px] font-bold text-[#6d28d9] leading-none whitespace-nowrap">{Math.floor(total / 1000)} Points Earned</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/payment', { state: { method } })}
                className="w-full bg-[#bd0a36] hover:bg-[#a00030] text-white py-4.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-3 active:scale-[0.98] mb-6"
              >
                Proceed to Payment <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-10">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                SECURE CHECKOUT
              </div>

              {/* YOUR SELECTION */}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">YOUR SELECTION</p>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-[11px] font-bold text-slate-900 leading-tight mb-1">{item.name}</h4>
                        <p className="text-[9px] text-slate-500 mb-1">{item.weight || 'Standard Size'}</p>
                        <p className="text-[11px] font-black text-rose-600">{formatIDR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No items selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white mt-10 pt-12 pb-8 border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-xl font-black text-slate-900 tracking-tighter notranslate" translate="no">PetPlace</div>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-rose-600 transition-colors">Shipping Policy</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Returns & Exchanges</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Contact Us</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Store Locator</a>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 text-center md:text-left">
            <p className="text-[11px] text-slate-400 font-medium">© 2024 PetPlace Premium Pet Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
