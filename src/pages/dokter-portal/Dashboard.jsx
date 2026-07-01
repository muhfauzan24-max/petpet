import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { dokterAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Calendar, Users, DollarSign } from "lucide-react";

const links = [
  { href: "/portal-dokter", icon: "🏠", label: "Dashboard" },
  { href: "/portal-dokter/jadwal", icon: "📅", label: "Jadwal" },
  { href: "/portal-dokter/janji", icon: "📋", label: "Janji Temu" },
  { href: "/akun", icon: "👤", label: "Profil" },
];

export default function DokterPortalDashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [janji, setJanji]   = useState([]);
  const [loading, setLoading] = useState(true);
  const idDokter = user?.dokter?.id;

  const loadData = async () => {
    if (!idDokter) { setLoading(false); return; }
    setLoading(true);
    try {
      const [statsData, janjiData] = await Promise.all([
        dokterAPI.stats(idDokter),
        dokterAPI.janji(idDokter),
      ]);
      setStats(statsData);
      setJanji(janjiData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [idDokter]);

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Portal Dokter" color="var(--dog-blue)" />
      <div style={{ flex:1 }}>
        <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"var(--radius-xl)", padding:"1.75rem", marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2>🏥 Portal Dokter</h2>
            <p style={{ color:"var(--text-muted)", marginTop:"0.25rem" }}>
              Selamat datang, {user?.nama} — {user?.dokter?.spesialisasi || 'Dokter Hewan'}
            </p>
          </div>
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
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data...</div>
        ) : (
          <>
            <div className="grid-3" style={{ marginBottom:"2rem" }}>
              {[
                { label:"Janji Hari Ini", value: stats?.janjiHariIni || 0, icon:<Calendar size={20}/>, color:"var(--dog-blue)" },
                { label:"Total Pasien", value: stats?.totalPasien || 0, icon:<Users size={20}/>, color:"var(--primary)" },
                { label:"Pendapatan Bulan Ini", value: formatRupiah(stats?.pendapatanBulan || 0), icon:<DollarSign size={20}/>, color:"var(--accent)" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ color:s.color, marginBottom:"0.5rem", display:"flex", justifyContent:"center" }}>{s.icon}</div>
                  <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.5rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom:"1rem" }}>📋 Janji Temu Terbaru</h3>
            {janji.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"0.75rem" }}>📋</div>
                <p>Belum ada janji temu</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {janji.slice(0, 5).map(j => (
                  <div key={j.id} className="card" style={{ padding:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{j.namaPasien}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
                        🐾 {j.namaHewan} ({j.jenisHewan}) • 📅 {j.tanggal} {j.jam}
                      </div>
                      {j.keluhan && <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginTop:"0.25rem" }}>Keluhan: {j.keluhan}</div>}
                    </div>
                    <span className={`badge ${j.status === 'selesai' ? 'badge-green' : j.status === 'dikonfirmasi' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize:"0.7rem" }}>
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
