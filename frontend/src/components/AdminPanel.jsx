// AdminPanel.jsx
import { useEffect, useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminStores from './AdminStores';
import AdminCreateUser from './AdminCreateUser';
import AdminCreateStore from './AdminCreateStore';
import { apiGet } from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard'); // dashboard | users | stores | createUser | createStore
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    setLoading(true);
    try {
      const json = await apiGet('/api/admin/dashboard');
      setSummary(json);
    } catch (err) {
      console.error(err);
      alert(err.error || 'Failed to load dashboard');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Admin Panel</h3>
      <div style={{ marginBottom: 12 }}>
        <button onClick={()=>setTab('dashboard')}>Dashboard</button>
        <button onClick={()=>setTab('users')} style={{ marginLeft:8 }}>Users</button>
        <button onClick={()=>setTab('stores')} style={{ marginLeft:8 }}>Stores</button>
        <button onClick={()=>setTab('createUser')} style={{ marginLeft:8 }}>Add User</button>
        <button onClick={()=>setTab('createStore')} style={{ marginLeft:8 }}>Add Store</button>
      </div>

      {tab === 'dashboard' && (
        <div>
          {loading ? <div>Loading...</div> : summary && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ padding:12, border:'1px solid #ddd' }}>Users: <strong>{summary.totalUsers ?? summary.totalUsers}</strong></div>
              <div style={{ padding:12, border:'1px solid #ddd' }}>Stores: <strong>{summary.totalStores ?? summary.totalStores}</strong></div>
              <div style={{ padding:12, border:'1px solid #ddd' }}>Ratings: <strong>{summary.totalRatings ?? summary.totalRatings}</strong></div>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && <AdminUsers /> }
      {tab === 'stores' && <AdminStores /> }
      {tab === 'createUser' && <AdminCreateUser onDone={()=>setTab('users')} /> }
      {tab === 'createStore' && <AdminCreateStore onDone={()=>setTab('stores')} /> }
    </div>
  );
}
