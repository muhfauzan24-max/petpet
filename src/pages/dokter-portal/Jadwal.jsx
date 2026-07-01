import { useState } from "react";
import DashboardSidebar from "../../components/layout/DashboardSidebar";
import { dokterData } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

const HARI = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

export default function DokterJadwal() {
  const { user } = useAuth();
  const [jadwal, setJadwal] = useState(dokterData[0].jadwal);
  const [ready, setReady] = useState(dokterData[0].statusReady);
  const janji = JSON.parse(localStorage.getItem("petplace_janji_dokter")||"[]");

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

  return (
    <div style={{ display:"flex", gap:"2rem", padding:"2rem 1.5rem", maxWidth:1200, margin:"0 auto" }}>
      <DashboardSidebar links={getSidebarLinks()} title="Portal Dokter" color="var(--dog-blue)" />
      <div style={{ flex:1 }}>
        <h2 style={{ marginBottom:"1.5rem" }}>📅 Jadwal Praktik</h2>
        <div className="card" style={{ padding:"1.5rem", marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
            <h3>Status Ketersediaan</h3>
            <label style={{ display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer" }}>
              <span style={{ fontSize:"0.875rem", color:"var(--text-muted)" }}>Tidak Ready</span>
              <div onClick={()=>setReady(!ready)} style={{ width:48, height:26, background:ready?"var(--accent)":"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius-full)", position:"relative", cursor:"pointer", transition:"var(--transition)" }}>
                <div style={{ position:"absolute", top:3, left:ready?24:3, width:18, height:18, background:"white", borderRadius:"50%", transition:"left 0.25s ease", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
              </div>
              <span style={{ fontSize:"0.875rem", fontWeight:700, color:ready?"var(--accent)":"var(--text-muted)" }}>Ready</span>
            </label>
          </div>
          <div className={`alert ${ready?"alert-success":"alert-warning"}`}>
            {ready?"✅ Anda sedang READY melayani konsultasi. Pembeli bisa membuat janji sekarang.":"⏰ Anda sedang tidak ready. Pasien tidak dapat membuat janji baru saat ini."}
          </div>
        </div>
        <div className="card" style={{ padding:"1.5rem" }}>
          <h3 style={{ marginBottom:"1rem" }}>Jadwal Mingguan</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {HARI.map(hari => {
              const j = jadwal.find(x=>x.hari===hari);
              return (
                <div key={hari} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.875rem 1rem", background:j?"rgba(249,115,22,0.06)":"var(--bg-secondary)", border:`1px solid ${j?"rgba(249,115,22,0.2)":"var(--border)"}`, borderRadius:"var(--radius-md)" }}>
                  <span style={{ fontWeight:600, width:80 }}>{hari}</span>
                  <span style={{ color:j?"var(--primary)":"var(--text-muted)", fontWeight:j?700:400 }}>{j?j.jam:"Libur"}</span>
                  <span className={`badge ${j?"badge-green":"badge-gray"}`} style={{ fontSize:"0.7rem" }}>{j?"Aktif":"Libur"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
