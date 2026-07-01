import { useState } from 'react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const defaultForm = { nama: '', jenis: 'kucing', ras: '', kelamin: 'Jantan', lahir: '', berat: '', catatan: '' };

export default function AkunHewan() {
  const { user } = useAuth();
  const [hewanList, setHewanList] = useState(JSON.parse(localStorage.getItem('petplace_hewan') || '[]'));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);

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

  const save = () => {
    if (!form.nama || !form.jenis) return;
    const newList = [...hewanList, { id: Date.now(), ...form }];
    setHewanList(newList);
    localStorage.setItem('petplace_hewan', JSON.stringify(newList));
    setShowForm(false);
    setForm(defaultForm);
  };

  const hapus = (id) => {
    const newList = hewanList.filter(h => h.id !== id);
    setHewanList(newList);
    localStorage.setItem('petplace_hewan', JSON.stringify(newList));
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <DashboardSidebar links={getSidebarLinks()} title="Akun Saya" />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>🐾 Hewan Peliharaan Saya</h2>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Tambah Hewan
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <h4 style={{ marginBottom: '1rem' }}>Data Hewan Baru</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {[
                { key: 'nama', label: 'Nama Hewan', placeholder: 'Contoh: Mochi', type: 'text' },
                { key: 'ras', label: 'Ras', placeholder: 'Contoh: Persian, Shih Tzu', type: 'text' },
                { key: 'lahir', label: 'Tanggal Lahir', type: 'date' },
                { key: 'berat', label: 'Berat (kg)', placeholder: '3.5', type: 'number' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="form-input" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Jenis Hewan</label>
                <select value={form.jenis} onChange={e => setForm(p => ({ ...p, jenis: e.target.value }))} className="form-input">
                  <option value="kucing">🐱 Kucing</option>
                  <option value="anjing">🐶 Anjing</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select value={form.kelamin} onChange={e => setForm(p => ({ ...p, kelamin: e.target.value }))} className="form-input">
                  <option value="Jantan">♂️ Jantan</option>
                  <option value="Betina">♀️ Betina</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Catatan Kesehatan</label>
                <textarea value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))} className="form-input" placeholder="Alergi, kondisi khusus, dll..." rows={2} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={save} className="btn btn-primary">Simpan</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">Batal</button>
            </div>
          </div>
        )}

        {hewanList.length === 0 && !showForm ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
            <h3>Belum ada data hewan</h3>
            <p style={{ marginBottom: '1rem' }}>Tambahkan data hewan peliharaan Anda</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm"><Plus size={14} /> Tambah Hewan</button>
          </div>
        ) : (
          <div className="grid-3">
            {hewanList.map(h => (
              <div key={h.id} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>{h.jenis === 'kucing' ? '🐱' : '🐶'}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{h.nama}</h3>
                <span className={`tag tag-${h.jenis}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{h.jenis === 'kucing' ? '🐱 Kucing' : '🐶 Anjing'}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {h.ras && <p>Ras: {h.ras}</p>}
                  {h.kelamin && <p>Kelamin: {h.kelamin}</p>}
                  {h.berat && <p>Berat: {h.berat} kg</p>}
                  {h.catatan && <p style={{ marginTop: '0.35rem', fontStyle: 'italic' }}>"{h.catatan}"</p>}
                </div>
                <button onClick={() => hapus(h.id)} style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', color: '#F87171', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '1rem auto 0' }}>
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
