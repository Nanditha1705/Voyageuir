import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedTrip } from '../api/trips.js';

export default function SharedTrip() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSharedTrip(token)
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'This link is invalid'));
  }, [token]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!data) return <div className="container">Loading…</div>;

  const { trip, days, todos } = data;

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ margin: 0 }}>{trip.title}</h2>
        <p style={{ color: '#6b7280' }}>{trip.destination}</p>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Shared read-only view — no sign-in required</p>
      </div>

      <h3>Itinerary</h3>
      {days.map((day) => (
        <div className="card" key={day.id}>
          <h4>Day {day.day_number}{day.date ? ` · ${day.date.slice(0, 10)}` : ''}</h4>
          {day.items.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No stops planned.</p>
          ) : (
            <ul>
              {day.items.map((item) => (
                <li key={item.id}>
                  {item.time ? `${item.time} — ` : ''}{item.title}
                  {item.location_name ? ` (${item.location_name})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <h3>Checklist</h3>
      <div className="card">
        {todos.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Nothing on the list.</p>
        ) : (
          todos.map((t) => (
            <div key={t.id} className="row" style={{ marginBottom: 4 }}>
              <input type="checkbox" checked={t.is_done} readOnly />
              <span style={{ textDecoration: t.is_done ? 'line-through' : 'none' }}>{t.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
