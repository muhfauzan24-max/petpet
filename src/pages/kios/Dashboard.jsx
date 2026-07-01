import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { useAuth } from "../../context/AuthContext";
import { formatRupiah } from "../../data/mockData";
import { kiosAPI, pesananAPI } from "../../services/api";
import { RefreshCw, Bell, CheckCircle, XCircle, Eye, Clock, Package, Truck, MapPin, Navigation, Crosshair, Loader } from "lucide-react";
import { NotifikasiKiosAlert } from "../../components/ui/NotifikasiKios";
import AlamatAutocomplete from "../../components/ui/AlamatAutocomplete";
import { DAFTAR_KOTA } from "../../data/daftarAlamat";

export default function KiosDashboard() {
  const { user } = useAuth();
  const [stats, setStats]           = useState(null);
  const [buktiBayar, setBuktiBayar] = useState([]);
  const [pesananDiproses, setPesananDiproses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [selectedBukti, setSelectedBukti] = useState(null); // untuk modal lihat foto
  const [showLokasiModal, setShowLokasiModal] = useState(false);
  const [kiosLokasi, setKiosLokasi] = useState({ lat: '', lng: '', alamat: '', kota: 'Makassar', id: null });

  const idKios    = user?.kios?.id;
  const statusKios = user?.kios?.status;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    if (!idKios) return;
    try {
      const [statsData, bayarData, diprosesData] = await Promise.all([
        kiosAPI.stats(idKios),
        pesananAPI.kiosList({ status: 'verifikasi' }),
        pesananAPI.kiosList({ status: 'diproses' }),
      ]);
      setStats(statsData);
      setBuktiBayar(bayarData || []);
      setPesananDiproses(diprosesData || []);

      if (selectedBukti) {
        const updated = (bayarData || []).find(p => p.id === selectedBukti.id);
        if (!updated) {
          setSelectedBukti(null);
        } else {
          setSelectedBukti(updated);
        }
      }
    } catch (err) {
      console.error("Gagal memperbarui data dashboard:", err);
    }
  };

  const loadData = async () => {
    if (!idKios) { setLoading(false); return; }
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Also load kios lokasi
    if (idKios) {
      kiosAPI.detail(idKios)
        .then(d => setKiosLokasi({ lat: d.lat || '', lng: d.lng || '', alamat: d.alamat || '', kota: d.kota || 'Makassar', id: idKios }))
        .catch(() => setKiosLokasi(prev => ({ ...prev, id: idKios })));
    }
  }, [idKios]);

  // Polling data secara real-time setiap 10 detik
  useEffect(() => {
    if (!idKios) return;
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [idKios, selectedBukti]);

  // Terima pembayaran → ubah status ke diproses
  const handleTerima = async (p) => {
    if (!window.confirm(`Terima pembayaran dari ${p.namaPembeli}?\nPesanan akan langsung diproses.`)) return;
    try {
      await pesananAPI.verifikasi(p.id, true);
      showToast('success', `✅ Pembayaran #${p.kode} dikonfirmasi! Pesanan siap diproses.`);
      setSelectedBukti(null);
      await loadData();
    } catch (err) {
      showToast('error', err.message || 'Gagal mengkonfirmasi pembayaran');
    }
  };

  // Tolak pembayaran → ubah status ke menunggu_pembayaran
  const handleTolak = async (p) => {
    if (!window.confirm(`Tolak bukti bayar ini?\nPembeli akan diminta upload ulang.`)) return;
    try {
      await pesananAPI.verifikasi(p.id, false);
      showToast('error', `❌ Pembayaran #${p.kode} ditolak. Pembeli perlu upload ulang.`);
      setSelectedBukti(null);
      await loadData();
    } catch (err) {
      showToast('error', err.message || 'Gagal menolak pembayaran');
    }
  };

  // Selesai diproses → ubah status ke dikirim & masukkan nomor resi
  const handleKirim = async (p) => {
    const noResi = window.prompt(`Masukkan Nomor Resi Pengiriman untuk Pesanan #${p.kode}:`, `RESI-${p.kode.split('-').pop()}`);
    if (noResi === null) return; // Batal
    try {
      await pesananAPI.updateStatus(p.id, 'dikirim', noResi);
      showToast('success', `📦 Pesanan #${p.kode} dikirim dengan No. Resi: ${noResi || '-'}`);
      await loadData();
    } catch (err) {
      showToast('error', err.message || 'Gagal mengubah status menjadi dikirim');
    }
  };

  // ─── Komponen Atur Lokasi Kios ────────────────────────────────────────────────
  function LokasiKiosModal({ kios, onClose, onSaved }) {
    const [mapReady, setMapReady] = useState(false);
    const [mapPinned, setMapPinned] = useState(!!(kios?.lat));
    const [saving, setSaving] = useState(false);
    const [detectingIP, setDetectingIP] = useState(false);
    const [locForm, setLocForm] = useState({ lat: kios?.lat || '', lng: kios?.lng || '', alamat: kios?.alamat || '', kota: kios?.kota || 'Makassar' });
    const lkMapRef = useRef(null);
    const lkMapInst = useRef(null);
    const lkMarkerRef = useRef(null);

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

    useEffect(() => {
      if (!mapReady || !lkMapRef.current || lkMapInst.current) return;
      const L = window.L;
      const initLat = parseFloat(kios?.lat) || -5.1477;
      const initLng = parseFloat(kios?.lng) || 119.4327;
      const map = L.map(lkMapRef.current, { center: [initLat, initLng], zoom: 14 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '\u00a9 OpenStreetMap' }).addTo(map);
      const pinIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:#F97316;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.3)">\ud83c\udfea</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });
      if (kios?.lat && kios?.lng) {
        lkMarkerRef.current = L.marker([initLat, initLng], { icon: pinIcon }).addTo(map).bindPopup('<strong>Lokasi Kios Anda</strong>').openPopup();
      }
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (lkMarkerRef.current) lkMarkerRef.current.setLatLng([lat, lng]);
        else {
          lkMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map).bindPopup('<strong>Lokasi Kios Anda</strong>').openPopup();
        }
        setLocForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
        setMapPinned(true);
      });
      lkMapInst.current = map;
      return () => { if (lkMapInst.current) { lkMapInst.current.remove(); lkMapInst.current = null; lkMarkerRef.current = null; } };
    }, [mapReady]);

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
          setLocForm(f => ({ ...f, kota, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
          if (lkMapInst.current) {
            const L = window.L;
            lkMapInst.current.setView([lat, lng], 15);
            const pinIcon = L.divIcon({
              className: '',
              html: `<div style="width:32px;height:32px;background:#F97316;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.3)">\ud83c\udfea</div>`,
              iconSize: [32, 32], iconAnchor: [16, 16],
            });
            if (lkMarkerRef.current) lkMarkerRef.current.setLatLng([lat, lng]);
            else {
              lkMarkerRef.current = L.marker([lat, lng], { icon: pinIcon })
                .addTo(lkMapInst.current)
                .bindPopup(`<strong>\ud83d\udccd Lokasi Anda (${kota})</strong><br/><small>Klik peta untuk sesuaikan</small>`)
                .openPopup();
            }
            setMapPinned(true);
          }
        } else {
          alert('Tidak dapat mendeteksi lokasi dari IP. Silakan klik langsung pada peta.');
        }
      } catch (err) {
        alert('Gagal mendeteksi lokasi: ' + (err.message || 'Cek koneksi'));
      }
      setDetectingIP(false);
    };

    // Gerakkan peta ke koordinat hasil geocoding dari AlamatAutocomplete
    const handleGeocode = ({ lat, lng, displayName }) => {
      setLocForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
      if (lkMapInst.current) {
        const L = window.L;
        lkMapInst.current.setView([lat, lng], 16);
        const pinIcon = L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;background:#F97316;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.3)">\ud83c\udfea</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16],
        });
        const shortName = displayName?.split(',').slice(0, 3).join(',') || 'Lokasi Kios';
        if (lkMarkerRef.current) {
          lkMarkerRef.current.setLatLng([lat, lng]);
          lkMarkerRef.current.setPopupContent(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan titik</small>`);
          lkMarkerRef.current.openPopup();
        } else {
          lkMarkerRef.current = L.marker([lat, lng], { icon: pinIcon })
            .addTo(lkMapInst.current)
            .bindPopup(`<strong>\ud83d\udccd ${shortName}</strong><br/><small>Klik peta untuk sesuaikan titik</small>`)
            .openPopup();
        }
        setMapPinned(true);
      }
    };

    const handleSave = async () => {
      if (!locForm.lat || !locForm.lng) { alert('Klik pada peta untuk menentukan lokasi!'); return; }
      setSaving(true);
      try {
        await kiosAPI.update(kios.id, locForm);
        onSaved({ ...locForm });
        onClose();
      } catch (err) { alert(err.message || 'Gagal menyimpan lokasi'); }
      setSaving(false);
    };

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
           onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="card" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
          <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} style={{ color: 'var(--primary)' }} /> Atur Lokasi Kios</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Klik pada peta untuk menentukan koordinat kios. Koordinat ini digunakan pembeli untuk melacak pesanan secara real-time.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {/* Alamat dengan autocomplete */}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Alamat Lengkap</label>
              <AlamatAutocomplete
                value={locForm.alamat}
                onChange={val => setLocForm(f => ({ ...f, alamat: val }))}
                onGeocode={handleGeocode}
                kota={locForm.kota}
                placeholder="Cari nama jalan atau daerah..."
              />
            </div>
            {/* Kota dropdown */}
            <div className="form-group">
              <label className="form-label">Kota</label>
              <select
                value={locForm.kota}
                onChange={e => setLocForm(f => ({ ...f, kota: e.target.value }))}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- Pilih Kota --</option>
                {DAFTAR_KOTA.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Koordinat (otomatis)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input readOnly value={locForm.lat} className="form-input" placeholder="Lat" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: locForm.lat ? 'var(--primary)' : undefined }} />
                <input readOnly value={locForm.lng} className="form-input" placeholder="Lng" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: locForm.lng ? 'var(--primary)' : undefined }} />
              </div>
            </div>
          </div>

          {/* Tombol Deteksi IP */}
          <div style={{ marginBottom: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDetectIP}
              disabled={detectingIP}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {detectingIP
                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Mendeteksi...</>
                : <><Crosshair size={13} /> Deteksi Lokasi dari IP</>}
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>atau klik langsung pada peta</span>
          </div>

          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${mapPinned ? 'var(--primary)' : 'var(--border)'}`, transition: 'border-color 0.3s', marginBottom: '1rem' }}>
            <div ref={lkMapRef} style={{ height: 240, width: '100%', background: 'var(--bg-secondary)' }} />
            {mapReady && !mapPinned && (
              <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '0.35rem 0.8rem', borderRadius: 99, fontSize: '0.72rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Navigation size={11} /> Klik peta untuk menentukan lokasi
              </div>
            )}
            {mapPinned && (
              <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(16,185,129,0.9)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={11} /> Lokasi ditandai
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} disabled={saving || !mapPinned} className="btn btn-primary" style={{ flex: 1 }}>
              {saving ? '\u23f3 Menyimpan...' : <><CheckCircle size={15} /> Simpan Lokasi</>}
            </button>
            <button onClick={onClose} className="btn btn-secondary">Batal</button>
          </div>
        </div>
      </div>
    );
  }

  const getSidebarLinks = () => [
    { href: "/kios",          icon: "🏠", label: "Dashboard" },
    { href: "/kios/produk",   icon: "📦", label: "Produk" },
    { href: "/kios/pesanan",  icon: "🛒", label: "Pesanan" },
    { href: "/kios/chat",     icon: "💬", label: "Chat" },
    { href: "/kios/analitik", icon: "📊", label: "Analitik" },
    { href: "/akun",          icon: "👤", label: "Profil Saya" },
  ];

  // ─── Belum punya kios ────────────────────────────────────────────────────────
  if (!user?.kios) {
    return (
      <div style={{ display:"flex", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto", justifyContent:"center" }}>
        <div className="card-glass" style={{ maxWidth:500, width:"100%", padding:"3rem 2rem", textAlign:"center" }}>
          <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🏪</div>
          <h2>Belum Memiliki Kios</h2>
          <p style={{ color:"var(--text-muted)", marginBottom:"1.5rem" }}>Daftarkan kios Anda untuk mulai berjualan di PetPlace.</p>
          <Link to="/akun/daftar-kios" className="btn btn-primary btn-lg">Daftar Kios Sekarang</Link>
        </div>
      </div>
    );
  }

  if (statusKios === 'pending') {
    return (
      <div style={{ display:"flex", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto", justifyContent:"center" }}>
        <div className="card-glass" style={{ maxWidth:600, width:"100%", padding:"3rem 2rem", textAlign:"center" }}>
          <div style={{ fontSize:"5rem", marginBottom:"1rem", animation:"float 2s infinite" }}>⏳</div>
          <h2>🏪 Kios Sedang Direview</h2>
          <p style={{ color:"var(--text-muted)", marginBottom:"2rem" }}>
            Pendaftaran kios <strong style={{ color:"var(--primary)" }}>{user.kios.nama}</strong> sedang diverifikasi oleh admin.
            Proses membutuhkan 1-2 hari kerja.
          </p>
          <div className="alert alert-info" style={{ textAlign:"left", marginBottom:"1.5rem" }}>
            💡 Anda akan mendapatkan akses penuh setelah admin menyetujui pendaftaran Anda.
          </div>
          <button onClick={() => window.location.reload()} className="btn btn-secondary btn-sm">
            ↻ Perbarui Status
          </button>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label:"Total Produk",        value: stats.totalProduk,                  icon:"📦", color:"var(--primary)" },
    { label:"Total Pesanan",       value: stats.totalPesanan,                 icon:"🛒", color:"var(--secondary)" },
    { label:"Menunggu Verifikasi", value: stats.pesananVerifikasi,            icon:"⏳", color:"#F59E0B" },
    { label:"Total Penjualan",     value: formatRupiah(stats.totalPenjualan), icon:"💰", color:"var(--accent)" },
  ] : [];

  return (
    <>
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={getSidebarLinks()} title="Dashboard Kios" />
      <div style={{ flex:1 }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position:"fixed", top:90, right:24, zIndex:9999,
            background: toast.type === 'success' ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            color:"#fff", borderRadius:"var(--radius-lg)", padding:"0.9rem 1.5rem",
            fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)",
            display:"flex", alignItems:"center", gap:"0.5rem",
            animation:"slideIn 0.3s ease",
          }}>
            {toast.type === 'success' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
            {toast.msg}
          </div>
        )}

        {/* Header Banner */}
        <div style={{ background:"linear-gradient(135deg,rgba(249,115,22,0.1),rgba(139,92,246,0.1))", border:"1px solid rgba(249,115,22,0.2)", borderRadius:"var(--radius-xl)", padding:"1.75rem", marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h2>🏪 {user?.kios?.nama || "Kios Saya"}</h2>
            <p style={{ color:"var(--text-muted)", marginTop:"0.25rem", marginBottom:"0.5rem" }}>Selamat datang, {user?.nama?.split(" ")[0]}!</p>
            {/* Info lokasi singkat di header */}
            {kiosLokasi?.lat ? (
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.78rem", color:"var(--text-muted)" }}>
                <MapPin size={12} style={{ color:"var(--primary)", flexShrink:0 }} />
                <span style={{ maxWidth:320, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {kiosLokasi.alamat || `${parseFloat(kiosLokasi.lat).toFixed(4)}, ${parseFloat(kiosLokasi.lng).toFixed(4)}`}
                  {kiosLokasi.kota && `, ${kiosLokasi.kota}`}
                </span>
              </div>
            ) : (
              <div style={{ fontSize:"0.78rem", color:"#F59E0B", display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <MapPin size={12} /> Lokasi kios belum diatur
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
            <button
              onClick={() => setShowLokasiModal(true)}
              className="btn btn-sm"
              style={{ display:"flex", alignItems:"center", gap:"0.35rem",
                background: kiosLokasi?.lat ? "rgba(249,115,22,0.1)" : "rgba(245,158,11,0.15)",
                border: kiosLokasi?.lat ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(245,158,11,0.5)",
                color: kiosLokasi?.lat ? "var(--primary)" : "#F59E0B",
                fontWeight: 600, fontSize: "0.78rem",
              }}
            >
              <Navigation size={13} /> {kiosLokasi?.lat ? 'Perbarui Lokasi' : 'Atur Lokasi'}
            </button>
            <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid-4" style={{ marginBottom:"2rem" }}>
              {statCards.map(s => (
                <div key={s.label} className="card" style={{ padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ fontSize:"1.75rem", marginBottom:"0.5rem" }}>{s.icon}</div>
                  <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.5rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ══════════════ BUKTI BAYAR ══════════════ */}
            <div className="card" style={{
              padding:"1.5rem", marginBottom:"2rem",
              border: buktiBayar.length > 0 ? "1.5px solid rgba(249,115,22,0.35)" : "1px solid var(--border)",
              background: buktiBayar.length > 0 ? "rgba(249,115,22,0.02)" : undefined,
            }}>
              <h3 style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.25rem" }}>
                <Bell size={18} style={{ color: buktiBayar.length > 0 ? "var(--primary)" : "var(--text-muted)" }} />
                💳 Bukti Bayar
                <span style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                  background: buktiBayar.length > 0 ? "var(--primary)" : "var(--bg-secondary)",
                  color: buktiBayar.length > 0 ? "white" : "var(--text-muted)",
                  borderRadius:"50%", width:24, height:24,
                  fontSize:"0.72rem", fontWeight:800,
                  animation: buktiBayar.length > 0 ? "pulse 2s infinite" : "none",
                }}>
                  {buktiBayar.length}
                </span>
              </h3>

              {buktiBayar.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
                  <Clock size={36} style={{ marginBottom:"0.75rem", opacity:0.4 }} />
                  <div style={{ fontSize:"0.875rem" }}>Tidak ada bukti bayar yang menunggu verifikasi</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {buktiBayar.map(p => (
                    <div key={p.id} style={{
                      padding:"1rem 1.25rem",
                      background:"var(--bg-secondary)",
                      border:"1px solid rgba(249,115,22,0.2)",
                      borderLeft:"4px solid var(--primary)",
                      borderRadius:"var(--radius-lg)",
                      display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem",
                      flexWrap:"wrap",
                    }}>
                      {/* Info */}
                      <div style={{ display:"flex", gap:"1rem", alignItems:"center", flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize:"1.35rem", width:44, height:44, flexShrink:0,
                          background:"rgba(249,115,22,0.12)",
                          borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:"2px solid rgba(249,115,22,0.25)",
                        }}>💳</div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>
                            Bukti Bayar: <span style={{ color:"var(--primary)", fontFamily:"monospace" }}>{p.kode}</span>
                          </div>
                          <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.15rem" }}>
                            Pembeli: <strong style={{ color:"var(--text-secondary)" }}>{p.namaPembeli || '-'}</strong>
                            {p.namaPengirim && <> • Pengirim: <strong>{p.namaPengirim}</strong></>}
                            {p.jumlahBayar ? <> • <strong style={{ color:"var(--primary)" }}>{formatRupiah(p.jumlahBayar)}</strong></> : ''}
                          </div>
                          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>
                            {p.namaBank && <span>🏦 {p.namaBank} {p.noRekening && `(${p.noRekening})`} • </span>}
                            {p.waktuBayar ? new Date(p.waktuBayar).toLocaleString('id-ID') : new Date(p.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
                        {p.buktiFoto && (
                          <button
                            onClick={() => setSelectedBukti(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem" }}>
                            <Eye size={13} /> Lihat Foto
                          </button>
                        )}
                        <button
                          onClick={() => handleTerima(p)}
                          className="btn btn-green btn-sm"
                          style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem" }}>
                          <CheckCircle size={13} /> Terima
                        </button>
                        <button
                          onClick={() => handleTolak(p)}
                          className="btn btn-danger btn-sm"
                          style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem" }}>
                          <XCircle size={13} /> Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════════ PESANAN DIPROSES ══════════════ */}
            <div className="card" style={{
              padding:"1.5rem", marginBottom:"2rem",
              border: pesananDiproses.length > 0 ? "1.5px solid rgba(59,130,246,0.35)" : "1px solid var(--border)",
              background: pesananDiproses.length > 0 ? "rgba(59,130,246,0.02)" : undefined,
            }}>
              <h3 style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.25rem" }}>
                <Package size={18} style={{ color: pesananDiproses.length > 0 ? "#3B82F6" : "var(--text-muted)" }} />
                📦 Pesanan Diproses
                <span style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                  background: pesananDiproses.length > 0 ? "#3B82F6" : "var(--bg-secondary)",
                  color: pesananDiproses.length > 0 ? "white" : "var(--text-muted)",
                  borderRadius:"50%", width:24, height:24,
                  fontSize:"0.72rem", fontWeight:800,
                }}>
                  {pesananDiproses.length}
                </span>
              </h3>

              {pesananDiproses.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
                  <Clock size={36} style={{ marginBottom:"0.75rem", opacity:0.4 }} />
                  <div style={{ fontSize:"0.875rem" }}>Tidak ada pesanan yang sedang diproses</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {pesananDiproses.map(p => (
                    <div key={p.id} style={{
                      padding:"1rem 1.25rem",
                      background:"var(--bg-secondary)",
                      border:"1px solid rgba(59,130,246,0.2)",
                      borderLeft:"4px solid #3B82F6",
                      borderRadius:"var(--radius-lg)",
                      display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem",
                      flexWrap:"wrap",
                    }}>
                      {/* Info */}
                      <div style={{ display:"flex", gap:"1rem", alignItems:"center", flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize:"1.35rem", width:44, height:44, flexShrink:0,
                          background:"rgba(59,130,246,0.12)",
                          borderRadius:"50%",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          border:"2px solid rgba(59,130,246,0.25)",
                        }}>📦</div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:"0.88rem", color:"var(--text-primary)" }}>
                            Pesanan Diproses: <span style={{ color:"var(--primary)", fontFamily:"monospace" }}>{p.kode}</span>
                          </div>
                          <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.15rem" }}>
                            Pembeli: <strong style={{ color:"var(--text-secondary)" }}>{p.namaPembeli || '-'}</strong>
                            {p.items && p.items.length > 0 && (
                              <> • Produk: <strong>{p.items.map(it => `${it.nama} x${it.jumlah}`).join(', ')}</strong></>
                            )}
                          </div>
                          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>
                            {p.waktuBayar ? new Date(p.waktuBayar).toLocaleString('id-ID') : new Date(p.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
                        <button
                          onClick={() => handleKirim(p)}
                          className="btn btn-primary btn-sm"
                          style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.75rem" }}>
                          <Truck size={13} /> Kirim Pesanan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══════════════ LOKASI KIOS ══════════════ */}
            <div className="card" style={{
              padding: "1.5rem", marginBottom: "2rem",
              border: kiosLokasi?.lat ? "1px solid rgba(249,115,22,0.3)" : "1.5px dashed rgba(245,158,11,0.6)",
              background: kiosLokasi?.lat ? "rgba(249,115,22,0.03)" : "rgba(245,158,11,0.05)",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                <h3 style={{ display:"flex", alignItems:"center", gap:"0.6rem", margin:0 }}>
                  <MapPin size={18} style={{ color: kiosLokasi?.lat ? "var(--primary)" : "#F59E0B" }} />
                  📍 Lokasi Kios
                  {kiosLokasi?.lat
                    ? <span className="badge badge-green" style={{ fontSize:"0.65rem" }}>✅ Terdaftar</span>
                    : <span style={{ background:"rgba(245,158,11,0.15)", color:"#F59E0B", padding:"0.15rem 0.55rem", borderRadius:999, fontSize:"0.65rem", fontWeight:700 }}>⚠️ Belum diatur</span>
                  }
                </h3>
                <button
                  onClick={() => setShowLokasiModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}
                >
                  <Navigation size={14} /> {kiosLokasi?.lat ? 'Perbarui Titik Lokasi' : 'Atur Lokasi Kios'}
                </button>
              </div>

              {kiosLokasi?.lat ? (
                <div style={{ display:"flex", gap:"1.25rem", alignItems:"flex-start", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    {kiosLokasi.alamat && (
                      <div style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.35rem", display:"flex", gap:"0.4rem" }}>
                        <MapPin size={14} style={{ color:"var(--primary)", marginTop:2, flexShrink:0 }} />
                        <span>{kiosLokasi.alamat}{kiosLokasi.kota ? `, ${kiosLokasi.kota}` : ''}</span>
                      </div>
                    )}
                    <div style={{ fontFamily:"monospace", fontSize:"0.75rem", color:"var(--primary)", background:"rgba(249,115,22,0.08)", padding:"0.3rem 0.65rem", borderRadius:"var(--radius-sm)", display:"inline-block" }}>
                      🌐 {parseFloat(kiosLokasi.lat).toFixed(6)}, {parseFloat(kiosLokasi.lng).toFixed(6)}
                    </div>
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:"var(--radius-md)", padding:"0.6rem 0.9rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                    <CheckCircle size={13} style={{ color:"#10B981" }} />
                    Pembeli dapat melacak pesanan secara real-time
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ flex:1, fontSize:"0.85rem", color:"#F59E0B" }}>
                    ⚠️ Lokasi kios <strong>belum diatur</strong>. Pembeli tidak dapat melacak pesanan secara real-time.
                    Klik tombol <strong>Atur Lokasi Kios</strong> untuk menentukan titik koordinat kios Anda di peta.
                  </div>
                  <button
                    onClick={() => setShowLokasiModal(true)}
                    style={{ display:"flex", alignItems:"center", gap:"0.4rem", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.4)", color:"#F59E0B", padding:"0.5rem 1rem", borderRadius:"var(--radius-md)", cursor:"pointer", fontWeight:600, fontSize:"0.82rem", flexShrink:0 }}
                  >
                    <MapPin size={14} /> Atur Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Quick Nav */}
            <div className="grid-2">
              {[
                { href:"/kios/produk",   icon:"📦", label:"Kelola Produk",    desc:`${stats?.totalProduk || 0} produk aktif`,          color:"var(--primary)" },
                { href:"/kios/pesanan",  icon:"🛒", label:"Validasi Pesanan", desc:`${stats?.pesananVerifikasi || 0} menunggu verifikasi`, color:"var(--secondary)" },
                { href:"/kios/chat",     icon:"💬", label:"Chat Pembeli",     desc:"Balas pesan pembeli",                               color:"var(--dog-blue)" },
                { href:"/kios/analitik", icon:"📊", label:"Laporan Penjualan",desc:"Lihat grafik dan statistik",                       color:"var(--accent)" },
              ].map(item => (
                <Link key={item.href} to={item.href} style={{ textDecoration:"none" }}>
                  <div className="card" style={{ padding:"1.25rem", display:"flex", gap:"0.75rem", alignItems:"center" }}>
                    <div style={{ fontSize:"1.5rem", width:48, height:48, background:`${item.color}15`, borderRadius:"var(--radius-md)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{item.label}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{item.desc}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Modal Lihat Foto Bukti Bayar */}
    {selectedBukti && (
      <div
        style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem" }}
        onClick={e => e.target === e.currentTarget && setSelectedBukti(null)}>
        <div className="card" style={{ width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", padding:"1.75rem", position:"relative" }}>
          {/* Close */}
          <button onClick={() => setSelectedBukti(null)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:4 }}>
            ✕
          </button>

          <h3 style={{ marginBottom:"0.25rem" }}>💳 Bukti Pembayaran</h3>
          <div style={{ fontFamily:"monospace", color:"var(--primary)", fontWeight:700, marginBottom:"1.25rem" }}>#{selectedBukti.kode}</div>

          {/* Info Pembayaran */}
          <div style={{ padding:"0.875rem", background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", marginBottom:"1rem", fontSize:"0.82rem", display:"flex", flexDirection:"column", gap:"0.25rem" }}>
            <div><span style={{ color:"var(--text-muted)" }}>Pembeli: </span><strong>{selectedBukti.namaPembeli}</strong></div>
            {selectedBukti.namaPengirim && <div><span style={{ color:"var(--text-muted)" }}>Nama Pengirim: </span><strong>{selectedBukti.namaPengirim}</strong></div>}
            {selectedBukti.namaBank && <div><span style={{ color:"var(--text-muted)" }}>Bank: </span><strong>{selectedBukti.namaBank}</strong>{selectedBukti.noRekening && ` (${selectedBukti.noRekening})`}</div>}
            {selectedBukti.jumlahBayar && <div><span style={{ color:"var(--text-muted)" }}>Jumlah: </span><strong style={{ color:"var(--primary)", fontSize:"1rem" }}>{formatRupiah(selectedBukti.jumlahBayar)}</strong></div>}
            {selectedBukti.waktuBayar && <div><span style={{ color:"var(--text-muted)" }}>Waktu Upload: </span>{new Date(selectedBukti.waktuBayar).toLocaleString('id-ID')}</div>}
          </div>

          {/* Foto Bukti */}
          {selectedBukti.buktiFoto ? (
            <div style={{ borderRadius:"var(--radius-md)", overflow:"hidden", border:"1px solid var(--border)", background:"var(--bg-secondary)", marginBottom:"1.25rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img
                src={selectedBukti.buktiFoto.startsWith('data:') || selectedBukti.buktiFoto.startsWith('http')
                  ? selectedBukti.buktiFoto
                  : `${window.location.protocol}//${window.location.hostname}${selectedBukti.buktiFoto}`}
                alt="Bukti bayar"
                style={{ width:"100%", maxHeight:420, objectFit:"contain" }}
              />
            </div>
          ) : (
            <div style={{ padding:"2rem", textAlign:"center", color:"var(--text-muted)", background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", marginBottom:"1.25rem" }}>
              ⚠️ Foto bukti tidak tersedia
            </div>
          )}

          {/* Tombol Aksi */}
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button onClick={() => handleTerima(selectedBukti)} className="btn btn-primary" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
              <CheckCircle size={16} /> ✅ Terima Pembayaran
            </button>
            <button onClick={() => handleTolak(selectedBukti)} className="btn btn-danger" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
              <XCircle size={16} /> ❌ Tolak
            </button>
          </div>
        </div>
      </div>
    )}

    {showLokasiModal && (
      <LokasiKiosModal
        kios={{ ...kiosLokasi, id: kiosLokasi.id || idKios }}
        onClose={() => setShowLokasiModal(false)}
        onSaved={(newLoc) => {
          setKiosLokasi(prev => ({ ...prev, ...newLoc }));
          showToast('success', '📍 Lokasi kios berhasil disimpan!');
        }}
      />
    )}

    <NotifikasiKiosAlert />
    </>
  );
}
