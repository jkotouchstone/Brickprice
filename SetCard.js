import React from 'react';
import { Link } from 'react-router-dom';
import { formatCPP, formatPrice, getCPPColor, getCPPLabel, getThemeEmoji } from '../hooks/api';

export default function SetCard({ set }) {
  const label = getCPPLabel(set.cpp);
  const emoji = getThemeEmoji(set.theme);
  const discount = set.msrp && set.best_price
    ? Math.round((1 - set.best_price / set.msrp) * 100)
    : 0;

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
        {/* Image / Emoji */}
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

          {discount >= 10 && (
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: '#FFD700', color: '#1C1C1C',
              fontSize: '11px', fontWeight: '600',
              padding: '3px 7px', borderRadius: '99px'
            }}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Info */}
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

        {/* Price */}
        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{
                fontSize: '22px', fontWeight: '600',
                color: getCPPColor(set.cpp), lineHeight: '1'
              }}>
                {formatCPP(set.cpp)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>per piece</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>{formatPrice(set.best_price)}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                at {set.best_retailer || '—'}
              </div>
            </div>
          </div>

          {label && (
            <div style={{
              marginTop: '8px',
              background: label.bg, color: label.color,
              fontSize: '11px', fontWeight: '500',
              padding: '3px 8px', borderRadius: '99px',
              display: 'inline-block'
            }}>
              {label.text}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
