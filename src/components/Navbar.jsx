import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-left">
          <Link to="/" className="logo">SLUSH</Link>
        </div>
        
        <div className="nav-center">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Крамниця</Link>
          <Link to="/library" className={`nav-item ${location.pathname === '/library' ? 'active' : ''}`}>Бібліотека</Link>
          <Link to="/chat" className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}>Чат</Link>
          {user?.role === "Admin" && (
            <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>Адмін</Link>
          )}
        </div>
        
        <div className="nav-right">
          {user ? (
            <div className="user-profile">
              <span className="username">{user.username}</span>
              <button className="auth-btn login" onClick={logout}>Вийти</button>
            </div>
          ) : (
            <button className="auth-btn login" onClick={() => navigate('/login')}>
              Увійти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}