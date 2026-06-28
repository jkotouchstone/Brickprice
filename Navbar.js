import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <nav style={{
      background: '#1C1C1C',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: '24px', height: '56px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px' }}>🧱</span>
          <span style={{
            fontWeight: '600', fontSize: '17px', color: '#FFD700',
            letterSpacing: '-0.3px'
          }}>BrickPrice</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '480px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)',
              fontSize: '15px', pointerEvents: 'none'
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search set name or number..."
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </form>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/browse?sort=cpp">Best Value</NavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: 'rgba(255,255,255,0.7)', fontSize: '14px',
      padding: '6px 12px', borderRadius: '6px',
      transition: 'all 0.15s',
      ':hover': { color: 'white', background: 'rgba(255,255,255,0.1)' }
    }}
      onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.7)'; e.target.style.background = 'transparent'; }}
    >
      {children}
    </Link>
  );
}
