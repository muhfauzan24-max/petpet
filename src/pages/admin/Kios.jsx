import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { kiosAPI, adminAPI, getImageUrl } from "../../services/api";
import { CheckCircle, XCircle, Star, RefreshCw, X, AlertTriangle, Trash2, Package, Search, Eye } from "lucide-react";

const links = [
  { href:"/admin", icon:"🏠", label:"Dashboard" },
  { href:"/admin/pengguna", icon:"👥", label:"Pengguna" },
  { href:"/admin/kios", icon:"🏪", label:"Kelola Kios" },
  { href:"/admin/komisi", icon:"💰", label:"Komisi" },
  { href:"/admin/laporan", icon:"📊", label:"Laporan" },
];

const STATUS_BADGE = {
  aktif:    { label: "Aktif",    color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  nonaktif: { label: "Nonaktif", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  pending:  { label: "Pending",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
};

export default function AdminKios() {
  const [kiosList, setKiosList]         = useState([]);
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedKios, setSelectedKios] = useState(null);
  const [kiosDetail, setKiosDetail]     = useState(null);
  const [toast, setToast]               = useState(null);

  // Produk panel state
  const [showProdukPanel, setShowProdukPanel] = useState(false);
  const [produkKios, setProdukKios]           = useState([]);
  const [produkLoading, setProdukLoading]     = useState(false);
  const [produkSearch, setProdukSearch]       = useState("");
  const [produkFilter, setProdukFilter]       = useState("semua");
  const [deletingId, setDeletingId]           = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [kiosData, pendingData] = await Promise.all([
        kiosAPI.list(),
        adminAPI.pending(),
      ]);
      setKiosList(kiosData || []);
      setPending(pendingData?.pendingKios || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKiosDetail = async (id) => {
    try {
      const detail = await kiosAPI.detail(id);
      setKiosDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProdukKios = async (idKios) => {
    setProdukLoading(true);
    try {
      const data = await adminAPI.produkList({ idKios, limit: 100 });
      setProdukKios(data.produk || []);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat produk kios");
    } finally {
      setProdukLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const approve = async (id) => {
    try {
      await kiosAPI.approve(id);
      await loadData();
      showToast("success", "✅ Kios berhasil disetujui!");
    } catch (err) { showToast("error", err.message); }
  };

  const reject = async (id) => {
    if (!window.confirm("Tolak kios ini?")) return;
    try {
      await kiosAPI.reject(id);
      await loadData();
      showToast("success", "🗑️ Kios berhasil ditolak.");
    } catch (err) { showToast("error", err.message); }
  };

  const handleSelectKios = async (kios) => {
    setSelectedKios(kios);
    setKiosDetail(null);
    setShowProdukPanel(false);
    setProdukKios([]);
    setProdukSearch("");
    setProdukFilter("semua");
    await loadKiosDetail(kios.id);
  };

  const handleOpenProdukPanel = async () => {
    setShowProdukPanel(true);
    await loadProdukKios(selectedKios.id);
  };

  const handleDeleteProduk = async (produkId) => {
    if (!window.confirm("Hapus produk ini dari kios? Produk tidak akan muncul di halaman pembeli.")) return;
    setDeletingId(produkId);
    try {
      await adminAPI.produkDelete(produkId);
      setProdukKios(prev => prev.map(p => p.id === produkId ? { ...p, status: "nonaktif" } : p));
      showToast("success", "✅ Produk berhasil dinonaktifkan!");
      // refresh detail kios
      await loadKiosDetail(selectedKios.id);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAktifkanProduk = async (produkId) => {
    setDeletingId(produkId);
    try {
      await adminAPI.produkApprove(produkId);
      setProdukKios(prev => prev.map(p => p.id === produkId ? { ...p, status: "aktif" } : p));
      showToast("success", "✅ Produk berhasil diaktifkan!");
      await loadKiosDetail(selectedKios.id);
    } catch (err) {
      showToast("error", err.message || "Gagal mengaktifkan produk");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter produk berdasarkan search & status
  const filteredProduk = produkKios.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(produkSearch.toLowerCase());
    const matchFilter = produkFilter === "semua" || p.status === produkFilter;
    return matchSearch && matchFilter;
  });

  const produkStats = {
    total:    produkKios.length,
    aktif:    produkKios.filter(p => p.status === "aktif").length,
    nonaktif: produkKios.filter(p => p.status === "nonaktif").length,
    pending:  produkKios.filter(p => p.status === "pending").length,
  };

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={links} title="Admin Panel" color="var(--secondary)" />
      <div style={{ flex:1 }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position:"fixed", top:90, right:24, zIndex:9999,
            background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            color:"#fff", borderRadius:"var(--radius-lg)", padding:"0.9rem 1.5rem",
            fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)",
            display:"flex", alignItems:"center", gap:"0.5rem",
            animation:"slideIn 0.3s ease"
          }}>
            {toast.type === "success" ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
            {toast.msg}
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h2>🏪 Kelola Kios</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>⏳ Memuat data kios...</div>
        ) : (
          <>
            {/* Pending Kios */}
            {pending.length > 0 && (
              <>
                <h3 style={{ marginBottom:"1rem", color:"#F59E0B" }}>⏳ Kios Menunggu Verifikasi ({pending.length})</h3>
                {pending.map(k => (
                  <div key={k.id} className="card" style={{ padding:"1.25rem", marginBottom:"0.75rem", border:"1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                      <div>
                        <div style={{ fontWeight:700 }}>🏪 {k.namaKios}</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>Pemilik: {k.namaPengguna} • {k.email}</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>Bank: {k.namaBank} • Rek: {k.noRekening} a/n {k.namaPemilik}</div>
                      </div>
                      <div style={{ display:"flex", gap:"0.5rem" }}>
                        <button onClick={() => approve(k.id)} className="btn btn-green btn-sm">
                          <CheckCircle size={13}/> Approve
                        </button>
                        <button onClick={() => reject(k.id)} className="btn btn-danger btn-sm">
                          <XCircle size={13}/> Tolak
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
                      Daftar: {k.createdAt ? new Date(k.createdAt).toLocaleDateString("id-ID") : "-"}
                    </div>
                  </div>
                ))}
                <hr className="divider" />
              </>
            )}

            {/* Active Kios */}
            <h3 style={{ marginBottom:"1rem" }}>✅ Kios Aktif ({kiosList.length})</h3>
            {kiosList.length === 0 ? (
              <div style={{ textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🏪</div>
                <p>Belum ada kios yang aktif. Approve kios yang pending di atas.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {kiosList.map(k => (
                  <div key={k.id} className="card" style={{ padding:"1rem", display:"flex", gap:"1rem", alignItems:"center" }}>
                    <img
                      src={k.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${k.nama}`}
                      alt={k.nama}
                      style={{ width:44, height:44, borderRadius:"var(--radius-md)", objectFit:"cover", background:"var(--bg-secondary)" }}
                    />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{k.nama}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>
                        📍 {k.kota || "Makassar"} •
                        ⭐ {k.rating || "5.0"} •
                        📦 {k.totalProduk || 0} produk aktif
                      </div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize:"0.7rem" }}>✓ Aktif</span>
                    <button onClick={() => handleSelectKios(k)} className="btn btn-secondary btn-sm" style={{ fontSize:"0.75rem", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                      <Eye size={13}/> Detail
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedKios && (
        <div className="overlay" style={{ animation:"fadeIn 0.25s ease forwards" }}>
          <div className="card-glass" style={{
            width:"100%", maxWidth: showProdukPanel ? 760 : 600,
            padding:"2rem", border:"1px solid var(--border)", position:"relative",
            maxHeight:"90vh", overflowY:"auto",
            animation:"slideIn 0.3s ease forwards", boxShadow:"var(--shadow-lg)",
            transition:"max-width 0.3s ease"
          }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                <img
                  src={selectedKios.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedKios.nama}`}
                  alt={selectedKios.nama}
                  style={{ width:52, height:52, borderRadius:"var(--radius-md)", objectFit:"cover", background:"var(--bg-secondary)" }}
                />
                <div>
                  <h3 style={{ fontSize:"1.1rem" }}>🏪 {selectedKios.nama}</h3>
                  <p style={{ fontSize:"0.8rem", color:"var(--text-muted)" }}>📍 {selectedKios.kota || "Makassar"} • ⭐ {selectedKios.rating || "5.0"}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedKios(null); setKiosDetail(null); setShowProdukPanel(false); setProdukKios([]); }}
                style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Tab Toggle */}
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.25rem" }}>
              <button
                onClick={() => setShowProdukPanel(false)}
                className={`btn btn-sm ${!showProdukPanel ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize:"0.8rem" }}
              >
                📋 Info Kios
              </button>
              <button
                onClick={handleOpenProdukPanel}
                className={`btn btn-sm ${showProdukPanel ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize:"0.8rem" }}
              >
                <Package size={13}/> Kelola Produk {produkKios.length > 0 ? `(${produkKios.length})` : ""}
              </button>
            </div>

            <hr className="divider" style={{ margin:"0 0 1.25rem 0" }} />

            {/* ── Info Kios ── */}
            {!showProdukPanel && (
              !kiosDetail ? (
                <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>⏳ Memuat detail kios...</div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", marginBottom:"1.5rem" }}>
                    {[
                      { label:"Telepon", value: kiosDetail.telepon || "-" },
                      { label:"Email", value: kiosDetail.email || "-" },
                      { label:"Jam Buka", value: `${kiosDetail.jamBuka || "-"} - ${kiosDetail.jamTutup || "-"}` },
                      { label:"Hari Operasi", value: kiosDetail.hariOperasi || "-" },
                      { label:"Bank", value: kiosDetail.namaBank || "-" },
                      { label:"No. Rekening", value: `${kiosDetail.noRekening || "-"} a/n ${kiosDetail.namaPemilikRek || "-"}` },
                    ].map(item => (
                      <div key={item.label} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", padding:"0.75rem" }}>
                        <div style={{ fontSize:"0.68rem", color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.label}</div>
                        <div style={{ fontSize:"0.85rem", fontWeight:600, marginTop:"0.2rem" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {kiosDetail.qris && (
                    <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", padding:"1rem", marginBottom:"1.5rem", textAlign:"center" }}>
                      <div style={{ fontSize:"0.68rem", color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", marginBottom:"0.5rem" }}>Foto QRIS</div>
                      <img src={kiosDetail.qris} alt="QRIS Kios" style={{ maxWidth:"200px", borderRadius:"var(--radius-md)", border:"1px solid var(--border)" }} />
                    </div>
                  )}

                  {/* Quick summary produk */}
                  <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", padding:"1rem" }}>
                    <div style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-secondary)", marginBottom:"0.6rem" }}>📦 Ringkasan Produk</div>
                    <div style={{ fontSize:"1.5rem", fontWeight:800, color:"var(--primary)" }}>{(kiosDetail.produk || []).length}</div>
                    <div style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>produk aktif</div>
                    <button onClick={handleOpenProdukPanel} className="btn btn-primary btn-sm" style={{ marginTop:"0.75rem", fontSize:"0.75rem" }}>
                      <Package size={13}/> Kelola & Moderasi Produk
                    </button>
                  </div>
                </>
              )
            )}

            {/* ── Panel Moderasi Produk ── */}
            {showProdukPanel && (
              <div>
                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"0.5rem", marginBottom:"1rem" }}>
                  {[
                    { label:"Total", val: produkStats.total, color:"var(--text-primary)" },
                    { label:"Aktif", val: produkStats.aktif, color:"#10B981" },
                    { label:"Nonaktif", val: produkStats.nonaktif, color:"#EF4444" },
                    { label:"Pending", val: produkStats.pending, color:"#F59E0B" },
                  ].map(s => (
                    <div key={s.label} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", padding:"0.6rem 0.75rem", textAlign:"center" }}>
                      <div style={{ fontSize:"1.25rem", fontWeight:800, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontWeight:600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Search & Filter */}
                <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
                  <div style={{ flex:1, position:"relative" }}>
                    <Search size={14} style={{ position:"absolute", left:"0.6rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }}/>
                    <input
                      value={produkSearch}
                      onChange={e => setProdukSearch(e.target.value)}
                      placeholder="Cari produk..."
                      className="form-input"
                      style={{ paddingLeft:"2rem", fontSize:"0.8rem", height:"2rem" }}
                    />
                  </div>
                  <select
                    value={produkFilter}
                    onChange={e => setProdukFilter(e.target.value)}
                    className="form-input"
                    style={{ width:120, fontSize:"0.8rem", height:"2rem" }}
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button onClick={() => loadProdukKios(selectedKios.id)} className="btn btn-secondary btn-sm" title="Refresh">
                    <RefreshCw size={13}/>
                  </button>
                </div>

                {/* List Produk */}
                {produkLoading ? (
                  <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>⏳ Memuat produk...</div>
                ) : filteredProduk.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
                    <Package size={32} style={{ marginBottom:"0.5rem", opacity:0.4 }}/>
                    <p>Tidak ada produk ditemukan</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", maxHeight:380, overflowY:"auto" }}>
                    {filteredProduk.map(p => {
                      const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
                      const isDeleting = deletingId === p.id;
                      return (
                        <div key={p.id} style={{
                          display:"flex", gap:"0.75rem", alignItems:"center",
                          padding:"0.65rem 0.75rem",
                          background: p.status === "nonaktif" ? "rgba(239,68,68,0.04)" : "var(--bg-secondary)",
                          borderRadius:"var(--radius-md)",
                          border: `1px solid ${p.status === "nonaktif" ? "rgba(239,68,68,0.15)" : "transparent"}`,
                          opacity: isDeleting ? 0.5 : 1,
                          transition:"opacity 0.2s"
                        }}>
                          {/* Foto */}
                          <img
                            src={getImageUrl(p.foto) || "https://placehold.co/40x40/1C1C1C/666?text=No+Foto"}
                            alt={p.nama}
                            style={{ width:40, height:40, borderRadius:6, objectFit:"cover", flexShrink:0 }}
                            onError={e => { e.target.src = "https://placehold.co/40x40/1C1C1C/666?text=No+Foto"; }}
                          />
                          {/* Info */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:"0.82rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nama}</div>
                            <div style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>
                              {formatRupiah(p.hargaDiskon || p.harga)} • Stok: {p.stok ?? "-"} • 🔥 {p.terjual} terjual
                            </div>
                          </div>
                          {/* Badge status */}
                          <span style={{
                            padding:"0.2rem 0.55rem", borderRadius:99, fontSize:"0.65rem", fontWeight:700,
                            color: badge.color, background: badge.bg, flexShrink:0
                          }}>
                            {badge.label}
                          </span>
                          {/* Actions */}
                          <div style={{ display:"flex", gap:"0.35rem", flexShrink:0 }}>
                            {p.status === "nonaktif" ? (
                              <button
                                onClick={() => handleAktifkanProduk(p.id)}
                                disabled={isDeleting}
                                className="btn btn-green btn-sm"
                                style={{ padding:"0.3rem 0.6rem", fontSize:"0.72rem" }}
                                title="Aktifkan kembali"
                              >
                                <CheckCircle size={12}/> Aktifkan
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteProduk(p.id)}
                                disabled={isDeleting}
                                className="btn btn-danger btn-sm"
                                style={{ padding:"0.3rem 0.55rem" }}
                                title="Nonaktifkan produk"
                              >
                                {isDeleting ? (
                                  <span style={{ width:12, height:12, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }}/>
                                ) : (
                                  <Trash2 size={12}/>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop:"0.75rem", fontSize:"0.72rem", color:"var(--text-muted)", textAlign:"center" }}>
                  Menampilkan {filteredProduk.length} dari {produkKios.length} produk
                </div>
              </div>
            )}

            <hr className="divider" style={{ margin:"1.5rem 0 1rem 0" }} />
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => { setSelectedKios(null); setKiosDetail(null); setShowProdukPanel(false); setProdukKios([]); }} className="btn btn-secondary btn-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
