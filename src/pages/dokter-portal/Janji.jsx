import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dokterAPI } from "../../services/api";

export default function DokterJanji() {
  const { user } = useAuth();
  const [janji, setJanji] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const idDokter = user?.dokter?.id;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    if (!idDokter) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await dokterAPI.getJanji();
      setJanji(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [idDokter]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    if (!idDokter) return;
    const interval = setInterval(() => {
      dokterAPI.getJanji().then(data => setJanji(data || [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [idDokter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await dokterAPI.updateStatusJanji(id, status);
      setJanji(prev => prev.map(j => j.id === id ? { ...j, status } : j));
      showToast('success', `Janji berhasil diubah ke: ${status}`);
    } catch (err) {
      showToast('error', err.message || 'Gagal mengubah status janji');
    }
  };

  const getSidebarLinks = () => {
    const pending = janji.filter(j => j.status === "menunggu").length;
    const list = [
      { href:"/portal-dokter", icon:"🏠", label:"Dashboard" },
      { href:"/portal-dokter/jadwal", icon:"📅", label:"Jadwal Saya" },
      { href:"/portal-dokter/janji", icon:"📋", label:"Janji Temu", badge: pending || undefined },
      { href:"/portal-dokter/chat", icon:"💬", label:"Chat Pasien" },
    ];
    if (user?.peran === 'owner') {
      list.push({ href: "/kios", icon: "🏪", label: "Dashboard Kios" });
    } else {
      list.push({ href: "/akun/daftar-kios", icon: "🏪", label: "Buka Kios" });
    }
    if (user?.hasGrooming || user?.peran === 'grooming') {
      list.push({ href: "/portal-grooming", icon: "✂️", label: "Portal Grooming" });
    } else {
      list.push({ href: "/akun/daftar-grooming", icon: "✂️", label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
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
      <DashboardSidebar links={getSidebarLinks()} title="Portal Dokter" color="var(--dog-blue)" />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>📋 Manajemen Janji Temu</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {!idDokter ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🏥</div>
            <h3>Akun Dokter Tidak Aktif</h3>
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat janji temu...</div>
        ) : janji.length === 0 ? (
          <div className="card" style={{ padding:"4rem", textAlign:"center", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📋</div>
            <h3>Belum ada janji temu</h3>
            <p style={{ marginTop:"0.5rem" }}>Janji temu dari pasien akan muncul di sini secara real-time.</p>
          </div>
        ) : (
          janji.map(j => (
            <div key={j.id} className="card" style={{ padding:"1.25rem", marginBottom:"0.875rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                <div>
                  <div style={{ fontWeight:700 }}>
                    {j.jenisHewan === "kucing" ? "🐱" : "🐶"} {j.namaHewan}
                    <span style={{ fontWeight:400, color:"var(--text-muted)", fontSize:"0.85rem" }}> — milik {j.namaPasien || j.pembeli}</span>
                  </div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>📅 {j.tanggal} pukul {j.jam}</div>
                </div>
                <span className={`badge ${j.status === "selesai" ? "badge-green" : j.status === "dikonfirmasi" ? "badge-blue" : j.status === "menunggu" ? "badge-orange" : "badge-gray"}`}>
                  {j.status}
                </span>
              </div>
              {j.keluhan && <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.875rem" }}>Keluhan: {j.keluhan}</p>}
              {j.status === "menunggu" && (
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button onClick={() => handleUpdateStatus(j.id, "dikonfirmasi")} className="btn btn-green btn-sm">
                    <CheckCircle size={13}/> Konfirmasi
                  </button>
                  <button onClick={() => handleUpdateStatus(j.id, "dibatalkan")} className="btn btn-danger btn-sm">
                    <XCircle size={13}/> Tolak
                  </button>
                </div>
              )}
              {j.status === "dikonfirmasi" && (
                <button onClick={() => handleUpdateStatus(j.id, "selesai")} className="btn btn-primary btn-sm">
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
