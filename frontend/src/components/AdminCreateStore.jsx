// AdminCreateStore.jsx
import { useState } from 'react';
import { apiPost } from '../services/api';

export default function AdminCreateStore({ onDone }) {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [address,setAddress] = useState('');
  const [ownerId,setOwnerId] = useState('');
  const [loading,setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, email, address };
      if (ownerId) payload.ownerId = parseInt(ownerId,10);
      await apiPost('/api/admin/stores', payload);
      alert('Store created');
      if (onDone) onDone();
    } catch (err) {
      alert(err.error || 'Failed to create store');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
      <h4>Create Store</h4>
      <div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Store Name" /></div>
      <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Store Email" /></div>
      <div><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" /></div>
      <div><input value={ownerId} onChange={e=>setOwnerId(e.target.value)} placeholder="Owner user id (optional)" /></div>
      <div style={{ marginTop:8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Store'}</button>
      </div>
    </form>
  );
}
