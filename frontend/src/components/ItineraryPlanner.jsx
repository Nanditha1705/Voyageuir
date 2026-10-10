import { useEffect, useState } from 'react';
import * as itineraryApi from '../api/itinerary.js';

export default function ItineraryPlanner({ tripId, onDaysChange }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemForms, setItemForms] = useState({}); // dayId -> draft item

  const load = () =>
    itineraryApi.getItinerary(tripId).then((d) => {
      setDays(d);
      onDaysChange?.(d);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, [tripId]);

  const addDay = async () => {
    const nextNumber = days.length ? Math.max(...days.map((d) => d.day_number)) + 1 : 1;
    await itineraryApi.addDay(tripId, { day_number: nextNumber });
    load();
  };

  const removeDay = async (dayId) => {
    if (!confirm('Remove this day and all its stops?')) return;
    await itineraryApi.deleteDay(tripId, dayId);
    load();
  };

  const updateItemForm = (dayId, field, value) =>
    setItemForms((f) => ({ ...f, [dayId]: { ...(f[dayId] || {}), [field]: value } }));

  const submitItem = async (dayId) => {
    const draft = itemForms[dayId];
    if (!draft?.title) return;
    await itineraryApi.addItem(tripId, dayId, {
      title: draft.title,
      time: draft.time || null,
      location_name: draft.location_name || null,
      // lat/lng would be populated from a Google Places Autocomplete field —
      // wired into MapView; left null here since this form doesn't geocode.
    });
    setItemForms((f) => ({ ...f, [dayId]: {} }));
    load();
  };

  const removeItem = async (itemId) => {
    await itineraryApi.deleteItem(tripId, itemId);
    load();
  };

  if (loading) return <p>Loading itinerary…</p>;

  return (
    <div>
      {days.map((day) => (
        <div className="card" key={day.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h4>Day {day.day_number}{day.date ? ` · ${day.date.slice(0, 10)}` : ''}</h4>
            <button className="btn danger" onClick={() => removeDay(day.id)}>Remove day</button>
          </div>

          {day.items.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No stops yet.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {day.items.map((item) => (
                <li key={item.id} style={{ marginBottom: 6 }}>
                  <strong>{item.time ? `${item.time} — ` : ''}{item.title}</strong>
                  {item.location_name ? ` (${item.location_name})` : ''}
                  {' '}
                  <button className="btn danger" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => removeItem(item.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="row">
            <input
              placeholder="Time (e.g. 09:00)"
              style={{ width: 120, padding: 6 }}
              value={itemForms[day.id]?.time || ''}
              onChange={(e) => updateItemForm(day.id, 'time', e.target.value)}
            />
            <input
              placeholder="Stop title"
              style={{ flex: 1, padding: 6 }}
              value={itemForms[day.id]?.title || ''}
              onChange={(e) => updateItemForm(day.id, 'title', e.target.value)}
            />
            <input
              placeholder="Location"
              style={{ flex: 1, padding: 6 }}
              value={itemForms[day.id]?.location_name || ''}
              onChange={(e) => updateItemForm(day.id, 'location_name', e.target.value)}
            />
            <button className="btn secondary" onClick={() => submitItem(day.id)}>Add stop</button>
          </div>
        </div>
      ))}

      <button className="btn" onClick={addDay}>+ Add day</button>
    </div>
  );
}
