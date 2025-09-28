// frontend/src/components/Profile.jsx
import { useState } from 'react';

export default function Profile({ currentUser, onLogout }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return <div>Please login to view profile.</div>;

  async function handleChange(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/user/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMsg('Password updated. You may want to re-login.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setMsg(err.message || 'Error updating password');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
      <h4>Profile</h4>
      <div>Name: {currentUser.name}</div>
      <div>Email: {currentUser.email}</div>
      <div>Role: {currentUser.role}</div>

      <form onSubmit={handleChange} style={{ marginTop: 12 }}>
        <h5>Change password</h5>
        <div><input placeholder="Old password" type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} /></div>
        <div><input placeholder="New password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></div>
        <div style={{ marginTop:8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
        </div>
      </form>

      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}

      <div style={{ marginTop: 12 }}>
        <button onClick={() => { 
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          if (onLogout) onLogout(); 
        }}>
          Logout
        </button>
      </div>
    </div>
  );
}
