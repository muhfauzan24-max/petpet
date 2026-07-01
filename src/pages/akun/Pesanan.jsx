import { useState, useEffect, useRef } from 'react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { formatRupiah } from '../../data/mockData';
import { pesananAPI, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { RefreshCw, Package, ChevronRight, X, MapPin, Truck, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';

// ─── Mapping status ke step index ─────────────────────────────────────────────
const STATUS_STEP = {
  menunggu_pembayaran: 0,
  verifikasi:          1,
  diproses:            2,
  dikirim:             3,
  selesai:             4,
  dibatalkan:         -1,
};

const STATUS_LABELS = {
  menunggu_pembayaran: '⏳ Menunggu Pembayaran',
  verifikasi:          '🔍 Diverifikasi',
  diproses:            '⚙️ Diproses',
  dikirim:             '🚚 Dikirim',
  selesai:             '✅ Selesai',
  dibatalkan:          '❌ Dibatalkan',
};

const STATUS_COLOR = {
  menunggu_pembayaran: { badge: 'badge-orange', text: '#F59E0B' },
  verifikasi:          { badge: 'badge-purple', text: '#8B5CF6' },
  diproses:            { badge: 'badge-blue',   text: '#3B82F6' },
  dikirim:             { badge: 'badge-purple', text: '#8B5CF6' },
  selesai:             { badge: 'badge-green',  text: '#10B981' },
  dibatalkan:          { badge: 'badge-red',    text: '#EF4444' },
};

// ─── Tracking stepper config ───────────────────────────────────────────────────
const TRACKING_STEPS = [
  { key: 'menunggu_pembayaran', icon: CreditCard, label: 'Pembayaran',   desc: 'Menunggu konfirmasi pembayaran dari Anda' },
  { key: 'verifikasi',          icon: AlertCircle, label: 'Verifikasi',   desc: 'Admin sedang memverifikasi pembayaran' },
  { key: 'diproses',            icon: Package,     label: 'Diproses',     desc: 'Penjual sedang mempersiapkan pesanan Anda' },
  { key: 'dikirim',             icon: Truck,       label: 'Dalam Pengiriman', desc: 'Pesanan sedang dalam perjalanan ke Anda' },
  { key: 'selesai',             icon: CheckCircle, label: 'Sampai!',      desc: 'Pesanan telah diterima. Terima kasih! 🎉' },
];

// ─── Komponen Tracking Stepper ─────────────────────────────────────────────────
function TrackingModal({ pesanan, onClose, onSelesai }) {
  const currentStep = STATUS_STEP[pesanan.status] ?? 0;
  const isCancelled = pesanan.status === 'dibatalkan';

  const [detail, setDetail] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Load detail pesanan lengkap untuk koordinat
  useEffect(() => {
    pesananAPI.detail(pesanan.id)
      .then(res => setDetail(res))
      .catch(err => console.error("Gagal memuat detail pesanan:", err));
  }, [pesanan.id]);

  const showMap = ['diproses', 'dikirim', 'selesai'].includes(pesanan.status);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!showMap) return;
    if (window.L) {
      setMapReady(true);
      return;
    }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
  }, [showMap]);

  // Init Map
  useEffect(() => {
    if (!showMap || !mapReady || !detail || !mapRef.current || mapInstance.current) return;

    const L = window.L;

    let latKios = parseFloat(detail.items?.[0]?.latKios);
    let lngKios = parseFloat(detail.items?.[0]?.lngKios);
    let latPenerima = parseFloat(detail.latPenerima);
    let lngPenerima = parseFloat(detail.lngPenerima);

    // Fallbacks
    if (isNaN(latKios) || isNaN(lngKios)) {
      latKios = -5.1477;
      lngKios = 119.4327;
    }
    if (isNaN(latPenerima) || isNaN(lngPenerima)) {
      latPenerima = -5.1600;
      lngPenerima = 119.4450;
    }

    // Offset if coordinates are identical
    if (latKios === latPenerima && lngKios === lngPenerima) {
      latPenerima -= 0.012;
      lngPenerima += 0.012;
    }

    const map = L.map(mapRef.current, {
      center: [latKios, lngKios],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Icons
    const kiosIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 32px; height: 32px;
        background: #F97316;
        border: 2px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 14px;
      ">🏪</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const buyerIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 32px; height: 32px;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 14px;
      ">🏠</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const markerKios = L.marker([latKios, lngKios], { icon: kiosIcon })
      .addTo(map)
      .bindPopup(`<strong style="color: #F97316;">Kios: ${detail.items?.[0]?.namaKios || 'Penjual'}</strong><br/>Titik Pengiriman`);

    const markerBuyer = L.marker([latPenerima, lngPenerima], { icon: buyerIcon })
      .addTo(map)
      .bindPopup(`<strong style="color: #3B82F6;">Anda: ${detail.namaPenerima || 'Pembeli'}</strong><br/>${detail.alamat || 'Alamat Tujuan'}`);

    const pathCoords = [
      [latKios, lngKios],
      [latPenerima, lngPenerima]
    ];
    L.polyline(pathCoords, {
      color: '#F97316',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
    }).addTo(map);

    // Courier indicator based on status
    if (detail.status === 'dikirim') {
      const midLat = (latKios + latPenerima) / 2;
      const midLng = (lngKios + lngPenerima) / 2;

      const courierIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 10px rgba(16,185,129,0.6);
          font-size: 14px;
        ">🚚</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([midLat, midLng], { icon: courierIcon })
        .addTo(map)
        .bindPopup(`<strong>Kurir PetPlace</strong><br/>Sedang dalam perjalanan`);
    } else if (detail.status === 'selesai') {
      const finishedIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: #10B981;
          border: 2px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 10px rgba(16,185,129,0.6);
          font-size: 14px;
        ">✅</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([latPenerima, lngPenerima], { icon: finishedIcon })
        .addTo(map)
        .bindPopup(`<strong>Sampai!</strong><br/>Pesanan telah diterima`);
    }

    const group = new L.featureGroup([markerKios, markerBuyer]);
    map.fitBounds(group.getBounds().pad(0.15));

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showMap, mapReady, detail]);

  return (
    <div className="overlay" style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className="card-glass" style={{
        width: '100%', maxWidth: 560, padding: '2rem',
        border: '1px solid var(--border)', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideIn 0.3s ease', boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🚀 Lacak Pesanan</h3>
            <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>
              #{pesanan.kode}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {pesanan.createdAt ? new Date(pesanan.createdAt).toLocaleString('id-ID') : '-'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Cancelled state */}
        {isCancelled ? (
          <div style={{
            textAlign: 'center', padding: '2.5rem 1rem',
            background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
            <h4 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Pesanan Dibatalkan</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Pesanan ini telah dibatalkan. Silakan hubungi penjual jika ada pertanyaan.
            </p>
          </div>
        ) : (
          /* Tracking Steps */
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 19, top: 0, bottom: 0,
              width: 2, background: 'var(--border)', zIndex: 0,
            }} />
            {/* Active line */}
            <div style={{
              position: 'absolute', left: 19, top: 0,
              width: 2,
              height: `${Math.min((currentStep / (TRACKING_STEPS.length - 1)) * 100, 100)}%`,
              background: 'linear-gradient(to bottom, var(--primary), #F59E0B)',
              zIndex: 1, transition: 'height 0.6s ease',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {TRACKING_STEPS.map((step, idx) => {
                const isDone    = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isPending = idx > currentStep;
                const Icon      = step.icon;

                return (
                  <div key={step.key} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', paddingBottom: idx < TRACKING_STEPS.length - 1 ? '1.75rem' : 0, position: 'relative', zIndex: 2 }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? 'var(--primary)' : isCurrent ? 'var(--primary)' : 'var(--bg-secondary)',
                      border: `2px solid ${isDone || isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(249,115,22,0.2)' : 'none',
                      transition: 'all 0.4s ease',
                    }}>
                      {isDone ? (
                        <CheckCircle size={18} style={{ color: 'white' }} />
                      ) : (
                        <Icon size={18} style={{ color: isCurrent ? 'white' : 'var(--text-muted)' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                      <div style={{
                        fontWeight: 700, fontSize: '0.9rem',
                        color: isDone || isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                      }}>
                        {step.label}
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700,
                            background: 'var(--primary)', color: 'white',
                            padding: '0.1rem 0.5rem', borderRadius: 99,
                            animation: 'pulse 2s infinite',
                          }}>SEKARANG</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.78rem', marginTop: '0.2rem',
                        color: isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                        opacity: isPending ? 0.5 : 1,
                      }}>
                        {step.desc}
                      </div>
                      {/* No resi if dikirim */}
                      {step.key === 'dikirim' && isCurrent && pesanan.noResi && (
                        <div style={{
                          marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                          borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', fontSize: '0.78rem',
                        }}>
                          <Truck size={13} style={{ color: 'var(--primary)' }} />
                          <span>No. Resi: <strong style={{ color: 'var(--primary)' }}>{pesanan.noResi}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Container */}
        {showMap && (() => {
          const hasKiosCoords = detail && parseFloat(detail.items?.[0]?.latKios) && parseFloat(detail.items?.[0]?.lngKios);
          const hasBuyerCoords = detail && parseFloat(detail.latPenerima) && parseFloat(detail.lngPenerima);
          const hasCoords = hasKiosCoords || hasBuyerCoords;
          return (
            <div style={{ marginTop: '1.75rem' }}>
              <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                📍 Peta Pelacakan Real-time
              </h4>
              {detail && !hasCoords ? (
                <div style={{
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '12px', padding: '1.5rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#F59E0B' }}>
                    Peta belum tersedia
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 280, margin: '0 auto' }}>
                    Pemilik kios belum mendaftarkan lokasi toko mereka. Silakan hubungi penjual untuk informasi pengiriman lebih lanjut.
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <div ref={mapRef} style={{ height: '220px', width: '100%', background: 'var(--bg-secondary)', zIndex: 1 }} />
                  {!detail && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', color: 'white', fontSize: '0.8rem', zIndex: 10,
                    }}>
                      ⏳ Memuat data peta pelacakan...
                    </div>
                  )}
                  {detail && !hasKiosCoords && (
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8, right: 8,
                      background: 'rgba(245,158,11,0.9)', color: 'white',
                      borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.72rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 10,
                    }}>
                      ⚠️ Lokasi kios belum terdaftar — peta menampilkan perkiraan lokasi
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}



        {/* Ringkasan */}
        <div style={{ marginTop: '1.75rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Total Bayar</span>
            <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{formatRupiah(pesanan.totalBayar)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Status</span>
            <span className={`badge ${STATUS_COLOR[pesanan.status]?.badge || 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>
              {STATUS_LABELS[pesanan.status] || pesanan.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          {pesanan.status === 'menunggu_pembayaran' && (
            <Link to={`/payment/${pesanan.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
              💳 Bayar Sekarang
            </Link>
          )}
          {['diproses', 'dikirim'].includes(pesanan.status) && (
            <button onClick={() => { onSelesai(pesanan.id); onClose(); }} className="btn btn-green btn-sm" style={{ flex: 1 }}>
              ✅ Selesaikan Pembelian
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AkunPesanan() {
  const { user } = useAuth();
  const [pesanan, setPesanan]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedPesanan, setSelected] = useState(null);
  const [filterStatus, setFilter]     = useState('semua');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await pesananAPI.list();
      setPesanan(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleSelesai = async (id) => {
    if (!window.confirm("Konfirmasi bahwa Anda telah menerima pesanan dan ingin menyelesaikan proses pembelian?")) return;
    try {
      await pesananAPI.updateStatus(id, 'selesai');
      alert("✅ Pesanan telah diselesaikan. Terima kasih atas pembelian Anda!");
      await loadData();
    } catch (err) {
      alert(err.message || "Gagal menyelesaikan pesanan");
    }
  };

  const getSidebarLinks = () => {
    const list = [
      { href: '/akun',          icon: '🏠', label: 'Dashboard' },
      { href: '/akun/pesanan',  icon: '📦', label: 'Pesanan Saya' },
      { href: '/akun/chat',     icon: '💬', label: 'Chat' },
      { href: '/akun/hewan',    icon: '🐾', label: 'Hewan Saya' },
    ];
    if (user?.peran !== 'owner')    list.push({ href: '/akun/daftar-kios',     icon: '🏪', label: 'Buka Kios' });
    if (user?.peran !== 'dokter')   list.push({ href: '/akun/daftar-dokter',   icon: '🏥', label: 'Daftar Dokter' });
    if (user?.peran !== 'grooming') list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: 'Daftar Grooming' });
    return list;
  };

  // Active orders (not done/cancelled)
  const activeOrders  = pesanan.filter(p => !['selesai', 'dibatalkan'].includes(p.status));
  const finishedOrders = pesanan.filter(p => ['selesai', 'dibatalkan'].includes(p.status));

  const filtered = filterStatus === 'semua' ? pesanan
    : filterStatus === 'aktif' ? activeOrders
    : finishedOrders;

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>📦 Pesanan Saya</h2>
            {activeOrders.length > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                🔴 {activeOrders.length} pesanan sedang berjalan
              </div>
            )}
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { key: 'semua', label: `Semua (${pesanan.length})` },
            { key: 'aktif', label: `Aktif (${activeOrders.length})` },
            { key: 'selesai', label: `Selesai (${finishedOrders.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`btn btn-sm ${filterStatus === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>⏳ Memuat pesanan...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <Package size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Belum ada pesanan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Mulai belanja produk hewan kesayangan Anda!</p>
            <Link to="/produk" className="btn btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filtered.map(p => {
              const step       = STATUS_STEP[p.status] ?? 0;
              const isCancelled = p.status === 'dibatalkan';
              const isDone      = p.status === 'selesai';
              const isActive    = !isCancelled && !isDone;
              const statusCfg   = STATUS_COLOR[p.status] || { badge: 'badge-gray', text: 'var(--text-muted)' };

              return (
                <div key={p.id} className="card" style={{
                  padding: '1.25rem',
                  border: isActive ? '1px solid rgba(249,115,22,0.2)' : '1px solid var(--border)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Active glow accent */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: 'linear-gradient(90deg, var(--primary), #F59E0B)',
                    }} />
                  )}

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.95rem' }}>
                        #{p.kode}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('id-ID') : '-'}
                      </div>
                    </div>
                    <span className={`badge ${statusCfg.badge}`} style={{ fontSize: '0.72rem' }}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>

                  {/* Mini tracking stepper — only for non-cancelled */}
                  {!isCancelled && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {TRACKING_STEPS.map((s, idx) => {
                          const done    = idx < step;
                          const current = idx === step;
                          const pending = idx > step;
                          const Icon    = s.icon;
                          return (
                            <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                              {/* Connector line */}
                              {idx < TRACKING_STEPS.length - 1 && (
                                <div style={{
                                  position: 'absolute', left: '50%', top: 14, width: '100%', height: 2,
                                  background: done ? 'var(--primary)' : 'var(--border)',
                                  zIndex: 0, transition: 'background 0.4s',
                                }} />
                              )}
                              {/* Circle */}
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%', zIndex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done || current ? 'var(--primary)' : 'var(--bg-secondary)',
                                border: `2px solid ${done || current ? 'var(--primary)' : 'var(--border)'}`,
                                boxShadow: current ? '0 0 0 3px rgba(249,115,22,0.25)' : 'none',
                                transition: 'all 0.4s',
                              }}>
                                {done ? (
                                  <CheckCircle size={13} style={{ color: 'white' }} />
                                ) : (
                                  <Icon size={13} style={{ color: current ? 'white' : 'var(--text-muted)' }} />
                                )}
                              </div>
                              {/* Label */}
                              <div style={{
                                fontSize: '0.6rem', marginTop: '0.3rem', fontWeight: current ? 700 : 500,
                                color: done || current ? 'var(--text-primary)' : 'var(--text-muted)',
                                textAlign: 'center', lineHeight: 1.2,
                              }}>
                                {s.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancelled notice */}
                  {isCancelled && (
                    <div style={{
                      marginBottom: '1rem', padding: '0.6rem 0.875rem',
                      background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem', color: '#EF4444', fontWeight: 600,
                    }}>
                      ❌ Pesanan ini telah dibatalkan
                    </div>
                  )}

                  {/* Diproses notice — pembayaran diterima */}
                  {p.status === 'diproses' && (
                    <div style={{
                      marginBottom: '1rem', padding: '0.6rem 0.875rem',
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem', color: '#10B981', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      ✅ Pembayaran dikonfirmasi! Penjual sedang mempersiapkan pesanan Anda.
                    </div>
                  )}

                  {/* Bottom row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Total: <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{formatRupiah(p.totalBayar)}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setSelected(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Truck size={12} /> Lacak
                      </button>
                      {['diproses', 'dikirim'].includes(p.status) && (
                        <button onClick={() => handleSelesai(p.id)}
                          className="btn btn-green btn-sm"
                          style={{ fontSize: '0.75rem' }}>
                          ✅ Selesaikan Pembelian
                        </button>
                      )}
                      {p.status === 'menunggu_pembayaran' && (
                        <Link to={`/payment/${p.id}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
                          💳 Bayar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {selectedPesanan && (
        <TrackingModal pesanan={selectedPesanan} onClose={() => setSelected(null)} onSelesai={handleSelesai} />
      )}
    </div>
  );
}
