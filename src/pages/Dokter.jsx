import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../data/mockData';
import { dokterAPI } from '../services/api';
import RatingStars from '../components/ui/RatingStars';

export default function Dokter() {
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [sortBy, setSortBy]         = useState('rating');
  const [dokterList, setDokterList] = useState([]);
  const [loading, setLoading]       = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      const data = await dokterAPI.list(params);
      setDokterList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = dokterList
    .filter(d => {
      const matchSearch = !search ||
        (d.nama || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.spesialisasi || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'semua' ||
        (filterStatus === 'ready' && d.statusReady) ||
        (filterStatus === 'tidak-ready' && !d.statusReady);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => sortBy === 'rating'
      ? parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
      : parseFloat(a.hargaKonsultasi || 0) - parseFloat(b.hargaKonsultasi || 0)
    );

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">Layanan Medis</div>
          <h1>Dokter Hewan <span className="gradient-text-blue">Terpercaya</span></h1>
          <p style={{ maxWidth: 500, margin: '0.75rem auto 0' }}>
            Temukan dokter hewan profesional dan berpengalaman khusus untuk kucing dan anjing Anda di Sulawesi Selatan.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadData()}
              placeholder="Cari nama dokter atau spesialisasi..." className="form-input" style={{ paddingLeft: '2.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { value: 'semua', label: 'Semua' },
              { value: 'ready', label: '✅ Ready' },
              { value: 'tidak-ready', label: '⏰ Ada Jadwal' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                className={`btn btn-sm ${filterStatus === opt.value ? 'btn-primary' : 'btn-secondary'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            <option value="rating">Rating Tertinggi</option>
            <option value="harga">Harga Terendah</option>
          </select>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="alert alert-info" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={18} />
          <span>Semua dokter telah diverifikasi oleh tim PetPlace. Pembayaran konsultasi langsung ke dokter via transfer/QRIS.</span>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p>Memuat daftar dokter...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
            <h3 style={{ marginBottom: '0.5rem' }}>
              {dokterList.length === 0 ? 'Belum Ada Dokter Terdaftar' : 'Tidak Ada Hasil Pencarian'}
            </h3>
            <p>
              {dokterList.length === 0
                ? 'Dokter hewan dapat mendaftar melalui halaman registrasi.'
                : 'Coba ubah kata kunci pencarian Anda.'}
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(dokter => (
              <Link key={dokter.id} to={`/dokter/${dokter.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.75rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={dokter.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dokter.nama}`}
                        alt={dokter.nama} className="avatar avatar-xl"
                      />
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 14, height: 14, borderRadius: '50%',
                        background: dokter.statusReady ? 'var(--accent)' : '#EF4444',
                        border: '2px solid var(--bg-card)',
                        boxShadow: dokter.statusReady ? '0 0 6px var(--accent)' : 'none',
                      }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{dokter.nama}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{dokter.spesialisasi}</p>
                      {dokter.noStr && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>NO. STR: {dokter.noStr}</p>
                      )}
                    </div>
                  </div>

                  <RatingStars rating={parseFloat(dokter.rating) || 0} size={14} totalUlasan={dokter.totalUlasan} />

                  {/* Status */}
                  <div style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: dokter.statusReady ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${dokter.statusReady ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {dokter.statusReady
                        ? <CheckCircle size={15} style={{ color: 'var(--accent)' }} />
                        : <AlertCircle size={15} style={{ color: '#EF4444' }} />
                      }
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: dokter.statusReady ? 'var(--accent)' : '#F87171' }}>
                        {dokter.statusReady ? 'Ready Melayani' : 'Sedang Tidak Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Jadwal */}
                  {dokter.jadwal && dokter.jadwal.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>JADWAL PRAKTIK</p>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {dokter.jadwal.map(j => (
                          <div key={j.hari} style={{ padding: '0.2rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {j.hari}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Konsultasi mulai dari</div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', fontSize: '1.1rem' }}>
                        {formatRupiah(dokter.hargaKonsultasi)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {dokter.kota}
                    </div>
                  </div>

                  {dokter.totalPasien > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      👥 {dokter.totalPasien} pasien ditangani
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
