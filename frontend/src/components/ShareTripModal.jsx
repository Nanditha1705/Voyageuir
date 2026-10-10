import { useState } from 'react';
import * as tripsApi from '../api/trips.js';

export default function ShareTripModal({ trip, onUpdated }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/shared/${trip.share_token}`;

  const toggleSharing = async () => {
    const updated = await tripsApi.updateShareSettings(trip.id, { share_enabled: !trip.share_enabled });
    onUpdated({ ...trip, ...updated });
  };

  const regenerate = async () => {
    if (!confirm('Regenerate the link? The old link will stop working.')) return;
    const updated = await tripsApi.updateShareSettings(trip.id, { regenerate: true });
    onUpdated({ ...trip, ...updated });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card">
      <h4>Share this trip</h4>
      <label className="row">
        <input type="checkbox" checked={trip.share_enabled} onChange={toggleSharing} />
        Enable public read-only link
      </label>

      {trip.share_enabled && (
        <div style={{ marginTop: 12 }}>
          <div className="row">
            <input readOnly value={shareUrl} style={{ flex: 1, padding: 8 }} />
            <button className="btn secondary" onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button>
            <button className="btn secondary" onClick={regenerate}>Regenerate</button>
          </div>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
            Anyone with this link can view the itinerary and checklist (budget stays private).
          </p>
        </div>
      )}
    </div>
  );
}
