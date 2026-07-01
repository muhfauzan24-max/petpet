import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [params] = useSearchParams();
  const peranInit = params.get('peran') || 'pembeli';
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ nama: '', email: '', password: '', konfirmasi: '', telepon: '', peran: peranInit });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.konfirmasi) { setError('Password tidak cocok'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      await register(form);
      const routes = { admin: '/admin', owner: '/kios', dokter: '/portal-dokter', grooming: '/portal-grooming', pembeli: '/' };
      navigate(routes[form.peran] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const peranOptions = [
    { value: 'pembeli', label: '🛒 Pembeli', desc: 'Beli produk dan pesan layanan' },
    { value: 'dokter', label: '🏥 Dokter Hewan', desc: 'Daftarkan praktik Anda' },
    { value: 'grooming', label: '✂️ Groomer', desc: 'Daftarkan salon grooming' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at top left,rgba(249,115,22,0.08) 0%,transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,var(--primary),#F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: 'var(--shadow-glow)' }}>🐾</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem' }}>Pet<span style={{ color: 'var(--primary)' }}>Place</span></span>
          </Link>
          <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Buat Akun Baru</h2>
          <p>Bergabung dengan komunitas pecinta hewan di Sulawesi Selatan</p>
        </div>

        <div className="card-glass" style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          {/* Pilih peran */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Saya ingin mendaftar sebagai:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
              {peranOptions.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(f => ({ ...f, peran: opt.value }))}
                  style={{
                    padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: form.peran === opt.value ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.peran === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                    color: form.peran === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'var(--transition)', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{opt.label.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{opt.label.slice(opt.label.indexOf(' ') + 1)}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input required value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="form-input" placeholder="Masukkan nama lengkap" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="contoh@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">No. Telepon (opsional)</label>
                <input value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))} className="form-input" placeholder="08xx-xxxx-xxxx" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" placeholder="Min. 6 karakter" style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input required type="password" value={form.konfirmasi} onChange={e => setForm(f => ({ ...f, konfirmasi: e.target.value }))} className="form-input" placeholder="Ulangi password" />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Dengan mendaftar, Anda menyetujui <a href="#" style={{ color: 'var(--primary)' }}>Syarat & Ketentuan</a> dan <a href="#" style={{ color: 'var(--primary)' }}>Kebijakan Privasi</a> PetPlace.
            </p>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                  Mendaftarkan...
                </span>
              ) : (
                <>Daftar Sekarang <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Sudah punya akun? <Link to="/masuk" style={{ color: 'var(--primary)', fontWeight: 700 }}>Masuk di sini</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 'var(--radius-lg)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>🔐 Akun Demo:</p>
          <p>Admin: admin@petplace.id / admin123</p>
          <p>Owner: owner@petplace.id / owner123</p>
          <p>Dokter: dokter@petplace.id / dokter123</p>
          <p>Grooming: grooming@petplace.id / grooming123</p>
        </div>
      </div>
    </div>
  );
}
