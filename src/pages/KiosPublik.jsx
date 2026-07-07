import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, Clock, Calendar, ArrowLeft, Search, ShoppingCart, MessageCircle, CheckCircle } from 'lucide-react';
import { kiosAPI, getImageUrl, formatRupiah } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/ui/RatingStars';
import ProductDetailModal from '../components/ui/ProductDetailModal';

export default function KiosPublik() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tambah } = useCart();

  const [kios, setKios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [activeJenis, setActiveJenis] = useState('semua');
  const [selectedProdukId, setSelectedProdukId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await kiosAPI.detail(id);
        if (!data || !data.id) {
          setNotFound(true);
        } else {
          setKios(data);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const cleanPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleAppChat = () => {
    if (!user) {
      navigate('/masuk');
      return;
    }
    navigate('/akun/chat', {
      state: {
        idMitra: kios.id,
        tipeMitra: 'kios',
        nama: kios.nama,
        foto: kios.logo
      }
    });
  };

  const handleAdd = (e, produk) => {
    e.preventDefault();
    e.stopPropagation();
    tambah(produk);
    setAddedId(produk.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) return (
    <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid var(--primary)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '1rem'
      }} />
      <p>Memuat profil kios...</p>
    </div>
  );

  if (notFound || !kios) return (
    <div style={{ padding: '5rem 0', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
      <h2>Kios tidak ditemukan</h2>
      <Link to="/produk" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Kembali ke Halaman Produk
      </Link>
    </div>
  );

  // Filter products based on search and animal type (jenis hewan)
  const filteredProducts = (kios.produk || []).filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchJenis = activeJenis === 'semua' || p.jenisHewan === activeJenis;
    return matchSearch && matchJenis;
  });

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="container">
        
        {/* Back Navigation */}
        <Link to="/produk" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Kembali ke Belanja
        </Link>

        {/* Hero Banner Header */}
        <div style={{
          position: 'relative',
          height: '240px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)'
        }}>
          {/* Background image / gradient */}
          <img
            src={getImageUrl(kios.banner) || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200'}
            alt={kios.nama}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,15,15,0.95) 10%, rgba(15,15,15,0.4) 100%)'
          }} />
          
          {/* Profile details on top of banner */}
          <div style={{
            position: 'absolute',
            left: '2rem',
            bottom: '1.5rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {/* Logo */}
            <div style={{
              width: 90,
              height: 90,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '3px solid var(--border)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)',
              flexShrink: 0
            }}>
              <img
                src={getImageUrl(kios.logo) || `https://api.dicebear.com/7.x/identicon/svg?seed=${kios.nama}`}
                alt={kios.nama}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{kios.nama}</h1>
                {kios.verified === 1 && (
                  <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                    <CheckCircle size={12} /> Terverifikasi
                  </span>
                )}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <RatingStars rating={parseFloat(kios.rating) || 5.0} size={14} totalUlasan={kios.totalUlasan || 0} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {kios.kota || 'Makassar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Panel: Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Description */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontWeight: 700 }}>Deskripsi Kios</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {kios.deskripsi || 'Kios ini belum menambahkan deskripsi.'}
              </p>
            </div>

            {/* Product Catalog Header */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>🛍️ Katalog Produk Kios</h3>
                
                {/* Animal filter tab inside kiosk */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[
                    { value: 'semua', label: 'Semua' },
                    { value: 'kucing', label: '🐱 Kucing' },
                    { value: 'anjing', label: '🐶 Anjing' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveJenis(opt.value)}
                      className={`btn btn-xs ${activeJenis === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local search */}
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari produk di kios ini..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              {/* Products List inside Kios */}
              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📦</div>
                  <p style={{ fontWeight: 600 }}>Produk tidak ditemukan</p>
                  <p style={{ fontSize: '0.8rem' }}>Coba ubah kata pencarian atau filter kategori hewan.</p>
                </div>
              ) : (
                <div className="grid-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {filteredProducts.map(produk => (
                    <div
                      key={produk.id}
                      onClick={() => setSelectedProdukId(produk.id)}
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <div className="card" style={{
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.2s',
                        borderRadius: 'var(--radius-lg)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        {/* Image aspect ratio container */}
                        <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                          <img
                            src={getImageUrl(produk.foto) || 'https://placehold.co/300x200/1C1C1C/666?text=No+Foto'}
                            alt={produk.nama}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = 'https://placehold.co/300x200/1C1C1C/666?text=No+Foto'; }}
                          />
                          {produk.hargaDiskon && (
                            <span className="badge badge-orange" style={{ position: 'absolute', top: 8, left: 8, fontSize: '0.7rem' }}>
                              -{Math.round(((produk.harga - produk.hargaDiskon) / produk.harga) * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {/* Info details */}
                        <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h4 style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginBottom: '0.35rem',
                            lineHeight: 1.3,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {produk.nama}
                          </h4>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <RatingStars rating={parseFloat(produk.rating) || 5.0} size={10} totalUlasan={0} showNumber={false} />
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginTop: '0.5rem' }}>
                            <div>
                              {produk.hargaDiskon ? (
                                <>
                                  <div className="price-discount" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                                    {formatRupiah(produk.hargaDiskon)}
                                  </div>
                                  <div className="price-original" style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                    {formatRupiah(produk.harga)}
                                  </div>
                                </>
                              ) : (
                                <div className="price-normal" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                  {formatRupiah(produk.harga)}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => handleAdd(e, produk)}
                              className={`btn btn-sm ${addedId === produk.id ? 'btn-green' : 'btn-primary'}`}
                              style={{ padding: '0.35rem 0.6rem', height: 'auto', minWidth: 'auto' }}
                            >
                              {addedId === produk.id ? '✓' : <ShoppingCart size={13} />}
                            </button>
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Stok: {produk.stok} • {produk.terjual} Terjual
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Details & Actions */}
          <div style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Action buttons */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Hubungi Mitra</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Whatsapp Redirect */}
                {kios.telepon && (
                  <a
                    href={`https://wa.me/${cleanPhone(kios.telepon)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-full"
                    style={{ textDecoration: 'none', background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', gap: '0.5rem' }}
                  >
                    <Phone size={16} /> WhatsApp Kios
                  </a>
                )}
                
                {/* Internal Chat */}
                <button
                  onClick={handleAppChat}
                  className="btn btn-primary btn-full"
                  style={{ gap: '0.5rem' }}
                >
                  <MessageCircle size={16} /> Chat di Aplikasi
                </button>
              </div>
            </div>

            {/* Kios Operational Details */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>⏰ Jam Operasional</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> Hari Operasi</span>
                  <span style={{ fontWeight: 700 }}>{kios.hariOperasi || 'Senin - Sabtu'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Jam Buka</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {kios.jamBuka?.substring(0, 5) || '08:00'} - {kios.jamTutup?.substring(0, 5) || '17:00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontWeight: 700 }}>📍 Lokasi</h4>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{kios.kota || 'Makassar'}</p>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{kios.alamat || 'Alamat tidak dicantumkan.'}</p>
                </div>
              </div>
            </div>

            {/* Email contact */}
            {kios.email && (
              <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{kios.email}</span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProdukId && (
        <ProductDetailModal produkId={selectedProdukId} onClose={() => setSelectedProdukId(null)} />
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
