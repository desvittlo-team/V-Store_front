// src/components/Profile/ShowcasesSection.jsx
import React, { useEffect, useState } from "react";

const BASE_URL = "https://localhost:7059";

const TYPE_LABELS = {
  illustration: "🖼 Ілюстрація",
  screenshots:  "📷 Скріншоти",
  inventory:    "🎒 Інвентар",
  games:        "🎮 Ігри",
};

export default function ShowcasesSection({ userId }) {
  const [showcases, setShowcases] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE_URL}/api/showcases/${userId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setShowcases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);
  
  if (loading || showcases.length === 0) return null;

  return (
    <div className="showcases-section">
      {showcases.map(s => (
        <div key={s.id} className="showcase-card">
          <div className="showcase-card-header">
            <span className="showcase-type-label">{TYPE_LABELS[s.type] || s.type}</span>
            <h3 className="showcase-card-title">{s.title}</h3>
          </div>

          {/* Иллюстрация — на всю ширину */}
          {s.type === "illustration" && s.items[0]?.illustrationUrl && (
            <div className="showcase-illustration">
              <img src={s.items[0].illustrationUrl} alt={s.title} />
            </div>
          )}

          {/* Скриншоты */}
          {s.type === "screenshots" && (
            <div className="showcase-grid">
              {s.items.map(it => it.screenshot && (
                <div key={it.id} className="showcase-grid-item">
                  <img src={it.screenshot.url} alt={it.screenshot.caption || ""} />
                  {it.screenshot.caption && (
                    <div className="showcase-grid-caption">{it.screenshot.caption}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Инвентарь */}
          {s.type === "inventory" && (
            <div className="showcase-grid">
              {s.items.map(it => it.inventoryItem && (
                <div key={it.id} className="showcase-grid-item">
                  <img src={it.inventoryItem.photoUrl} alt={it.inventoryItem.name}
                    onError={e => e.target.style.display = "none"} />
                  <div className="showcase-grid-caption">{it.inventoryItem.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Игры */}
          {s.type === "games" && (
            <div className="showcase-games">
              {s.items.map(it => it.game && (
                <div key={it.id} className="showcase-game-item">
                  <img src={it.game.photoUrl} alt={it.game.name}
                    onError={e => e.target.style.display = "none"} />
                  <div className="showcase-game-info">
                    <span className="showcase-game-name">{it.game.name}</span>
                    <span className="showcase-game-gpa">⭐ {it.game.gpa}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}