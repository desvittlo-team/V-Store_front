// src/components/Profile/DiscussionsCard.jsx
import React from "react";

export default function DiscussionsCard() {
  return (
    <div className="profile-card">
      <h3 className="card-title">Галерея обговорень</h3>
      <div className="discussion-post">
        <div className="post-header">
          <div className="post-author">Fallout 4</div>
          <div className="post-date">25.02.2024</div>
        </div>
        <h4 className="post-title">Освальд, обурливий, невбивний</h4>
        <p className="post-text">
          Я грав у Nuka world dlc, коли потрапив у дитяче королівство...
        </p>
        <div className="post-actions">
          <span>❤️ 2.5k</span> <span>💬 2.5k</span>
        </div>
      </div>
    </div>
  );
}
