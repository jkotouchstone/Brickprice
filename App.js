import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SetDetail from './pages/SetDetail';
import Browse from './pages/Browse';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/set/:id" element={<SetDetail />} />
      </Routes>
      <footer style={{
        textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)',
        fontSize: '13px', borderTop: '1px solid var(--gray-200)', marginTop: '60px'
      }}>
        <p>BrickPrice tracks prices daily across Amazon, Walmart, Target, Best Buy & LEGO.com</p>
        <p style={{ marginTop: '6px' }}>
          Not affiliated with LEGO Group. Prices update every 24 hours. 
          Some links may be affiliate links.
        </p>
      </footer>
    </div>
  );
}
