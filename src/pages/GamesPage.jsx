import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getGames } from "../api/games";
import searchIcon from '../assets/search.png';
import wishlistIcon from '../assets/wishlist.png';
import cartIcon from '../assets/cart.png';
import '../style/GameStyles.css';

export default function GamesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    getGames()
      .then(data => setGames(data))
      .catch(err => console.error(err));
  }, []);

  const heroGames = games.slice(0, 4);
  const specialOffers = games.filter(g => g.price > 0 && g.price < 500).slice(0, 8);
  const recommended = games.slice(4, 12);
  const under100 = games.filter(g => g.price > 0 && g.price <= 100).slice(0, 8);
  const hits = games.slice(1, 4);
  const newReleases = games.slice(5, 8);
  const freeGames = games.filter(g => g.price === 0).slice(0, 4);

  const goToGame = (id) => navigate(`/game/${id}`);

  const getImgUrl = (photo) => {
    if (!photo) return '/no-image.png';
    return `https://localhost:7059/images/${photo}`;
  };

  const Carousel = ({ title, gamesList, isVertical }) => {
    const scrollRef = useRef(null);
    const scroll = (offset) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      }
    };

    if (!gamesList || gamesList.length === 0) return null;

    return (
      <section className="store-section">
        <div className="section-header">
          <h2>{title}</h2>
          <span className="see-all">Дивитись більше &gt;</span>
        </div>
        <div className="carousel-wrapper">
          <button className="carousel-arrow left" onClick={() => scroll(-400)}>❮</button>
          <div className="carousel-track" ref={scrollRef}>
            {gamesList.map(game => (
              <div 
                key={game.id} 
                className={`store-card ${isVertical ? 'vertical' : 'horizontal'}`} 
                onClick={() => goToGame(game.id)}
              >
                <img src={getImgUrl(game.photo)} alt={game.name} className="store-card-img" onError={(e) => { e.target.src = '/no-image.png'; }} />
                <div className="store-card-info">
                  <h3 className="store-card-title">{game.name}</h3>
                  <div className="store-price-block">
                    <div className="prices">
                      <span className="current-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-arrow right" onClick={() => scroll(400)}>❯</button>
        </div>
      </section>
    );
  };

  const renderColCard = (game) => (
    <div key={game.id} className="store-card horizontal" onClick={() => goToGame(game.id)}>
      <img src={getImgUrl(game.photo)} alt={game.name} className="store-card-img" onError={(e) => { e.target.src = '/no-image.png'; }} />
      <div className="store-card-info">
        <h3 className="store-card-title">{game.name}</h3>
        <div className="store-price-block">
          <div className="prices">
            <span className="current-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="store-layout">
      <div className="store-top-bar">
        <div className="store-search-nav-container">
          <div className="store-search-input-wrapper">
            <input type="text" placeholder="Пошук у Крамниці..." />
            <img src={searchIcon} alt="search" className="icon-search" />
          </div>
          <div className="store-top-links">
            <span className="active">Каталог</span>
            <span>Новини</span>
          </div>
        </div>
        <div className="store-top-actions">
            <button className="icon-btn-circle" onClick={() => navigate('/wishlist')}>
              <img src={wishlistIcon} alt="wishlist" />
            </button>
            <button className="icon-btn-circle" onClick={() => navigate('/cart')}>
              <img src={cartIcon} alt="cart" />
            </button>
          </div>
      </div>

      <div className="store-content">
        {heroGames.length > 0 && heroGames[heroIndex] && (
          <div className="store-hero-banner" onClick={() => goToGame(heroGames[heroIndex].id)}>
            <img src={getImgUrl(heroGames[heroIndex].photo)} alt="hero" className="hero-bg" onError={(e) => { e.target.src = '/no-image.png'; }} />
            
            <button className="hero-arrow left" onClick={(e) => { e.stopPropagation(); setHeroIndex(prev => prev === 0 ? heroGames.length - 1 : prev - 1); }}>❮</button>
            <button className="hero-arrow right" onClick={(e) => { e.stopPropagation(); setHeroIndex(prev => (prev + 1) % heroGames.length); }}>❯</button>

            <div className="hero-content">
              <div className="hero-price-block">
                <span className="current-price large">{heroGames[heroIndex].price > 0 ? `${heroGames[heroIndex].price}₴` : "Безкоштовно"}</span>
              </div>
              <div className="hero-text">
                <h2>{heroGames[heroIndex].name}</h2>
              </div>
            </div>
          </div>
        )}

        <Carousel title="Особливі пропозиції" gamesList={specialOffers} isVertical={false} />
        <Carousel title="Рекомендовані вам" gamesList={recommended} isVertical={true} />
        <Carousel title="До 100₴" gamesList={under100} isVertical={true} />

        <section className="store-three-cols">
          <div className="col">
            <div className="section-header"><h2>Хіти продажу</h2></div>
            <div className="col-grid">{hits.map(renderColCard)}</div>
          </div>
          <div className="col">
            <div className="section-header"><h2>Нові релізи</h2></div>
            <div className="col-grid">{newReleases.map(renderColCard)}</div>
          </div>
          <div className="col">
            <div className="section-header"><h2>Безкоштовні</h2></div>
            <div className="col-grid">{freeGames.map(renderColCard)}</div>
          </div>
        </section>

        <section className="store-section">
          <div className="section-header">
            <h2>Всі ігри ({games.length})</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {games.map(game => (
              <div 
                key={game.id} 
                className="store-card vertical" 
                onClick={() => goToGame(game.id)}
              >
                <img src={getImgUrl(game.photo)} alt={game.name} className="store-card-img" onError={(e) => { e.target.src = '/no-image.png'; }} />
                <div className="store-card-info">
                  <h3 className="store-card-title">{game.name}</h3>
                  <div className="store-price-block">
                    <span className="current-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}