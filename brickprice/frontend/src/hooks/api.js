const API_BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function formatCPP(cpp) {
  if (!cpp) return '—';
  return `${cpp.toFixed(1)}¢`;
}

export function formatPrice(price) {
  if (!price) return '—';
  return `$${price.toFixed(2)}`;
}

export function getCPPColor(cpp) {
  if (!cpp) return '#6B6A66';
  if (cpp < 5) return '#0F6E56';
  if (cpp < 8) return '#0F6E56';
  if (cpp < 12) return '#BA7517';
  return '#993C1D';
}

export function getCPPLabel(cpp) {
  if (!cpp) return null;
  if (cpp < 5) return { text: 'Exceptional', color: '#0F6E56', bg: '#E1F5EE' };
  if (cpp < 8) return { text: 'Good value', color: '#0F6E56', bg: '#E1F5EE' };
  if (cpp < 12) return { text: 'Average', color: '#BA7517', bg: '#FEF5E0' };
  return { text: 'Wait for sale', color: '#993C1D', bg: '#FAECE7' };
}

export function getThemeEmoji(theme) {
  const map = {
    'Star Wars': '🚀', 'Harry Potter': '⚡', 'Icons': '🏛️',
    'Technic': '⚙️', 'City': '🏙️', 'Botanical': '🌸',
    'Ideas': '💡', 'Marvel': '🕷️', 'Architecture': '🏗️',
    'Creator': '🦅', 'Speed Champions': '🏎️', 'Minecraft': '⛏️',
    'Ninjago': '🥷', 'Friends': '🎀', 'Classic': '🧱',
  };
  return map[theme] || '🧩';
}
