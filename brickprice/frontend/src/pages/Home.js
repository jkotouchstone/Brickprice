import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, formatCPP, formatPrice, getCPPColor, getThemeEmoji } from '../hooks/api';
import SetCard from '../components/SetCard';

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: '28px', fontWeight: '600', color: '#FFD700', lineHeight: '1' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function AlertItem({ alert }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0', borderBottom: '1px solid var(--gray-100)'
    }}>
      <div style={{ fontSize: '24px', flexShrink: 0 }}>{getThemeEmoji(alert.theme)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {alert.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
          {alert.retailer} · #{alert.set_number}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: getCPPColor(alert.cpp) }}>
          {formatCPP(alert.cpp)}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{formatPrice(alert.price)}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    apiFetch('/api/stats').then(setStats).catch(() => {});
    apiFetch('/api/deals?limit=8').then(setDeals).catch(() => {});
    apiFetch('/api/alerts?limit=6').then(setAlerts).catch(() => {});
    apiFetch('/api/themes').then(t => setThemes(t.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>

      {/* Hero */}
      <div style={{
        background: '#1C1C1C',
        borderRadius: '20px',
        padding: '48px 40px',
        margin: '28px 0 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          fontSize: '200px', opacity: 0.04, lineHeight: '1',
          userSelect: 'none', pointerEvents: 'none'
        }}>🧱</div>

        <div style={{
          fontSize: '11px', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#FFD700',
          fontWeight: '500', marginBottom: '12px'
        }}>
          🟡 Live price tracker
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: '600', color: 'white',
          lineHeight: '1.15', marginBottom: '12px',
          letterSpacing: '-0.5px'
        }}>
          Best <span style={{ color: '#FFD700' }}>cost-per-piece</span><br />
          across every store
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px', maxWidth: '480px' }}>
          We track {stats?.total_sets || '4,800'}+ LEGO sets daily across Amazon, Walmart, Target, Best Buy, and LEGO.com — so you always know who has the best deal.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <Link to="/browse" style={{
            background: '#FFD700', color: '#1C1C1C',
            padding: '12px 24px', borderRadius: '10px',
            fontWeight: '600', fontSize: '15px', display: 'inline-block'
          }}>
            Browse all sets →
          </Link>
          <Link to="/browse?sort=cpp" style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '12px 24px', borderRadius: '10px',
            fontWeight: '500', fontSize: '15px', display: 'inline-block'
          }}>
            Best value sets
          </Link>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <StatCard value={`${(stats.avg_cpp * 100).toFixed(1)}¢`} label="Avg ¢/piece today" />
            <StatCard value={stats.new_lows_week} label="New lows this week" />
            <StatCard value={stats.stores_tracked} label="Stores tracked" />
            <StatCard value={stats.total_sets?.toLocaleString()} label="Sets tracked" />
          </div>
        )}
      </div>

      {/* Theme quick-filters */}
      {themes.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '14px' }}>Browse by theme</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {themes.map(t => (
              <Link key={t.theme} to={`/browse?theme=${encodeURIComponent(t.theme)}`}>
                <div style={{
                  background: 'white', border: '1px solid var(--gray-200)',
                  borderRadius: '99px', padding: '8px 16px',
                  fontSize: '13px', fontWeight: '500', color: 'var(--black)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1C1C1C'; e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.borderColor = '#1C1C1C'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                >
                  <span>{getThemeEmoji(t.theme)}</span>
                  <span>{t.theme}</span>
                  <span style={{ color: 'var(--gray-400)', fontWeight: '400', fontSize: '11px' }}>{t.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main content: deals + alerts sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Deals grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Today's top deals</h2>
            <Link to="/browse?sort=cpp" style={{ fontSize: '13px', color: 'var(--gray-400)' }}>See all →</Link>
          </div>

          {deals.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
              <div>Loading deals...</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {deals.map(set => (
                <SetCard key={set.id} set={set} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Recent updates */}
          <div style={{
            background: 'white', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)', padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#0F6E56', animation: 'pulse 2s infinite',
                display: 'inline-block'
              }}></span>
              <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Recent price drops</h3>
            </div>
            {alerts.slice(0, 6).map((a, i) => (
              <AlertItem key={i} alert={a} />
            ))}
            {alerts.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: '13px' }}>No recent drops. Check back soon.</p>
            )}
          </div>

          {/* Value guide */}
          <div style={{
            background: 'white', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-lg)', padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>💡 Value guide</h3>
            {[
              { range: 'Under 5¢', label: 'Exceptional', color: '#0F6E56', bg: '#E1F5EE' },
              { range: '5–8¢', label: 'Good value', color: '#0F6E56', bg: '#E1F5EE' },
              { range: '8–12¢', label: 'Average', color: '#BA7517', bg: '#FEF5E0' },
              { range: 'Over 12¢', label: 'Wait for a sale', color: '#993C1D', bg: '#FAECE7' },
            ].map(v => (
              <div key={v.range} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '8px 0',
                borderBottom: '1px solid var(--gray-100)',
                fontSize: '13px'
              }}>
                <span style={{ color: 'var(--gray-600)', fontFamily: 'monospace' }}>{v.range}/piece</span>
                <span style={{
                  background: v.bg, color: v.color,
                  padding: '2px 8px', borderRadius: '99px',
                  fontSize: '11px', fontWeight: '500'
                }}>{v.label}</span>
              </div>
            ))}
          </div>

          {/* Stores */}
          <div style={{
            background: '#1C1C1C', borderRadius: 'var(--radius-lg)', padding: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
              Stores we track
            </h3>
            {['🛒 Amazon', '🏪 Walmart', '🎯 Target', '🧱 LEGO.com', '🛍️ Best Buy'].map(s => (
              <div key={s} style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.6)',
                padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>{s}</div>
            ))}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
              Updated every 24 hours. Enable API keys for real-time pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
