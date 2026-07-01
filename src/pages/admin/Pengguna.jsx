import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";
import { adminAPI } from "../../services/api";

const links = [
  { href:"/admin", icon:"🏠", label:"Dashboard" },
  { href:"/admin/pengguna", icon:"👥", label:"Pengguna" },
  { href:"/admin/kios", icon:"🏪", label:"Kelola Kios" },
  { href:"/admin/komisi", icon:"💰", label:"Komisi" },
  { href:"/admin/laporan", icon:"📊", label:"Laporan" },
];

const PERAN_BADGE = { pembeli:"badge-gray", owner:"badge-orange", dokter:"badge-blue", grooming:"badge-green", admin:"badge-purple" };

export default function AdminPengguna() {
  const [search, setSearch]     = useState("");
  const [pengguna, setPengguna] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("semua");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== "semua") params.peran = filter;
      if (search) params.q = search;
      const data = await adminAPI.pengguna(params);
      setPengguna(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`${status === 'aktif' ? 'Aktifkan' : 'Nonaktifkan'} akun ini?`)) return;
    try {
      await adminAPI.updatePengguna(id, { status });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = pengguna.filter(p =>
    p.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Admin Panel" color="var(--secondary)" />
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>👥 Manajemen Pengguna</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter & Search */}
        <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          <form onSubmit={handleSearch} style={{ display:"flex", gap:"0.5rem", flex:1, minWidth:200 }}>
            <div style={{ position:"relative", flex:1 }}>
              <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="form-input" style={{ paddingLeft:"2rem" }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Cari</button>
          </form>
          <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap" }}>
            {["semua","pembeli","owner","dokter","grooming"].map(r => (
              <button key={r} onClick={() => setFilter(r)} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform:"capitalize", fontSize:"0.75rem" }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data pengguna...</div>
        ) : (
          <div className="card" style={{ overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
                  {["Pengguna","Email","Peran","Status","Bergabung","Aksi"].map(h => (
                    <th key={h} style={{ padding:"0.875rem 1rem", textAlign:"left", fontSize:"0.78rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.05em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding:"3rem", textAlign:"center", color:"var(--text-muted)" }}>
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom:"1px solid var(--border)", transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--bg-secondary)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                        <img src={p.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`} alt="" style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg-card)" }} />
                        <span style={{ fontWeight:600, fontSize:"0.875rem" }}>{p.nama}</span>
                      </div>
                    </td>
                    <td style={{ padding:"0.875rem 1rem", fontSize:"0.85rem", color:"var(--text-muted)" }}>{p.email}</td>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <span className={`badge ${PERAN_BADGE[p.peran]||"badge-gray"}`} style={{ fontSize:"0.7rem" }}>{p.peran}</span>
                    </td>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <span className={`badge ${p.status==="aktif"?"badge-green":p.status==="nonaktif"?"badge-red":"badge-orange"}`} style={{ fontSize:"0.7rem" }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding:"0.875rem 1rem", fontSize:"0.8rem", color:"var(--text-muted)" }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td style={{ padding:"0.875rem 1rem" }}>
                      <div style={{ display:"flex", gap:"0.35rem" }}>
                        {p.status !== "aktif" ? (
                          <button onClick={() => handleUpdateStatus(p.id, 'aktif')} className="btn btn-green btn-sm" style={{ padding:"0.25rem 0.5rem", fontSize:"0.7rem", display:"flex", alignItems:"center", gap:"0.2rem" }}>
                            <CheckCircle size={12} /> Aktifkan
                          </button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(p.id, 'nonaktif')} className="btn btn-danger btn-sm" style={{ padding:"0.25rem 0.5rem", fontSize:"0.7rem", display:"flex", alignItems:"center", gap:"0.2rem" }}>
                            <XCircle size={12} /> Nonaktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:"0.75rem 1rem", background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", fontSize:"0.78rem", color:"var(--text-muted)" }}>
              Total: {filtered.length} pengguna
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
