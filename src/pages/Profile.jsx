import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { Edit2, Shield, Lock, Save, Trash, RefreshCw } from 'lucide-react';

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

  const getSidebarLinks = () => {
    const list = [
      { href: '/akun', icon: '🏠', label: 'Dashboard' },
      { href: '/akun/pesanan', icon: '📦', label: 'Pesanan Saya' },
      { href: '/akun/chat', icon: '💬', label: 'Chat' },
      { href: '/akun/hewan', icon: '🐾', label: 'Hewan Saya' },
    ];
    if (user?.peran !== 'owner') {
      list.push({ href: '/akun/daftar-kios', icon: '🏪', label: 'Buka Kios' });
    }
    if (user?.peran !== 'dokter' && !user?.hasDokter) {
      list.push({ href: '/akun/daftar-dokter', icon: '🏥', label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    if (user?.peran !== 'grooming' && !user?.hasGrooming) {
      list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    return list;
  };

  // Map roles to nice badge labels
  const roleBadges = {
    admin: { label: 'Administrator 🛡️', color: 'var(--secondary)' },
    owner: { label: 'Pemilik Kios 🏪', color: 'var(--primary)' },
    dokter: { label: 'Dokter Hewan 🏥', color: 'var(--dog-blue)' },
    grooming: { label: 'Groomer Profesional ✂️', color: 'var(--accent)' },
    pembeli: { label: 'Pembeli 🛒', color: 'var(--primary)' },
  };

  const activeBadge = roleBadges[user.peran] || { label: user.peran, color: 'var(--text-primary)' };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Profile Card Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user.foto ? getImageUrl(user.foto) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              alt={user.nama} 
              style={{ width: 100, height: 100, borderRadius: '50%', objectCover: 'cover', border: `3px solid ${activeBadge.color}` }} 
            />
            <button 
              onClick={() => setIsEditing(true)}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
            >
              <Edit2 size={14} />
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{user.nama}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: activeBadge.color }}>
                {activeBadge.label}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 {user.kota || 'Makassar'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info & Security Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Info Details */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>📋 Informasi Diri</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>Email</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>No. Telepon</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.telepon || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>Kota Asal</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.kota || 'Makassar'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>Bergabung Sejak</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions / Security */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>🔒 Pengaturan Keamanan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
              >
                <Edit2 size={16} /> Ubah Data Diri
              </button>
              
              <button 
                onClick={() => setIsChangingPassword(true)} 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
              >
                <Lock size={16} /> Ganti Password
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 450, width: '100%', padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>✏️ Ubah Data Diri</h3>
            
            <form onSubmit={handleUpdateProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profileError && <div className="alert alert-error">{profileError}</div>}
              {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

              {/* Upload Foto */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src={editForm.foto ? getImageUrl(editForm.foto) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Preview" 
                  style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--border)', objectFit: 'cover' }} 
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  Pilih Foto Baru
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input 
                  required 
                  value={editForm.nama} 
                  onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))}
                  className="form-input" 
                  placeholder="Nama Lengkap" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon</label>
                <input 
                  value={editForm.telepon} 
                  onChange={e => setEditForm(f => ({ ...f, telepon: e.target.value }))}
                  className="form-input" 
                  placeholder="08xxxxxxxxxx" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kota Asal</label>
                <input 
                  value={editForm.kota} 
                  onChange={e => setEditForm(f => ({ ...f, kota: e.target.value }))}
                  className="form-input" 
                  placeholder="Contoh: Makassar" 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={profileLoading}>
                  {profileLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI PASSWORD */}
      {isChangingPassword && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 450, width: '100%', padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>🔒 Ganti Password</h3>
            
            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {passError && <div className="alert alert-error">{passError}</div>}
              {passSuccess && <div className="alert alert-success">{passSuccess}</div>}

              <div className="form-group">
                <label className="form-label">Password Lama</label>
                <input 
                  required 
                  type="password"
                  value={passForm.oldPassword} 
                  onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
                  className="form-input" 
                  placeholder="Password saat ini" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input 
                  required 
                  type="password"
                  value={passForm.newPassword} 
                  onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="form-input" 
                  placeholder="Min. 6 karakter" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input 
                  required 
                  type="password"
                  value={passForm.confirmPassword} 
                  onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="form-input" 
                  placeholder="Ulangi password baru" 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={passLoading}>
                  {passLoading ? 'Memproses...' : 'Ubah Password'}
                </button>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
