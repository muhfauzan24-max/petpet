import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { adminAPI, kiosAPI, dokterAPI, groomingAPI, getImageUrl } from "../../services/api";
import { Link } from "react-router-dom";
import {
  CheckCircle, XCircle, Clock, Bell, RefreshCw,
  AlertTriangle, Store, Package, ShoppingBag, TrendingUp,
} from "lucide-react";

const links = [
  { href:"/admin",           icon:"🏠", label:"Dashboard" },
  { href:"/admin/pengguna",  icon:"👥", label:"Pengguna" },
  { href:"/admin/kios",      icon:"🏪", label:"Kelola Kios" },
  { href:"/admin/komisi",    icon:"💰", label:"Komisi" },
  { href:"/admin/laporan",   icon:"📊", label:"Laporan" },
];

export default function AdminDashboard() {
  const [stats, setStats]         = useState(null);
  const [pending, setPending]     = useState({ pendingKios:[], pendingDokter:[], pendingGrooming:[], pendingBayar:[] });
  const [produkKios, setProdukKios] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingProduk, setLoadingProduk] = useState(true);
  const [toast, setToast]         = useState(null);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKios, setFilterKios]     = useState("semua"); // filter per toko
  const [searchProduk, setSearchProduk] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, pendingData] = await Promise.all([
        adminAPI.stats(),
        adminAPI.pending(),
      ]);
      setStats(statsData);
      setPending(pendingData || { pendingKios:[], pendingDokter:[], pendingGrooming:[], pendingBayar:[] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProdukKios = async (params = {}) => {
    setLoadingProduk(true);
    try {
      const data = await adminAPI.produkKios(params);
      setProdukKios(data?.produk || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProduk(false);
    }
  };

  useEffect(() => {
    loadData();
    loadProdukKios();
  }, []);

  const handleApproveKios = async (id) => {
    try {
      await kiosAPI.approve(id);
      await loadData();
      showToast("success", "✅ Kios berhasil diverifikasi!");
    } catch (err) { showToast("error", err.message); }
  };
  const handleRejectKios = async (id) => {
    if (!window.confirm("Tolak pendaftaran kios ini?")) return;
    try {
      await kiosAPI.reject(id);
      await loadData();
      showToast("success", "🗑️ Kios berhasil ditolak.");
    } catch (err) { showToast("error", err.message); }
  };
  const handleApproveDokter = async (id) => {
    try {
      await dokterAPI.approve(id);
      await loadData();
      showToast("success", "✅ Dokter berhasil diverifikasi!");
    } catch (err) { showToast("error", err.message); }
  };
  const handleRejectDokter = async (id) => {
    if (!window.confirm("Tolak pendaftaran dokter ini?")) return;
    try {
      await dokterAPI.reject(id);
      await loadData();
      showToast("success", "🗑️ Dokter berhasil ditolak.");
    } catch (err) { showToast("error", err.message); }
  };
  const handleApproveGrooming = async (id) => {
    try {
      await groomingAPI.approve(id);
      await loadData();
      showToast("success", "✅ Grooming berhasil diverifikasi!");
    } catch (err) { showToast("error", err.message); }
  };
  const handleRejectGrooming = async (id) => {
    if (!window.confirm("Tolak pendaftaran grooming ini?")) return;
    try {
      await groomingAPI.reject(id);
      await loadData();
      showToast("success", "🗑️ Grooming berhasil ditolak.");
    } catch (err) { showToast("error", err.message); }
  };

  // Jumlah kemitraan pending (kios+dokter+grooming saja, bukan pembayaran)
  const totalKemitraan =
    (pending.pendingKios?.length || 0) +
    (pending.pendingDokter?.length || 0) +
    (pending.pendingGrooming?.length || 0);

  const totalPending =
    totalKemitraan + (pending.pendingBayar?.length || 0);

  const statCards = stats ? [
    { label:"Total Pengguna",     value: stats.totalPengguna,             icon:"👥", color:"var(--primary)" },
    { label:"Kios Aktif",         value: stats.totalKios,                 icon:"🏪", color:"var(--secondary)" },
    { label:"Dokter Terdaftar",   value: stats.totalDokter,               icon:"🏥", color:"var(--dog-blue)" },
    { label:"Groomer Aktif",      value: stats.totalGrooming,             icon:"✂️", color:"var(--accent)" },
    { label:"Pendapatan Komisi",  value: formatRupiah(stats.totalKomisi), icon:"💰", color:"var(--primary)" },
    { label:"Total Produk",       value: stats.totalProduk,               icon:"📦", color:"var(--secondary)" },
    { label:"Kemitraan Pending",  value: totalKemitraan,                  icon:"⏳", color:"#F59E0B" },
    { label:"Transaksi Hari Ini", value: stats.transaksiHariIni,          icon:"📊", color:"var(--accent)" },
  ] : [];

  // Daftar kios unik dari produk yang ada (untuk dropdown filter)
  const daftarKios = Array.from(
    new Map(produkKios.map(p => [p.idKios, { id: p.idKios, nama: p.namaKios }])).values()
  ).sort((a, b) => a.nama.localeCompare(b.nama));

  // Filter produk kios
  const produkFiltered = produkKios.filter(p => {
    const matchStatus = filterStatus === "semua" || p.status === filterStatus;
    const matchKios   = filterKios === "semua" || String(p.idKios) === String(filterKios);
    const matchSearch = p.nama.toLowerCase().includes(searchProduk.toLowerCase()) ||
                        p.namaKios.toLowerCase().includes(searchProduk.toLowerCase());
    return matchStatus && matchKios && matchSearch;
  });

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1280, margin:"0 auto" }}>
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
            animation:"slideIn 0.3s ease",
          }}>
            {toast.type === "success" ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.1),rgba(249,115,22,0.1))", border:"1px solid rgba(139,92,246,0.2)", borderRadius:"var(--radius-xl)", padding:"1.75rem", marginBottom:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2>🛡️ Admin PetPlace</h2>
            <p style={{ color:"var(--text-muted)", fontSize:"0.875rem", marginTop:"0.25rem" }}>Panel kontrol utama platform PetPlace - Sulawesi Selatan</p>
          </div>
          <button onClick={() => { loadData(); loadProdukKios(); }} className="btn btn-secondary btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)", marginBottom:"2rem" }}>⏳ Memuat statistik...</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
            {statCards.map(s => (
              <div key={s.label} className="card" style={{ padding:"1.25rem", textAlign:"center" }}>
                <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>{s.icon}</div>
                <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.25rem", color:s.color }}>{s.value}</div>
                <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:"0.25rem", lineHeight:1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: PENGAJUAN KEMITRAAN BARU
            Hanya menampilkan: kios, dokter, grooming pending
            ═══════════════════════════════════════════════════════ */}
        <div className="card" style={{ padding:"1.5rem", marginBottom:"2rem", border:"1px solid var(--border)" }}>
          <h3 style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem" }}>
            <Bell size={18} style={{ color:"var(--secondary)" }} />
            🤝 Pengajuan Kemitraan
            {totalKemitraan > 0 && (
              <span style={{ background:"var(--secondary)", color:"#fff", borderRadius:999, padding:"0.1rem 0.6rem", fontSize:"0.72rem", fontWeight:700, marginLeft:"0.25rem" }}>
                {totalKemitraan} Pending
              </span>
            )}
          </h3>

          {totalKemitraan === 0 ? (
            <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
              <Clock size={32} style={{ marginBottom:"0.5rem", opacity:0.5 }} />
              <div>Tidak ada pengajuan kemitraan yang pending</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>

              {/* Pending Kios */}
              {pending.pendingKios?.map(k => (
                <PendingItem
                  key={`kios-${k.id}`}
                  icon="🏪"
                  color="var(--secondary)"
                  title={`Pendaftaran Kios: ${k.namaKios}`}
                  subtitle={`Pemilik: ${k.namaPengguna} • Bank: ${k.namaBank} ${k.noRekening}`}
                  date={k.createdAt ? new Date(k.createdAt).toLocaleDateString("id-ID") : "-"}
                  onApprove={() => handleApproveKios(k.id)}
                  onReject={() => handleRejectKios(k.id)}
                />
              ))}

              {/* Pending Dokter */}
              {pending.pendingDokter?.map(d => (
                <PendingItem
                  key={`dok-${d.id}`}
                  icon="🏥"
                  color="var(--dog-blue)"
                  title={`Pendaftaran Dokter: ${d.nama}`}
                  subtitle={`Spesialisasi: ${d.spesialisasi} • STR: ${d.noStr}`}
                  date={d.createdAt ? new Date(d.createdAt).toLocaleDateString("id-ID") : "-"}
                  onApprove={() => handleApproveDokter(d.id)}
                  onReject={() => handleRejectDokter(d.id)}
                />
              ))}

              {/* Pending Grooming */}
              {pending.pendingGrooming?.map(g => (
                <PendingItem
                  key={`grm-${g.id}`}
                  icon="✂️"
                  color="var(--accent)"
                  title={`Pendaftaran Grooming: ${g.nama}`}
                  subtitle={`Kota: ${g.kota} • Email: ${g.email}`}
                  date={g.createdAt ? new Date(g.createdAt).toLocaleDateString("id-ID") : "-"}
                  onApprove={() => handleApproveGrooming(g.id)}
                  onReject={() => handleRejectGrooming(g.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: VERIFIKASI PEMBAYARAN
            Terpisah dari kemitraan
            ═══════════════════════════════════════════════════════ */}
        {pending.pendingBayar?.length > 0 && (
          <div className="card" style={{ padding:"1.5rem", marginBottom:"2rem", border:"1px solid rgba(249,115,22,0.3)" }}>
            <h3 style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem" }}>
              <ShoppingBag size={18} style={{ color:"var(--primary)" }} />
              💳 Verifikasi Pembayaran
              <span style={{ background:"var(--primary)", color:"#fff", borderRadius:999, padding:"0.1rem 0.6rem", fontSize:"0.72rem", fontWeight:700, marginLeft:"0.25rem" }}>
                {pending.pendingBayar.length} Menunggu
              </span>
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {pending.pendingBayar.map(b => (
                <div key={`bayar-${b.id}`} className="card-glass" style={{ padding:"1rem", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem" }}>
                  <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                    <div style={{ fontSize:"1.5rem", width:44, height:44, background:"rgba(249,115,22,0.1)", borderRadius:"var(--radius-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>💳</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.9rem" }}>Kode Pesanan: {b.kodePesanan}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>
                        Pengirim: {b.namaPengirim} • <span style={{ color:"var(--primary)", fontWeight:600 }}>{formatRupiah(b.jumlah)}</span>
                      </div>
                      <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleString("id-ID") : "-"}
                      </div>
                    </div>
                  </div>
                  <Link to={`/admin/pesanan/${b.idPesanan}`} className="btn btn-primary btn-sm">Verifikasi</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: PRODUK YANG DIDAFTARKAN KIOS
            Menampilkan produk, dari kios mana, & berapa dipesan
            ═══════════════════════════════════════════════════════ */}
        <div className="card" style={{ padding:"1.5rem", marginBottom:"2rem", border:"1px solid var(--border)" }}>
          {/* Header Section */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem", flexWrap:"wrap", gap:"0.75rem" }}>
            <h3 style={{ display:"flex", alignItems:"center", gap:"0.5rem", margin:0 }}>
              <Package size={18} style={{ color:"var(--secondary)" }} />
              📦 Produk Terdaftar dari Kios
              <span style={{ fontSize:"0.72rem", background:"rgba(139,92,246,0.12)", color:"var(--secondary)", padding:"0.15rem 0.55rem", borderRadius:999, fontWeight:700 }}>
                {produkFiltered.length} produk
              </span>
            </h3>
            {/* Search */}
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchProduk}
              onChange={e => setSearchProduk(e.target.value)}
              style={{ padding:"0.4rem 0.75rem", borderRadius:"var(--radius-md)", border:"1px solid var(--border)", background:"var(--bg-secondary)", color:"var(--text-primary)", fontSize:"0.8rem", width:180 }}
            />
          </div>

          {/* ── Filter Bar: pilih kios + status ── */}
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.25rem", alignItems:"center", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", border:"1px solid var(--border)" }}>
            {/* Label */}
            <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", fontWeight:600, marginRight:"0.25rem", display:"flex", alignItems:"center", gap:"0.3rem" }}>
              <Store size={12} /> Filter Toko:
            </span>

            {/* Tombol Semua Kios */}
            <button
              onClick={() => setFilterKios("semua")}
              style={{
                padding:"0.3rem 0.75rem", borderRadius:99, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s",
                background: filterKios === "semua" ? "var(--secondary)" : "var(--bg-card)",
                color:      filterKios === "semua" ? "white" : "var(--text-secondary)",
                border:     `1.5px solid ${filterKios === "semua" ? "var(--secondary)" : "var(--border)"}`,
              }}
            >
              🏪 Semua Kios ({produkKios.length})
            </button>

            {/* Tombol per kios */}
            {daftarKios.map(k => {
              const jumlahProduk = produkKios.filter(p => String(p.idKios) === String(k.id)).length;
              const isActive = String(filterKios) === String(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => setFilterKios(isActive ? "semua" : String(k.id))}
                  style={{
                    padding:"0.3rem 0.75rem", borderRadius:99, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s",
                    display:"flex", alignItems:"center", gap:"0.4rem",
                    background: isActive ? "rgba(139,92,246,0.18)" : "var(--bg-card)",
                    color:      isActive ? "var(--secondary)"      : "var(--text-secondary)",
                    border:     `1.5px solid ${isActive ? "var(--secondary)" : "var(--border)"}`,
                  }}
                >
                  <span>🏪</span>
                  <span>{k.nama}</span>
                  <span style={{ background: isActive ? "var(--secondary)" : "var(--bg-secondary)", color: isActive ? "white" : "var(--text-muted)", borderRadius:99, padding:"0 5px", fontSize:"0.65rem", fontWeight:800 }}>
                    {jumlahProduk}
                  </span>
                </button>
              );
            })}

            {/* Divider */}
            <span style={{ color:"var(--border)", margin:"0 0.25rem" }}>|</span>

            {/* Filter status */}
            <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", fontWeight:600, display:"flex", alignItems:"center", gap:"0.3rem" }}>
              Status:
            </span>
            {["semua", "aktif", "nonaktif"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding:"0.3rem 0.65rem", borderRadius:99, fontSize:"0.72rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s",
                  background: filterStatus === s ? (s === "aktif" ? "rgba(16,185,129,0.15)" : s === "nonaktif" ? "rgba(239,68,68,0.12)" : "var(--bg-card)") : "var(--bg-card)",
                  color:      filterStatus === s ? (s === "aktif" ? "#10B981" : s === "nonaktif" ? "#EF4444" : "var(--text-secondary)") : "var(--text-secondary)",
                  border:     `1.5px solid ${filterStatus === s ? (s === "aktif" ? "#10B981" : s === "nonaktif" ? "#EF4444" : "var(--border)") : "var(--border)"}`,
                }}
              >
                {s === "semua" ? "Semua" : s === "aktif" ? "✅ Aktif" : "❌ Nonaktif"}
              </button>
            ))}
          </div>

          {/* Info kios yang sedang difilter */}
          {filterKios !== "semua" && (
            <div style={{ marginBottom:"0.75rem", padding:"0.6rem 1rem", background:"rgba(139,92,246,0.06)", borderRadius:"var(--radius-md)", border:"1px solid rgba(139,92,246,0.2)", fontSize:"0.8rem", color:"var(--secondary)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span>
                🏪 Menampilkan produk dari: <strong>{daftarKios.find(k => String(k.id) === String(filterKios))?.nama || "-"}</strong>
                {" "}— {produkFiltered.length} produk ditemukan
              </span>
              <button onClick={() => setFilterKios("semua")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--secondary)", fontSize:"1rem" }}>✕</button>
            </div>
          )}

          {loadingProduk ? (
            <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>⏳ Memuat produk...</div>
          ) : produkFiltered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
              <Package size={32} style={{ marginBottom:"0.5rem", opacity:0.4 }} />
              <div>{filterKios !== "semua" ? "Tidak ada produk dari kios ini" : "Belum ada produk terdaftar"}</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {produkFiltered.map(p => (
                <ProdukKiosItem key={p.id} produk={p} />
              ))}
              {produkFiltered.length >= 30 && (
                <div style={{ textAlign:"center", paddingTop:"0.5rem" }}>
                  <Link to="/admin/kios" className="btn btn-secondary btn-sm">Lihat Semua Produk →</Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Nav */}
        <div className="grid-2">
          {[
            { href:"/admin/kios",     icon:"🏪", label:"Verifikasi Kios",   desc:`${pending.pendingKios?.length || 0} kios menunggu verifikasi`, badge: pending.pendingKios?.length },
            { href:"/admin/pengguna", icon:"👥", label:"Kelola Pengguna",   desc:"Manajemen akun & peran pengguna", badge: null },
            { href:"/admin/komisi",   icon:"💰", label:"Laporan Komisi",    desc:"Monitor komisi platform 10%", badge: null },
            { href:"/admin/laporan",  icon:"📊", label:"Laporan Platform",  desc:"Analytics & statistik lengkap", badge: null },
          ].map(item => (
            <Link key={item.href} to={item.href} style={{ textDecoration:"none" }}>
              <div className="card" style={{ padding:"1.25rem", display:"flex", gap:"0.75rem", alignItems:"center" }}>
                <div style={{ fontSize:"1.5rem", width:48, height:48, background:"rgba(139,92,246,0.1)", borderRadius:"var(--radius-md)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{item.label}</div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>{item.desc}</div>
                </div>
                {item.badge > 0 && <span className="badge badge-orange" style={{ fontSize:"0.65rem" }}>{item.badge} Pending</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Komponen: Item pengajuan kemitraan (approve/reject) ────────────────
function PendingItem({ icon, color, title, subtitle, date, onApprove, onReject }) {
  return (
    <div className="card-glass" style={{ padding:"1rem", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem" }}>
      <div style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
        <div style={{ fontSize:"1.75rem", width:44, height:44, background:`${color}15`, borderRadius:"var(--radius-md)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{title}</div>
          <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", marginTop:"0.15rem" }}>{subtitle}</div>
          <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>Diajukan: {date}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
        <button onClick={onApprove} className="btn btn-green btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
          <CheckCircle size={14} /> Setujui
        </button>
        <button onClick={onReject} className="btn btn-danger btn-sm" style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
          <XCircle size={14} /> Tolak
        </button>
      </div>
    </div>
  );
}

// ── Komponen: Card produk dari kios dengan info pesanan ────────────────
function ProdukKiosItem({ produk }) {
  const harga      = produk.hargaDiskon || produk.harga;
  const totalPesan = Number(produk.totalDipesan) || 0;
  const jmlPesanan = Number(produk.totalPesanan) || 0;
  const stok       = produk.stok ?? "-";
  const imgUrl     = getImageUrl(produk.foto);

  const statusColor = produk.status === "aktif"
    ? { bg:"rgba(16,185,129,0.15)", color:"#10B981" }
    : { bg:"rgba(239,68,68,0.12)", color:"#EF4444" };

  return (
    <div className="card-glass" style={{ padding:"0.9rem 1rem", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", display:"flex", alignItems:"center", gap:"1rem" }}>
      {/* Foto produk */}
      <div style={{ width:52, height:52, borderRadius:"var(--radius-md)", overflow:"hidden", background:"rgba(139,92,246,0.08)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {imgUrl
          ? <img src={imgUrl} alt={produk.nama} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <span style={{ fontSize:"1.5rem" }}>📦</span>
        }
      </div>

      {/* Info produk */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:"0.9rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{produk.nama}</div>
        <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.1rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
          <Store size={11} />
          <span style={{ fontWeight:600, color:"var(--secondary)" }}>{produk.namaKios}</span>
          {produk.teleponKios && <span>• ☎ {produk.teleponKios}</span>}
          {produk.namaKategori && <span>• {produk.namaKategori}</span>}
        </div>
      </div>

      {/* Harga */}
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontWeight:700, fontSize:"0.85rem", color:"var(--primary)" }}>{formatRupiah(harga)}</div>
        {produk.hargaDiskon && <div style={{ fontSize:"0.68rem", color:"var(--text-muted)", textDecoration:"line-through" }}>{formatRupiah(produk.harga)}</div>}
      </div>

      {/* Stok */}
      <div style={{ textAlign:"center", flexShrink:0, minWidth:48 }}>
        <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Stok</div>
        <div style={{ fontWeight:700, fontSize:"0.88rem" }}>{stok}</div>
      </div>

      {/* Total dipesan */}
      <div style={{ textAlign:"center", flexShrink:0, minWidth:80, padding:"0.4rem 0.7rem", background:"rgba(249,115,22,0.08)", borderRadius:"var(--radius-md)", border:"1px solid rgba(249,115,22,0.2)" }}>
        <div style={{ fontSize:"0.68rem", color:"var(--text-muted)", marginBottom:"0.1rem", display:"flex", alignItems:"center", gap:"0.25rem", justifyContent:"center" }}>
          <TrendingUp size={10} /> Dipesan
        </div>
        <div style={{ fontWeight:800, fontSize:"1rem", color:"var(--primary)" }}>{totalPesan}</div>
        <div style={{ fontSize:"0.62rem", color:"var(--text-muted)" }}>{jmlPesanan} pesanan</div>
      </div>

      {/* Status badge */}
      <div style={{ flexShrink:0 }}>
        <span style={{ background:statusColor.bg, color:statusColor.color, borderRadius:999, padding:"0.2rem 0.65rem", fontSize:"0.68rem", fontWeight:700 }}>
          {produk.status === "aktif" ? "Aktif" : "Nonaktif"}
        </span>
      </div>
    </div>
  );
}
