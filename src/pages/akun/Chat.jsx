// Chat page placeholder
import { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { kiosAPI, dokterAPI as dApi, groomingAPI } from '../../services/api';
import { Send } from 'lucide-react';


export default function AkunChat() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [allMitra, setAllMitra] = useState([]);

  useEffect(() => {
    Promise.all([
      kiosAPI.list().catch(() => []),
      dApi.list().catch(() => []),
      groomingAPI.list().catch(() => []),
    ]).then(([kios, dokter, grooming]) => {
      setAllMitra([
        ...kios.map(k => ({ id: `kios-${k.id}`, tipe: 'Kios', nama: k.nama, foto: k.logo })),
        ...dokter.map(d => ({ id: `dokter-${d.id}`, tipe: 'Dokter', nama: d.nama, foto: d.foto })),
        ...grooming.map(g => ({ id: `grooming-${g.id}`, tipe: 'Grooming', nama: g.nama, foto: g.foto })),
      ]);
    });
  }, []);

  const getSidebarLinks = () => {
    const list = [
      { href: '/akun', icon: '🏠', label: 'Dashboard' },
      { href: '/akun/pesanan', icon: '📦', label: 'Pesanan Saya' },
      { href: '/akun/chat', icon: '💬', label: 'Chat' },
      { href: '/akun/hewan', icon: '🐾', label: 'Hewan Saya' },
    ];
    if (user?.peran !== 'owner') {
      list.push({ href: '/akun/daftar-kios', icon: '🏪', label: 'Buka Kios' });
    }
    if (user?.peran !== 'dokter' && !user?.hasDokter) {
      list.push({ href: '/akun/daftar-dokter', icon: '🏥', label: user?.dokterStatus === 'pending' ? 'Dokter (Pending)' : 'Daftar Dokter' });
    }
    if (user?.peran !== 'grooming' && !user?.hasGrooming) {
      list.push({ href: '/akun/daftar-grooming', icon: '✂️', label: user?.groomingStatus === 'pending' ? 'Grooming (Pending)' : 'Daftar Grooming' });
    }
    return list;
  };

  const send = () => {
    if (!input.trim() || !selected) return;
    const key = selected.id;
    const newMsg = { id: Date.now(), from: 'user', text: input, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => ({ ...m, [key]: [...(m[key] || []), newMsg] }));
    setInput('');
    // Simulate reply
    setTimeout(() => {
      const reply = { id: Date.now() + 1, from: 'mitra', text: `Halo! Terima kasih sudah menghubungi ${selected.nama}. Ada yang bisa kami bantu? 😊`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(m => ({ ...m, [key]: [...(m[key] || []), reply] }));
    }, 1000);
  };

  const msgs = selected ? (messages[selected.id] || []) : [];

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1, display: 'flex', gap: '1.5rem', height: 'calc(100vh - 150px)' }}>
        {/* Contact list */}
        <div style={{ width: 260, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>💬 Percakapan</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {allMitra.map(m => (
              <div key={m.id} onClick={() => setSelected(m)} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.875rem 1.25rem', cursor: 'pointer', background: selected?.id === m.id ? 'rgba(249,115,22,0.1)' : 'transparent', borderLeft: `3px solid ${selected?.id === m.id ? 'var(--primary)' : 'transparent'}`, transition: 'var(--transition)' }}>
                <img src={m.foto} alt={m.nama} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-card)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nama}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.tipe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img src={selected.foto} alt={selected.nama} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selected.nama}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>● Online</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {msgs.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem', fontSize: '0.875rem' }}>
                    Mulai percakapan dengan {selected.nama} 👋
                  </div>
                )}
                {msgs.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${msg.from === 'user' ? 'sent' : 'received'}`}>
                      {msg.text}
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="form-input" placeholder="Tulis pesan..." style={{ flex: 1 }} />
                <button onClick={send} className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem' }}>💬</div>
              <p>Pilih percakapan untuk mulai chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
