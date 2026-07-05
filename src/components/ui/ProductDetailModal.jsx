import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Scale, Store, Star, Send, Check, X, AlertTriangle, Eye } from 'lucide-react';
import { formatRupiah, formatBerat } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { produkAPI, getImageUrl } from '../../services/api';
import RatingStars from './RatingStars';

export default function ProductDetailModal({ produkId, onClose }) {
  const navigate = useNavigate();
  const { tambah } = useCart();
  const { user } = useAuth();

  const [produk, setProduk]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [jumlah, setJumlah]     = useState(1);
  const [added, setAdded]       = useState(false);
  const [toast, setToast]       = useState(null);

  // Reviews state
  const [ulasan, setUlasan]         = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ bintang: 5, komentar: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDetail = () => {
    setLoading(true);
    produkAPI.detail(produkId)
      .then(data => {
        setProduk(data);
        setUlasan(data.ulasan || []);
      })
      .catch(err => {
        console.error(err);
        showToast('error', 'Gagal memuat detail produk');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (produkId) {
      loadDetail();
    }
  }, [produkId]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 28, height: 28, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
          <p>Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!produk) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: 400 }}>
          <AlertTriangle size={48} style={{ color: '#EF4444', marginBottom: '1rem' }} />
          <h3>Produk tidak ditemukan</h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ marginTop: '1.25rem' }}>Tutup</button>
        </div>
      </div>
    );
  }

  const hargaAktif = produk.hargaDiskon || produk.harga;

  // Add to Cart
  const handleAddCart = () => {
    tambah(produk, jumlah);
    setAdded(true);
    showToast('success', `✅ ${produk.nama} (${jumlah}x) ditambahkan ke keranjang!`);
    setTimeout(() => setAdded(false), 2000);
  };

  // Buy Now (Add to cart & redirect to checkout / keranjang)
  const handleBuyNow = () => {
    tambah(produk, jumlah);
    navigate('/keranjang');
  };

  // Submit review to DB
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.komentar.trim()) {
      showToast('error', 'Silakan tulis komentar ulasan terlebih dahulu!');
      return;
    }
    setSubmittingReview(true);
    try {
      await produkAPI.review({
        id_produk: produk.id,
        bintang: reviewForm.bintang,
        komentar: reviewForm.komentar,
      });

      showToast('success', '✅ Ulasan berhasil dikirim!');
      setShowReviewForm(false);
      setReviewForm({ bintang: 5, komentar: '' });
      
      // Reload product details to fetch new reviews and updated rating
      produkAPI.detail(produkId).then(data => {
        setProduk(data);
        setUlasan(data.ulasan || []);
      });
    } catch (err) {
      showToast('error', err.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: "fixed", top: 90, right: 24, zIndex: 11000,
          background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
          color: "#fff", borderRadius: "var(--radius-lg)", padding: "0.9rem 1.5rem",
          fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: "0.5rem",
          animation: "slideIn 0.3s ease",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:"1.1rem", marginLeft: "0.5rem" }}>×</button>
        </div>
      )}

      {/* Modal Card */}
      <div className="card-glass" style={{ width: '100%', maxWidth: 740, maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Tutup Detail">
          <X size={22} />
        </button>

        {/* Top Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Product Image */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-secondary)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <img
                src={getImageUrl(produk.foto) || 'https://placehold.co/400x400/1C1C1C/666?text=No+Foto'}
                alt={produk.nama}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://placehold.co/400x400/1C1C1C/666?text=No+Foto'; }}
              />
            </div>
            {produk.hargaDiskon && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <span className="badge badge-orange" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  🔥 Hemat {Math.round(((produk.harga - produk.hargaDiskon) / produk.harga) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`tag tag-${produk.jenisHewan}`}>{produk.jenisHewan === 'kucing' ? '🐱 Kucing' : '🐶 Anjing'}</span>
              <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{produk.tipeProduk}</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>{produk.nama}</h2>
            
            {/* Rating */}
            <div style={{ marginBottom: '0.75rem' }}>
              <RatingStars rating={parseFloat(produk.rating) || 0} size={14} totalUlasan={produk.totalUlasan} />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1.25rem' }}>
              {produk.hargaDiskon ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>{formatRupiah(produk.hargaDiskon)}</span>
                  <span className="price-original" style={{ fontSize: '0.9rem' }}>{formatRupiah(produk.harga)}</span>
                </div>
              ) : (
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{formatRupiah(produk.harga)}</div>
              )}
            </div>

            {/* Kios info */}
            <Link to={`/kios-publik/${produk.idKios}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <Store size={18} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dijual oleh</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>🏪 {produk.namaKios}</div>
              </div>
            </Link>

            {/* Weight */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <Scale size={14} style={{ color: 'var(--primary)' }} />
              <span>Berat: <strong>{formatBerat(produk.beratGram)}</strong></span>
              <span>•</span>
              <span>Stok: <strong>{produk.stok}</strong></span>
              <span>•</span>
              <span>Terjual: <strong>{produk.terjual}</strong></span>
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Jumlah:</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 32 }}>
                <button onClick={() => setJumlah(j => Math.max(1, j - 1))} style={{ width: 30, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{jumlah}</span>
                <button onClick={() => setJumlah(j => Math.min(produk.stok, j + 1))} style={{ width: 30, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                Total: {formatRupiah(hargaAktif * jumlah)}
              </span>
            </div>

            {/* Two Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                onClick={handleAddCart}
                className={`btn btn-secondary btn-sm`}
                style={{ flex: 1, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: added ? '#10B981' : undefined, color: added ? '#fff' : undefined }}
              >
                {added ? <Check size={15} /> : <ShoppingCart size={15} />}
                {added ? 'Ditambahkan' : 'Masukkan Keranjang'}
              </button>

              <button
                onClick={handleBuyNow}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                💳 Beli Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Deskripsi Produk</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-line' }}>{produk.deskripsi || 'Tidak ada deskripsi produk.'}</p>
        </div>

        {/* Reviews Section */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>💬 Penilaian & Ulasan</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>⭐ {parseFloat(produk.rating).toFixed(1) || '0.0'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({produk.totalUlasan} ulasan)</span>
              </div>
            </div>
            {user && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="btn btn-outline-primary btn-xs">
                ⭐ Tulis Ulasan
              </button>
            )}
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
              <h5 style={{ margin: '0 0 0.75rem 0' }}>Tulis Ulasan Anda</h5>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Rating Bintang</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(rf => ({ ...rf, bintang: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
                      {n <= reviewForm.bintang ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>
                    {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewForm.bintang]}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Komentar Ulasan</label>
                <textarea
                  required
                  value={reviewForm.komentar}
                  onChange={e => setReviewForm(rf => ({ ...rf, komentar: e.target.value }))}
                  className="form-input"
                  placeholder="Bagikan ulasan jujur Anda tentang produk ini..."
                  rows={2}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.3' }}>
                  {submittingReview ? 'Mengirim...' : <><Send size={11}/> Kirim</>}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary btn-xs">Batal</button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 200, overflowY: 'auto' }}>
            {ulasan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Belum ada ulasan untuk produk ini.
              </div>
            ) : ulasan.map(u => (
              <div key={u.id} style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nama}`} alt={u.nama} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{u.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: '#F59E0B' }}>{'★'.repeat(u.bintang)}{'☆'.repeat(5 - u.bintang)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{u.tanggal}</span>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{u.komentar}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
