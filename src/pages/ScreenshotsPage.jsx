import { useEffect, useState, useRef } from "react";

export default function ScreenshotsPage({ user }) {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    fetch("https://localhost:7059/api/screenshots")
      .then(r => r.json())
      .then(data => { setScreenshots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    const res = await fetch("https://localhost:7059/api/screenshots/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setScreenshots([{ ...data, username: user.username }, ...screenshots]);
      setCaption("");
      setMessage("✅ Скриншот завантажено!");
      setTimeout(() => setMessage(""), 2500);
    }
    setUploading(false);
  }

  async function handleLike(id) {
    if (!user?.token) return;
    const res = await fetch(`https://localhost:7059/api/screenshots/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setScreenshots(screenshots.map(s => s.id === id ? { ...s, likes: data.likes } : s));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Видалити скриншот?")) return;
    const res = await fetch(`https://localhost:7059/api/screenshots/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) {
      setScreenshots(screenshots.filter(s => s.id !== id));
      setSelected(null);
      setMessage("🗑️ Видалено");
      setTimeout(() => setMessage(""), 2000);
    }
  }

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>Скриншоти</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>{screenshots.length} скриншотів від гравців</p>
        </div>

        {user && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Підпис (необов'язково)..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: "8px", border: "1px solid #333",
                background: "#1a1a2e", color: "#fff", fontSize: "14px", width: "220px", outline: "none"
              }}
            />
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              style={{
                padding: "10px 20px", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px",
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? "Завантаження..." : "📷 Додати скриншот"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          </div>
        )}
      </div>

      {/* Сетка */}
      {screenshots.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📷</div>
          <p style={{ color: "#aaa", fontSize: "18px" }}>Ще немає скриншотів</p>
          <p style={{ color: "#555", fontSize: "14px" }}>Будьте першим хто поділиться!</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}>
          {screenshots.map(s => (
            <div
              key={s.id}
              style={{
                background: "#1a1a2e", borderRadius: "10px", overflow: "hidden",
                border: "1px solid #2a2a3e", transition: "transform 0.2s, border-color 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a3e"; }}
            >
              <div style={{ position: "relative" }} onClick={() => setSelected(s)}>
                <img
                  src={`https://localhost:7059/screenshots/${s.fileName}`}
                  alt={s.caption || "screenshot"}
                  style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.src = "https://via.placeholder.com/260x160?text=No+Image"; }}
                />
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0)",
                  transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
                >
                  <span style={{ color: "#fff", fontSize: "28px", opacity: 0 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >🔍</span>
                </div>
              </div>

              <div style={{ padding: "12px" }}>
                {s.caption && (
                  <p style={{ color: "#ddd", fontSize: "13px", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.caption}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: "12px" }}>👤 {s.username}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => handleLike(s.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#e879f9", fontSize: "13px" }}
                    >
                      ❤️ {s.likes}
                    </button>
                    {user?.username === s.username && (
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "13px" }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ color: "#444", fontSize: "11px", margin: "6px 0 0" }}>
                  {new Date(s.createdAt).toLocaleDateString("uk-UA")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Просмотр в полном размере */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, flexDirection: "column", gap: "16px" }}
          onClick={() => setSelected(null)}
        >
          <img
            src={`https://localhost:7059/screenshots/${selected.fileName}`}
            alt={selected.caption || "screenshot"}
            style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "8px", objectFit: "contain" }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
            {selected.caption && <p style={{ color: "#ddd", fontSize: "15px", margin: 0 }}>{selected.caption}</p>}
            <span style={{ color: "#666", fontSize: "13px" }}>👤 {selected.username}</span>
            <button onClick={() => handleLike(selected.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#e879f9", fontSize: "15px" }}>
              ❤️ {selected.likes}
            </button>
            {user?.username === selected.username && (
              <button onClick={() => handleDelete(selected.id)}
                style={{ background: "#ef4444", border: "none", cursor: "pointer", color: "#fff", fontSize: "13px", padding: "6px 14px", borderRadius: "6px" }}>
                🗑️ Видалити
              </button>
            )}
          </div>
          <p style={{ color: "#555", fontSize: "12px" }}>Натисніть поза фото щоб закрити</p>
        </div>
      )}
    </div>
  );
}