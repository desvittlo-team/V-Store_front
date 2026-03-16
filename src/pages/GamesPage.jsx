import React, { useEffect, useState } from "react";
import { getGames } from "../api/games";
import GameCarousel from "../components/GameCarousel";
import searchIcon from '../assets/search.png';
import wishlistIcon from '../assets/wishlist.png';
import cartIcon from '../assets/cart.png';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames()
      .then(setGames)
      .finally(() => setLoading(false));
  }, []);

  // if (loading) return <div className="loading-screen">Завантаження...</div>;

  const heroGame = games[0] || null;
  const specialOffers = games.slice(1, 6); 
  const recommended = games.slice(2, 8); 
  const under100 = games.slice(3, 9); 
  
  const topSellers = games.slice(0, 3);
  const newReleases = games.slice(3, 6);
  const freeGames = games.slice(6, 9);

  const renderGameCard = (game) => (
    <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
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
          <span className="discount-badge">-20%</span>
          <span className="old-price">{Math.floor((game.gpa || 0) * 1.2)} ₴</span>
          <span className="current-price">{game.gpa ? `${game.gpa} ₴` : "Безкоштовно"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <section className="hero-section">
        {heroGame ? (
          <div 
            className="main-banner" 
            style={{ backgroundImage: `linear-gradient(to right, rgba(2, 26, 31, 0.9), transparent), url(https://localhost:7059/images/${heroGame.photo})` }}
          >
            <div className="banner-content">
              <span className="discount-tag">-40%</span>
              <h1 className="banner-title">{heroGame.name}</h1>
              <p className="banner-desc">Найкраща пропозиція тижня вже у крамниці.</p>
              <button className="buy-btn">Придбати зараз</button>
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
            <button className="icon-btn">
              <img src={wishlistIcon} alt="wishlist" />
            </button>
            <button className="icon-btn">
              <img src={cartIcon} alt="cart" />
            </button>
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
              <div className="section-header">
                <h2 className="category-title">Хіти продажу</h2>
                <span className="arrow-link">❯</span>
              </div>
              <div className="column-grid">
                {topSellers.map(renderGameCard)}
              </div>
            </div>
            <div className="column">
              <div className="section-header">
                <h2 className="category-title">Нові релізи</h2>
                <span className="arrow-link">❯</span>
              </div>
              <div className="column-grid">
                {newReleases.map(renderGameCard)}
              </div>
            </div>
            <div className="column">
              <div className="section-header">
                <h2 className="category-title">Безкоштовні</h2>
                <span className="arrow-link">❯</span>
              </div>
              <div className="column-grid">
                {freeGames.map(renderGameCard)}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}