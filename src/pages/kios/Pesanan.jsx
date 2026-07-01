import { useState, useEffect } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { pesananAPI, getImageUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Eye, X, Check, XCircle, Package, Truck, MapPin } from "lucide-react";
import { NotifikasiKiosAlert } from "../../components/ui/NotifikasiKios";

const STATUS_LABELS = {
  menunggu_pembayaran: "⏳ Menunggu Bayar",
  verifikasi: "🔍 Menunggu Verifikasi",
  diproses: "⚙️ Diproses",
  dikirim: "🚚 Dikirim",
  selesai: "✅ Selesai",
  dibatalkan: "❌ Dibatalkan"
};

const STATUS_NEXT = {
  diproses: "dikirim",
  dikirim: "selesai",
};

const sidebarLinks = [
  { href: "/kios", icon: "🏠", label: "Dashboard" },
  { href: "/kios/produk", icon: "📦", label: "Produk" },
  { href: "/kios/pesanan", icon: "🛒", label: "Pesanan" },
  { href: "/kios/chat", icon: "💬", label: "Chat" },
  { href: "/kios/analitik", icon: "📊", label: "Analitik" },
  { href: "/akun", icon: "👤", label: "Profil Saya" },
];

export default function KiosPesanan() {
  const { user } = useAuth();
  const idKios = user?.kios?.id;

  const [pesanan, setPesanan]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("semua");
  const [selected, setSelected]       = useState(null); // pesanan yang sedang dilihat detail/bukti
  const [verifying, setVerifying]     = useState(false);
  const [rejectMsg, setRejectMsg]     = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchData = async () => {
    if (!idKios) return;
    try {
      const params = {};
      if (filter !== "semua") params.status = filter;
      const data = await pesananAPI.kiosList(params);
      setPesanan(data || []);

      if (selected) {
        const updated = (data || []).find(p => p.id === selected.id);
        if (updated) {
          setSelected(updated);
        }
      }
    } catch (err) {
      console.error("Gagal memperbarui data pesanan:", err);
    }
  };

  const loadData = async () => {
    if (!idKios) { setLoading(false); return; }
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [idKios, filter]);

  // Polling data secara real-time setiap 10 detik
  useEffect(() => {
    if (!idKios) return;
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [idKios, filter, selected]);

  const handleConfirmPayment = async (id) => {
    setVerifying(true);
    try {
      await pesananAPI.verifikasi(id, true);
      setSelected(null);
      await loadData();
      alert("✅ Pembayaran dikonfirmasi! Pesanan akan segera diproses.");
    } catch (err) {
      alert(err.message || "Gagal mengkonfirmasi pembayaran");
    } finally {
      setVerifying(false);
    }
  };

  const handleRejectPayment = async (id) => {
    if (!window.confirm("Tolak pembayaran ini? Pembeli perlu upload ulang bukti bayar.")) return;
    setVerifying(true);
    try {
      await pesananAPI.verifikasi(id, false);
      setSelected(null);
      await loadData();
      alert("❌ Pembayaran ditolak. Pembeli akan diminta upload ulang.");
    } catch (err) {
      alert(err.message || "Gagal menolak pembayaran");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    let noResi = undefined;
    if (newStatus === 'dikirim') {
      const p = pesanan.find(x => x.id === id);
      noResi = window.prompt(`Masukkan Nomor Resi Pengiriman untuk Pesanan #${p?.kode}:`, p ? `RESI-${p.kode.split('-').pop()}` : '');
      if (noResi === null) return; // Batal
    }
    try {
      await pesananAPI.updateStatus(id, newStatus, noResi);
      await loadData();
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status: newStatus, noResi } : null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Hitung jumlah verifikasi
  const pendingVerifikasi = pesanan.filter(p => p.status === "verifikasi").length;

  return (
    <>
    <div style={{ display: "flex", gap: "2rem", padding: "2rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      <DashboardSidebar links={sidebarLinks} title="Dashboard Kios" />
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2>🛒 Pesanan Kios</h2>
            {pendingVerifikasi > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                marginTop: "0.4rem", padding: "0.3rem 0.75rem",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-full)", fontSize: "0.78rem", color: "#EF4444", fontWeight: 700,
                animation: "pulse 2s infinite"
              }}>
                🔔 {pendingVerifikasi} pesanan menunggu verifikasi bukti bayar!
              </div>
            )}
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter Status */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {["semua", "verifikasi", "diproses", "dikirim", "selesai", "dibatalkan"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
              style={{ textTransform: "capitalize", fontSize: "0.75rem", position: "relative" }}>
              {s === "semua" ? "Semua" : STATUS_LABELS[s] || s}
              {s === "verifikasi" && pendingVerifikasi > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: "#EF4444", color: "white",
                  borderRadius: "50%", width: 16, height: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800
                }}>{pendingVerifikasi}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>⏳ Memuat pesanan...</div>
        ) : pesanan.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
            <h3>Belum ada pesanan</h3>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pesanan.map(p => (
              <div key={p.id} className="card" style={{
                padding: "1.25rem",
                border: p.status === "verifikasi"
                  ? "1.5px solid rgba(239,68,68,0.5)"
                  : "1px solid var(--border)",
                background: p.status === "verifikasi"
                  ? "rgba(239,68,68,0.03)"
                  : undefined
              }}>
                {/* Header pesanan */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--primary)" }}>#{p.kode}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleString("id-ID") : "-"}
                    </div>
                    {p.namaPembeli && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        Pembeli: <strong>{p.namaPembeli}</strong>
                      </div>
                    )}
                    {p.alamatPengiriman && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem", display: "flex", gap: "0.3rem", alignItems: "flex-start" }}>
                        <MapPin size={11} style={{ flexShrink: 0, marginTop: 2 }} />
                        {p.alamatPengiriman}, {p.kota}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${p.status === "selesai" ? "badge-green" : p.status === "dibatalkan" ? "badge-red" : p.status === "verifikasi" ? "badge-red" : "badge-orange"}`}
                    style={{ fontSize: "0.75rem" }}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>

                {/* Items */}
                {(p.items || []).length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {p.items.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "center", padding: "0.3rem 0.65rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.78rem" }}>
                        <Package size={12} style={{ color: "var(--primary)" }} />
                        {item.nama?.slice(0, 22)} × {item.jumlah}
                      </div>
                    ))}
                    {p.items.length > 4 && (
                      <div style={{ padding: "0.3rem 0.65rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        +{p.items.length - 4} item
                      </div>
                    )}
                  </div>
                )}

                {/* Bukti Bayar alert jika status verifikasi */}
                {p.status === "verifikasi" && p.buktiFoto && (
                  <div style={{
                    padding: "0.65rem 0.9rem",
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "0.75rem",
                    fontSize: "0.82rem",
                    color: "#EF4444",
                    fontWeight: 600
                  }}>
                    🔔 Pembeli sudah upload bukti bayar — klik <strong>"Lihat Bukti"</strong> untuk verifikasi
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.8rem" }}>
                    Total: <strong style={{ color: "var(--primary)", fontSize: "1rem" }}>{formatRupiah(p.totalBayar)}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {/* Lihat detail / bukti bayar */}
                    <button onClick={() => setSelected(p)} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
                      <Eye size={13} /> Lihat Detail
                    </button>
                    {/* Tombol update status lainnya */}
                    {STATUS_NEXT[p.status] && (
                      <button onClick={() => handleUpdateStatus(p.id, STATUS_NEXT[p.status])} className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem" }}>
                        <Truck size={13} /> → {STATUS_LABELS[STATUS_NEXT[p.status]]}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== MODAL DETAIL PESANAN ===================== */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem"
        }} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="card" style={{
            width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto",
            padding: "2rem", position: "relative"
          }}>
            {/* Close */}
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
              <X size={20} />
            </button>

            <h3 style={{ marginBottom: "0.25rem" }}>📋 Detail Pesanan</h3>
            <div style={{ fontFamily: "monospace", color: "var(--primary)", fontWeight: 700, marginBottom: "1.25rem" }}>#{selected.kode}</div>

            {/* Info Pembeli & Alamat */}
            <div className="card" style={{ padding: "1rem", background: "var(--bg-secondary)", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem" }}>👤 Info Pembeli</div>
              <div style={{ fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div><span style={{ color: "var(--text-muted)" }}>Nama: </span><strong>{selected.namaPembeli}</strong></div>
                {selected.telPembeli && <div><span style={{ color: "var(--text-muted)" }}>Telepon: </span>{selected.telPembeli}</div>}
                {selected.namaPenerima && <div><span style={{ color: "var(--text-muted)" }}>Penerima: </span>{selected.namaPenerima}</div>}
                {selected.alamatPengiriman && (
                  <div style={{ display: "flex", gap: "0.3rem", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--text-muted)" }}>Alamat: </span>
                    <span>{selected.alamatPengiriman}{selected.kota ? `, ${selected.kota}` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            {(selected.items || []).length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem" }}>📦 Produk Dipesan</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {selected.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
                      <span>{item.nama} × {item.jumlah}</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1.25rem", padding: "0.875rem", background: "rgba(249,115,22,0.06)", borderRadius: "var(--radius-md)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal Produk</span>
                <span>{formatRupiah(selected.totalHarga || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Ongkir</span>
                <span>{formatRupiah(selected.ongkir || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: "0.4rem", borderTop: "1px solid rgba(249,115,22,0.2)" }}>
                <span>Total Bayar</span>
                <span style={{ color: "var(--primary)", fontSize: "1.05rem" }}>{formatRupiah(selected.totalBayar)}</span>
              </div>
            </div>

            {/* ====== BAGIAN BUKTI BAYAR ====== */}
            {selected.status === "verifikasi" && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239,68,68,0.07)",
                  border: "1.5px solid rgba(239,68,68,0.35)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                  fontWeight: 600,
                  color: "#EF4444",
                  fontSize: "0.85rem"
                }}>
                  🔔 Pembeli telah mengirimkan bukti pembayaran. Silakan verifikasi!
                </div>

                {/* Info Metode Bayar */}
                {(selected.metodeBayar || selected.namaBank) && (
                  <div style={{ padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.82rem", marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>💳 Info Pembayaran</div>
                    {selected.metodeBayar && <div><span style={{ color: "var(--text-muted)" }}>Metode: </span>{selected.metodeBayar === "transfer_bank" ? "🏦 Transfer Bank" : "📱 QRIS"}</div>}
                    {selected.namaBank && <div><span style={{ color: "var(--text-muted)" }}>Bank: </span><strong>{selected.namaBank}</strong></div>}
                    {selected.noRekening && <div><span style={{ color: "var(--text-muted)" }}>No Rekening: </span><strong style={{ color: "var(--primary)" }}>{selected.noRekening}</strong></div>}
                    {selected.namaPengirim && <div><span style={{ color: "var(--text-muted)" }}>Nama Pengirim: </span><strong>{selected.namaPengirim}</strong></div>}
                    {selected.jumlahBayar && <div><span style={{ color: "var(--text-muted)" }}>Jumlah Dikirim: </span><strong style={{ color: "var(--primary)" }}>{formatRupiah(selected.jumlahBayar)}</strong></div>}
                    {selected.waktuBayar && <div><span style={{ color: "var(--text-muted)" }}>Waktu Upload: </span>{new Date(selected.waktuBayar).toLocaleString("id-ID")}</div>}
                  </div>
                )}

                {/* Foto Bukti Bayar */}
                {selected.buktiFoto ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem" }}>🖼️ Foto Bukti Transfer/QRIS</div>
                    <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 400, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                      <img
                        src={selected.buktiFoto.startsWith("data:") || selected.buktiFoto.startsWith("http") ? selected.buktiFoto : getImageUrl(selected.buktiFoto)}
                        alt="Bukti bayar"
                        style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "1rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    ⚠️ Bukti foto belum tersedia atau belum diupload
                  </div>
                )}

                {/* Tombol Verifikasi */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                  <button
                    onClick={() => handleConfirmPayment(selected.id)}
                    disabled={verifying}
                    className="btn btn-primary"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: verifying ? 0.7 : 1 }}>
                    {verifying ? "⏳ Memproses..." : <><Check size={16} /> ✅ Terima Pembayaran</>}
                  </button>
                  <button
                    onClick={() => handleRejectPayment(selected.id)}
                    disabled={verifying}
                    className="btn btn-secondary"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", border: "1.5px solid rgba(239,68,68,0.4)", color: "#EF4444", opacity: verifying ? 0.7 : 1 }}>
                    {verifying ? "⏳..." : <><XCircle size={16} /> ❌ Tolak Pembayaran</>}
                  </button>
                </div>
              </div>
            )}

            {/* Jika sudah diproses, tampilkan action update status */}
            {selected.status !== "verifikasi" && selected.status !== "menunggu_pembayaran" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {STATUS_NEXT[selected.status] && (
                  <button
                    onClick={() => handleUpdateStatus(selected.id, STATUS_NEXT[selected.status])}
                    className="btn btn-primary btn-full">
                    <Truck size={15} /> → Update ke {STATUS_LABELS[STATUS_NEXT[selected.status]]}
                  </button>
                )}
              </div>
            )}

            {/* Status badge bawah */}
            <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Status saat ini: <strong style={{ color: selected.status === "selesai" ? "#22C55E" : selected.status === "verifikasi" ? "#EF4444" : "var(--primary)" }}>{STATUS_LABELS[selected.status] || selected.status}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
    <NotifikasiKiosAlert />
    </>
  );
}
