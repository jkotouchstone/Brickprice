import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, formatCPP, formatPrice, getCPPColor, getCPPLabel, getThemeEmoji } from '../hooks/api';
import SetCard from '../components/SetCard';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sets, setSets] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  const theme = searchParams.get('theme') || '';
  const sort = searchParams.get('sort') || 'cpp';
  const search = searchParams.get('search') || '';

  const loadSets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (theme) params.set('theme', theme);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    params.set('limit', '60');

    apiFetch(`/api/sets?${params}`)
      .then(data => { setSets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [theme, sort, search]);

  useEffect(() => { loadSets(); }, [loadSets]);
  useEffect(() => { apiFetch('/api/themes').then(setThemes).catch(() => {}); }, []);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '600', marginBottom: '6px' }}>
          {theme ? `${getThemeEmoji(theme)} ${theme}` : search ? `Results for "${search}"` : 'All LEGO sets'}
        </h1>
        <p style={{ color: 'var(--gray-400)', fontSize: '14px' }}>
          {sets.length} sets · sorted by {sort === 'cpp' ? 'best value (¢/piece)' : sort}
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'white', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-lg)', padding: '16px',
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        alignItems: 'center', marginBottom: '24px'
      }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>🔍</span>
          <input
            value={search}
            onChange={e => setParam('search', e.target.value)}
            placeholder="Name or set number..."
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              border: '1px solid var(--gray-200)', borderRadius: '8px',
              fontSize: '14px', outline: 'none'
            }}
          />
        </div>

        {/* Theme filter */}
        <select
          value={theme}
          onChange={e => setParam('theme', e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--gray-200)',
            borderRadius: '8px', fontSize: '13px', background: 'white',
            cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="">All themes</option>
          {themes.map(t => (
            <option key={t.theme} value={t.theme}>{getThemeEmoji(t.theme)} {t.theme} ({t.count})</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setParam('sort', e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid var(--gray-200)',
            borderRadius: '8px', fontSize: '13px', background: 'white',
            cursor: 'pointer', outline: 'none'
          }}
        >
          <option value="cpp">Best value (¢/piece)</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="pieces">Most pieces</option>
          <option value="name">Name A–Z</option>
        </select>

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
          {['grid', 'table'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 14px', fontSize: '13px', border: 'none',
              background: view === v ? '#1C1C1C' : 'white',
              color: view === v ? '#FFD700' : 'var(--gray-600)',
              cursor: 'pointer'
            }}>
              {v === 'grid' ? '⊞ Grid' : '☰ Table'}
            </button>
          ))}
        </div>

        {(theme || search) && (
          <button onClick={() => setSearchParams({})} style={{
            padding: '8px 12px', fontSize: '13px',
            border: '1px solid var(--gray-200)', borderRadius: '8px',
            background: 'white', color: 'var(--gray-600)', cursor: 'pointer'
          }}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p>Loading sets...</p>
        </div>
      )}

      {/* Grid view */}
      {!loading && view === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {sets.map(set => <SetCard key={set.id} set={set} />)}
        </div>
      )}

      {/* Table view */}
      {!loading && view === 'table' && (
        <div style={{
          background: 'white', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {['Set', 'Theme', 'Pieces', 'Best ¢/pc', 'Best store', 'Price', 'MSRP'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '500',
                    color: 'var(--gray-400)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', borderBottom: '1px solid var(--gray-200)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sets.map((set, i) => {
                const label = getCPPLabel(set.cpp);
                return (
                  <tr key={set.id}
                    onClick={() => window.location.href = `/set/${set.id}`}
                    style={{
                      borderBottom: i < sets.length - 1 ? '1px solid var(--gray-100)' : 'none',
                      cursor: 'pointer', transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '500' }}>{set.name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-400)' }}>#{set.set_number}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--gray-600)' }}>
                      {getThemeEmoji(set.theme)} {set.theme}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--gray-600)' }}>
                      {set.piece_count?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: '600', color: getCPPColor(set.cpp), fontSize: '15px' }}>
                        {formatCPP(set.cpp)}
                      </span>
                      {label && (
                        <div style={{
                          background: label.bg, color: label.color,
                          fontSize: '10px', fontWeight: '500',
                          padding: '2px 6px', borderRadius: '99px',
                          display: 'inline-block', marginLeft: '6px'
                        }}>{label.text}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--gray-600)' }}>
                      {set.best_retailer || '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '500' }}>
                      {formatPrice(set.best_price)}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--gray-400)', textDecoration: set.best_price < set.msrp ? 'line-through' : 'none' }}>
                      {formatPrice(set.msrp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && sets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧱</div>
          <p style={{ fontWeight: '500', color: 'var(--black)', marginBottom: '6px' }}>No sets found</p>
          <p>Try a different search or clear your filters</p>
        </div>
      )}
    </div>
  );
}
