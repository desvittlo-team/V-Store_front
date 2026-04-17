// PrivateChat.jsx — область переписки + права панель профілю

import { useEffect, useRef } from "react";
import { IMAGE_ENDPOINTS, FALLBACK_IMAGE } from "../../api/imageHelper";

export default function PrivateChat({ user, activePartner, messages, text, setText, onSend, onFileSelect, viewImage, setViewImage }) {
  const messagesEndRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function renderMessage(msg) {
    const isMine = msg.senderId === user.id;
    let content;

    if (msg.type === "image") {
      const imgUrl = IMAGE_ENDPOINTS.chatImage(msg.imageFileName);
      content = (
        <div className="chat-bubble image-bubble" onClick={() => setViewImage(imgUrl)}>
          <img
            src={imgUrl}
            alt="фото"
            onError={e => { e.target.src = FALLBACK_IMAGE; }}
          />
        </div>
      );
    } else {
      content = (
        <div className="chat-bubble">
          <p>{msg.text}</p>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`chat-message-row ${isMine ? "mine" : ""}`}>
        <div className="chat-message-content">
          {content}
          <p className="chat-time">
            {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  if (!activePartner) {
    return (
      <div className="chat-main">
        <div className="chat-empty-state">
          <p>Оберіть користувача, щоб почати листування</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Головна область чату */}
      <div className="chat-main">
        <div className="chat-messages-container">
          {messages.length === 0 && (
            <p className="chat-list-empty" style={{ marginTop: 40 }}>Немає повідомлень</p>
          )}
          {messages.map(msg => renderMessage(msg))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrapper">
          <div className="chat-input-bar">
            <button className="chat-icon-btn text-format">T</button>
            <button className="chat-icon-btn attach" onClick={() => fileInputRef.current.click()}>📎</button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={onFileSelect}
            />
            <input
              className="chat-text-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onSend(); }}
              placeholder="Ваше повідомлення..."
            />
            <button className="chat-icon-btn mic">🎤</button>
          </div>
        </div>
      </div>

      {/* Права панель профілю */}
      <div className="chat-right-panel">
        <div className="profile-summary">
          <div className="profile-avatar-large">
            {activePartner.username[0].toUpperCase()}
          </div>
          <h3 className="profile-name">{activePartner.username}</h3>
          <span className="profile-status">онлайн</span>
        </div>

        <div className="right-panel-section toggle-section">
          <span>🔔 Сповіщення</span>
          <div className="toggle-switch active"></div>
        </div>

        <div className="right-panel-section media-stats">
          <div className="media-stat-item">
            <span>🖼️ Фото</span>
            <span className="stat-count">0</span>
          </div>
          <div className="media-stat-item">
            <span>📄 Файли</span>
            <span className="stat-count">0</span>
          </div>
          <div className="media-stat-item">
            <span>🎤 Голосові повідомлення</span>
            <span className="stat-count">0</span>
          </div>
        </div>

        <div className="right-panel-section actions">
          <button className="action-row">👤 Видалити з друзів</button>
          <button className="action-row">🗑️ Очистити історію</button>
          <button className="action-row">🚫 Заблокувати</button>
          <button className="action-row danger">⚠️ Поскаржитись</button>
        </div>
      </div>

      {/* Перегляд фото */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <img
            src={viewImage}
            alt="fullscreen"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain" }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
