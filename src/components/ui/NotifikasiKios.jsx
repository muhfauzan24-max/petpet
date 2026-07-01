/**
 * NotifikasiKios.jsx
 * Sistem notifikasi real-time untuk pemilik kios.
 * Polling setiap 20 detik untuk cek pesanan baru yang perlu diverifikasi.
 * Menampilkan floating alert di tengah layar saat ada bukti bayar masuk.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pesananAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, CheckCircle } from 'lucide-react';

// ─── Hook untuk polling pesanan kios ──────────────────────────────────────────
export function useNotifikasiKios() {
  const { user } = useAuth();
  const [newVerifikasi, setNewVerifikasi] = useState([]); // pesanan baru yg perlu diverifikasi
  const knownIdsRef   = useRef(null);  // null = belum init, Set setelah init
  const intervalRef   = useRef(null);
  const idKios        = user?.kios?.id;

  const checkBaru = useCallback(async () => {
    const isOwner = user?.peran === 'owner' || !!user?.kios;
    if (!isOwner) return;
    try {
      const data = await pesananAPI.kiosList({ status: 'verifikasi' });
      if (!Array.isArray(data)) return;

      if (knownIdsRef.current === null) {
        // Pertama kali mount: simpan IDs yg sudah ada tanpa notif
        knownIdsRef.current = new Set(data.map(p => p.id));
        return;
      }

      // Temukan pesanan baru (belum ada di knownIds)
      const baru = data.filter(p => !knownIdsRef.current.has(p.id));
      data.forEach(p => knownIdsRef.current.add(p.id));

      if (baru.length > 0) {
        setNewVerifikasi(prev => [...baru, ...prev]);
      }
    } catch(e) {}
  }, [user]);

  useEffect(() => {
    const isOwner = user?.peran === 'owner' || !!user?.kios;
    if (!isOwner) return;
    knownIdsRef.current = null;
    checkBaru();
    intervalRef.current = setInterval(checkBaru, 20000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  const dismiss = (id) => setNewVerifikasi(prev => prev.filter(p => p.id !== id));
  const dismissAll = () => setNewVerifikasi([]);

  return { newVerifikasi, dismiss, dismissAll };
}

// ─── Komponen floating alert untuk kios owner ─────────────────────────────────
export function NotifikasiKiosAlert() {
  const { newVerifikasi, dismiss, dismissAll } = useNotifikasiKios();
  const { user } = useAuth();

  // Hanya tampilkan untuk pemilik kios yang login
  const isKiosOwner = user?.peran === 'owner' || !!user?.kios;
  if (!isKiosOwner) return null;
  if (newVerifikasi.length === 0) return null;

  return (
    <>
      {/* Overlay semi-transparent untuk menarik perhatian */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.15)',
      }} />

      {/* Floating card — muncul di kanan atas (tidak blocking tapi sangat jelas) */}
      <div style={{
        position: 'fixed', top: 90, right: '1.5rem',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '0.65rem',
        maxWidth: 380, width: '100%',
        pointerEvents: 'all',
      }}>
        {/* Header if multiple */}
        {newVerifikasi.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.5rem 0.875rem',
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)',
          }}>
            <span>🔔 {newVerifikasi.length} bukti bayar menunggu verifikasi</span>
            <button onClick={dismissAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              Tutup semua ×
            </button>
          </div>
        )}

        {newVerifikasi.slice(0, 3).map(p => (
          <KiosAlertCard key={p.id} pesanan={p} onDismiss={() => dismiss(p.id)} />
        ))}
      </div>
    </>
  );
}

function KiosAlertCard({ pesanan, onDismiss }) {
  // Auto-dismiss setelah 15 detik
  useEffect(() => {
    const t = setTimeout(onDismiss, 15000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '2px solid rgba(249,115,22,0.5)',
      borderLeft: '5px solid var(--primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.1rem 1.25rem',
      boxShadow: '0 8px 40px rgba(249,115,22,0.25), 0 4px 20px rgba(0,0,0,0.5)',
      animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
    }}>
      {/* Pulse indicator */}
      <div style={{
        position: 'absolute', top: 12, right: 36,
        width: 10, height: 10, borderRadius: '50%',
        background: '#EF4444',
        boxShadow: '0 0 0 0 rgba(239,68,68,0.4)',
        animation: 'kiosPulse 1.5s infinite',
      }} />

      {/* Close */}
      <button onClick={onDismiss} style={{
        position: 'absolute', top: 10, right: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', padding: 3,
      }}>
        <X size={14} />
      </button>

      {/* Content */}
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0,
          background: 'rgba(249,115,22,0.12)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.35rem',
          border: '2px solid rgba(249,115,22,0.3)',
        }}>
          💳
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            💰 Bukti Bayar Masuk!
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.3rem' }}>
            <strong style={{ color: pesanan.namaPembeli ? 'var(--primary)' : 'var(--text-muted)' }}>
              {pesanan.namaPembeli || 'Pembeli'}
            </strong> sudah upload bukti transfer. Segera verifikasi!
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.6rem' }}>
            #{pesanan.kode}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/kios/pesanan"
              onClick={onDismiss}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1, justifyContent: 'center' }}>
              <CheckCircle size={13} /> Cek & Verifikasi →
            </Link>
            <button
              onClick={onDismiss}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}>
              Nanti
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar 15 detik */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        background: 'linear-gradient(90deg, var(--primary), #F59E0B)',
        animation: 'shrinkWidth 15s linear forwards',
      }} />

      <style>{`
        @keyframes kiosPulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}

// ─── Bell icon untuk sidebar kios (opsional, dipakai di Dashboard kios) ────────
export function KiosBellBadge({ count = 0 }) {
  if (count === 0) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#EF4444', color: 'white',
      borderRadius: '50%', minWidth: 20, height: 20,
      fontSize: '0.65rem', fontWeight: 800,
      marginLeft: '0.4rem',
      animation: 'pulse 2s infinite',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  );
}
