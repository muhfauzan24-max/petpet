import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Star, Send, MessageCircle, ArrowLeft, Check } from 'lucide-react';
import { groomingData, formatRupiah } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/ui/RatingStars';

export default function GroomingDetail() {
  const { id } = useParams();
  const data = groomingData.find(g => g.id === Number(id));
  const { user } = useAuth();
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ tanggal: '', jam: '', namaHewan: '', jenisHewan: 'kucing', ras: '', catatan: '' });
  const [booked, setBooked] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ bintang: 5, komentar: '' });
  const [ulasan, setUlasan] = useState(data?.ulasan || []);
  const [reviewSent, setReviewSent] = useState(false);

  if (!data) return <div style={{ padding: '5rem', textAlign: 'center' }}><h2>Data tidak ditemukan</h2></div>;

  const handleBook = () => {
    if (!selectedLayanan || !booking.tanggal || !booking.jam || !booking.namaHewan) return;
    const b = { id: Date.now(), idGrooming: data.id, idLayanan: selectedLayanan.id, ...booking, harga: selectedLayanan.harga, status: 'menunggu', createdAt: new Date().toISOString() };
    const list = JSON.parse(localStorage.getItem('petplace_booking_grooming') || '[]');
    list.push(b);
    localStorage.setItem('petplace_booking_grooming', JSON.stringify(list));
    setBooked(true); setShowBooking(false);
  };

  const handleReview = () => {
    if (!review.komentar.trim()) return;
    const newU = { id: Date.now(), nama: user?.nama || 'Anonim', bintang: review.bintang, komentar: review.komentar, tanggal: new Date().toLocaleDateString('id-ID') };
    setUlasan(prev => [newU, ...prev]);
    setReviewSent(true); setShowReview(false);
  };

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh' }}>
      <div className="container">
        <Link to="/grooming" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Kembali ke Grooming
        </Link>

        {/* Hero Image */}
        <div style={{ height: 280, borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2rem', position: 'relative' }}>
          <img src={data.foto} alt={data.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)' }} />
          <div style={{ position: 'absolute', left: '2rem', bottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{data.nama}</h1>
            <RatingStars rating={data.rating} size={16} totalUlasan={data.totalUlasan} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          <div>
            {/* Info */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ lineHeight: 1.8, marginBottom: '1.25rem' }}>{data.deskripsi}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Alamat', value: data.alamat },
                  { label: 'Kota', value: data.kota },
                  { label: 'Jam Operasi', value: `${data.jamBuka} - ${data.jamTutup}` },
                  { label: 'Hewan Dilayani', value: data.jenisHewan === 'keduanya' ? 'Kucing & Anjing' : data.jenisHewan },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layanan */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>✂️ Layanan Tersedia</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.layanan.map(l => (
                  <div key={l.id}
                    onClick={() => { setSelectedLayanan(l); setShowBooking(true); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: selectedLayanan?.id === l.id ? 'rgba(249,115,22,0.1)' : 'var(--bg-secondary)', border: `1px solid ${selectedLayanan?.id === l.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        ⏱️ {l.durasi} menit • {l.jenisHewan === 'keduanya' ? '🐱🐶' : l.jenisHewan === 'kucing' ? '🐱' : '🐶'}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', fontSize: '1.1rem' }}>
                      {formatRupiah(l.harga)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ulasan */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>⭐ Ulasan Klien</h3>
                {user && !reviewSent && (
                  <button onClick={() => setShowReview(!showReview)} className="btn btn-outline-primary btn-sm">Tulis Ulasan</button>
                )}
              </div>

              {showReview && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReview(r => ({ ...r, bintang: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>
                        {n <= review.bintang ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <textarea value={review.komentar} onChange={e => setReview(r => ({ ...r, komentar: e.target.value }))} className="form-input" placeholder="Ceritakan pengalaman grooming Anda..." rows={3} style={{ marginBottom: '0.75rem' }} />
                  <button onClick={handleReview} className="btn btn-primary btn-sm"><Send size={13} /> Kirim Ulasan</button>
                </div>
              )}

              {ulasan.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Belum ada ulasan</p>
              ) : ulasan.map(u => (
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
              ))}
            </div>
          </div>

          {/* Booking sidebar */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>📋 Booking Grooming</h4>
              {booked ? (
                <div className="alert alert-success">
                  ✅ Booking berhasil! Tunggu konfirmasi dari groomer dan siapkan pembayaran.
                </div>
              ) : (
                <>
                  {selectedLayanan && (
                    <div style={{ padding: '0.75rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Layanan dipilih:</div>
                      <div style={{ fontWeight: 700 }}>{selectedLayanan.nama}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatRupiah(selectedLayanan.harga)}</div>
                    </div>
                  )}

                  {showBooking && selectedLayanan && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Nama Hewan</label>
                        <input value={booking.namaHewan} onChange={e => setBooking(b => ({ ...b, namaHewan: e.target.value }))} className="form-input" placeholder="Nama hewan" />
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
                          {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'].map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Catatan Khusus</label>
                        <textarea value={booking.catatan} onChange={e => setBooking(b => ({ ...b, catatan: e.target.value }))} className="form-input" placeholder="Contoh: sensitif di bagian telinga..." rows={2} />
                      </div>
                      <button onClick={handleBook} className="btn btn-primary btn-full" style={{ marginBottom: '0.5rem' }}>
                        <Check size={16} /> Konfirmasi Booking
                      </button>
                      <button onClick={() => { setShowBooking(false); setSelectedLayanan(null); }} className="btn btn-secondary btn-full">Batal</button>
                    </div>
                  )}

                  {!showBooking && (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        👆 Pilih layanan di kiri untuk melanjutkan booking
                      </p>
                      <button className="btn btn-secondary btn-full">
                        <MessageCircle size={16} /> Chat dengan Groomer
                      </button>
                    </div>
                  )}
                </>
              )}

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💳 No. Rek: <strong style={{ color: 'var(--text-primary)' }}>{data.noRekening}</strong> ({data.namaBank})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
