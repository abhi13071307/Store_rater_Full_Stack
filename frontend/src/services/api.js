// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeader() } });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
