// src/components/Profile/ProfileSidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { key: "main",        label: "Головна" },
  { key: "badges",      label: "Значки",      count: 100 },
  { key: "games",       label: "Ігор",        count: 100 },
  { key: "wishlist",    label: "Бажане",      count: 100 },
  { key: "discussions", label: "Обговорення", count: 100 },
];

export default function ProfileSidebar({ friends, activePage, onPageChange, hideFriends }) {
  const navigate = useNavigate();

  return (
    <div className="profile-sidebar-col">

      <div className="profile-card side-card">
        <div className="level-header-box">
          <h3>Рівень</h3>
          <div className="level-hexagon">99</div>
        </div>
        <ul className="side-menu">
          {NAV_ITEMS.map(item => (
            <li
              key={item.key}
              className={activePage === item.key ? "active" : ""}
              onClick={() => onPageChange(item.key)}
            >
              {item.label}
              {item.count && <span className="menu-count">{item.count}</span>}
            </li>
          ))}
        </ul>
      </div>

      {!hideFriends && (
        <div className="profile-card side-card">
          <div className="friends-header-box">
            <h3>Друзі</h3>
            <span className="count-badge">{friends.length}</span>
          </div>
          <ul className="friends-list">
            {friends.slice(0, 5).map(f => (
              <li key={f.id} onClick={() => navigate(`/profile/${f.id}`)}>
                <div className="friend-avatar">
                  {f.username ? f.username[0].toUpperCase() : "?"}
                </div>
                <span className="friend-name">{f.username}</span>
                <div className="friend-level-hex">40</div>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
