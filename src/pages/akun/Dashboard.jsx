import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, PawPrint, Store, Clock, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export default function AkunDashboard() {
  const { user } = useAuth();
  const pesanan = JSON.parse(localStorage.getItem('petplace_pesanan') || '[]').reverse();

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

  const getQuickActions = () => {
    const actions = [
      { href: '/produk', icon: '🛒', label: 'Belanja Sekarang', desc: 'Temukan produk terbaik', color: 'var(--primary)' },
    ];
    if (user?.peran !== 'owner') {
      actions.push({ href: '/akun/daftar-kios', icon: '🏪', label: 'Buka Kios', desc: 'Mulai jualan produk hewan', color: 'var(--secondary)' });
    }
    if (user?.peran !== 'dokter' && !user?.hasDokter && !user?.dokterStatus) {
      actions.push({ href: '/akun/daftar-dokter', icon: '🏥', label: 'Daftar Dokter', desc: 'Konsultasi hewan online', color: 'var(--dog-blue)' });
    }
    if (user?.peran !== 'grooming' && !user?.hasGrooming && !user?.groomingStatus) {
      actions.push({ href: '/akun/daftar-grooming', icon: '✂️', label: 'Daftar Grooming', desc: 'Layanan salon hewan', color: 'var(--accent)' });
    }
    return actions;
  };

  const stats = [
    { label: 'Total Pesanan', value: pesanan.length, icon: '📦', color: 'var(--primary)' },
    { label: 'Sedang Diproses', value: pesanan.filter(p => p.status === 'diproses').length, icon: '⚙️', color: 'var(--secondary)' },
    { label: 'Selesai', value: pesanan.filter(p => p.status === 'selesai').length, icon: '✅', color: 'var(--accent)' },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '5rem', opacity: 0.1 }}>🐾</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={user?.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt={user?.nama} style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid var(--primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Halo, {user?.nama?.split(' ')[0]}! 👋</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Selamat berbelanja di PetPlace</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Menu Cepat</h3>
          <div className="grid-2">
            {getQuickActions().map(item => (
              <Link key={item.href} to={item.href} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.5rem', width: 48, height: 48, background: `${item.color}15`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pesanan terbaru */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Pesanan Terbaru</h3>
            <Link to="/akun/pesanan" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat semua →</Link>
          </div>
          {pesanan.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📦</div>
              <p style={{ color: 'var(--text-muted)' }}>Belum ada pesanan</p>
              <Link to="/produk" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Mulai Belanja</Link>
            </div>
          ) : pesanan.slice(0, 3).map(p => (
            <div key={p.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>#{p.kode}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.items?.length} produk • {new Date(p.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.totalBayar)}</div>
                <span className={`badge ${p.status === 'selesai' ? 'badge-green' : p.status === 'diproses' ? 'badge-purple' : 'badge-orange'}`} style={{ fontSize: '0.65rem' }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
