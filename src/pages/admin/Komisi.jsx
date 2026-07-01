import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { adminAPI } from "../../services/api";
import { RefreshCw, TrendingUp } from "lucide-react";

const links = [
  { href:"/admin", icon:"🏠", label:"Dashboard" },
  { href:"/admin/pengguna", icon:"👥", label:"Pengguna" },
  { href:"/admin/kios", icon:"🏪", label:"Kelola Kios" },
  { href:"/admin/komisi", icon:"💰", label:"Komisi" },
  { href:"/admin/laporan", icon:"📊", label:"Laporan" },
];

export default function AdminKomisi() {
  const [data, setData]     = useState({ komisi: [], totalLunas: 0, totalPending: 0, totalKeseluruhan: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await adminAPI.komisi();
      setData(result || { komisi: [], totalLunas: 0, totalPending: 0, totalKeseluruhan: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Admin Panel" color="var(--secondary)" />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>💰 Laporan Komisi Platform (10%)</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid-3" style={{ marginBottom:"2rem" }}>
          {[
            { label:"Total Komisi Keseluruhan", value: formatRupiah(data.totalKeseluruhan), icon:"💰", color:"var(--primary)" },
            { label:"Komisi Terkonfirmasi", value: formatRupiah(data.totalLunas), icon:"✅", color:"var(--accent)" },
            { label:"Komisi Pending", value: formatRupiah(data.totalPending), icon:"⏳", color:"#F59E0B" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:"1.5rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.75rem", marginBottom:"0.5rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.25rem", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data komisi...</div>
        ) : data.komisi.length === 0 ? (
          <div className="card" style={{ padding:"4rem", textAlign:"center" }}>
            <TrendingUp size={48} style={{ color:"var(--text-muted)", marginBottom:"1rem", opacity:0.4 }} />
            <h3>Belum Ada Data Komisi</h3>
            <p style={{ color:"var(--text-muted)", marginTop:"0.5rem" }}>
              Komisi akan muncul setelah ada pesanan yang berhasil diverifikasi.
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
                  {["Kode Pesanan","Kios","Tipe","Total Transaksi","Komisi (10%)","Status","Tanggal"].map(h => (
                    <th key={h} style={{ padding:"0.875rem 1rem", textAlign:"left", fontSize:"0.78rem", fontWeight:700, color:"var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.komisi.map(k => (
                  <tr key={k.id} style={{ borderBottom:"1px solid var(--border)", transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--bg-secondary)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.875rem 1rem", fontFamily:"monospace", fontSize:"0.82rem", color:"var(--primary)" }}>
                      {k.kodePesanan || '-'}
                    </td>
                    <td style={{ padding:"0.875rem 1rem", fontWeight:600, fontSize:"0.875rem" }}>{k.namaKios || '-'}</td>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <span className="badge badge-gray" style={{ fontSize:"0.7rem" }}>{k.tipe}</span>
                    </td>
                    <td style={{ padding:"0.875rem 1rem", color:"var(--text-secondary)", fontSize:"0.875rem" }}>{formatRupiah(k.totalTransaksi)}</td>
                    <td style={{ padding:"0.875rem 1rem", fontWeight:700, color:"var(--primary)" }}>{formatRupiah(k.jumlah)}</td>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <span className={`badge ${k.status==="lunas"?"badge-green":"badge-orange"}`} style={{ fontSize:"0.7rem" }}>{k.status}</span>
                    </td>
                    <td style={{ padding:"0.875rem 1rem", fontSize:"0.8rem", color:"var(--text-muted)" }}>
                      {k.createdAt ? new Date(k.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:"0.75rem 1rem", background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", fontSize:"0.78rem", color:"var(--text-muted)" }}>
              <span>Total {data.komisi.length} transaksi komisi</span>
              <span>Komisi keseluruhan: <strong style={{ color:"var(--primary)" }}>{formatRupiah(data.totalKeseluruhan)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
