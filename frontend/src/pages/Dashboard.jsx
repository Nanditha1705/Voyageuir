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
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    await tripsApi.deleteTrip(id);
    load();
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Your trips</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close' : '+ New trip'}
        </button>
      </div>

      {showForm && <TripForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p>Loading…</p>
      ) : trips.length === 0 ? (
        <p>No trips yet — create your first one above.</p>
      ) : (
        <div className="grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
