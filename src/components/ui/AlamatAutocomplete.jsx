import { useState, useRef, useEffect, useCallback } from 'react';
import { cariAlamat } from '../../data/daftarAlamat';
import { MapPin, Search, Loader, Navigation2 } from 'lucide-react';

/**
 * AlamatAutocomplete
 * Input alamat dengan:
 *  - Dropdown suggestion dari daftar lokal (daftarAlamat.js)
 *  - Geocoding otomatis via Nominatim (OpenStreetMap) saat alamat dipilih/dicari
 *  - Tombol "Cari di Peta" untuk geocode manual
 *
 * Props:
 *  - value: string
 *  - onChange(newValue: string)
 *  - onGeocode({ lat, lng, displayName }) — dipanggil saat geocoding berhasil
 *  - kota: string (opsional, untuk filter saran & geocode yang lebih presisi)
 *  - placeholder: string
 *  - style: object
 */
export default function AlamatAutocomplete({
  value,
  onChange,
  onGeocode,
  kota,
  placeholder = 'Ketik nama jalan atau daerah...',
  style,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [active, setActive] = useState(-1);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState(null); // { type: 'success'|'error', text }
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const geocodeTimer = useRef(null);

  // Update suggestions saat nilai berubah
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    const results = cariAlamat(value, kota);
    setSuggestions(results);
    setShowDrop(results.length > 0);
    setActive(-1);
  }, [value, kota]);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Fungsi geocoding menggunakan Nominatim OpenStreetMap ──────────────────────
  const geocodeAddress = useCallback(async (alamat) => {
    if (!alamat || alamat.length < 4) return;
    setGeocoding(true);
    setGeocodeMsg(null);
    try {
      const q = kota ? `${alamat}, ${kota}, Indonesia` : `${alamat}, Indonesia`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=id&accept-language=id`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'id' },
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const result = { lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name };
        onGeocode?.(result);
        setGeocodeMsg({ type: 'success', text: `✅ Ditemukan: ${display_name.split(',').slice(0, 2).join(',')}` });
      } else {
        setGeocodeMsg({ type: 'error', text: '⚠️ Alamat tidak ditemukan di peta. Coba tambahkan nama kota atau klik peta secara manual.' });
      }
    } catch (err) {
      setGeocodeMsg({ type: 'error', text: '⚠️ Gagal geocoding: cek koneksi internet.' });
    }
    setGeocoding(false);
  }, [kota, onGeocode]);

  // Pilih dari dropdown → update text + geocode otomatis
  const handleSelect = (item) => {
    const fullAddr = kota && !item.label.toLowerCase().includes(kota.toLowerCase())
      ? `${item.label}, ${kota}`
      : item.label;
    onChange(fullAddr);
    setSuggestions([]);
    setShowDrop(false);
    setActive(-1);
    // Geocode otomatis saat pilih dari dropdown
    if (onGeocode) {
      clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(() => geocodeAddress(fullAddr), 300);
    }
  };

  const handleKeyDown = (e) => {
    if (showDrop) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        handleSelect(suggestions[active]);
        return;
      } else if (e.key === 'Escape') {
        setShowDrop(false);
      }
    }
    // Enter tanpa dropdown → geocode teks yang ada
    if (e.key === 'Enter' && !showDrop && onGeocode) {
      e.preventDefault();
      geocodeAddress(value);
    }
  };

  const handleSearchClick = () => {
    setShowDrop(false);
    geocodeAddress(value);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      {/* ── Input row ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: geocoding ? 'var(--primary)' : 'var(--text-muted)', pointerEvents: 'none',
            transition: 'color 0.2s',
          }} />
          <input
            ref={inputRef}
            value={value}
            onChange={e => { onChange(e.target.value); setGeocodeMsg(null); }}
            onKeyDown={handleKeyDown}
            onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowDrop(true)}
            className="form-input"
            placeholder={placeholder}
            style={{
              paddingLeft: '2.2rem',
              border: geocodeMsg?.type === 'success'
                ? '1.5px solid rgba(16,185,129,0.5)'
                : geocodeMsg?.type === 'error'
                  ? '1.5px solid rgba(245,158,11,0.5)'
                  : undefined,
              transition: 'border-color 0.2s',
            }}
            autoComplete="off"
          />
        </div>

        {/* Tombol Cari di Peta */}
        {onGeocode && (
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={geocoding || !value || value.length < 3}
            title="Cari alamat di peta"
            style={{
              padding: '0 0.9rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: geocoding || !value ? 'not-allowed' : 'pointer',
              opacity: !value || value.length < 3 ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.78rem', fontWeight: 600,
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {geocoding
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Navigation2 size={14} />
            }
            {geocoding ? 'Mencari...' : 'Cari di Peta'}
          </button>
        )}
      </div>

      {/* ── Dropdown saran lokal ──────────────────────────────────────────────── */}
      {showDrop && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-card, #1e1e1e)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          maxHeight: 220,
          overflowY: 'auto',
        }}>
          <div style={{
            padding: '0.4rem 0.75rem',
            fontSize: '0.67rem', color: 'var(--text-muted)',
            fontWeight: 700, letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border)',
            textTransform: 'uppercase',
          }}>
            📋 {suggestions.length} daerah terdaftar — pilih untuk langsung ke peta
          </div>

          {suggestions.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setActive(idx)}
              style={{
                padding: '0.55rem 0.75rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: idx === active ? 'rgba(249,115,22,0.1)' : 'transparent',
                borderLeft: idx === active ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.12s ease',
                fontSize: '0.82rem',
              }}
            >
              <MapPin size={12} style={{ color: idx === active ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: idx === active ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: idx === active ? 600 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {item.kota}
                </div>
              </div>
              {idx === active && (
                <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700 }}>
                  ⏎ ke peta
                </span>
              )}
            </div>
          ))}

          <div style={{
            padding: '0.38rem 0.75rem',
            fontSize: '0.68rem', color: 'var(--text-muted)',
            borderTop: '1px solid var(--border)', fontStyle: 'italic',
          }}>
            ✏️ Tidak ada yang cocok? Ketik lalu tekan "Cari di Peta"
          </div>
        </div>
      )}

      {/* ── Pesan geocoding ───────────────────────────────────────────────────── */}
      {geocodeMsg && (
        <div style={{
          marginTop: '0.4rem',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.72rem',
          background: geocodeMsg.type === 'success'
            ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${geocodeMsg.type === 'success'
            ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
          color: geocodeMsg.type === 'success' ? '#10B981' : '#F59E0B',
          lineHeight: 1.4,
        }}>
          {geocodeMsg.text}
        </div>
      )}
    </div>
  );
}
