import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Scale, ShoppingBag, ArrowRight, MapPin, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatBerat, hitungBeratTotal, hitungOngkir } from '../data/mockData';
import { lokasiAPI, pesananAPI, getImageUrl } from '../services/api';

export default function Keranjang() {
  const { items, tambah, kurang, hapus, hapusBanyak, kosongkan } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [alamat, setAlamat] = useState({ nama: '', telepon: '', alamat: '' });
  const [metode, setMetode] = useState('transfer_bank');
  const [step, setStep] = useState(1); // 1=keranjang, 2=checkout, 3=bayar
  const [pesanan, setPesanan] = useState(null);
  const [bukti, setBukti] = useState(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [loadingBayar, setLoadingBayar] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Selective Checkout States
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync selection state on mount/items load
  useEffect(() => {
    if (items.length > 0 && !isInitialized) {
      setSelectedIds(new Set(items.map(i => i.id)));
      setIsInitialized(true);
    }
  }, [items, isInitialized]);

  // Group items by Kios
  const groupedByKios = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const kiosId = item.idKios || 0;
      const kiosNama = item.namaKios || 'Toko Lainnya';
      if (!map[kiosId]) {
        map[kiosId] = {
          idKios: kiosId,
          namaKios: kiosNama,
          items: []
        };
      }
      map[kiosId].items.push(item);
    });
    return Object.values(map);
  }, [items]);

  // Selected items calculations
  const selectedItems = useMemo(() => {
    return items.filter(i => selectedIds.has(i.id));
  }, [items, selectedIds]);

  const selectedTotalBerat = useMemo(() => {
    return hitungBeratTotal(selectedItems);
  }, [selectedItems]);

  const selectedTotalHarga = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + ((item.hargaDiskon || item.harga) * item.jumlah), 0);
  }, [selectedItems]);

  const selectedOngkir = useMemo(() => {
    return selectedItems.length > 0 ? hitungOngkir(selectedTotalBerat) : 0;
  }, [selectedItems, selectedTotalBerat]);

  const selectedTotalBayar = useMemo(() => {
    return selectedTotalHarga + selectedOngkir;
  }, [selectedTotalHarga, selectedOngkir]);

  // Handlers for Selection
  const handleToggleItem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleKios = (kiosItems) => {
    const allKiosSelected = kiosItems.every(i => selectedIds.has(i.id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      kiosItems.forEach(i => {
        if (allKiosSelected) {
          next.delete(i.id);
        } else {
          next.add(i.id);
        }
      });
      return next;
    });
  };

  const handleToggleAll = () => {
    const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
    setSelectedIds(prev => {
      if (allSelected) {
        return new Set();
      } else {
        return new Set(items.map(i => i.id));
      }
    });
  };

  const handleCheckout = () => {
    if (authLoading) return; // tunggu auth selesai load
    if (!user) {
      // Jangan silent redirect — scroll ke atas agar user tahu
      setErrorMsg('Anda harus login terlebih dahulu untuk melanjutkan checkout.');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg('Silakan pilih minimal 1 produk untuk melanjutkan checkout.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleBayar = async () => {
    if (!alamat.nama || !alamat.telepon || !alamat.alamat) {
      setErrorMsg('Mohon lengkapi nama penerima, telepon, dan alamat lengkap!');
      return;
    }
    setLoadingBayar(true);
    setErrorMsg('');
    try {
      // 1. Simpan alamat ke backend
      let idAlamat;
      try {
        const addrRes = await lokasiAPI.addAlamat({
          namaPenerima: alamat.nama,
          telepon:      alamat.telepon,
          alamat:       alamat.alamat,
          kota:         'Makassar',
          kecamatan:    'Ujung Pandang',
          kelurahan:    'Baru',
          label:        'Pengiriman',
        });
        // addrRes sudah di-unwrap oleh handleResponse: { id: X }
        idAlamat = addrRes?.id || addrRes;
        if (!idAlamat) throw new Error('Gagal mendapatkan ID alamat dari server');
      } catch (addrErr) {
        console.error('[Checkout] Gagal simpan alamat:', addrErr);
        throw new Error('Gagal menyimpan alamat: ' + (addrErr.message || 'Server error'));
      }

      // 2. Buat pesanan (checkout)
      let checkoutRes;
      try {
        checkoutRes = await pesananAPI.checkout({
          idAlamat: Number(idAlamat),
          catatan:  '',
          items:    selectedItems.map(i => ({ idProduk: i.id, jumlah: i.jumlah })),
        });
      } catch (checkoutErr) {
        console.error('[Checkout] Gagal checkout:', checkoutErr);
        throw new Error('Gagal membuat pesanan: ' + (checkoutErr.message || 'Stok habis atau server error'));
      }

      // 3. Set state pesanan dan pindah ke step 3
      setPesanan({
        id:          checkoutRes.idPesanan,
        kode:        checkoutRes.kode,
        totalBayar:  checkoutRes.totalBayar,
        totalHarga:  checkoutRes.totalHarga,
        ongkir:      checkoutRes.ongkir,
        totalBerat:  selectedTotalBerat,
        metodeBayar: metode,
        items:       selectedItems.map(i => ({ idKios: i.idKios, namaKios: i.namaKios })),
        kios:        checkoutRes.kios,
        kiosList:    checkoutRes.kiosList || (checkoutRes.kios ? [{
          id:             null,
          namaKios:       checkoutRes.kios.nama_kios  || checkoutRes.kios.namaKios,
          namaBank:       checkoutRes.kios.nama_bank  || checkoutRes.kios.namaBank,
          noRekening:     checkoutRes.kios.no_rekening || checkoutRes.kios.noRekening,
          namaPemilikRek: checkoutRes.kios.nama_pemilik_rek || checkoutRes.kios.namaPemilikRek,
          qrisImage:      checkoutRes.kios.qris_image || checkoutRes.kios.qrisImage,
        }] : []),
      });

      setStep(3);
    } catch (err) {
      console.error('[Checkout] Error:', err);
      setErrorMsg(err.message || 'Gagal memproses pesanan. Coba lagi.');
    } finally {
      setLoadingBayar(false);
    }
  };

  const handleUploadBukti = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBukti(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKirimBukti = async () => {
    try {
      await pesananAPI.uploadBukti({
        idPesanan: pesanan.id,
        metode: pesanan.metodeBayar,
        namaBank: pesanan.kios?.nama_bank || '',
        noRekening: pesanan.kios?.no_rekening || '',
        namaPengirim: user?.nama || 'Pembeli',
        jumlahBayar: pesanan.totalBayar,
        buktiFoto: bukti,
      });
      
      // Clear checked out items only
      const checkedOutIds = selectedItems.map(i => i.id);
      hapusBanyak(checkedOutIds);
      setKonfirmasi(true);
    } catch (err) {
      alert(err.message || 'Gagal mengirim bukti pembayaran.');
    }
  };

  if (konfirmasi) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Pembayaran Terkirim!</h2>
          <p style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Bukti pembayaran Anda untuk pesanan <strong style={{ color: 'var(--primary)' }}>{pesanan?.kode}</strong> sudah dikirim ke penjual.
            Tunggu konfirmasi dari penjual ya!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/akun/pesanan" className="btn btn-primary">Lihat Status Pesanan</Link>
            <Link to="/produk" className="btn btn-secondary">Lanjut Belanja</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 1) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Keranjang Kosong</h2>
          <p style={{ marginBottom: '1.5rem' }}>Belum ada produk yang ditambahkan</p>
          <Link to="/produk" className="btn btn-primary btn-lg">
            <ShoppingBag size={18} /> Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0 5rem', minHeight: '100vh' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>
          {step === 1 ? '🛒 Keranjang Belanja' : step === 2 ? '📦 Checkout' : '💳 Pembayaran'}
        </h1>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', padding: '0.35rem', border: '1px solid var(--border)', width: 'fit-content' }}>
          {['Keranjang', 'Checkout', 'Pembayaran'].map((s, i) => (
            <div key={s} style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', background: step === i + 1 ? 'var(--primary)' : 'transparent', color: step === i + 1 ? 'white' : step > i + 1 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', transition: 'var(--transition)' }}>
              {step > i + 1 ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          <div>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Select All Bar */}
                <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                  <input
                    type="checkbox"
                    id="select-all-cart"
                    checked={items.length > 0 && items.every(i => selectedIds.has(i.id))}
                    onChange={handleToggleAll}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="select-all-cart" style={{ fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    Pilih Semua Produk ({items.length})
                  </label>
                </div>

                {groupedByKios.map(group => {
                  const allKiosSelected = group.items.every(i => selectedIds.has(i.id));
                  return (
                    <div key={group.idKios} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
                      {/* Toko Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                        <input
                          type="checkbox"
                          checked={allKiosSelected}
                          onChange={() => handleToggleKios(group.items)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '1.2rem' }}>🏪</span>
                          <span>{group.namaKios}</span>
                        </div>
                      </div>

                      {/* Produk List di Toko ini */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {group.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => handleToggleItem(item.id)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                            />
                            
                            <img
                              src={getImageUrl(item.foto) || 'https://placehold.co/72x72/1C1C1C/666?text=No+Foto'}
                              alt={item.nama}
                              style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, background: 'var(--bg-secondary)' }}
                              onError={e => { e.target.src = 'https://placehold.co/72x72/1C1C1C/666?text=No+Foto'; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.nama}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Berat: {formatBerat(item.beratGram)} × {item.jumlah} = {formatBerat(item.beratGram * item.jumlah)}</p>
                              <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{formatRupiah((item.hargaDiskon || item.harga) * item.jumlah)}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <button onClick={() => kurang(item.id)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                              <span style={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{item.jumlah}</span>
                              <button onClick={() => tambah(item, 1)} style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            </div>
                            <button onClick={() => hapus(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F87171', padding: '0.35rem', flexShrink: 0 }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>📍 Alamat Pengiriman</h3>
                <div style={{ display: 'grid', gap: '0.875rem' }}>
                  {[
                    { key: 'nama', label: 'Nama Penerima', placeholder: 'Nama lengkap penerima', required: true },
                    { key: 'telepon', label: 'No. Telepon', placeholder: '08xx-xxxx-xxxx', required: true },
                  ].map(field => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">{field.label} {field.required && <span style={{ color: '#F87171' }}>*</span>}</label>
                      <input value={alamat[field.key] || ''} onChange={e => setAlamat(a => ({ ...a, [field.key]: e.target.value }))} className="form-input" placeholder={field.placeholder} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Alamat Lengkap <span style={{ color: '#F87171' }}>*</span></label>
                    <textarea value={alamat.alamat || ''} onChange={e => setAlamat(a => ({ ...a, alamat: e.target.value }))} className="form-input" placeholder="Nama jalan, nomor, RT/RW..." rows={3} />
                  </div>
                </div>

                <h3 style={{ margin: '1.5rem 0 1rem' }}>💳 Metode Pembayaran</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 'transfer_bank', label: '🏦 Transfer Bank', desc: 'BCA, BNI, BRI, Mandiri' },
                    { value: 'qris', label: '📱 QRIS', desc: 'Scan QR dari penjual' },
                  ].map(opt => (
                    <label key={opt.value} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.875rem', background: metode === opt.value ? 'rgba(249,115,22,0.08)' : 'var(--bg-secondary)', border: `1.5px solid ${metode === opt.value ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}>
                      <input type="radio" value={opt.value} checked={metode === opt.value} onChange={e => setMetode(e.target.value)} style={{ accentColor: 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && pesanan && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>💳 Upload Bukti Pembayaran</h3>
                <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
                  {pesanan.metodeBayar === 'qris' ? (
                    'Silakan scan QRIS di bawah ini lalu upload bukti pembayaran Anda.'
                  ) : (
                    'Silakan transfer ke rekening penjual lalu upload bukti transfer di bawah ini.'
                  )}
                </div>

                {/* Info rekening atau QRIS per kios — menggunakan kiosList dari backend */}
                {(pesanan.kiosList && pesanan.kiosList.length > 0 ? pesanan.kiosList : []).map((k, idx) => {
                  const namaKios = k.namaKios || 'Kios';
                  if (pesanan.metodeBayar === 'qris') {
                    const qrisUrl = k.qrisImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PetPlace_${pesanan.totalBayar}_${namaKios}`;
                    return (
                      <div key={idx} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>🏪 {namaKios}</div>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', boxShadow: 'var(--shadow-sm)', marginBottom: '0.75rem' }}>
                          <img src={qrisUrl} alt="QRIS Barcode" style={{ width: 200, height: 'auto', maxHeight: 280, display: 'block' }} />
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>QRIS {namaKios.toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan dengan Dana, OVO, GoPay, ShopeePay atau m-Banking</div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🏪 {namaKios}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{k.namaBank || '-'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No. Rekening</div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem', letterSpacing: '0.05em' }}>{k.noRekening || '-'}</div>
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atas Nama</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{k.namaPemilikRek || namaKios}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(249,115,22,0.07)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          ⚠️ Pastikan transfer tepat ke rekening di atas, bukan rekening lain
                        </div>
                      </div>
                    );
                  }
                })}

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">{pesanan.metodeBayar === 'qris' ? 'Upload Foto Bukti Scan QRIS' : 'Upload Foto Bukti Transfer'}</label>
                  <input type="file" accept="image/*" onChange={handleUploadBukti} className="form-input" style={{ cursor: 'pointer' }} />
                  {bukti && (
                    <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: 300 }}>
                      <img src={bukti} alt="Bukti bayar" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                    </div>
                  )}
                </div>

                <button onClick={handleKirimBukti} className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.25rem' }} disabled={!bukti}>
                  Kirim Bukti Pembayaran
                </button>
                <button onClick={() => setStep(2)} className="btn btn-secondary btn-full btn-lg" style={{ marginTop: '0.5rem' }}>
                  ← Ubah Alamat / Pembayaran
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Ringkasan Pesanan</h3>

              {/* Weight breakdown */}
              <div style={{ padding: '0.875rem', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Scale size={15} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Perhitungan Berat</span>
                </div>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    <span>{item.nama.length > 20 ? item.nama.slice(0, 20) + '...' : item.nama} × {item.jumlah}</span>
                    <span>{formatBerat(item.beratGram * item.jumlah)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>Total Berat</span>
                  <span style={{ color: 'var(--primary)' }}>{formatBerat(step === 3 && pesanan ? pesanan.totalBerat : selectedTotalBerat)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{formatRupiah(step === 3 && pesanan ? pesanan.totalHarga : selectedTotalHarga)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ongkir ({formatBerat(step === 3 && pesanan ? pesanan.totalBerat : selectedTotalBerat)})</span>
                  <span>{formatRupiah(step === 3 && pesanan ? pesanan.ongkir : selectedOngkir)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Bayar</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'Outfit' }}>{formatRupiah(step === 3 && pesanan ? pesanan.totalBayar : selectedTotalBayar)}</span>
                </div>
              </div>

              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Error / Login prompt */}
                  {errorMsg && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      color: '#EF4444',
                      fontWeight: 600,
                    }}>
                      ⚠️ {errorMsg}{' '}
                      {!user && (
                        <Link to="/masuk" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                          Login sekarang →
                        </Link>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={authLoading}
                    className="btn btn-primary btn-full btn-lg"
                    style={{ opacity: authLoading ? 0.6 : 1 }}>
                    {authLoading ? '⏳ Memuat...' : <>Lanjut Checkout <ArrowRight size={16} /></>}
                  </button>
                  {!user && !authLoading && (
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Sudah punya akun?{' '}
                      <Link to="/masuk" style={{ color: 'var(--primary)', fontWeight: 600 }}>Masuk dulu</Link>
                    </div>
                  )}
                </div>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Error Message */}
                  {errorMsg && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 'var(--radius-md)',
                      color: '#EF4444',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    }}>
                      ⚠️ {errorMsg}
                    </div>
                  )}
                  <button
                    onClick={handleBayar}
                    disabled={loadingBayar}
                    className="btn btn-primary btn-full btn-lg"
                    style={{ opacity: loadingBayar ? 0.7 : 1, cursor: loadingBayar ? 'not-allowed' : 'pointer' }}>
                    {loadingBayar ? (
                      <>⏳ Memproses Pesanan...</>
                    ) : (
                      <>Lanjut Membayar <ArrowRight size={16} /></>
                    )}
                  </button>
                  <button onClick={() => { setStep(1); setErrorMsg(''); }} className="btn btn-secondary btn-full">Kembali</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
