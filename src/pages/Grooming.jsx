import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Search, RefreshCw, Scissors } from 'lucide-react';
import { formatRupiah } from '../data/mockData';
import { groomingAPI } from '../services/api';
import RatingStars from '../components/ui/RatingStars';

export default function Grooming() {
  const [search, setSearch]           = useState('');
  const [filterJenis, setFilterJenis] = useState('semua');
  const [groomingList, setGroomingList] = useState([]);
  const [loading, setLoading]         = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterJenis !== 'semua') params.jenis = filterJenis;
      if (search) params.q = search;
      const data = await groomingAPI.list(params);
      setGroomingList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterJenis]);

  const filtered = groomingList.filter(g =>
    !search || (g.nama || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">Perawatan Hewan</div>
          <h1>Grooming Salon <span style={{ background: 'linear-gradient(135deg,var(--accent),#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Terbaik</span></h1>
          <p style={{ maxWidth: 500, margin: '0.75rem auto 0' }}>
            Temukan groomer bersertifikat untuk kucing dan anjing kesayangan Anda di Sulawesi Selatan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadData()}
              placeholder="Cari nama grooming..." className="form-input" style={{ paddingLeft: '2.5rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { value: 'semua', label: '🐾 Semua' },
              { value: 'kucing', label: '🐱 Kucing' },
              { value: 'anjing', label: '🐶 Anjing' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setFilterJenis(opt.value)}
                className={`btn btn-sm ${filterJenis === opt.value ? 'btn-primary' : 'btn-secondary'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p>Memuat daftar grooming...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Scissors size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>
              {groomingList.length === 0 ? 'Belum Ada Grooming Terdaftar' : 'Tidak Ada Hasil Pencarian'}
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {groomingList.length === 0
                ? 'Salon grooming dapat mendaftar melalui halaman registrasi.'
                : 'Coba ubah kata kunci pencarian Anda.'}
            </p>
            {groomingList.length === 0 && (
              <Link to="/daftar?peran=grooming" className="btn btn-primary">Daftar sebagai Groomer</Link>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(g => (
              <Link key={g.id} to={`/grooming/${g.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)' }}>
                    <img
                      src={g.foto || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400'}
                      alt={g.nama}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ Terverifikasi</span>
                      <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem' }}>
                        {g.jenisHewan === 'keduanya' ? '🐱 🐶' : g.jenisHewan === 'kucing' ? '🐱' : '🐶'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{g.nama}</h3>
                    <RatingStars rating={parseFloat(g.rating) || 0} size={13} totalUlasan={g.totalUlasan} />

                    {g.deskripsi && (
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.6, marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                        {(g.deskripsi || '').slice(0, 80)}{g.deskripsi?.length > 80 ? '...' : ''}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} /> {g.jamBuka} - {g.jamTutup}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} /> {g.kota}
                      </div>
                    </div>

                    {(g.layanan || []).length > 0 && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {g.layanan.slice(0, 3).map(l => (
                          <span key={l.id} style={{
                            padding: '0.2rem 0.6rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem', fontWeight: 600,
                            color: 'var(--text-secondary)',
                          }}>
                            {(l.nama || '').split('(')[0].trim()} — {formatRupiah(l.harga)}
                          </span>
                        ))}
                        {g.layanan.length > 3 && (
                          <span style={{ padding: '0.2rem 0.6rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            +{g.layanan.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    )}
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
