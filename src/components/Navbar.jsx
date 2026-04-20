import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from "../assets/logo.png";
import settingsIcon from "../assets/settings.png";
import bellIcon from "../assets/bell.png";
import userIcon from "../assets/user.png";

export default function Navbar({ user, setUser, balance, setBalance }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMessage, setTopupMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const dropdownRef = useRef(null);
  const communityRef = useRef(null);

  const isActive = (path) => location.pathname === path ? "active" : "";

  async function handleTopup() {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) return;
    const res = await fetch("https://localhost:7059/api/library/topup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (res.ok) {
      setBalance(data.balance);
      setTopupMessage(`✅ Поповнено на ${amount}$`);
      setTopupAmount("");
      setTimeout(() => {
        setTopupMessage("");
        setShowTopup(false);
      }, 1500);
    }
  }

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
      if (communityRef.current && !communityRef.current.contains(event.target)) {
        setIsCommunityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-side navbar-left">
          <Link to="/" className="navbar-logo">
            <img src={logoImg} alt="SLUSH" />
          </Link>
        </div>

        <div className="navbar-center">
          <Link to="/" className={`navbar-link ${isActive("/")}`}>Крамниця</Link>
          <Link to="/library" className={`navbar-link ${isActive("/library")}`}>Бібліотека</Link>

          <div
            className="navbar-link-dropdown-wrapper"
            ref={communityRef}
            onMouseEnter={() => setIsCommunityOpen(true)}
            onMouseLeave={() => setIsCommunityOpen(false)}
          >
            <Link to="/screenshots" className={`navbar-link ${isActive("/screenshots")}`}>
              Сообщество
            </Link>

            {isCommunityOpen && (
              <div className="navbar-dropdown-menu">
                <Link to="/screenshots" className="navbar-dropdown-item" onClick={() => setIsCommunityOpen(false)}>
                  🖼️ Скріншоти
                </Link>
                <Link to="/market" className="navbar-dropdown-item" onClick={() => setIsCommunityOpen(false)}>
                  🛒 Маркет
                </Link>
                <Link to="/chat" className="navbar-dropdown-item" onClick={() => setIsCommunityOpen(false)}>
                  💬 Чат
                </Link>
                {user?.role === "Admin" && (
                  <>
                    <div className="navbar-dropdown-divider" />
                    <Link to="/admin" className="navbar-dropdown-item admin" onClick={() => setIsCommunityOpen(false)}>
                      ⚙️ Адмін панель
                    </Link>
                  </>
                )}
                <Link to="/wishlist" className={`nav-item ${location.pathname === '/wishlist' ? 'active' : ''}`}>
                  💝 Бажання
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-side navbar-right">
          {user ? (
            <div className="navbar-auth-group" ref={dropdownRef}>
              <button className="nav-icon-circle">
                <img src={settingsIcon} alt="settings" onError={(e) => e.target.style.display = 'none'} />
              </button>
              <button className="nav-icon-circle">
                <img src={bellIcon} alt="notifications" onError={(e) => e.target.style.display = 'none'} />
              </button>

              <div className="navbar-avatar-container">
                <div className="navbar-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  {user.photo && user.photo !== "User.png" ? (
                    <img src={`https://localhost:7059/avatars/${user.photo}`} alt={user.username} />
                  ) : (
                    <img src={userIcon} alt="user" onError={(e) => e.target.style.display = 'none'} />
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-header">{user.username}</div>

                    {balance !== null && balance !== undefined && (
                      <div
                        className="dropdown-balance"
                        onClick={() => { setShowTopup(true); setIsDropdownOpen(false); }}
                      >
                        💰 {parseFloat(balance).toFixed(2)}$
                        <span className="dropdown-balance-hint">Поповнити</span>
                      </div>
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
            <button className="nav-login-btn" onClick={() => navigate('/login')}>
              Увійти
            </button>
          )}
        </div>
      </nav>

      {showTopup && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowTopup(false)}
        >
          <div
            style={{ background: "#1a1a2e", borderRadius: "14px", padding: "32px", width: "360px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", marginBottom: "6px" }}>💰 Поповнення балансу</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
              Поточний баланс: <strong style={{ color: "#002F3D" }}>{parseFloat(balance || 0).toFixed(2)}$</strong>
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[10, 25, 50, 100].map(amt => (
                <button key={amt} onClick={() => setTopupAmount(String(amt))}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", background: topupAmount === String(amt) ? "#7c3aed" : "#002F3D", color: "#fff", border: "none", fontSize: "14px", fontWeight: "bold" }}>
                  +{amt}$
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Своя сума..."
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", marginBottom: "16px", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
            />
            {topupMessage && (
              <p style={{ color: "#4ade80", textAlign: "center", marginBottom: "12px", fontSize: "14px" }}>{topupMessage}</p>
            )}
            <button onClick={handleTopup}
              style={{ width: "100%", padding: "12px", background: "#002F3D", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold", marginBottom: "8px" }}>
              Поповнити
            </button>
            <button onClick={() => { setShowTopup(false); setTopupAmount(""); setTopupMessage(""); }}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </>
  );
}