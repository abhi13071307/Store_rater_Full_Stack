import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('User@1234');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const json = await res.json();
      localStorage.setItem('token', json.token);
      localStorage.setItem('user', JSON.stringify(json.user));
      onLogin(json.user);
    } catch (err) {
      setError(err.message || 'Login error');
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
        <input value={password} type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="password" />
        <button type="submit">Login</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
