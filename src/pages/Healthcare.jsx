import React from 'react';
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

export default function Healthcare() {
  const { cartItemCount } = useCart();

  return (
    <div className="bg-[#f8f9fa] text-slate-800 font-['Plus_Jakarta_Sans'] min-h-screen pb-20">
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center h-20 px-6 md:px-12 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black text-rose-600 tracking-tighter hover:opacity-80 transition-opacity notranslate" translate="no">PetPlace</Link>
            <nav className="hidden md:flex gap-6 font-medium text-sm tracking-tight">
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/home">Home</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/dogs">Dogs</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/cats">Cats</Link>
              <Link className="text-slate-600 hover:text-rose-600 transition-colors" to="/grooming">Grooming</Link>
              <Link className="text-rose-600 border-b-2 border-rose-600 pb-1" to="/healthcare">Healthcare</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <input className="bg-slate-50 border-none rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-rose-500 transition-all outline-none" placeholder="Search..." type="text" />
              <span className="material-symbols-outlined absolute right-3 top-2 text-slate-400">search</span>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <Link to="/cart" className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-600 relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-slate-200 ml-2 cursor-pointer hover:opacity-80">
              <span className="material-symbols-outlined text-slate-600">person</span>
              <span className="font-semibold text-sm hidden sm:block text-slate-700">Account</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#8ed8df] via-[#75c6d0] to-[#4698a3] h-[500px] flex items-center">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 w-full relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-xl text-center md:text-left mb-10 md:mb-0">
              <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-600 font-bold text-[10px] mb-6 uppercase tracking-wider">Welcome to PetPlace Care</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Expert Care for Your Best Friend</h1>
              <p className="text-slate-700 text-sm md:text-base mb-8 max-w-lg leading-relaxed">From routine check-ups to emergency specialist care, PetPlace provides a compassionate, state-of-the-art medical environment for your beloved pets.</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-200">Book a Consultation</button>
                <button className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3.5 rounded-xl font-bold text-sm transition-all border border-slate-200">Meet Our Doctors</button>
              </div>
            </div>
            <div className="hidden md:block relative w-[450px] h-[450px]">
              <img 
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=800" 
                alt="Doctor Illustration" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="text-[120px] font-black text-white/20 select-none tracking-tighter transform rotate-[-5deg]">SAFE PARK</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Certified Specialists</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Our team includes board-certified surgeons, cardiologists, and oncologists dedicated to pet wellness.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <span className="material-symbols-outlined text-3xl">biotech</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">State-of-the-art Facilities</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Equipped with the latest diagnostic imaging, surgical suites, and dedicated rehabilitation centers.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <span className="material-symbols-outlined text-3xl">favorite</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Compassionate Care</h3>
              <p className="text-slate-500 text-sm leading-relaxed">We treat every patient like family, focusing on comfort, minimal stress, and emotional well-being.</p>
            </div>
          </div>
        </section>

        {/* LOCATIONS SECTION */}
        <section className="py-10 max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Our Veterinary Clinics</h2>
              <p className="text-slate-500 text-sm">Find the nearest PetPlace wellness center near you.</p>
            </div>
            <a href="#" className="text-rose-600 font-bold text-sm hover:underline flex items-center gap-1">View All Locations <span className="material-symbols-outlined text-sm">chevron_right</span></a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "PetPlace Wellness - Pacific Heights",
                address: "2485 Washington St, San Francisco, CA 94115",
                tag: "WELLNESS CENTER",
                tagColor: "bg-blue-500",
                img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
              },
              {
                name: "PetPlace Medical - Mission Bay",
                address: "1100 4th St, San Francisco, CA 94158",
                tag: "MEDICAL HOSPITAL",
                tagColor: "bg-teal-500",
                img: "https://images.unsplash.com/photo-1538108149393-fdfd81895907?auto=format&fit=crop&q=80&w=800"
              },
              {
                name: "PetPlace Specialists - Marin",
                address: "505 Larkspur Landing Cir, Larkspur, CA 94939",
                tag: "SPECIALIST CENTER",
                tagColor: "bg-indigo-500",
                img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
              }
            ].map((clinic, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={clinic.img} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className={`absolute top-4 left-4 ${clinic.tagColor} text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>{clinic.tag}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 mb-2 leading-tight">{clinic.name}</h3>
                  <div className="flex items-start gap-2 text-slate-500 text-xs mb-6">
                    <span className="material-symbols-outlined text-[16px] shrink-0">location_on</span>
                    {clinic.address}
                  </div>
                  <button className="w-full py-2.5 border border-rose-100 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors">Select This Clinic</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TELEHEALTH SECTION */}
        <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="bg-[#8b5cf6] rounded-[40px] overflow-hidden flex flex-col md:flex-row items-center relative shadow-2xl shadow-purple-200">
            <div className="p-10 md:p-16 md:w-3/5 text-white z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest">ONLINE NOW</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Chat with a Veterinarian</h2>
              <p className="text-purple-100 text-sm md:text-base mb-8 max-w-md leading-relaxed">Get instant peace of mind with 24/7 access to medical advice from the comfort of your home. Perfect for non-emergency concerns and general wellness questions.</p>
              <button className="bg-white text-purple-600 px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-purple-50 transition-all shadow-lg">
                <span className="material-symbols-outlined">chat</span> Start Chatting Now
              </button>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#8b5cf6] bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-purple-200">Join <span className="text-white font-bold">1.2k+</span> pet parents online</p>
              </div>
            </div>
            <div className="md:w-2/5 h-full relative min-h-[400px] w-full">
              <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800" alt="Doctor" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#8b5cf6]/20"></div>
            </div>
          </div>
        </section>

        {/* WELLNESS SECTION */}
        <section className="py-10 max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Vaccinations & Wellness</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">Stay on top of your pet's preventive care with our integrated health tracker. View upcoming milestones and book appointments in one click.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-slate-900">October 2024</h3>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-6 text-center">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-[10px] font-bold text-slate-400 tracking-widest">{day}</div>
                ))}
                {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((date, index) => (
                  <div key={index} className={`py-4 relative ${date > 20 ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
                    {date}
                    {date === 3 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-rose-400 rounded-full"></div>}
                    {date === 9 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-full"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6 relative">
              <h3 className="font-bold text-slate-900 mb-6">Upcoming Milestones</h3>
              {[
                { name: "Rabies Vaccination", date: "Due: Oct 03, 2024", type: "VACCINE", color: "bg-rose-50 text-rose-500", icon: "vaccines" },
                { name: "Annual Heartworm Test", date: "Due: Oct 09, 2024", type: "TEST", color: "bg-purple-50 text-purple-500", icon: "biotech" },
                { name: "Distemper/Parvo", date: "Due: Nov 15, 2024", type: "VACCINE", color: "bg-blue-50 text-blue-500", icon: "medical_services" }
              ].map((item, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mb-2">{item.date}</p>
                    <button className="text-[10px] font-bold text-rose-600 uppercase tracking-widest hover:underline">BOOK APPOINTMENT</button>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs transition-colors">Check Full Schedule</button>
              
              <button className="absolute -bottom-2 -right-2 w-14 h-14 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-200 flex items-center justify-center hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">add_task</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white mt-20 pt-16 pb-8 border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-2xl font-black text-slate-900 tracking-tighter notranslate" translate="no">PetPlace</div>
            <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-rose-600 transition-colors">Clinic Finder</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Telehealth Terms</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-rose-600 transition-colors">Contact Support</a>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 text-center md:text-left">
            <p className="text-xs text-slate-400">© 2024 PetPlace Health & Veterinary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
