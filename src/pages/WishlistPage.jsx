import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/WishlistPage.css";

const API = "https://localhost:7059/api/wishlist";

export default function WishlistPage({ user, onPurchase }) {
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ownedIds, setOwnedIds] = useState([]);
  
  const [sortOption, setSortOption] = useState("Спочатку знижки");

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const sortOptionsList = [
    "Спочатку знижки", "За релевантністю", "Спочатку популярні",
    "Спочатку нові", "За оцінкою", "Від дешевих до дорогих",
    "Від дорогих до дешевих", "А – Я", "Я – А"
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headers = { Authorization: `Bearer ${user?.token}` };

  function showMsg(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  useEffect(() => {
    if (!user?.token) { 
      setLoading(false); 
      return; 
    }

    Promise.all([
      fetch(API, { headers }).then(r => r.ok ? r.json() : []),
      fetch("https://localhost:7059/api/library", { headers }).then(r => r.ok ? r.json() : [])
    ]).then(([wishlist, library]) => {
      setItems(wishlist);
      setOwnedIds(library.map(g => g.id));
      setLoading(false);
    }).catch((err) => {
      console.error("Помилка завантаження:", err);
      setLoading(false);
    });
  }, [user]);

  async function handleRemove(gameId) {
    try {
      const res = await fetch(`${API}/${gameId}`, { method: "DELETE", headers });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.game.id !== gameId));
        showMsg("🗑️ Видалено зі списку бажаного");
      } else {
        showMsg("❌ Помилка видалення (Бекенд)");
      }
    } catch (e) {
      showMsg("❌ Помилка з'єднання з сервером");
    }
  }

  async function handleBuy(game) {
    if (!user?.token) return;
    try {
      const res = await fetch(`https://localhost:7059/api/library/buy/${game.id}`, { method: "POST", headers });
      const data = await res.json();
      
      if (!res.ok) { 
        showMsg(`❌ ${data.message || "Помилка покупки"}`); 
        return; 
      }

      setOwnedIds(prev => [...prev, game.id]);
      await fetch(`${API}/${game.id}`, { method: "DELETE", headers });
      setItems(prev => prev.filter(i => i.game.id !== game.id));

      if (onPurchase) onPurchase();
      showMsg(`✅ ${game.name} придбано!`);
    } catch (e) {
      showMsg("❌ Помилка з'єднання з сервером");
    }
  }

  if (!user) {
    return (
      <div className="wishlist-layout wishlist-unauthorized">
        <div className="wishlist-unauthorized-content">
          <h2>Увійдіть, щоб побачити список бажаного</h2>
          <button onClick={() => navigate("/login")} className="btn-add-cart wishlist-login-btn">Увійти в акаунт</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-layout">
      {message && (
        <div className="wishlist-toast">
          {message}
        </div>
      )}

      <aside className="wishlist-sidebar">
        <h1 className="wishlist-title">Мій список бажаного</h1>
        
        <div className="filters-container">
          <div className="filters-header">
            <h3>Фільтри</h3>
            <button className="btn-reset">Скинути</button>
          </div>
          
          <div className="filter-search-box">
            <input type="text" placeholder="Пошук тегів..." />
            <span className="filter-search-clear">✕</span>
          </div>

          <div className="filter-group"><div className="filter-group-header">Жанр <span>˅</span></div></div>
          
          <div className="filter-group">
            <div className="filter-group-header">Ціна <span>˄</span></div>
            <div className="filter-group-content">
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> Безкоштовно</label>
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> До 100 гривень</label>
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> До 300 гривень</label>
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> До 600 гривень</label>
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> До 900 гривень</label>
              <label className="custom-radio"><input type="radio" name="price" /><span className="radio-mark"></span> Без обмежень</label>
              
              <div className="filter-divider"></div>
              
              <label className="custom-checkbox"><input type="checkbox" /><span className="checkbox-mark"></span> Знижки</label>
            </div>
          </div>
          
          <div className="filter-group"><div className="filter-group-header">Тип <span>˅</span></div></div>
          <div className="filter-group"><div className="filter-group-header">Особливості <span>˅</span></div></div>
          <div className="filter-group"><div className="filter-group-header">Платформа <span>˅</span></div></div>
          <div className="filter-group"><div className="filter-group-header">Івенти <span>˅</span></div></div>
        </div>
      </aside>

      <main className="wishlist-main">
        <div className="wishlist-top-bar">
          <div className="wishlist-search">
            <input type="text" placeholder="Пошук у Бажаному..." />
          </div>
          <div className="wishlist-sort" ref={sortRef}>
            <span className="sort-label">Сортування:</span>

            <div className="custom-select-container">
              <div 
                className="custom-select-trigger" 
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                {sortOption} <span className="arrow">˅</span>
              </div>

              {isSortOpen && (
                <ul className="custom-select-menu">
                  {sortOptionsList.map(option => (
                    <li 
                      key={option}
                      className={`custom-select-item ${sortOption === option ? 'active' : ''}`}
                      onClick={() => {
                        setSortOption(option);
                        setIsSortOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="wishlist-cards-container">
          {items.length === 0 ? (
            <div className="wishlist-empty">
              <p className="wishlist-empty-text">Список бажаного порожній</p>
              <button onClick={() => navigate("/")} className="btn-add-cart wishlist-empty-btn">До крамниці</button>
            </div>
          ) : (
            items.map(({ id, game, addedAt }) => (
              <div key={id} className="wishlist-card">
                <img 
                  src={`https://localhost:7059/images/${game.photo}`} 
                  alt={game.name} 
                  className="wishlist-card-img" 
                  onError={e => e.target.src = "/no-image.png"} 
                />
                
                <div className="wishlist-card-info">
                  <h3 className="wishlist-card-title">{game.name}</h3>
                  <div className="wishlist-tags">
                    <span className="wish-tag">{game.surname || "Інді"}</span>
                  </div>
                  <div className="wishlist-rating">
                    {game.gpa || "4.5"} <span className="star-icon">★</span>
                    <span className="added-date">
                      Додано: {new Date(addedAt).toLocaleDateString("uk-UA")}
                    </span>
                  </div>
                </div>

                <div className="wishlist-card-actions">
                  <button className="wishlist-remove-btn" onClick={() => handleRemove(game.id)}>✕</button>
                  
                  <div className="wishlist-price-block wishlist-price-single">
                     <span className="current-price">{game.price > 0 ? `${game.price}₴` : "Безкоштовно"}</span>
                  </div>
                  
                  {ownedIds.includes(game.id) ? (
                    <button className="btn-add-cart btn-in-library">✅ В бібліотеці</button>
                  ) : (
                    <button className="btn-add-cart" onClick={() => handleBuy(game)}>У кошик</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}