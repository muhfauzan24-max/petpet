import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { dokterAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw } from "lucide-react";

const HARI = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

export default function DokterJadwal() {
  const { user } = useAuth();
  const [jadwal, setJadwal] = useState([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const data = await dokterAPI.detail(idDokter);
      setJadwal(data?.jadwal || []);
      setReady(!!data?.statusReady);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [idDokter]);

  const handleToggleReady = async () => {
    setSaving(true);
    try {
      await dokterAPI.update(idDokter, { statusReady: !ready });
      setReady(r => !r);
      showToast("success", `Status berhasil diubah ke ${!ready ? 'Ready' : 'Tidak Ready'}`);
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status");
    } finally {
      setSaving(false);
    }
  };

  // Sidebar links
  const janji = [];
  const getSidebarLinks = () => {
    const list = [
      { href:"/portal-dokter", icon:"🏠", label:"Dashboard" },
      { href:"/portal-dokter/jadwal", icon:"📅", label:"Jadwal Saya" },
      { href:"/portal-dokter/janji", icon:"📋", label:"Janji Temu" },
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
          <h2>📅 Jadwal Praktik</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {!idDokter ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🏥</div>
            <h3>Akun Dokter Tidak Aktif</h3>
            <p>Hubungi admin jika ada masalah dengan akun dokter Anda.</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat jadwal...</div>
        ) : (
          <>
            <div className="card" style={{ padding:"1.5rem", marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
                <h3>Status Ketersediaan</h3>
                <label style={{ display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer" }}>
                  <span style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Tidak Ready</span>
                  <div
                    onClick={!saving ? handleToggleReady : undefined}
                    style={{
                      width:48, height:26,
                      background:ready?"var(--accent)":"var(--bg-secondary)",
                      border:"1px solid var(--border)", borderRadius:"var(--radius-full)",
                      position:"relative", cursor: saving ? "not-allowed" : "pointer",
                      transition:"var(--transition)", opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <div style={{ position:"absolute", top:3, left:ready?24:3, width:18, height:18, background:"white", borderRadius:"50%", transition:"left 0.25s ease", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
                  </div>
                  <span style={{ fontSize:"0.875rem", fontWeight:700, color:ready?"var(--accent)":"var(--text-muted)" }}>
                    {saving ? "Menyimpan..." : "Ready"}
                  </span>
                </label>
              </div>
              <div className={`alert ${ready?"alert-success":"alert-warning"}`}>
                {ready
                  ? "✅ Anda sedang READY melayani konsultasi. Pasien bisa membuat janji sekarang."
                  : "⏰ Anda sedang tidak ready. Pasien tidak dapat membuat janji baru saat ini."}
              </div>
            </div>

            <div className="card" style={{ padding:"1.5rem" }}>
              <h3 style={{ marginBottom:"1rem" }}>Jadwal Mingguan</h3>
              {jadwal.length === 0 ? (
                <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
                  <p>Belum ada jadwal praktik terdaftar.</p>
                  <p style={{ fontSize:"0.85rem", marginTop:"0.5rem" }}>Hubungi admin untuk mengatur jadwal Anda.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {HARI.map(hari => {
                    const j = jadwal.find(x => x.hari === hari);
                    return (
                      <div key={hari} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.875rem 1rem", background:j?"rgba(249,115,22,0.06)":"var(--bg-secondary)", border:`1px solid ${j?"rgba(249,115,22,0.2)":"var(--border)"}`, borderRadius:"var(--radius-md)" }}>
                        <span style={{ fontWeight:600, width:80 }}>{hari}</span>
                        <span style={{ color:j?"var(--primary)":"var(--text-muted)", fontWeight:j?700:400 }}>{j ? j.jam : "Libur"}</span>
                        <span className={`badge ${j?"badge-green":"badge-gray"}`} style={{ fontSize:"0.7rem" }}>{j?"Aktif":"Libur"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
