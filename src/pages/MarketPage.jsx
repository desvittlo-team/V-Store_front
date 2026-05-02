import { useEffect, useState } from "react";
import searchIcon from '../assets/search.png';
import '../style/MarketPage.css';

const API = "https://localhost:7059/api/market";

const ITEM_TYPES = [
  { value: "skin", label: "Скін", color: "#e879f9" },
  { value: "avatar", label: "Аватар", color: "#7c3aed" },
  { value: "sticker", label: "Стікер", color: "#facc15" },
  { value: "profile_background", label: "Фон профілю", color: "#4ade80" },
  { value: "game_item", label: "Предмет гри", color: "#60a5fa" },
  { value: "collectible", label: "Колекційне", color: "#f97316" },
  { value: "other", label: "Інше", color: "#94a3b8" },
];

function getTypeInfo(value) {
  return ITEM_TYPES.find(t => t.value === value) || ITEM_TYPES[ITEM_TYPES.length - 1];
}

export default function MarketPage({ user, onPurchase }) {
  const [items, setItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInventorySell, setShowInventorySell] = useState(false);
  const [myInventory, setMyInventory] = useState([]);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", gameId: "", itemType: "other" });

  const headers = { Authorization: `Bearer ${user?.token}` };

  function showMsg(msg) { setMessage(msg); setTimeout(() => setMessage(""), 3000); }

  useEffect(() => {
    fetch(API).then(r => r.json()).then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
    fetch("https://localhost:7059/api/games").then(r => r.json()).then(setGames);
  }, []);

  useEffect(() => {
    if (showInventorySell && user?.token) {
      fetch(`${API}/inventory/my`, { headers }).then(r => r.json()).then(setMyInventory);
    }
  }, [showInventorySell, user?.token]);

  async function handleSell(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.gameId) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("gameId", form.gameId);
    formData.append("itemType", form.itemType);
    if (form.description) formData.append("description", form.description);
    if (photoFile) formData.append("file", photoFile);

    const res = await fetch(API, { method: "POST", headers, body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) { showMsg(`${data.message}`); return; }

    setItems(prev => [{
      ...data,
      game: { id: parseInt(form.gameId), name: games.find(g => g.id === parseInt(form.gameId))?.name || "" },
      seller: { id: user.id, username: user.username }
    }, ...prev]);

    setForm({ name: "", description: "", price: "", gameId: "", itemType: "other" });
    setPhotoFile(null);
    setPreview(null);
    setShowForm(false);
    showMsg("Предмет виставлено!");
  }

  async function handleBuy(item) {
    if (!user?.token) { showMsg("Увійдіть щоб купити"); return; }
    const res = await fetch(`${API}/${item.id}/buy`, { method: "POST", headers });
    const data = await res.json();
    if (!res.ok) { showMsg(`${data.message}`); return; }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setSelected(null);
    if (onPurchase) onPurchase();
    showMsg(`${item.name} у вашому інвентарі!`);
  }

  async function handleDelete(id) {
    if (!confirm("Зняти з продажу?")) return;
    const res = await fetch(`${API}/${id}`, { method: "DELETE", headers });
    if (res.ok) { setItems(prev => prev.filter(i => i.id !== id)); setSelected(null); showMsg("🗑️ Знято"); }
  }

  async function handleSellFromInventory() {
    if (!selectedInvItem || !sellPrice) return;
    const res = await fetch(`${API}/inventory/${selectedInvItem}/sell`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(sellPrice) })
    });
    const data = await res.json();
    if (!res.ok) { showMsg(`${data.message}`); return; }
    showMsg("Виставлено на продаж!");
    setShowInventorySell(false);
    setSellPrice("");
    setSelectedInvItem(null);
    fetch(API).then(r => r.json()).then(setItems);
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = filterGame ? i.game.id === parseInt(filterGame) : true;
    const matchType = filterType ? i.itemType === filterType : true;
    return matchSearch && matchGame && matchType;
  });

  if (loading) return <div className="loading-screen">Завантаження...</div>;

  return (
    <div className="market-layout main-container">

      {message && <div className="toast-notification">{message}</div>}

      <div className="market-top-bar">
        <h1 className="market-title">🛒 Маркет спільноти</h1>
        <div className="market-controls">
          <div className="market-search">
            <input type="text" placeholder="Пошук предметів..." value={search} onChange={e => setSearch(e.target.value)} />
            <img src={searchIcon} alt="search" className="icon-sm" />
          </div>

          <select className="market-select" value={filterGame} onChange={e => setFilterGame(e.target.value)}>
            <option value="">Усі ігри</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select className="market-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Усі типи</option>
            {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {user?.role === "Admin" && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Створити лот</button>
          )}
          {user && user.role !== "Admin" && (
            <button className="btn-secondary" onClick={() => setShowInventorySell(true)}>🎒 Продати з інвентаря</button>
          )}
        </div>
      </div>

      {showForm && user?.role === "Admin" && (
        <div className="market-admin-panel">
          <h2>Створити предмет</h2>
          <form className="market-form-grid" onSubmit={handleSell}>
            <input className="market-input" placeholder="Назва *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="market-input" type="number" placeholder="Ціна ($) *" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0.01" step="0.01" required />
            <select className="market-input" value={form.gameId} onChange={e => setForm({ ...form, gameId: e.target.value })} required>
              <option value="">Виберіть гру *</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select className="market-input" value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })}>
              {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input className="market-input full-width" placeholder="Опис" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label className="market-file-label">
              {preview ? <img src={preview} alt="preview" className="preview-image" />
                : <span>📷 Фото предмета</span>}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) { setPhotoFile(f); setPreview(URL.createObjectURL(f)); } }} />
            </label>
            <div className="market-form-actions">
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? "Завантаження..." : "Створити"}
              </button>
              <button type="button" className="btn-cancel" onClick={() => { setShowForm(false); setForm({ name: "", description: "", price: "", gameId: "", itemType: "other" }); setPreview(null); }}>
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="market-empty">
          <div className="empty-icon">🛒</div>
          <p>Предметів не знайдено</p>
        </div>
      ) : (
        <div className="market-grid">
          {filtered.map(item => {
            const typeInfo = getTypeInfo(item.itemType);
            return (
              <div key={item.id} className="market-card" onClick={() => setSelected(item)}>
                <div className="market-card-img-box">
                  {item.photo && item.photo !== "default_item.png" ? (
                    <img src={`https://localhost:7059/items/${item.photo}`} alt={item.name} onError={e => e.target.style.display = "none"} />
                  ) : (
                    <span style={{ fontSize: "48px" }}>🎮</span>
                  )}
                </div>
                <div className="market-card-info">
                  <span className="type-badge" style={{ background: typeInfo.color + "33", color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                  <h3>{item.name}</h3>
                  <p className="game-name">{item.game.name}</p>
                  <div className="market-card-bottom">
                    <span className="price">{item.price}$</span>
                    <span className="seller">👤 {item.seller.username}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="market-modal-overlay" onClick={() => setSelected(null)}>
          <div className="market-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="market-modal-body">
              <div className="modal-item-photo">
                {selected.photo && selected.photo !== "default_item.png"
                  ? <img src={`https://localhost:7059/items/${selected.photo}`} alt={selected.name} onError={e => e.target.style.display = "none"} />
                  : <span>🎮</span>}
              </div>
              <div className="modal-item-details">
                <span className="type-badge" style={{ background: getTypeInfo(selected.itemType).color + "33", color: getTypeInfo(selected.itemType).color }}>
                  {getTypeInfo(selected.itemType).label}
                </span>
                <p className="game-name">🎮 {selected.game.name}</p>
                {selected.description && <p className="description">{selected.description}</p>}
                <div className="seller-info">Продавець: <span>{selected.seller.username}</span></div>
                <div className="price-tag">{selected.price}$</div>
                {user?.id === selected.seller.id ? (
                  <button className="btn-danger full-width" onClick={() => handleDelete(selected.id)}>🗑️ Зняти з продажу</button>
                ) : (
                  <button className="btn-primary full-width" onClick={() => handleBuy(selected)}>Купити за {selected.price}$</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showInventorySell && (
        <div className="market-modal-overlay" onClick={() => setShowInventorySell(false)}>
          <div className="market-modal-content inventory-modal" onClick={e => e.stopPropagation()}>
            <h2>Продати з інвентаря</h2>
            {myInventory.length === 0 ? (
              <p className="inventory-empty">Інвентар порожній</p>
            ) : (
              <div className="inventory-grid">
                {myInventory.map(ii => {
                  const typeInfo = getTypeInfo(ii.item.itemType);
                  return (
                    <div key={ii.id} onClick={() => setSelectedInvItem(ii.id)} className={`inventory-card ${selectedInvItem === ii.id ? "selected" : ""}`}>
                      {ii.item.photo && ii.item.photo !== "default_item.png"
                        ? <img src={`https://localhost:7059/items/${ii.item.photo}`} alt={ii.item.name} onError={e => e.target.style.display = "none"} />
                        : <div className="inventory-card-icon">🎮</div>}
                      <p className="inventory-card-name">{ii.item.name}</p>
                      <span className="inventory-card-type" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <input className="market-input full-width" type="number" placeholder="Ваша ціна ($)" value={sellPrice} onChange={e => setSellPrice(e.target.value)} min="0.01" step="0.01" />
            <button className="btn-primary full-width modal-btn" onClick={handleSellFromInventory} disabled={!selectedInvItem || !sellPrice}>
              Виставити на продаж
            </button>
            <button className="btn-cancel full-width modal-btn" onClick={() => setShowInventorySell(false)}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}