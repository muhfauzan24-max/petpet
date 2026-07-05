import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../services/api"; // import formatRupiah from services/api
import { kiosAPI, dokterAPI, groomingAPI, adminAPI, getImageUrl } from "../../services/api";
import { CheckCircle, XCircle, RefreshCw, X, AlertTriangle, Eye, User, Stethoscope, Scissors, Store, Shield } from "lucide-react";

const links = [
  { href: "/admin", icon: "🏠", label: "Dashboard" },
  { href: "/admin/pengguna", icon: "👥", label: "Pengguna" },
  { href: "/admin/kios", icon: "🏪", label: "Kelola Mitra" },
  { href: "/admin/komisi", icon: "💰", label: "Komisi" },
  { href: "/admin/laporan", icon: "📊", label: "Laporan" },
];

const STATUS_BADGE = {
  aktif:    { label: "Aktif",    color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  nonaktif: { label: "Nonaktif", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  pending:  { label: "Pending",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
};

export default function AdminKios() {
  const [activeTab, setActiveTab] = useState("kios"); // 'kios' | 'dokter' | 'grooming'
  
  // Lists
  const [kiosList, setKiosList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [groomingList, setGroomingList] = useState([]);
  
  // Pending lists
  const [pendingKios, setPendingKios] = useState([]);
  const [pendingDokter, setPendingDokter] = useState([]);
  const [pendingGrooming, setPendingGrooming] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Selected Detail Modals
  const [selectedKios, setSelectedKios] = useState(null);
  const [kiosDetail, setKiosDetail] = useState(null);
  const [showProdukPanel, setShowProdukPanel] = useState(false);
  const [produkKios, setProdukKios] = useState([]);
  const [produkLoading, setProdukLoading] = useState(false);
  const [produkSearch, setProdukSearch] = useState("");
  const [produkFilter, setProdukFilter] = useState("semua");
  const [deletingId, setDeletingId] = useState(null);

  const [selectedDokter, setSelectedDokter] = useState(null);
  const [dokterDetail, setDokterDetail] = useState(null);

  const [selectedGrooming, setSelectedGrooming] = useState(null);
  const [groomingDetail, setGroomingDetail] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [kiosData, dokterData, groomingData, pendingData] = await Promise.all([
        kiosAPI.list(),
        dokterAPI.list(),
        groomingAPI.list(),
        adminAPI.pending(),
      ]);
      setKiosList(kiosData || []);
      setDokterList(dokterData || []);
      setGroomingList(groomingData || []);
      
      setPendingKios(pendingData?.pendingKios || []);
      setPendingDokter(pendingData?.pendingDokter || []);
      setPendingGrooming(pendingData?.pendingGrooming || []);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Polling data pending setiap 15 detik
  useEffect(() => {
    const interval = setInterval(() => {
      adminAPI.pending().then(pendingData => {
        setPendingKios(pendingData?.pendingKios || []);
        setPendingDokter(pendingData?.pendingDokter || []);
        setPendingGrooming(pendingData?.pendingGrooming || []);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Approve Kios/Dokter/Grooming
  const approve = async (type, id) => {
    try {
      if (type === "kios") {
        await kiosAPI.approve(id);
        showToast("success", "✅ Kios berhasil disetujui!");
      } else if (type === "dokter") {
        await dokterAPI.approve(id);
        showToast("success", "✅ Akun Dokter berhasil disetujui!");
      } else if (type === "grooming") {
        await groomingAPI.approve(id);
        showToast("success", "✅ Akun Grooming berhasil disetujui!");
      }
      await loadData();
    } catch (err) {
      showToast("error", err.message || "Gagal menyetujui mitra");
    }
  };

  // Reject Kios/Dokter/Grooming
  const reject = async (type, id) => {
    if (!window.confirm(`Tolak pendaftaran ${type} ini?`)) return;
    try {
      if (type === "kios") {
        await kiosAPI.reject(id);
        showToast("success", "🗑️ Kios berhasil ditolak.");
      } else if (type === "dokter") {
        await dokterAPI.reject(id);
        showToast("success", "🗑️ Akun Dokter berhasil ditolak.");
      } else if (type === "grooming") {
        await groomingAPI.reject(id);
        showToast("success", "🗑️ Akun Grooming berhasil ditolak.");
      }
      await loadData();
    } catch (err) {
      showToast("error", err.message || "Gagal menolak mitra");
    }
  };

  // Kios Detail & Products Moderation
  const handleSelectKios = async (kios) => {
    setSelectedKios(kios);
    setKiosDetail(null);
    setShowProdukPanel(false);
    setProdukKios([]);
    setProdukSearch("");
    setProdukFilter("semua");
    try {
      const detail = await kiosAPI.detail(kios.id);
      setKiosDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenProdukPanel = async () => {
    setShowProdukPanel(true);
    setProdukLoading(true);
    try {
      const data = await adminAPI.produkList({ idKios: selectedKios.id, limit: 100 });
      setProdukKios(data.produk || []);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat produk kios");
    } finally {
      setProdukLoading(false);
    }
  };

  const handleDeleteProduk = async (produkId) => {
    if (!window.confirm("Hapus produk ini dari kios? Produk tidak akan muncul di halaman pembeli.")) return;
    setDeletingId(produkId);
    try {
      await adminAPI.produkDelete(produkId);
      setProdukKios(prev => prev.map(p => p.id === produkId ? { ...p, status: "nonaktif" } : p));
      showToast("success", "✅ Produk berhasil dinonaktifkan!");
      const detail = await kiosAPI.detail(selectedKios.id);
      setKiosDetail(detail);
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
      const detail = await kiosAPI.detail(selectedKios.id);
      setKiosDetail(detail);
    } catch (err) {
      showToast("error", err.message || "Gagal mengaktifkan produk");
    } finally {
      setDeletingId(null);
    }
  };

  // Dokter Detail
  const handleSelectDokter = async (dokter) => {
    setSelectedDokter(dokter);
    setDokterDetail(null);
    try {
      const detail = await dokterAPI.detail(dokter.id);
      setDokterDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  // Grooming Detail
  const handleSelectGrooming = async (grooming) => {
    setSelectedGrooming(grooming);
    setGroomingDetail(null);
    try {
      const detail = await groomingAPI.detail(grooming.id);
      setGroomingDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProduk = produkKios.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(produkSearch.toLowerCase());
    const matchFilter = produkFilter === "semua" || p.status === produkFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <DashboardSidebar links={links} title="Admin Panel" color="var(--secondary)" />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 90, right: 24, zIndex: 9999,
            background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
            color: "#fff", borderRadius: "var(--radius-lg)", padding: "0.9rem 1.5rem",
            fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)",
            display: "flex", alignItems: "center", gap: "0.5rem",
            animation: "slideIn 0.3s ease"
          }}>
            {toast.type === "success" ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
            {toast.msg}
          </div>
        )}

        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2>🛡️ Kelola Mitra & Layanan</h2>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          {[
            { id: "kios", label: "Kios 🏪", count: pendingKios.length },
            { id: "dokter", label: "Dokter Hewan 🏥", count: pendingDokter.length },
            { id: "grooming", label: "Grooming ✂️", count: pendingGrooming.length },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${activeTab === t.id ? "btn-primary" : "btn-secondary"}`}
              style={{ position: "relative", paddingRight: t.count > 0 ? "2rem" : "1rem" }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                  background: "#EF4444", color: "#fff", fontSize: "0.65rem", padding: "0.1rem 0.35rem",
                  borderRadius: 999, fontWeight: 700
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>⏳ Memuat data...</div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* TAB: KIOS */}
            {/* ============================================================ */}
            {activeTab === "kios" && (
              <>
                {/* Pending Kios */}
                {pendingKios.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "#F59E0B" }}>⏳ Pengajuan Kios Baru ({pendingKios.length})</h3>
                    {pendingKios.map(k => (
                      <div key={k.id} className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>🏪 {k.namaKios}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Pemilik: {k.namaPengguna} • {k.email}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Bank: {k.namaBank} • Rek: {k.noRekening} a/n {k.namaPemilik}</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => approve("kios", k.id)} className="btn btn-green btn-sm"><CheckCircle size={13}/> Setujui</button>
                            <button onClick={() => reject("kios", k.id)} className="btn btn-danger btn-sm"><XCircle size={13}/> Tolak</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Kios */}
                <h3 style={{ marginBottom: "1rem" }}>✅ Kios Aktif ({kiosList.length})</h3>
                {kiosList.length === 0 ? (
                  <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏪</div>
                    <p>Belum ada kios aktif</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {kiosList.map(k => (
                      <div key={k.id} className="card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                        <img src={k.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${k.nama}`} alt={k.nama} style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{k.nama}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>📍 {k.kota || "Makassar"} • ⭐ {k.rating || "5.0"}</div>
                        </div>
                        <button onClick={() => handleSelectKios(k)} className="btn btn-secondary btn-sm"><Eye size={13}/> Detail</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: DOKTER HEWAN */}
            {/* ============================================================ */}
            {activeTab === "dokter" && (
              <>
                {/* Pending Dokter */}
                {pendingDokter.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "#F59E0B" }}>⏳ Pengajuan Dokter Hewan Baru ({pendingDokter.length})</h3>
                    {pendingDokter.map(d => (
                      <div key={d.id} className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>🏥 {d.nama}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Spesialisasi: {d.spesialisasi || "-"} • STR: {d.noStr || "-"}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tarif: {formatRupiah(d.harga)} • Email: {d.email}</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => approve("dokter", d.id)} className="btn btn-green btn-sm"><CheckCircle size={13}/> Setujui</button>
                            <button onClick={() => reject("dokter", d.id)} className="btn btn-danger btn-sm"><XCircle size={13}/> Tolak</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Dokter */}
                <h3 style={{ marginBottom: "1rem" }}>✅ Dokter Hewan Aktif ({dokterList.length})</h3>
                {dokterList.length === 0 ? (
                  <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏥</div>
                    <p>Belum ada dokter aktif</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {dokterList.map(d => (
                      <div key={d.id} className="card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                        <img src={d.foto ? getImageUrl(d.foto) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.nama}`} alt={d.nama} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{d.nama}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>🩺 {d.spesialisasi || "Umum"} • ⭐ {d.rating || "5.0"} • {d.kota || "Makassar"}</div>
                        </div>
                        <button onClick={() => handleSelectDokter(d)} className="btn btn-secondary btn-sm"><Eye size={13}/> Detail</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* TAB: GROOMING */}
            {/* ============================================================ */}
            {activeTab === "grooming" && (
              <>
                {/* Pending Grooming */}
                {pendingGrooming.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem", color: "#F59E0B" }}>⏳ Pengajuan Penyedia Grooming Baru ({pendingGrooming.length})</h3>
                    {pendingGrooming.map(g => (
                      <div key={g.id} className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>✂️ {g.nama}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Kota: {g.kota} • Email: {g.email}</div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => approve("grooming", g.id)} className="btn btn-green btn-sm"><CheckCircle size={13}/> Setujui</button>
                            <button onClick={() => reject("grooming", g.id)} className="btn btn-danger btn-sm"><XCircle size={13}/> Tolak</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active Grooming */}
                <h3 style={{ marginBottom: "1rem" }}>✅ Penyedia Grooming Aktif ({groomingList.length})</h3>
                {groomingList.length === 0 ? (
                  <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✂️</div>
                    <p>Belum ada penyedia grooming aktif</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {groomingList.map(g => (
                      <div key={g.id} className="card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                        <img src={g.foto ? getImageUrl(g.foto) : `https://api.dicebear.com/7.x/shapes/svg?seed=${g.nama}`} alt={g.nama} style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{g.nama}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>📍 {g.kota || "Makassar"} • ⭐ {g.rating || "5.0"}</div>
                        </div>
                        <button onClick={() => handleSelectGrooming(g)} className="btn btn-secondary btn-sm"><Eye size={13}/> Detail</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: DETAIL KIOS */}
      {/* ============================================================ */}
      {selectedKios && (
        <div className="overlay" style={{ animation: "fadeIn 0.25s ease forwards" }}>
          <div className="card-glass" style={{ width: "100%", maxWidth: showProdukPanel ? 760 : 600, padding: "2rem", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <img src={selectedKios.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedKios.nama}`} alt={selectedKios.nama} style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>🏪 {selectedKios.nama}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📍 {selectedKios.kota || "Makassar"} • ⭐ {selectedKios.rating || "5.0"}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedKios(null); setKiosDetail(null); setShowProdukPanel(false); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <button onClick={() => setShowProdukPanel(false)} className={`btn btn-sm ${!showProdukPanel ? "btn-primary" : "btn-secondary"}`}>📋 Info Kios</button>
              <button onClick={handleOpenProdukPanel} className={`btn btn-sm ${showProdukPanel ? "btn-primary" : "btn-secondary"}`}><Package size={13}/> Kelola Produk</button>
            </div>

            <hr className="divider" style={{ margin: "0 0 1.25rem 0" }} />

            {!showProdukPanel ? (
              !kiosDetail ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>⏳ Memuat detail...</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { label: "Telepon", value: kiosDetail.telepon || "-" },
                    { label: "Email", value: kiosDetail.email || "-" },
                    { label: "Jam Kerja", value: `${kiosDetail.jamBuka || "-"} - ${kiosDetail.jamTutup || "-"}` },
                    { label: "Hari Operasional", value: kiosDetail.hariOperasi || "-" },
                    { label: "Bank", value: kiosDetail.namaBank || "-" },
                    { label: "Rekening", value: `${kiosDetail.noRekening || "-"} a/n ${kiosDetail.namaPemilikRek || "-"}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.75rem" }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "0.2rem" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div>
                {/* Produk list & filters */}
                {produkLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>Memuat produk...</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {filteredProduk.map(p => (
                      <div key={p.id} style={{ display: "flex", justify: "space-between", padding: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                        <span>{p.nama} - {formatRupiah(p.harga)}</span>
                        {p.status === "aktif" ? (
                          <button onClick={() => handleDeleteProduk(p.id)} className="btn btn-danger btn-xs">Nonaktifkan</button>
                        ) : (
                          <button onClick={() => handleAktifkanProduk(p.id)} className="btn btn-green btn-xs">Aktifkan</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DETAIL DOKTER */}
      {/* ============================================================ */}
      {selectedDokter && (
        <div className="overlay" style={{ animation: "fadeIn 0.25s ease forwards" }}>
          <div className="card-glass" style={{ width: "100%", maxWidth: 500, padding: "2rem", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <img src={selectedDokter.foto ? getImageUrl(selectedDokter.foto) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDokter.nama}`} alt={selectedDokter.nama} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>🏥 {selectedDokter.nama}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>🩺 {selectedDokter.spesialisasi || "Umum"}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedDokter(null); setDokterDetail(null); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <hr className="divider" style={{ margin: "0 0 1.25rem 0" }} />

            {!dokterDetail ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>⏳ Memuat detail...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { label: "STR", value: dokterDetail.no_str || "-" },
                  { label: "Harga Konsultasi", value: formatRupiah(dokterDetail.harga_konsultasi) },
                  { label: "Status Layanan", value: dokterDetail.status_ready ? "Aktif / Ready" : "Tidak Ready" },
                  { label: "Total Pasien", value: `${dokterDetail.total_pasien || 0} Pasien` },
                  { label: "Rating Rata-rata", value: `⭐ ${dokterDetail.rating_avg || "5.0"}` },
                  { label: "Kota Praktik", value: dokterDetail.kota || "Makassar" },
                  { label: "Alamat Praktik", value: dokterDetail.alamat_praktik || "-", fullWidth: true },
                ].map(item => (
                  <div key={item.label} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.75rem", gridColumn: item.fullWidth ? "1/-1" : "auto" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "0.2rem" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DETAIL GROOMING */}
      {/* ============================================================ */}
      {selectedGrooming && (
        <div className="overlay" style={{ animation: "fadeIn 0.25s ease forwards" }}>
          <div className="card-glass" style={{ width: "100%", maxWidth: 500, padding: "2rem", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <img src={selectedGrooming.foto ? getImageUrl(selectedGrooming.foto) : `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedGrooming.nama}`} alt={selectedGrooming.nama} style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
                <div>
                  <h3 style={{ fontSize: "1.1rem" }}>✂️ {selectedGrooming.nama}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📍 {selectedGrooming.kota || "Makassar"}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedGrooming(null); setGroomingDetail(null); }} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <hr className="divider" style={{ margin: "0 0 1.25rem 0" }} />

            {!groomingDetail ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>⏳ Memuat detail...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {[
                  { label: "Jam Kerja", value: `${groomingDetail.jamBuka || "-"} - ${groomingDetail.jamTutup || "-"}` },
                  { label: "Jenis Hewan", value: groomingDetail.jenisHewan || "Keduanya" },
                  { label: "Rating", value: `⭐ ${groomingDetail.rating || "5.0"}` },
                  { label: "Bank", value: groomingDetail.namaBank || "-" },
                  { label: "Rekening", value: `${groomingDetail.noRekening || "-"} a/n ${groomingDetail.namaPemilik || "-"}` },
                  { label: "Alamat Toko", value: groomingDetail.alamat || "-", fullWidth: true },
                ].map(item => (
                  <div key={item.label} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.75rem", gridColumn: item.fullWidth ? "1/-1" : "auto" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "0.2rem" }}>{item.value}</div>
                  </div>
                ))}

                <div style={{ gridColumn: "1/-1", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "0.75rem", marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>Layanan Tersedia</div>
                  {(groomingDetail.layanan || []).length === 0 ? (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Tidak ada layanan khusus terdaftar</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {(groomingDetail.layanan || []).map(l => (
                        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                          <span>• {l.nama} ({l.jenisHewan})</span>
                          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{formatRupiah(l.harga)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
