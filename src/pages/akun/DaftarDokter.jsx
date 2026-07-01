import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { dokterAPI } from '../../services/api';
import { CheckCircle, ArrowRight, MapPin, Navigation, Crosshair, Loader } from 'lucide-react';
import AlamatAutocomplete from '../../components/ui/AlamatAutocomplete';
import { DAFTAR_KOTA } from '../../data/daftarAlamat';

export default function DaftarDokter() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    spesialisasi: 'Spesialis Kucing & Anjing', noStr: '', deskripsi: '',
    hargaKonsultasi: '100000', alamat: '', kota: 'Makassar', lat: '', lng: '',
    namaBank: '', noRekening: '', namaPemilikRek: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapPinned, setMapPinned] = useState(false);
  const [detectingIP, setDetectingIP] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const mapCenterRef = useRef([-5.1477, 119.4327]);

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

  // Init peta
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    const [defLat, defLng] = mapCenterRef.current;
    const map = L.map(mapRef.current, { center: [defLat, defLng], zoom: 13, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\u00a9 OpenStreetMap contributors',
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:#3B82F6;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">\ud83c\udfe5</div></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36],
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map)
          .bindPopup('<strong>\ud83d\udccd Klinik Dokter Anda</strong>').openPopup();
      }
      setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
      setMapPinned(true);
    });

    mapInstance.current = map;
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; markerRef.current = null; }
    };
  }, [mapReady]);

  // Gerakkan peta ke alamat (dari geocoding AlamatAutocomplete)
  const handleGeocode = ({ lat, lng, displayName }) => {
    setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
    if (mapInstance.current) {
      const L = window.L;
      mapInstance.current.setView([lat, lng], 16);
      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#3B82F6;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">\ud83c\udfe5</div></div>`,
        iconSize: [36, 36], iconAnchor: [18, 36],
      });
      const shortName = displayName?.split(',').slice(0, 3).join(',') || 'Klinik';
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setPopupContent(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan</small>`);
        markerRef.current.openPopup();
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstance.current)
          .bindPopup(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan</small>`).openPopup();
      }
      setMapPinned(true);
    }
  };

  // Deteksi lokasi via IP
  const handleDetectIP = async () => {
    setDetectingIP(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const kota = data.city || data.region || 'Makassar';
        setForm(f => ({ ...f, kota, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
        if (mapInstance.current) {
          const L = window.L;
          mapInstance.current.setView([lat, lng], 15);
          const pinIcon = L.divIcon({
            className: '',
            html: `<div style="width:36px;height:36px;background:#3B82F6;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);text-align:center;font-size:16px;line-height:30px">\ud83c\udfe5</div></div>`,
            iconSize: [36, 36], iconAnchor: [18, 36],
          });
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else {
            markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstance.current)
              .bindPopup(`<strong>\ud83d\udccd Lokasi Anda (${kota})</strong><br/><small>Klik peta untuk sesuaikan</small>`).openPopup();
          }
          setMapPinned(true);
        } else {
          mapCenterRef.current = [lat, lng];
        }
      } else {
        alert('Tidak dapat mendeteksi lokasi dari IP. Silakan klik langsung pada peta.');
      }
    } catch (err) {
      alert('Gagal mendeteksi lokasi: ' + (err.message || 'Cek koneksi internet'));
    }
    setDetectingIP(false);
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
    list.push({ href: '/akun/daftar-dokter', icon: '🏥', label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    if (user?.peran !== 'grooming' && !user?.hasGrooming) {
      list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    return list;
  };

  const isPending = user?.dokterStatus === 'pending';
  const isActive = user?.hasDokter || user?.peran === 'dokter';

  if (isActive) {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏥</div>
            <h2>Anda sudah terdaftar sebagai Dokter Hewan!</h2>
            <p style={{ marginBottom: '1.5rem' }}>Kelola praktik Anda di Portal Dokter</p>
            <button onClick={() => navigate('/portal-dokter')} className="btn btn-primary btn-lg">
              Ke Portal Dokter <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.noStr) return;
    setLoading(true);
    try {
      await dokterAPI.daftar({
        nama: user.nama,
        spesialisasi: form.spesialisasi,
        noStr: form.noStr,
        deskripsi: form.deskripsi,
        hargaKonsultasi: parseInt(form.hargaKonsultasi),
        alamat: form.alamat,
        kota: form.kota,
        lat: form.lat || null,
        lng: form.lng || null,
        namaBank: form.namaBank,
        noRekening: form.noRekening,
        namaPemilikRek: form.namaPemilikRek,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success || isPending) {
    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s infinite' }}>⏳</div>
            <h2>Pendaftaran Dokter Sedang Direview!</h2>
            <p style={{ maxWidth: 450, margin: '0.75rem auto 1.5rem', color: 'var(--text-muted)' }}>
              Permintaan pendaftaran Dokter Hewan Anda sedang diverifikasi oleh Admin PetPlace. 
              Proses verifikasi membutuhkan waktu 1-2 hari kerja.
            </p>
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              Kembali ke Beranda
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
        <h2 style={{ marginBottom: '0.5rem' }}>🏥 Daftar sebagai Dokter Hewan</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Membuka konsultasi hewan secara online dan tatap muka melalui PetPlace</p>

        <form onSubmit={handleSubmit}>
          {/* Informasi Dokter */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>📋 Informasi Dokter & Keahlian</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Spesialisasi <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.spesialisasi} onChange={e => setForm(f => ({ ...f, spesialisasi: e.target.value }))} className="form-input" placeholder="Contoh: Spesialis Dermatologi Kucing" />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor STR (Izin Praktik) <span style={{ color: '#F87171' }}>*</span></label>
                <input required value={form.noStr} onChange={e => setForm(f => ({ ...f, noStr: e.target.value }))} className="form-input" placeholder="STR-YYYY-xxxxxx" />
              </div>
              <div className="form-group">
                <label className="form-label">Biaya Konsultasi (Rp) <span style={{ color: '#F87171' }}>*</span></label>
                <input required type="number" value={form.hargaKonsultasi} onChange={e => setForm(f => ({ ...f, hargaKonsultasi: e.target.value }))} className="form-input" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Deskripsi Profil Singkat</label>
                <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} className="form-input" placeholder="Ceritakan latar belakang pendidikan dan pengalaman Anda..." rows={3} />
              </div>
            </div>
          </div>

          {/* Lokasi Klinik — dengan peta */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} /> Lokasi Klinik / Tempat Praktik
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Tandai lokasi klinik Anda di peta — akan muncul di halaman peta PetPlace dan membantu pemilik hewan menemukan klinik Anda.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
              {/* Alamat dengan autocomplete + geocoding */}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Alamat Klinik / Tempat Praktik <span style={{ color: '#F87171' }}>*</span></label>
                <AlamatAutocomplete
                  value={form.alamat}
                  onChange={val => setForm(f => ({ ...f, alamat: val }))}
                  onGeocode={handleGeocode}
                  kota={form.kota}
                  placeholder="Cari nama jalan, gedung, atau daerah klinik..."
                />
              </div>

              {/* Kota dropdown */}
              <div className="form-group">
                <label className="form-label">Kota</label>
                <select value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))} className="form-input" style={{ cursor: 'pointer' }}>
                  <option value="">-- Pilih Kota --</option>
                  {DAFTAR_KOTA.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Koordinat read-only */}
              <div className="form-group">
                <label className="form-label">Koordinat (otomatis)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input readOnly value={form.lat} className="form-input" placeholder="Lat" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', color: form.lat ? '#3B82F6' : undefined }} />
                  <input readOnly value={form.lng} className="form-input" placeholder="Lng" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.78rem', color: form.lng ? '#3B82F6' : undefined }} />
                </div>
              </div>
            </div>

            {/* Tombol Deteksi IP */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleDetectIP} disabled={detectingIP}
                className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {detectingIP
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mendeteksi...</>
                  : <><Crosshair size={14} /> Deteksi Lokasi dari IP</>}
              </button>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>atau klik langsung pada peta</span>
            </div>

            {/* Map Picker — warna biru untuk dokter */}
            <div style={{
              position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: `2px solid ${mapPinned ? '#3B82F6' : 'var(--border)'}`,
              transition: 'border-color 0.3s ease',
              boxShadow: mapPinned ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
            }}>
              <div ref={mapRef} style={{ height: 260, width: '100%', background: 'var(--bg-secondary)' }} />
              {!mapReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: 'white', gap: '0.5rem', zIndex: 10 }}>
                  <span style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  <span style={{ fontSize: '0.82rem' }}>Memuat peta...</span>
                </div>
              )}
              {mapReady && !mapPinned && (
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '0.4rem 0.9rem', borderRadius: 99, fontSize: '0.75rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Navigation size={12} /> Klik pada peta untuk menentukan lokasi klinik
                </div>
              )}
              {mapPinned && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(59,130,246,0.9)', color: 'white', padding: '0.3rem 0.7rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={12} /> Lokasi ditandai
                </div>
              )}
            </div>
            <div className="alert alert-info" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
              💡 Lokasi klinik akan ditampilkan pada peta PetPlace sehingga pemilik hewan dapat menemukan klinik Anda dengan mudah.
            </div>
          </div>

          {/* Rekening Bank */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--primary)' }}>💳 Rekening Bank Pembayaran</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { key: 'namaBank', label: 'Nama Bank', placeholder: 'BCA, BNI, Mandiri...' },
                { key: 'noRekening', label: 'No. Rekening', placeholder: '1234567890' },
                { key: 'namaPemilikRek', label: 'Nama Pemilik Rekening', placeholder: 'Sesuai buku tabungan' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input required value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Mengirimkan Pendaftaran...' : <><CheckCircle size={18} /> Daftarkan Dokter Hewan Sekarang</>}
          </button>
        </form>
      </div>
    </div>
  );
}
