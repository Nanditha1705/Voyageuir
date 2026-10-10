import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as tripsApi from '../api/trips.js';
import ItineraryPlanner from '../components/ItineraryPlanner.jsx';
import TodoChecklist from '../components/TodoChecklist.jsx';
import MapView from '../components/MapView.jsx';
import BudgetTracker from '../components/BudgetTracker.jsx';
import ShareTripModal from '../components/ShareTripModal.jsx';

const TABS = ['Itinerary', 'Checklist', 'Map', 'Budget', 'Share'];

export default function TripDetail() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [tab, setTab] = useState('Itinerary');

  useEffect(() => {
    tripsApi.getTrip(tripId).then(setTrip);
  }, [tripId]);

  if (!trip) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <Link to="/">← Back to trips</Link>
      <h2 style={{ marginBottom: 4 }}>{trip.title}</h2>
      <p style={{ color: '#6b7280', marginTop: 0 }}>{trip.destination}</p>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Itinerary' && <ItineraryPlanner tripId={tripId} onDaysChange={setDays} />}
      {tab === 'Checklist' && <TodoChecklist tripId={tripId} />}
      {tab === 'Map' && (
        days.length === 0
          ? <p>Add itinerary days and stops first to see them on the map.</p>
          : <MapView days={days} />
      )}
      {tab === 'Budget' && <BudgetTracker tripId={tripId} />}
      {tab === 'Share' && <ShareTripModal trip={trip} onUpdated={setTrip} />}
    </div>
  );
}
