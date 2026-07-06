import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Send, Calendar, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { formatRupiah, dokterAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/ui/RatingStars';

export default function DokterDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [dokter, setDokter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [booking, setBooking] = useState({ tanggal: '', jam: '', keluhan: '', namaHewan: '', jenisHewan: 'kucing' });
  const [review, setReview] = useState({ bintang: 5, komentar: '' });
  const [booked, setBooked] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await dokterAPI.detail(id);
        if (!data || !data.id) { setNotFound(true); }
        else { setDokter(data); }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBook = async () => {
    if (!booking.tanggal || !booking.jam || !booking.namaHewan) return;
    setBookingLoading(true);
    try {
      await dokterAPI.booking({
        idDokter: dokter.id,
        tanggal: booking.tanggal,
        jam: booking.jam,
        keluhan: booking.keluhan,
        namaHewan: booking.namaHewan,
        jenisHewan: booking.jenisHewan,
      });
      setBooked(true);
      setShowBooking(false);
    } catch (err) {
      alert(err.message || 'Gagal membuat janji. Coba lagi.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = () => {
    if (!review.komentar.trim()) return;
    setReviewSent(true);
    setShowReview(false);
  };

  if (loading) return (
    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <p>Memuat profil dokter...</p>
    </div>
  );

  if (notFound || !dokter) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
      <h2>Dokter tidak ditemukan</h2>
      <Link to="/dokter" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Kembali ke Daftar Dokter
      </Link>
    </div>
  );

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh' }}>
      <div className="container">
        <Link to="/dokter" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Kembali ke Daftar Dokter
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Main Info */}
          <div>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={dokter.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dokter.nama}`}
                    alt={dokter.nama}
                    style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
                    background: dokter.statusReady ? 'var(--accent)' : '#EF4444',
                    border: '2px solid var(--bg-card)',
                    boxShadow: dokter.statusReady ? '0 0 8px var(--accent)' : 'none',
                  }} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{dokter.nama}</h1>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{dokter.spesialisasi}</p>
                  {dokter.noStr && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NO. STR: {dokter.noStr}</p>}
                  <div style={{ marginTop: '0.75rem' }}>
                    <RatingStars rating={parseFloat(dokter.rating) || 0} size={15} totalUlasan={dokter.totalUlasan} />
                  </div>
                </div>
              </div>

              <hr className="divider" />
              {dokter.deskripsi && <p style={{ lineHeight: 1.8 }}>{dokter.deskripsi}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                {[
                  { label: 'Lokasi', value: dokter.alamat || '-' },
                  { label: 'Kota', value: dokter.kota || '-' },
                  { label: 'Total Pasien', value: dokter.totalPasien ? `${dokter.totalPasien}+` : '0' },
                  { label: 'Harga Konsultasi', value: formatRupiah(dokter.hargaKonsultasi) },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jadwal */}
            {dokter.jadwal && dokter.jadwal.length > 0 && (
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>⏰ Jadwal Praktik</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dokter.jadwal.map(j => (
                    <div key={j.hari} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ fontWeight: 600 }}>{j.hari}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{j.jam}</span>
                    </div>
                  ))}
                </div>
                {!dokter.statusReady && dokter.jadwalSelanjutnya && (
                  <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    📅 Dokter tidak ready saat ini. Jadwal terdekat: <strong>{dokter.jadwalSelanjutnya}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Ulasan */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>⭐ Ulasan Pasien</h3>
                {user && !reviewSent && (
                  <button onClick={() => setShowReview(!showReview)} className="btn btn-outline-primary btn-sm">
                    Tulis Ulasan
                  </button>
                )}
              </div>

              {showReview && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReview(r => ({ ...r, bintang: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>
                        {n <= review.bintang ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <textarea value={review.komentar} onChange={e => setReview(r => ({ ...r, komentar: e.target.value }))} className="form-input" placeholder="Bagikan pengalaman konsultasi Anda..." rows={3} style={{ marginBottom: '0.75rem' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleReview} className="btn btn-primary btn-sm"><Send size={13} /> Kirim</button>
                    <button onClick={() => setShowReview(false)} className="btn btn-secondary btn-sm">Batal</button>
                  </div>
                </div>
              )}

              {(!dokter.ulasan || dokter.ulasan.length === 0) && !reviewSent ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Belum ada ulasan</p>
              ) : (
                (dokter.ulasan || []).map(u => (
                  <div key={u.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nama}`} alt={u.nama} className="avatar avatar-sm" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{u.nama}</div>
                        <RatingStars rating={u.bintang} size={11} showNumber={false} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.tanggal}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{u.komentar}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>
                  {formatRupiah(dokter.hargaKonsultasi)}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per sesi konsultasi</p>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: dokter.statusReady ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${dokter.statusReady ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: dokter.statusReady ? 'var(--accent)' : '#EF4444', boxShadow: dokter.statusReady ? '0 0 8px var(--accent)' : 'none' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: dokter.statusReady ? 'var(--accent)' : '#F87171' }}>
                  {dokter.statusReady ? 'Ready Melayani' : 'Tidak Ready Saat Ini'}
                </span>
              </div>

              {booked ? (
                <div className="alert alert-success">
                  ✅ Janji berhasil dibuat! Tunggu konfirmasi dari dokter dan selesaikan pembayaran.
                </div>
              ) : (
                <>
                  {!showBooking ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button
                        onClick={() => user ? setShowBooking(true) : null}
                        className="btn btn-primary btn-full"
                        style={{ opacity: !user ? 0.6 : 1 }}
                      >
                        <Calendar size={16} />
                        {user ? 'Buat Janji Sekarang' : 'Login untuk Buat Janji'}
                      </button>
                      {!user && <Link to="/masuk" className="btn btn-outline-primary btn-full">Login</Link>}
                      <button className="btn btn-secondary btn-full">
                        <MessageCircle size={16} /> Chat dengan Dokter
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ marginBottom: '1rem' }}>📅 Detail Janji</h4>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Nama Hewan</label>
                        <input value={booking.namaHewan} onChange={e => setBooking(b => ({ ...b, namaHewan: e.target.value }))} className="form-input" placeholder="Nama hewan Anda" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Jenis Hewan</label>
                        <select value={booking.jenisHewan} onChange={e => setBooking(b => ({ ...b, jenisHewan: e.target.value }))} className="form-input">
                          <option value="kucing">🐱 Kucing</option>
                          <option value="anjing">🐶 Anjing</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Tanggal</label>
                        <input type="date" value={booking.tanggal} onChange={e => setBooking(b => ({ ...b, tanggal: e.target.value }))} className="form-input" min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Jam</label>
                        <select value={booking.jam} onChange={e => setBooking(b => ({ ...b, jam: e.target.value }))} className="form-input">
                          <option value="">Pilih jam</option>
                          {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'].map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Keluhan</label>
                        <textarea value={booking.keluhan} onChange={e => setBooking(b => ({ ...b, keluhan: e.target.value }))} className="form-input" placeholder="Jelaskan keluhan hewan Anda..." rows={3} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleBook} disabled={bookingLoading} className="btn btn-primary" style={{ flex: 1 }}>
                          {bookingLoading ? 'Menyimpan...' : 'Konfirmasi Janji'}
                        </button>
                        <button onClick={() => setShowBooking(false)} className="btn btn-secondary">Batal</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment info */}
            {(dokter.namaBank || dokter.noRekening || dokter.qris) && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h5 style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>💳 Info Pembayaran</h5>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {dokter.namaBank && <p>Bank: <strong style={{ color: 'var(--text-primary)' }}>{dokter.namaBank}</strong></p>}
                  {dokter.noRekening && <p>No. Rek: <strong style={{ color: 'var(--text-primary)' }}>{dokter.noRekening}</strong></p>}
                  {dokter.qris && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <div style={{ background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '0.25rem' }}>
                        <img src={getImageUrl(dokter.qris)} alt="QRIS Dokter" style={{ width: 140, height: 140, display: 'block', objectFit: 'contain' }} />
                      </div>
                      <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)' }}>QRIS DOKTER HEWAN</p>
                    </div>
                  )}
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>Upload bukti bayar setelah janji dikonfirmasi oleh dokter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
