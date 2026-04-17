import React, { useState } from "react";
import searchIcon from '../assets/search.png'; // Перевір, щоб розширення збігалося

// Фейкові дані для Маркету (замість зламаного бекенду)
const mockMarketItems = [
  { id: 1, name: "Куртка Девіда", price: 15.50, photo: "https://via.placeholder.com/200?text=Jacket", game: { name: "Cyberpunk 2077" }, seller: { username: "GhostRogue" }, description: "Легендарна куртка з гри." },
  { id: 2, name: "Срібний меч", price: 45.00, photo: "https://via.placeholder.com/200?text=Sword", game: { name: "The Witcher 3" }, seller: { username: "Zubarik" }, description: "Меч для чудовиськ." },
  { id: 3, name: "Шолом N7", price: 8.99, photo: "https://via.placeholder.com/200?text=Helmet", game: { name: "Mass Effect" }, seller: { username: "NikaNii" }, description: "Стандартний шолом піхоти." },
  { id: 4, name: "Скін на зброю: Неон", price: 2.50, photo: "https://via.placeholder.com/200?text=Skin", game: { name: "Counter-Strike 2" }, seller: { username: "sanya_KAL" }, description: "Яскравий скін." },
];

const mockGamesList = [
  { id: 101, name: "Cyberpunk 2077" },
  { id: 102, name: "The Witcher 3" },
  { id: 103, name: "Counter-Strike 2" }
];

export default function MarketPage({ user }) {
  // Використовуємо фейкові дані одразу, без loading
  const [items, setItems] = useState(mockMarketItems);
  const [games] = useState(mockGamesList);
  const [search, setSearch] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [selected, setSelected] = useState(null);
  
  // Стан для модалок
  const [showForm, setShowForm] = useState(false);
  const [showInventorySell, setShowInventorySell] = useState(false);
  
  const [message, setMessage] = useState("");

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleBuy = (item) => {
    if (!user) {
      showMsg("Увійдіть, щоб купити предмет");
      return;
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setSelected(null);
    showMsg(`Предмет "${item.name}" успішно придбано!`);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(null);
    showMsg("Предмет знято з продажу");
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = filterGame ? i.game.name === filterGame : true;
    return matchSearch && matchGame;
  });

  return (
    <div className="market-layout main-container">
      
      {message && <div className="toast-notification">{message}</div>}

      {/* Верхня панель Маркету */}
      <div className="market-top-bar">
        <h1 className="market-title">Маркет спільноти</h1>
        
        <div className="market-controls">
          <div className="market-search">
            <input 
              type="text" 
              placeholder="Пошук предметів..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            <img src={searchIcon} alt="search" className="icon-sm" />
          </div>

          <select className="market-select" value={filterGame} onChange={e => setFilterGame(e.target.value)}>
            <option value="">Усі ігри</option>
            {games.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          {user?.role === "Admin" && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Створити лот
            </button>
          )}

          {user && user.role !== "Admin" && (
            <button className="btn-secondary" onClick={() => setShowInventorySell(true)}>
              Продати з інвентаря
            </button>
          )}
        </div>
      </div>

      {/* Сітка предметів */}
      <div className="market-grid">
        {filtered.length === 0 ? (
          <p className="empty-text">Предметів не знайдено.</p>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="market-card" onClick={() => setSelected(item)}>
              <div className="market-card-img-box">
                <img src={item.photo} alt={item.name} />
              </div>
              <div className="market-card-info">
                <h3>{item.name}</h3>
                <p className="game-name">{item.game.name}</p>
                <div className="market-card-bottom">
                  <span className="price">{item.price.toFixed(2)} $</span>
                  <span className="seller">{item.seller.username}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальне вікно: Перегляд предмету */}
      {selected && (
        <div className="slush-modal-overlay" onClick={() => setSelected(null)}>
          <div className="slush-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            
            <div className="market-modal-body">
              <img src={selected.photo} alt={selected.name} className="modal-item-img" />
              <div className="modal-item-details">
                <p className="game-name">{selected.game.name}</p>
                <p className="description">{selected.description}</p>
                <div className="seller-info">Продавець: <span>{selected.seller.username}</span></div>
                <div className="price-tag">{selected.price.toFixed(2)} $</div>
                
                {user?.username === selected.seller.username ? (
                  <button className="btn-danger full-width" onClick={() => handleDelete(selected.id)}>
                    Зняти з продажу
                  </button>
                ) : (
                  <button className="btn-primary full-width" onClick={() => handleBuy(selected)}>
                    Купити
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}