import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Scale, Store, Star, Send, Check } from 'lucide-react';
import { formatRupiah, formatBerat } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { produkAPI, getImageUrl } from '../services/api';
import RatingStars from '../components/ui/RatingStars';

export default function ProdukDetail() {
  const { id } = useParams();
  const { tambah } = useCart();
  const { user } = useAuth();
  const [produk, setProduk]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [jumlah, setJumlah]     = useState(1);
  const [added, setAdded]       = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview]     = useState({ bintang: 5, komentar: '' });
  const [ulasan, setUlasan]     = useState([]);
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    produkAPI.detail(Number(id))
      .then(data => {
        setProduk(data);
        setUlasan(data.ulasan || []);
      })
      .catch(err => {
        console.error(err);
        setProduk(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <p>Memuat produk...</p>
    </div>
  );

  if (!produk) return (
    <div style={{ padding: '5rem 0', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem' }}>🔍</div>
      <h2>Produk tidak ditemukan</h2>
      <Link to="/produk" className="btn btn-primary" style={{ marginTop: '1rem' }}>Kembali ke Produk</Link>
    </div>
  );

  const handleAddCart = () => {
    tambah(produk, jumlah);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = () => {
    if (!review.komentar.trim()) return;
    const newUlasan = { id: Date.now(), nama: user?.nama || 'Anonim', bintang: review.bintang, komentar: review.komentar, tanggal: new Date().toLocaleDateString('id-ID') };
    setUlasan(prev => [newUlasan, ...prev]);
    setReviewSent(true);
    setShowReview(false);
    setReview({ bintang: 5, komentar: '' });
  };

  const hargaAktif = produk.hargaDiskon || produk.harga;

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Beranda</Link>
          <span>/</span>
          <Link to="/produk" style={{ color: 'var(--text-muted)' }}>Produk</Link>
          <span>/</span>
          <span style={{ color: 'var(--primary)' }}>{produk.nama}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          {/* Image */}
          <div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-secondary)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={getImageUrl(produk.foto) || 'https://placehold.co/400x400/1C1C1C/666?text=No+Foto'}
                alt={produk.nama}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://placehold.co/400x400/1C1C1C/666?text=No+Foto'; }}
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`tag tag-${produk.jenisHewan}`}>{produk.jenisHewan === 'kucing' ? '🐱 Kucing' : '🐶 Anjing'}</span>
              <span className="badge badge-gray">{produk.tipeProduk}</span>
            </div>
            
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{produk.nama}</h1>
            
            <RatingStars rating={produk.rating} size={16} totalUlasan={produk.totalUlasan} />

            <div style={{ margin: '1.25rem 0' }}>
              {produk.hargaDiskon ? (
                <>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>{formatRupiah(produk.hargaDiskon)}</div>
                  <div className="price-original">{formatRupiah(produk.harga)}</div>
                </>
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>{formatRupiah(produk.harga)}</div>
              )}
            </div>

            {/* Kios info */}
            <Link to={`/kios-publik/${produk.idKios}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textDecoration: 'none' }}>
              <Store size={18} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dijual oleh</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{produk.namaKios}</div>
              </div>
            </Link>

            {/* Weight info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <Scale size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.85rem' }}>Berat produk: <strong style={{ color: 'var(--primary)' }}>{formatBerat(produk.beratGram)}</strong> (untuk kalkulasi ongkir)</span>
            </div>

            {/* Jumlah */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Jumlah:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button onClick={() => setJumlah(j => Math.max(1, j - 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{jumlah}</span>
                <button onClick={() => setJumlah(j => Math.min(produk.stok, j + 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stok: {produk.stok}</span>
            </div>

            {/* Total berat kalkulasi */}
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total berat ({jumlah} item)</span>
                <span style={{ fontWeight: 700 }}>{formatBerat(produk.beratGram * jumlah)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total harga</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatRupiah(hargaAktif * jumlah)}</span>
              </div>
            </div>

            <button onClick={handleAddCart} className={`btn btn-full btn-lg ${added ? 'btn-green' : 'btn-primary'}`}>
              {added ? <><Check size={18} /> Ditambahkan!</> : <><ShoppingCart size={18} /> Tambah ke Keranjang</>}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🔥 {produk.terjual} orang sudah membeli produk ini
            </p>
          </div>
        </div>

        {/* Deskripsi */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Deskripsi Produk</h3>
          <p style={{ lineHeight: 1.8 }}>{produk.deskripsi}</p>
        </div>

        {/* Ulasan Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3>Ulasan & Penilaian</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.5rem', color: 'var(--primary)' }}>{produk.rating}</span>
                <div>
                  <RatingStars rating={produk.rating} size={18} showNumber={false} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{produk.totalUlasan} ulasan</p>
                </div>
              </div>
            </div>
            {user && !reviewSent && (
              <button onClick={() => setShowReview(!showReview)} className="btn btn-outline-primary">
                <Star size={16} /> Tulis Ulasan
              </button>
            )}
          </div>

          {/* Form ulasan */}
          {showReview && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
              <h4 style={{ marginBottom: '1rem' }}>Tulis Ulasan Anda</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Bintang</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReview(r => ({ ...r, bintang: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.15s' }}>
                      {n <= review.bintang ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>
                    {['','Sangat Buruk','Buruk','Cukup','Bagus','Sangat Bagus'][review.bintang]}
                  </span>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Komentar & Saran</label>
                <textarea
                  value={review.komentar}
                  onChange={e => setReview(r => ({ ...r, komentar: e.target.value }))}
                  className="form-input"
                  placeholder="Bagikan pengalaman Anda dengan produk ini..."
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleSubmitReview} className="btn btn-primary btn-sm">
                  <Send size={14} /> Kirim Ulasan
                </button>
                <button onClick={() => setShowReview(false)} className="btn btn-secondary btn-sm">Batal</button>
              </div>
            </div>
          )}

          {reviewSent && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✅ Terima kasih! Ulasan Anda telah berhasil dikirim.
            </div>
          )}

          {/* Daftar ulasan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ulasan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</div>
                <p>Belum ada ulasan. Jadilah yang pertama!</p>
              </div>
            ) : ulasan.map(u => (
              <div key={u.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nama}`} alt={u.nama} className="avatar avatar-sm" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.nama}</div>
                      <RatingStars rating={u.bintang} size={12} showNumber={false} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.tanggal}</span>
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginTop: '0.5rem' }}>{u.komentar}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`@media(max-width:768px){.container > div:nth-child(2){grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
