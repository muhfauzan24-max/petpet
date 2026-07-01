import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../services/api";

export default function KiosAnalitik() {
  const { user } = useAuth();
  const targetKiosId = user?.idKios || 1;
  const pesanan = JSON.parse(localStorage.getItem("petplace_pesanan") || "[]");
  const myPesanan = pesanan.filter(order => order.items && order.items.some(item => item.idKios === targetKiosId));
  // Load only real products from localStorage
  const allStoredProduk = JSON.parse(localStorage.getItem('petplace_produk') || '[]');
  const myProduk = allStoredProduk.filter(p => p.idKios === targetKiosId);

  // Top products
  const topProduk = [...myProduk].sort((a, b) => b.terjual - a.terjual).slice(0, 5);

  // Calculate dynamic sales
  // Successful sales (not cancelled, not pending payment, not waiting verification)
  const successfulOrders = myPesanan.filter(p => p.status !== "dibatalkan" && p.status !== "menunggu_pembayaran" && p.status !== "verifikasi");
  const totalPenjualan = successfulOrders.reduce((s, p) => s + p.totalBayar, 0);
  const komisiPlatform = Math.round(totalPenjualan * 0.1);
  const pendapatanBersih = totalPenjualan - komisiPlatform;
  
  // Total pieces sold
  const totalPcsSold = successfulOrders.reduce((sum, order) => {
    const qty = order.items
      .filter(item => item.idKios === targetKiosId)
      .reduce((s, item) => s + item.jumlah, 0);
    return sum + qty;
  }, 0);

  const getSidebarLinks = () => {
    const list = [
      { href: "/kios", icon: "🏠", label: "Dashboard" },
      { href: "/kios/produk", icon: "📦", label: "Produk" },
      { href: "/kios/pesanan", icon: "🛒", label: "Pesanan", badge: myPesanan.filter(p=>p.status==="verifikasi").length || undefined },
      { href: "/kios/chat", icon: "💬", label: "Chat" },
      { href: "/kios/analitik", icon: "📊", label: "Analitik" },
    ];
    if (user?.hasDokter || user?.peran === 'dokter') {
      list.push({ href: "/portal-dokter", icon: "🏥", label: "Portal Dokter" });
    } else {
      list.push({ href: "/akun/daftar-dokter", icon: "🏥", label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    if (user?.hasGrooming || user?.peran === 'grooming') {
      list.push({ href: "/portal-grooming", icon: "✂️", label: "Portal Grooming" });
    } else {
      list.push({ href: "/akun/daftar-grooming", icon: "✂️", label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    list.push({ href: "/akun", icon: "👤", label: "Profil Saya" });
    return list;
  };

  const stats = [
    { label:"Total Penjualan", value:formatRupiah(totalPenjualan), icon:"💰", color:"var(--primary)" },
    { label:"Komisi Platform (10%)", value:formatRupiah(komisiPlatform), icon:"📊", color:"#F87171" },
    { label:"Pendapatan Bersih", value:formatRupiah(pendapatanBersih), icon:"✅", color:"var(--accent)" },
    { label:"Total Produk Terjual", value:`${totalPcsSold} pcs`, icon:"📦", color:"var(--secondary)" },
  ];
  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={getSidebarLinks()} title="Dashboard Kios" />
      <div style={{ flex:1 }}>
        <h2 style={{ marginBottom:"1.5rem" }}>📊 Laporan & Analitik</h2>
        <div className="grid-4" style={{ marginBottom:"2rem" }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding:"1.25rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.75rem", marginBottom:"0.5rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"Outfit", fontWeight:800, fontSize:"1.1rem", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.25rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:"1.5rem" }}>
          <h3 style={{ marginBottom:"1rem" }}>🏆 Produk Terlaris</h3>
          {topProduk.map((p,i) => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"0.75rem 0", borderBottom:"1px solid var(--border)" }}>
              <div style={{ width:28, height:28, background:"var(--bg-secondary)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.85rem", color:"var(--primary)", flexShrink:0 }}>{i+1}</div>
              <img
                src={getImageUrl(p.foto) || 'https://placehold.co/44x44/1C1C1C/666?text=No'}
                alt={p.nama}
                style={{ width:44, height:44, borderRadius:"var(--radius-md)", objectFit:"cover" }}
                onError={e => { e.target.src = 'https://placehold.co/44x44/1C1C1C/666?text=No'; }}
              />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:"0.875rem" }}>{p.nama}</div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{p.terjual} terjual</div>
              </div>
              <div style={{ fontWeight:700, color:"var(--primary)" }}>{formatRupiah((p.hargaDiskon||p.harga)*p.terjual)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
