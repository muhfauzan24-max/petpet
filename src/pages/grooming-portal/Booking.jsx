import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../services/api";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { groomingAPI } from "../../services/api";

export default function GroomingBooking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const idGrooming = user?.grooming?.id;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    if (!idGrooming) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await groomingAPI.getBooking();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [idGrooming]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    if (!idGrooming) return;
    const interval = setInterval(() => {
      groomingAPI.getBooking().then(data => setBookings(data || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [idGrooming]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await groomingAPI.updateStatusBooking(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast('success', `Booking berhasil diubah ke: ${status}`);
    } catch (err) {
      showToast('error', err.message || 'Gagal mengubah status booking');
    }
  };

  const getSidebarLinks = () => {
    const pending = bookings.filter(b => b.status === "menunggu").length;
    const list = [
      { href:"/portal-grooming", icon:"🏠", label:"Dashboard" },
      { href:"/portal-grooming/booking", icon:"📋", label:"Booking", badge: pending || undefined },
      { href:"/portal-grooming/chat", icon:"💬", label:"Chat Klien" },
    ];
    if (user?.peran === 'owner') {
      list.push({ href: "/kios", icon: "🏪", label: "Dashboard Kios" });
    } else {
      list.push({ href: "/akun/daftar-kios", icon: "🏪", label: "Buka Kios" });
    }
    if (user?.hasDokter || user?.peran === 'dokter') {
      list.push({ href: "/portal-dokter", icon: "🏥", label: "Portal Dokter" });
    } else {
      list.push({ href: "/akun/daftar-dokter", icon: "🏥", label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    list.push({ href: "/akun", icon: "👤", label: "Profil Saya" });
    return list;
  };

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      {toast && (
        <div style={{
          position:"fixed", top:90, right:24, zIndex:9999,
          background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
          color:"#fff", borderRadius:"var(--radius-lg)", padding:"0.9rem 1.5rem",
          fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)",
        }}>
          {toast.msg}
        </div>
      )}
      <DashboardSidebar links={getSidebarLinks()} title="Portal Grooming" color="var(--accent)" />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>📋 Kelola Booking</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {!idGrooming ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>✂️</div>
            <h3>Akun Grooming Tidak Aktif</h3>
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat booking...</div>
        ) : bookings.length === 0 ? (
          <div className="card" style={{ padding:"4rem", textAlign:"center", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📅</div>
            <h3>Belum ada booking</h3>
            <p style={{ marginTop:"0.5rem" }}>Booking dari pelanggan akan muncul di sini secara real-time.</p>
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="card" style={{ padding:"1.25rem", marginBottom:"0.875rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                <div>
                  <div style={{ fontWeight:700 }}>
                    {b.jenisHewan === "kucing" ? "🐱" : "🐶"} {b.namaHewan}
                    <span style={{ fontWeight:400, color:"var(--text-muted)", fontSize:"0.85rem" }}> — milik {b.namaPelanggan || b.pembeli}</span>
                  </div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>📅 {b.tanggal} pukul {b.jam}</div>
                </div>
                <span className={`badge ${b.status === "selesai" ? "badge-green" : b.status === "dikonfirmasi" ? "badge-blue" : "badge-orange"}`}>
                  {b.status}
                </span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                <span style={{ fontSize:"0.85rem", color:"var(--text-secondary)" }}>
                  Layanan: {b.namaLayanan || b.layanan}
                </span>
                <span style={{ fontWeight:700, color:"var(--primary)" }}>{formatRupiah(b.hargaLayanan || b.harga)}</span>
              </div>
              {b.catatan && <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:"0.75rem" }}>Catatan: {b.catatan}</p>}
              {b.status === "menunggu" && (
                <button onClick={() => handleUpdateStatus(b.id, "dikonfirmasi")} className="btn btn-green btn-sm">
                  <CheckCircle size={13}/> Konfirmasi
                </button>
              )}
              {b.status === "dikonfirmasi" && (
                <button onClick={() => handleUpdateStatus(b.id, "selesai")} className="btn btn-primary btn-sm">
                  Tandai Selesai
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
