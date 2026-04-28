// src/components/Profile/GamesCard.jsx
import React from "react";

export default function GamesCard({ library = [] }) {
  return (
    <div className="profile-card">
      <h3 className="card-title">Колекція ігор</h3>
      <div className="stats-row">
        <div className="stat-box">
          <span className="count">{library.length || 1234}</span>
          <span className="label">Ігор</span>
        </div>
        <div className="stat-box">
          <span className="count">121</span>
          <span className="label">DLC</span>
        </div>
        <div className="stat-box">
          <span className="count">2564</span>
          <span className="label">Бажаних</span>
        </div>
      </div>
      <div className="games-covers-row">
        {library.slice(0, 4).map(g => (
          <div key={g.id} className="game-cover">
            {g.photo && (
              <img
                src={`https://localhost:7059/items/${g.photo}`}
                alt={g.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                onError={e => e.target.style.display = "none"}
              />
            )}
          </div>
        ))}
        {library.length === 0 && (
          <>
            <div className="game-cover mock-nms" />
            <div className="game-cover mock-nms2" />
            <div className="game-cover mock-nms3" />
            <div className="game-cover mock-nms4" />
          </>
        )}
      </div>
    </div>
  );
}
