import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, kiosAPI, dokterAPI as dApi, groomingAPI } from '../../services/api';
import { Send, User } from 'lucide-react';

export default function AkunChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [allMitra, setAllMitra] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle pre-selected partner from location state
  useEffect(() => {
    if (location.state?.idMitra && location.state?.tipeMitra && !loading) {
      const existing = conversations.find(
        c => parseInt(c.idMitra) === parseInt(location.state.idMitra) && c.tipeMitra === location.state.tipeMitra
      );
      if (existing) {
        setSelected({
          id: `conv-${existing.id}`,
          idPercakapan: existing.id,
          idMitra: existing.idMitra,
          tipeMitra: existing.tipeMitra,
          nama: existing.nama,
          foto: existing.foto
        });
      } else {
        setSelected({
          id: `new-${location.state.tipeMitra}-${location.state.idMitra}`,
          idPercakapan: null,
          idMitra: location.state.idMitra,
          tipeMitra: location.state.tipeMitra,
          nama: location.state.nama,
          foto: location.state.foto
        });
      }
    }
  }, [location.state, conversations, loading]);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Load conversations list
  const loadConversations = async () => {
    try {
      const data = await chatAPI.list();
      setConversations(data || []);
    } catch (err) {
      console.error('Gagal memuat percakapan', err);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async () => {
    if (!selectedRef.current) return;
    try {
      let data = [];
      if (selectedRef.current.idPercakapan) {
        data = await chatAPI.messages({ id: selectedRef.current.idPercakapan });
      } else {
        // Conversation hasn't been created in DB yet, query by partner details
        data = await chatAPI.messages({
          idMitra: selectedRef.current.idMitra,
          tipeMitra: selectedRef.current.tipeMitra
        });
      }
      setMessages(data || []);
    } catch (err) {
      console.error('Gagal memuat pesan', err);
    }
  };

  // Load active partners (only if user is pembeli, so they can initiate a new chat)
  useEffect(() => {
    if (user?.peran === 'pembeli') {
      Promise.all([
        kiosAPI.list().catch(() => []),
        dApi.list().catch(() => []),
        groomingAPI.list().catch(() => []),
      ]).then(([kios, dokter, grooming]) => {
        setAllMitra([
          ...kios.map(k => ({ idMitra: k.id, tipeMitra: 'kios', nama: k.nama, foto: k.logo })),
          ...dokter.map(d => ({ idMitra: d.id, tipeMitra: 'dokter', nama: d.nama, foto: d.foto })),
          ...grooming.map(g => ({ idMitra: g.id, tipeMitra: 'grooming', nama: g.nama, foto: g.foto })),
        ]);
      });
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadConversations().finally(() => setLoading(false));
    }
  }, [user]);

  // Poll conversations every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll messages every 3 seconds if one is selected
  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [selected]);

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

  const send = async () => {
    if (!input.trim() || !selected) return;
    const body = {
      text: input,
      idPercakapan: selected.idPercakapan || null,
      idMitra: selected.idMitra,
      tipeMitra: selected.tipeMitra
    };
    setInput('');
    try {
      const res = await chatAPI.send(body);
      if (res.idPercakapan && !selected.idPercakapan) {
        setSelected(prev => ({ ...prev, idPercakapan: res.idPercakapan }));
      }
      await loadMessages();
      await loadConversations();
    } catch (err) {
      console.error('Gagal mengirim pesan', err);
    }
  };

  // Combine active database conversations with unused partners list (for initiating chats)
  const getDisplayList = () => {
    if (user?.peran !== 'pembeli') {
      // Mitra: only display chats that exist in database
      return conversations.map(c => ({
        id: `conv-${c.id}`,
        idPercakapan: c.id,
        idMitra: c.idMitra,
        tipeMitra: c.tipeMitra,
        nama: c.nama,
        foto: c.foto,
        subtext: c.pesanTerakhir || 'Belum ada pesan',
      }));
    }

    // Pembeli: display conversations + add potential partners that don't have active chats
    const display = conversations.map(c => ({
      id: `conv-${c.id}`,
      idPercakapan: c.id,
      idMitra: c.idMitra,
      tipeMitra: c.tipeMitra,
      nama: c.nama,
      foto: c.foto,
      subtext: c.pesanTerakhir || 'Belum ada pesan',
    }));

    // Find partners who don't have conversations yet
    const existingKeys = new Set(conversations.map(c => `${c.tipeMitra}-${c.idMitra}`));
    allMitra.forEach(m => {
      const key = `${m.tipeMitra}-${m.idMitra}`;
      if (!existingKeys.has(key)) {
        display.push({
          id: `new-${key}`,
          idPercakapan: null,
          idMitra: m.idMitra,
          tipeMitra: m.tipeMitra,
          nama: m.nama,
          foto: m.foto,
          subtext: `Mulai chat (${m.tipeMitra})`,
        });
      }
    });

    return display;
  };

  const listToRender = getDisplayList();

  return (
    <div className="dashboard-layout" style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1, display: 'flex', gap: '1.5rem', height: 'calc(100vh - 150px)' }}>
        {/* Contact list */}
        <div style={{ width: 280, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>💬 Percakapan</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Memuat...</div>
            ) : listToRender.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada percakapan aktif</div>
            ) : (
              listToRender.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setSelected(m)} 
                  style={{ 
                    display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.875rem 1.25rem', cursor: 'pointer', 
                    background: (selected?.idMitra === m.idMitra && selected?.tipeMitra === m.tipeMitra) ? 'rgba(249,115,22,0.1)' : 'transparent', 
                    borderLeft: `3px solid ${(selected?.idMitra === m.idMitra && selected?.tipeMitra === m.tipeMitra) ? 'var(--primary)' : 'transparent'}`, 
                    transition: 'var(--transition)' 
                  }}
                >
                  {m.foto ? (
                    <img src={m.foto.startsWith('http') || m.foto.startsWith('/uploads') ? (m.foto.startsWith('http') ? m.foto : `${window.location.origin}${m.foto}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.nama}`} alt={m.nama} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-card)' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justify: 'center' }}><User size={18} /></div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{m.nama}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subtext}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {selected.foto ? (
                  <img src={selected.foto.startsWith('http') || selected.foto.startsWith('/uploads') ? (selected.foto.startsWith('http') ? selected.foto : `${window.location.origin}${selected.foto}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.nama}`} alt={selected.nama} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justify: 'center' }}><User size={16} /></div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selected.nama}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>● Terhubung</div>
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem', fontSize: '0.875rem' }}>
                    Mulai percakapan dengan {selected.nama} 👋
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${msg.from === 'user' ? 'sent' : 'received'}`}>
                      {msg.text}
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send()} 
                  className="form-input" 
                  placeholder="Tulis pesan..." 
                  style={{ flex: 1 }} 
                />
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
