import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, formatCPP, formatPrice, getCPPColor, getCPPLabel, getThemeEmoji } from '../hooks/api';

function PriceRow({ p, piecCount }) {
  const cpp = pieceCount && p.price ? (p.price / pieceCount * 100).toFixed(1) : null;
  const isBest = p._isBest;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px',
      background: isBest ? '#FFFBE6' : 'white',
      border: `1px solid ${isBest ? '#FFD700' : 'var(--gray-200)'}`,
      borderRadius: '10px',
      marginBottom: '8px',
    }}>
      <div style={{ fontSize: '24px', flexShrink: 0 }}>
        {storeEmoji(p.retailer)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>
          {p.retailer}
          {isBest && <span style={{
            marginLeft: '8px', background: '#FFD700', color: '#1C1C1C',
            fontSize: '10px', padding: '2px 7px', borderRadius: '99px', fontWeight: '600'
          }}>Best price</span>}
        </div>
        {cpp && <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{cpp}¢ per piece</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '22px', fontWeight: '600' }}>{formatPrice(p.price)}</div>
        {p.available ? (
          <div style={{ fontSize: '12px', color: '#0F6E56' }}>✓ In stock</div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Out of stock</div>
        )}
      </div>
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
          background: '#1C1C1C', color: isBest ? '#FFD700' : 'white',
          padding: '8px 16px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          View deal →
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

let pieceCount = 0; // module-level for PriceRow access

export default function SetDetail() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/sets/${id}`)
      .then(data => { setSet(data); pieceCount = data.piece_count; setLoading(false); })
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

  const bestPrice = set.prices?.[0];
  const cpp = bestPrice && set.piece_count ? bestPrice.price / set.piece_count * 100 : null;
  const label = getCPPLabel(cpp);
  const discount = set.msrp && bestPrice ? Math.round((1 - bestPrice.price / set.msrp) * 100) : 0;
  const emoji = getThemeEmoji(set.theme);
  const pricesWithBest = set.prices?.map((p, i) => ({ ...p, _isBest: i === 0 })) || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--gray-400)' }}>Home</Link>
        {' / '}
        <Link to="/browse" style={{ color: 'var(--gray-400)' }}>Browse</Link>
        {' / '}
        <Link to={`/browse?theme=${encodeURIComponent(set.theme)}`} style={{ color: 'var(--gray-400)' }}>{set.theme}</Link>
        {' / '}
        <span style={{ color: 'var(--black)' }}>{set.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        display: 'grid', gridTemplateColumns: '300px 1fr',
        gap: '32px', marginBottom: '40px',
        background: 'white', border: '1px solid var(--gray-200)',
        borderRadius: '20px', padding: '32px', alignItems: 'start'
      }}>

        {/* Image */}
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

        {/* Info */}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Pieces', value: set.piece_count?.toLocaleString() },
              { label: 'MSRP', value: formatPrice(set.msrp) },
              { label: 'Best price', value: formatPrice(bestPrice?.price) },
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

          {/* CPP hero */}
          <div style={{
            background: '#1C1C1C', borderRadius: '14px', padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '42px', fontWeight: '700', color: '#FFD700', lineHeight: '1' }}>
                {formatCPP(cpp)}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                cost per piece
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {label && (
                <div style={{
                  background: label.bg, color: label.color,
                  fontSize: '14px', fontWeight: '600',
                  padding: '8px 16px', borderRadius: '10px',
                  display: 'inline-block', marginBottom: '6px'
                }}>{label.text}</div>
              )}
              {discount > 0 && (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  {discount}% off MSRP at {bestPrice?.retailer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prices + Chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* All retailer prices */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Prices across stores
          </h2>
          {pricesWithBest.length === 0 ? (
            <p style={{ color: 'var(--gray-400)' }}>No current prices tracked for this set.</p>
          ) : (
            pricesWithBest.map((p, i) => (
              <PriceRow key={i} p={p} pieceCount={set.piece_count} />
            ))
          )}
        </div>

        {/* Price history chart */}
        <div style={{
          background: 'white', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)', padding: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            📈 30-day price history
          </h2>
          {set.history && set.history.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={set.history} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F1EE" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#A8A7A2' }}
                  tickFormatter={d => d?.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#A8A7A2' }}
                  tickFormatter={v => `$${v}`}
                  width={50}
                />
                <Tooltip
                  formatter={(v) => [`$${v?.toFixed(2)}`, 'Best price']}
                  labelFormatter={l => `Date: ${l}`}
                  contentStyle={{ fontSize: '13px', borderRadius: '8px', border: '1px solid #E4E3DF' }}
                />
                <Line
                  type="monotone" dataKey="min_price"
                  stroke="#FFD700" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: '#FFD700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
              Price history builds over time as we track this set daily.
            </div>
          )}

          {/* Price stats */}
          {set.history && set.history.length > 0 && (() => {
            const prices = set.history.map(h => h.min_price).filter(Boolean);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const current = prices[prices.length - 1];
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
                {[
                  { label: '30-day low', value: formatPrice(min), color: '#0F6E56' },
                  { label: '30-day high', value: formatPrice(max), color: '#993C1D' },
                  { label: 'Current', value: formatPrice(current), color: 'var(--black)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--gray-50)', borderRadius: '8px', padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
