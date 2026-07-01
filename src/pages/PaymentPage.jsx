import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { pesananAPI, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../data/mockData';
import { CheckCircle, Upload, Truck, ArrowLeft, CreditCard, Smartphone, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [pesanan,   setPesanan]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [metode,    setMetode]    = useState('transfer_bank');
  const [bukti,     setBukti]     = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!user) { navigate('/masuk'); return; }
    pesananAPI.detail(id)
      .then(data => setPesanan(data))
      .catch(() => setError('Pesanan tidak ditemukan.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleUploadBukti = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBuktiFile(file);
    const reader = new FileReader();
    reader.onload = ev => setBukti(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleKirim = async () => {
    if (!bukti) { setError('Mohon upload bukti pembayaran terlebih dahulu.'); return; }
    setUploading(true);
    setError('');
    try {
      const kios = pesanan.kiosList?.[0] || pesanan.kios || {};
      await pesananAPI.uploadBukti({
        idPesanan:    pesanan.id,
        metode,
        namaBank:     kios.namaBank || kios.nama_bank || '',
        noRekening:   kios.noRekening || kios.no_rekening || '',
        namaPengirim: user?.nama || 'Pembeli',
        jumlahBayar:  pesanan.totalBayar,
        buktiFoto:    bukti,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Gagal mengirim bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
      <p>Memuat detail pesanan...</p>
    </div>
  );

  if (error && !pesanan) return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
      <h3>{error}</h3>
      <Link to="/akun/pesanan" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
        Kembali ke Pesanan
      </Link>
    </div>
  );

  /* ── SUCCESS SCREEN ── */
  if (done) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease', maxWidth: 440, padding: '2rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
        <h2 style={{ marginBottom: '0.75rem' }}>Bukti Pembayaran Terkirim!</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Pembayaran untuk pesanan <strong style={{ color: 'var(--primary)' }}>#{pesanan.kode}</strong> sedang diverifikasi oleh admin.
          Anda akan mendapat notifikasi setelah pembayaran dikonfirmasi.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/akun/pesanan" className="btn btn-primary">
            <Truck size={16} /> Lacak Pesanan
          </Link>
          <Link to="/produk" className="btn btn-secondary">Lanjut Belanja</Link>
        </div>
      </div>
    </div>
  );

  const kiosList = pesanan?.kiosList || (pesanan?.kios ? [pesanan.kios] : []);

  return (
    <div style={{ padding: '2rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Back */}
        <Link to="/akun/pesanan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Kembali ke Pesanan
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>💳 Pembayaran Pesanan</h1>
          <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700, marginTop: '0.35rem' }}>
            #{pesanan?.kode}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* LEFT — Payment form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Metode pembayaran */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Pilih Metode Pembayaran</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { value: 'transfer_bank', Icon: CreditCard, label: '🏦 Transfer Bank', desc: 'BCA, BNI, BRI, Mandiri, dll' },
                  { value: 'qris',          Icon: Smartphone, label: '📱 QRIS',          desc: 'Dana, OVO, GoPay, ShopeePay, m-Banking' },
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1rem',
                    background: metode === opt.value ? 'rgba(249,115,22,0.07)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${metode === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)',
                  }}>
                    <input type="radio" value={opt.value} checked={metode === opt.value}
                      onChange={e => setMetode(e.target.value)}
                      style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Info rekening / QRIS per kios */}
            {kiosList.length > 0 && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                  {metode === 'qris' ? '📱 QRIS Penjual' : '🏦 Rekening Tujuan'}
                </h3>
                {kiosList.map((k, idx) => {
                  const namaKios = k.namaKios || k.nama_kios || 'Kios';
                  if (metode === 'qris') {
                    const qrisUrl = k.qrisImage || k.qris_image
                      || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=PetPlace_${pesanan.totalBayar}_${namaKios}`;
                    return (
                      <div key={idx} style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏪 {namaKios}</div>
                        <div style={{ display: 'inline-block', background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '0.75rem' }}>
                          <img src={qrisUrl} alt="QRIS" style={{ width: 200, height: 200, display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Scan dengan aplikasi e-wallet atau m-Banking Anda
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🏪 {namaKios}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Bank</div>
                            <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{k.namaBank || k.nama_bank || '-'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>No. Rekening</div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem', letterSpacing: '0.05em' }}>{k.noRekening || k.no_rekening || '-'}</div>
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Atas Nama</div>
                            <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{k.namaPemilikRek || k.nama_pemilik_rek || namaKios}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.875rem', background: 'rgba(249,115,22,0.07)', borderRadius: 'var(--radius-md)', fontSize: '0.73rem', color: 'var(--primary)', fontWeight: 600 }}>
                          ⚠️ Pastikan transfer tepat ke rekening ini. Nominal: <strong>{formatRupiah(pesanan.totalBayar)}</strong>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}

            {/* Upload bukti */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>
                {metode === 'qris' ? '📸 Upload Bukti Scan QRIS' : '📸 Upload Bukti Transfer'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Foto screenshot atau foto struk pembayaran Anda
              </p>

              {/* Drop zone */}
              <label htmlFor="bukti-upload" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '2rem',
                border: `2px dashed ${bukti ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                background: bukti ? 'rgba(249,115,22,0.04)' : 'var(--bg-secondary)',
                transition: 'all 0.2s',
              }}>
                {bukti ? (
                  <>
                    <img src={bukti} alt="Bukti" style={{ maxHeight: 220, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>✓ Foto dipilih — klik untuk ganti</span>
                  </>
                ) : (
                  <>
                    <Upload size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Klik atau seret foto ke sini</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>PNG, JPG, WEBP (Maks. 5MB)</div>
                    </div>
                  </>
                )}
              </label>
              <input id="bukti-upload" type="file" accept="image/*" onChange={handleUploadBukti} style={{ display: 'none' }} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#EF4444', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleKirim} disabled={!bukti || uploading}
              className="btn btn-primary btn-lg btn-full"
              style={{ opacity: (!bukti || uploading) ? 0.6 : 1 }}>
              {uploading ? '⏳ Mengirim...' : '✅ Kirim Bukti Pembayaran'}
            </button>
          </div>

          {/* RIGHT — Order summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>📋 Ringkasan Pesanan</h3>

              {/* Items */}
              {pesanan?.items?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {pesanan.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                        <img src={getImageUrl(item.foto) || 'https://placehold.co/44x44/1C1C1C/666?text=No'} alt={item.nama}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://placehold.co/44x44/1C1C1C/666?text=No'; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>×{item.jumlah}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', flexShrink: 0 }}>
                        {formatRupiah((item.hargaDiskon || item.harga) * item.jumlah)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{formatRupiah(pesanan?.totalHarga || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ongkir</span>
                  <span>{formatRupiah(pesanan?.ongkir || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                  <span>Total Bayar</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.1rem', fontFamily: 'Outfit' }}>{formatRupiah(pesanan?.totalBayar || 0)}</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(249,115,22,0.06)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                💡 <strong style={{ color: 'var(--primary)' }}>Panduan:</strong> Transfer sesuai nominal di atas, lalu upload buktinya. Admin akan memverifikasi dalam 1×24 jam.
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media(max-width:768px){
            .container > div:nth-child(3) { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
