import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { adminAPI } from "../../services/api";
import { RefreshCw, TrendingUp, BarChart2 } from "lucide-react";

const links = [
  { href:"/admin", icon:"🏠", label:"Dashboard" },
  { href:"/admin/pengguna", icon:"👥", label:"Pengguna" },
  { href:"/admin/kios", icon:"🏪", label:"Kelola Kios" },
  { href:"/admin/komisi", icon:"💰", label:"Komisi" },
  { href:"/admin/laporan", icon:"📊", label:"Laporan" },
];

export default function AdminLaporan() {
  const [laporan, setLaporan]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [chartType, setChartType] = useState("pendapatan");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.laporan();
      setLaporan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const monthly = laporan?.monthly || [];
  const maxVal = monthly.length > 0
    ? Math.max(...monthly.map(d => chartType === "pendapatan" ? parseFloat(d.pendapatan) : parseFloat(d.pendapatan) * 0.1))
    : 1;

  const formatBulan = (str) => {
    if (!str) return '-';
    const [y, m] = str.split('-');
    const bln = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${bln[parseInt(m)-1]} '${y.slice(2)}`;
  };

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Admin Panel" color="var(--secondary)" />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>📊 Laporan Platform</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat laporan...</div>
        ) : !laporan || monthly.length === 0 ? (
          <div className="card" style={{ padding:"4rem", textAlign:"center" }}>
            <BarChart2 size={64} style={{ color:"var(--text-muted)", opacity:0.3, marginBottom:"1rem" }} />
            <h3>Belum Ada Data Transaksi</h3>
            <p style={{ color:"var(--text-muted)", marginTop:"0.5rem" }}>
              Data laporan akan muncul setelah ada pesanan yang berhasil diproses.
            </p>
          </div>
        ) : (
          <>
            {/* Monthly Chart */}
            <div className="card" style={{ padding:"1.5rem", marginBottom:"2rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
                <h3>📈 Tren {chartType === "pendapatan" ? "Pendapatan" : "Komisi"} Bulanan</h3>
                <div style={{ display:"flex", gap:"0.35rem", background:"var(--bg-secondary)", padding:"0.25rem", borderRadius:"var(--radius-md)" }}>
                  <button onClick={() => setChartType("pendapatan")} className="btn btn-sm"
                    style={{ padding:"0.3rem 0.6rem", fontSize:"0.7rem", background: chartType==="pendapatan"?"var(--primary)":"transparent", color: chartType==="pendapatan"?"white":"var(--text-muted)" }}>
                    Pendapatan
                  </button>
                  <button onClick={() => setChartType("komisi")} className="btn btn-sm"
                    style={{ padding:"0.3rem 0.6rem", fontSize:"0.7rem", background: chartType==="komisi"?"var(--secondary)":"transparent", color: chartType==="komisi"?"white":"var(--text-muted)" }}>
                    Komisi (10%)
                  </button>
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"flex-end", gap:"0.75rem", height:200, borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem", marginTop:"1rem" }}>
                {monthly.map(d => {
                  const val = chartType === "pendapatan" ? parseFloat(d.pendapatan) : parseFloat(d.pendapatan) * 0.1;
                  const pctH = maxVal > 0 ? (val / maxVal) * 160 : 4;
                  return (
                    <div key={d.bulan} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"0.35rem", position:"relative" }}>
                      <div style={{ fontSize:"0.65rem", color:chartType==="pendapatan"?"var(--primary)":"var(--secondary)", fontWeight:700, position:"absolute", bottom:`${pctH+8}px`, textAlign:"center", width:"120%", whiteSpace:"nowrap" }}>
                        {formatRupiah(val).replace(',00','').replace('Rp','Rp ')}
                      </div>
                      <div style={{ width:"100%", height:`${Math.max(pctH,4)}px`, background:chartType==="pendapatan"?"linear-gradient(to top,var(--primary),#FCD34D)":"linear-gradient(to top,var(--secondary),#A78BFA)", borderRadius:"4px 4px 0 0", transition:"height 0.4s ease-out", marginTop:"auto" }} />
                      <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontWeight:600 }}>{formatBulan(d.bulan)}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1rem", fontSize:"0.8rem", padding:"0.75rem", background:"rgba(255,255,255,0.01)", borderRadius:"var(--radius-md)" }}>
                <div>
                  <span style={{ color:"var(--text-muted)" }}>Total Pendapatan:</span>{' '}
                  <strong style={{ color:"var(--primary)" }}>{formatRupiah(monthly.reduce((s,d) => s + parseFloat(d.pendapatan||0), 0))}</strong>
                </div>
                <div>
                  <span style={{ color:"var(--text-muted)" }}>Total Komisi (10%):</span>{' '}
                  <strong style={{ color:"var(--secondary)" }}>{formatRupiah(monthly.reduce((s,d) => s + parseFloat(d.pendapatan||0) * 0.1, 0))}</strong>
                </div>
              </div>
            </div>

            <div className="grid-2">
              {/* Sebaran Mitra */}
              <div className="card" style={{ padding:"1.5rem" }}>
                <h3 style={{ marginBottom:"1rem" }}>🏪 Sebaran Mitra</h3>
                {(laporan.topKios || []).slice(0,5).map((k,i) => (
                  <div key={k.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", width:16 }}>#{i+1}</span>
                      <span style={{ fontSize:"0.875rem", color:"var(--text-secondary)" }}>{k.namaKios}</span>
                    </div>
                    <span style={{ fontWeight:700, color:"var(--primary)", fontSize:"0.85rem" }}>{formatRupiah(k.totalPenjualan)}</span>
                  </div>
                ))}
                {(laporan.topKios || []).length === 0 && (
                  <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"1.5rem", fontSize:"0.85rem" }}>Belum ada data kios</div>
                )}
              </div>

              {/* Kategori Produk */}
              <div className="card" style={{ padding:"1.5rem" }}>
                <h3 style={{ marginBottom:"1rem" }}>📦 Kategori Produk Terjual</h3>
                {(laporan.katBreakdown || []).slice(0,5).map((k,i) => {
                  const total = (laporan.katBreakdown||[]).reduce((s,c) => s + parseInt(c.totalTerjual||0), 0);
                  const pct = total > 0 ? Math.round((parseInt(k.totalTerjual||0) / total) * 100) : 0;
                  const colors = ['var(--primary)','var(--dog-blue)','var(--secondary)','var(--accent)','#F59E0B'];
                  return (
                    <div key={k.nama} style={{ marginBottom:"0.75rem" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", marginBottom:"0.3rem" }}>
                        <span style={{ color:"var(--text-secondary)" }}>{k.nama}</span>
                        <span style={{ fontWeight:700, color:colors[i%5] }}>{pct}% ({k.totalTerjual} terjual)</span>
                      </div>
                      <div style={{ height:6, background:"var(--bg-secondary)", borderRadius:"var(--radius-full)" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:colors[i%5], borderRadius:"var(--radius-full)", transition:"width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })}
                {(laporan.katBreakdown || []).length === 0 && (
                  <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"1.5rem", fontSize:"0.85rem" }}>Belum ada data kategori</div>
                )}
              </div>
            </div>

            {/* Top Produk */}
            {(laporan.topProduk || []).length > 0 && (
              <div className="card" style={{ padding:"1.5rem", marginTop:"1.5rem" }}>
                <h3 style={{ marginBottom:"1rem" }}>🔥 Produk Terlaris</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  {laporan.topProduk.slice(0,5).map((p,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.6rem 0.75rem", background:"var(--bg-secondary)", borderRadius:"var(--radius-md)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                        <span style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.1rem", color:"var(--primary)", width:24, textAlign:"center" }}>#{i+1}</span>
                        <div>
                          <div style={{ fontWeight:600, fontSize:"0.875rem" }}>{p.nama}</div>
                          <div style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{p.namaKios}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:700, color:"var(--primary)", fontSize:"0.85rem" }}>🔥 {p.terjual} terjual</div>
                        <div style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>⭐ {p.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
