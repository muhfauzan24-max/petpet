import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Payment() {
  const location = useLocation();
  const { cartItems, subtotal, tax, total, cartItemCount } = useCart();
  const method = location.state?.method || 'delivery';

  return (
    <div className="bg-[#f8f9fa] text-slate-800 font-['Plus_Jakarta_Sans'] min-h-screen flex flex-col pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 shadow-sm w-full z-50 sticky top-0">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black text-[#bd0a36] tracking-tighter hover:opacity-80 transition-opacity notranslate" translate="no">PetPlace</Link>
            <nav className="hidden md:flex gap-6 font-medium text-[13px] tracking-tight">
              <Link className="text-slate-600 hover:text-[#bd0a36] transition-colors" to="/home">Home</Link>
              <Link className="text-slate-600 hover:text-[#bd0a36] transition-colors" to="/dogs">Dogs</Link>
              <Link className="text-slate-600 hover:text-[#bd0a36] transition-colors" to="/cats">Cats</Link>
              <Link className="text-slate-600 hover:text-[#bd0a36] transition-colors" to="/grooming">Grooming</Link>
              <Link className="text-slate-600 hover:text-[#bd0a36] transition-colors" to="/healthcare">Healthcare</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-[#bd0a36] transition-colors">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="text-[13px] font-medium hidden lg:block">Profile</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-2 text-slate-600 hover:text-[#bd0a36] transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span className="text-[13px] font-medium hidden lg:block">Keranjang</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#bd0a36] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
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
              <div className="w-8 h-8 rounded-full bg-[#bd0a36] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery/Pickup</span>
            </div>

            {/* Line 2-3 */}
            <div className="absolute top-4 right-4 w-32 h-[2px] bg-[#bd0a36] -z-0"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#bd0a36] text-white flex items-center justify-center shadow-lg ring-4 ring-rose-50">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <span className="text-[10px] font-bold text-[#bd0a36] uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* SCAN TO PAY SECTION */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 bg-slate-900 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center">
                <div className="bg-white p-2 rounded-lg mb-4">
                  {/* Mock QR Code */}
                  <div className="w-32 h-32 bg-slate-900 flex flex-col items-center justify-center text-[10px] text-white font-mono leading-tight">
                    <p>QRIS</p>
                    <p className="mt-2 text-[6px] opacity-60">000 12345 6789 000</p>
                    <div className="mt-4 w-16 h-16 border border-white/20 flex items-center justify-center opacity-40">
                      <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                    </div>
                    <p className="mt-6 text-[8px] tracking-widest">Safite work</p>
                  </div>
                </div>
              </div>
              <div className="flex-grow space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Scan to Pay</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Please use your banking app or e-wallet to scan the QRIS code above. Ensure the payment recipient is <span className="font-bold text-[#bd0a36]">PetPlace Official</span>.
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">TOTAL AMOUNT</p>
                    <p className="text-2xl font-black text-rose-600 leading-none">{formatIDR(total)}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-600 whitespace-nowrap flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      Expires in 14:59
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* UPLOAD PROOF SECTION */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Upload Proof of Payment</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center cursor-pointer hover:border-[#bd0a36] hover:bg-slate-50 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6 group-hover:bg-[#bd0a36] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Click or drag and drop to upload</h4>
                <p className="text-xs text-slate-400">PNG, JPG, or PDF (Max 5MB)</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-[#bd0a36] hover:bg-[#a00030] text-white px-10 py-4.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-100 flex items-center gap-3 active:scale-[0.98]">
                Confirm Payment <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="space-y-8">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm sticky top-28">
              <h2 className="text-lg font-black text-slate-900 mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 mb-1">Qty: {item.quantity} • {item.weight || 'Standard Size'}</p>
                      <p className="text-[13px] font-black text-rose-600">{formatIDR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Method</span>
                  <span className="font-bold text-slate-900">{method === 'delivery' ? 'Delivery' : 'In-Store Pickup (FREE)'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatIDR(subtotal)}</span>
                </div>
                {method === 'delivery' && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Delivery</span>
                    <span className="font-bold text-slate-900">{formatIDR(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-slate-100 pt-6 mb-8">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-rose-600">{formatIDR(total)}</span>
              </div>

              <div className="bg-[#6d28d9] text-white p-4 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
                <p className="text-[11px] font-bold">Earn {Math.floor(total / 1000)} PawPoints with this purchase!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white mt-10 pt-16 pb-12 border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="text-xl font-black text-[#bd0a36] tracking-tighter mb-6 notranslate" translate="no">PetPlace</div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Defining premium pet care through quality, trust, and a passion for every tail wag.</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[2px] mb-6">EXPERIENCE</h4>
              <ul className="space-y-4 text-[11px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Personalized Nutrition</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Style & Accessories</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Boutique Locations</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Gift Cards</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[2px] mb-6">SUPPORT</h4>
              <ul className="space-y-4 text-[11px] text-slate-500 font-medium">
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Care Guides</a></li>
                <li><a href="#" className="hover:text-[#bd0a36] transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[2px] mb-6">NEWSLETTER</h4>
              <p className="text-[11px] text-slate-500 mb-6 font-medium leading-relaxed">Join our community for exclusive boutique drops.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="w-full px-4 py-3 bg-[#f8f9fa] border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-[#bd0a36] outline-none" />
                <button className="bg-[#bd0a36] text-white p-3 rounded-xl flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-slate-400 font-medium">© 2024 PetPlace Inc. All rights reserved.</p>
            <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
