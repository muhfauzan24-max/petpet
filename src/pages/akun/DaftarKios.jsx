import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, ArrowRight, MapPin, Navigation, Crosshair, Loader } from 'lucide-react';
import AlamatAutocomplete from '../../components/ui/AlamatAutocomplete';
import { DAFTAR_KOTA } from '../../data/daftarAlamat';

export default function DaftarKios() {
  const { user, daftarKios } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ namaKios: '', deskripsi: '', telepon: '', email: '', jamBuka: '08:00', jamTutup: '17:00', hariOperasi: 'Senin-Sabtu', namaBank: '', noRekening: '', namaPemilikRek: '', qris: '', alamat: '', kota: 'Makassar', lat: '', lng: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapPinned, setMapPinned] = useState(false);
  const [detectingIP, setDetectingIP] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const mapCenterRef = useRef([-5.1477, 119.4327]); // default Makassar

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
  }, []);

  // Init map for location picking
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    const [defaultLat, defaultLng] = mapCenterRef.current;

    const map = L.map(mapRef.current, { center: [defaultLat, defaultLng], zoom: 13, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:#F97316;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">🏪</div></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
          .bindPopup('<strong>📍 Lokasi Kios Anda</strong>');
        markerRef.current.openPopup();
      }
      setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
      setMapPinned(true);
    });

    mapInstance.current = map;
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; markerRef.current = null; }
    };
  }, [mapReady]);

  // Deteksi lokasi via IP address
  const handleDetectIP = async () => {
    setDetectingIP(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const kota = data.city || data.region || 'Makassar';

        // Update form
        setForm(f => ({ ...f, kota, lat: lat.toFixed(6), lng: lng.toFixed(6) }));

        // Move map
        if (mapInstance.current) {
          const L = window.L;
          mapInstance.current.setView([lat, lng], 15);
          const pinIcon = L.divIcon({
            className: '',
            html: `<div style="width:36px;height:36px;background:#F97316;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">🏪</div></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstance.current)
              .bindPopup(`<strong>📍 Lokasi Anda (${kota})</strong><br/><small>Klik peta untuk sesuaikan titik</small>`);
            markerRef.current.openPopup();
          }
          setMapPinned(true);
        } else {
          mapCenterRef.current = [lat, lng];
          setMapPinned(false);
        }
      } else {
        alert('Tidak dapat mendeteksi lokasi dari IP. Silakan klik langsung pada peta.');
      }
    } catch (err) {
      alert('Gagal mendeteksi lokasi: ' + (err.message || 'Cek koneksi internet'));
    }
    setDetectingIP(false);
  };

  // Gerakkan peta ke koordinat hasil geocoding dari AlamatAutocomplete
  const handleGeocode = ({ lat, lng, displayName }) => {
    setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));

    if (mapInstance.current) {
      const L = window.L;
      mapInstance.current.setView([lat, lng], 16);

      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#F97316;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">\ud83c\udfea</div></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const shortName = displayName?.split(',').slice(0, 3).join(',') || 'Lokasi Kios';

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setPopupContent(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan titik</small>`);
        markerRef.current.openPopup();
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan titik</small>`)
          .openPopup();
      }
      setMapPinned(true);
    }
  };

  const handleUploadQRIS = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(f => ({ ...f, qris: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getSidebarLinks = () => {
    const list = [
      { href: '/akun', icon: '🏠', label: 'Dashboard' },
      { href: '/akun/pesanan', icon: '📦', label: 'Pesanan Saya' },
      { href: '/akun/chat', icon: '💬', label: 'Chat' },
      { href: '/akun/hewan', icon: '🐾', label: 'Hewan Saya' },
    ];
    if (user?.peran !== 'owner') {
      list.push({ href: '/akun/daftar-kios', icon: '🏪', label: 'Buka Kios' });
    }
    if (user?.peran !== 'dokter' && !user?.hasDokter) {
      list.push({ href: '/akun/daftar-dokter', icon: '🏥', label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    if (user?.peran !== 'grooming' && !user?.hasGrooming) {
      list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    return list;
  };

  if (user?.peran === 'owner') {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
            <h2>Anda sudah memiliki kios!</h2>
            <p style={{ marginBottom: '1.5rem' }}>Kelola kios Anda di Dashboard Owner</p>
            <button onClick={() => navigate('/kios')} className="btn btn-primary btn-lg">
              Ke Dashboard Kios <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaKios) return;
    if (!form.namaBank || !form.noRekening || !form.namaPemilikRek) {
      alert('Informasi rekening bank wajib diisi!');
      return;
    }
    if (!form.lat || !form.lng) {
      alert('Harap pilih lokasi kios Anda pada peta terlebih dahulu!');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    try {
      await daftarKios(form);
      setSuccess(true);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s infinite' }}>🎉</div>
            <h2>Pendaftaran Kios Berhasil!</h2>
            <p style={{ maxWidth: 400, margin: '0.75rem auto 1.5rem' }}>
              Kios <strong style={{ color: 'var(--primary)' }}>{form.namaKios}</strong> sedang direview oleh tim PetPlace. 
              Proses verifikasi 1-2 hari kerja.
            </p>
            <button onClick={() => navigate('/kios')} className="btn btn-primary btn-lg">
              Ke Dashboard Kios <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '0.5rem' }}>🏪 Daftar Buka Kios</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Bergabung sebagai mitra PetPlace dan mulai berjualan produk hewan</p>

        {/* Benefits */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {[
            { icon: '🆓', title: 'Gratis Daftar', desc: 'Tidak ada biaya pendaftaran' },
            { icon: '💰', title: 'Komisi 10%', desc: 'Hanya dari transaksi berhasil' },
            { icon: '📊', title: 'Laporan Lengkap', desc: 'Pantau penjualan real-time' },
          ].map(b => (
            <div key={b.title} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{b.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{b.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.desc}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>📋 Informasi Kios</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Nama Kios <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.namaKios} onChange={e => setForm(f => ({ ...f, namaKios: e.target.value }))} className="form-input" placeholder="Contoh: PetMart Makassar" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Deskripsi Kios</label>
                <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} className="form-input" placeholder="Ceritakan tentang kios Anda..." rows={3} />
              </div>
              {[
                { key: 'telepon', label: 'No. Telepon Kios', placeholder: '08xx-xxxx-xxxx' },
                { key: 'email', label: 'Email Kios', placeholder: 'kios@email.com' },
                { key: 'hariOperasi', label: 'Hari Operasi', placeholder: 'Senin-Sabtu' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Jam Operasi</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="time" value={form.jamBuka} onChange={e => setForm(f => ({ ...f, jamBuka: e.target.value }))} className="form-input" style={{ flex: 1 }} />
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <input type="time" value={form.jamTutup} onChange={e => setForm(f => ({ ...f, jamTutup: e.target.value }))} className="form-input" style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Lokasi Kios */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} /> Lokasi Kios
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Klik pada peta untuk menandai lokasi kios Anda. Koordinat ini digunakan untuk fitur pelacakan pesanan pembeli secara real-time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
              {/* Alamat dengan Autocomplete */}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Alamat Lengkap</label>
                <AlamatAutocomplete
                  value={form.alamat}
                  onChange={val => setForm(f => ({ ...f, alamat: val }))}
                  onGeocode={handleGeocode}
                  kota={form.kota}
                  placeholder="Cari nama jalan, daerah, atau kelurahan..."
                />
              </div>

              {/* Kota — dropdown */}
              <div className="form-group">
                <label className="form-label">Kota</label>
                <select
                  value={form.kota}
                  onChange={e => setForm(f => ({ ...f, kota: e.target.value }))}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">-- Pilih Kota --</option>
                  {DAFTAR_KOTA.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Koordinat</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input readOnly value={form.lat ? `${form.lat}` : ''} className="form-input" placeholder="Lat" style={{ flex: 1, color: form.lat ? 'var(--primary)' : undefined, fontFamily: 'monospace', fontSize: '0.78rem' }} />
                  <input readOnly value={form.lng ? `${form.lng}` : ''} className="form-input" placeholder="Lng" style={{ flex: 1, color: form.lng ? 'var(--primary)' : undefined, fontFamily: 'monospace', fontSize: '0.78rem' }} />
                </div>
              </div>
            </div>

            {/* Tombol Deteksi IP */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDetectIP}
                disabled={detectingIP}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {detectingIP
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mendeteksi.....</>
                  : <><Crosshair size={14} /> Deteksi Lokasi dari IP</>}
              </button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                atau klik langsung pada peta untuk menentukan titik kios
              </span>
            </div>

            {/* Map Picker */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: `2px solid ${mapPinned ? 'var(--primary)' : 'var(--border)'}`, transition: 'border-color 0.3s ease', boxShadow: mapPinned ? '0 0 0 3px rgba(249,115,22,0.15)' : 'none' }}>
              <div ref={mapRef} style={{ height: 260, width: '100%', background: 'var(--bg-secondary)' }} />
              {!mapReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: 'white', gap: '0.5rem', zIndex: 10 }}>
                  <span style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  <span style={{ fontSize: '0.82rem' }}>Memuat peta...</span>
                </div>
              )}
              {mapReady && !mapPinned && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '0.4rem 0.9rem', borderRadius: 99, fontSize: '0.75rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Navigation size={12} /> Klik pada peta untuk menentukan lokasi kios
                </div>
              )}
              {mapPinned && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(16,185,129,0.9)', color: 'white', padding: '0.3rem 0.7rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={12} /> Lokasi ditandai
                </div>
              )}
            </div>
            {!mapPinned && (
              <div className="alert alert-warning" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                ⚠️ Lokasi kios <strong>wajib dipilih</strong> pada peta agar fitur pelacakan pesanan dapat berfungsi.
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>💳 Informasi Pembayaran</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { key: 'namaBank', label: 'Nama Bank', placeholder: 'BCA, BNI, BRI, Mandiri...' },
                { key: 'noRekening', label: 'No. Rekening', placeholder: '1234567890' },
                { key: 'namaPemilikRek', label: 'Nama Pemilik Rekening', placeholder: 'Sesuai buku tabungan' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Upload Foto QRIS</label>
                <input type="file" accept="image/*" onChange={handleUploadQRIS} className="form-input" style={{ cursor: 'pointer' }} />
                {form.qris && (
                  <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: 200, border: '1px solid var(--border)' }}>
                    <img src={form.qris} alt="QRIS Preview" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
              💡 Informasi rekening dan QRIS digunakan untuk pembeli yang melakukan pembayaran ke kios Anda.
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                Mendaftarkan Kios...
              </span>
            ) : (
              <><CheckCircle size={18} /> Daftarkan Kios Sekarang</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
