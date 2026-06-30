import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getThemeEmoji } from '../hooks/api';

export default function SetCard({ set }) {
  const emoji = getThemeEmoji(set.theme);

  return (
    <Link to={`/set/${set.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#FFD700';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,215,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--gray-200)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          width: '100%', aspectRatio: '1',
          background: 'var(--gray-100)',
          borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '44px', position: 'relative', overflow: 'hidden'
        }}>
          {set.image_url ? (
            <img
              src={set.image_url}
              alt={set.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <span style={{ display: set.image_url ? 'none' : 'flex' }}>{emoji}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: '2px' }}>
            #{set.set_number} · {set.theme}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.3', color: 'var(--black)' }}>
            {set.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
            {set.piece_count?.toLocaleString()} pieces
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>MSRP</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{formatPrice(set.msrp)}</div>
            </div>
            <div style={{
              background: '#1C1C1C', color: '#FFD700',
              fontSize: '12px', fontWeight: '500',
              padding: '7px 12px', borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}>
              View prices →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
