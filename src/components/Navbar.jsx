import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  // Твоя стара логіка виходу
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
          
          <div className="nav-links">
            <Link to="/" className="nav-item active">Крамниця</Link>
            {user?.role === "Admin" && (
              <Link to="/admin" className="nav-item">Адмін-панель</Link>
            )}
            <Link to="/library" className="nav-item">Бібліотека</Link>
            <Link to="/chat" className="nav-item">Чат</Link>
          </div>
        </div>
        
        <div className="nav-right">
          {user ? (
            <div className="user-profile">
              <span className="username">{user.username}</span>
              <button className="logout-link" onClick={logout}>Вийти</button>
            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="nav-item">Увійти</Link>
              <button className="auth-btn login" onClick={() => navigate('/register')}>
                Реєстрація
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}