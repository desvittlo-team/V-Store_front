// src/components/Profile/BadgesCard.jsx
import React from "react";
import badgeFish    from "../../assets/badge_fish.png";
import badgeSword   from "../../assets/badge_sword.png";
import badgeHeart   from "../../assets/badge_heart.png";
import badgeCard    from "../../assets/badge_card.png";
import badgeGamepad from "../../assets/badge_gamepad.png";

const BADGES = [badgeFish, badgeSword, badgeHeart, badgeCard, badgeGamepad];

export default function BadgesCard() {
  return (
    <div className="profile-card">
      <h3 className="card-title">Галерея значків</h3>
      <div className="badges-row">
        <div className="badge-counter-box">
          <span className="count">5</span>
          <span className="label">Значків</span>
        </div>
        <div className="badges-icons">
          {BADGES.map((b, i) => (
            <img key={i} src={b} alt="Badge" className="badge-img" />
          ))}
        </div>
      </div>
    </div>
  );
}
