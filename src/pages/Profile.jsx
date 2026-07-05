import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/masuk');
    }
  }, [user, navigate]);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nama: '', telepon: '', kota: '', foto: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Change Password States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        nama: user.nama || '',
        telepon: user.telepon || '',
        kota: user.kota || 'Makassar',
        foto: user.foto || '',
      });
    }
  }, [user, isEditing]);

  if (!user) return null;

  const handleLogout = () => {
    sessionStorage.removeItem('petplace_token');
    window.location.href = '/masuk';
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Ukuran foto maksimal adalah 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(f => ({ ...f, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await updateProfile(editForm);
      setProfileSuccess('Profil berhasil diperbarui!');
      setTimeout(() => {
        setIsEditing(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err) {
      setProfileError(err.message || 'Gagal menyimpan profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('Konfirmasi password tidak cocok');
      setPassLoading(false);
      return;
    }

    try {
      const { authAPI } = await import('../services/api');
      await authAPI.changePassword(passForm.oldPassword, passForm.newPassword);
      setPassSuccess('Password berhasil diubah!');
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPassSuccess('');
      }, 1500);
    } catch (err) {
      setPassError(err.message || 'Gagal mengubah password. Pastikan password lama benar.');
    } finally {
      setPassLoading(false);
    }
  };

  // Map roles to nice badge labels
  const roleBadges = {
    admin: { label: 'Administrator 🛡️', bg: '#fef3c7', text: '#d97706' },
    owner: { label: 'Pemilik Kios 🏪', bg: '#dbeafe', text: '#2563eb' },
    dokter: { label: 'Dokter Hewan 🏥', bg: '#e0f2fe', text: '#0369a1' },
    grooming: { label: 'Groomer Profesional ✂️', bg: '#fceef2', text: '#bd0a36' },
    pembeli: { label: 'Pembeli 🛒', bg: '#dcfce7', text: '#15803d' },
  };

  const activeBadge = roleBadges[user.peran] || { label: user.peran, bg: '#f3f4f6', text: '#374151' };

  // Helper dynamic link untuk role tertentu ke dashboard mereka
  const getDashboardPath = () => {
    if (user.peran === 'admin') return '/admin';
    if (user.peran === 'owner') return '/kios';
    if (user.peran === 'dokter') return '/portal-dokter';
    if (user.peran === 'grooming') return '/portal-grooming';
    return null;
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
          <button 
            onClick={() => setIsEditing(true)} 
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit Profil"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </header>

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center py-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {user.foto ? (
                <img src={getImageUrl(user.foto)} alt={user.nama} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
              )}
            </div>
            <button 
              onClick={() => setIsEditing(true)} 
              className="absolute bottom-1 right-1 w-8 h-8 bg-[#bd0a36] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">{user.nama}</h1>
          <div className="flex flex-col items-center gap-2 mb-2">
            <span 
              className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: activeBadge.bg, color: activeBadge.text }}
            >
              {activeBadge.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {user.kota || 'Makassar'}
          </p>
        </div>

        {/* DETAILS SECTION */}
        <div className="px-6 mb-8">
          <h2 className="text-base font-black text-slate-900 mb-4">Informasi Akun</h2>
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</span>
              <span className="text-sm font-semibold text-slate-700">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">No. Telepon</span>
              <span className="text-sm font-semibold text-slate-700">{user.telepon || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kota</span>
              <span className="text-sm font-semibold text-slate-700">{user.kota || 'Makassar'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bergabung Sejak</span>
              <span className="text-sm font-semibold text-slate-700">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* ACCOUNT & SECURITY */}
        <div className="px-6 mb-8">
          <h2 className="text-base font-black text-slate-900 mb-4">Pengaturan & Keamanan</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
            <button onClick={() => setIsEditing(true)} className="w-full px-5 py-4 flex items-center justify-between group text-left">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Ubah Data Diri</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button onClick={() => setIsChangingPassword(true)} className="w-full px-5 py-4 flex items-center justify-between group text-left">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <span className="text-sm font-bold text-slate-700">Ganti Password</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            {getDashboardPath() && (
              <button onClick={() => navigate(getDashboardPath())} className="w-full px-5 py-4 flex items-center justify-between group text-left">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#bd0a36] transition-all">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Ke Dashboard Layanan</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-auto bg-white border-t border-slate-50 px-6 py-4 flex flex-col gap-6">
          <nav className="flex flex-col gap-1">
            <button onClick={() => navigate('/')} className="w-full py-3.5 flex items-center gap-4 text-slate-400 hover:text-slate-600 transition-colors">
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

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg">✏️ Edit Profil</h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-100 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="p-6 space-y-4">
              {profileError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100">
                  ⚠️ {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl text-xs font-semibold border border-green-100">
                  ✅ {profileSuccess}
                </div>
              )}

              {/* Upload Foto */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden relative group">
                  {editForm.foto ? (
                    <img src={getImageUrl(editForm.foto)} alt="Upload Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300 flex items-center justify-center h-full">person</span>
                  )}
                </div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-200">
                  Pilih Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    value={editForm.nama} 
                    onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="Nama Lengkap" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">No. Telepon</label>
                  <input 
                    type="text" 
                    value={editForm.telepon} 
                    onChange={e => setEditForm(f => ({ ...f, telepon: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="08xxxxxxxxxx" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Kota Asal</label>
                  <input 
                    type="text" 
                    value={editForm.kota} 
                    onChange={e => setEditForm(f => ({ ...f, kota: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="Contoh: Makassar" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={profileLoading}
                className="w-full bg-[#bd0a36] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-200 hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all"
              >
                {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg">🔒 Ganti Password</h3>
              <button 
                onClick={() => setIsChangingPassword(false)} 
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-100 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {passError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100">
                  ⚠️ {passError}
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl text-xs font-semibold border border-green-100">
                  ✅ {passSuccess}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Password Lama</label>
                  <input 
                    required 
                    type="password" 
                    value={passForm.oldPassword} 
                    onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="Masukkan password saat ini" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Password Baru</label>
                  <input 
                    required 
                    type="password" 
                    value={passForm.newPassword} 
                    onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="Minimal 6 karakter" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Konfirmasi Password Baru</label>
                  <input 
                    required 
                    type="password" 
                    value={passForm.confirmPassword} 
                    onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#bd0a36] text-sm"
                    placeholder="Ulangi password baru" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={passLoading}
                className="w-full bg-[#bd0a36] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-200 hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all"
              >
                {passLoading ? 'Memproses...' : 'Ubah Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
