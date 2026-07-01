import { useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { formatRupiah } from "../../data/mockData";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO = [
  { id:1, pembeli:"Siti Rahma", namaHewan:"Mochi", jenisHewan:"kucing", tanggal:"2024-06-06", jam:"09:00", layanan:"Grooming Lengkap (Kucing < 4kg)", harga:100000, status:"menunggu" },
  { id:2, pembeli:"Budi Santoso", namaHewan:"Rocky", jenisHewan:"anjing", tanggal:"2024-06-06", jam:"13:00", layanan:"Bath & Blow Dry (Anjing M)", harga:150000, status:"menunggu" },
  { id:3, pembeli:"Rina Puspita", namaHewan:"Lola", jenisHewan:"anjing", tanggal:"2024-06-05", jam:"10:00", layanan:"Potong Kuku", harga:30000, status:"selesai" },
];

export default function GroomingBooking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([...DEMO,...JSON.parse(localStorage.getItem("petplace_booking_grooming")||"[]")]);

  const getSidebarLinks = () => {
    const list = [
      { href:"/portal-grooming", icon:"🏠", label:"Dashboard" },
      { href:"/portal-grooming/booking", icon:"📋", label:"Booking", badge: bookings.filter(b=>b.status==="menunggu").length || undefined },
      { href:"/portal-grooming/chat", icon:"💬", label:"Chat Klien" },
    ];
    if (user?.peran === 'owner') {
      list.push({ href: "/kios", icon: "🏪", label: "Dashboard Kios" });
    } else {
      list.push({ href: "/akun/daftar-kios", icon: "🏪", label: "Buka Kios" });
    }
    if (user?.hasDokter || user?.peran === 'dokter') {
      list.push({ href: "/portal-dokter", icon: "🏥", label: "Portal Dokter" });
    } else {
      list.push({ href: "/akun/daftar-dokter", icon: "🏥", label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    list.push({ href: "/akun", icon: "👤", label: "Profil Saya" });
    return list;
  };

  const confirm = id => setBookings(b=>b.map(x=>x.id===id?{...x,status:"dikonfirmasi"}:x));
  const done = id => setBookings(b=>b.map(x=>x.id===id?{...x,status:"selesai"}:x));
  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={getSidebarLinks()} title="Portal Grooming" color="var(--accent)" />
      <div style={{ flex:1 }}>
        <h2 style={{ marginBottom:"1.5rem" }}>📋 Kelola Booking</h2>
        {bookings.map(b=>(
          <div key={b.id} className="card" style={{ padding:"1.25rem", marginBottom:"0.875rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
              <div>
                <div style={{ fontWeight:700 }}>{b.jenisHewan==="kucing"?"🐱":"🐶"} {b.namaHewan} <span style={{ fontWeight:400, color:"var(--text-muted)", fontSize:"0.85rem" }}>— milik {b.pembeli}</span></div>
                <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>📅 {b.tanggal} pukul {b.jam}</div>
              </div>
              <span className={`badge ${b.status==="selesai"?"badge-green":b.status==="dikonfirmasi"?"badge-blue":"badge-orange"}`}>{b.status}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"0.85rem", color:"var(--text-secondary)" }}>Layanan: {b.layanan}</span>
              <span style={{ fontWeight:700, color:"var(--primary)" }}>{formatRupiah(b.harga)}</span>
            </div>
            {b.status==="menunggu"&&<button onClick={()=>confirm(b.id)} className="btn btn-green btn-sm"><CheckCircle size={13}/> Konfirmasi</button>}
            {b.status==="dikonfirmasi"&&<button onClick={()=>done(b.id)} className="btn btn-primary btn-sm">Tandai Selesai</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
