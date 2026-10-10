import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const defaultCenter = [139.6503, 35.6762]; // Mapbox uses [lng, lat] order
const ROUTE_SOURCE_ID = 'route';

export default function MapView({ days }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedDayId, setSelectedDayId] = useState(days[0]?.id);
  const [legInfo, setLegInfo] = useState([]);
  const [error, setError] = useState('');

  const selectedDay = days.find((d) => d.id === selectedDayId) || days[0];
  const stops = useMemo(
    () => (selectedDay?.items || []).filter((i) => i.lat != null && i.lng != null),
    [selectedDay]
  );

  // Create the map once.
  useEffect(() => {
    if (!import.meta.env.VITE_MAPBOX_TOKEN || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 11,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-draw markers + route whenever the selected day's stops change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (stops.length === 0) return;

      stops.forEach((s) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([s.lng, s.lat])
          .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(s.title))
          .addTo(map);
        markersRef.current.push(marker);
      });

      const bounds = new mapboxgl.LngLatBounds();
      stops.forEach((s) => bounds.extend([s.lng, s.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });

      if (stops.length < 2) {
        setLegInfo([]);
        if (map.getLayer(ROUTE_SOURCE_ID)) map.removeLayer(ROUTE_SOURCE_ID);
        if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
        return;
      }

      // Mapbox Directions API — same access token as the map itself.
      const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

      axios.get(url)
        .then(({ data }) => {
          if (!data.routes?.length) throw new Error('No route found');
          const route = data.routes[0];

          const geojson = { type: 'Feature', geometry: route.geometry };
          if (map.getSource(ROUTE_SOURCE_ID)) {
            map.getSource(ROUTE_SOURCE_ID).setData(geojson);
          } else {
            map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: geojson });
            map.addLayer({
              id: ROUTE_SOURCE_ID,
              type: 'line',
              source: ROUTE_SOURCE_ID,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#2563eb', 'line-width': 4 },
            });
          }

          setLegInfo(route.legs.map((leg, i) => ({
            from: stops[i].title,
            to: stops[i + 1].title,
            duration: `${Math.round(leg.duration / 60)} min`,
            distance: `${(leg.distance / 1000).toFixed(1)} km`,
          })));
          setError('');
        })
        .catch(() => {
          setLegInfo([]);
          setError('Could not calculate the route right now — try again in a moment.');
        });
    };

    if (map.isStyleLoaded()) draw();
    else map.once('load', draw);
  }, [stops]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return <p className="error">Set VITE_MAPBOX_TOKEN in frontend/.env to enable the map.</p>;
  }

  return (
    <div>
      <div className="tabs">
        {days.map((d) => (
          <button
            key={d.id}
            className={d.id === selectedDayId ? 'active' : ''}
            onClick={() => setSelectedDayId(d.id)}
          >
            Day {d.day_number}
          </button>
        ))}
      </div>

      <div ref={mapContainerRef} style={{ width: '100%', height: '420px', borderRadius: 12 }} />

      {stops.length < 2 && (
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Add coordinates to at least two stops in this day to see travel times.
        </p>
      )}
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}

      {legInfo.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h4>Travel time between stops</h4>
          <ul style={{ paddingLeft: 18 }}>
            {legInfo.map((leg, i) => (
              <li key={i}>{leg.from} → {leg.to}: <strong>{leg.duration}</strong> ({leg.distance})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
