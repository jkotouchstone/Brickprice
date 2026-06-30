import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, formatPrice, getThemeEmoji } from '../hooks/api';

function StoreRow({ p }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px',
      background: 'white',
      border: '1px solid var(--gray-200)',
      borderRadius: '10px',
      marginBottom: '8px',
    }}>
      <div style={{ fontSize: '24px', flexShrink: 0 }}>
        {storeEmoji(p.retailer)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>{p.retailer}</div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
          Prices vary — check the retailer for current pricing
        </div>
      </div>
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
          background: '#1C1C1C', color: 'white',
          padding: '8px 16px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
          flexShrink: 0, textDecoration: 'none'
        }}>
          Check price →
        </a>
      )}
    </div>
  );
}

function storeEmoji(retailer) {
  const map = {
    'Amazon': '🛒', 'Walmart': '🏪', 'Target': '🎯',
    'LEGO.com': '🧱', 'Best Buy': '🛍️'
  };
  return map[retailer] || '🏬';
}

export default function SetDetail() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/sets/${id}`)
      .then(data => { setSet(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--gray-400)' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
      <p>Loading set...</p>
    </div>
  );

  if (!set) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <p>Set not found. <Link to="/browse">← Browse all sets</Link></p>
    </div>
  );

  const emoji = getThemeEmoji(set.theme);

  // Dedupe retailers — only show one row per retailer
  const uniqueRetailers = [];
  const seen = new Set();
  (set.prices || []).forEach(p => {
    if (!seen.has(p.retailer)) {
      seen.add(p.retailer);
      uniqueRetailers.push(p);
    }
  });

  const costPerPiece = set.msrp && set.piece_count
    ? (set.msrp / set.piece_count * 100).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>

      <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--gray-400)' }}>Home</Link>
        {' / '}
        <Link to="/browse" style={{ color: 'var(--gray-400)' }}>Browse</Link>
        {' / '}
        <Link to={`/browse?theme=${encodeURIComponent(set.theme)}`} style={{ color: 'var(--gray-400)' }}>{set.theme}</Link>
        {' / '}
        <span style={{ color: 'var(--black)' }}>{set.name}</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '300px 1fr',
        gap: '32px', marginBottom: '40px',
        background: 'white', border: '1px solid var(--gray-200)',
        borderRadius: '20px', padding: '32px', alignItems: 'start'
      }}>

        <div style={{
          background: 'var(--gray-100)', borderRadius: '14px',
          aspectRatio: '1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '80px', overflow: 'hidden'
        }}>
          {set.image_url ? (
            <img src={set.image_url} alt={set.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : emoji}
        </div>

        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--gray-100)', color: 'var(--gray-600)',
              fontSize: '12px', padding: '3px 10px', borderRadius: '99px', fontFamily: 'monospace'
            }}>
              #{set.set_number}
            </span>
            <span style={{
              background: '#1C1C1C', color: '#FFD700',
              fontSize: '12px', padding: '3px 10px', borderRadius: '99px', fontWeight: '500'
            }}>
              {emoji} {set.theme}
            </span>
            {set.year && (
              <span style={{
                background: 'var(--gray-100)', color: 'var(--gray-600)',
                fontSize: '12px', padding: '3px 10px', borderRadius: '99px'
              }}>
                {set.year}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '600', lineHeight: '1.2', marginBottom: '16px' }}>
            {set.name}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Pieces', value: set.piece_count?.toLocaleString() },
              { label: 'MSRP', value: formatPrice(set.msrp) },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--gray-50)', borderRadius: '10px', padding: '12px 14px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{stat.value || '—'}</div>
              </div>
            ))}
          </div>

          {costPerPiece && (
            <div style={{
              background: '#1C1C1C', borderRadius: '14px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#FFD700', lineHeight: '1' }}>
                  {costPerPiece}¢
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  cost per piece at MSRP
                </div>
              </div>
              <div style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                Actual prices vary by retailer and change daily — check current pricing below.
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>
          Where to buy
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '16px' }}>
          We link directly to each retailer so you can see live, accurate pricing.
        </p>
        {uniqueRetailers.length === 0 ? (
          <p style={{ color: 'var(--gray-400)' }}>No retailer links available for this set yet.</p>
        ) : (
          uniqueRetailers.map((p, i) => (
            <StoreRow key={i} p={p} />
          ))
        )}
      </div>
    </div>
  );
}
