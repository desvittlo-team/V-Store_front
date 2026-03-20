import React, { useEffect, useState } from "react";
import { getGames } from "../api/games";
import GameCarousel from "../components/GameCarousel";
import searchIcon from '../assets/search.png';
import wishlistIcon from '../assets/wishlist.png';
import cartIcon from '../assets/cart.png';

export default function GamesPage({ user, setUser }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [ownedIds, setOwnedIds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    // загрузить баланс
    fetch("https://localhost:7059/api/library/balance", {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => r.json()).then(d => setBalance(d.balance));
    // загрузить купленные игры
    fetch("https://localhost:7059/api/library", {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => r.json()).then(data => setOwnedIds(data.map(g => g.id)));
  }, [user]);

  async function handleBuy(game) {
    if (!user?.token) { setMessage("Увійдіть щоб купити гру"); return; }
    const res = await fetch(`https://localhost:7059/api/library/buy/${game.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.message || "Помилка"); return; }
    setBalance(data.balance);
    setOwnedIds([...ownedIds, game.id]);
    setMessage(`✅ ${game.name} додано до бібліотеки!`);
    setTimeout(() => setMessage(""), 3000);
    setSelectedGame(null);
  }

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
      setShowTopup(false);
      setTopupAmount("");
      setMessage(`💰 Баланс поповнено на ${amount}$`);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const heroGame = games[0] || null;
  const specialOffers = games.slice(1, 6);
  const recommended = games.slice(2, 8);
  const under100 = games.slice(3, 9);
  const topSellers = games.slice(0, 3);
  const newReleases = games.slice(3, 6);
  const freeGames = games.slice(6, 9);

  const renderGameCard = (game) => (
    <div key={game.id} className="game-card" onClick={() => setSelectedGame(game)}>
      <div className="card-image-wrapper">
        <img
          src={`https://localhost:7059/images/${game.photo}`}
          alt={game.name}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Photo'; }}
        />
      </div>
      <div className="card-info">
        <h3 className="card-name">{game.name}</h3>
        <div className="price-row">
          <span className="current-price">{game.price > 0 ? `${game.price}$` : "Безкоштовно"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-container">

      {/* Уведомление */}
      {message && (
        <div style={{
          position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", border: "1px solid #7c3aed", color: "#fff",
          padding: "12px 24px", borderRadius: "8px", zIndex: 9999, fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      {/* Hero */}
      <section className="hero-section">
        {heroGame ? (
          <div
            className="main-banner"
            style={{ backgroundImage: `linear-gradient(to right, rgba(2, 26, 31, 0.9), transparent), url(https://localhost:7059/pics/${heroGame.photo})` }}
          >
            <div className="banner-content">
              <h1 className="banner-title">{heroGame.name}</h1>
              <p className="banner-desc">Найкраща пропозиція тижня вже у крамниці.</p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="buy-btn" onClick={() => setSelectedGame(heroGame)}>Детальніше</button>
                {user && (
                  <button
                    className="buy-btn"
                    style={{ background: "transparent", border: "1px solid #7c3aed" }}
                    onClick={() => setShowTopup(true)}
                  >
                    💰 {balance !== null ? `${parseFloat(balance).toFixed(2)}$` : "Баланс"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="main-banner placeholder-banner">
            <h1>Додайте ігри через адмінку</h1>
          </div>
        )}
        <div className="store-search-bar">
          <div className="search-input-wrapper">
            <input type="text" placeholder="Пошук у Крамниці..." className="store-search-input" />
            <img src={searchIcon} alt="search" className="search-icon-img" />
          </div>
          <div className="search-links">
            <span className="search-link">Каталог</span>
            <span className="search-link">Новини</span>
          </div>
          <div className="search-actions">
            <button className="icon-btn"><img src={wishlistIcon} alt="wishlist" /></button>
            <button className="icon-btn"><img src={cartIcon} alt="cart" /></button>
          </div>
        </div>
      </section>

      {games.length > 0 && (
        <>
          <GameCarousel title="Особливі пропозиції" games={specialOffers} renderCard={renderGameCard} />
          <GameCarousel title="Рекомендовані вам" games={recommended} renderCard={renderGameCard} />
          <GameCarousel title="До 100₴" games={under100} renderCard={renderGameCard} />
          <section className="three-columns-section">
            <div className="column">
              <div className="section-header"><h2 className="category-title">Хіти продажу</h2></div>
              <div className="column-grid">{topSellers.map(renderGameCard)}</div>
            </div>
            <div className="column">
              <div className="section-header"><h2 className="category-title">Нові релізи</h2></div>
              <div className="column-grid">{newReleases.map(renderGameCard)}</div>
            </div>
            <div className="column">
              <div className="section-header"><h2 className="category-title">Безкоштовні</h2></div>
              <div className="column-grid">{freeGames.map(renderGameCard)}</div>
            </div>
          </section>
        </>
      )}

      {/* Модальное окно игры */}
      {selectedGame && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}
          onClick={() => setSelectedGame(null)}
        >
          <div
            style={{
              background: "#1a1a2e", borderRadius: "12px", width: "500px", maxWidth: "90vw",
              overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`https://localhost:7059/images/${selectedGame.photo}`}
              alt={selectedGame.name}
              style={{ width: "100%", height: "240px", objectFit: "cover" }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x240?text=No+Photo'; }}
            />
            <div style={{ padding: "24px" }}>
              <h2 style={{ color: "#fff", marginBottom: "8px" }}>{selectedGame.name}</h2>
              <p style={{ color: "#aaa", marginBottom: "4px" }}>Розробник: {selectedGame.surname}</p>
              <p style={{ color: "#aaa", marginBottom: "16px" }}>⭐ Рейтинг: {selectedGame.gpa}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#7c3aed", fontSize: "22px", fontWeight: "bold" }}>
                  {selectedGame.price > 0 ? `${selectedGame.price}$` : "Безкоштовно"}
                </span>
                {ownedIds.includes(selectedGame.id) ? (
                  <span style={{ color: "#4ade80", fontWeight: "bold" }}>✅ Вже у бібліотеці</span>
                ) : (
                  <button
                    onClick={() => handleBuy(selectedGame)}
                    style={{
                      background: "#7c3aed", color: "#fff", border: "none",
                      padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "15px"
                    }}
                  >
                    Купити
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                style={{
                  marginTop: "16px", width: "100%", background: "transparent",
                  border: "1px solid #333", color: "#aaa", padding: "8px",
                  borderRadius: "8px", cursor: "pointer"
                }}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно пополнения */}
      {showTopup && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}
          onClick={() => setShowTopup(false)}
        >
          <div
            style={{
              background: "#1a1a2e", borderRadius: "12px", padding: "32px",
              width: "360px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", marginBottom: "8px" }}>💰 Поповнення балансу</h2>
            <p style={{ color: "#aaa", marginBottom: "20px" }}>
              Поточний баланс: <strong style={{ color: "#7c3aed" }}>{parseFloat(balance || 0).toFixed(2)}$</strong>
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[10, 25, 50, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(String(amt))}
                  style={{
                    padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
                    background: topupAmount === String(amt) ? "#7c3aed" : "#2a2a3e",
                    color: "#fff", border: "none", fontSize: "14px"
                  }}
                >
                  +{amt}$
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Своя сума..."
              value={topupAmount}
              onChange={e => setTopupAmount(e.target.value)}
              style={{
                width: "100%", padding: "10px", borderRadius: "8px",
                background: "#2a2a3e", border: "1px solid #333", color: "#fff",
                marginBottom: "16px", boxSizing: "border-box"
              }}
            />
            <button
              onClick={handleTopup}
              style={{
                width: "100%", padding: "12px", background: "#7c3aed",
                color: "#fff", border: "none", borderRadius: "8px",
                cursor: "pointer", fontSize: "15px", marginBottom: "8px"
              }}
            >
              Поповнити
            </button>
            <button
              onClick={() => setShowTopup(false)}
              style={{
                width: "100%", padding: "10px", background: "transparent",
                border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer"
              }}
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}