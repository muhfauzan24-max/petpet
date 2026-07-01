import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { pesananAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotifikasiContext = createContext(null);

// Status yang dianggap sebagai "update penting" untuk dinotifkan
const STATUS_NOTIF_LABELS = {
  diproses:   { icon: '⚙️', pesan: 'Pembayaran dikonfirmasi! Pesanan sedang diproses.', warna: '#3B82F6' },
  dikirim:    { icon: '🚚', pesan: 'Pesanan Anda sedang dalam perjalanan!',             warna: '#8B5CF6' },
  selesai:    { icon: '✅', pesan: 'Pesanan Anda telah selesai. Terima kasih!',         warna: '#10B981' },
  dibatalkan: { icon: '❌', pesan: 'Pesanan Anda dibatalkan oleh penjual.',             warna: '#EF4444' },
};

export function NotifikasiProvider({ children }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const prevStatusMap  = useRef({});   // status saat polling aktif
  const intervalRef    = useRef(null);
  const initialized    = useRef(false);

  // ── Simpan & load riwayat notifikasi ──────────────────────────────────────────
  const notifKey    = user ? `petplace_notif_${user.id}`       : null;
  const prevStatKey = user ? `petplace_prevstat_${user.id}`    : null;

  // Load notifikasi tersimpan dari localStorage (persistent antar sesi)
  useEffect(() => {
    if (!user || !notifKey) return;
    initialized.current = false;
    const saved = localStorage.getItem(notifKey);
    if (saved) {
      try { setNotifs(JSON.parse(saved)); } catch(e) {}
    }
  }, [user]);

  // Simpan notifikasi ke localStorage setiap kali berubah
  useEffect(() => {
    if (!user || !notifKey) return;
    localStorage.setItem(notifKey, JSON.stringify(notifs.slice(0, 50)));
  }, [notifs, user]);

  // ── Inisialisasi: bandingkan status SEKARANG vs status SESI LALU ──────────────
  const initStatus = useCallback(async () => {
    if (!user || user.peran === 'owner' || user.peran === 'admin') return;
    if (initialized.current) return;
    initialized.current = true;

    try {
      const data = await pesananAPI.list();
      if (!Array.isArray(data)) return;

      // Ambil status sesi lalu dari localStorage
      let prevSaved = {};
      try { prevSaved = JSON.parse(localStorage.getItem(prevStatKey) || '{}'); } catch(e) {}

      const newNotifs = [];
      const currentMap = {};

      data.forEach(p => {
        const savedStatus   = prevSaved[p.id];   // status terakhir saat sesi sebelumnya
        const currentStatus = p.status;

        // Kalau ada perubahan dari sesi sebelumnya → buat notifikasi
        if (savedStatus && savedStatus !== currentStatus && STATUS_NOTIF_LABELS[currentStatus]) {
          const cfg = STATUS_NOTIF_LABELS[currentStatus];
          // Hindari duplikat yang sudah tersimpan di notifs
          const dupKey = `${p.id}-${currentStatus}`;
          newNotifs.push({
            id:        `${dupKey}-${Date.now()}`,
            pesananId: p.id,
            kode:      p.kode,
            status:    currentStatus,
            pesan:     cfg.pesan,
            icon:      cfg.icon,
            warna:     cfg.warna,
            dibaca:    false,
            createdAt: new Date().toISOString(),
            showToast: true,
          });
        }

        prevStatusMap.current[p.id] = currentStatus;
        currentMap[p.id] = currentStatus;
      });

      // Simpan status terkini sebagai referensi sesi berikutnya
      localStorage.setItem(prevStatKey, JSON.stringify(currentMap));

      if (newNotifs.length > 0) {
        setNotifs(prev => {
          // Hapus duplikat (jangan tambahkan notif yang kodenya sama dan statusnya sama)
          const existing = new Set(prev.map(n => `${n.pesananId}-${n.status}`));
          const filtered = newNotifs.filter(n => !existing.has(`${n.pesananId}-${n.status}`));
          return [...filtered, ...prev];
        });
      }
    } catch(e) {
      console.error('initStatus error:', e);
    }
  }, [user, prevStatKey]);

  // ── Poll setiap 30 detik untuk perubahan real-time saat sedang online ─────────
  const pollPesanan = useCallback(async () => {
    if (!user || user.peran === 'owner' || user.peran === 'admin') return;
    try {
      const data = await pesananAPI.list();
      if (!Array.isArray(data)) return;

      const newNotifs = [];
      const currentMap = {};

      data.forEach(p => {
        const prevStatus = prevStatusMap.current[p.id];
        const currStatus = p.status;

        if (prevStatus !== undefined && prevStatus !== currStatus && STATUS_NOTIF_LABELS[currStatus]) {
          const cfg = STATUS_NOTIF_LABELS[currStatus];
          newNotifs.push({
            id:        `${p.id}-${currStatus}-${Date.now()}`,
            pesananId: p.id,
            kode:      p.kode,
            status:    currStatus,
            pesan:     cfg.pesan,
            icon:      cfg.icon,
            warna:     cfg.warna,
            dibaca:    false,
            createdAt: new Date().toISOString(),
            showToast: true,
          });
        }
        prevStatusMap.current[p.id] = currStatus;
        currentMap[p.id] = currStatus;
      });

      // Update referensi sesi berikutnya
      if (prevStatKey) localStorage.setItem(prevStatKey, JSON.stringify(currentMap));

      if (newNotifs.length > 0) {
        setNotifs(prev => [...newNotifs, ...prev]);
      }
    } catch(e) {
      // Abaikan error polling secara silent
    }
  }, [user, prevStatKey]);

  // ── Setup polling ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      clearInterval(intervalRef.current);
      prevStatusMap.current = {};
      initialized.current = false;
      return;
    }
    initStatus();
    intervalRef.current = setInterval(pollPesanan, 30000);
    return () => clearInterval(intervalRef.current);
  }, [user]);  // eslint-disable-line

  const tandaiBaca      = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, dibaca: true, showToast: false } : n));
  const tandaiSemuaBaca = ()   => setNotifs(prev => prev.map(n => ({ ...n, dibaca: true, showToast: false })));
  const hapusNotif      = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  const dismissToast    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, showToast: false } : n));

  const belumDibaca = notifs.filter(n => !n.dibaca).length;
  const toastNotifs = notifs.filter(n => n.showToast);

  return (
    <NotifikasiContext.Provider value={{
      notifs, belumDibaca, toastNotifs,
      tandaiBaca, tandaiSemuaBaca, hapusNotif, dismissToast,
    }}>
      {children}
    </NotifikasiContext.Provider>
  );
}

export const useNotifikasi = () => {
  const ctx = useContext(NotifikasiContext);
  if (!ctx) throw new Error('useNotifikasi must be within NotifikasiProvider');
  return ctx;
};
