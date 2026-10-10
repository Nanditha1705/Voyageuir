import { Link } from 'react-router-dom';

export default function TripCard({ trip, onDelete }) {
  const dateRange = trip.start_date && trip.end_date
    ? `${trip.start_date.slice(0, 10)} → ${trip.end_date.slice(0, 10)}`
    : 'Dates not set';

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>{trip.title}</h3>
      <p style={{ margin: '0 0 4px', color: '#6b7280' }}>{trip.destination || 'No destination set'}</p>
      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280' }}>{dateRange}</p>
      <div className="row">
        <Link to={`/trips/${trip.id}`}><button className="btn">Open</button></Link>
        <button className="btn danger" onClick={() => onDelete(trip.id)}>Delete</button>
      </div>
    </div>
  );
}
