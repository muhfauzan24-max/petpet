import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Cat, Dog, Stethoscope, Scissors, User, LogOut, Store, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotifikasiBell } from '../ui/Notifikasi';

const navLinks = [
  { label: 'Produk', href: '/produk', icon: null,
    submenu: [
      { label: '🐱 Makanan Kucing', href: '/produk/makanan-kucing' },
      { label: '🐶 Makanan Anjing', href: '/produk/makanan-anjing' },
      { label: '🪣 Pasir Kucing', href: '/produk/pasir-kucing' },
      { label: '🪣 Pasir Anjing', href: '/produk/pasir-anjing' },
      { label: '🎾 Mainan Kucing', href: '/produk/mainan-kucing' },
      { label: '🦴 Mainan Anjing', href: '/produk/mainan-anjing' },
    ]
  },
  { label: 'Dokter', href: '/dokter', icon: Stethoscope },
  { label: 'Grooming', href: '/grooming', icon: Scissors },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [produkOpen, setProdukOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); setProdukOpen(false); setUserMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/produk?q=${encodeURIComponent(search.trim())}`);
  };

  const getDashboardLink = () => {
    if (!user) return '/masuk';
    // Cek peran dari field peran
    switch (user.peran) {
      case 'admin':    return '/admin';
      case 'owner':    return '/kios';
      case 'dokter':   return '/portal-dokter';
      case 'grooming': return '/portal-grooming';
    }
    // Fallback: cek apakah user memiliki kios/dokter/grooming meski peran belum terupdate
    if (user.kios)     return '/kios';
    if (user.dokter)   return '/portal-dokter';
    if (user.grooming) return '/portal-grooming';
    return '/akun';
  };

  // Label icon dashboard sesuai peran
  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.peran === 'admin')                 return '🛡️ Admin Panel';
    if (user.peran === 'owner' || user.kios)    return '🏪 Dashboard Kios';
    if (user.peran === 'dokter' || user.dokter) return '🏥 Dashboard Dokter';
    if (user.peran === 'grooming' || user.grooming) return '✂️ Dashboard Grooming';
    return '👤 Dashboard';
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(15,15,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 1.5rem',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }} translate="no" className="notranslate">
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, var(--primary), #F59E0B)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', boxShadow: 'var(--shadow-glow)',
          }}>🐾</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem' }}>
            Pet<span style={{ color: 'var(--primary)' }}>Place</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} className="desktop-nav">
          {navLinks.map(link => (
            link.submenu ? (
              <div key={link.label} style={{ position: 'relative' }}
                onMouseEnter={() => setProdukOpen(true)}
                onMouseLeave={() => setProdukOpen(false)}
              >
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.5rem 0.85rem',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: location.pathname.startsWith('/produk') ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '0.9rem',
                  fontFamily: 'Plus Jakarta Sans', borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition)',
                }}>
                  {link.label}
                  <ChevronDown size={14} style={{ transform: produkOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {produkOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.5rem',
                    minWidth: 220,
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    {link.submenu.map(sub => (
                      <Link key={sub.href} to={sub.href} style={{
                        display: 'block', padding: '0.6rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem', fontWeight: 500,
                        color: location.pathname === sub.href ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'var(--transition)',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = location.pathname === sub.href ? 'var(--primary)' : 'var(--text-secondary)'; }}
                      >{sub.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.href} to={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.5rem 0.85rem',
                color: location.pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition)',
              }}>
                {link.icon && <link.icon size={15} />}
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari produk..."
                autoFocus
                className="form-input"
                style={{ padding: '0.45rem 0.9rem', width: 200, fontSize: '0.85rem' }}
              />
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-md)', transition: 'var(--transition)' }}>
              <Search size={20} />
            </button>
          )}

          {/* Cart */}
          <Link to="/keranjang" style={{ position: 'relative', color: 'var(--text-secondary)', padding: '0.4rem' }}>
            <ShoppingCart size={20} />
            {totalItem > 0 && <span className="notif-badge">{totalItem > 9 ? '9+' : totalItem}</span>}
          </Link>

          {/* Notifikasi Bell — hanya untuk pembeli yang login */}
          {user && user.peran !== 'admin' && (
            <NotifikasiBell />
          )}

          {/* User */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                cursor: 'pointer', transition: 'var(--transition)',
              }}>
                <img src={user.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.nama} className="avatar avatar-sm" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.nama.split(' ')[0]}
                </span>
                <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '0.5rem',
                  minWidth: 200, boxShadow: 'var(--shadow-lg)', zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{user.nama}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.peran}</p>
                  </div>
                  <Link to={getDashboardLink()} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 700 }}>
                    <User size={15} /> {getDashboardLabel()}
                  </Link>
                  {user.peran === 'pembeli' && (
                    <>
                      <Link to="/akun/daftar-kios" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                        <Store size={15} /> Buka Kios
                      </Link>
                      {(!user.hasDokter && !user.dokterStatus) && (
                        <Link to="/akun/daftar-dokter" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Stethoscope size={15} /> Daftar Dokter
                        </Link>
                      )}
                      {(!user.hasGrooming && !user.groomingStatus) && (
                        <Link to="/akun/daftar-grooming" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Scissors size={15} /> Daftar Grooming
                        </Link>
                      )}
                    </>
                  )}
                  {user.peran === 'owner' && (
                    <>
                      {(!user.hasDokter && !user.dokterStatus) && (
                        <Link to="/akun/daftar-dokter" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Stethoscope size={15} /> Daftar Dokter
                        </Link>
                      )}
                      {(!user.hasGrooming && !user.groomingStatus) && (
                        <Link to="/akun/daftar-grooming" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Scissors size={15} /> Daftar Grooming
                        </Link>
                      )}
                    </>
                  )}
                  {user.peran === 'admin' && (
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                  <button onClick={() => { logout(); navigate('/'); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#F87171', fontSize: '0.875rem', fontWeight: 500,
                    fontFamily: 'Plus Jakarta Sans',
                  }}>
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/masuk" className="btn btn-secondary btn-sm">Masuk</Link>
              <Link to="/daftar" className="btn btn-primary btn-sm">Daftar</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none' }} className="mobile-menu-btn">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{
          background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem', animation: 'fadeIn 0.2s ease',
        }}>
          {navLinks.map(link => (
            <div key={link.label}>
              <Link to={link.href} style={{ display: 'block', padding: '0.75rem 0', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                {link.label}
              </Link>
              {link.submenu && link.submenu.map(sub => (
                <Link key={sub.href} to={sub.href} style={{ display: 'block', padding: '0.6rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {sub.label}
                </Link>
              ))}
            </div>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/masuk" className="btn btn-secondary btn-full">Masuk</Link>
              <Link to="/daftar" className="btn btn-primary btn-full">Daftar</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
