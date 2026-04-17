import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";
import settingsIcon from "../assets/settings.png";
import bellIcon from "../assets/bell.png";
import userIcon from "../assets/user.png"; 

export default function Navbar({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/login");
  };

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
            <button className="nav-icon-circle">
              <img src={settingsIcon} alt="settings" onError={(e) => e.target.style.display='none'} />
            </button>
            <button className="nav-icon-circle">
              <img src={bellIcon} alt="notifications" onError={(e) => e.target.style.display='none'} />
            </button>
            
            <div className="navbar-avatar-container">
              <div 
                className="navbar-avatar" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user.photo && user.photo !== "User.png" ? (
                  <img src={`https://localhost:7059/avatars/${user.photo}`} alt={user.username} />
                ) : (
                  <img src={userIcon} alt="user" onError={(e) => e.target.style.display='none'} />
                )}
              </div>

              {isDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-header">{user.username}</div>
                  
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
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout" onClick={handleLogout}>Вийти з акаунту</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="nav-login-btn" onClick={() => navigate('/login')}>
            Увійти
          </button>
        )}
      </div>
    </nav>
  );
}