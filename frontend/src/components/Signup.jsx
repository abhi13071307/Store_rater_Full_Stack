// frontend/src/components/Signup.jsx
import { useState } from 'react';

export default function Signup({ onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('NORMAL_USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address, password, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Signup failed');

      if (json.token) {
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.user));
      }
      if (onSignup) onSignup(json.user);
    } catch (err) {
      setError(err.message || 'Signup error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
      <h3>Sign up</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name (20-60 chars)</label><br/>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Address (optional)</label><br/>
          <input value={address} onChange={e=>setAddress(e.target.value)} />
        </div>
        <div>
          <label>Password (8-16, 1 uppercase, 1 special)</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Register as:</label><br/>
          <label><input type="radio" name="role" value="NORMAL_USER" checked={role==='NORMAL_USER'} onChange={e=>setRole(e.target.value)} /> Normal User</label><br/>
          <label><input type="radio" name="role" value="STORE_OWNER" checked={role==='STORE_OWNER'} onChange={e=>setRole(e.target.value)} /> Store Owner</label><br/>
          <label><input type="radio" name="role" value="SYSTEM_ADMIN" checked={role==='SYSTEM_ADMIN'} onChange={e=>setRole(e.target.value)} /> Admin</label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button>
        </div>

        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
