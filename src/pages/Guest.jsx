import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function Guest() {
  const { cartItemCount } = useCart();
  return (
    <div className="font-body-md text-on-surface bg-[#f7f9fb] min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white dark:bg-gray-950 shadow-sm dark:shadow-none border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="flex justify-between items-center h-20 px-8 max-w-[1280px] mx-auto w-full">
          <div className="text-2xl font-bold tracking-tighter text-rose-600 dark:text-rose-500 font-headline-xl notranslate" translate="no">PetPlace</div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors font-headline-md text-sm font-medium tracking-tight" to="/dogs">Dogs</Link>
            <Link className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors font-headline-md text-sm font-medium tracking-tight" to="/cats">Cats</Link>
            <Link className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors font-headline-md text-sm font-medium tracking-tight" to="/grooming">Grooming</Link>
            <Link className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors font-headline-md text-sm font-medium tracking-tight" to="/healthcare">Healthcare</Link>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-600">
              <button className="hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg p-2 scale-95 active:scale-90 transition-transform duration-200">
                <span className="material-symbols-outlined">search</span>
              </button>
              <Link to="/cart" className="hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg p-2 scale-95 active:scale-90 transition-transform duration-200 relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l border-gray-200 pl-6">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-rose-500 transition-colors font-headline-md text-sm font-medium tracking-tight">Log In</Link>
              <Link to="/register" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline-md text-sm font-semibold scale-95 active:scale-90 transition-transform duration-200 shadow-sm inline-flex items-center justify-center">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-8 py-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-white shadow-sm mb-16 h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" alt="Guest Experience Hero" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAprJLd-tKtAbk10GBJdXb2hWhd8EnzYr46HfzN80eJoFyoy3_ztQEVm2Mhnve8wKoKiJJek6EK-gZ_UvwUOdOhqNEV3qW1LUURLybRnUvyd5G7upg0gZxIsYnxNnkrdx_qPDDw1qXegiB0NDn0wKGbJpGSOnSQNuLZ0LJnuykdjbo_5OpVqo_sbgH373k5eOzqZK4aF-9qZGtbZJRqCrX3tVf8lkAGjCFegRXo0SoVcE8rwsUlLXJWduvooh5r6Qiqg9FXr8_quqMN"/>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
          </div>
          <div className="relative z-10 px-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full mb-6">
              <span className="material-symbols-outlined text-[18px]">pets</span>
              <span className="font-label-bold text-label-bold uppercase">Guest Experience</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-background mb-4">Welcome to the Pack!</h1>
            <p className="font-body-lg text-body-lg text-secondary mb-8 leading-relaxed">Join our community of pet lovers to unlock exclusive rewards, personalized recommendations, and seamless shopping for your furry friends.</p>
            <div className="flex gap-4">
              <Link to="/register" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline-md text-body-md font-semibold scale-95 active:scale-90 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2">
                <span>Create Account</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/login" className="bg-surface-container text-on-surface px-8 py-4 rounded-xl font-headline-md text-body-md font-semibold scale-95 active:scale-90 transition-all hover:bg-surface-container-high inline-flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Bento Grid */}
        <section className="mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-12 text-center">Why join PetPlace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-rose-100 transition-all group">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">package_2</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background mb-3">Track your orders</h3>
              <p className="font-body-md text-body-md text-secondary leading-relaxed">Real-time updates on your pet's favorite treats and toys from warehouse to your front door.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-rose-100 transition-all group">
              <div className="w-14 h-14 bg-tertiary-fixed text-tertiary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">loyalty</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background mb-3">Earn PawPoints</h3>
              <p className="font-body-md text-body-md text-secondary leading-relaxed">Earn points on every purchase and redeem them for exclusive discounts and premium member-only gifts.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-rose-100 transition-all group">
              <div className="w-14 h-14 bg-secondary-container text-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">clinical_notes</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background mb-3">Save pet profiles</h3>
              <p className="font-body-md text-body-md text-secondary leading-relaxed">Store dietary needs, medical history, and size preferences for personalized shopping recommendations.</p>
            </div>
          </div>
        </section>

        {/* Rewards Bar */}
        <section className="bg-tertiary text-on-tertiary rounded-2xl px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-section-gap">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-white">Join the Rewards Program</h4>
              <p className="text-white/80 font-body-sm">Get 5% cashback in points on your first order when you sign up today.</p>
            </div>
          </div>
          <button className="bg-white text-tertiary px-6 py-3 rounded-lg font-headline-md text-sm font-bold scale-95 active:scale-90 transition-transform whitespace-nowrap">
            Join Now
          </button>
        </section>

        {/* Visual Promotion Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] rounded-3xl overflow-hidden group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Boutique Accessories" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdUiorUl-RHyeErJDIfrAUn5SSSTc2-CR3G_uJq2uwIH7uH62m-jsDKedHXqfK2h-xb-JOpfFEHIodH89f9wnu6MInIUboOI0CCaaXBPfgCOgbQV2wsLne4rVSrmnXV3wr-P_95hatUQp4Az-yVSMUygwplBO9ZwPD7-DeRJQkiPDez5IZJ6FL9DlIlWBN5YiyWzuGYoye5MKxQrtWrqXO8Zit_zu3mINu2cxFIx0RB_NkRuVWViQfr0Tm-OqHYlCSr79ScSAN6p0L"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="font-label-bold text-label-bold mb-2 uppercase tracking-widest text-white/80">Curation</p>
              <h4 className="font-headline-lg text-headline-lg">Boutique Accessories</h4>
            </div>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden group">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gourmet Nutrition" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASjtPXsuh2jx5OOInFphdFgwoFKVot0WqxgjNg-tiwl90cSXnPekvEqxc9fVebbol0BCk14mZ9WL8kv-rIKT7FQEnvH-VRaff6f78eEMos9HavRovV-8_MxC5G679BFfBlm914_t8Q2j_uckkwbyy6rvWb_fmGP9VWNgnu6PwObBdIl62VE7-Wvfg_A0pB19BlLgwK4jftTGXCjT226_A5RVIwH13iK9rtpMsob_JAjXZ56SXJsj1clTxLb2QxehLWtOb3GaHYCv7p"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <p className="font-label-bold text-label-bold mb-2 uppercase tracking-widest text-white/80">Wellness</p>
              <h4 className="font-headline-lg text-headline-lg">Gourmet Nutrition</h4>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
        <div className="py-12 px-8 max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white font-headline-xl mb-4 notranslate" translate="no">PetPlace</div>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-gray-500 dark:text-gray-400 max-w-md">
                The destination for discerning pet owners. We curate the finest products for your beloved companions, combining style, comfort, and wellness.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">About Us</a>
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">Careers</a>
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">Contact</a>
            </div>
            <div className="flex flex-col gap-3">
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">Terms of Service</a>
              <a className="text-gray-500 hover:text-rose-500 transition-colors font-['Plus_Jakarta_Sans'] text-sm hover:underline decoration-rose-500 underline-offset-4 opacity-80 hover:opacity-100" href="#">FAQ</a>
            </div>
            <div className="hidden sm:flex flex-col gap-4 items-end">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-rose-500">public</span>
                <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-rose-500">mail</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="font-['Plus_Jakarta_Sans'] text-sm text-gray-500 dark:text-gray-400">© 2024 PetPlace. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-gray-300">payments</span>
            <span className="material-symbols-outlined text-gray-300">credit_card</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
