import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://localhost:7059/api/wishlist";

export default function WishlistPage({ user, onPurchase }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [ownedIds, setOwnedIds] = useState([]);
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${user?.token}` };

  function showMsg(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  useEffect(() => {
    if (!user?.token) { setLoading(false); return; }

    Promise.all([
      fetch(API, { headers }).then(r => r.json()),
      fetch("https://localhost:7059/api/library", { headers }).then(r => r.json())
    ]).then(([wishlist, library]) => {
      setItems(wishlist);
      setOwnedIds(library.map(g => g.id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  async function handleRemove(gameId) {
    const res = await fetch(`${API}/${gameId}`, { method: "DELETE", headers });
    if (res.ok) {
      setItems(prev => prev.filter(i => i.game.id !== gameId));
      showMsg("🗑️ Видалено зі списку бажань");
    }
  }

  async function handleBuy(game) {
    if (!user?.token) return;
    const res = await fetch(`https://localhost:7059/api/library/buy/${game.id}`, {
      method: "POST",
      headers
    });
    const data = await res.json();
    if (!res.ok) { showMsg(`❌ ${data.message}`); return; }

    setOwnedIds(prev => [...prev, game.id]);
    // автоматически убираем из вишлиста после покупки
    await fetch(`${API}/${game.id}`, { method: "DELETE", headers });
    setItems(prev => prev.filter(i => i.game.id !== game.id));

    if (onPurchase) onPurchase();
    showMsg(`✅ ${game.name} придбано!`);
  }

  if (loading) return <div className="loading-screen">Завантаження...</div>;

  if (!user) return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p style={{ color: "#aaa", fontSize: "18px" }}>Увійдіть щоб побачити список бажань</p>
      <button onClick={() => navigate("/login")}
        style={{ marginTop: "16px", padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
        Увійти
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

      {message && (
        <div style={{ position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", border: "1px solid #7c3aed", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 9999, fontSize: "14px" }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>💝 Список бажань</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>{items.length} ігор</p>
        </div>
        <button onClick={() => navigate("/")}
          style={{ padding: "10px 20px", background: "#2a2a3e", color: "#fff", border: "1px solid #333", borderRadius: "8px", cursor: "pointer" }}>
          До крамниці
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>💝</div>
          <p style={{ color: "#aaa", fontSize: "18px", marginBottom: "8px" }}>Список бажань порожній</p>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>Додайте ігри які хочете купити</p>
          <button onClick={() => navigate("/")}
            style={{ padding: "12px 28px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
            До крамниці
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map(({ id, game, addedAt }) => (
            <div key={id} style={{
              background: "#1a1a2e", borderRadius: "12px", padding: "16px 20px",
              border: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: "16px",
              transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#7c3aed"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a3e"}
            >
              {/* Постер */}
              <div style={{ width: "80px", height: "60px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#2a2a3e" }}>
                <img
                  src={`https://localhost:7059/pics/${game.photo}`}
                  alt={game.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => e.target.style.display = "none"}
                />
              </div>

              {/* Инфо */}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "16px" }}>{game.name}</h3>
                <p style={{ color: "#666", margin: "0 0 4px", fontSize: "13px" }}>{game.surname}</p>
                <span style={{ color: "#facc15", fontSize: "12px" }}>⭐ {game.gpa}</span>
              </div>

              {/* Дата добавления */}
              <div style={{ textAlign: "center", color: "#555", fontSize: "12px", flexShrink: 0 }}>
                <p style={{ margin: 0 }}>Додано</p>
                <p style={{ margin: 0 }}>{new Date(addedAt).toLocaleDateString("uk-UA")}</p>
              </div>

              {/* Цена и кнопки */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                <span style={{ color: "#7c3aed", fontSize: "18px", fontWeight: "bold" }}>
                  {game.price > 0 ? `${game.price}$` : "Безкоштовно"}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {ownedIds.includes(game.id) ? (
                    <span style={{ color: "#4ade80", fontSize: "13px", padding: "6px 12px" }}>✅ Придбано</span>
                  ) : (
                    <button onClick={() => handleBuy(game)}
                      style={{ padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                      Купити
                    </button>
                  )}
                  <button onClick={() => handleRemove(game.id)}
                    style={{ padding: "8px 12px", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}