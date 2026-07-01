import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }} translate="no" className="notranslate">
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,var(--primary),#F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🐾</div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>Pet<span style={{ color: 'var(--primary)' }}>Place</span></span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 240 }}>
              Platform marketplace hewan peliharaan terpercaya di Sulawesi Selatan. Khusus kucing 🐱 dan anjing 🐶.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Social icons row */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {/* Instagram — link ke akun nyata */}
                <a
                  href="https://www.instagram.com/petpetkharismapalace?igsh=NWZnb2tqaWRucmVk"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram @petpetkharismapalace"
                  style={{
                    width: 36, height: 36,
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E1306C'; e.currentTarget.style.color = '#E1306C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Instagram size={16} />
                </a>

                {/* Facebook */}
                <a href="#" style={{
                  width: 36, height: 36,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Facebook size={16} />
                </a>

                {/* Twitter */}
                <a href="#" style={{
                  width: 36, height: 36,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Twitter size={16} />
                </a>
              </div>

              {/* Label Instagram */}
              <a
                href="https://www.instagram.com/petpetkharismapalace?igsh=NWZnb2tqaWRucmVk"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.78rem', color: '#E1306C',
                  fontWeight: 600, textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Instagram size={13} />
                @petpetkharismapalace
              </a>
            </div>
          </div>

          {/* Produk */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Produk</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: '🐱 Makanan Kucing', href: '/produk/makanan-kucing' },
                { label: '🐶 Makanan Anjing', href: '/produk/makanan-anjing' },
                { label: '🪣 Pasir Kucing', href: '/produk/pasir-kucing' },
                { label: '🪣 Pasir Anjing', href: '/produk/pasir-anjing' },
                { label: '🎾 Mainan Kucing', href: '/produk/mainan-kucing' },
                { label: '🦴 Mainan Anjing', href: '/produk/mainan-anjing' },
              ].map(item => (
                <Link key={item.href} to={item.href} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Layanan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: '🏥 Dokter Hewan', href: '/dokter' },
                { label: '✂️ Grooming', href: '/grooming' },
                { label: '🗺️ Peta Mitra', href: '/peta' },
                { label: '🏪 Buka Kios', href: '/akun/daftar-kios' },
                { label: '📋 Daftar Dokter', href: '/daftar?peran=dokter' },
                { label: '✂️ Daftar Grooming', href: '/daftar?peran=grooming' },
              ].map(item => (
                <Link key={item.href} to={item.href} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Hubungi Kami</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { icon: MapPin, text: 'Makassar, Sulawesi Selatan, Indonesia' },
                { icon: Phone, text: '+62 812-3456-7890' },
                { icon: Mail, text: 'palacepet92@gmail.com' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Icon size={16} style={{ color: 'var(--primary)', marginTop: 3, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Komisi Platform</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>10%</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per transaksi berhasil</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2024 PetPlace. Semua hak dilindungi.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Dibuat dengan <Heart size={13} style={{ color: 'var(--primary)' }} /> untuk para pecinta hewan
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Kebijakan Privasi', 'Syarat & Ketentuan', 'FAQ'].map(item => (
              <a key={item} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
