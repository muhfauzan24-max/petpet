import React from 'react';
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

export default function Cart() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    estimatedShipping, 
    tax, 
    total,
    cartItemCount
  } = useCart();

  return (
    <div className="bg-[#f8f9fa] text-slate-800 font-['Plus_Jakarta_Sans'] min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 shadow-sm w-full z-50">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black text-[#c3003b] tracking-tighter hover:opacity-80 transition-opacity font-headline-xl uppercase">Paw & Posh</Link>
            <nav className="hidden md:flex gap-6 font-['Plus_Jakarta_Sans'] font-medium text-[13px] tracking-tight">
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/home">Home</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/dogs">Dogs</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/cats">Cats</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/grooming">Grooming</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/healthcare">Healthcare</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/cart" className="relative hover:text-[#c3003b] transition-colors cursor-pointer p-2">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#c3003b] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="hover:text-[#c3003b] transition-colors p-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 py-12">
        {/* TABS */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button className="text-[#c3003b] border-b-2 border-[#c3003b] pb-3 text-xs font-bold tracking-widest uppercase">Ongoing Orders</button>
          <button className="text-slate-400 hover:text-slate-600 pb-3 text-xs font-bold tracking-widest uppercase transition-colors">Completed Orders</button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500">
            {cartItems.length === 0 
              ? "Your cart is currently empty." 
              : `You have ${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in your boutique selection.`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CART ITEMS AREA */}
          <div className="flex-grow w-full">
            {cartItems.length === 0 ? (
              // EMPTY STATE
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                  <span className="material-symbols-outlined text-[32px]">shopping_basket</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
                  It looks like you haven't added any luxury treats or essentials to your boutique selection yet.
                </p>
                <button 
                  onClick={() => navigate('/home')}
                  className="bg-[#bd0a36] hover:bg-[#a00030] text-white px-8 py-3.5 rounded text-xs font-bold transition-all shadow-md uppercase tracking-wider"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              // FILLED STATE
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex gap-6 items-center">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-50 shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      {/* Only showing label if the original item had one */}
                      {item.tag && (
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm py-1 text-center">
                          <span className="text-[7px] font-bold text-amber-500 uppercase tracking-widest">{item.tag}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">
                        {item.weight || "PREMIUM ITEM"}
                      </p>
                      
                      {/* Quantity & Price */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-slate-200 rounded-full bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>
                        <p className="text-base font-bold text-[#c3003b]">{formatIDR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => navigate('/home')}
                  className="mt-8 text-[#c3003b] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span> Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="w-full lg:w-80 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm shrink-0">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-medium text-slate-900">{formatIDR(estimatedShipping)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tax (VAT 5%)</span>
                <span className="font-medium text-slate-900">{formatIDR(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 border-t border-slate-100 pt-6">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-[#bd0a36]">{formatIDR(total)}</span>
            </div>

            {/* Promo Code */}
            <div className="flex mb-6 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <input type="text" placeholder="Promo Code" className="w-full px-3 py-2 bg-transparent text-xs outline-none" disabled={cartItems.length === 0} />
              <button 
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors"
                disabled={cartItems.length === 0}
              >
                Apply
              </button>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={() => navigate('/checkout')}
              className={`w-full py-4 rounded text-xs font-bold transition-all shadow-sm uppercase tracking-wider mb-4 ${
                cartItems.length === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#bd0a36] hover:bg-[#a00030] text-white shadow-md active:scale-[0.98]'
              }`}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400 uppercase tracking-widest font-medium mb-8">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secure SSL Encrypted Checkout
            </div>

            {/* Rewards Notice */}
            <div className="bg-[#f5f3ff] rounded-xl p-5 flex items-start gap-4 border border-indigo-50">
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Paw Rewards</h4>
                {cartItems.length > 0 ? (
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    You'll earn <strong className="text-slate-900">{Math.floor(total / 1000)} points</strong> from this order.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Earn points on your next purchase.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white py-8 border-t border-slate-100 mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm font-black text-slate-900 tracking-tighter">Paw & Posh</div>
          <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-800 transition-colors">Shipping & Returns</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Size Guide</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Contact</a>
          </div>
          <p className="text-[9px] text-slate-400 font-medium">© 2024 Paw & Posh Boutique. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
