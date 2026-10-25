import { useEffect, useState } from 'react';
import * as tripsApi from '../api/trips.js';
import TripCard from '../components/TripCard.jsx';
import TripForm from '../components/TripForm.jsx';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => tripsApi.listTrips().then(setTrips).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    await tripsApi.createTrip(data);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip and everything in it? This cannot be undone.')) return;
    await tripsApi.deleteTrip(id);
    load();
  };

  return (
    <div className="container">
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>Your trips</h2>
          <p className="muted" style={{ margin: 0 }}>
            {trips.length ? `${trips.length} trip${trips.length > 1 ? 's' : ''} planned` : 'Plan your first adventure'}
          </p>
        </div>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : 'New trip'}</button>
      </div>

      {showForm && <TripForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p className="muted">Loading your trips…</p>
      ) : trips.length === 0 && !showForm ? (
        <div className="empty">
          <h3>No trips yet</h3>
          <p className="muted">Create a trip to plan days, build a checklist and track your budget.</p>
          <button className="btn" onClick={() => setShowForm(true)}>Create your first trip</button>
        </div>
      ) : (
        <div className="grid">
          {trips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
