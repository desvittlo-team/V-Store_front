// src/components/Profile/ProfileHeader.jsx
import React, { useRef } from "react";

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export default function ProfileHeader({ pUser, avatarSrc, bannerUrl, isOwnProfile, onEditClick, onAvatarUpload }) {
  const fileInputRef = useRef(null);

  const bannerStyle = bannerUrl
    ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className="profile-header-container">
      <div className="profile-banner" style={bannerStyle} />

      <div className="profile-info-bar">
        <div
          className={`profile-avatar-wrapper ${isOwnProfile ? 'editable' : ''}`}
          onClick={() => isOwnProfile && fileInputRef.current.click()}
        >
          <img
            src={avatarSrc}
            alt="avatar"
            className="profile-avatar-img"
            crossOrigin="anonymous"
            onError={e => e.target.src = '/no-image.png'}
          />
          {isOwnProfile && <div className="avatar-upload-overlay">📷</div>}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden-file-input"
            onChange={onAvatarUpload}
          />
        </div>

        <div className="profile-text-info">
          <h1 className="profile-username">{pUser.username}</h1>
          <span className="profile-status">онлайн</span>
          <p className="profile-bio">{pUser.bio || "Опис профілю порожній..."}</p>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <button className="btn-edit-profile" onClick={onEditClick}>
              <EditIcon /> Редагувати профіль
            </button>
          ) : (
            <>
              <button className="btn-add-friend">👤+ Додати до друзів</button>
              <button className="btn-icon-circle">✉️</button>
              <button className="btn-icon-circle">•••</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}