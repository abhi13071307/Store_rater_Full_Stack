// src/components/OwnerDashboard.jsx
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

export default function OwnerDashboard({ currentUser, requireAuth }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function fetchStores() {
    setError('');
    setLoading(true);
    try {
      const json = await apiGet('/api/owner/stores');
      setStores(json.data || []);
    } catch (err) {
      console.error(err);
      if (err && err.error === 'Authorization token required') requireAuth();
      else setError(err.error || 'Failed to load stores');
    } finally { setLoading(false); }
  }

  async function openStore(storeId) {
    setSelectedStore(storeId);
    setRatings([]);
    setRatingsLoading(true);
    try {
      const json = await apiGet(`/api/owner/stores/${storeId}/ratings`);
      setRatings(json.ratings || []);
    } catch (err) {
      console.error(err);
      setError(err.error || 'Failed to load ratings');
    } finally { setRatingsLoading(false); }
  }

  if (!currentUser) return <div>Please log in as a Store Owner to view this page.</div>;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Owner Dashboard</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? <div>Loading your stores…</div> : (
        <>
          {stores.length === 0 ? (
            <div>You don't have any stores yet.</div>
          ) : (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h4>Your stores</h4>
                {stores.map(s => (
                  <div key={s.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{s.name}</strong><div style={{ fontSize: 12 }}>{s.address}</div>
                        <div style={{ fontSize: 13 }}>Avg: {s.overallRating ?? 'N/A'} • {s.totalRatings} ratings</div>
                      </div>
                      <div>
                        <button onClick={() => openStore(s.id)}>View ratings</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <h4>Ratings</h4>
                {!selectedStore ? <div>Select a store to view ratings</div> : (
                  ratingsLoading ? <div>Loading ratings…</div> : (
                    ratings.length === 0 ? <div>No ratings yet for this store.</div> : (
                      <div>
                        {ratings.map(r => (
                          <div key={r.id} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
                            <div style={{ fontWeight: 600 }}>{r.user?.name ?? 'User' } <span style={{ fontSize: 12, color: '#666' }}>({r.user?.email ?? ''})</span></div>
                            <div>Score: {r.score}</div>
                            {r.comment && <div style={{ marginTop: 6 }}>{r.comment}</div>}
                            <div style={{ fontSize: 12, color: '#666' }}>{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
