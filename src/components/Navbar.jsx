import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from "../assets/logo.png";
import settingsIcon from "../assets/settings.png";
import bellIcon from "../assets/bell.png";
import userIcon from "../assets/user.png";
import walletIcon from "../assets/walletIcon.png"; 
import '../style/Navbar.css';

export default function Navbar({ user, setUser, balance }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path ? "active" : "";

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-side navbar-left">
        <Link to="/" className="navbar-logo">
          <img src={logoImg} alt="SLUSH" />
        </Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className={`navbar-link ${isActive("/")}`}>Крамниця</Link>
        <Link to="/library" className={`navbar-link ${isActive("/library")}`}>Бібліотека</Link>
        <Link to="/chat" className={`navbar-link ${isActive("/chat")}`}>Чат</Link>
      </div>

      <div className="navbar-side navbar-right">
        {user ? (
          <div className="navbar-auth-group" ref={dropdownRef}>
            <button className="nav-icon-circle" onClick={() => navigate('/settings')}>
              <img src={settingsIcon} alt="settings" onError={(e) => e.target.style.display = 'none'} />
            </button>
            <button className="nav-icon-circle">
              <img src={bellIcon} alt="notifications" onError={(e) => e.target.style.display = 'none'} />
            </button>

            <div className="navbar-avatar-container" style={{ position: "relative" }}>
              <div className="navbar-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {user.photo && user.photo !== "User.png" ? (
                 <img src={`https://localhost:7059/avatars/${user.photo}`} alt={user.username} onError={(e) => { e.target.src = userIcon; }} />
                ) : (
                  <img src={userIcon} alt="user" />
                )}
              </div>

              {isDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">{user.username}</div>

                  {balance !== null && balance !== undefined && (
                    <div
                      className="dropdown-balance"
                      onClick={() => { 
                        setIsDropdownOpen(false); 
                        navigate('/settings', { state: { activeTab: 'wallet' } }); 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={walletIcon} alt="coin" className="dropdown-coin-icon" />
                        {parseFloat(balance).toFixed(2)}₴
                      </div>
                      <span className="dropdown-balance-hint">Поповнити</span>
                    </div>
                  )}

                  <div className="dropdown-divider" />
                  
                  <Link to="/market" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>🛒 Маркет</Link>
                  {user?.role === "Admin" && (
                    <Link to="/admin" className="dropdown-item admin" onClick={() => setIsDropdownOpen(false)} style={{color: '#24E5C2'}}>⚙️ Адмін панель</Link>
                  )}
                  
                  <div className="dropdown-divider" />
                  
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мій профіль</Link>
                  <Link to="/users" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Пошук користувачів</Link>
                  <Link to="/friends" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої друзі</Link>
                  <Link to="/badges" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої значки</Link>
                  <Link to="/screenshots" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої скріншоти</Link>
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Моє бажане</Link>
                  <Link to="/discussions" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої обговорення</Link>
                  <Link to="/videos" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої відео</Link>
                  <Link to="/guides" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої гайди</Link>
                  <Link to="/reviews" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Мої рецензії</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={logout}>Вийти з акаунту</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="nav-login-btn" onClick={() => navigate('/login')}>Увійти</button>
        )}
      </div>
    </nav>
  );
}