import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { IMAGE_ENDPOINTS, FALLBACK_IMAGE } from "../api/imageHelper";

const API = "https://localhost:7059/api/chat";

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const messagesEndRef = useRef();
  const pollRef = useRef();
  const fileInputRef = useRef();
  const location = useLocation();

  const headers = { Authorization: `Bearer ${user?.token}` };

  async function loadConversations() {
    if (!user?.token) return;
    const res = await fetch(`${API}/conversations`, { headers });
    if (res.ok) setConversations(await res.json());
  }

  async function loadMessages(partnerId) {
    const res = await fetch(`${API}/messages/${partnerId}`, { headers });
    if (res.ok) setMessages(await res.json());
  }

  async function loadAllUsers() {
    if (!user?.token) return;
    const res = await fetch("https://localhost:7059/api/users", { headers });
    if (res.ok) {
      const data = await res.json();
      setAllUsers(data.filter(u => u.id !== user.id));
    }
  }

  useEffect(() => {
    loadConversations();
    loadAllUsers();
  }, [user]);

  useEffect(() => {
    if (location.state?.partnerId) {
      setActivePartner({ id: location.state.partnerId, username: location.state.partnerUsername, photo: "" });
    }
  }, [location.state]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (activePartner) {
      loadMessages(activePartner.id);
      pollRef.current = setInterval(() => {
        loadMessages(activePartner.id);
        loadConversations();
      }, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [activePartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (search.length < 1) { setSearchResults([]); return; }
    setSearchResults(allUsers.filter(u => u.username.toLowerCase().includes(search.toLowerCase())));
  }, [search, allUsers]);

  async function handleSend() {
    if (!text.trim() || !activePartner) return;
    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activePartner.id, text: text.trim() })
    });
    if (res.ok) { 
      const data = await res.json(); 
      setMessages(prev => [...prev, data]); 
      setText(""); 
      loadConversations(); 
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file || !activePartner) return;
    e.target.value = "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiverId", activePartner.id);

    const res = await fetch(`${API}/send-image`, { method: "POST", headers, body: formData });
    if (res.ok) { 
      const data = await res.json(); 
      setMessages(prev => [...prev, data]); 
      loadConversations(); 
    }
  }

  function openChat(partner) { 
    setActivePartner(partner); 
    setSearch(""); 
    setSearchResults([]); 
  }

  function renderMessage(msg) {
    const isMine = msg.senderId === user.id;
    let content;

    if (msg.type === "image") {
      const imgUrl = IMAGE_ENDPOINTS.chatImage(msg.imageFileName);
      content = (
        <div className="chat-bubble image-bubble" onClick={() => setViewImage(imgUrl)}>
          <img src={imgUrl} alt="фото" onError={e => { e.target.src = FALLBACK_IMAGE; }} />
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

  const leftList = search.length >= 1 ? searchResults : allUsers;

  if (!user) return <div className="chat-empty-state">Увійдіть щоб використовувати чат</div>;

  return (
    <div className="chat-layout">
      
      <div className="chat-sidebar">
        <div className="chat-search-box">
          <input type="text" placeholder="Пошук..." value={search} onChange={e => setSearch(e.target.value)} className="chat-search-input" />
        </div>

        <div className="chat-user-list">
          {leftList.map(u => {
            const conv = conversations.find(c => c.partner.id === u.id);
            const unread = conv?.unreadCount || 0;
            return (
              <div key={u.id} onClick={() => openChat(u)} className={`chat-user-item ${activePartner?.id === u.id ? "active" : ""}`}>
                <div className="chat-avatar">
                  {u.username[0].toUpperCase()}
                  {unread > 0 && <span className="unread-badge">{unread}</span>}
                </div>
                <div className="chat-user-info">
                  <div className="chat-username-row">
                    <span className="chat-username">{u.username}</span>
                    {conv && <span className="chat-date">Сьогодні</span>}
                  </div>
                  {conv?.lastMessage && (
                    <p className="chat-last-message">
                      {conv.lastMessage.senderId === user.id ? "Ви: " : ""}
                      {conv.lastMessage.type === "image" ? "Фото" : conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-main">
        {!activePartner ? (
          <div className="chat-empty-state">
            <p>Оберіть користувача, щоб почати листування</p>
          </div>
        ) : (
          <>
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
                <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />

                <input 
                  className="chat-text-input" 
                  value={text} 
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                  placeholder="Ваше повідомлення..."
                />
                
                <button className="chat-icon-btn mic">🎤</button>
              </div>
            </div>
          </>
        )}
      </div>

      {activePartner && (
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
      )}

      {/* Перегляд фото */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <img src={viewImage} alt="fullscreen" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}