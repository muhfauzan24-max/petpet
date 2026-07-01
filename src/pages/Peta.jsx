import { useEffect, useRef, useState } from 'react';
import { lokasiAPI } from '../services/api';

const TIPE_CONFIG = {
  kios:     { warna: '#F97316', emoji: '🏪', label: 'Kios' },
  dokter:   { warna: '#3B82F6', emoji: '🏥', label: 'Dokter' },
  grooming: { warna: '#10B981', emoji: '✂️', label: 'Grooming' },
};

export default function Peta() {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markersRef  = useRef([]);
  const [filter, setFilter]       = useState('semua');
  const [ipInfo, setIpInfo]       = useState(null);
  const [lokasiData, setLokasiData] = useState([]);

  // Fetch IP geolocation
  useEffect(() => {
    fetch('https://ip-api.com/json/')
      .then(r => r.json())
      .then(data => setIpInfo(data))
      .catch(() => null);
  }, []);

  // Fetch real location data from API
  useEffect(() => {
    lokasiAPI.all()
      .then(data => setLokasiData(data || []))
      .catch(() => {});
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (mapInstance.current) return;

    const L = window.L;
    if (!L) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const Lf = window.L;
      const map = Lf.map(mapRef.current, {
        center: [-5.1477, 119.4327], // Makassar
        zoom: 12,
        zoomControl: true,
      });

      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when data or filter changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !window.L) return;

    const Lf = window.L;

    // Remove existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = filter === 'semua' ? lokasiData : lokasiData.filter(l => l.tipe === filter);

    filtered.forEach(loc => {
      if (!loc.lat || !loc.lng) return;
      const cfg = TIPE_CONFIG[loc.tipe];
      if (!cfg) return;

      const icon = Lf.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;
          background:${cfg.warna};
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
          font-size:14px;
        "><span style="transform:rotate(45deg)">${cfg.emoji}</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = Lf.marker([parseFloat(loc.lat), parseFloat(loc.lng)], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Plus Jakarta Sans,sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.25rem;">${cfg.emoji} ${loc.nama}</div>
            <div style="font-size:0.75rem;color:#999;margin-bottom:0.5rem;">${loc.alamat || ''}</div>
            <div style="font-size:0.75rem;color:#888;margin-bottom:0.5rem;">${loc.kota || ''} ${loc.rating ? '• ⭐ ' + loc.rating : ''}</div>
            <span style="background:${cfg.warna}22;color:${cfg.warna};padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:700;">${cfg.label}</span>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [lokasiData, filter]);

  return (
    <div style={{ padding: '2rem 0 4rem', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="section-label">Temukan Mitra</div>
          <h1>Peta <span className="gradient-text">PetPlace</span></h1>
          <p style={{ maxWidth: 500, margin: '0.75rem auto 0' }}>
            Temukan kios, dokter hewan, dan groomer terdekat dari lokasi Anda di Sulawesi Selatan.
          </p>
        </div>

        {/* IP Location info */}
        {ipInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>📍</span>
            <span style={{ fontSize: '0.85rem' }}>
              Terdeteksi dari IP <strong style={{ color: 'var(--primary)' }}>{ipInfo.query}</strong> — 
              Lokasi Anda: <strong>{ipInfo.city}, {ipInfo.regionName}</strong>
            </span>
          </div>
        )}

        {/* Legend / Filter */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {Object.entries(TIPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(filter === key ? 'semua' : key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: filter === key || filter === 'semua' ? `${cfg.warna}20` : 'var(--bg-card)',
                border: `2px solid ${filter === key ? cfg.warna : 'var(--border)'}`,
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                color: filter === key ? cfg.warna : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: cfg.warna }} />
              {cfg.emoji} {cfg.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <div ref={mapRef} style={{
          height: 520,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-card)',
        }} />

      </div>
    </div>
  );
}
