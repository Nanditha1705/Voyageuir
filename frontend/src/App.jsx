import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TripDetail from './pages/TripDetail.jsx';
import SharedTrip from './pages/SharedTrip.jsx';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      <div className="container row" style={{ justifyContent: 'space-between', padding: '14px 24px' }}>
        <Link to="/" style={{ fontWeight: 700, color: '#1a1a1a' }}>✈️ Voyageuir</Link>
        {user ? (
          <div className="row">
            <span>Hi, {user.name}</span>
            <button className="btn secondary" onClick={() => { logout(); navigate('/login'); }}>
              Log out
            </button>
          </div>
        ) : (
          <div className="row">
            <Link to="/login">Log in</Link>
            <Link to="/register"><button className="btn">Sign up</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared/:token" element={<SharedTrip />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips/:tripId" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
