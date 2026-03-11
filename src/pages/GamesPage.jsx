import React from 'react';
import { useEffect, useState } from "react";
import { getGames, deleteGame } from "../api/games";
import { useNavigate } from "react-router-dom";

export default function GamesPage({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Видалити гру?")) return;
    const token = user?.token;
    try {
      await deleteGame(id, token);
      setGames(games.filter((g) => g.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading-screen">Завантаження...</div>;

  return (
    <div className="main-container">
      {/* Кнопка адміна */}
      {user?.role === "Admin" && (
        <div className="admin-controls">
          <button className="add-game-btn" onClick={() => navigate("/admin")}>
            + Додати гру в базу
          </button>
        </div>
      )}

      {/* Головний баннер */}
      <section className="hero-section">
        {games.length > 0 ? (
          <div 
            className="main-banner" 
            style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(https://localhost:7059/images/${games[0].photo})` }}
          >
            <div className="banner-content">
              <span className="discount-tag">-40%</span>
              <h1 className="banner-title">{games[0].name}</h1>
              <p className="banner-desc">Найкраща пропозиція тижня вже у крамниці.</p>
              <button className="buy-btn">Придбати зараз</button>
            </div>
          </div>
        ) : (
          <div className="main-banner placeholder-banner">
            <div className="banner-content">
              <h1>главный баннер</h1>
            </div>
          </div>
        )}
      </section>

      {/* Секція Особливі пропозиції */}
      <section className="category-section">
        <div className="section-header">
          <h2 className="category-title">Особливі пропозиції</h2>
          <span className="arrow-link">❯</span>
        </div>
        
        <div className="games-grid">
          {games.length > 0 ? (
            games.map((game) => (
              <div key={game.id} className="game-card">
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
                    <span className="current-price">{game.gpa ? `${game.gpa} ₴` : "Безкоштовно"}</span>
                  </div>
                  {user?.role === "Admin" && (
                    <div className="admin-actions">
                      <button onClick={() => navigate(`/admin?edit=${game.id}`)}>✏️</button>
                      <button onClick={() => handleDelete(game.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Скелети-заглушки, якщо база порожня */
            [1, 2, 3].map((i) => (
              <div key={i} className="game-card placeholder-card">
                <div className="card-image-wrapper"></div>
                <div className="card-info">
                  <div className="skeleton-line name"></div>
                  <div className="skeleton-line price"></div>
                  <p className="placeholder-text">Дані з бэкенду (getGames)</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}