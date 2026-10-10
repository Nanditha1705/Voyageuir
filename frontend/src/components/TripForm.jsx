import { useState } from 'react';

export default function TripForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    destination: initial?.destination || '',
    start_date: initial?.start_date?.slice(0, 10) || '',
    end_date: initial?.end_date?.slice(0, 10) || '',
    currency: initial?.currency || 'USD',
    total_budget: initial?.total_budget || 0,
  });
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card">
      <h3>{initial ? 'Edit trip' : 'New trip'}</h3>
      <div className="field">
        <label>Trip title</label>
        <input value={form.title} onChange={update('title')} required placeholder="Japan Spring Trip" />
      </div>
      <div className="field">
        <label>Destination</label>
        <input value={form.destination} onChange={update('destination')} placeholder="Tokyo, Japan" />
      </div>
      <div className="row">
        <div className="field" style={{ flex: 1 }}>
          <label>Start date</label>
          <input type="date" value={form.start_date} onChange={update('start_date')} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>End date</label>
          <input type="date" value={form.end_date} onChange={update('end_date')} />
        </div>
      </div>
      <div className="row">
        <div className="field" style={{ flex: 1 }}>
          <label>Currency</label>
          <input value={form.currency} onChange={update('currency')} maxLength={3} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Total budget</label>
          <input type="number" min="0" step="0.01" value={form.total_budget} onChange={update('total_budget')} />
        </div>
      </div>
      <div className="row">
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save trip'}</button>
        <button className="btn secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
