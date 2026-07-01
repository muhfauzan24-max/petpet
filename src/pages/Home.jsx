import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Stethoscope, Scissors, Star, MapPin, Shield, Clock, Award, ChevronRight, Zap, Store } from 'lucide-react';
import { formatRupiah, kategoriProduk } from '../data/mockData';
import { produkAPI as pApi, dokterAPI as dApi, groomingAPI as gApi, adminAPI, getImageUrl } from '../services/api';
import RatingStars from '../components/ui/RatingStars';
import MiniMap from '../components/ui/MiniMap';

export default function Home() {
  const [featuredProduk, setFeaturedProduk]   = useState([]);
  const [topDokter, setTopDokter]             = useState([]);
  const [topGrooming, setTopGrooming]         = useState([]);
  const [stats, setStats]                     = useState({ totalKios: 0, totalDokter: 0, totalGrooming: 0, totalPengguna: 0, transaksiHariIni: 0 });
  const [activeAnimal, setActiveAnimal]       = useState('kucing');
  const [loadingProduk, setLoadingProduk]     = useState(true);
  const [loadingDokter, setLoadingDokter]     = useState(true);
  const [loadingGrooming, setLoadingGrooming] = useState(true);

  useEffect(() => {
    // Fetch featured products
    pApi.list({ sort: 'terjual', dir: 'desc', limit: 6 })
      .then(data => setFeaturedProduk(data.produk || []))
      .catch(() => {})
      .finally(() => setLoadingProduk(false));

    // Fetch top doctors
    dApi.list({ limit: 3 })
      .then(data => setTopDokter((data || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingDokter(false));

    // Fetch top grooming
    gApi.list({ limit: 3 })
      .then(data => setTopGrooming((data || []).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingGrooming(false));

    // Fetch admin stats for hero section
    adminAPI.stats()
      .then(data => {
        setStats({
          totalKios: data.totalKios || 0,
          totalDokter: data.totalDokter || 0,
          totalGrooming: data.totalGrooming || 0,
          totalPengguna: data.totalPengguna || 0,
          transaksiHariIni: data.transaksiHariIni || 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top left, rgba(249,115,22,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />
        
        {/* Animated orbs */}
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Left Content */}
            <div style={{ animation: 'fadeIn 0.8s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                <Zap size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>PLATFORM #1 SULAWESI SELATAN</span>
              </div>

              <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.1 }}>
                Tempat Terbaik untuk{' '}
                <span className="gradient-text">Hewan Kesayangan</span>
                {' '}Anda
              </h1>

              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 520 }}>
                PetPlace menghubungkan Anda dengan kios terpercaya, dokter hewan profesional, 
                dan groomer bersertifikat — semuanya khusus untuk <strong style={{ color: 'var(--primary)' }}>kucing</strong> dan <strong style={{ color: 'var(--dog-blue)' }}>anjing</strong> di Sulawesi Selatan.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <Link to="/produk" className="btn btn-primary btn-lg">
                  <ShoppingBag size={18} />
                  Belanja Sekarang
                  <ArrowRight size={16} />
                </Link>
                <Link to="/peta" className="btn btn-secondary btn-lg">
                  <MapPin size={18} />
                  Temukan Mitra
                </Link>
              </div>

              {/* Live Stats */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Kios Aktif', value: stats.totalKios > 0 ? `${stats.totalKios}+` : '—', icon: '🏪' },
                  { label: 'Dokter Hewan', value: stats.totalDokter > 0 ? `${stats.totalDokter}+` : '—', icon: '🏥' },
                  { label: 'Groomer', value: stats.totalGrooming > 0 ? `${stats.totalGrooming}+` : '—', icon: '✂️' },
                  { label: 'Pengguna', value: stats.totalPengguna > 0 ? `${stats.totalPengguna}+` : '—', icon: '👥' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                      {stat.icon} {stat.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero Visual */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', animation: 'fadeIn 1s ease 0.3s both' }}>
              <div style={{
                width: 420, height: 420,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(139,92,246,0.1))',
                borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10rem',
                border: '2px solid rgba(249,115,22,0.2)',
                animation: 'float 4s ease-in-out infinite',
                boxShadow: '0 30px 80px rgba(249,115,22,0.2)',
              }}>
                {activeAnimal === 'kucing' ? '🐱' : '🐶'}
              </div>

              <button onClick={() => setActiveAnimal(a => a === 'kucing' ? 'anjing' : 'kucing')}
                style={{ position: 'absolute', bottom: 20, right: 40, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'var(--transition)', backdropFilter: 'blur(10px)' }}>
                Ganti ke {activeAnimal === 'kucing' ? '🐶 Anjing' : '🐱 Kucing'}
              </button>

              {/* Floating cards */}
              <div style={{ position: 'absolute', top: 30, right: -10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', backdropFilter: 'blur(20px)', animation: 'float 5s ease-in-out infinite 1s', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating Tertinggi</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {topDokter[0]?.nama || 'Dokter Hewan'}
                </div>
                <RatingStars rating={topDokter[0]?.rating || 5} size={12} />
              </div>

              <div style={{ position: 'absolute', top: '50%', left: -30, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', backdropFilter: 'blur(20px)', animation: 'float 5s ease-in-out infinite 2s', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaksi Hari Ini</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                  {stats.transaksiHariIni}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, var(--primary), transparent)', animation: 'pulse 2s infinite' }} />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-label">Tentang PetPlace</div>
            <h2>Mengapa Pilih <span className="gradient-text">PetPlace</span>?</h2>
            <p style={{ marginTop: '1rem', maxWidth: 600, margin: '1rem auto 0' }}>
              Kami adalah platform marketplace pihak ketiga yang menyediakan tempat bagi kios, dokter hewan, 
              dan groomer terpercaya untuk melayani kebutuhan hewan kesayangan Anda.
            </p>
          </div>

          <div className="grid-4">
            {[
              { icon: Shield, title: 'Mitra Terverifikasi', desc: 'Semua kios, dokter, dan groomer telah melalui proses verifikasi ketat oleh tim PetPlace.', color: 'var(--accent)', bg: 'rgba(16,185,129,0.1)' },
              { icon: Award, title: 'Fokus Kucing & Anjing', desc: 'Platform kami dirancang khusus untuk kebutuhan kucing dan anjing dengan kategori produk yang lengkap.', color: 'var(--primary)', bg: 'rgba(249,115,22,0.1)' },
              { icon: Clock, title: 'Layanan 7 Hari', desc: 'Temukan kios dan dokter yang beroperasi setiap hari untuk memastikan hewan Anda selalu terlayani.', color: 'var(--secondary)', bg: 'rgba(139,92,246,0.1)' },
              { icon: MapPin, title: 'Lokal Sulawesi Selatan', desc: 'Berpusat di Makassar, kami mendukung UMKM lokal dan mempermudah akses layanan hewan di Sulsel.', color: 'var(--dog-blue)', bg: 'rgba(59,130,246,0.1)' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card" style={{ padding: '2rem' }}>
                <div style={{ width: 52, height: 52, background: bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGORI PRODUK */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Produk</div>
            <h2>Belanja per <span className="gradient-text">Kategori</span></h2>
            <p>Temukan produk yang tepat untuk hewan kesayangan Anda</p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {kategoriProduk.map(kat => (
              <Link key={kat.id} to={`/produk/${kat.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '1.75rem', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{kat.icon}</div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>{kat.nama}</h4>
                  <span className={`tag tag-${kat.jenis}`}>
                    {kat.jenis === 'kucing' ? '🐱' : '🐶'} {kat.jenis}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MINI PETA MITRA */}
      <MiniMap />

      {/* PRODUK UNGGULAN */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label" style={{ textAlign: 'left' }}>Paling Laku</div>
              <h2>Produk <span className="gradient-text">Unggulan</span></h2>
            </div>
            <Link to="/produk" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          {loadingProduk ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <div>Memuat produk...</div>
            </div>
          ) : featuredProduk.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Belum Ada Produk</h3>
              <p>Produk akan muncul setelah kios mendaftar dan menambahkan produk mereka.</p>
            </div>
          ) : (
            <div className="grid-auto">
              {featuredProduk.map(produk => <ProdukCard key={produk.id} produk={produk} />)}
            </div>
          )}
        </div>
      </section>

      {/* TOP DOKTER */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label" style={{ textAlign: 'left' }}>Rating Terbaik</div>
              <h2>Dokter Hewan <span style={{ background: 'linear-gradient(135deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Terpercaya</span></h2>
            </div>
            <Link to="/dokter" className="btn btn-secondary">Semua Dokter <ChevronRight size={16} /></Link>
          </div>

          {loadingDokter ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>⏳ Memuat dokter...</div>
          ) : topDokter.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
              <h3>Belum Ada Dokter Terdaftar</h3>
              <p>Dokter hewan dapat mendaftar melalui halaman registrasi.</p>
            </div>
          ) : (
            <div className="grid-3">
              {topDokter.map(dokter => <DokterCard key={dokter.id} dokter={dokter} />)}
            </div>
          )}
        </div>
      </section>

      {/* TOP GROOMING */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-label" style={{ textAlign: 'left' }}>Grooming Terbaik</div>
              <h2>Salon Hewan <span style={{ background: 'linear-gradient(135deg,var(--accent),#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Favorit</span></h2>
            </div>
            <Link to="/grooming" className="btn btn-secondary">Semua Grooming <ChevronRight size={16} /></Link>
          </div>

          {loadingGrooming ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>⏳ Memuat grooming...</div>
          ) : topGrooming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
              <h3>Belum Ada Grooming Terdaftar</h3>
              <p>Salon grooming dapat mendaftar melalui halaman registrasi.</p>
            </div>
          ) : (
            <div className="grid-3">
              {topGrooming.map(g => <GroomingCard key={g.id} data={g} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-xl)', padding: '4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle,rgba(249,115,22,0.15),transparent)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: 'radial-gradient(circle,rgba(139,92,246,0.15),transparent)', borderRadius: '50%' }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
              <h2 style={{ marginBottom: '1rem' }}>Punya Kios atau Jasa Hewan?</h2>
              <p style={{ marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.7 }}>
                Bergabung sebagai mitra PetPlace dan jangkau ribuan pemilik hewan peliharaan di Sulawesi Selatan.
                Daftar gratis, komisi hanya 10% per transaksi berhasil.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/daftar" className="btn btn-primary btn-lg">
                  <Store size={18} />
                  Daftar Buka Kios
                </Link>
                <Link to="/daftar?peran=dokter" className="btn btn-purple btn-lg">
                  <Stethoscope size={18} />
                  Daftar sebagai Dokter
                </Link>
                <Link to="/daftar?peran=grooming" className="btn btn-green btn-lg">
                  <Scissors size={18} />
                  Daftar Grooming
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- Sub-components ----

function ProdukCard({ produk }) {
  return (
    <Link to={`/produk/detail/${produk.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '65%', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <img
            src={getImageUrl(produk.foto) || 'https://placehold.co/400x260/1C1C1C/666?text=No+Foto'}
            alt={produk.nama}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://placehold.co/400x260/1C1C1C/666?text=No+Foto'; }}
          />
          {produk.hargaDiskon && (
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <span className="badge badge-orange">
                -{Math.round(((produk.harga - produk.hargaDiskon) / produk.harga) * 100)}%
              </span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className={`tag tag-${produk.jenisHewan}`}>{produk.jenisHewan === 'kucing' ? '🐱' : '🐶'}</span>
          </div>
        </div>
        <div style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{produk.namaKios}</p>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>{produk.nama}</h4>
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
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🔥 {produk.terjual} terjual</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DokterCard({ dokter }) {
  return (
    <Link to={`/dokter/${dokter.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={dokter.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dokter.nama}`} alt={dokter.nama} className="avatar avatar-lg" />
            <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <span className={`status-dot ${dokter.statusReady ? 'online' : 'offline'}`} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>{dokter.nama}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{dokter.spesialisasi}</p>
            <RatingStars rating={parseFloat(dokter.rating) || 0} size={12} totalUlasan={dokter.totalUlasan} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Konsultasi mulai</div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>{formatRupiah(dokter.hargaKonsultasi)}</div>
          </div>
          <span className={`badge ${dokter.statusReady ? 'badge-green' : 'badge-red'}`}>
            {dokter.statusReady ? '● Ready' : '○ Tidak Ready'}
          </span>
        </div>

        {dokter.jadwal && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {dokter.jadwal.slice(0, 3).map(j => (
              <span key={j.hari} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{j.hari}</span>
            ))}
            {dokter.jadwal.length > 3 && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>+{dokter.jadwal.length - 3}</span>}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <MapPin size={12} /> {dokter.kota}
        </div>
      </div>
    </Link>
  );
}

function GroomingCard({ data }) {
  return (
    <Link to={`/grooming/${data.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)' }}>
          <img src={data.foto || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400'} alt={data.nama}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ Terverifikasi</span>
          </div>
        </div>
        <div style={{ padding: '1.25rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>{data.nama}</h4>
          <RatingStars rating={parseFloat(data.rating) || 0} size={12} totalUlasan={data.totalUlasan} />
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Clock size={12} /> {data.jamBuka} - {data.jamTutup}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <MapPin size={12} /> {data.kota}
            </div>
          </div>
          {data.layanan && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {data.layanan.slice(0, 2).map(l => (
                <span key={l.id} className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{l.nama?.split('(')[0].trim()}</span>
              ))}
              {data.layanan.length > 2 && <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>+{data.layanan.length - 2} lainnya</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
