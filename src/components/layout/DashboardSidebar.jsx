import { Link, useLocation } from 'react-router-dom';

export default function DashboardSidebar({ links, title, color = 'var(--primary)' }) {
  const { pathname } = useLocation();
  return (
    <div style={{
      width: 250,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      position: 'sticky',
      top: 90,
      flexShrink: 0,
      height: 'fit-content',
    }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Panel</p>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color }}>{title}</h3>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map(link => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} to={link.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              background: active ? `${color}15` : 'transparent',
              border: `1px solid ${active ? color + '30' : 'transparent'}`,
              color: active ? color : 'var(--text-secondary)',
              fontWeight: active ? 700 : 500,
              fontSize: '0.875rem',
              transition: 'var(--transition)',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: '1rem' }}>{link.icon}</span>
              {link.label}
              {link.badge && (
                <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', fontWeight: 700, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
