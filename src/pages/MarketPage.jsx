import { useEffect, useState } from "react";

const API = "https://localhost:7059/api/market";

export default function MarketPage({ user, onPurchase }) {
  const [items, setItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInventorySell, setShowInventorySell] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterGame, setFilterGame] = useState("");
  const [form, setForm] = useState({ name: "", description: "", price: "", gameId: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [myInventory, setMyInventory] = useState([]);
  const [sellPrice, setSellPrice] = useState("");
  const [selectedInvItem, setSelectedInvItem] = useState(null);

  const headers = { Authorization: `Bearer ${user?.token}` };

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("https://localhost:7059/api/games")
      .then(r => r.json())
      .then(setGames);
  }, []);

  useEffect(() => {
    if (showInventorySell && user?.token) loadMyInventory();
  }, [showInventorySell]);

  function showMsg(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function loadMyInventory() {
    const res = await fetch(`${API}/inventory/my`, { headers });
    if (res.ok) setMyInventory(await res.json());
  }

  async function handleSell(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.gameId) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("gameId", form.gameId);
    if (form.description) formData.append("description", form.description);
    if (photoFile) formData.append("file", photoFile);

    const res = await fetch(API, {
      method: "POST",
      headers,
      body: formData
    });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) { showMsg(`❌ ${data.message}`); return; }

    const newItem = {
      ...data,
      game: { id: parseInt(form.gameId), name: games.find(g => g.id === parseInt(form.gameId))?.name || "" },
      seller: { id: user.id, username: user.username }
    };
    setItems(prev => [newItem, ...prev]);
    setForm({ name: "", description: "", price: "", gameId: "" });
    setPhotoFile(null);
    setPreview(null);
    setShowForm(false);
    showMsg("✅ Предмет виставлено на продаж!");
  }

  async function handleBuy(item) {
    if (!user?.token) { showMsg("❌ Увійдіть щоб купити"); return; }
    const res = await fetch(`${API}/${item.id}/buy`, {
      method: "POST",
      headers
    });
    const data = await res.json();
    if (!res.ok) { showMsg(`❌ ${data.message}`); return; }
    setItems(prev => prev.filter(i => i.id !== item.id));
    setSelected(null);
    if (onPurchase) onPurchase();
    showMsg(`✅ ${item.name} у вашому інвентарі!`);
  }

  async function handleDelete(id) {
    if (!confirm("Зняти з продажу?")) return;
    const res = await fetch(`${API}/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id));
      setSelected(null);
      showMsg("🗑️ Знято з продажу");
    }
  }

  async function handleSellFromInventory() {
    if (!selectedInvItem || !sellPrice) return;
    const res = await fetch(`${API}/inventory/${selectedInvItem}/sell`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(sellPrice) })
    });
    const data = await res.json();
    if (!res.ok) { showMsg(`❌ ${data.message}`); return; }
    showMsg("✅ Предмет виставлено на продаж!");
    setShowInventorySell(false);
    setSellPrice("");
    setSelectedInvItem(null);
    fetch(API).then(r => r.json()).then(setItems);
  }

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchGame = filterGame ? i.game.id === parseInt(filterGame) : true;
    return matchSearch && matchGame;
  });

  if (loading) return <div className="loading-screen">Завантаження...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

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

      {/* Шапка */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>🛒 Маркет</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>{filtered.length} предметів</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Пошук предмета..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: "8px", border: "1px solid #333",
              background: "#1a1a2e", color: "#fff", fontSize: "14px", outline: "none", width: "200px"
            }}
          />
          <select
            value={filterGame}
            onChange={e => setFilterGame(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: "8px", border: "1px solid #333",
              background: "#1a1a2e", color: "#fff", fontSize: "14px", outline: "none"
            }}
          >
            <option value="">Всі ігри</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {/* Кнопка админа — создать предмет */}
          {user?.role === "Admin" && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "10px 20px", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
              }}
            >
              + Створити предмет
            </button>
          )}

          {/* Кнопка юзера — продать из инвентаря */}
          {user && user.role !== "Admin" && (
            <button
              onClick={() => setShowInventorySell(true)}
              style={{
                padding: "10px 20px", background: "#2a2a3e", color: "#fff",
                border: "1px solid #7c3aed", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
              }}
            >
              🎒 Продати з інвентаря
            </button>
          )}
        </div>
      </div>

      {/* Форма создания предмета (только админ) */}
      {showForm && user?.role === "Admin" && (
        <div style={{
          background: "#1a1a2e", borderRadius: "12px", padding: "24px",
          border: "1px solid #2a2a3e", marginBottom: "24px"
        }}>
          <h2 style={{ color: "#fff", marginBottom: "20px", fontSize: "18px" }}>Створити предмет</h2>
          <form onSubmit={handleSell} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <input
              placeholder="Назва предмета *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", outline: "none" }}
            />
            <input
              type="number"
              placeholder="Ціна ($) *"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              min="0.01"
              step="0.01"
              required
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", outline: "none" }}
            />
            <select
              value={form.gameId}
              onChange={e => setForm({ ...form, gameId: e.target.value })}
              required
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", outline: "none" }}
            >
              <option value="">Виберіть гру *</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input
              placeholder="Опис (необов'язково)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: "10px 14px", borderRadius: "8px", background: "#2a2a3e", border: "1px solid #333", color: "#fff", outline: "none" }}
            />
            <label style={{
              gridColumn: "1 / -1", cursor: "pointer", border: "1px dashed #555",
              padding: "16px", borderRadius: "8px", textAlign: "center"
            }}>
              {preview
                ? <img src={preview} alt="preview" style={{ maxHeight: "120px", borderRadius: "6px" }} />
                : <span style={{ color: "#666" }}>📷 Фото предмета (необов'язково)</span>
              }
              <input
                type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) { setPhotoFile(f); setPreview(URL.createObjectURL(f)); }
                }}
              />
            </label>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  padding: "10px 24px", background: "#7c3aed", color: "#fff",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {uploading ? "Завантаження..." : "Створити"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm({ name: "", description: "", price: "", gameId: "" }); setPreview(null); }}
                style={{ padding: "10px 24px", background: "transparent", color: "#aaa", border: "1px solid #333", borderRadius: "8px", cursor: "pointer" }}
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список предметов */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
          <p style={{ color: "#aaa", fontSize: "18px" }}>Предметів немає</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              style={{
                background: "#1a1a2e", borderRadius: "10px", overflow: "hidden",
                border: "1px solid #2a2a3e", cursor: "pointer",
                transition: "transform 0.2s, border-color 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a3e"; }}
            >
              <div style={{ height: "140px", background: "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.photo && item.photo !== "default_item.png" ? (
                  <img
                    src={`https://localhost:7059/items/${item.photo}`}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: "48px" }}>🎮</span>
                )}
              </div>
              <div style={{ padding: "12px" }}>
                <h3 style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </h3>
                <p style={{ color: "#666", fontSize: "12px", margin: "0 0 8px" }}>{item.game.name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#7c3aed", fontWeight: "bold", fontSize: "15px" }}>{item.price}$</span>
                  <span style={{ color: "#555", fontSize: "11px" }}>👤 {item.seller.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно предмета */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: "#1a1a2e", borderRadius: "14px", width: "420px", maxWidth: "90vw", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ height: "200px", background: "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selected.photo && selected.photo !== "default_item.png" ? (
                <img
                  src={`https://localhost:7059/items/${selected.photo}`}
                  alt={selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => e.target.style.display = "none"}
                />
              ) : (
                <span style={{ fontSize: "72px" }}>🎮</span>
              )}
            </div>
            <div style={{ padding: "24px" }}>
              <h2 style={{ color: "#fff", marginBottom: "8px" }}>{selected.name}</h2>
              <p style={{ color: "#7c3aed", fontSize: "13px", margin: "0 0 4px" }}>🎮 {selected.game.name}</p>
              <p style={{ color: "#666", fontSize: "13px", margin: "0 0 12px" }}>👤 Продавець: {selected.seller.username}</p>
              {selected.description && (
                <p style={{ color: "#aaa", fontSize: "13px", margin: "0 0 16px", lineHeight: "1.5" }}>{selected.description}</p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#7c3aed", fontSize: "24px", fontWeight: "bold" }}>{selected.price}$</span>
              </div>
              {user?.id === selected.seller.id ? (
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{ width: "100%", padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px" }}
                >
                  🗑️ Зняти з продажу
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(selected)}
                  style={{ width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginBottom: "8px" }}
                >
                  Купити за {selected.price}$
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно продажи из инвентаря */}
      {showInventorySell && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowInventorySell(false)}
        >
          <div
            style={{ background: "#1a1a2e", borderRadius: "14px", padding: "28px", width: "460px", maxWidth: "90vw" }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>🎒 Продати з інвентаря</h2>

            {myInventory.length === 0 ? (
              <div>
                <p style={{ color: "#666", textAlign: "center", marginBottom: "16px" }}>
                  Інвентар порожній — спочатку купіть предмети на маркеті
                </p>
                <button
                  onClick={() => setShowInventorySell(false)}
                  style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}
                >
                  Закрити
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px", maxHeight: "240px", overflowY: "auto" }}>
                  {myInventory.map(ii => (
                    <div
                      key={ii.id}
                      onClick={() => setSelectedInvItem(ii.id)}
                      style={{
                        background: selectedInvItem === ii.id ? "#7c3aed" : "#2a2a3e",
                        borderRadius: "8px", padding: "10px", cursor: "pointer",
                        border: selectedInvItem === ii.id ? "2px solid #a855f7" : "2px solid transparent",
                        textAlign: "center"
                      }}
                    >
                      {ii.item.photo && ii.item.photo !== "default_item.png" ? (
                        <img
                          src={`https://localhost:7059/items/${ii.item.photo}`}
                          alt={ii.item.name}
                          style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px", marginBottom: "6px" }}
                          onError={e => e.target.style.display = "none"}
                        />
                      ) : (
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>🎮</div>
                      )}
                      <p style={{ color: "#fff", fontSize: "11px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ii.item.name}</p>
                      <p style={{ color: "#666", fontSize: "10px", margin: "2px 0 0" }}>{ii.item.game.name}</p>
                    </div>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Ваша ціна ($)"
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    background: "#2a2a3e", border: "1px solid #333", color: "#fff",
                    marginBottom: "16px", boxSizing: "border-box", outline: "none"
                  }}
                />
                <button
                  onClick={handleSellFromInventory}
                  disabled={!selectedInvItem || !sellPrice}
                  style={{
                    width: "100%", padding: "12px", background: "#7c3aed", color: "#fff",
                    border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "8px",
                    opacity: selectedInvItem && sellPrice ? 1 : 0.4
                  }}
                >
                  Виставити на продаж
                </button>
                <button
                  onClick={() => setShowInventorySell(false)}
                  style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #333", color: "#aaa", borderRadius: "8px", cursor: "pointer" }}
                >
                  Закрити
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}