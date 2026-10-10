import { useEffect, useState } from 'react';
import * as todosApi from '../api/todos.js';

export default function TodoChecklist({ tripId }) {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);

  const load = () => todosApi.listTodos(tripId).then(setTodos).finally(() => setLoading(false));
  useEffect(() => { load(); }, [tripId]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await todosApi.createTodo(tripId, { text, category });
    setText('');
    load();
  };

  const toggle = async (todo) => {
    await todosApi.updateTodo(tripId, todo.id, { is_done: !todo.is_done });
    load();
  };

  const remove = async (id) => {
    await todosApi.deleteTodo(tripId, id);
    load();
  };

  if (loading) return <p>Loading checklist…</p>;

  const grouped = todos.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <form onSubmit={addTodo} className="row" style={{ marginBottom: 16 }}>
        <input
          placeholder="e.g. Book airport transfer"
          style={{ flex: 1, padding: 8 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8 }}>
          <option value="general">General</option>
          <option value="documents">Documents</option>
          <option value="packing">Packing</option>
          <option value="bookings">Bookings</option>
        </select>
        <button className="btn" type="submit">Add</button>
      </form>

      {Object.keys(grouped).length === 0 ? (
        <p>Nothing on the checklist yet.</p>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="card">
            <h4 style={{ textTransform: 'capitalize' }}>{cat}</h4>
            {items.map((todo) => (
              <div key={todo.id} className="row" style={{ marginBottom: 6 }}>
                <input type="checkbox" checked={todo.is_done} onChange={() => toggle(todo)} />
                <span style={{ flex: 1, textDecoration: todo.is_done ? 'line-through' : 'none', color: todo.is_done ? '#9ca3af' : '#1a1a1a' }}>
                  {todo.text}
                </span>
                <button className="btn danger" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => remove(todo.id)}>✕</button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
