import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProfilePage({ user, setUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const avatarRef = useRef();

  const isMe = user?.id === parseInt(id);
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [inventory, setInventory] = useState([]);

    useEffect(() => {
    // добавь в существующий useEffect если isMe
    if (isMe) {
        fetch("https://localhost:7059/api/market/inventory", { headers })
        .then(r => r.json())
        .then(setInventory)
        .catch(() => {});
    }
    }, [id]);
  useEffect(() => {
    const url = isMe
      ? "https://localhost:7059/api/profile/me"
      : `https://localhost:7059/api/profile/${id}`;

    fetch(url, isMe ? { headers } : {})
      .then(r => r.json())
      .then(data => { setProfile(data); setNewUsername(data.user.username); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSaveUsername() {
    if (!newUsername.trim()) return;
    const res = await fetch("https://localhost:7059/api/profile/me", {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername.trim() })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    setProfile(prev => ({ ...prev, user: data }));
    const updatedUser = { ...user, username: data.username };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    setMessage("✅ Ім'я змінено");
    setTimeout(() => setMessage(""), 2000);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("https://localhost:7059/api/profile/me/avatar", {
      method: "POST",
      headers,
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(prev => ({ ...prev, user: { ...prev.user, photo: data.fileName } }));
      setMessage("✅ Аватар оновлено");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (!profile) return <div style={{ textAlign: "center", marginTop: "100px", color: "#aaa" }}>Користувача не знайдено</div>;

  const { user: u, library, screenshots } = profile;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 16px" }}>

      {message && (
        <div style={{
          position: "fixed", top: "80px", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a2e", border: "1px solid #7c3aed", color: "#fff",
          padding: "12px 24px", borderRadius: "8px", zIndex: 9999, fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      {/* Шапка профиля */}
      <div style={{
        background: "#1a1a2e", borderRadius: "14px", padding: "32px",
        border: "1px solid #2a2a3e", marginBottom: "24px",
        display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap"
      }}>
        {/* Аватар */}
        <div style={{ position: "relative" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%",
            background: "#2a2a3e", overflow: "hidden",
            border: "3px solid #7c3aed"
          }}>
            {u.photo && u.photo !== "User.png" ? (
              <img
                src={`https://localhost:7059/avatars/${u.photo}`}
                alt={u.username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => e.target.style.display = "none"}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "36px", fontWeight: "bold", color: "#fff"
              }}>
                {u.username[0].toUpperCase()}
              </div>
            )}
          </div>
          {isMe && (
            <>
              <button
                onClick={() => avatarRef.current.click()}
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  background: "#7c3aed", border: "none", borderRadius: "50%",
                  width: "28px", height: "28px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px"
                }}
              >
                📷
              </button>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </>
          )}
        </div>

        {/* Инфо */}
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <input
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: "8px", background: "#2a2a3e",
                  border: "1px solid #7c3aed", color: "#fff", fontSize: "18px", outline: "none"
                }}
              />
              <button onClick={handleSaveUsername} style={{ padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Зберегти
              </button>
              <button onClick={() => { setEditing(false); setError(""); }} style={{ padding: "8px 16px", background: "transparent", color: "#aaa", border: "1px solid #333", borderRadius: "8px", cursor: "pointer" }}>
                Скасувати
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <h1 style={{ color: "#fff", margin: 0, fontSize: "24px" }}>{u.username}</h1>
              {u.role === "Admin" && (
                <span style={{ background: "#7c3aed", color: "#fff", fontSize: "11px", padding: "3px 10px", borderRadius: "4px" }}>Admin</span>
              )}
              {isMe && (
                <button onClick={() => setEditing(true)} style={{ background: "transparent", border: "1px solid #333", color: "#aaa", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                  ✏️ Редагувати
                </button>
              )}
            </div>
          )}
          {error && <p style={{ color: "#ef4444", fontSize: "13px", margin: "4px 0" }}>{error}</p>}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>🎮 Ігор: {library.length}</span>
            <span style={{ color: "#666", fontSize: "14px" }}>📷 Скриншотів: {screenshots.length}</span>
            {isMe && profile.user.balance !== undefined && (
              <span style={{ color: "#7c3aed", fontSize: "14px" }}>💰 {parseFloat(profile.user.balance).toFixed(2)}$</span>
            )}
          </div>
        </div>

        {/* Кнопка написать */}
        {!isMe && user && (
          <button
            onClick={() => navigate("/chat", { state: { partnerId: u.id, partnerUsername: u.username } })}
            style={{ padding: "10px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            💬 Написати
          </button>
        )}
      </div>

      {/* Библиотека */}
      {library.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>🎮 Бібліотека ігор</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
            {library.map(g => (
              <div key={g.id} style={{ background: "#1a1a2e", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a3e" }}>
                <img
                  src={`https://localhost:7059/pics/${g.photo}`}
                  alt={g.name}
                  style={{ width: "100%", height: "80px", objectFit: "cover" }}
                  onError={e => e.target.style.display = "none"}
                />
                <div style={{ padding: "8px" }}>
                  <p style={{ color: "#fff", fontSize: "12px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</p>
                  <p style={{ color: "#facc15", fontSize: "11px", margin: "2px 0 0" }}>⭐ {g.gpa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Скриншоты */}
      {screenshots.length > 0 && (
        <div>
          <h2 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>📷 Скриншоти</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {screenshots.map(s => (
              <div key={s.id} style={{ background: "#1a1a2e", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a3e" }}>
                <img
                  src={`https://localhost:7059/screenshots/${s.fileName}`}
                  alt={s.caption || "screenshot"}
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  onError={e => e.target.style.display = "none"}
                />
                {s.caption && <p style={{ color: "#aaa", fontSize: "12px", padding: "6px 10px", margin: 0 }}>{s.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Інвентар */}
<div style={{ marginBottom: "24px" }}>
  <h2 style={{ color: "#fff", fontSize: "18px", marginBottom: "16px" }}>
    🎒 Інвентар ({inventory.length})
  </h2>
  {inventory.length === 0 ? (
    <div style={{
      background: "#1a1a2e", borderRadius: "10px", padding: "32px",
      border: "1px solid #2a2a3e", textAlign: "center"
    }}>
      <p style={{ color: "#555", margin: 0 }}>Інвентар порожній — купіть предмети на маркеті</p>
    </div>
  ) : (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
      {inventory.map(ii => (
        <div key={ii.id} style={{
          background: "#1a1a2e", borderRadius: "8px", overflow: "hidden",
          border: "1px solid #2a2a3e"
        }}>
          <div style={{ height: "100px", background: "#2a2a3e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ii.item.photo && ii.item.photo !== "default_item.png" ? (
              <img
                src={`https://localhost:7059/items/${ii.item.photo}`}
                alt={ii.item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => e.target.style.display = "none"}
              />
            ) : (
              <span style={{ fontSize: "36px" }}>🎮</span>
            )}
          </div>
          <div style={{ padding: "8px" }}>
            <p style={{ color: "#fff", fontSize: "12px", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ii.item.name}
            </p>
            <p style={{ color: "#666", fontSize: "11px", margin: 0 }}>{ii.item.game.name}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
      
    </div>
  );
}