import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGames } from "../api/games";

export default function GameDetailsPage({ user }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about"); // about | specs | community

  useEffect(() => {
    // нету api
    getGames()
      .then((games) => {
        const found = games.find((g) => g.id.toString() === id);
        setGame(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (!game) return <div className="loading-screen">Гру не знайдено</div>;

  // Фейкові дані 
  const mockTags = ["шутер", "екшн", "кіберпанк", "відкритий світ", "майбутнє"];
  const price = game.gpa || 1099;

  return (
    <div className="game-details-page main-container">
      
      {/* Навігація вкладок */}
      <div className="details-tabs">
        <button className={activeTab === "about" ? "active" : ""} onClick={() => setActiveTab("about")}>Про гру</button>
        <button className={activeTab === "specs" ? "active" : ""} onClick={() => setActiveTab("specs")}>Характеристики</button>
        <button className={activeTab === "community" ? "active" : ""} onClick={() => setActiveTab("community")}>Спільнота</button>
      </div>

      <div className="details-header">
        <h1>{game.name}</h1>
        <div className="rating-stars">5.0 ⭐⭐⭐⭐⭐</div>
      </div>

      <div className="details-grid">
        {/* ЛІВА КОЛОНКА */}
        <div className="details-main">
          
          {activeTab === "about" && (
            <div className="tab-content about-tab">
              <div className="main-media">
                <img src={`https://localhost:7059/images/${game.photo}`} alt={game.name} />
              </div>
              
              <div className="tags-row">
                {mockTags.map(tag => <span key={tag} className="game-tag">{tag}</span>)}
              </div>

              <div className="game-description">
                <p>{game.name} — пригодницький бойовик і рольова гра з відкритим світом. Дія відбувається у темному майбутньому, небезпечного мегаполіса, одержимого владою, гламуром і ненаситною модифікацією тіла.</p>
              </div>

              <h2 className="section-title">Комплекти</h2>
              <div className="bundle-card">
                <h3>{game.name}</h3>
                <p className="bundle-desc">Базова гра + Крутий контент + Дуже корисний контент</p>
                <div className="bundle-price-row">
                  <span>{price}₴</span>
                  <button className="buy-btn-small">У кошик</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="tab-content specs-tab">
              <div className="specs-grid">
                <div className="spec-column">
                  <h3>Мінімальні налаштування</h3>
                  <div className="spec-item"><strong>Версія системи:</strong> 64-bit Windows 10</div>
                  <div className="spec-item"><strong>CPU:</strong> Core i7-6700 or Ryzen 5 1600</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 12 GB ОП</div>
                  <div className="spec-item"><strong>GPU:</strong> GeForce GTX 1060 6GB or Radeon RX 580 8GB</div>
                  <div className="spec-item"><strong>Обсяг пам'яті:</strong> 70 GB</div>
                </div>
                <div className="spec-column">
                  <h3>Рекомендовані налаштування</h3>
                  <div className="spec-item"><strong>Версія системи:</strong> 64-bit Windows 10</div>
                  <div className="spec-item"><strong>CPU:</strong> Core i7-12700 or Ryzen 7 7800X3D</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 16 GB ОП</div>
                  <div className="spec-item"><strong>GPU:</strong> GeForce RTX 2060 SUPER or Radeon RX 5700 XT</div>
                  <div className="spec-item"><strong>Обсяг пам'яті:</strong> 70 GB</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ПРАВА КОЛОНКА (SIDEBAR) */}
        <div className="details-sidebar">
          <img className="sidebar-img" src={`https://localhost:7059/images/${game.photo}`} alt="mini" />
          <h2 className="sidebar-price">{price}₴</h2>
          
          <button className="action-btn buy">Купити</button>
          <div className="cart-actions">
            <button className="action-btn add-cart">Додати у кошик</button>
            <button className="action-btn wishlist-btn">♡</button>
          </div>

          <div className="meta-info">
            <div className="meta-row"><span>Дата виходу</span> <span>10.12.2020</span></div>
            <div className="meta-row"><span>Розробник</span> <span>{game.surname || "CD PROJEKT RED"}</span></div>
            <div className="meta-row"><span>Видавець</span> <span>Slush Inc</span></div>
          </div>

          <div className="friends-widget">
            <h4>Друзів бажають цю гру: 2</h4>
            <div className="friends-list">
               <span className="friend-avatar">G</span>
               <span className="friend-avatar">S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}