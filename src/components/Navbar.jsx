import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser, balance, setBalance }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMessage, setTopupMessage] = useState("");

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

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="nav-left">
            <Link to="/" className="logo">SLUSH</Link>
          </div>
          <div className="nav-center">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Крамниця</Link>
            <Link to="/library" className={`nav-item ${location.pathname === '/library' ? 'active' : ''}`}>Бібліотека</Link>
            <Link to="/users" className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
              Сommunity
            </Link>
            <Link to="/screenshots" className={`nav-item ${location.pathname === '/screenshots' ? 'active' : ''}`}>
              Скриншоти
            </Link>
            {user?.role === "Admin" && (
              <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>Адмін</Link>
            )}
          </div>
          <div className="nav-right">
            {user ? (
              <div className="user-profile">
                {balance !== null && (
                  <span className="balance" onClick={() => setShowTopup(true)} style={{ cursor: "pointer" }} title="Поповнити баланс">
                    💰 {parseFloat(balance).toFixed(2)}$
                  </span>
                )}
                <span className="username">{user.username}</span>
                <button className="auth-btn login" onClick={logout}>Вийти</button>
              </div>
            ) : (
              <button className="auth-btn login" onClick={() => navigate('/login')}>Увійти</button>
            )}
          </div>
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
              Поточний баланс: <strong style={{ color: "#7c3aed" }}>{parseFloat(balance || 0).toFixed(2)}$</strong>
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[10, 25, 50, 100].map(amt => (
                <button key={amt} onClick={() => setTopupAmount(String(amt))}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", background: topupAmount === String(amt) ? "#7c3aed" : "#2a2a3e", color: "#fff", border: "none", fontSize: "14px", fontWeight: "bold" }}>
                  +{amt}$
                </button>
              ))}
            </div>
            <input
              type="number" placeholder="Своя сума..." value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", marginBottom: "16px", boxSizing: "border-box", fontSize: "14px", outline: "none" }}
            />
            {topupMessage && <p style={{ color: "#4ade80", textAlign: "center", marginBottom: "12px", fontSize: "14px" }}>{topupMessage}</p>}
            <button onClick={handleTopup}
              style={{ width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold", marginBottom: "8px" }}>
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