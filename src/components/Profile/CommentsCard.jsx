// src/components/Profile/CommentsCard.jsx
import React from "react";

export default function CommentsCard({ pUser, avatarSrc }) {
  return (
    <div className="profile-card transparent-card">
      <div className="comments-header">
        <h3 className="card-title">Коментарі</h3>
        {!pUser.hideComments && <span className="count-badge">35</span>}
      </div>

      {pUser.hideComments ? (
        <div className="comments-locked-msg">
          <p>Коментарі до цього профілю обмежені налаштуваннями приватності.</p>
        </div>
      ) : (
        <>
          <input type="text" className="comment-input" placeholder="Ваш коментар..." />
          <div className="comments-list">
            {[1, 2].map(i => (
              <div key={i} className="comment-item">
                <div className="comment-avatar">
                  <img src={avatarSrc} alt="user" onError={e => e.target.src = '/no-image.png'} />
                </div>
                <div className="comment-content">
                  <div className="comment-top">
                    <span className="comment-name">User_{i}</span>
                    <span className="comment-date">25.02.2024</span>
                  </div>
                  <p className="comment-text">Це неймовірно! Дякую за такий корисний контент!</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
