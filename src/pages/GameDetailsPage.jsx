import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GameDetailsPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`https://localhost:7059/api/games/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Game not found");
        return res.json();
      })
      .then(setGame)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleBuy = async () => {
    if (!user?.token) return navigate("/login");
    try {
      const res = await fetch(`https://localhost:7059/api/library/buy/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) showToast("Гру придбано та додано до бібліотеки!");
      else showToast(`${data.message || "Помилка"}`);
    } catch {
      showToast("Помилка з'єднання з сервером");
    }
  };

  const addToCart = async () => {
    if (!user?.token) return navigate("/login");
    try {
      const res = await fetch(`https://localhost:7059/api/cart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({ userId: user.id, gameId: parseInt(id), quantity: 1 })
      });
      if (res.ok) showToast("Гру додано у кошик!");
      else showToast("Помилка при додаванні");
    } catch {
      showToast("Помилка сервера");
    }
  };

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (!game) return null;

  const mockTags = ["шутер", "екшн", "кіберпанк", "відкритий світ", "майбутнє"];

  return (
    <div className="game-details-page main-container">
      {message && <div className="toast-notification">{message}</div>}

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
                <p>{game.name} — неймовірна гра від студії {game.surname || "невідомого розробника"}. Це пригодницький бойовик, де кожне ваше рішення впливає на історію.</p>
              </div>
              <h2 className="section-title">Комплекти</h2>
              <div className="bundle-card">
                <h3>{game.name} Standard Edition</h3>
                <p className="bundle-desc">Повна версія гри та цифровий саундтрек у подарунок.</p>
                <div className="bundle-price-row">
                  <span>{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
                  <button className="buy-btn-small" onClick={addToCart}>У кошик</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="tab-content specs-tab">
              <div className="specs-grid">
                <div className="spec-column">
                  <h3>Мінімальні налаштування</h3>
                  <div className="spec-item"><strong>ОС:</strong> Windows 10/11</div>
                  <div className="spec-item"><strong>Процесор:</strong> Core i5-8400</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 8 GB RAM</div>
                  <div className="spec-item"><strong>Графіка:</strong> GTX 1060</div>
                </div>
                <div className="spec-column">
                  <h3>Рекомендовані налаштування</h3>
                  <div className="spec-item"><strong>ОС:</strong> Windows 11</div>
                  <div className="spec-item"><strong>Процесор:</strong> Core i7-12700</div>
                  <div className="spec-item"><strong>Пам'ять:</strong> 16 GB RAM</div>
                  <div className="spec-item"><strong>Графіка:</strong> RTX 3060</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="details-sidebar">
          <img className="sidebar-img" src={`https://localhost:7059/images/${game.photo}`} alt="cover" />
          <h2 className="sidebar-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</h2>
          
          <button className="action-btn buy" onClick={handleBuy}>Купити</button>
          <div className="cart-actions">
            <button className="action-btn add-cart" onClick={addToCart}>Додати у кошик</button>
            <button className="action-btn wishlist-btn">♡</button>
          </div>

          <div className="meta-info">
            <div className="meta-row"><span>Дата виходу</span> <span>2024</span></div>
            <div className="meta-row"><span>Розробник</span> <span>{game.surname}</span></div>
            <div className="meta-row"><span>Рейтинг</span> <span>{game.gpa || "9.0"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}