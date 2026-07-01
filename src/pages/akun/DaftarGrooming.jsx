import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { groomingAPI } from '../../services/api';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function DaftarGrooming() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ namaSalon: '', telepon: '', alamat: '', deskripsi: '', namaBank: '', noRekening: '', namaPemilikRek: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    return list;
  };

  const isPending = user?.groomingStatus === 'pending';
  const isActive = user?.hasGrooming || user?.peran === 'grooming';

  if (isActive) {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✂️</div>
            <h2>Anda sudah terdaftar sebagai Penyedia Grooming!</h2>
            <p style={{ marginBottom: '1.5rem' }}>Kelola booking salon Anda di Portal Grooming</p>
            <button onClick={() => navigate('/portal-grooming')} className="btn btn-primary btn-lg">
              Ke Portal Grooming <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaSalon || !form.namaBank || !form.noRekening || !form.namaPemilikRek) {
      setError('Mohon lengkapi semua field yang wajib diisi termasuk informasi rekening.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await groomingAPI.daftar({
        nama: form.namaSalon,
        telepon: form.telepon,
        alamat: form.alamat,
        deskripsi: form.deskripsi,
        namaBank: form.namaBank,
        noRekening: form.noRekening,
        namaPemilikRek: form.namaPemilikRek,
        kota: 'Makassar',
      });
      // Update local user state
      login({ ...user, groomingStatus: 'pending' });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan grooming. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success || isPending) {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s infinite' }}>⏳</div>
            <h2>Pendaftaran Grooming Sedang Direview!</h2>
            <p style={{ maxWidth: 450, margin: '0.75rem auto 1.5rem', color: 'var(--text-muted)' }}>
              Permintaan pendaftaran Layanan Grooming Anda sedang diverifikasi oleh Admin PetPlace. 
              Proses verifikasi membutuhkan waktu 1-2 hari kerja.
            </p>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '0.5rem' }}>✂️ Daftar Layanan Grooming</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Mulai menerima order grooming kucing dan anjing dari area sekitar Anda melalui PetPlace</p>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>📋 Informasi Salon Grooming</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Nama Salon Grooming <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.namaSalon} onChange={e => setForm(f => ({ ...f, namaSalon: e.target.value }))} className="form-input" placeholder="Contoh: Happy Paws Gowa" />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon Salon <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))} className="form-input" placeholder="08xx-xxxx-xxxx" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Alamat Lengkap Salon <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} className="form-input" placeholder="Jl. Veteran Selatan No. 12..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Deskripsi Fasilitas & Layanan</label>
                <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} className="form-input" placeholder="Jelaskan jenis grooming yang Anda tawarkan (mandi kutu, mandi jamur, potong rambut, dll)..." rows={3} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>💳 Rekening Bank Pembayaran</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { key: 'namaBank', label: 'Nama Bank', placeholder: 'BCA, BNI, Mandiri...' },
                { key: 'noRekening', label: 'No. Rekening', placeholder: '1234567890' },
                { key: 'namaPemilikRek', label: 'Nama Pemilik Rekening', placeholder: 'Sesuai buku tabungan' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input required value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>


          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Mengirimkan Pendaftaran...' : 'Daftarkan Layanan Grooming Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
