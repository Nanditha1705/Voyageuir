import { Link } from 'react-router-dom';

const HUES = [[195, 215], [165, 185], [225, 250], [270, 290], [330, 350], [35, 20]];

function hash(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const toDate = (d) => new Date(`${d.slice(0, 10)}T00:00:00`);
const fmt = (d) => toDate(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function tripStatus(trip) {
  if (!trip.start_date) return 'Dates not set';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = toDate(trip.start_date);
  const end = trip.end_date ? toDate(trip.end_date) : start;
  if (today < start) {
    const days = Math.ceil((start - today) / 864e5);
    return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
  }
  return today <= end ? 'Happening now' : 'Completed';
}

export default function TripCard({ trip, onDelete }) {
  const [a, b] = HUES[hash(trip.title) % HUES.length];
  const dates = trip.start_date && trip.end_date ? `${fmt(trip.start_date)} – ${fmt(trip.end_date)}` : 'Add dates to see a countdown';

  return (
    <div className="trip-card">
      <Link
        to={`/trips/${trip.id}`}
        className="trip-banner"
        style={{ background: `linear-gradient(135deg, hsl(${a} 55% 28%), hsl(${b} 60% 40%))` }}
      >
        <span className="trip-status">{tripStatus(trip)}</span>
        <h3>{trip.title}</h3>
      </Link>
      <div className="trip-body">
        <p>{trip.destination || 'No destination yet'}</p>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>{dates}</p>
        <div className="row between">
          <Link to={`/trips/${trip.id}`} className="btn">Open trip</Link>
          <button className="btn danger" onClick={() => onDelete(trip.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
