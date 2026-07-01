import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, size = 16, showNumber = true, totalUlasan = null, interactive = false, onRate = null }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i}
            onClick={() => interactive && onRate && onRate(i)}
            style={{ cursor: interactive ? 'pointer' : 'default', transition: 'var(--transition)', transform: interactive ? 'scale(1.1)' : 'none' }}
          >
            <Star
              size={size}
              fill={i <= Math.round(rating) ? '#FCD34D' : 'transparent'}
              stroke={i <= Math.round(rating) ? '#FCD34D' : 'var(--text-muted)'}
            />
          </span>
        ))}
      </div>
      {showNumber && (
        <span style={{ fontSize: size * 0.8, fontWeight: 700, color: '#FCD34D' }}>{Number(rating).toFixed(1)}</span>
      )}
      {totalUlasan !== null && (
        <span style={{ fontSize: size * 0.75, color: 'var(--text-muted)' }}>({totalUlasan})</span>
      )}
    </div>
  );
}
