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
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">Travel Organiser</Link>
        {user ? (
          <div className="row">
            <span className="muted">{user.name}</span>
            <button className="btn secondary" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
          </div>
        ) : (
          <div className="row">
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn">Sign up</Link>
          </div>
        )}
      </div>
    </header>
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
