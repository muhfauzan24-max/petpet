import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Search, RefreshCw } from 'lucide-react';
import { kategoriProduk, formatRupiah } from '../data/mockData';
import { produkAPI, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import RatingStars from '../components/ui/RatingStars';

export default function Produk() {
  const { kategori } = useParams();
  const navigate = useNavigate();
  const { tambah } = useCart();
  const [allProduk, setAllProduk] = useState([]);
  const [search, setSearch]       = useState('');
  const [activeKat, setActiveKat] = useState(kategori || 'semua');
  const [activeJenis, setActiveJenis] = useState('semua');
  const [sortBy, setSortBy]       = useState('terlaris');
  const [addedId, setAddedId]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { limit: 60 };

      // ─── Filter kategori: kirim slug langsung ke backend ───────────────
      // Backend: WHERE kp.slug = ? (filter persis per kategori)
      if (activeKat !== 'semua') {
        params.kategori = activeKat;   // slug, e.g. "makanan-kucing"
      }

      // ─── Filter jenis hewan (hanya berlaku saat kategori = "semua") ────
      // Kalau kategori sudah dipilih, jenis sudah implicit dari slug kategori
      if (activeJenis !== 'semua' && activeKat === 'semua') {
        params.jenis = activeJenis;
      }

      if (search) params.q = search;

      // Sort
      const sortMap = { terlaris: 'terjual', rating: 'rating_avg', 'harga-asc': 'harga', 'harga-desc': 'harga' };
      params.sort = sortMap[sortBy] || 'terjual';
      params.dir  = sortBy === 'harga-asc' ? 'asc' : 'desc';

      const data = await produkAPI.list(params);
      setAllProduk(data.produk || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeKat, activeJenis, sortBy]);

  // Saat URL kategori berubah, update activeKat dan sync activeJenis
  useEffect(() => {
    if (kategori) {
      setActiveKat(kategori);
      // Sync tombol jenis hewan sesuai kategori yang dipilih
      const katObj = kategoriProduk.find(k => k.slug === kategori);
      if (katObj) setActiveJenis(katObj.jenis);
      else setActiveJenis('semua');
    } else {
      setActiveKat('semua');
    }
  }, [kategori]);


  const handleAdd = (e, produk) => {
    e.preventDefault();
    tambah(produk);
    setAddedId(produk.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Beranda</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--primary)' }}>Produk</span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            {activeKat !== 'semua'
              ? kategoriProduk.find(k => k.slug === activeKat)?.nama || 'Produk'
              : 'Semua Produk'
            }
          </h1>
          <p>{loading ? 'Memuat...' : `${total} produk ditemukan`}</p>
        </div>

        {/* Jenis filter tabs — hanya berfungsi saat kategori = Semua */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { value: 'semua', label: '🐾 Semua Hewan' },
            { value: 'kucing', label: '🐱 Kucing' },
            { value: 'anjing', label: '🐶 Anjing' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => {
                setActiveJenis(opt.value);
                // Saat klik jenis, reset ke Semua kategori agar filter jenis aktif
                setActiveKat('semua');
                navigate('/produk');
              }}
              className={`btn btn-sm ${activeJenis === opt.value ? 'btn-primary' : 'btn-secondary'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Kategori scroll */}
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content' }}>
            <button onClick={() => { setActiveKat('semua'); setActiveJenis('semua'); navigate('/produk'); }}
              className={`btn btn-sm ${activeKat === 'semua' ? 'btn-primary' : 'btn-secondary'}`}>
              Semua
            </button>
            {kategoriProduk.map(kat => (
              <button key={kat.id}
                onClick={() => {
                  setActiveKat(kat.slug);
                  setActiveJenis(kat.jenis); // sync jenis hewan sesuai kategori
                  navigate(`/produk/${kat.slug}`);
                }}
                className={`btn btn-sm ${activeKat === kat.slug ? 'btn-primary' : 'btn-secondary'}`}>
                {kat.icon} {kat.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadData()}
              placeholder="Cari produk atau kios..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            <option value="terlaris">Terlaris</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="harga-asc">Harga Terendah</option>
            <option value="harga-desc">Harga Tertinggi</option>
          </select>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Memuat produk...</p>
          </div>
        ) : allProduk.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Belum Ada Produk</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Produk akan muncul setelah kios mendaftar dan menambahkan produk mereka.</p>
            <Link to="/" className="btn btn-secondary">Kembali ke Beranda</Link>
          </div>
        ) : (
          <div className="grid-auto" style={{ marginBottom: '2rem' }}>
            {allProduk.map(produk => (
              <Link key={produk.id} to={`/produk/detail/${produk.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', paddingBottom: '65%', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                    <img src={getImageUrl(produk.foto) || 'https://placehold.co/300x200/1C1C1C/666?text=No+Foto'} alt={produk.nama}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      onError={e => { e.target.src = 'https://placehold.co/300x200/1C1C1C/666?text=No+Foto'; }}
                    />
                    {produk.hargaDiskon && (
                      <span className="badge badge-orange" style={{ position: 'absolute', top: 10, left: 10 }}>
                        -{Math.round(((produk.harga - produk.hargaDiskon) / produk.harga) * 100)}%
                      </span>
                    )}
                    <span className={`tag tag-${produk.jenisHewan}`} style={{ position: 'absolute', top: 10, right: 10 }}>
                      {produk.jenisHewan === 'kucing' ? '🐱' : '🐶'} {produk.jenisHewan}
                    </span>
                  </div>
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{produk.namaKios}</p>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3, flex: 1 }}>{produk.nama}</h4>
                    <RatingStars rating={parseFloat(produk.rating) || 0} size={12} totalUlasan={produk.totalUlasan} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                      <div>
                        {produk.hargaDiskon ? (
                          <>
                            <div className="price-discount">{formatRupiah(produk.hargaDiskon)}</div>
                            <div className="price-original">{formatRupiah(produk.harga)}</div>
                          </>
                        ) : (
                          <div className="price-normal">{formatRupiah(produk.harga)}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAdd(e, produk)}
                        className={`btn btn-sm ${addedId === produk.id ? 'btn-green' : 'btn-primary'}`}
                        style={{ padding: '0.4rem 0.75rem' }}
                      >
                        {addedId === produk.id ? '✓' : <ShoppingCart size={14} />}
                      </button>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Berat: {produk.beratGram >= 1000 ? `${produk.beratGram / 1000} kg` : `${produk.beratGram} g`} • 🔥 {produk.terjual} terjual
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
