import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { groomingAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Scissors, Calendar, DollarSign } from "lucide-react";

const links = [
  { href: "/portal-grooming", icon: "🏠", label: "Dashboard" },
  { href: "/portal-grooming/booking", icon: "📅", label: "Booking" },
  { href: "/akun", icon: "👤", label: "Profil" },
];

export default function GroomingPortalDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]  = useState(true);
  const idGrooming = user?.grooming?.id;

  const loadData = async () => {
    if (!idGrooming) { setLoading(false); return; }
    setLoading(true);
    try {
      const [statsData, bookData] = await Promise.all([
        groomingAPI.stats(idGrooming),
        groomingAPI.bookings(idGrooming),
      ]);
      setStats(statsData);
      setBookings(bookData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [idGrooming]);

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Portal Grooming" color="var(--accent)" />
      <div style={{ flex:1 }}>
        <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(139,92,246,0.1))", border:"1px solid rgba(16,185,129,0.2)", borderRadius:"var(--radius-xl)", padding:"1.75rem", marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2>✂️ Portal Grooming</h2>
            <p style={{ color:"var(--text-muted)", marginTop:"0.25rem" }}>
              Selamat datang, {user?.nama} — {user?.grooming?.nama || 'Salon Grooming'}
            </p>
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {!idGrooming ? (
          <div style={{ textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
            <Scissors size={64} style={{ opacity:0.3, marginBottom:"1rem" }} />
            <h3>Akun Grooming Tidak Aktif</h3>
            <p>Hubungi admin jika ada masalah.</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data...</div>
        ) : (
          <>
            <div className="grid-3" style={{ marginBottom:"2rem" }}>
              {[
                { label:"Booking Hari Ini", value: stats?.bookingHariIni || 0, icon:<Calendar size={20}/>, color:"var(--accent)" },
                { label:"Total Pelanggan", value: stats?.totalPelanggan || 0, icon:<Scissors size={20}/>, color:"var(--primary)" },
                { label:"Pendapatan Bulan Ini", value: formatRupiah(stats?.pendapatanBulan || 0), icon:<DollarSign size={20}/>, color:"var(--secondary)" },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ color:s.color, marginBottom:"0.5rem", display:"flex", justifyContent:"center" }}>{s.icon}</div>
                  <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.5rem", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom:"1rem" }}>📅 Booking Terbaru</h3>
            {bookings.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"0.75rem" }}>📅</div>
                <p>Belum ada booking yang masuk</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="card" style={{ padding:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{b.namaPelanggan}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
                        ✂️ {b.namaLayanan} • 📅 {b.tanggal} {b.jam}
                      </div>
                      {b.namaHewan && <div style={{ fontSize:"0.8rem", color:"var(--text-secondary)", marginTop:"0.25rem" }}>Hewan: {b.namaHewan} ({b.jenisHewan})</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, color:"var(--primary)" }}>{formatRupiah(b.hargaLayanan)}</div>
                      <span className={`badge ${b.status === 'selesai' ? 'badge-green' : b.status === 'dikonfirmasi' ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize:"0.7rem", marginTop:"0.35rem" }}>
                        {b.status}
                      </span>
                    </div>
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
