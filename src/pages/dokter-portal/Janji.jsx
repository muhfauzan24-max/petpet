import { useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO = [
  { id:1, pembeli:"Siti Rahma", namaHewan:"Nemo", jenisHewan:"kucing", tanggal:"2024-06-06", jam:"09:00", keluhan:"Hewan tidak mau makan 3 hari", status:"menunggu" },
  { id:2, pembeli:"Budi Santoso", namaHewan:"Rex", jenisHewan:"anjing", tanggal:"2024-06-06", jam:"11:00", keluhan:"Batuk dan pilek", status:"menunggu" },
  { id:3, pembeli:"Rina Puspita", namaHewan:"Luna", jenisHewan:"kucing", tanggal:"2024-06-05", jam:"14:00", keluhan:"Vaksin rutin", status:"selesai" },
];

export default function DokterJanji() {
  const { user } = useAuth();
  const [janji, setJanji] = useState([...DEMO,...JSON.parse(localStorage.getItem("petplace_janji_dokter")||"[]")]);

  const getSidebarLinks = () => {
    const list = [
      { href:"/portal-dokter", icon:"🏠", label:"Dashboard" },
      { href:"/portal-dokter/jadwal", icon:"📅", label:"Jadwal Saya" },
      { href:"/portal-dokter/janji", icon:"📋", label:"Janji Temu", badge: janji.filter(j=>j.status==="menunggu").length || undefined },
      { href:"/portal-dokter/chat", icon:"💬", label:"Chat Pasien" },
    ];
    if (user?.peran === 'owner') {
      list.push({ href: "/kios", icon: "🏪", label: "Dashboard Kios" });
    } else {
      list.push({ href: "/akun/daftar-kios", icon: "🏪", label: "Buka Kios" });
    }
    if (user?.hasGrooming || user?.peran === 'grooming') {
      list.push({ href: "/portal-grooming", icon: "✂️", label: "Portal Grooming" });
    } else {
      list.push({ href: "/akun/daftar-grooming", icon: "✂️", label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    list.push({ href: "/akun", icon: "👤", label: "Profil Saya" });
    return list;
  };

  const confirm = id => setJanji(j=>j.map(x=>x.id===id?{...x,status:"dikonfirmasi"}:x));
  const done = id => setJanji(j=>j.map(x=>x.id===id?{...x,status:"selesai"}:x));

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={getSidebarLinks()} title="Portal Dokter" color="var(--dog-blue)" />
      <div style={{ flex:1 }}>
        <h2 style={{ marginBottom:"1.5rem" }}>📋 Manajemen Janji Temu</h2>
        {janji.map(j=>(
          <div key={j.id} className="card" style={{ padding:"1.25rem", marginBottom:"0.875rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
              <div>
                <div style={{ fontWeight:700 }}>{j.jenisHewan==="kucing"?"🐱":"🐶"} {j.namaHewan} <span style={{ fontWeight:400, color:"var(--text-muted)", fontSize:"0.85rem" }}>— milik {j.pembeli}</span></div>
                <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>📅 {j.tanggal} pukul {j.jam}</div>
              </div>
              <span className={`badge ${j.status==="selesai"?"badge-green":j.status==="dikonfirmasi"?"badge-blue":j.status==="menunggu"?"badge-orange":"badge-gray"}`}>{j.status}</span>
            </div>
            <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.875rem" }}>Keluhan: {j.keluhan}</p>
            {j.status==="menunggu" && (
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <button onClick={()=>confirm(j.id)} className="btn btn-green btn-sm"><CheckCircle size={13}/> Konfirmasi</button>
                <button className="btn btn-danger btn-sm"><XCircle size={13}/> Tolak</button>
              </div>
            )}
            {j.status==="dikonfirmasi" && (
              <button onClick={()=>done(j.id)} className="btn btn-primary btn-sm">Tandai Selesai</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
