import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lokasiAPI } from '../../services/api';
import { MapPin } from 'lucide-react';

const TIPE_CONFIG = {
  kios:     { warna: '#F97316', emoji: '🏪', label: 'Kios' },
  dokter:   { warna: '#3B82F6', emoji: '🏥', label: 'Dokter' },
  grooming: { warna: '#10B981', emoji: '✂️', label: 'Grooming' },
};

export default function MiniMap() {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markersRef  = useRef([]);
  const [lokasiData, setLokasiData] = useState([]);
  const [filter, setFilter]         = useState('semua');
  const [hoveredLoc, setHoveredLoc] = useState(null);
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    lokasiAPI.all()
      .then(data => setLokasiData(data || []))
      .catch(() => {});
  }, []);

  // Load Leaflet if not already loaded
  useEffect(() => {
    if (window.L) { setReady(true); return; }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => setReady(true);
    document.head.appendChild(js);
  }, []);

  // Init map once Leaflet ready
  useEffect(() => {
    if (!ready || mapInstance.current || !mapRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [-5.1477, 119.4327],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [ready]);

  // Update markers when data/filter changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !window.L) return;
    const L = window.L;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = filter === 'semua' ? lokasiData : lokasiData.filter(l => l.tipe === filter);

    filtered.forEach(loc => {
      if (!loc.lat || !loc.lng) return;
      const cfg = TIPE_CONFIG[loc.tipe];
      if (!cfg) return;

      // Buat ikon: kios pakai logo kios, lainnya pakai emoji
      const logoUrl = loc.logo
        ? (loc.logo.startsWith('http') || loc.logo.startsWith('data:')
            ? loc.logo
            : `${window.location.protocol}//${window.location.hostname}${loc.logo}`)
        : null;

      const iconHtml = loc.tipe === 'kios' && logoUrl
        ? `<div style="
            width:42px;height:42px;
            background:white;
            border:3px solid ${cfg.warna};
            border-radius:50%;
            overflow:hidden;
            box-shadow:0 4px 14px rgba(0,0,0,0.4);
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;
          ">
            <img src="${logoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
              onerror="this.parentElement.innerHTML='<span style=font-size:18px>${cfg.emoji}</span>'"/>
          </div>`
        : `<div style="
            width:36px;height:36px;
            background:${cfg.warna};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(0,0,0,0.35);
            font-size:14px;cursor:pointer;
          "><span style="transform:rotate(45deg)">${cfg.emoji}</span></div>`;

      const icon = L.divIcon({
        className: '',
        html: iconHtml,
        iconSize:   loc.tipe === 'kios' && logoUrl ? [42, 42] : [36, 36],
        iconAnchor: loc.tipe === 'kios' && logoUrl ? [21, 21] : [18, 36],
        popupAnchor: [0, -38],
      });

      // Link produk kios — pakai id kios dari data
      const idKios = loc.tipe === 'kios' ? loc.id.replace('k', '') : null;
      const detailLink = loc.tipe === 'dokter'
        ? `/dokter/${loc.id.replace('d','')}`
        : loc.tipe === 'grooming'
        ? `/grooming/${loc.id.replace('g','')}`
        : `/produk?kios=${idKios}`;

      const popupHtml = `
        <div style="font-family:Plus Jakarta Sans,sans-serif;min-width:200px;padding:4px 0;">
          ${loc.tipe === 'kios' && logoUrl
            ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <img src="${logoUrl}" style="width:36px;height:36px;border-radius:50%;border:2px solid ${cfg.warna};object-fit:cover;flex-shrink:0;"
                  onerror="this.style.display='none'"/>
                <div>
                  <div style="font-weight:800;font-size:0.9rem;">${loc.nama}</div>
                  <span style="background:${cfg.warna}22;color:${cfg.warna};padding:1px 8px;border-radius:99px;font-size:0.65rem;font-weight:700;">${cfg.label}</span>
                </div>
              </div>`
            : `<div style="font-weight:800;font-size:0.9rem;margin-bottom:3px;">${cfg.emoji} ${loc.nama}</div>
               <span style="background:${cfg.warna}22;color:${cfg.warna};padding:2px 10px;border-radius:99px;font-size:0.68rem;font-weight:700;display:inline-block;margin-bottom:6px;">${cfg.label}</span>`
          }
          ${loc.alamat ? `<div style="font-size:0.72rem;color:#888;margin-bottom:3px;">📍 ${loc.alamat}</div>` : ''}
          ${loc.kota ? `<div style="font-size:0.7rem;color:#aaa;margin-bottom:6px;">🏙️ ${loc.kota}</div>` : ''}
          ${loc.rating ? `<div style="font-size:0.7rem;color:#F59E0B;margin-bottom:6px;">⭐ ${parseFloat(loc.rating).toFixed(1)}</div>` : ''}
          <a href="${detailLink}" style="display:inline-block;background:${cfg.warna};color:white;padding:5px 14px;border-radius:8px;font-size:0.72rem;font-weight:700;text-decoration:none;">
            ${loc.tipe === 'kios' ? '🛒 Lihat Produk' : loc.tipe === 'dokter' ? '📅 Buat Janji' : '✂️ Lihat Salon'} →
          </a>
        </div>
      `;

      const marker = L.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon })
        .addTo(map)
        .bindPopup(popupHtml, { maxWidth: 240 });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 1) {
      try {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 14 });
      } catch {}
    }
  }, [lokasiData, filter, ready]);

  const counts = {
    kios:     lokasiData.filter(l => l.tipe === 'kios').length,
    dokter:   lokasiData.filter(l => l.tipe === 'dokter').length,
    grooming: lokasiData.filter(l => l.tipe === 'grooming').length,
  };

  return (
    <section className="section" style={{ background: 'var(--bg-primary)', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label" style={{ textAlign: 'left' }}>📍 Temukan Mitra</div>
            <h2>Lokasi <span className="gradient-text">Mitra PetPlace</span></h2>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Kios, dokter hewan, dan groomer terdekat di Sulawesi Selatan
            </p>
          </div>
          <Link to="/peta" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} /> Lihat Peta Penuh
          </Link>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('semua')}
            style={{
              padding: '0.4rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700,
              background: filter === 'semua' ? 'var(--primary)' : 'var(--bg-card)',
              color: filter === 'semua' ? 'white' : 'var(--text-secondary)',
              border: `1.5px solid ${filter === 'semua' ? 'var(--primary)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
            🗺️ Semua ({lokasiData.length})
          </button>
          {Object.entries(TIPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(filter === key ? 'semua' : key)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700,
                background: filter === key ? `${cfg.warna}20` : 'var(--bg-card)',
                color: filter === key ? cfg.warna : 'var(--text-secondary)',
                border: `1.5px solid ${filter === key ? cfg.warna : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {cfg.emoji} {cfg.label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Map container */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div ref={mapRef} style={{ height: 400, width: '100%', background: 'var(--bg-card)' }} />

          {/* Overlay badge */}
          {lokasiData.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              flexDirection: 'column', gap: '0.75rem',
            }}>
              <div style={{ fontSize: '3rem' }}>🗺️</div>
              <p style={{ color: 'white', fontWeight: 600 }}>Belum ada mitra terdaftar</p>
              <Link to="/daftar" className="btn btn-primary btn-sm">Daftar Jadi Mitra</Link>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
          {Object.entries(TIPE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="card" style={{
              padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              cursor: 'pointer', border: filter === key ? `1.5px solid ${cfg.warna}` : '1px solid var(--border)',
              transition: 'all 0.2s',
            }} onClick={() => setFilter(filter === key ? 'semua' : key)}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${cfg.warna}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                {cfg.emoji}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: cfg.warna }}>{counts[key]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cfg.label} Terdaftar</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
