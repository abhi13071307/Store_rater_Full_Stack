// AdminStores.jsx
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

export default function AdminStores() {
  const [search,setSearch] = useState('');
  const [address,setAddress] = useState('');
  const [page,setPage] = useState(1);
  const [limit] = useState(10);
  const [stores,setStores] = useState([]);
  const [total,setTotal] = useState(0);

  useEffect(()=> { fetchStores(); }, [page, search, address]);

  async function fetchStores() {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (address) params.append('address', address);
    params.append('page', page);
    params.append('limit', limit);
    try {
      const json = await apiGet('/api/admin/stores?' + params.toString());
      setStores(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      alert(err.error || 'Failed to load stores');
    }
  }

  return (
    <div>
      <h4>Stores</h4>
      <div style={{ marginBottom:8 }}>
        <input placeholder="Search name" value={search} onChange={e=>setSearch(e.target.value)} />
        <input placeholder="Address" style={{ marginLeft:8 }} value={address} onChange={e=>setAddress(e.target.value)} />
      </div>

      <div>
        {stores.map(s => (
          <div key={s.id} style={{ border:'1px solid #ddd', padding:8, marginBottom:6 }}>
            <div><strong>{s.name}</strong> — {s.owner?.name ? `Owner: ${s.owner.name}` : 'No owner'}</div>
            <div>{s.email} • {s.address}</div>
            <div>Rating: {s.overallRating ?? 'N/A'} ({s.totalRatings} ratings)</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:8 }}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
        <span style={{ margin: '0 8px' }}>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)} disabled={page*limit >= total}>Next</button>
      </div>
    </div>
  );
}
