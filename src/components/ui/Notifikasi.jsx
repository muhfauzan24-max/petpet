import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifikasi } from '../../context/NotifikasiContext';
import { X, Package } from 'lucide-react';

// ─── Toast Container yang muncul di pojok kanan bawah ──────────────────────────
export function NotifikasiToast() {
  const { toastNotifs, dismissToast, tandaiBaca } = useNotifikasi();

  if (toastNotifs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: '0.65rem',
      maxWidth: 380, width: '100%',
      pointerEvents: 'none',
    }}>
      {toastNotifs.slice(0, 3).map(notif => (
        <ToastItem
          key={notif.id}
          notif={notif}
          onDismiss={() => { dismissToast(notif.id); tandaiBaca(notif.id); }}
        />
      ))}
    </div>
  );
}

function ToastItem({ notif, onDismiss }) {
  // Auto-dismiss setelah 8 detik
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${notif.warna}40`,
      borderLeft: `4px solid ${notif.warna}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideInRight 0.35s ease',
      position: 'relative',
      display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
      pointerEvents: 'all',
    }}>
      {/* Icon */}
      <div style={{
        fontSize: '1.35rem', flexShrink: 0,
        width: 40, height: 40,
        background: `${notif.warna}18`,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {notif.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.83rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
          Update Pesanan
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.45rem', lineHeight: 1.45 }}>
          {notif.pesan}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: notif.warna, fontWeight: 700, marginBottom: '0.45rem' }}>
          #{notif.kode}
        </div>
        <Link
          to="/akun/pesanan"
          onClick={onDismiss}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.75rem', fontWeight: 700,
            color: notif.warna, textDecoration: 'none',
          }}>
          <Package size={11} /> Lihat Status Pesanan →
        </Link>
      </div>

      {/* Close */}
      <button onClick={onDismiss} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', padding: 3, flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
      }}>
        <X size={14} />
      </button>

      {/* Progress bar auto-dismiss */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        background: `linear-gradient(90deg, ${notif.warna}, ${notif.warna}60)`,
        animation: 'shrinkWidth 8s linear forwards',
      }} />
    </div>
  );
}

// ─── Bell Icon dengan badge notifikasi (untuk Navbar) ──────────────────────────
export function NotifikasiBell() {
  const { notifs, belumDibaca, tandaiBaca, tandaiSemuaBaca, hapusNotif } = useNotifikasi();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer',
          color: belumDibaca > 0 ? 'var(--primary)' : 'var(--text-secondary)',
          padding: '0.4rem', borderRadius: 'var(--radius-md)',
          transition: 'var(--transition)',
          fontSize: '1.2rem', lineHeight: 1,
        }}
        title="Notifikasi">
        🔔
        {belumDibaca > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: '#EF4444', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', fontWeight: 800,
            border: '2px solid var(--bg-primary, #0f0f0f)',
            animation: 'pulse 2s infinite',
          }}>
            {belumDibaca > 9 ? '9+' : belumDibaca}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />

          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 340, maxHeight: 460, overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            zIndex: 200, animation: 'fadeIn 0.15s ease',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                🔔 Notifikasi {belumDibaca > 0 && <span style={{ color: '#EF4444' }}>({belumDibaca})</span>}
              </div>
              {belumDibaca > 0 && (
                <button onClick={tandaiSemuaBaca} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--primary)', fontSize: '0.73rem', fontWeight: 600,
                }}>
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* List */}
            {notifs.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔔</div>
                Belum ada notifikasi
              </div>
            ) : (
              notifs.slice(0, 20).map(notif => (
                <div key={notif.id} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid var(--border)',
                  background: notif.dibaca ? 'transparent' : `${notif.warna}08`,
                  borderLeft: notif.dibaca ? '3px solid transparent' : `3px solid ${notif.warna}`,
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                }} onClick={() => tandaiBaca(notif.id)}>
                  <div style={{
                    fontSize: '1.1rem', flexShrink: 0,
                    width: 34, height: 34,
                    background: `${notif.warna}15`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: notif.dibaca ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {notif.pesan}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: notif.warna, fontWeight: 700, marginTop: '0.15rem' }}>
                      #{notif.kode}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {new Date(notif.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); hapusNotif(notif.id); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 2, flexShrink: 0,
                    opacity: 0.5,
                  }}>
                    <X size={12} />
                  </button>
                </div>
              ))
            )}

            {/* Footer */}
            {notifs.length > 0 && (
              <div style={{ padding: '0.75rem 1.25rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <Link to="/akun/pesanan" onClick={() => setOpen(false)} style={{
                  fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  Lihat semua pesanan →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
