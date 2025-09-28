// AdminCreateUser.jsx
import { useState } from 'react';
import { apiPost } from '../services/api';

export default function AdminCreateUser({ onDone }) {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [address,setAddress] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('NORMAL_USER');
  const [loading,setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/api/admin/users', { name, email, address, password, role });
      alert('User created');
      if (onDone) onDone();
    } catch (err) {
      alert(err.error || 'Failed to create user');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
      <h4>Create User</h4>
      <div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (20-60 chars)" /></div>
      <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" /></div>
      <div><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" /></div>
      <div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /></div>
      <div>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="NORMAL_USER">Normal User</option>
          <option value="STORE_OWNER">Store Owner</option>
          <option value="SYSTEM_ADMIN">Admin</option>
        </select>
      </div>
      <div style={{ marginTop:8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
      </div>
    </form>
  );
}
