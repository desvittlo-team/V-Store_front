import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LibraryPage({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.token) {
      setError("Увійдіть щоб побачити бібліотеку");
      setLoading(false);
      return;
    }

    fetch("https://localhost:7059/api/library", {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => { setGames(data); setLoading(false); })
      .catch(() => { setError("Помилка завантаження"); setLoading(false); });
  }, [user]);

  const filtered = games.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen">Завантаження...</div>;

  if (error) return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p style={{ color: "#aaa", fontSize: "18px" }}>{error}</p>
      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: "16px", padding: "10px 24px", background: "#7c3aed",
          color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"
        }}
      >
        Увійти
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>

      {/* Шапка */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>Моя бібліотека</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>{games.length} {games.length === 1 ? "гра" : "ігор"}</p>
        </div>
        <input
          type="text"
          placeholder="Пошук у бібліотеці..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "10px 16px", borderRadius: "8px", border: "1px solid #333",
            background: "#1a1a2e", color: "#fff", fontSize: "14px", width: "260px",
            outline: "none"
          }}
        />
      </div>

      {/* Пусто */}
      {games.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎮</div>
          <p style={{ color: "#aaa", fontSize: "18px", marginBottom: "8px" }}>Бібліотека порожня</p>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px" }}>Придбайте ігри у крамниці щоб вони з'явились тут</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 28px", background: "#7c3aed", color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px"
            }}
          >
            До крамниці
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>Нічого не знайдено</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {filtered.map(game => (
            <div
              key={game.id}
              style={{
                background: "#1a1a2e", borderRadius: "10px", overflow: "hidden",
                border: "1px solid #2a2a3e", transition: "transform 0.2s, border-color 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#7c3aed";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#2a2a3e";
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={`https://localhost:7059/images/${game.photo}`}
                  alt={game.name}
                  style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.src = "https://via.placeholder.com/200x130?text=No+Photo"; }}
                />
                <span style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "rgba(0,0,0,0.7)", color: "#4ade80",
                  fontSize: "11px", padding: "3px 8px", borderRadius: "4px"
                }}>
                  ✅ Придбано
                </span>
              </div>
              <div style={{ padding: "12px" }}>
                <h3 style={{ color: "#fff", fontSize: "14px", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {game.name}
                </h3>
                <p style={{ color: "#666", fontSize: "12px", margin: "0 0 8px" }}>{game.surname}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#facc15", fontSize: "12px" }}>⭐ {game.gpa}</span>
                  <span style={{ color: "#555", fontSize: "11px" }}>
                    {new Date(game.purchasedAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <button style={{
                  marginTop: "10px", width: "100%", padding: "7px",
                  background: "#7c3aed", color: "#fff", border: "none",
                  borderRadius: "6px", cursor: "pointer", fontSize: "13px"
                }}>
                  ▶ Грати
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}