// frontend/src/App.jsx
import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import StoreList from './components/StoreList';
import OwnerDashboard from './components/OwnerDashboard';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [view, setView] = useState('home'); // 'home' | 'login' | 'signup'

  function onLogin(userObj) {
    if (!userObj) return;
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setView('home');
  }

  function onSignup(userObj) {
    if (!userObj) return;
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setView('home');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('home');
  }

  if (!user && view === 'home') {
    return (
      <div className="app-container">
        <h1 className="app-title">Store Rating Platform</h1>
        <p className="app-subtitle">Rate and review your favorite stores</p>
        <div className="button-group">
          <button className="btn primary" onClick={() => setView('login')}>Login</button>
          <button className="btn secondary" onClick={() => setView('signup')}>Sign up</button>
        </div>
      </div>
    );
  }

  if (!user && view === 'login') {
    return (
      <div className="app-container">
        <h1 className="app-title">Login</h1>
        <Login onLogin={onLogin} />
        <p>
          Don’t have an account?{" "}
          <button className="link-btn" onClick={() => setView('signup')}>Sign up</button>
        </p>
      </div>
    );
  }

  if (!user && view === 'signup') {
    return (
      <div className="app-container">
        <h1 className="app-title">Sign up</h1>
        <Signup onSignup={onSignup} />
        <p>
          Already have an account?{" "}
          <button className="link-btn" onClick={() => setView('login')}>Login</button>
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-title">Store Rating Platform</h1>

      <div className="user-info">
        Logged in as <strong>{user?.name}</strong> ({user?.role})
        <button className="btn small" onClick={logout}>Logout</button>
      </div>

      <StoreList currentUser={user} onRequireLogin={() => setView('login')} />

      {user && user.role === 'STORE_OWNER' && (
        <OwnerDashboard currentUser={user} requireAuth={() => setView('login')} />
      )}

      {user && user.role === 'SYSTEM_ADMIN' && (
        <AdminPanel />
      )}

      <Profile currentUser={user} onLogout={logout} />
    </div>
  );
}
