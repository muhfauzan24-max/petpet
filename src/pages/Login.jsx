import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginWithCredentials(form.email, form.password);
      const routes = { admin: '/admin', owner: '/kios', dokter: '/portal-dokter', grooming: '/portal-grooming', pembeli: '/' };
      navigate(routes[user.peran] || '/');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithCredentials(email, password);
      const routes = { admin: '/admin', owner: '/kios', dokter: '/portal-dokter', grooming: '/portal-grooming', pembeli: '/' };
      navigate(routes[user.peran] || '/');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at bottom right,rgba(139,92,246,0.08) 0%,transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,var(--primary),#F59E0B)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: 'var(--shadow-glow)' }}>🐾</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem' }}>Pet<span style={{ color: 'var(--primary)' }}>Place</span></span>
          </Link>
          <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Selamat Datang Kembali</h2>
          <p>Masuk untuk melanjutkan</p>
        </div>

        <div className="card-glass" style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="contoh@email.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Password
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>Lupa password?</a>
                </label>
                <div style={{ position: 'relative' }}>
                  <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="form-input" placeholder="Masukkan password" style={{ paddingRight: '2.5rem' }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  Memverifikasi...
                </span>
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Belum punya akun? <Link to="/daftar" style={{ color: 'var(--primary)', fontWeight: 700 }}>Daftar gratis</Link>
          </p>
        </div>

        {/* Admin quick login */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.75rem' }}>⚡ Login Admin (untuk testing):</p>
          <button
            type="button"
            onClick={() => quickLogin('admin@petplace.id', 'admin123')}
            disabled={loading}
            style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.color = 'var(--secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >🛡️ Login sebagai Admin</button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            admin@petplace.id / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
