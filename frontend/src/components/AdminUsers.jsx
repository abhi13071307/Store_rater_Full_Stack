// AdminUsers.jsx
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

export default function AdminUsers() {
  const [q,setQ] = useState('');
  const [role,setRole] = useState('');
  const [page,setPage] = useState(1);
  const [limit] = useState(10);
  const [users,setUsers] = useState([]);
  const [total,setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(()=> { fetchUsers(); }, [page, q, role]);

  async function fetchUsers() {
    const params = new URLSearchParams();
    if (q) params.append('search', q);
    if (role) params.append('role', role);
    params.append('page', page);
    params.append('limit', limit);
    try {
      const json = await apiGet('/api/admin/users?' + params.toString());
      setUsers(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      alert(err.error || 'Failed to load users');
    }
  }

  async function openDetails(id) {
    try {
      const json = await apiGet('/api/admin/users/' + id);
      setSelected(json);
    } catch (err) {
      alert(err.error || 'Failed to load user details');
    }
  }

  return (
    <div>
      <h4>Users</h4>
      <div style={{ marginBottom:8 }}>
        <input placeholder="Search name/email" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)} style={{ marginLeft:8 }}>
          <option value="">All roles</option>
          <option value="NORMAL_USER">Normal</option>
          <option value="STORE_OWNER">Owner</option>
          <option value="SYSTEM_ADMIN">Admin</option>
        </select>
      </div>

      <div>
        {users.map(u => (
          <div key={u.id} style={{ border:'1px solid #ddd', padding:8, marginBottom:6 }}>
            <div><strong>{u.name}</strong> ({u.role})</div>
            <div>{u.email}</div>
            <div>{u.address}</div>
            <div><button onClick={()=>openDetails(u.id)}>View details</button></div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:8 }}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page*limit >= total}>Next</button>
      </div>

      {selected && (
        <div style={{ marginTop:12, border:'1px solid #ccc', padding:8 }}>
          <h5>Details: {selected.user.name}</h5>
          <div>Email: {selected.user.email}</div>
          <div>Address: {selected.user.address}</div>
          <div>Role: {selected.user.role}</div>

          {selected.ownerData && selected.ownerData.length > 0 && (
            <>
            <h6>Owner stores & ratings</h6>
            {selected.ownerData.map(s => (
              <div key={s.id}>{s.name} — Avg: {s.overallRating ?? 'N/A'} ({s.totalRatings} ratings)</div>
            ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
