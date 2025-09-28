import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

function StarInput({ value, onChange }) {
  return (
    <div>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            fontSize: 24,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: n <= value ? 'red' : '#e5e7eb' // red for filled, gray for empty
          }}
        >
          { n <= value ? '★' : '☆' }
        </button>
      ))}
    </div>
  );
}


export default function StoreList({ currentUser, onRequireLogin }) {
  const [stores, setStores] = useState([]);
  const [scoreMap, setScoreMap] = useState({});
  const [commentMap, setCommentMap] = useState({});

  useEffect(() => { fetchStores(); }, [currentUser]);

  async function fetchStores() {
    try {
      const json = await apiGet('/api/stores');
      setStores(json.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(storeId) {
    const score = scoreMap[storeId];
    const comment = commentMap[storeId] || '';
    if (!score) return alert('Pick a score 1–5');
    try {
      await apiPost(`/api/ratings/${storeId}`, { score, comment });
      await fetchStores();
    } catch (err) {
      if (err.error === 'Authentication required') onRequireLogin();
      else alert(err.error || 'Error submitting rating');
    }
  }

  return (
    <div>
      {stores.map(store => (
        <div key={store.id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <h4>{store.name}</h4>
          <div>{store.address}</div>
          <div>Overall Rating: {store.overallRating ?? 'N/A'}</div>
          <div>Your Rating: {store.userRating ?? 'None'}</div>
          <StarInput value={scoreMap[store.id] ?? store.userRating ?? 0}
                     onChange={(v)=>setScoreMap(s=>({...s,[store.id]:v}))} />
          <input placeholder="Comment"
                 value={commentMap[store.id]||''}
                 onChange={(e)=>setCommentMap(c=>({...c,[store.id]:e.target.value}))} />
          <button onClick={()=>handleSubmit(store.id)}>Submit / Update</button>
        </div>
      ))}
    </div>
  );
}
